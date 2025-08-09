from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging

from models import db, Owner, Ledger
from utils.enums import TransactionType, TransactionCategory

logger = logging.getLogger(__name__)


class LedgerService:
    """Service class for managing coin transactions and ledger"""
    
    def __init__(self):
        self.signup_bonus = 100
        self.referral_bonus_referrer = 50
        self.referral_bonus_referee = 50
    
    def add_transaction(self, owner_id: int, transaction_type: str, amount: int,
                       category: str, description: str, 
                       reference_type: Optional[str] = None,
                       reference_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Add a transaction to the ledger
        
        Args:
            owner_id: Owner ID
            transaction_type: 'credit' or 'debit'
            amount: Transaction amount
            category: Transaction category
            description: Transaction description
            reference_type: Type of reference (e.g., 'event', 'referral')
            reference_id: ID of referenced entity
            
        Returns:
            Dict with transaction details or error
        """
        try:
            # Get owner
            owner = Owner.query.get(owner_id)
            if not owner:
                return {'success': False, 'error': 'Owner not found'}
            
            # Calculate new balance
            if transaction_type == TransactionType.CREDIT.value:
                new_balance = owner.coins_balance + amount
            elif transaction_type == TransactionType.DEBIT.value:
                if owner.coins_balance < amount:
                    return {'success': False, 'error': 'Insufficient balance'}
                new_balance = owner.coins_balance - amount
            else:
                return {'success': False, 'error': 'Invalid transaction type'}
            
            # Update owner balance
            owner.coins_balance = new_balance
            
            # Create ledger entry
            ledger_entry = Ledger(
                owner_id=owner_id,
                transaction_type=transaction_type,
                amount=amount,
                balance_after=new_balance,
                category=category,
                reference_type=reference_type,
                reference_id=reference_id,
                description=description,
                created_at=datetime.utcnow()
            )
            
            db.session.add(ledger_entry)
            db.session.commit()
            
            logger.info(f"Transaction added: {transaction_type} {amount} coins for owner {owner_id}")
            
            return {
                'success': True,
                'transaction': {
                    'id': ledger_entry.id,
                    'type': transaction_type,
                    'amount': amount,
                    'balance_after': new_balance,
                    'description': description
                }
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error adding transaction: {str(e)}")
            return {'success': False, 'error': 'Transaction failed'}
    
    def process_signup_bonus(self, owner_id: int) -> Dict[str, Any]:
        """
        Process signup bonus for new user
        
        Args:
            owner_id: New owner ID
            
        Returns:
            Dict with transaction result
        """
        return self.add_transaction(
            owner_id=owner_id,
            transaction_type=TransactionType.CREDIT.value,
            amount=self.signup_bonus,
            category=TransactionCategory.SIGNUP_BONUS.value,
            description='Welcome bonus for joining Pet Community'
        )
    
    def process_referral_bonus(self, referrer_id: int, referee_id: int) -> Dict[str, Any]:
        """
        Process referral bonuses for both referrer and referee
        
        Args:
            referrer_id: ID of user who referred
            referee_id: ID of new user who was referred
            
        Returns:
            Dict with transaction results
        """
        try:
            # Bonus for referrer
            referrer_result = self.add_transaction(
                owner_id=referrer_id,
                transaction_type=TransactionType.CREDIT.value,
                amount=self.referral_bonus_referrer,
                category=TransactionCategory.REFERRAL_BONUS.value,
                description='Referral bonus for inviting a new user',
                reference_type='referral',
                reference_id=referee_id
            )
            
            if not referrer_result['success']:
                return referrer_result
            
            # Bonus for referee
            referee_result = self.add_transaction(
                owner_id=referee_id,
                transaction_type=TransactionType.CREDIT.value,
                amount=self.referral_bonus_referee,
                category=TransactionCategory.REFERRAL_BONUS.value,
                description='Bonus for joining via referral',
                reference_type='referral',
                reference_id=referrer_id
            )
            
            if not referee_result['success']:
                # Rollback referrer bonus if referee bonus fails
                db.session.rollback()
                return referee_result
            
            logger.info(f"Referral bonuses processed: referrer {referrer_id}, referee {referee_id}")
            
            return {
                'success': True,
                'message': 'Referral bonuses processed successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error processing referral bonus: {str(e)}")
            return {'success': False, 'error': 'Failed to process referral bonus'}
    
    def process_event_registration(self, owner_id: int, event_id: int, 
                                  coins_required: int, event_name: str) -> Dict[str, Any]:
        """
        Process coin payment for event registration
        
        Args:
            owner_id: Owner ID
            event_id: Event ID
            coins_required: Coins required for registration
            event_name: Name of the event
            
        Returns:
            Dict with transaction result
        """
        return self.add_transaction(
            owner_id=owner_id,
            transaction_type=TransactionType.DEBIT.value,
            amount=coins_required,
            category=TransactionCategory.EVENT_REGISTRATION.value,
            description=f'Registration for {event_name}',
            reference_type='event',
            reference_id=event_id
        )
    
    def process_event_refund(self, owner_id: int, event_id: int, 
                           refund_amount: int, event_name: str) -> Dict[str, Any]:
        """
        Process refund for event cancellation
        
        Args:
            owner_id: Owner ID
            event_id: Event ID
            refund_amount: Amount to refund
            event_name: Name of the event
            
        Returns:
            Dict with transaction result
        """
        return self.add_transaction(
            owner_id=owner_id,
            transaction_type=TransactionType.CREDIT.value,
            amount=refund_amount,
            category=TransactionCategory.EVENT_REFUND.value,
            description=f'Refund for cancelled registration - {event_name}',
            reference_type='event',
            reference_id=event_id
        )
    
    def get_balance(self, owner_id: int) -> Dict[str, Any]:
        """
        Get current coin balance for an owner
        
        Args:
            owner_id: Owner ID
            
        Returns:
            Dict with balance information
        """
        try:
            owner = Owner.query.get(owner_id)
            if not owner:
                return {'success': False, 'error': 'Owner not found'}
            
            return {
                'success': True,
                'balance': owner.coins_balance
            }
            
        except Exception as e:
            logger.error(f"Error fetching balance: {str(e)}")
            return {'success': False, 'error': 'Failed to fetch balance'}
    
    def get_transaction_history(self, owner_id: int, page: int = 1, 
                              per_page: int = 20, days: Optional[int] = None) -> Dict[str, Any]:
        """
        Get transaction history for an owner
        
        Args:
            owner_id: Owner ID
            page: Page number
            per_page: Items per page
            days: Number of days to look back (optional)
            
        Returns:
            Dict with transaction history
        """
        try:
            query = Ledger.query.filter_by(owner_id=owner_id)
            
            # Filter by date range if specified
            if days:
                start_date = datetime.utcnow() - timedelta(days=days)
                query = query.filter(Ledger.created_at >= start_date)
            
            # Order by most recent first
            query = query.order_by(Ledger.created_at.desc())
            
            # Paginate
            paginated = query.paginate(page=page, per_page=per_page, error_out=False)
            
            # Format transactions
            transactions = []
            for transaction in paginated.items:
                transactions.append({
                    'id': transaction.id,
                    'type': transaction.transaction_type,
                    'amount': transaction.amount,
                    'balance_after': transaction.balance_after,
                    'category': transaction.category,
                    'description': transaction.description,
                    'created_at': transaction.created_at.isoformat()
                })
            
            return {
                'success': True,
                'transactions': transactions,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': paginated.total,
                    'total_pages': paginated.pages,
                    'has_next': paginated.has_next,
                    'has_prev': paginated.has_prev
                }
            }
            
        except Exception as e:
            logger.error(f"Error fetching transaction history: {str(e)}")
            return {'success': False, 'error': 'Failed to fetch transaction history'}
    
    def get_transaction_summary(self, owner_id: int, days: int = 30) -> Dict[str, Any]:
        """
        Get transaction summary for an owner
        
        Args:
            owner_id: Owner ID
            days: Number of days to summarize
            
        Returns:
            Dict with transaction summary
        """
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            # Get all transactions in the period
            transactions = Ledger.query.filter(
                Ledger.owner_id == owner_id,
                Ledger.created_at >= start_date
            ).all()
            
            # Calculate summary
            total_credits = sum(t.amount for t in transactions 
                              if t.transaction_type == TransactionType.CREDIT.value)
            total_debits = sum(t.amount for t in transactions 
                             if t.transaction_type == TransactionType.DEBIT.value)
            
            # Group by category
            category_summary = {}
            for transaction in transactions:
                if transaction.category not in category_summary:
                    category_summary[transaction.category] = {
                        'credits': 0,
                        'debits': 0,
                        'count': 0
                    }
                
                if transaction.transaction_type == TransactionType.CREDIT.value:
                    category_summary[transaction.category]['credits'] += transaction.amount
                else:
                    category_summary[transaction.category]['debits'] += transaction.amount
                
                category_summary[transaction.category]['count'] += 1
            
            # Get current balance
            owner = Owner.query.get(owner_id)
            
            return {
                'success': True,
                'summary': {
                    'period_days': days,
                    'current_balance': owner.coins_balance if owner else 0,
                    'total_credits': total_credits,
                    'total_debits': total_debits,
                    'net_change': total_credits - total_debits,
                    'transaction_count': len(transactions),
                    'by_category': category_summary
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating transaction summary: {str(e)}")
            return {'success': False, 'error': 'Failed to generate summary'}
    
    def validate_balance(self, owner_id: int, required_amount: int) -> bool:
        """
        Check if owner has sufficient balance
        
        Args:
            owner_id: Owner ID
            required_amount: Amount required
            
        Returns:
            True if sufficient balance, False otherwise
        """
        try:
            owner = Owner.query.get(owner_id)
            return owner and owner.coins_balance >= required_amount
        except Exception as e:
            logger.error(f"Error validating balance: {str(e)}")
            return False