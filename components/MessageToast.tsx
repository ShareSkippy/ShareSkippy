import { useEffect } from 'react';
import Image from 'next/image';
// ============================================================================
// 5. TOAST NOTIFICATION COMPONENT
// ============================================================================
/**
 * @path /components/MessageToast.tsx
 */
interface MessageToastProps {
  senderName: string;
  message: string;
  profilePhoto?: string | null;
  onClose: () => void;
  onClick: () => void;
}

export function MessageToast({
  senderName,
  message,
  profilePhoto,
  onClose,
  onClick,
}: MessageToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="
        fixed top-4 right-4 z-50
        bg-white rounded-lg shadow-lg
        border border-gray-200
        p-4 max-w-sm
        cursor-pointer
        animate-slide-in-right
      "
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        {profilePhoto ? (
          <Image
            src={profilePhoto}
            alt={senderName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-linear-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
            {senderName[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{senderName}</p>
          <p className="text-sm text-gray-600 truncate">{message}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
