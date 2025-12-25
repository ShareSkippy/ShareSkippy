// ============================================================================
// 6. WELCOME NOTIFICATION COMPONENT
// ============================================================================
/**
 * @path /components/WelcomeNotification.tsx
 */
interface WelcomeNotificationProps {
  unreadCount: number;
  onViewMessages: () => void;
  onDismiss: () => void;
}

export function WelcomeNotification({
  unreadCount,
  onViewMessages,
  onDismiss,
}: WelcomeNotificationProps) {
  if (unreadCount === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-4 animate-scale-in">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600 mb-6">
            You have{' '}
            <span className="font-bold text-blue-600">
              {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </span>
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={onViewMessages}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View Messages
            </button>
            <button
              onClick={onDismiss}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
