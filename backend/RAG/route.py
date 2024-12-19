from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
import csv
import io
import faiss
import numpy as np
from typing import List, Generator
import requests
import os


router = APIRouter()

# Initialize FAISS index
vector_dimension = 768  # Adjust based on the LLM embedding dimension
faiss_index = faiss.IndexFlatL2(vector_dimension)
metadata_store = []  # Store metadata (e.g., line content)


# Placeholder function for obtaining embeddings via API
def get_embedding(text: str) -> np.ndarray:
    response = requests.post(
        "https://api.example.com/get-embedding",
        json={"text": text},
    )
    response.raise_for_status()
    return np.array(response.json()["embedding"], dtype=np.float32)


# Placeholder function for generating text via API with streaming
def stream_llm_response(query: str, context: str) -> Generator[str, None, None]:
    response = requests.post(
        "https://api.example.com/generate",
        json={"query": query, "context": context},
        stream=True,
    )
    response.raise_for_status()
    for line in response.iter_lines():
        if line:
            yield line.decode("utf-8")


@router.post("/upload/")
async def upload_and_process_file(file: UploadFile = File(...)):
    """
    Uploads a file, processes it line by line if it's a .txt file, and indexes embeddings in FAISS.
    """
    MAX_SIZE = 2 * 1024 * 1024 * 1024  # 2GB in bytes
    temp_file_path = f"/tmp/{file.filename}"

    # Ensure the /tmp directory exists
    os.makedirs("/tmp", exist_ok=True)

    try:
        # Save the file in chunks to avoid memory overflow
        with open(temp_file_path, "wb") as temp_file:
            file_size = 0
            while chunk := file.file.read(1024 * 1024):  # Read 1MB at a time
                file_size += len(chunk)
                if file_size > MAX_SIZE:
                    raise HTTPException(status_code=413, detail="File too large")
                temp_file.write(chunk)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {e}")
    finally:
        file.file.close()

    # If the file is a .txt file, process its contents
    if file.filename.endswith(".txt"):
        try:
            with open(temp_file_path, "r", encoding="utf-8") as txt_file:
                for line_number, line in enumerate(txt_file):
                    line_content = line.strip()
                    if not line_content:
                        continue  # Skip empty lines
                    try:
                        embedding = get_embedding(
                            line_content
                        )  # Replace with actual embedding logic
                        faiss_index.add(np.array([embedding], dtype=np.float32))
                        metadata_store.append(line_content)
                    except Exception as e:
                        raise HTTPException(
                            status_code=500,
                            detail=f"Error processing line {line_number}: {e}",
                        )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading file: {e}")

        return {
            "message": "TXT file processed successfully",
            "lines_indexed": len(metadata_store),
        }

    return {"message": "File uploaded successfully", "filename": file.filename}


@router.post("/query/")
async def query_rag(query: str):
    try:
        # Get embedding for the query
        query_embedding = get_embedding(query)

        # Search for the most relevant chunks
        k = 5  # Number of top results to retrieve
        distances, indices = faiss_index.search(np.array([query_embedding]), k)

        # Retrieve corresponding metadata
        context = "\n".join([metadata_store[i] for i in indices[0] if i != -1])

        # Stream response from LLM
        response_stream = stream_llm_response(query=query, context=context)
        return StreamingResponse(response_stream, media_type="text/plain")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/")
def status():
    return {"status": "Service is up", "indexed_lines": len(metadata_store)}
