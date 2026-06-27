import { useState, useEffect, useCallback } from 'react';
import {
  listRooms,
  createRoom as apiCreate,
  joinRoomByCode as apiJoin,
  deleteRoom as apiDelete,
  type KiteRoom,
} from '../api';

export function useRooms() {
  const [rooms, setRooms] = useState<KiteRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRooms = useCallback(() => {
    setIsLoading(true);
    listRooms()
      .then(setRooms)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const createRoom = useCallback(
    async (data: { name: string; description?: string; is_voice_enabled?: boolean }) => {
      const room = await apiCreate(data);
      setRooms((prev) => [...prev, room]);
      return room;
    },
    []
  );

  const joinRoom = useCallback(async (code: string) => {
    const room = await apiJoin(code);
    setRooms((prev) => {
      const exists = prev.some((r) => r.id === room.id);
      return exists ? prev : [...prev, room];
    });
    return room;
  }, []);

  const deleteRoom = useCallback(async (roomId: string) => {
    await apiDelete(roomId);
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
  }, []);

  return { rooms, isLoading, createRoom, joinRoom, deleteRoom, refetch: fetchRooms };
}
