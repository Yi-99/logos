import os
from openai import OpenAI
from fastapi import HTTPException, UploadFile
import tempfile


def transcribe_audio(audio_file: UploadFile):
    """
    Transcribes audio using OpenAI's Whisper API
    """
    openai_client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
    )

    try:
        # Create a temporary file to store the uploaded audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            content = audio_file.file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        # Transcribe using Whisper
        with open(temp_file_path, "rb") as audio:
            transcription = openai_client.audio.transcriptions.create(
                model="whisper-1",
                file=audio,
                response_format="text"
            )

        # Clean up temp file
        os.unlink(temp_file_path)

        return {"transcription": transcription}

    except Exception as e:
        print(f"Transcription error: {e}")
        # Clean up temp file if it exists
        if 'temp_file_path' in locals():
            try:
                os.unlink(temp_file_path)
            except:
                pass
        raise HTTPException(status_code=500, detail=f"Error transcribing audio: {str(e)}")
