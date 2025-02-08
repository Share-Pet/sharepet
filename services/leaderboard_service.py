from datetime import datetime, date
from models import db, Session, Contestant, Game
from sqlalchemy import func

def get_global_leaderboard(filter_date=None):
    """
    Return total scores of contestants across all games, optionally filtered by a date.
    """
    query = db.session.query(
        Session.contestant_id,
        func.sum(Session.score).label('total_score')
    )

    if filter_date:
        # Convert string to date
        filter_date_obj = datetime.fromisoformat(filter_date).date()
        # Filter sessions that started or ended on that date (simple approach)
        query = query.filter(func.date(Session.start_time) == filter_date_obj)

    query = query.group_by(Session.contestant_id).order_by(func.sum(Session.score).desc())

    results = []
    for row in query:
        contestant = Contestant.query.get(row.contestant_id)
        results.append({
            "contestant_name": contestant.name,
            "total_score": row.total_score
        })
    return results

def get_game_leaderboard(game_id, filter_date=None):
    """
    Return scores of contestants in a particular game, optionally filtered by a date.
    """
    query = db.session.query(
        Session.contestant_id,
        func.sum(Session.score).label('score')
    ).filter(Session.game_id == game_id)

    if filter_date:
        # Convert string to date
        filter_date_obj = datetime.fromisoformat(filter_date).date()
        query = query.filter(func.date(Session.start_time) == filter_date_obj)

    query = query.group_by(Session.contestant_id).order_by(func.sum(Session.score).desc())

    results = []
    for row in query:
        contestant = Contestant.query.get(row.contestant_id)
        results.append({
            "contestant_name": contestant.name,
            "score": row.score
        })
    return results
