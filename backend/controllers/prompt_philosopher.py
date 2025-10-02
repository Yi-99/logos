import os
from openai import OpenAI
from fastapi import HTTPException
from routes.prompt import History
from db import SupabaseService


<<<<<<< HEAD
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(
  supabase_url=url,
  supabase_key=key
)

def prompt_philosopher(prompt: str, name: str, chat_id: str = None, history: list[History] = None):
=======
def prompt_philosopher(prompt: str, philosopher_name: str, chat_name:str, chat_id: str = None, history: list[History] = None):
>>>>>>> origin/main
  """
  Prompts the AI Philosopher
  """
  db_service = SupabaseService()
  supabase = db_service.get_client()
  
  client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
  )
  
<<<<<<< HEAD
  number_of_prompts = 0
  
  if name == None:
    raise HTTPException(status_code=400, detail="Philosopher required!")
  
  try:
    response = supabase.table("Philosophers").select("config").eq("name", name).execute()
    if len(response.data) == 0:
      raise HTTPException(status_code=400, detail="Philosopher config NOT found!")
    config = response.data[0]["config"]
    number_of_prompts = response.data[0]["number_of_prompts"]
    number_of_prompts += 1
=======
  if philosopher_name == None:
    raise HTTPException(status_code=400, detail="Philosopher required!")
  
  try:
    response = supabase.table("Philosopher").select("philosopher_config").eq("philosopher_name", philosopher_name).execute()
    if len(response.data) == 0:
      raise HTTPException(status_code=400, detail="Philosopher config NOT found!")
    philosopher_config = response.data[0]["philosopher_config"]
>>>>>>> origin/main
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
  
    response = client.responses.create(
      model="o4-mini-2025-04-16",
      input=messages,
<<<<<<< HEAD
      instructions=config,
=======
      instructions=philosopher_config,
>>>>>>> origin/main
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
<<<<<<< HEAD
      instructions=config,
=======
      instructions=philosopher_config,
>>>>>>> origin/main
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
    print("serialized_history:", serialized_history)

    print("history:", history)
    print("chat_id:", chat_id)
    print("number_of_prompts:", number_of_prompts)
    
    result = supabase.table("Chat").upsert({
      "chat_id": chat_id,
<<<<<<< HEAD
      "name": name,
      "content": serialized_history,
    } if chat_id else {
      "name": name,
=======
      "chat_name": chat_name,
      "philosopher_name": philosopher_name,
      "content": serialized_history,
    } if chat_id else {
      "chat_name": chat_name,
      "philosopher_name": philosopher_name,
>>>>>>> origin/main
      "content": serialized_history,
    }).execute()
    
    supabase.table("Philosophers").update({
			"number_of_prompts": number_of_prompts,
		}).eq("name", name).execute()
  except Exception as e:
    print(e)
    raise HTTPException(status_code=500, detail="Error saving chat history")
  
  print("result:", result.data)
  
  return result.data