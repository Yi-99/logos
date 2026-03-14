import os
import uuid
from openai import OpenAI
from fastapi import HTTPException
from routes.prompt import History
from dao import DAOFactory


def prompt_philosopher(
    dao: DAOFactory,
    user_id: str,
    prompt: str,
    advisor_name: str,
    chat_id: str = None,
    history: list[History] = None,
):
    """
    Prompts the AI Philosopher
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
            print(e)
            raise HTTPException(status_code=500, detail="Error creating chat") from e

    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    print("advisor_name:", advisor_name, "chat_id:", chat_id, "history:", history)

    try:
        philosopher_config = dao.philosophers.get_config_by_name(advisor_name)
        if not philosopher_config:
            raise HTTPException(status_code=400, detail="Philosopher config NOT found!")
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error fetching philosopher config") from e

    if history:
        history.append({"role": "user", "content": prompt})
        messages = [item.to_dict() if isinstance(item, History) else item for item in history]

        response = openai_client.responses.create(
            model="o4-mini-2025-04-16",
            input=messages,
            instructions=philosopher_config,
            reasoning={"effort": "high"},
        )
    else:
        history = []
        history.append({"role": "user", "content": prompt})
        response = openai_client.responses.create(
            model="o4-mini-2025-04-16",
            input=prompt,
            instructions=philosopher_config,
            reasoning={"effort": "high"},
        )

    # Save the response to the database
    try:
        last_prompt = {
            "role": "assistant",
            "content": response.output[1].content[0].text,
        }
        history.append(last_prompt)

        serialized_history = []
        for item in history:
            if isinstance(item, History):
                serialized_history.append({"role": item.role, "content": item.content})
            else:
                serialized_history.append(item)

        dao.chats.upsert(
            chat_id=uuid.UUID(chat_id),
            user_id=uuid.UUID(user_id),
            advisor_name=advisor_name,
            content=serialized_history,
        )

        dao.philosophers.increment_prompts(advisor_name)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error saving chat history") from e

    return [
        {
            "chat_id": chat_id,
            "advisor_name": advisor_name,
            "content": serialized_history,
        }
    ]
