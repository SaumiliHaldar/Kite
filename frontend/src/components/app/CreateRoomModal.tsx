import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description: string; is_voice_enabled: boolean }) => Promise<void>;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ open, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [voice, setVoice] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onCreate({ name: name.trim(), description: desc.trim(), is_voice_enabled: voice });
      setName(''); setDesc(''); setVoice(false);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1E2022] rounded-3xl shadow-2xl w-full max-w-md p-6 border border-[#E8DFF5] dark:border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Create a Room</h2>
              <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Room Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. design-reviews"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#D6EFC1] outline-none text-sm transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Description</label>
                <input
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="What's this room for?"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#D6EFC1] outline-none text-sm transition-colors"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setVoice((v) => !v)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${voice ? 'bg-[#D6EFC1]' : 'bg-gray-200 dark:bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${voice ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm font-medium">Enable Voice Chat</span>
              </label>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full py-3 rounded-xl bg-[#D6EFC1] hover:bg-[#bde4a1] text-[#1E2022] font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
