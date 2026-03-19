from services.token_counter import count_tokens, count_messages_tokens
from services.retrieval_service import RetrievalService


# Token budget constants
MAX_CONTEXT_TOKENS = 128_000
SYSTEM_PROMPT_BUDGET = 4_000
RAG_BUDGET = 2_000
RESPONSE_RESERVE = 16_000
HISTORY_BUDGET = MAX_CONTEXT_TOKENS - SYSTEM_PROMPT_BUDGET - RAG_BUDGET - RESPONSE_RESERVE

CONVERSATION_STYLE_DIRECTIVE = """
CONVERSATION RULES (OVERRIDE ALL OTHER STYLE GUIDELINES):
- Keep every response to 4 sentences maximum. No exceptions.
- You are having a conversation, not giving a lecture. Be warm, natural, and engaging.
- Ask follow-up questions, react to what the user says, and build on the dialogue — do not monologue.
- Speak like you would to a friend at a dinner table, not a student in a lecture hall.
- Avoid listing, enumerating, or cataloguing ideas. Weave your thoughts into natural speech.
- If a topic is deep, explore it across multiple exchanges rather than dumping everything at once.
"""

# Summarization threshold: when history exceeds this many messages, summarize older ones
SUMMARIZATION_THRESHOLD = 40


class PromptBuilder:
    """Builds the prompt for OpenAI, managing token budgets across system prompt,
    RAG context, conversation history, and current message."""

    def __init__(self, retrieval_service: RetrievalService = None):
        self.retrieval_service = retrieval_service

    def build(
        self,
        philosopher_config: str,
        messages: list[dict],
        current_prompt: str,
        philosopher_id: str = None,
        chat_summary: str = None,
    ) -> tuple[str, list[dict], list[dict] | None]:
        """Build the full prompt components.

        Returns:
            (instructions, input_messages, rag_sources)
            - instructions: system prompt string (with RAG passages injected)
            - input_messages: list of message dicts for the OpenAI input parameter
            - rag_sources: list of source references for metadata, or None
        """
        # 1. Build system prompt with conversational style directive
        instructions = f"{philosopher_config}\n{CONVERSATION_STYLE_DIRECTIVE}"

        # 2. RAG retrieval
        rag_sources = None
        if self.retrieval_service and philosopher_id:
            rag_context, rag_sources = self.retrieval_service.retrieve_context(
                philosopher_id=philosopher_id,
                query=current_prompt,
                max_tokens=RAG_BUDGET,
            )
            if rag_context:
                instructions = f"{instructions}\n\n{rag_context}"

        # 3. Build history with token budget management
        input_messages = self._build_history(messages, current_prompt, chat_summary)

        return instructions, input_messages, rag_sources

    def _build_history(
        self,
        messages: list[dict],
        current_prompt: str,
        chat_summary: str = None,
    ) -> list[dict]:
        """Build message history within token budget, using summary if available."""
        # Always include current prompt
        current_msg = {"role": "user", "content": current_prompt}
        current_tokens = count_tokens(current_prompt) + 4

        available_tokens = HISTORY_BUDGET - current_tokens

        # Build history from most recent messages backwards
        history_messages = []
        token_count = 0

        for msg in reversed(messages):
            msg_tokens = count_tokens(msg["content"]) + 4
            if token_count + msg_tokens > available_tokens:
                break
            history_messages.insert(0, {"role": msg["role"], "content": msg["content"]})
            token_count += msg_tokens

        # If we truncated history and have a summary, prepend it
        if len(history_messages) < len(messages) and chat_summary:
            summary_msg = {
                "role": "user",
                "content": f"[Summary of earlier conversation: {chat_summary}]",
            }
            summary_tokens = count_tokens(summary_msg["content"]) + 4
            if token_count + summary_tokens <= available_tokens:
                history_messages.insert(0, summary_msg)

        history_messages.append(current_msg)
        return history_messages

    def should_summarize(self, message_count: int) -> bool:
        """Check if conversation history should be summarized."""
        return message_count >= SUMMARIZATION_THRESHOLD

    def generate_summary_prompt(self, messages: list[dict]) -> str:
        """Generate a prompt to summarize conversation history."""
        conversation = "\n".join(
            f"{msg['role'].upper()}: {msg['content']}" for msg in messages
        )
        return (
            "Summarize the following conversation in 2-3 concise paragraphs, "
            "capturing the key topics discussed, any conclusions reached, "
            "and the philosophical themes explored:\n\n"
            f"{conversation}"
        )
