import { useMemo, useState } from "react";
import { lessonContext, type SavedPlan } from "../contexts/LessonContext";
import type { Lesson } from "../types/lesson";
import { useLocalStorage } from "../hooks/localStorage";

export default function LessonProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [plans, setPlans] = useLocalStorage<SavedPlan[]>(
    "lesson-plans",
    getInitialPlans(),
  );
  const [storedActivePlanId, setActivePlanId] = useLocalStorage<string>(
    "active-lesson-plan",
    plans[0].id,
  );
  const [hoveredLesson, setHoveredLesson] = useState<Lesson | null>(null);
  const activePlan = plans.find((plan) => plan.id === storedActivePlanId) ?? plans[0];
  const activePlanId = activePlan.id;
  const lessons = activePlan.lessons;
  const lessonsId = useMemo(
    () => new Set(lessons.map((lesson) => lesson.id)),
    [lessons],
  );

  const setLessons: React.Dispatch<React.SetStateAction<Lesson[]>> = (action) => {
    setPlans((current) =>
      current.map((plan) =>
        plan.id === activePlanId
          ? {
              ...plan,
              lessons:
                typeof action === "function" ? action(plan.lessons) : action,
            }
          : plan,
      ),
    );
  };

  const createPlan = () => {
    const id = crypto.randomUUID();
    setPlans((current) => {
      const nextNumber =
        Math.max(
          0,
          ...current.map((plan) => Number(plan.name.match(/\d+$/)?.[0] ?? 0)),
        ) + 1;
      return [
        ...current,
        { id, name: `برنامه ${nextNumber}`, lessons: [] },
      ];
    });
    setActivePlanId(id);
    setHoveredLesson(null);
  };

  const removePlan = (id: string) => {
    if (plans.length === 1) return;
    const index = plans.findIndex((plan) => plan.id === id);
    const remaining = plans.filter((plan) => plan.id !== id);
    setPlans(remaining);
    if (id === activePlanId) {
      setActivePlanId(remaining[Math.max(0, index - 1)]?.id ?? remaining[0].id);
    }
    setHoveredLesson(null);
  };

  return (
    <lessonContext.Provider
      value={{
        lessons,
        setLessons,
        lessonsId,
        plans,
        activePlanId,
        setActivePlanId,
        createPlan,
        removePlan,
        hoveredLesson,
        setHoveredLesson,
      }}
    >
      {children}
    </lessonContext.Provider>
  );
}

function getInitialPlans(): SavedPlan[] {
  let legacyLessons: Lesson[] = [];
  try {
    legacyLessons = JSON.parse(localStorage.getItem("lessons") ?? "[]") as Lesson[];
  } catch {
    legacyLessons = [];
  }
  return [{ id: crypto.randomUUID(), name: "برنامه 1", lessons: legacyLessons }];
}
