import asyncio
import json
import os
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from upstash_redis import Redis

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        # target_id -> list of active WebSocket instances
        self.active_connections: dict[str, list[WebSocket]] = {}
        # Try connecting to Upstash Redis if configured
        url = os.getenv("UPSTASH_REDIS_REST_URL", "")
        token = os.getenv("UPSTASH_REDIS_REST_TOKEN", "")
        if url and not url.startswith("https://placeholder"):
            try:
                self.redis = Redis(url=url, token=token)
            except Exception:
                self.redis = None
        else:
            self.redis = None

    async def connect(self, websocket: WebSocket, target_id: str, user_id: str):
        await websocket.accept()
        if target_id not in self.active_connections:
            self.active_connections[target_id] = []
        self.active_connections[target_id].append(websocket)

        # Notify others in room
        await self.broadcast(target_id, {
            "event": "presence.online",
            "user_id": user_id
        })

        # Set Redis presence key with 60s TTL if Redis available
        if self.redis:
            try:
                self.redis.set(f"kite:presence:{user_id}", "online", ex=60)
            except Exception:
                pass

    def disconnect(self, websocket: WebSocket, target_id: str, user_id: str):
        if target_id in self.active_connections:
            if websocket in self.active_connections[target_id]:
                self.active_connections[target_id].remove(websocket)
            if not self.active_connections[target_id]:
                del self.active_connections[target_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, target_id: str, message: dict):
        if target_id in self.active_connections:
            data = json.dumps(message)
            for connection in list(self.active_connections[target_id]):
                try:
                    await connection.send_text(data)
                except Exception:
                    pass


manager = ConnectionManager()


@router.websocket("/ws/{target_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    target_id: str,
    token: str = Query(...)
):
    # In mock/dev mode, token string is treated as user_id
    user_id = token
    await manager.connect(websocket, target_id, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            event_type = payload.get("event")

            if event_type == "msg.new":
                await manager.broadcast(target_id, payload)
            elif event_type in ("typing.start", "typing.stop"):
                payload["user_id"] = user_id
                await manager.broadcast(target_id, payload)
            elif event_type == "presence.ping":
                if manager.redis:
                    try:
                        manager.redis.set(f"kite:presence:{user_id}", "online", ex=60)
                    except Exception:
                        pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, target_id, user_id)
        await manager.broadcast(target_id, {
            "event": "presence.offline",
            "user_id": user_id
        })
