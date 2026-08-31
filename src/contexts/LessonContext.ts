import React, { createContext, useContext } from "react";
import type { Lesson } from "../types/lesson";

export type SavedPlan = { id: string; name: string; lessons: Lesson[] };

type LessonContextType = {
  lessons: Lesson[];
  setLessons: React.Dispatch<React.SetStateAction<Lesson[]>>;
  lessonsId: Set<string>;
  plans: SavedPlan[];
  activePlanId: string;
  setActivePlanId: (id: string) => void;
  createPlan: () => void;
  removePlan: (id: string) => void;
  hoveredLesson: Lesson | null;
  setHoveredLesson: React.Dispatch<React.SetStateAction<Lesson | null>>;
};
export const lessonContext = createContext<LessonContextType>(
  {} as LessonContextType,
);
export const useLessonContext = () => useContext(lessonContext);
