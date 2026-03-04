import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/stores/useNotificationStore';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showNotification?: boolean;
  showMore?: boolean;
  onMore?: () => void;
  rightContent?: React.ReactNode;
}

export default function Header({
  title,
  showBack = false,
  onBack,
  showNotification = false,
  showMore = false,
  onMore,
  rightContent,
}: HeaderProps) {
  const navigate = useNavigate();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 mx-auto flex h-14 max-w-[428px] items-center bg-white border-b border-gray-200 px-4">
      {showBack && (
        <button
          type="button"
          onClick={handleBack}
          className="mr-2 flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-150"
        >
          <svg
            className="h-6 w-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}
      <h1 className="flex-1 text-lg font-semibold text-gray-900 truncate">{title}</h1>
      <div className="flex items-center gap-1">
        {rightContent}
        {showMore && (
          <button
            type="button"
            onClick={onMore}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-150"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
            </svg>
          </button>
        )}
        {showNotification && (
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-150"
          >
            <svg
              className="h-6 w-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
