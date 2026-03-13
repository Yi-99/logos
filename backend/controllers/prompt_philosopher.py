import os
from openai import OpenAI
from fastapi import HTTPException
from routes.prompt import History
from db import SupabaseService


def prompt_philosopher(
  user_id: str, 
  prompt: str, 
  advisor_name: str, 
  chat_id: str = None, 
  history: list[History] = None
):
  """
  Prompts the AI Philosopher
  """
  db_service = SupabaseService()
  supabase = db_service.get_client()

  # Create a new chat if chat_id is not provided
  if not chat_id:
    try:
      new_chat = supabase.table("Chats").insert({
        "user_id": user_id,
        "advisor_name": advisor_name,
      }).execute()
      if new_chat.data and len(new_chat.data) > 0:
        chat_id = new_chat.data[0]["id"]
      else:
        raise HTTPException(status_code=500, detail="Failed to create new chat")
    except Exception as e:
      print(e)
      raise HTTPException(status_code=500, detail="Error creating chat") from e

  openai_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
  )
  
  print("advisor_name:", advisor_name, "chat_id:", chat_id, "history:", history)

  try:
    response = (
      supabase.table("Philosophers")
      .select("config")
      .eq("name", advisor_name)
      .execute()
    )
    if len(response.data) == 0:
      raise HTTPException(status_code=400, detail="Philosopher config NOT found!")
    philosopher_config = response.data[0]["config"]
  except Exception as e:
    print(e)
    raise HTTPException(status_code=500, detail="Error fetching philosopher config")
    
  if history:
    history.append({
      "role": "user",
      "content": prompt
    })
    
    # Convert History objects to the format expected by OpenAI
    messages = [item.to_dict() if isinstance(item, History) else item for item in history]
  
    response = openai_client.responses.create(
      model="o4-mini-2025-04-16",
      input=messages,
      instructions=philosopher_config,
      reasoning={
        "effort": "high",
      }
    )
  else:
    history = []
    history.append({
      "role": "user",
      "content": prompt
    })
    response = openai_client.responses.create(
      model="o4-mini-2025-04-16",
      input=prompt,
      instructions=philosopher_config,
      reasoning={
        "effort": "high",
      }
    )
    
  
  # save the response of the philosopher AI to the database
  try:
    last_prompt = {
      "role": "assistant",
      "content": response.output[1].content[0].text
    }
    history.append(last_prompt)
    
    serialized_history = []
    for item in history:
      if isinstance(item, History):
        serialized_history.append({"role": item.role, "content": item.content})
      else:
        serialized_history.append(item)
    
    result = supabase.table("Chats").upsert({
      "id": chat_id,
      "user_id": user_id,
      "advisor_name": advisor_name,
      "content": serialized_history,
    }).execute()

    # Get current number of prompts and increment
    philosopher_data = (
      supabase.table("Philosophers")
      .select("number_of_prompts")
      .eq("name", advisor_name)
      .execute()
    )
    
    current_prompts = (
      philosopher_data.data[0]["number_of_prompts"]
      if philosopher_data.data and philosopher_data.data[0].get("number_of_prompts")
      else 0
    )

    supabase.table("Philosophers").update({
      "number_of_prompts": current_prompts + 1,
    }).eq("name", advisor_name).execute()
  except Exception as e:
    print(e)
    raise HTTPException(status_code=500, detail="Error saving chat history") from e

  # Return formatted response for frontend
  return [{
    "chat_id": chat_id,
    "advisor_name": advisor_name,
    "content": serialized_history,
  }]
