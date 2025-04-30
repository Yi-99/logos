import os
from openai import OpenAI

def prompt_advisor(prompt: str, config: str, history: list[str] = None):
  """
  Prompts the AI as an advisor
  """
  client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
  )
  
  if history:
    history.append({
      "role": "user",
      "content": prompt
    })
  
    response = client.responses.create(
      model="o4-mini-2025-04-16",
      input=history,
      instructions=config,
      reasoning={
        "effort": "high",
      }
    )
  else:
    response = client.responses.create(
      model="o4-mini-2025-04-16",
      input=prompt,
      instructions=config,
      reasoning={
        "effort": "high",
      }
    )
  
  return response