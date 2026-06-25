import asyncio
import json
import os
import urllib.request
import websockets
from pydantic import BaseModel

BASE_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000"
TOKEN = "test_user_alpha"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}


def make_request(method, endpoint, data=None, headers=None):
    url = f"{BASE_URL}{endpoint}"
    req_headers = headers or HEADERS
    payload = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=payload, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))


async def test_api_suite():
    print("Starting Complete Kite API Integration Verification Suite...\n")
    results = {}

    # 1. Health Check
    status, res = make_request("GET", "/", headers={})
    results["Health Check [/]"] = status == 200

    # 2. Auth Sync
    status, res = make_request("POST", "/auth", {
        "clerk_id": TOKEN,
        "username": "AlphaTester",
        "email": "alpha@kite.app",
        "avatar_url": "https://media.kite.app/alpha.png"
    })
    results["Auth Sync [POST /auth]"] = status == 200

    # 3. Get Profile
    status, res = make_request("GET", "/me")
    results["Get Profile [GET /me]"] = status == 200 and res.get("username") == "AlphaTester"

    # 4. Update Profile
    status, res = make_request("PATCH", "/me", {"bio": "Verified by Automated Suite"})
    results["Update Profile [PATCH /me]"] = status == 200 and res.get("bio") == "Verified by Automated Suite"

    # 5. User Lookup
    status, res = make_request("GET", f"/users/{TOKEN}")
    results["User Lookup [GET /users/{id}]"] = status == 200

    # 6. Create Room
    status, room = make_request("POST", "/rooms", {
        "name": "Integration Hub",
        "description": "Testing room suite",
        "is_voice_enabled": True
    })
    room_id = room.get("_id")
    invite_code = room.get("invite_code")
    results["Create Room [POST /rooms]"] = status == 200 and bool(room_id)

    # 7. List Rooms
    status, rooms = make_request("GET", "/rooms")
    results["List Rooms [GET /rooms]"] = status == 200 and len(rooms) > 0

    # 8. Get Room Details
    status, res = make_request("GET", f"/rooms/{room_id}")
    results["Room Details [GET /rooms/{id}]"] = status == 200

    # 9. Join Room (using Beta user)
    beta_headers = {"Authorization": "Bearer test_user_beta", "Content-Type": "application/json"}
    status, res = make_request("POST", f"/rooms/join/{invite_code}", headers=beta_headers)
    results["Join Room [POST /rooms/join/{code}]"] = status == 200

    # 10. DMs
    status, dm = make_request("POST", "/dms/test_user_beta")
    dm_id = dm.get("_id")
    results["Start DM [POST /dms/{target}]"] = status == 200 and bool(dm_id)

    status, dms = make_request("GET", "/dms")
    results["List DMs [GET /dms]"] = status == 200 and len(dms) > 0

    # 11. Send Message
    status, msg = make_request("POST", f"/messages/{room_id}", {"content": "Hello Kite World!", "type": "text"})
    msg_id = msg.get("_id")
    results["Send Message [POST /messages/{target}]"] = status == 200 and bool(msg_id)

    # 12. Chat History
    status, history = make_request("GET", f"/messages/{room_id}")
    results["Fetch History [GET /messages/{target}]"] = status == 200 and len(history) > 0

    # 13. Edit Message
    status, res = make_request("PATCH", f"/messages/{msg_id}", {"content": "Hello Edited Kite World!"})
    results["Edit Message [PATCH /messages/{id}]"] = status == 200 and res.get("content") == "Hello Edited Kite World!"

    # 14. Reactions
    status, res = make_request("POST", f"/messages/{msg_id}/react", {"emoji": "heart"})
    results["Toggle Reaction [POST /messages/{id}/react]"] = status == 200 and "heart" in res.get("reactions", {})

    # 15. File Presign
    status, res = make_request("POST", "/files/upload-url?filename=avatar.png")
    results["File Presign [POST /files/upload-url]"] = status == 200 and bool(res.get("upload_url"))

    # 16. Search
    status, search_res = make_request("GET", "/search?query=Edited")
    results["Instant Search [GET /search]"] = status == 200 and len(search_res) > 0

    # 17. Voice Token
    status, res = make_request("POST", f"/voice/token?room_id={room_id}")
    results["Voice Token [POST /voice/token]"] = status == 200 and bool(res.get("token"))

    # 18. Communities
    status, comm = make_request("POST", "/communities", {
        "name": "Global Developers",
        "category": "projects",
        "description": "Public community test"
    })
    comm_id = comm.get("_id")
    results["Create Community [POST /communities]"] = status == 200 and bool(comm_id)

    status, comms = make_request("GET", "/communities")
    results["List Communities [GET /communities]"] = status == 200 and len(comms) > 0

    # 19. Delete Message
    status, res = make_request("DELETE", f"/messages/{msg_id}")
    results["Delete Message [DELETE /messages/{id}]"] = status == 200

    # 20. Delete Room
    status, res = make_request("DELETE", f"/rooms/{room_id}")
    results["Delete Room [DELETE /rooms/{id}]"] = status == 200

    # 21. WebSocket Real-Time Stream
    try:
        ws_uri = f"{WS_URL}/ws/test_stream_room?token={TOKEN}"
        async with websockets.connect(ws_uri) as ws:
            # Receive presence online event
            data = json.loads(await ws.recv())
            ws_success = data.get("event") == "presence.online"
            # Broadcast test
            await ws.send(json.dumps({"event": "typing.start"}))
            echo = json.loads(await ws.recv())
            ws_success = ws_success and echo.get("event") == "typing.start"
            results["WebSocket Stream [WS /ws/{target}]"] = ws_success
    except Exception as e:
        print(f"WS Error Details: {type(e).__name__}: {e}")
        results["WebSocket Stream [WS /ws/{target}]"] = False

    # PRINT SCORECARD
    print("="*60)
    print("               KITE API VERIFICATION SCORECARD")
    print("="*60)
    passed_count = 0
    for name, passed in results.items():
        icon = "PASS" if passed else "FAIL"
        if passed: passed_count += 1
        print(f"[{icon}]  {name}")
    print("="*60)
    print(f"TOTAL RESULT: {passed_count}/{len(results)} TESTS PASSED ({passed_count/len(results)*100:.1f}%)")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(test_api_suite())
