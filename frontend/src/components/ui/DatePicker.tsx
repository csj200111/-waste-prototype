interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  error?: string;
}

export default function DatePicker({
  label,
  value,
  onChange,
  min,
  error,
}: DatePickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        className={`
          w-full rounded-lg border px-3 py-2.5 text-base min-h-[44px]
          outline-none transition-colors duration-150
          ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }
        `}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
