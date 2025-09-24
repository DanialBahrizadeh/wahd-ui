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
