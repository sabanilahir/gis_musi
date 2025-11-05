import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  title = 'Apakah anda yakin ingin menghapus titik?',
  message = '* Data yang sudah dihapus tidak dapat dikembalikan',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[420px] rounded-2xl bg-white p-8 shadow-xl text-center">
        {/* 🔺 Icon Warning */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>

        {/* 🧾 Title & Message */}
        <h2 className="mb-2 text-lg font-semibold text-gray-800">
          {title}
        </h2>
        <p className="text-sm text-red-500">{message}</p>

        {/* 🔘 Buttons */}
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg bg-red-500 px-6 py-2 text-sm font-medium text-white shadow hover:bg-red-600 transition"
          >
            Batalkan
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-blue-900 px-6 py-2 text-sm font-medium text-white shadow hover:bg-blue-800 transition"
          >
            Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
