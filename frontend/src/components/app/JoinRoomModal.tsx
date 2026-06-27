import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hash } from 'lucide-react';

interface JoinRoomModalProps {
  open: boolean;
  onClose: () => void;
  onJoin: (code: string) => Promise<void>;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ open, onClose, onJoin }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      await onJoin(code.trim());
      setCode('');
      onClose();
    } catch {
      setError('Invalid invite code. Double-check and try again.');
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
            className="bg-white dark:bg-[#1E2022] rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-[#E8DFF5] dark:border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Join a Room</h2>
              <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Invite Code</label>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent focus-within:border-[#D6EFC1] transition-colors">
                  <Hash className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\s/g, ''))}
                    placeholder="e.g. x8K9mP2q"
                    maxLength={8}
                    className="bg-transparent border-none outline-none text-sm w-full font-mono"
                    required
                  />
                </div>
                {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
              </div>
              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full py-3 rounded-xl bg-[#D6EFC1] hover:bg-[#bde4a1] text-[#1E2022] font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Joining...' : 'Join Room'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
