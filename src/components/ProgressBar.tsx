interface ProgressBarProps {
  value: number; // 0 - 100
  className?: string;
  barClassName?: string;
  label?: string;
}

export default function ProgressBar({ value, className = "", barClassName = "", label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/80">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ${barClassName}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {label !== undefined && (
        <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-500">{label}</span>
      )}
    </div>
  );
}
