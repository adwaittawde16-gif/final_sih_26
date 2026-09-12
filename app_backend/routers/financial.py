# Investigator Notes Endpoints (Simple In-Memory Implementation)

from datetime import datetime
from typing import List
from fastapi import APIRouter, Body, Query, HTTPException
from pydantic import BaseModel

router = APIRouter()

# In-memory store for notes (in production, this would be a database)
_investigator_notes = {
    "transactions": {},  # transaction_id -> list of notes
    "entities": {},      # entity_id -> list of notes
    "cases": {}          # fir_number -> list of notes
}

class Note(BaseModel):
    """A note added by an investigator."""
    id: str
    author: str
    content: str
    timestamp: str = datetime.now().isoformat()
    is_active: bool = True

class NoteCreate(BaseModel):
    """Request to create a new note."""
    author: str
    content: str

@router.post("/notes/transaction/{transaction_id}", response_model=Note,
             summary="Add a note to a financial transaction")
def add_transaction_note(
    transaction_id: str,
    note_request: NoteCreate = Body(...)
):
    """Add an investigator note to a specific transaction."""
    note_id = f"note_{len(_investigator_notes['transactions'].get(transaction_id, [])) + 1}_{int(datetime.now().timestamp())}"
    note = Note(
        id=note_id,
        author=note_request.author,
        content=note_request.content
    )

    if transaction_id not in _investigator_notes["transactions"]:
        _investigator_notes["transactions"][transaction_id] = []

    _investigator_notes["transactions"][transaction_id].append(note.dict())
    return note

@router.get("/notes/transaction/{transaction_id}", response_model=List[Note],
            summary="Get all notes for a financial transaction")
def get_transaction_notes(
    transaction_id: str,
    include_inactive: bool = Query(False, description="Include inactive/deleted notes")
):
    """Get all notes for a specific transaction."""
    notes = _investigator_notes["transactions"].get(transaction_id, [])
    if not include_inactive:
        notes = [note for note in notes if note.get("is_active", True)]
    return [Note(**note) for note in notes]

@router.delete("/notes/transaction/{transaction_id}/{note_id}",
               summary="Delete (deactivate) a note on a financial transaction")
def delete_transaction_note(
    transaction_id: str,
    note_id: str
):
    """Delete (deactivate) a specific note on a transaction."""
    if transaction_id in _investigator_notes["transactions"]:
        for note in _investigator_notes["transactions"][transaction_id]:
            if note["id"] == note_id:
                note["is_active"] = False
                return {"success": True, "message": "Note deactivated"}
    raise HTTPException(status_code=404, detail="Note not found")

# Similar endpoints for entities and cases could be added here
# For brevity, we'll implement just the transaction notes which covers the core use case