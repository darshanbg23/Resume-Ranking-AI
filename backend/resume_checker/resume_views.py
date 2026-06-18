"""
Resume API views — CRUD operations for user-owned resumes.
All queries are filtered by the authenticated user for data isolation.

Enhanced to support DOCX files and return all AI-extracted fields.
"""
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.http import FileResponse
from django.utils import timezone
from .models import UserResume
from .analyzer import extract_text, analyze_resume, generate_resume_summary
from .resume_parser import ResumeParser
import os


def _serialize_resume(r):
    """Serialize a UserResume to a response dict with all AI fields."""
    return {
        'id': r.id,
        'file_name': r.file_name,
        'file_size': r.file_size,
        'file_size_display': r.file_size_display,
        'file_type': r.file_type,
        'status': r.status,
        'match_score': r.match_score,
        'skills_extracted': r.skills_extracted,
        'experience_extracted': r.experience_extracted,
        'education_extracted': r.education_extracted,
        'name_extracted': r.name_extracted,
        'email_extracted': r.email_extracted,
        'phone_extracted': r.phone_extracted,
        'certifications_extracted': r.certifications_extracted,
        'projects_extracted': r.projects_extracted,
        'resume_summary': r.resume_summary,
        'analysis_result': r.analysis_result,
        'uploaded_at': r.uploaded_at.isoformat(),
        'analyzed_at': r.analyzed_at.isoformat() if r.analyzed_at else None,
    }


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def user_resumes(request):
    """
    GET: List all resumes for the authenticated user.
    POST: Upload a new resume.
    """
    if request.method == 'GET':
        resumes = UserResume.objects.filter(user=request.user)
        data = [_serialize_resume(r) for r in resumes]
        return Response({
            'status': True,
            'message': f'{len(data)} resume(s) found',
            'data': data
        })

    elif request.method == 'POST':
        file = request.FILES.get('file')
        if not file:
            return Response({
                'status': False,
                'message': 'No file uploaded'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate file type
        allowed_extensions = ['.pdf', '.doc', '.docx']
        _, ext = os.path.splitext(file.name)
        if ext.lower() not in allowed_extensions:
            return Response({
                'status': False,
                'message': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate file size (max 10MB)
        max_size = 10 * 1024 * 1024
        if file.size > max_size:
            return Response({
                'status': False,
                'message': 'File too large. Maximum size is 10MB.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create resume record
        resume = UserResume.objects.create(
            user=request.user,
            file=file,
            file_name=file.name,
            file_size=file.size,
            status='pending',
        )

        return Response({
            'status': True,
            'message': 'Resume uploaded successfully',
            'data': _serialize_resume(resume)
        }, status=status.HTTP_201_CREATED)


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def user_resume_detail(request, resume_id):
    """
    GET: Get a single resume detail.
    DELETE: Delete a resume (user-owned only).
    """
    try:
        resume = UserResume.objects.get(id=resume_id, user=request.user)
    except UserResume.DoesNotExist:
        return Response({
            'status': False,
            'message': 'Resume not found'
        }, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response({
            'status': True,
            'data': _serialize_resume(resume)
        })

    elif request.method == 'DELETE':
        # Delete the physical file
        if resume.file and os.path.isfile(resume.file.path):
            os.remove(resume.file.path)
        resume.delete()
        return Response({
            'status': True,
            'message': 'Resume deleted successfully'
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_resume_download(request, resume_id):
    """Download a resume file (user-owned only)."""
    try:
        resume = UserResume.objects.get(id=resume_id, user=request.user)
    except UserResume.DoesNotExist:
        return Response({
            'status': False,
            'message': 'Resume not found'
        }, status=status.HTTP_404_NOT_FOUND)

    if not resume.file or not os.path.isfile(resume.file.path):
        return Response({
            'status': False,
            'message': 'File not found on server'
        }, status=status.HTTP_404_NOT_FOUND)

    response = FileResponse(
        open(resume.file.path, 'rb'),
        content_type='application/octet-stream'
    )
    response['Content-Disposition'] = f'attachment; filename="{resume.file_name}"'
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_resume_analyze(request, resume_id):
    """
    Trigger AI analysis on a resume.
    Enhanced: Supports PDF + DOCX, runs SpaCy NER + Groq LLM + summary generation.
    """
    try:
        resume = UserResume.objects.get(id=resume_id, user=request.user)
    except UserResume.DoesNotExist:
        return Response({
            'status': False,
            'message': 'Resume not found'
        }, status=status.HTTP_404_NOT_FOUND)

    if not resume.file or not os.path.isfile(resume.file.path):
        return Response({
            'status': False,
            'message': 'Resume file not found on server'
        }, status=status.HTTP_404_NOT_FOUND)

    # Support both PDF and DOCX now
    supported_types = ['PDF', 'DOCX', 'DOC']
    if resume.file_type not in supported_types:
        return Response({
            'status': False,
            'message': f'Unsupported file type. Supported: {", ".join(supported_types)}'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Update status
    resume.status = 'processing'
    resume.save()

    try:
        # Step 1: Extract text (PDF or DOCX)
        resume_text = extract_text(resume.file.path)

        if not resume_text or len(resume_text.strip()) < 50:
            resume.status = 'failed'
            resume.save()
            return Response({
                'status': False,
                'message': 'Could not extract text from resume. Ensure the file is not image-based.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Cache extracted text for semantic matching
        resume.extracted_text = resume_text

        # Step 2: SpaCy NER parsing
        try:
            parser = ResumeParser()
            parsed = parser.parse(resume_text)
            resume.name_extracted = parsed.get('name', '')
            resume.email_extracted = parsed.get('email', '')
            resume.phone_extracted = parsed.get('phone', '')
        except Exception as parse_err:
            # Non-fatal: continue without NER results
            parsed = {}
            import logging
            logging.getLogger(__name__).warning(f"NER parsing failed (non-fatal): {parse_err}")

        # Step 3: Groq LLM analysis
        job_description = request.data.get('job_description', '') if request.data else ''
        if not job_description:
            job_description = (
                "We are looking for a skilled professional with strong technical skills, "
                "relevant experience, good education background, and ability to work in a team. "
                "The ideal candidate should have programming skills, problem-solving abilities, "
                "and industry experience."
            )

        analysis = analyze_resume(resume_text, job_description)

        if analysis:
            resume.analysis_result = analysis

            # Merge skills from NER + LLM
            llm_skills = analysis.get('skills', [])
            ner_skills = parsed.get('skills', [])
            all_skills = list(set(llm_skills + ner_skills))
            resume.skills_extracted = all_skills

            # Experience
            if analysis.get('experience'):
                resume.experience_extracted = str(analysis['experience'])
            elif parsed.get('experience'):
                resume.experience_extracted = parsed['experience']

            # Education
            if analysis.get('education'):
                resume.education_extracted = str(analysis['education'])[:300]
            elif parsed.get('education'):
                resume.education_extracted = parsed['education'][:300]

            # Certifications
            if analysis.get('certifications'):
                resume.certifications_extracted = analysis['certifications']
            elif parsed.get('certifications'):
                resume.certifications_extracted = parsed['certifications']

            # Projects
            if analysis.get('projects'):
                resume.projects_extracted = analysis['projects']
            elif parsed.get('projects'):
                resume.projects_extracted = parsed['projects']

            # Match score — only set when compared against a specific job
            # Not from generic analysis
            resume.match_score = None

            # Step 4: Generate AI summary
            try:
                resume.resume_summary = generate_resume_summary(
                    resume_text,
                    skills=resume.skills_extracted,
                    experience=resume.experience_extracted
                )
            except Exception:
                pass

            resume.status = 'processed'
            resume.analyzed_at = timezone.now()
            resume.save()

            return Response({
                'status': True,
                'message': 'Resume analyzed successfully',
                'data': _serialize_resume(resume)
            })
        else:
            resume.status = 'failed'
            resume.save()
            return Response({
                'status': False,
                'message': 'AI analysis failed. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        resume.status = 'failed'
        resume.save()
        return Response({
            'status': False,
            'message': f'Analysis error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
