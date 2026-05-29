type StatPillProps = {
  label: string;
  value: string | number;
};

export function StatPill({ label, value }: StatPillProps) {
  return (
    <div className="rounded-full border border-ink/10 bg-white px-3 py-2 text-sm shadow-sm">
      <span className="text-ink/55">{label}</span>
      <span className="ml-2 font-bold text-ink">{value}</span>
    </div>
  );
}
