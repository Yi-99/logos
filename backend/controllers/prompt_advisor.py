import os
from openai import OpenAI
from fastapi import HTTPException
from routes.prompt import History
from db import SupabaseService


def prompt_advisor(prompt: str, advisor_name: str, chat_name:str, chat_id: str = None, history: list[History] = None):
  """
  Prompts the AI Advisor
  """
  db_service = SupabaseService()
  supabase = db_service.get_client()
  
  client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
  )
  
  if advisor_name == None:
    raise HTTPException(status_code=400, detail="Advisor required!")
  
  try:
    response = supabase.table("Advisor").select("advisor_config").eq("advisor_name", advisor_name).execute()
    if len(response.data) == 0:
      raise HTTPException(status_code=400, detail="Advisor config NOT found!")
    advisor_config = response.data[0]["advisor_config"]
  except Exception as e:
    print(e)
    raise HTTPException(status_code=500, detail="Error fetching advisor config")
    
  if history:
    history.append({
      "role": "user",
      "content": prompt
    })
    
    # Convert History objects to the format expected by OpenAI
    messages = [item.to_dict() if isinstance(item, History) else item for item in history]
  
    response = client.responses.create(
      model="o4-mini-2025-04-16",
      input=messages,
      instructions=advisor_config,
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
    response = client.responses.create(
      model="o4-mini-2025-04-16",
      input=prompt,
      instructions=advisor_config,
      reasoning={
        "effort": "high",
      }
    )
    
  
  # save the response of the advisor AI to the database
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
    print("serialized_history:", serialized_history)

    print("history:", history)
    print("chat_id:", chat_id)
    result = supabase.table("Chat").upsert({
      "chat_id": chat_id,
      "chat_name": chat_name,
      "advisor_name": advisor_name,
      "content": serialized_history,
    } if chat_id else {
      "chat_name": chat_name,
      "advisor_name": advisor_name,
      "content": serialized_history,
    }).execute()
  except Exception as e:
    print(e)
    raise HTTPException(status_code=500, detail="Error saving chat history")
  
  print("result:", result.data)
  
  return result.data