from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional

from .dependencies import get_user_transactions_manager
from database import UserTransactionsManager

router = APIRouter(prefix="/transactions", tags=["User Transactions"])

class TransactionCreate(BaseModel):
    from_user_id: int
    to_user_id: int
    amount: int
    transaction_type: str
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    notes: Optional[str] = None
    status: str = 'completed'

class TransactionStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_transaction(data: TransactionCreate, manager: UserTransactionsManager = Depends(get_user_transactions_manager)):
    transaction_id = manager.create_transaction(
        from_user_id=data.from_user_id,
        to_user_id=data.to_user_id,
        amount=data.amount,
        transaction_type=data.transaction_type,
        reference_type=data.reference_type,
        reference_id=data.reference_id,
        notes=data.notes,
        status=data.status
    )
    if not transaction_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create transaction.")
    return {"message": "Transaction created successfully.", "transaction_id": transaction_id}

@router.get("/")
def get_all_transactions(status: Optional[str] = None, transaction_type: Optional[str] = None, manager: UserTransactionsManager = Depends(get_user_transactions_manager)):
    return manager.get_all_transactions(status=status, transaction_type=transaction_type)

@router.get("/statement/{user_id}")
def get_user_statement(user_id: int, manager: UserTransactionsManager = Depends(get_user_transactions_manager)):
    return manager.get_user_statement(user_id)

@router.get("/{transaction_id}")
def get_transaction(transaction_id: int, manager: UserTransactionsManager = Depends(get_user_transactions_manager)):
    transaction = manager.get_transaction_by_id(transaction_id)
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")
    return transaction

@router.patch("/{transaction_id}/status")
def update_transaction_status(transaction_id: int, data: TransactionStatusUpdate, manager: UserTransactionsManager = Depends(get_user_transactions_manager)):
    success = manager.update_transaction_status(
        transaction_id=transaction_id,
        status=data.status,
        notes=data.notes
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to update transaction status. Invalid status or transaction not found.")
    return {"message": "Transaction status updated successfully."}

@router.delete("/{transaction_id}")
def delete_transaction(transaction_id: int, manager: UserTransactionsManager = Depends(get_user_transactions_manager)):
    success, message = manager.delete_transaction(transaction_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"message": message}