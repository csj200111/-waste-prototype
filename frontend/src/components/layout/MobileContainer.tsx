interface MobileContainerProps {
  children: React.ReactNode;
}

export default function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="mx-auto min-h-screen max-w-[428px] bg-gray-50">
      {children}
    </div>
  );
}
