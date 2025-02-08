import requests
import time
import random
import string

BASE_URL = "https://droid-rank-royale.vercel.app"

def main():
    print("=== DEMO SCRIPT STARTED ===")

    # 1. CREATE 5+ GAMES
    print("\n--- Creating 5 Games ---")
    game_ids = []
    for i in range(1, 6):
        game_name = f"DemoGame{i}"
        resp = requests.post(f"{BASE_URL}/games", json={"name": game_name, "upvotes": 0})
        data = resp.json()
        if data.get("success"):
            game_id = data["game"]["id"]
            game_ids.append(game_id)
            print(f"Created Game {game_id}: {game_name}")
        else:
            print("Error creating game:", data)

    # 2. CREATE MULTIPLE CONTESTANTS
    print("\n--- Creating Contestants ---")
    def generate_random_string(length=6):
        letters = string.ascii_lowercase
        return ''.join(random.choice(letters) for i in range(length))

    contestants = [
        {"name": f"Alice_{generate_random_string()}", "email": f"alice_{generate_random_string()}@example.com"},
        {"name": f"Bob_{generate_random_string()}", "email": f"bob_{generate_random_string()}@example.com"},
        {"name": f"Charlie_{generate_random_string()}", "email": f"charlie_{generate_random_string()}@example.com"}
    ]
    contestant_ids = []
    for c in contestants:
        resp = requests.post(f"{BASE_URL}/contestants", json=c)
        data = resp.json()
        if data.get("success"):
            cid = data["contestant"]["id"]
            contestant_ids.append(cid)
            print(f"Created Contestant {cid}: {c['name']}")
        else:
            print("Error creating contestant:", data)

    # 3. CONTESTANTS JOIN GAMES WITH DIFFERENT TIMESTAMPS
    # We'll assign some arbitrary timestamps (ISO8601 strings)
    print("\n--- Contestants Join Games ---")
    session_ids = []
    join_payloads = [
        # (contestant_id, game_id, join_time)
        (contestant_ids[0], game_ids[0], "2025-02-07 14:00:00"),
        (contestant_ids[1], game_ids[0], "2025-02-07 14:05:00"),
        (contestant_ids[2], game_ids[1], "2025-02-07 15:00:00"),
    ]
    for cid, gid, jt in join_payloads:
        resp = requests.post(f"{BASE_URL}/games/{gid}/join", json={
            "contestant_id": cid,
            "join_time": jt
        })
        data = resp.json()
        if data.get("success"):
            sid = data["session"]["session_id"]
            session_ids.append((gid, sid))
            print(f"Contestant {cid} joined Game {gid} at {jt} -> Session {sid}")
        else:
            print("Error joining game:", data)

    # 4. ASSIGN SCORES
    print("\n--- Assign Scores ---")
    # We'll assign scores to each session we recorded
    example_scores = [500, 300, 400]
    for i, (gid, sid) in enumerate(session_ids):
        score = example_scores[i % len(example_scores)]
        resp = requests.post(f"{BASE_URL}/games/{gid}/score", json={
            "session_id": sid,
            "score": score
        })
        data = resp.json()
        if data.get("success"):
            print(f"Session {sid} in Game {gid} assigned score = {score}")
        else:
            print("Error assigning score:", data)

    # 5. GET LEADERBOARD (GAME LEVEL)
    print("\n--- Game-Specific Leaderboard (Game 1) ---")
    if game_ids:
        resp = requests.get(f"{BASE_URL}/leaderboard/{game_ids[0]}")
        print("Leaderboard for Game 1:", resp.json())

    # 6. GET GLOBAL LEADERBOARD
    print("\n--- Global Leaderboard ---")
    resp = requests.get(f"{BASE_URL}/leaderboard")
    print("Global Leaderboard:", resp.json())

    # 7. GET POPULARITY INDEX (FIRST TIME)
    print("\n--- Popularity (First Call) ---")
    resp = requests.get(f"{BASE_URL}/popularity")
    pop_data_1 = resp.json()
    print("Popularity:", pop_data_1)

    # 8. WAIT ~6 MINUTES & CALL POPULARITY AGAIN
    print("\nWaiting 6 minutes to demonstrate popularity refresh...")
    time.sleep(6 * 60)  # Wait 6 minutes

    print("\n--- Popularity (Second Call) ---")
    resp = requests.get(f"{BASE_URL}/popularity")
    pop_data_2 = resp.json()
    print("Popularity:", pop_data_2)

    print("=== DEMO SCRIPT FINISHED ===")


if __name__ == "__main__":
    main()
