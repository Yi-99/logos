"""Ingest philosopher source texts into the philosopher_documents table.

Reads text files from data/texts/{philosopher_name}/, chunks them,
generates embeddings, and inserts into the database.

Usage:
    uv run python -m scripts.ingest_documents
    uv run python -m scripts.ingest_documents --philosopher "Marcus Aurelius"
    uv run python -m scripts.ingest_documents --reset
"""

import sys
import os
import re

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import config  # noqa: F401
from openai import OpenAI
from database import SessionLocal
from models.philosopher import Philosopher
from models.philosopher_document import PhilosopherDocument

CHUNK_SIZE = 500  # target tokens per chunk (approximate by words / 0.75)
CHUNK_OVERLAP = 50
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "texts")


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into chunks at paragraph boundaries, targeting chunk_size tokens."""
    paragraphs = re.split(r"\n\s*\n", text.strip())
    chunks = []
    current_chunk = []
    current_words = 0
    target_words = int(chunk_size * 0.75)  # Approximate tokens to words

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        para_words = len(para.split())

        if current_words + para_words > target_words and current_chunk:
            chunks.append("\n\n".join(current_chunk))
            # Keep last paragraph as overlap
            overlap_paras = current_chunk[-1:] if overlap > 0 else []
            current_chunk = overlap_paras
            current_words = sum(len(p.split()) for p in current_chunk)

        current_chunk.append(para)
        current_words += para_words

    if current_chunk:
        chunks.append("\n\n".join(current_chunk))

    return chunks


def embed_texts(client: OpenAI, texts: list[str]) -> list[list[float]]:
    """Batch embed texts using OpenAI text-embedding-3-small."""
    # OpenAI allows up to 2048 inputs per request, batch in groups of 100
    all_embeddings = []
    for i in range(0, len(texts), 100):
        batch = texts[i:i + 100]
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=batch,
        )
        all_embeddings.extend([d.embedding for d in response.data])
    return all_embeddings


def ingest(philosopher_name: str = None, reset: bool = False):
    session = SessionLocal()
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    try:
        if not os.path.isdir(DATA_DIR):
            print(f"Data directory not found: {DATA_DIR}")
            print("Create directories like data/texts/Socrates/ with .txt files.")
            return

        # Get philosopher name -> id mapping
        philosophers = {}
        if philosopher_name:
            p = session.query(Philosopher).filter_by(name=philosopher_name).first()
            if not p:
                print(f"Philosopher '{philosopher_name}' not found in database.")
                return
            philosophers[p.name] = p.id
        else:
            for p in session.query(Philosopher).all():
                philosophers[p.name] = p.id

        for name, phil_id in philosophers.items():
            text_dir = os.path.join(DATA_DIR, name.lower().replace(" ", "_"))
            if not os.path.isdir(text_dir):
                # Try with original name
                text_dir = os.path.join(DATA_DIR, name)
                if not os.path.isdir(text_dir):
                    print(f"  No text directory for {name}, skipping.")
                    continue

            if reset:
                deleted = (
                    session.query(PhilosopherDocument)
                    .filter(PhilosopherDocument.philosopher_id == phil_id)
                    .delete()
                )
                session.commit()
                print(f"  Deleted {deleted} existing documents for {name}")

            # Check for existing documents
            existing = (
                session.query(PhilosopherDocument)
                .filter(PhilosopherDocument.philosopher_id == phil_id)
                .count()
            )
            if existing > 0 and not reset:
                print(f"  {name} already has {existing} documents, skipping (use --reset to re-ingest).")
                continue

            txt_files = sorted(
                f for f in os.listdir(text_dir) if f.endswith(".txt")
            )
            if not txt_files:
                print(f"  No .txt files found in {text_dir}")
                continue

            total_chunks = 0
            for filename in txt_files:
                filepath = os.path.join(text_dir, filename)
                source_title = filename.replace(".txt", "").replace("_", " ").title()

                # Determine source type from filename or metadata
                source_type = "primary_text"
                if "commentary" in filename.lower():
                    source_type = "commentary"
                elif "letter" in filename.lower():
                    source_type = "letter"

                with open(filepath, "r", encoding="utf-8") as f:
                    text = f.read()

                chunks = chunk_text(text)
                if not chunks:
                    continue

                print(f"  {name}/{filename}: {len(chunks)} chunks, embedding...")
                embeddings = embed_texts(client, chunks)

                for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                    doc = PhilosopherDocument(
                        philosopher_id=phil_id,
                        source_title=source_title,
                        source_type=source_type,
                        chunk_text=chunk,
                        chunk_index=idx,
                        embedding=embedding,
                        metadata_={"filename": filename},
                    )
                    session.add(doc)
                    total_chunks += 1

            session.commit()
            print(f"  {name}: ingested {total_chunks} total chunks.")

        print("\nIngestion complete.")
    finally:
        session.close()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--philosopher", type=str, help="Ingest only for this philosopher")
    parser.add_argument("--reset", action="store_true", help="Delete existing documents before ingesting")
    args = parser.parse_args()
    ingest(philosopher_name=args.philosopher, reset=args.reset)
