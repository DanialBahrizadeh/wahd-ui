import { useEffect, useState } from "react";
import type { Lesson } from "../types/lesson";
import LessonItem from "./LessonItem";
// import data from "../../data.json";

export default function Sidebar() {
  const [collegeIdAndGender, setCollegeIdAndGender] = useState("");
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!collegeIdAndGender) return;
    const [collegeId, gender] = collegeIdAndGender.split("-");
    (async () => {
      try {
        const res = await fetch(
          `${apiUrl}/classes?collegeId=${collegeId}&gender=${gender}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const data = (await res.json()) as Lesson[];
        setAvailableLessons(data);
      } catch {
        setAvailableLessons([]);
      }
    })();
  }, [collegeIdAndGender]);

  return (
    <aside className="sidebar">
      <select
        className="college-id-input"
        value={collegeIdAndGender}
        onChange={(e) => setCollegeIdAndGender(e.target.value)}
      >
        <option value="">دانشکده</option>
        <option value="11-1">مهندسی برق</option>
        <option value="19-1">مهندسی کامپیوتر</option>
        <option value="22-1">مهندسی عمران</option>
        <option value="33-1">مهندسی مکانیک</option>
        <option value="42-1">فیزیک(مردان)</option>
        <option value="42-0">فیزیک(بانوان)</option>
        <option value="44-1">علوم</option>
        <option value="48-1">شیمی</option>
        <option value="55-1">عمومی(مردان)</option>
        <option value="55-0">عمومی(بانوان)</option>
        <option value="57-1">ریاضی</option>
        <option value="66-1">صنایع</option>
        <option value="77-1">مهندسی نقشه برداری</option>
        <option value="88-1">مهندسی هوافضا</option>
        <option value="99-1">مهندسی و علم مواد</option>
      </select>
      <div className="lessons">
        {availableLessons.map((lesson) => (
          <LessonItem key={lesson.lessonId} {...lesson} />
        ))}
      </div>
    </aside>
  );
}
