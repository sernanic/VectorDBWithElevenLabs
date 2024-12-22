# FastAPI Endpoint for Storing Documents in Astra DB

This section describes how to create a FastAPI endpoint that allows you to store documents in Astra DB. The documents will contain fields such as `_id`, `pageContent`, `pageURL`, and `tableOfContent`, enabling you to build a chat LLM that can answer questions based on the stored documents.

## Prerequisites

1. **FastAPI**: Install FastAPI using pip:
   ```bash
   pip install fastapi[all]
   ```

2. **Astra DB Client**: Install the `astrapy` library:
   ```bash
   pip install astrapy
   ```

3. **Environment Variables**: Set your Astra DB credentials as environment variables or directly in the code (not recommended for production).

## FastAPI Application

Below is a sample FastAPI application that defines an endpoint to store a document in Astra DB:

```python
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from astrapy import DataAPIClient

# Initialize FastAPI
app = FastAPI()

# Define the document model
class Document(BaseModel):
    id: str
    pageContent: str
    pageURL: str
    tableOfContent: dict

# Initialize Astra DB client
astra_token = os.getenv("ASTRA_DB_APPLICATION_TOKEN")
astra_endpoint = os.getenv("ASTRA_DB_ENDPOINT")
client = DataAPIClient(astra_token)
database = client.get_database(astra_endpoint)
collection = database.my_collection  # Replace with your collection name

@app.post("/documents/")
async def create_document(document: Document):
    try:
        # Prepare the document to be inserted
        doc_to_insert = {
            "_id": document.id,
            "pageContent": document.pageContent,
            "pageURL": document.pageURL,
            "tableOfContent": document.tableOfContent
        }
        
        # Insert the document into Astra DB
        result = await collection.insert_one(doc_to_insert)
        
        return {"message": "Document created successfully", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the application
# Use 'uvicorn filename:app --reload' to run the server
```

## Explanation

1. **FastAPI Setup**: The FastAPI application is initialized, and a model for the document is defined using Pydantic.

2. **Document Model**: The `Document` class defines the structure of the document you want to store, including fields like `id`, `pageContent`, `pageURL`, and `tableOfContent`.

3. **Astra DB Client**: The Astra DB client is initialized using the application token and endpoint. Make sure to replace `my_collection` with the actual name of your collection in Astra DB.

4. **Create Document Endpoint**: The `/documents/` endpoint accepts a POST request with a JSON body that matches the `Document` model. It prepares the document for insertion and calls the `insert_one` method to store it in Astra DB.

5. **Error Handling**: If an error occurs during the insertion, an HTTP 500 error is raised with the error message.

## Running the Application

To run the FastAPI application, save the code in a file (e.g., `main.py`) and execute the following command in your terminal:

```bash
uvicorn main:app --reload
```

You can then access the API at `http://127.0.0.1:8000/documents/` and send a POST request with a JSON body containing the document data.

## Example Request

Here’s an example of how to structure your JSON request body:

```json
{
    "id": "work-orders-managing-work-orders",
    "pageContent": "## Creating Work Orders\nStep-by-step guide on how to create new work o…",
    "pageURL": "work-orders/managing-work-orders",
    "tableOfContent": {}
}
```

## Conclusion

This FastAPI endpoint allows you to store documents in Astra DB, enabling you to build a chat LLM that can answer questions based on the documents stored in your database. Make sure to handle authentication and security measures appropriately for production use.

# FastAPI Endpoint for Updating Documents in Astra DB

This section describes how to create a FastAPI endpoint that allows you to update an existing document in Astra DB. This is useful when you need to modify the content of a document that has already been stored.

## Prerequisites

Ensure you have the following prerequisites set up as mentioned in the previous sections:

1. **FastAPI**: Installed using pip.
2. **Astra DB Client**: Installed using pip.
3. **Environment Variables**: Set your Astra DB credentials.

## FastAPI Application

Below is a sample FastAPI application that defines an endpoint to update a document in Astra DB:

```python
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from astrapy import DataAPIClient

# Initialize FastAPI
app = FastAPI()

# Define the document model
class Document(BaseModel):
    id: str
    pageContent: str
    pageURL: str
    tableOfContent: dict

# Initialize Astra DB client
astra_token = os.getenv("ASTRA_DB_APPLICATION_TOKEN")
astra_endpoint = os.getenv("ASTRA_DB_ENDPOINT")
client = DataAPIClient(astra_token)
database = client.get_database(astra_endpoint)
collection = database.my_collection  # Replace with your collection name

@app.put("/documents/{document_id}")
async def update_document(document_id: str, document: Document):
    try:
        # Prepare the updated document
        updated_doc = {
            "_id": document.id,
            "pageContent": document.pageContent,
            "pageURL": document.pageURL,
            "tableOfContent": document.tableOfContent
        }
        
        # Update the document in Astra DB
        result = await collection.update_one({"_id": document_id}, {"$set": updated_doc})
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Document not found or no changes made")
        
        return {"message": "Document updated successfully", "id": document_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the application
# Use 'uvicorn filename:app --reload' to run the server
```

## Explanation

1. **Update Document Endpoint**: The `/documents/{document_id}` endpoint accepts a PUT request with a JSON body that matches the `Document` model. The `document_id` path parameter specifies which document to update.

2. **Prepare the Updated Document**: The updated document is prepared with the new values provided in the request.

3. **Update Operation**: The `update_one` method is called to update the document in Astra DB. If no document is found or no changes are made, a 404 error is raised.

4. **Error Handling**: If an error occurs during the update, an HTTP 500 error is raised with the error message.

## Running the Application

To run the FastAPI application, save the code in a file (e.g., `main.py`) and execute the following command in your terminal:

```bash
uvicorn main:app --reload
```

You can then access the API at `http://127.0.0.1:8000/documents/{document_id}` and send a PUT request with a JSON body containing the updated document data.

## Example Request

Here’s an example of how to structure your JSON request body for updating a document:

```json
{
    "id": "work-orders-managing-work-orders",
    "pageContent": "## Updated Work Orders\nUpdated step-by-step guide on how to create new work o…",
    "pageURL": "work-orders/managing-work-orders",
    "tableOfContent": {}
}
```

## Conclusion

This FastAPI endpoint allows you to update existing documents in Astra DB, enabling you to maintain and modify the content as needed. Ensure to handle authentication and security measures appropriately for production use.





