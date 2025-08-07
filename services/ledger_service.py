from models import db, Ledger

def create_transaction(user_id, transaction_type, amount, details=None):
    # Ensure transaction_type is either credit or debit
    if transaction_type not in ['credit', 'debit']:
        raise ValueError("Transaction type must be 'credit' or 'debit'.")

    transaction = Ledger(
        user_id=user_id,
        transaction_type=transaction_type,
        amount=amount,
        details=details
    )

    db.session.add(transaction)
    db.session.commit()
    return transaction

def get_user_balance(user_id):
    transactions = Ledger.query.filter_by(user_id=user_id).all()
    balance = sum([t.amount if t.transaction_type == 'credit' else -t.amount for t in transactions])
    return balance
