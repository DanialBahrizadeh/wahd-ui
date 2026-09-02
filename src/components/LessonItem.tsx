import { useState } from "react";
import { MdAdd, MdCheck, MdContentCopy, MdErrorOutline } from "react-icons/md";
import { useLessonContext } from "../contexts/LessonContext";
import type { Lesson } from "../types/lesson";
import { getLessonConflictReason } from "../utils/lessonConfilicting";

type LessonItemProps = Lesson & {
  detailsId?: string;
  previewLesson?: Lesson;
  updated?: boolean;
  updateConflicts?: boolean;
};

export default function LessonItem({ detailsId = "active-lesson-details", previewLesson, updated = false, updateConflicts = false, ...lesson }: LessonItemProps) {
  const { lessonsId, setLessons, setHoveredLesson, lessons } = useLessonContext();
  const [copied, setCopied] = useState(false);
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

  const copyLessonCode = async () => {
    try {
      await navigator.clipboard.writeText(lesson.lessonId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return <article
    className={`lesson-card${selected ? " selected" : ""}${conflicting ? " conflicting" : ""}${updated ? " has-update" : ""}${updateConflicts ? " has-conflicting-update" : ""}`}
    onMouseEnter={() => setHoveredLesson(previewLesson ?? lesson)} onMouseLeave={() => setHoveredLesson(null)}
    onFocus={() => setHoveredLesson(previewLesson ?? lesson)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setHoveredLesson(null); }}
  >
    <button
      type="button"
      className="lesson-card-button"
      onClick={toggleLesson}
      aria-disabled={conflicting}
      aria-pressed={selected}
      aria-describedby={detailsId}
    >
      <span className="lesson-card-main"><strong>{lesson.lessonName}</strong><span>{lesson.teacher || "استاد اعلام نشده"}</span></span>
      <span className="lesson-state-icon" aria-hidden="true">{selected ? <MdCheck /> : conflicting ? <MdErrorOutline /> : <MdAdd />}</span>
      <span className="lesson-card-meta"><span dir="ltr">{lesson.lessonId}</span><span>{lesson.credits} واحد</span><span className="state-label">{updated ? "زمان‌بندی جدید" : stateLabel}</span></span>
    </button>
    <button type="button" className="copy-lesson-code" onClick={() => void copyLessonCode()} aria-label={`کپی کد درس ${lesson.lessonName}`} title="کپی کد درس">
      {copied ? <MdCheck aria-hidden="true" /> : <MdContentCopy aria-hidden="true" />}
      <span aria-live="polite">{copied ? "کپی شد" : "کپی کد"}</span>
    </button>
  </article>;
}
