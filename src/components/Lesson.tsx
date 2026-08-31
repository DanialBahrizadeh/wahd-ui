type LessonProps = {
  id: string; day: number; start: number; end: number; name: string; code: string;
  teacher?: string; setSelectedLessonId?: React.Dispatch<React.SetStateAction<string | null>>;
  ghost?: boolean; conflicting?: boolean;
};

export default function Lesson({ id, day, start, end, name, code, teacher, setSelectedLessonId, ghost, conflicting }: LessonProps) {
  const gridStart = Math.max(1, Math.round((start - 7) * 2) + 1);
  const gridEnd = Math.min(25, Math.round((end - 7) * 2) + 1);
  if (!Number.isFinite(day) || gridEnd <= gridStart) return null;

  return <button
    type="button"
    className={`calendar-lesson${ghost ? " ghost" : ""}${conflicting ? " conflict-preview" : ""}`}
    style={{ gridRow: day, gridColumn: `${gridStart}/${gridEnd}` }}
    onClick={() => setSelectedLessonId?.(id)}
    disabled={!setSelectedLessonId}
    aria-label={`${ghost ? "پیش‌نمایش " : ""}${name}، ${code}، از ساعت ${start} تا ${end}`}
  >
    <strong>{name}</strong>
    <span>{teacher || code}</span>
    {conflicting && <em>دارای تداخل</em>}
  </button>;
}
