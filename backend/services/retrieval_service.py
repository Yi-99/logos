import uuid
import logging

from openai import OpenAI

from dao.philosopher_document_dao import PhilosopherDocumentDAO
from services.token_counter import count_tokens

logger = logging.getLogger(__name__)


class RetrievalService:
    """Embeds user queries and retrieves relevant philosopher document chunks."""

    def __init__(self, document_dao: PhilosopherDocumentDAO, openai_client: OpenAI):
        self.document_dao = document_dao
        self.openai_client = openai_client

    def embed_text(self, text: str) -> list[float]:
        """Generate embedding for a text string using OpenAI text-embedding-3-small."""
        response = self.openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=text,
        )
        return response.data[0].embedding

    def retrieve_context(
        self,
        philosopher_id: str,
        query: str,
        max_tokens: int = 2000,
        limit: int = 5,
    ) -> tuple[str | None, list[dict] | None]:
        """Retrieve relevant passages for a philosopher and query.

        Returns:
            (context_text, sources)
            - context_text: formatted string to inject into system prompt, or None
            - sources: list of source metadata dicts, or None
        """
        try:
            query_embedding = self.embed_text(query)
            documents = self.document_dao.search_similar(
                philosopher_id=uuid.UUID(philosopher_id),
                query_embedding=query_embedding,
                limit=limit,
            )

            if not documents:
                return None, None

            # Build context within token budget
            passages = []
            sources = []
            total_tokens = 0

            for doc in documents:
                passage_tokens = count_tokens(doc.chunk_text)
                if total_tokens + passage_tokens > max_tokens:
                    break

                passages.append(
                    f'From "{doc.source_title}":\n"{doc.chunk_text}"'
                )
                sources.append({
                    "document_id": str(doc.id),
                    "source_title": doc.source_title,
                    "source_type": doc.source_type,
                    "chunk_index": doc.chunk_index,
                })
                total_tokens += passage_tokens

            if not passages:
                return None, None

            context_text = (
                "RELEVANT PASSAGES FROM YOUR WRITINGS:\n"
                "---\n"
                + "\n---\n".join(passages)
                + "\n---\n"
                "Use these passages to ground your response. Do not fabricate quotes."
            )

            return context_text, sources

        except Exception as e:
            logger.warning(f"RAG retrieval failed: {e}")
            return None, None
