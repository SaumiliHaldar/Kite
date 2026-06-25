from datetime import datetime, timezone
from typing import Dict, List, Optional
from beanie import Document
from pydantic import Field


class User(Document):
    clerk_id: str
    username: str
    email: str
    avatar_url: str = ""
    bio: str = ""
    status: str = "offline"  # online | idle | dnd | offline
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"


class Room(Document):
    name: str
    description: str = ""
    avatar_url: str = ""
    owner_id: str  # clerk_id
    invite_code: str  # 8-char nanoid
    members: List[str] = []  # list of clerk_ids
    is_voice_enabled: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "rooms"


class Conversation(Document):
    participants: List[str]  # exactly 2 clerk_ids
    last_message_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "conversations"


class Message(Document):
    room_id: Optional[str] = None
    conversation_id: Optional[str] = None
    sender_id: str  # clerk_id
    content: str
    type: str = "text"  # text | media | system
    attachments: List[str] = []
    reactions: Dict[str, List[str]] = {}  # emoji -> list of clerk_ids
    edited_at: Optional[datetime] = None
    deleted: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "messages"


class Community(Document):
    name: str
    category: str  # study | gaming | projects | social
    description: str = ""
    banner_url: str = ""
    owner_id: str  # clerk_id
    rooms: List[str] = []  # list of room string IDs
    members: List[str] = []  # list of clerk_ids
    is_public: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "communities"


class Notification(Document):
    user_id: str  # target clerk_id
    type: str  # mention | invite | reaction
    payload: dict = {}
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "notifications"
