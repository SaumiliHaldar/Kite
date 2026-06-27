import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKiteAuth } from '../context/AuthContext';
import { IconRail, type NavSection } from '../components/app/IconRail';
import { DMList } from '../components/app/DMList';
import { RoomList } from '../components/app/RoomList';
import { CommunityList } from '../components/app/CommunityList';
import { ChatCanvas } from '../components/app/ChatCanvas';
import { CreateRoomModal } from '../components/app/CreateRoomModal';
import { JoinRoomModal } from '../components/app/JoinRoomModal';
import { UserSearchModal } from '../components/app/UserSearchModal';
import { useRooms } from '../hooks/useRooms';
import { useDMs } from '../hooks/useDMs';
import { listCommunities, type KiteCommunity } from '../api';
import { Link2 } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user } = useKiteAuth();
  const myClerkId = user?.id ?? null;

  // ─── Navigation state ─────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState<NavSection>('dms');
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);

  // ─── Data hooks ───────────────────────────────────────────────────────────
  const { rooms, createRoom, joinRoom } = useRooms();
  const { dms, startDM } = useDMs(myClerkId);
  const [communities, setCommunities] = React.useState<KiteCommunity[]>([]);

  React.useEffect(() => {
    listCommunities().then(setCommunities).catch(console.error);
  }, []);

  // ─── Modals ───────────────────────────────────────────────────────────────
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  // ─── Derived active entities ──────────────────────────────────────────────
  const activeRoom = rooms.find((r) => r.id === activeTargetId) ?? null;
  const activeDM = dms.find((d) => d.id === activeTargetId) ?? null;

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleSectionChange = useCallback((section: NavSection) => {
    setActiveSection(section);
    setActiveTargetId(null); // Clear active target on section change
  }, []);

  const handleCreateRoom = useCallback(
    async (data: { name: string; description: string; is_voice_enabled: boolean }) => {
      const room = await createRoom(data);
      setActiveTargetId(room.id);
      setActiveSection('rooms');
    },
    [createRoom]
  );

  const handleJoinRoom = useCallback(
    async (code: string) => {
      const room = await joinRoom(code);
      setActiveTargetId(room.id);
      setActiveSection('rooms');
    },
    [joinRoom]
  );

  return (
    <div className="flex h-screen bg-[#FCF8F3] dark:bg-[#121316] text-[#1E2022] dark:text-[#F4F6F8] overflow-hidden font-sans">

      {/* Icon Rail */}
      <IconRail activeSection={activeSection} onSectionChange={handleSectionChange} />

      {/* Sidebar */}
      <motion.section
        key={activeSection}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.18 }}
        className="w-72 bg-white/70 dark:bg-[#18191d] border-r border-[#E8DFF5] dark:border-white/10 flex flex-col z-10 shrink-0"
      >
        {activeSection === 'dms' && (
          <DMList
            dms={dms}
            activeId={activeTargetId}
            myClerkId={myClerkId}
            onSelect={setActiveTargetId}
            onNewDM={() => setShowUserSearch(true)}
          />
        )}
        {activeSection === 'rooms' && (
          <RoomList
            rooms={rooms}
            activeId={activeTargetId}
            onSelect={setActiveTargetId}
            onCreateRoom={() => setShowCreateRoom(true)}
            onJoinRoom={() => setShowJoinRoom(true)}
          />
        )}
        {activeSection === 'communities' && (
          <CommunityList
            communities={communities}
            activeId={activeTargetId}
            onSelect={setActiveTargetId}
            onCreateCommunity={() => {
              // TODO: CreateCommunityModal
            }}
          />
        )}
      </motion.section>

      {/* Main Chat */}
      <ChatCanvas
        targetId={activeTargetId}
        myClerkId={myClerkId}
        room={activeRoom}
        dm={activeDM}
        onToggleDrawer={() => setShowDrawer((p) => !p)}
        onToggleSearch={() => {}}

        onVoiceCall={activeRoom?.is_voice_enabled ? () => {} : undefined}
      />

      {/* Right Drawer placeholder */}
      <AnimatePresence>
        {showDrawer && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white dark:bg-[#1E2022] border-l border-[#E8DFF5] dark:border-white/10 overflow-hidden shrink-0"
          >
            <div className="w-[260px] p-4">
              <p className="text-sm font-bold mb-2">
                {activeRoom ? 'Room Info' : activeDM ? 'User Info' : 'Info'}
              </p>
              {activeRoom && (
                <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                  <p><span className="font-semibold text-[#1E2022] dark:text-white">Name:</span> {activeRoom.name}</p>
                  {activeRoom.description && <p>{activeRoom.description}</p>}
                  <p><span className="font-semibold text-[#1E2022] dark:text-white">Members:</span> {activeRoom.members.length}</p>
                  <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 font-mono break-all">
                    <Link2 className="w-3 h-3 shrink-0 text-gray-400" />
                    {activeRoom.invite_code}
                  </div>
                </div>
              )}
              {activeDM?.otherUser && (
                <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                  <p className="font-semibold text-[#1E2022] dark:text-white">{activeDM.otherUser.username}</p>
                  {activeDM.otherUser.bio && <p>{activeDM.otherUser.bio}</p>}
                  <p className="capitalize">{activeDM.otherUser.status}</p>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Modals */}
      <UserSearchModal
        open={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onStartDM={async (clerkId) => {
          const dm = await startDM(clerkId);
          setActiveTargetId(dm.id);
          setActiveSection('dms');
        }}
      />
      <CreateRoomModal
        open={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
        onCreate={handleCreateRoom}
      />
      <JoinRoomModal
        open={showJoinRoom}
        onClose={() => setShowJoinRoom(false)}
        onJoin={handleJoinRoom}
      />
    </div>
  );
};
