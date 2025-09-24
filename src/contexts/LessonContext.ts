import React, { createContext, useContext } from "react";
import type { Lesson } from "../types/lesson";

type LessonContextType = {
  lessons: Lesson[];
  setLessons: React.Dispatch<React.SetStateAction<Lesson[]>>;
  lessonsId: Set<string>;
  setLessonsId: React.Dispatch<React.SetStateAction<Set<string>>>;
  hoveredLesson: Lesson | null;
  setHoveredLesson: React.Dispatch<React.SetStateAction<Lesson | null>>;
};
export const lessonContext = createContext<LessonContextType>(
  {} as LessonContextType,
);
export const useLessonContext = () => useContext(lessonContext);
