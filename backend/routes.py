from datetime import datetime, timezone
import os
import time
from typing import List, Optional
from beanie import PydanticObjectId
import cloudinary
import cloudinary.utils
from clerk_backend_api import Clerk
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from livekit.api import AccessToken, VideoGrants
from nanoid import generate
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address

from models import Community, Conversation, Message, Notification, Room, User

router = APIRouter()
security = HTTPBearer()

limiter = Limiter(key_func=get_remote_address)


# --- AUTH DEPENDENCY ---
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> User:
    token = credentials.credentials
    clerk_secret = os.getenv("CLERK_SECRET_KEY", "sk_test_placeholder")

    if clerk_secret == "sk_test_placeholder" or not clerk_secret.startswith("sk_"):
        # Dev / Mock Mode: token string is treated directly as clerk_id
        clerk_id = token
    else:
        try:
            clerk = Clerk(bearer_auth=clerk_secret)
            clerk_id = token
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Invalid Clerk token: {str(e)}")

    user = await User.find_one(User.clerk_id == clerk_id)
    if not user:
        # Auto-create dev user if not synced yet
        user = User(
            clerk_id=clerk_id,
            username=f"user_{clerk_id[:8]}",
            email=f"{clerk_id[:8]}@kite.app",
            status="online",
        )
        await user.insert()
    return user


# --- SCHEMAS ---
class AuthSyncRequest(BaseModel):
    clerk_id: str
    username: str
    email: str
    avatar_url: str = ""


class ProfileUpdateRequest(BaseModel):
    username: Optional[str] = None
    bio: Optional[str] = None
    status: Optional[str] = None
    avatar_url: Optional[str] = None


class CreateRoomRequest(BaseModel):
    name: str
    description: str = ""
    is_voice_enabled: bool = False


class SendMessageRequest(BaseModel):
    content: str
    type: str = "text"
    attachments: List[str] = []


class EditMessageRequest(BaseModel):
    content: str


class ReactionRequest(BaseModel):
    emoji: str


class CreateCommunityRequest(BaseModel):
    name: str
    category: str
    description: str = ""
    banner_url: str = ""


# --- PHASE 1 ROUTES ---
@router.post("/auth", tags=["Auth"])
@limiter.limit("10/minute")
async def sync_auth(request: Request, body: AuthSyncRequest):
    user = await User.find_one(User.clerk_id == body.clerk_id)
    if user:
        user.username = body.username
        user.email = body.email
        if body.avatar_url:
            user.avatar_url = body.avatar_url
        user.status = "online"
        await user.save()
    else:
        user = User(
            clerk_id=body.clerk_id,
            username=body.username,
            email=body.email,
            avatar_url=body.avatar_url,
            status="online",
        )
        await user.insert()
    return {"status": "synced", "user": user}


@router.get("/me", response_model=User, tags=["Users"])
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=User, tags=["Users"])
async def update_my_profile(
    body: ProfileUpdateRequest, current_user: User = Depends(get_current_user)
):
    if body.username is not None:
        current_user.username = body.username
    if body.bio is not None:
        current_user.bio = body.bio
    if body.status is not None:
        current_user.status = body.status
    if body.avatar_url is not None:
        current_user.avatar_url = body.avatar_url
    await current_user.save()
    return current_user


