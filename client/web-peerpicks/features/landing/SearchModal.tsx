'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <div className="relative w-full max-w-md rounded-xl bg-white p-6">
            <button onClick={onClose} className="absolute right-4 top-4">
              <X />
            </button>
            <input
              className="w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-green-500"
              placeholder="Search for places, categories..."
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
