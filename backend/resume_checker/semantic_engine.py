"""
Semantic Matching Engine — Sentence Transformers + Cosine Similarity.

Uses the all-MiniLM-L6-v2 model to compute semantic similarity
between resume text and job descriptions.

The model is lazy-loaded as a singleton to avoid repeated loading.
First run downloads the model (~80MB), subsequent runs use cache.
"""
import logging
import numpy as np

logger = logging.getLogger(__name__)

# Singleton model instance
_model = None
_model_loaded = False


def _get_model():
    """Lazy-load the Sentence Transformer model."""
    global _model, _model_loaded
    if not _model_loaded:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading Sentence Transformer model (all-MiniLM-L6-v2)...")
            _model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Sentence Transformer model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load Sentence Transformer model: {e}")
            _model = None
        _model_loaded = True
    return _model


class SemanticEngine:
    """
    Semantic matching using Sentence Transformers.
    
    Computes cosine similarity between resume and job description
    embeddings to produce a meaningful match score.
    """

    def __init__(self):
        self.model = _get_model()

    @property
    def is_available(self) -> bool:
        """Check if the semantic engine is available."""
        return self.model is not None

    def encode_text(self, text: str) -> np.ndarray:
        """
        Encode text into an embedding vector.
        
        Args:
            text: Input text to encode
            
        Returns:
            Numpy array of embedding values
        """
        if not self.model:
            raise RuntimeError("Sentence Transformer model not loaded")

        # Truncate to max ~512 tokens (~2000 chars) for MiniLM
        truncated = text[:5000]
        return self.model.encode(truncated, convert_to_numpy=True)

    def compute_similarity(self, text_a: str, text_b: str) -> float:
        """
        Compute cosine similarity between two texts.
        
        Args:
            text_a: First text (e.g., resume)
            text_b: Second text (e.g., job description)
            
        Returns:
            Similarity score 0-100
        """
        if not self.model:
            logger.warning("Semantic engine unavailable, returning 0")
            return 0.0

        try:
            embedding_a = self.encode_text(text_a)
            embedding_b = self.encode_text(text_b)

            # Cosine similarity
            from sklearn.metrics.pairwise import cosine_similarity
            score = cosine_similarity(
                embedding_a.reshape(1, -1),
                embedding_b.reshape(1, -1)
            )[0][0]

            # Convert from [-1, 1] to [0, 100]
            return max(0.0, min(100.0, float(score) * 100))

        except Exception as e:
            logger.error(f"Semantic similarity error: {e}")
            return 0.0

    def batch_rank_resumes(
        self,
        resume_texts: list,
        job_description: str
    ) -> list:
        """
        Rank multiple resumes against a job description.
        
        Args:
            resume_texts: List of (resume_id, resume_text) tuples
            job_description: Job description text
            
        Returns:
            List of (resume_id, similarity_score) sorted descending
        """
        if not self.model:
            return [(rid, 0.0) for rid, _ in resume_texts]

        try:
            job_embedding = self.encode_text(job_description)

            results = []
            for resume_id, text in resume_texts:
                resume_embedding = self.encode_text(text)

                from sklearn.metrics.pairwise import cosine_similarity
                score = cosine_similarity(
                    resume_embedding.reshape(1, -1),
                    job_embedding.reshape(1, -1)
                )[0][0]

                score_pct = max(0.0, min(100.0, float(score) * 100))
                results.append((resume_id, score_pct))

            # Sort by score descending
            results.sort(key=lambda x: x[1], reverse=True)
            return results

        except Exception as e:
            logger.error(f"Batch ranking error: {e}")
            return [(rid, 0.0) for rid, _ in resume_texts]

    def compute_keyword_score(
        self,
        resume_skills: list,
        job_skills: list
    ) -> dict:
        """
        Compute keyword-based matching between resume skills and job skills.
        
        Returns:
            dict with score, matched_skills, missing_skills
        """
        if not job_skills:
            return {'score': 0, 'matched': [], 'missing': []}

        resume_skills_lower = {s.lower().strip() for s in resume_skills}
        job_skills_lower = {s.lower().strip() for s in job_skills}

        matched = resume_skills_lower & job_skills_lower
        missing = job_skills_lower - resume_skills_lower

        score = (len(matched) / len(job_skills_lower)) * 100 if job_skills_lower else 0

        return {
            'score': round(score, 1),
            'matched': sorted(list(matched)),
            'missing': sorted(list(missing)),
        }
