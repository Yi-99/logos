import os
from openai import OpenAI
from supabase import create_client, Client
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(
  supabase_url=url,
  supabase_key=key
)

def prompt_advisor(prompt: str, advisor_name: str, chat_id: str = None, history: list[str] = None):
  """
  Prompts the AI Advisor
  """
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
  
    response = client.responses.create(
      model="o4-mini-2025-04-16",
      input=history,
      instructions=advisor_config,
      reasoning={
        "effort": "high",
      }
    )
  else:
    history = []
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
      "role": "assitant",
      "content": response.output[1].content[0].text
    }
    history.append(last_prompt)
    print("history:", history)
    result = supabase.table("Chat").upsert({
      "chat_id": chat_id,
      "advisor_name": advisor_name,
      "content": history
    } if chat_id else {
      "advisor_name": advisor_name,
      "content": history
    }).execute()
    
    print("result:", result)
  except Exception as e:
    print(e)
    raise HTTPException(status_code=500, detail="Error saving chat history")
  
  return result.data