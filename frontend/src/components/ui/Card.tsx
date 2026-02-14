interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-sm p-4
        ${onClick ? 'cursor-pointer active:bg-gray-50 transition-colors duration-150' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
