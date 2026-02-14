import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function Header({
  title,
  showBack = false,
  onBack,
}: HeaderProps) {
  const navigate = useNavigate();

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
      <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
    </header>
  );
}
