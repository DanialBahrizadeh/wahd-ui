import type { Lesson } from "../types/lesson";
type LessonProps = {
  id: string;
  day: number;
  start: number;
  end: number;
  name: string;
  code: string;
  setSelectedLessonId?: React.Dispatch<React.SetStateAction<string | null>>;
  ghost?: boolean;
};
export default function Lesson({
  id,
  day,
  start,
  end,
  name,
  code,
  setSelectedLessonId,
  ghost,
}: LessonProps) {
  return (
    <span
      className={`lesson ${ghost ? "ghost" : ""}`}
      style={{ gridRow: day, gridColumn: `${start}/${end}` }}
      onClick={() =>
        setSelectedLessonId &&
        setSelectedLessonId((prevSate) => (prevSate ? null : id))
      }
    >
      <span className="lesson-name">{name}</span>
      <span className="lesson-code">{code}</span>
    </span>
  );
}
