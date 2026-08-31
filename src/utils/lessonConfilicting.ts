import type { Lesson, Schedule } from "../types/lesson";

const isscheduleConfilict = (
  firstSchedule: Schedule,
  secondSchedule: Schedule,
): boolean => {
  if (firstSchedule.day !== secondSchedule.day) return false;

  // if secondSchedule start after the firstSchedule or end before the firstSchedule start
  if (
    secondSchedule.start >= firstSchedule.end ||
    secondSchedule.end <= firstSchedule.start
  )
    return false;

  return true;
};

export const isLessonConflicting = (
  lesson: Lesson,
  lessons: Lesson[],
): boolean => {
  //if examDate conflict
  if (lessons.some((l) => l.examDate === lesson.examDate)) return true;

  // if classTime conflict
  return lesson.classTime.some((schedule) =>
    lessons.some((l) =>
      l.classTime.some((s) => isscheduleConfilict(s, schedule)),
    ),
  );
};

export type LessonConflictReason = "exam" | "schedule" | null;

/** Presentation helper; it intentionally follows the existing conflict rules. */
export const getLessonConflictReason = (
  lesson: Lesson,
  lessons: Lesson[],
): LessonConflictReason => {
  if (lessons.some((selected) => selected.examDate === lesson.examDate))
    return "exam";
  if (
    lesson.classTime.some((schedule) =>
      lessons.some((selected) =>
        selected.classTime.some((selectedSchedule) =>
          isscheduleConfilict(selectedSchedule, schedule),
        ),
      ),
    )
  )
    return "schedule";
  return null;
};
