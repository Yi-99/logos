import os
import json
import uuid
from collections.abc import Generator
from openai import OpenAI
from dao import DAOFactory
from services.token_counter import count_tokens
from services.prompt_builder import PromptBuilder
from services.retrieval_service import RetrievalService
from constants import OPENAI_CHAT_MODEL


def _sse_event(event: str, data: dict) -> str:
    """Format a Server-Sent Event."""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


def prompt_philosopher_stream(
    dao: DAOFactory,
    user_id: str,
    prompt: str,
    advisor_name: str,
    chat_id: str = None,
) -> Generator[str, None, None]:
    """Streams the AI Philosopher response via SSE events.

    Events:
        meta   — {"chat_id": "...", "advisor_name": "..."}
        delta  — {"content": "chunk..."}
        done   — {"message": {id, role, content, token_count, metadata, created_at}}
        error  — {"detail": "..."}
    """

    # Create a new chat if chat_id is not provided
    if not chat_id:
        try:
            new_chat = dao.chats.create(
                user_id=uuid.UUID(user_id),
                advisor_name=advisor_name,
            )
            chat_id = str(new_chat.id)
        except Exception as e:
            import traceback
            traceback.print_exc()
            yield _sse_event("error", {"detail": f"Error creating chat: {e}"})
            return

    # Send meta event immediately so frontend knows the chat_id
    yield _sse_event("meta", {"chat_id": chat_id, "advisor_name": advisor_name})

    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    # Fetch philosopher config
    try:
        philosopher_config = dao.philosophers.get_config_by_name(advisor_name)
        if not philosopher_config:
            yield _sse_event("error", {"detail": "Philosopher config NOT found!"})
            return

        philosopher = dao.philosophers.get_by_name(advisor_name)
        philosopher_id = str(philosopher.id) if philosopher else None
    except Exception as e:
        print(e)
        yield _sse_event("error", {"detail": "Error fetching philosopher config"})
        return

    # Load existing messages from DB
    try:
        db_messages = dao.messages.get_by_chat_id(uuid.UUID(chat_id))
        history = [{"role": m.role, "content": m.content} for m in db_messages]
        message_count = len(db_messages)
    except Exception as e:
        print(e)
        history = []
        message_count = 0

    # Save user message to messages table
    try:
        user_token_count = count_tokens(prompt)
        dao.messages.create(
            chat_id=uuid.UUID(chat_id),
            role="user",
            content=prompt,
            token_count=user_token_count,
        )
        message_count += 1
    except Exception as e:
        import traceback
        traceback.print_exc()
        yield _sse_event("error", {"detail": f"Error saving user message: {e}"})
        return

    # Build prompt using PromptBuilder with RAG
    retrieval_service = RetrievalService(dao.philosopher_documents, openai_client)
    prompt_builder = PromptBuilder(retrieval_service=retrieval_service)

    try:
        chat = dao.chats.get_by_id(uuid.UUID(chat_id))
        chat_summary = chat.summary if chat else None

        instructions, input_messages, rag_sources = prompt_builder.build(
            philosopher_config=philosopher_config,
            messages=history,
            current_prompt=prompt,
            philosopher_id=philosopher_id,
            chat_summary=chat_summary,
        )
    except Exception as e:
        print(f"PromptBuilder error (falling back to simple): {e}")
        instructions = philosopher_config
        input_messages = history + [{"role": "user", "content": prompt}]
        rag_sources = None

    # Call OpenAI with streaming
    try:
        stream = openai_client.responses.create(
            model=OPENAI_CHAT_MODEL,
            input=input_messages,
            instructions=instructions,
            reasoning={"effort": "medium"},
            stream=True,
        )

        full_response = []
        for event in stream:
            if event.type == "response.output_text.delta":
                full_response.append(event.delta)
                yield _sse_event("delta", {"content": event.delta})

        response_text = "".join(full_response)
    except Exception as e:
        import traceback
        traceback.print_exc()
        yield _sse_event("error", {"detail": f"Error calling OpenAI: {e}"})
        return

    # Save assistant message
    try:
        assistant_token_count = count_tokens(response_text)
        metadata = {"rag_sources": rag_sources} if rag_sources else None

        assistant_message = dao.messages.create(
            chat_id=uuid.UUID(chat_id),
            role="assistant",
            content=response_text,
            token_count=assistant_token_count,
            metadata=metadata,
        )

        dao.philosophers.increment_prompts(advisor_name)

        # Check if we should trigger summarization (use count we already tracked)
        message_count += 1  # +1 for the assistant message we just saved
        if prompt_builder.should_summarize(message_count) and not chat_summary:
            all_messages = dao.messages.get_by_chat_id(uuid.UUID(chat_id))
            _generate_summary(openai_client, dao, chat_id, all_messages, prompt_builder)

    except Exception as e:
        import traceback
        traceback.print_exc()
        yield _sse_event("error", {"detail": f"Error saving chat history: {e}"})
        return

    # Send final done event with message metadata
    yield _sse_event("done", {
        "message": {
            "id": str(assistant_message.id),
            "role": "assistant",
            "content": response_text,
            "token_count": assistant_token_count,
            "metadata": metadata,
            "created_at": assistant_message.created_at.isoformat()
                if hasattr(assistant_message.created_at, 'isoformat')
                else str(assistant_message.created_at),
        },
    })


def _generate_summary(openai_client, dao, chat_id, messages, prompt_builder):
    """Generate a summary of the conversation and store it on the chat."""
    try:
        msg_dicts = [{"role": m.role, "content": m.content} for m in messages]
        summary_prompt = prompt_builder.generate_summary_prompt(msg_dicts[:30])

        summary_response = openai_client.responses.create(
            model=OPENAI_CHAT_MODEL,
            input=summary_prompt,
            instructions="You are a helpful assistant that summarizes conversations concisely.",
        )

        # Extract text from non-streaming response
        summary_text = None
        for item in summary_response.output:
            if item.type == "message":
                for block in item.content:
                    if block.type == "output_text":
                        summary_text = block.text
                        break
                if summary_text:
                    break

        if summary_text:
            last_summarized = messages[29]
            dao.chats.update(
                uuid.UUID(chat_id),
                summary=summary_text,
                summary_through_message_id=last_summarized.id,
            )
    except Exception as e:
        print(f"Summary generation failed (non-fatal): {e}")
