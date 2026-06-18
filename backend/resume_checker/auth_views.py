from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.contrib.auth.models import User
from .auth_serializers import UserSerializer, RegisterSerializer, LoginSerializer
from .models import UserProfile, JobDescription, UserResume
from .ai_models import JobApplication, Notification


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user.
    
    Expects:
    {
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "password": "securepassword123",
        "password_confirm": "securepassword123",
        "role": "candidate"  # or "recruiter"
    }
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Update profile with extra data if provided
        if hasattr(user, 'profile'):
            profile = user.profile
            if request.data.get('phone'):
                profile.phone = request.data['phone']
                profile.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        user_data = UserSerializer(user).data
        
        return Response({
            'status': True,
            'message': 'User registered successfully',
            'data': {
                'user': user_data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'status': False,
        'message': 'Registration failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login user and return JWT tokens.
    
    Expects:
    {
        "email": "user@example.com",
        "password": "securepassword123"
    }
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        user_data = UserSerializer(user).data
        
        return Response({
            'status': True,
            'message': 'Login successful',
            'data': {
                'user': user_data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
    
    return Response({
        'status': False,
        'message': 'Login failed',
        'errors': serializer.errors
    }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    """
    Get current user profile.
    """
    serializer = UserSerializer(request.user)
    data = serializer.data
    
    # Include profile data
    try:
        profile = request.user.profile
        data['phone'] = profile.phone
        data['bio'] = profile.bio
        data['location'] = profile.location
        data['skills'] = profile.skills
        data['experience_years'] = profile.experience_years
        data['education'] = profile.education
        data['current_role'] = profile.current_role
        data['company_name'] = profile.company_name
        data['designation'] = profile.designation
    except UserProfile.DoesNotExist:
        pass
    
    return Response({
        'status': True,
        'message': 'User retrieved successfully',
        'data': data
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    GET: Retrieve user profile.
    PUT: Update user profile.
    """
    try:
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
    except Exception:
        return Response({
            'status': False,
            'message': 'Profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        user_data = UserSerializer(request.user).data
        user_data.update({
            'phone': profile.phone,
            'bio': profile.bio,
            'location': profile.location,
            'skills': profile.skills,
            'experience_years': profile.experience_years,
            'education': profile.education,
            'current_role': profile.current_role,
            'company_name': profile.company_name,
            'designation': profile.designation,
        })
        return Response({
            'status': True,
            'message': 'Profile retrieved',
            'data': user_data
        })
    
    elif request.method == 'PUT':
        data = request.data
        
        # Update User model fields
        user = request.user
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        user.save()
        
        # Update Profile fields
        profile_fields = ['phone', 'bio', 'location', 'skills', 'experience_years',
                          'education', 'current_role', 'company_name', 'designation']
        for field in profile_fields:
            if field in data:
                setattr(profile, field, data[field])
        profile.save()
        
        user_data = UserSerializer(user).data
        user_data.update({
            'phone': profile.phone,
            'bio': profile.bio,
            'location': profile.location,
            'skills': profile.skills,
            'experience_years': profile.experience_years,
            'education': profile.education,
            'current_role': profile.current_role,
            'company_name': profile.company_name,
            'designation': profile.designation,
        })
        
        return Response({
            'status': True,
            'message': 'Profile updated successfully',
            'data': user_data
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Return dashboard statistics based on user role.
    Returns real counts from the database.
    """
    user = request.user
    user_serializer = UserSerializer(user)
    role = user_serializer.data.get('role', 'candidate')
    
    if role == 'candidate':
        data = {
            'resume_count': UserResume.objects.filter(user=user).count(),
            'application_count': JobApplication.objects.filter(user=user).count(),
            'interview_count': JobApplication.objects.filter(user=user, status='interview_scheduled').count(),
            'notification_count': Notification.objects.filter(user=user, is_read=False).count(),
            'profile_completion': _calculate_profile_completion(user),
        }
    elif role == 'recruiter':
        data = {
            'jobs_posted': JobDescription.objects.filter(created_by=user).count(),
            'applications_received': JobApplication.objects.filter(job__created_by=user).count(),
            'candidates_screened': JobApplication.objects.filter(job__created_by=user).exclude(status='applied').count(),
            'interviews_scheduled': JobApplication.objects.filter(job__created_by=user, status='interview_scheduled').count(),
            'total_candidates': User.objects.filter(groups__name='candidate').count(),
            'notification_count': Notification.objects.filter(user=user, is_read=False).count(),
        }
    elif role == 'admin':
        data = {
            'total_users': User.objects.count(),
            'total_candidates': User.objects.filter(groups__name='candidate').count(),
            'total_recruiters': User.objects.filter(groups__name='recruiter').count(),
            'total_jobs': JobDescription.objects.count(),
            'total_resumes': UserResume.objects.count(),
            'total_applications': JobApplication.objects.count(),
        }
    else:
        data = {}
    
    return Response({
        'status': True,
        'message': 'Dashboard stats retrieved',
        'data': data
    })


def _calculate_profile_completion(user):
    """Calculate profile completion percentage based on filled fields."""
    fields_filled = 0
    total_fields = 8
    
    if user.first_name:
        fields_filled += 1
    if user.last_name:
        fields_filled += 1
    if user.email:
        fields_filled += 1
    
    try:
        profile = user.profile
        if profile.phone:
            fields_filled += 1
        if profile.bio:
            fields_filled += 1
        if profile.location:
            fields_filled += 1
        if profile.skills:
            fields_filled += 1
        if profile.education:
            fields_filled += 1
    except UserProfile.DoesNotExist:
        pass
    
    return int((fields_filled / total_fields) * 100)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout user (client should delete tokens).
    """
    return Response({
        'status': True,
        'message': 'Logout successful'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """
    Refresh JWT token.
    
    Expects:
    {
        "refresh": "refresh_token_string"
    }
    """
    try:
        refresh = request.data.get('refresh')
        if not refresh:
            return Response({
                'status': False,
                'message': 'Refresh token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        refresh_token_obj = RefreshToken(refresh)
        
        return Response({
            'status': True,
            'message': 'Token refreshed successfully',
            'data': {
                'access': str(refresh_token_obj.access_token),
                'refresh': str(refresh)
            }
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'status': False,
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


def create_default_groups():
    """
    Create default user groups if they don't exist.
    """
    from django.contrib.auth.models import Group
    
    group_names = ['admin', 'recruiter', 'candidate']
    for group_name in group_names:
        Group.objects.get_or_create(name=group_name)
