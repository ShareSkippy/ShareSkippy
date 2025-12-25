// ============================================================================
// 4. NOTIFICATION BADGE COMPONENT
// ============================================================================
/**
 * @path /components/NotificationBadge.tsx
 */
interface NotificationBadgeProps {
  count: number;
  max?: number;
  className?: string;
}

export function NotificationBadge({ count, max = 99, className = '' }: NotificationBadgeProps) {
  if (count === 0) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <span
      className={`
        absolute -top-1 -right-1
        min-w-5 h-5
        flex items-center justify-center
        px-1.5
        bg-red-500 text-white
        text-xs font-bold
        rounded-full
        border-2 border-white
        animate-pulse
        ${className}
      `}
    >
      {displayCount}
    </span>
  );
}