@router.get("/users/{user_id}", response_model=User, tags=["Users"])
async def get_user_by_id(user_id: str):
    user = await User.find_one(User.clerk_id == user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/rooms", response_model=List[Room], tags=["Rooms"])
async def list_my_rooms(current_user: User = Depends(get_current_user)):
    all_rooms = await Room.find().to_list()
    return [r for r in all_rooms if current_user.clerk_id in r.members]


@router.post("/rooms", response_model=Room, tags=["Rooms"])
@limiter.limit("20/minute")
async def create_room(
    request: Request,
    body: CreateRoomRequest,
    current_user: User = Depends(get_current_user),
):
    code = generate(size=8, alphabet="1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
    room = Room(
        name=body.name,
        description=body.description,
        owner_id=current_user.clerk_id,
        invite_code=code,
        members=[current_user.clerk_id],
        is_voice_enabled=body.is_voice_enabled,
    )
    await room.insert()
    return room


@router.get("/rooms/{room_id}", response_model=Room, tags=["Rooms"])
async def get_room(room_id: str, current_user: User = Depends(get_current_user)):
    room = await Room.get(PydanticObjectId(room_id))
    if not room or current_user.clerk_id not in room.members:
        raise HTTPException(status_code=404, detail="Room not found or unauthorized")
    return room


@router.delete("/rooms/{room_id}", tags=["Rooms"])
async def delete_room(room_id: str, current_user: User = Depends(get_current_user)):
    room = await Room.get(PydanticObjectId(room_id))
    if not room or room.owner_id != current_user.clerk_id:
        raise HTTPException(status_code=403, detail="Only room owner can delete room")
    await room.delete()
    return {"status": "deleted"}


@router.post("/rooms/join/{code}", response_model=Room, tags=["Rooms"])
@limiter.limit("15/minute")
async def join_room_by_code(
    request: Request, code: str, current_user: User = Depends(get_current_user)
):
    room = await Room.find_one(Room.invite_code == code)
    if not room:
        raise HTTPException(status_code=404, detail="Invalid room invite code")
    if current_user.clerk_id not in room.members:
        room.members.append(current_user.clerk_id)
        await room.save()
    return room


# --- PHASE 2 ROUTES ---
@router.get("/dms", response_model=List[Conversation], tags=["DMs"])
async def list_my_dms(current_user: User = Depends(get_current_user)):
    all_dms = await Conversation.find().to_list()
    return [c for c in all_dms if current_user.clerk_id in c.participants]


@router.post("/dms/{target_id}", response_model=Conversation, tags=["DMs"])
async def start_or_get_dm(target_id: str, current_user: User = Depends(get_current_user)):
    if target_id == current_user.clerk_id:
        raise HTTPException(status_code=400, detail="Cannot start DM with yourself")
    target = await User.find_one(User.clerk_id == target_id)
    if not target:
        raise HTTPException(status_code=404, detail="Target user not found")

    all_dms = await Conversation.find().to_list()
    for dm in all_dms:
        if current_user.clerk_id in dm.participants and target_id in dm.participants:
            return dm

    dm = Conversation(participants=[current_user.clerk_id, target_id])
    await dm.insert()
    return dm


@router.get("/messages/{target_id}", response_model=List[Message], tags=["Messages"])
async def get_chat_history(
    target_id: str,
    limit: int = Query(50, le=100),
    current_user: User = Depends(get_current_user),
):
    messages = await Message.find(
        {"$or": [{"room_id": target_id}, {"conversation_id": target_id}]}
    ).sort(-Message.created_at).limit(limit).to_list()
    return messages[::-1]


@router.post("/messages/{target_id}", response_model=Message, tags=["Messages"])
@limiter.limit("60/minute")
async def send_message(
    request: Request,
    target_id: str,
    body: SendMessageRequest,
    current_user: User = Depends(get_current_user),
):
    is_room = bool(await Room.get(PydanticObjectId(target_id))) if len(target_id) == 24 else False
    msg = Message(
        room_id=target_id if is_room else None,
        conversation_id=target_id if not is_room else None,
        sender_id=current_user.clerk_id,
        content=body.content,
        type=body.type,
        attachments=body.attachments,
    )
    await msg.insert()
    if not is_room:
        dm = await Conversation.get(PydanticObjectId(target_id)) if len(target_id) == 24 else None
        if dm:
            dm.last_message_at = datetime.now(timezone.utc)
            await dm.save()
    return msg


@router.patch("/messages/{msg_id}", response_model=Message, tags=["Messages"])
async def edit_message(
    msg_id: str, body: EditMessageRequest, current_user: User = Depends(get_current_user)
):
    msg = await Message.get(PydanticObjectId(msg_id))
    if not msg or msg.sender_id != current_user.clerk_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    msg.content = body.content
    msg.edited_at = datetime.now(timezone.utc)
    await msg.save()
    return msg


@router.delete("/messages/{msg_id}", tags=["Messages"])
async def delete_message(msg_id: str, current_user: User = Depends(get_current_user)):
    msg = await Message.get(PydanticObjectId(msg_id))
    if not msg or msg.sender_id != current_user.clerk_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    msg.deleted = True
    msg.content = "This message was deleted."
    await msg.save()
    return {"status": "deleted"}


# --- PHASE 3 ROUTES ---
@router.post("/messages/{msg_id}/react", tags=["Reactions"])
async def toggle_reaction(
    msg_id: str, body: ReactionRequest, current_user: User = Depends(get_current_user)
):
    msg = await Message.get(PydanticObjectId(msg_id))
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    users_list = msg.reactions.get(body.emoji, [])
    if current_user.clerk_id in users_list:
        users_list.remove(current_user.clerk_id)
    else:
        users_list.append(current_user.clerk_id)

    if users_list:
        msg.reactions[body.emoji] = users_list
    elif body.emoji in msg.reactions:
        del msg.reactions[body.emoji]

    await msg.save()
    return {"reactions": msg.reactions}


@router.post("/files/upload-url", tags=["Media"])
async def get_presigned_upload_url(
    filename: str = Query(...), current_user: User = Depends(get_current_user)
):
    cloudinary_url = os.getenv("CLOUDINARY_URL", "")
    if not cloudinary_url or "placeholder" in cloudinary_url:
        return {
            "upload_url": f"https://media.kite.app/upload/{current_user.clerk_id}/{filename}",
            "public_url": f"https://media.kite.app/{current_user.clerk_id}/{filename}",
            "provider": "mock",
        }

    try:
        auth, cn = cloudinary_url.replace("cloudinary://", "").split("@")
        api_key, api_secret = auth.split(":")
        cloudinary.config(cloud_name=cn, api_key=api_key, api_secret=api_secret)

        timestamp = int(time.time())
        folder = f"kite/{current_user.clerk_id}"
        params_to_sign = {"timestamp": timestamp, "folder": folder}
        signature = cloudinary.utils.api_sign_request(params_to_sign, api_secret)

        return {
            "upload_url": f"https://api.cloudinary.com/v1_1/{cn}/auto/upload",
            "api_key": api_key,
            "timestamp": timestamp,
            "signature": signature,
            "folder": folder,
            "provider": "cloudinary",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary error: {str(e)}")


@router.get("/search", response_model=List[Message], tags=["Search"])
async def search_messages(
    query: str = Query(..., min_length=2),
    target_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    filter_dict = {"content": {"$regex": query, "$options": "i"}, "deleted": False}
    if target_id:
        filter_dict["$or"] = [{"room_id": target_id}, {"conversation_id": target_id}]
    return await Message.find(filter_dict).limit(25).to_list()


@router.post("/voice/token", tags=["Voice"])
async def get_livekit_token(
    room_id: str = Query(...), current_user: User = Depends(get_current_user)
):
    api_key = os.getenv("LIVEKIT_API_KEY", "placeholder_api_key")
    api_secret = os.getenv("LIVEKIT_API_SECRET", "placeholder_api_secret")
    livekit_url = os.getenv("LIVEKIT_URL", "wss://placeholder.livekit.cloud")

    if api_key == "placeholder_api_key" or not api_secret:
        return {
            "token": f"mock_livekit_token_{room_id}_{current_user.clerk_id}",
            "url": livekit_url,
        }

    try:
        grant = VideoGrants(room_join=True, room=room_id)
        token = (
            AccessToken(api_key, api_secret)
            .with_identity(current_user.clerk_id)
            .with_name(current_user.username)
            .with_grants(grant)
            .to_jwt()
        )
        return {"token": token, "url": livekit_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LiveKit token error: {str(e)}")


@router.get("/communities", response_model=List[Community], tags=["Communities"])
async def discover_communities():
    all_comms = await Community.find().to_list()
    return [c for c in all_comms if c.is_public]


@router.post("/communities", response_model=Community, tags=["Communities"])
async def create_community(
    body: CreateCommunityRequest, current_user: User = Depends(get_current_user)
):
    community = Community(
        name=body.name,
        category=body.category,
        description=body.description,
        banner_url=body.banner_url,
        owner_id=current_user.clerk_id,
        members=[current_user.clerk_id],
    )
    await community.insert()
    return community
