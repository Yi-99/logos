import os
import uuid
from openai import OpenAI
from fastapi import HTTPException
from dao import DAOFactory
from services.token_counter import count_tokens
from services.prompt_builder import PromptBuilder
from services.retrieval_service import RetrievalService


def _extract_response_text(response) -> str:
    """Extract the assistant text from an OpenAI Responses API response.

    The output list may contain reasoning items and message items.
    We need the first 'message' type output's text content.
    """
    for item in response.output:
        if item.type == "message":
            for block in item.content:
                if block.type == "output_text":
                    return block.text
    raise ValueError("No text content found in OpenAI response")


def prompt_philosopher(
    dao: DAOFactory,
    user_id: str,
    prompt: str,
    advisor_name: str,
    chat_id: str = None,
):
    """Prompts the AI Philosopher using message-level storage and prompt engineering."""

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
            raise HTTPException(status_code=500, detail=f"Error creating chat: {e}") from e

    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    # Fetch philosopher config
    try:
        philosopher_config = dao.philosophers.get_config_by_name(advisor_name)
        if not philosopher_config:
            raise HTTPException(status_code=400, detail="Philosopher config NOT found!")

        philosopher = dao.philosophers.get_by_name(advisor_name)
        philosopher_id = str(philosopher.id) if philosopher else None
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error fetching philosopher config") from e

    # Load existing messages from DB
    try:
        db_messages = dao.messages.get_by_chat_id(uuid.UUID(chat_id))
        history = [{"role": m.role, "content": m.content} for m in db_messages]
    except Exception as e:
        print(e)
        history = []

    # Save user message to messages table
    try:
        user_token_count = count_tokens(prompt)
        dao.messages.create(
            chat_id=uuid.UUID(chat_id),
            role="user",
            content=prompt,
            token_count=user_token_count,
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error saving user message: {e}") from e

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

    # Call OpenAI
    try:
        response = openai_client.responses.create(
            model="o4-mini-2025-04-16",
            input=input_messages,
            instructions=instructions,
            reasoning={"effort": "high"},
        )
        response_text = _extract_response_text(response)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error calling OpenAI: {e}") from e

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

        # Check if we should trigger summarization
        all_messages = dao.messages.get_by_chat_id(uuid.UUID(chat_id))
        if prompt_builder.should_summarize(len(all_messages)) and not chat_summary:
            _generate_summary(openai_client, dao, chat_id, all_messages, prompt_builder)

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error saving chat history: {e}") from e

    return {
        "chat_id": chat_id,
        "advisor_name": advisor_name,
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
    }


def _generate_summary(openai_client, dao, chat_id, messages, prompt_builder):
    """Generate a summary of the conversation and store it on the chat."""
    try:
        msg_dicts = [{"role": m.role, "content": m.content} for m in messages]
        summary_prompt = prompt_builder.generate_summary_prompt(msg_dicts[:30])

        summary_response = openai_client.responses.create(
            model="o4-mini-2025-04-16",
            input=summary_prompt,
            instructions="You are a helpful assistant that summarizes conversations concisely.",
        )
        summary_text = _extract_response_text(summary_response)

        last_summarized = messages[29]
        dao.chats.update(
            uuid.UUID(chat_id),
            summary=summary_text,
            summary_through_message_id=last_summarized.id,
        )
    except Exception as e:
        print(f"Summary generation failed (non-fatal): {e}")
