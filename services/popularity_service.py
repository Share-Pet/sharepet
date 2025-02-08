from datetime import datetime, timedelta
from models import db, Game, Session
from sqlalchemy import func

import time

# A simple in-memory cache to store popularity results and their timestamp
_popularity_cache = {
    "timestamp": None,
    "data": None
}

def get_popularity_scores():
    """
    Calculates (or fetches cached) popularity scores for all games:
        w1: # people played yesterday
        w2: # people playing now
        w3: total # upvotes
        w4: max session length (yesterday)
        w5: total # of sessions yesterday
    Score = 0.3*(w1/max_daily_players) + ...
    """
    global _popularity_cache
    now = time.time()

    # If cached data is fresh (< 5 minutes old), return it
    if _popularity_cache["timestamp"] and (now - _popularity_cache["timestamp"] < 300):
        return _popularity_cache["data"]

    # Otherwise, recalc
    yesterday_date = (datetime.utcnow().date() - timedelta(days=1))

    games = Game.query.all()

    # Gather metrics for each game
    game_metrics = []
    for g in games:
        # # people who played yesterday
        w1 = (db.session.query(Session.contestant_id)
              .filter(Session.game_id == g.id)
              .filter(func.date(Session.start_time) == yesterday_date)
              .group_by(Session.contestant_id)
              .count())

        # # people playing right now = sessions that have start_time but no end_time
        w2 = (db.session.query(Session)
              .filter(Session.game_id == g.id)
              .filter(Session.end_time.is_(None))
              .count())

        # total # of upvotes
        w3 = g.upvotes

        # max session length from yesterday
        # Session length = end_time - start_time (in seconds)
        sessions_yesterday = (db.session.query(Session)
                              .filter(Session.game_id == g.id)
                              .filter(func.date(Session.start_time) == yesterday_date)
                              .all())
        lengths = []
        for s in sessions_yesterday:
            if s.end_time and s.start_time:
                length_sec = (s.end_time - s.start_time).total_seconds()
                lengths.append(length_sec)
        w4 = max(lengths) if lengths else 0

        # total # of sessions played yesterday
        w5 = len(sessions_yesterday)

        game_metrics.append({
            "game_id": g.id,
            "w1": w1,
            "w2": w2,
            "w3": w3,
            "w4": w4,
            "w5": w5
        })

    # We need the max of each dimension across all games to normalize
    if not game_metrics:
        _popularity_cache["data"] = []
        return []

    max_w1 = max([m["w1"] for m in game_metrics]) or 1
    max_w2 = max([m["w2"] for m in game_metrics]) or 1
    max_w3 = max([m["w3"] for m in game_metrics]) or 1
    max_w4 = max([m["w4"] for m in game_metrics]) or 1
    max_w5 = max([m["w5"] for m in game_metrics]) or 1

    # Calculate final score
    final_scores = []
    for m in game_metrics:
        normalized_score = (0.3 * (m["w1"] / max_w1) +
                            0.2 * (m["w2"] / max_w2) +
                            0.25 * (m["w3"] / max_w3) +
                            0.15 * (m["w4"] / max_w4) +
                            0.1 * (m["w5"] / max_w5))
        final_scores.append({
            "game_id": m["game_id"],
            "score": round(normalized_score, 4),
            "components": {
                "w1": m["w1"],
                "w2": m["w2"],
                "w3": m["w3"],
                "w4": m["w4"],
                "w5": m["w5"]
            }
        })

    # Cache the result
    _popularity_cache["timestamp"] = time.time()
    _popularity_cache["data"] = final_scores

    return final_scores
