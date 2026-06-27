import { api } from '../context/AuthContext';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KiteUser {
  id: string;
  clerk_id: string;
  username: string;
  email: string;
  avatar_url: string;
  bio: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  created_at: string;
}

export interface KiteRoom {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  owner_id: string;
  invite_code: string;
  members: string[];
  is_voice_enabled: boolean;
  created_at: string;
}

export interface KiteConversation {
  id: string;
  participants: string[];
  last_message_at: string;
  created_at: string;
}

export interface KiteMessage {
  id: string;
  room_id: string | null;
  conversation_id: string | null;
  sender_id: string;
  content: string;
  type: 'text' | 'media' | 'system';
  attachments: string[];
  reactions: Record<string, string[]>;
  edited_at: string | null;
  deleted: boolean;
  created_at: string;
}

export interface KiteCommunity {
  id: string;
  name: string;
  category: 'study' | 'gaming' | 'projects' | 'social';
  description: string;
  banner_url: string;
  owner_id: string;
  rooms: string[];
  members: string[];
  is_public: boolean;
  created_at: string;
}

// ─── Normalizer ──────────────────────────────────────────────────────────────
// Beanie/MongoDB returns `_id` (sometimes as an object). We normalize every
// response so `id` is always a plain string, making component comparisons work.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize<T>(obj: any): T {
  if (!obj) return obj;
  const raw = obj._id ?? obj.id;
  const id = raw && typeof raw === 'object' ? String(raw) : (raw ?? '');
  return { ...obj, id } as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeList<T>(arr: any[]): T[] {
  return Array.isArray(arr) ? arr.map((item) => normalize<T>(item)) : [];
}

// ─── Users ───────────────────────────────────────────────────────────────────

export const getMe = () =>
  api.get<KiteUser>('/me').then((r) => normalize<KiteUser>(r.data));

export const updateMe = (data: {
  username?: string;
  bio?: string;
  status?: string;
  avatar_url?: string;
}) => api.patch<KiteUser>('/me', data).then((r) => normalize<KiteUser>(r.data));

export const getUserById = (userId: string) =>
  api.get<KiteUser>(`/users/${userId}`).then((r) => normalize<KiteUser>(r.data));

export const searchUsers = (query: string) =>
  api.get<KiteUser[]>('/users/search', { params: { query } })
    .then((r) => normalizeList<KiteUser>(r.data));


// ─── Rooms ───────────────────────────────────────────────────────────────────

export const listRooms = () =>
  api.get<KiteRoom[]>('/rooms').then((r) => normalizeList<KiteRoom>(r.data));

export const createRoom = (data: {
  name: string;
  description?: string;
  is_voice_enabled?: boolean;
}) => api.post<KiteRoom>('/rooms', data).then((r) => normalize<KiteRoom>(r.data));

export const getRoom = (roomId: string) =>
  api.get<KiteRoom>(`/rooms/${roomId}`).then((r) => normalize<KiteRoom>(r.data));

export const deleteRoom = (roomId: string) =>
  api.delete(`/rooms/${roomId}`).then((r) => r.data);

export const joinRoomByCode = (code: string) =>
  api.post<KiteRoom>(`/rooms/join/${code}`).then((r) => normalize<KiteRoom>(r.data));

// ─── DMs ─────────────────────────────────────────────────────────────────────

export const listDMs = () =>
  api.get<KiteConversation[]>('/dms').then((r) => normalizeList<KiteConversation>(r.data));

export const startDM = (targetId: string) =>
  api.post<KiteConversation>(`/dms/${targetId}`).then((r) => normalize<KiteConversation>(r.data));

// ─── Messages ────────────────────────────────────────────────────────────────

export const getMessages = (targetId: string, limit = 50) =>
  api
    .get<KiteMessage[]>(`/messages/${targetId}`, { params: { limit } })
    .then((r) => normalizeList<KiteMessage>(r.data));

export const sendMessage = (
  targetId: string,
  data: { content: string; type?: string; attachments?: string[] }
) => api.post<KiteMessage>(`/messages/${targetId}`, data).then((r) => normalize<KiteMessage>(r.data));

export const editMessage = (msgId: string, content: string) =>
  api.patch<KiteMessage>(`/messages/${msgId}`, { content }).then((r) => normalize<KiteMessage>(r.data));

export const deleteMessage = (msgId: string) =>
  api.delete(`/messages/${msgId}`).then((r) => r.data);

// ─── Reactions ───────────────────────────────────────────────────────────────

export const toggleReaction = (msgId: string, emoji: string) =>
  api
    .post<{ reactions: Record<string, string[]> }>(`/messages/${msgId}/react`, { emoji })
    .then((r) => r.data);

// ─── Search ──────────────────────────────────────────────────────────────────

export const searchMessages = (query: string, targetId?: string) =>
  api
    .get<KiteMessage[]>('/search', { params: { query, target_id: targetId } })
    .then((r) => normalizeList<KiteMessage>(r.data));

// ─── Media ───────────────────────────────────────────────────────────────────

export const getUploadUrl = (filename: string) =>
  api
    .post<{
      upload_url: string;
      public_url?: string;
      api_key?: string;
      timestamp?: number;
      signature?: string;
      folder?: string;
      provider: string;
    }>(`/files/upload-url?filename=${encodeURIComponent(filename)}`)
    .then((r) => r.data);

// ─── Voice ───────────────────────────────────────────────────────────────────

export const getLiveKitToken = (roomId: string) =>
  api
    .post<{ token: string; url: string }>(`/voice/token?room_id=${roomId}`)
    .then((r) => r.data);

// ─── Communities ─────────────────────────────────────────────────────────────

export const listCommunities = () =>
  api.get<KiteCommunity[]>('/communities').then((r) => normalizeList<KiteCommunity>(r.data));

export const createCommunity = (data: {
  name: string;
  category: string;
  description?: string;
  banner_url?: string;
}) => api.post<KiteCommunity>('/communities', data).then((r) => normalize<KiteCommunity>(r.data));
