import { useState } from "react";
import { lessonContext } from "../contexts/LessonContext";
import type { Lesson } from "../types/lesson";
import { useLocalStorage } from "../hooks/localStorage";

export default function LessonProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lessons, setLessons] = useLocalStorage<Lesson[]>("lessons", []);
  const [lessonsId, setLessonsId] = useState<Set<string>>(
    new Set(lessons.map((l) => l.id)),
  );
  const [hoveredLesson, setHoveredLesson] = useState<Lesson | null>(null);

  return (
    <lessonContext.Provider
      value={{
        lessons,
        setLessons,
        lessonsId,
        setLessonsId,
        hoveredLesson,
        setHoveredLesson,
      }}
    >
      {children}
    </lessonContext.Provider>
  );
}
