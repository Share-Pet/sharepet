# Rank-Royale (Game Leaderboard)

A Flask application that demonstrates a multi-game leaderboard with contestant management, per-game scoring, and a popularity index. Uses Python 3 and SQLAlchemy (with either SQLite or PostgreSQL).

## Interacting with the API

Postman Collection : https://www.postman.com/shresthsaxena5/rank-royale

## Endpoints

| Endpoint                | Method | Purpose                                      |
|-------------------------|--------|----------------------------------------------|
| /contestants            | POST   | Create a new contestant                      |
| /contestants            | GET    | List all contestants                         |
| /contestants/<id>       | PUT    | Update contestant info                       |
| /contestants/<id>       | DELETE | Delete contestant                            |
| /games                  | POST   | Create a new game                            |
| /games                  | GET    | List all games                               |
| /games/<id>/start       | PUT    | Start a game                                 |
| /games/<id>/end         | PUT    | End a game                                   |
| /games/<id>/upvote      | POST   | Upvote a game                                |
| /games/<id>/join        | POST   | A contestant joins a game (start a session)  |
| /games/<id>/leave       | POST   | End a session (contestant leaves)            |
| /games/<id>/score       | POST   | Assign a score to a session                  |
| /leaderboard            | GET    | Global leaderboard                           |
| /leaderboard/<game_id>  | GET    | Per-game leaderboard                         |
| /popularity             | GET    | Popularity index for all games               |

## Using the Demo Script

To showcase the workflow automatically, this repository includes a `demo_script.py`. It demonstrates:

- Creating 5+ games
- Adding multiple contestants
- Joining games with different timestamps
- Assigning scores
- Retrieving leaderboards (game and global)
- Calling the popularity endpoint twice (with a 6-minute gap)

### Steps to Run `demo_script.py`

Ensure you have `requests` installed:

```bash
pip install requests
```

(If it’s not already in `requirements.txt`, add `requests==2.31.0` or a similar version.)

Run the demo script:

```bash
python demo_script.py
```

Observe the terminal output:

- It prints success/error messages for each API call.
- It waits 6 minutes near the end to let the popularity cache expire.
- Then it calls `/popularity` again to demonstrate a refreshed score.

### Exact Steps (If Done Manually)

If you prefer manual steps (via cURL or Postman), follow this order:

1. Create 5 or More Games via `POST /games`.
2. Create Multiple Contestants via `POST /contestants`.
3. Join Games at Different Timestamps via `POST /games/<id>/join`.
4. Assign Scores via `POST /games/<id>/score`.
5. Check Leaderboards (global and per-game).
6. Check Popularity (`GET /popularity`) twice, with a 6-minute gap to see it refresh.

### Common Pitfalls / Notes

- **SQLite vs. PostgreSQL**: On a serverless platform, file-based SQLite can be read-only or ephemeral. Use a hosted Postgres DB for persistence.
- **Timestamps**: Provide ISO8601 strings (e.g. "2025-02-07 14:00:00") when contestants join/leave.
- **Popularity Cache**: The popularity index is cached for 5 minutes. That’s why we wait 6 minutes in the script before calling again.

## Conclusion

- Run locally and experiment with endpoints or the demo script.
- Use the default SQLite database or configure `DATABASE_URL` for a persistent PostgreSQL.
- The demo script thoroughly demonstrates the assignment requirements from start to finish.

Enjoy exploring Rank-Royale and customizing it further!
