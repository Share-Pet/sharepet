# Rank-Royale (Game Leaderboard)

A Flask application that demonstrates a multi-game leaderboard with contestant management, per-game scoring, and a popularity index. Uses Python 3 and SQLAlchemy (with either SQLite or PostgreSQL).

## Prerequisites

- Python 3.8+
- pip or pipenv (for installing dependencies)

## Setup & Run (Local)

### Clone this repository:

```bash
git clone <YOUR_REPO_URL>
cd <cloned_folder>
```

### Create and activate a virtual environment (optional but recommended):

```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# Windows:
# venv\Scripts\activate
```

### Install dependencies:

```bash
pip install -r requirements.txt
```

### (Optional) Configure environment variables:

If you want to use SQLite, you can skip this (defaults to an in-memory DB or local file).  
If using PostgreSQL, ensure you have `DATABASE_URL` and `SECRET_KEY` in a `.env` file or environment variables:

```bash
DATABASE_URL=postgresql+psycopg2://<USER>:<PASSWORD>@<HOST>:<PORT>/<DBNAME>
SECRET_KEY=some-random-secret
```

### Run the application:

```bash
python app.py
```

By default, the server starts at [http://127.0.0.1:5000](http://127.0.0.1:5000).

## Interacting with the API

A Postman Collection is provided in the repo (or shared separately). Import it into Postman to see all endpoints with sample requests and payloads.

### Key Endpoints (examples):

- `POST /contestants`: Create a new contestant.
- `GET /contestants`: List all contestants.
- `POST /games`: Create a new game.
- `PUT /games/<id>/start` / `PUT /games/<id>/end`: Start/end a game.
- `POST /games/<game_id>/join`: A contestant joins a game (session starts).
- `POST /games/<game_id>/score`: Assign a score to a contestant’s session.
- `GET /leaderboard`: Global leaderboard.
- `GET /leaderboard/<game_id>`: Game-specific leaderboard.
- `GET /popularity`: Popularity index for each game.

## Basic Workflow

1. Create multiple games (`POST /games`).
2. Create contestants (`POST /contestants`).
3. Contestants join games (`POST /games/<id>/join`).
4. Assign scores (`POST /games/<id>/score`).
5. Retrieve leaderboards (`GET /leaderboard` or `/leaderboard/<game_id>`).
6. Check popularity (`GET /popularity`).

## Notes & Assumptions

- By default, if you do not set a `DATABASE_URL`, the app may use a local SQLite DB (or in-memory if configured so). Data will reset when the app restarts in-memory mode.
- Timestamps are generally expected as ISO8601 strings (e.g., "2025-02-07 14:00:00") for join/leave events.
- The popularity score is recalculated/cached every 5 minutes if you keep the server running continuously.

That’s it! You can now experiment, extend, and use the Postman Collection to test each endpoint. Have fun exploring the leaderboard functionality!