import { MdAdd, MdCheck, MdErrorOutline } from "react-icons/md";
import { useLessonContext } from "../contexts/LessonContext";
import type { Lesson } from "../types/lesson";
import { getLessonConflictReason } from "../utils/lessonConfilicting";

export default function LessonItem(props: Lesson) {
  const { lessonsId, setLessons, setHoveredLesson, lessons } = useLessonContext();
  const lesson = props;
  const selected = lessonsId.has(lesson.id);
  const conflictReason = selected ? null : getLessonConflictReason(lesson, lessons);
  const conflicting = conflictReason !== null;
  const stateLabel = selected ? "انتخاب شده" : conflicting ? (conflictReason === "exam" ? "تداخل امتحان" : "تداخل زمانی") : "قابل انتخاب";

  const toggleLesson = () => {
    if (selected) {
      setLessons((current) => current.filter((item) => item.id !== lesson.id));
      return;
    }
    if (conflicting) return;
    setLessons((current) => [...current, lesson]);
  };

  return <article
    className={`lesson-card${selected ? " selected" : ""}${conflicting ? " conflicting" : ""}`}
    onMouseEnter={() => setHoveredLesson(lesson)} onMouseLeave={() => setHoveredLesson(null)}
    onFocus={() => setHoveredLesson(lesson)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setHoveredLesson(null); }}
  >
    <button
      type="button"
      className="lesson-card-button"
      onClick={toggleLesson}
      aria-disabled={conflicting}
      aria-pressed={selected}
      aria-describedby="active-lesson-details"
    >
      <span className="lesson-card-main"><strong>{lesson.lessonName}</strong><span>{lesson.teacher || "استاد اعلام نشده"}</span></span>
      <span className="lesson-state-icon" aria-hidden="true">{selected ? <MdCheck /> : conflicting ? <MdErrorOutline /> : <MdAdd />}</span>
      <span className="lesson-card-meta"><span dir="ltr">{lesson.lessonId}</span><span>{lesson.credits} واحد</span><span className="state-label">{stateLabel}</span></span>
    </button>
  </article>;
}
