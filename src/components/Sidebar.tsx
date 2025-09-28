import { useEffect, useState } from "react";
import type { Lesson } from "../types/lesson";
import LessonItem from "./LessonItem";
// import data from "../../data.json";

export default function Sidebar() {
  const [collegeId, setCollegeId] = useState("");
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    if (!collegeId) return;
    (async () => {
      try {
        const res = await fetch(`/api/classes?collegeId=${collegeId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = (await res.json()) as Lesson[];
        setAvailableLessons(data);
      } catch {
        setAvailableLessons([]);
      }
    })();
  }, [collegeId]);

  return (
    <aside className="sidebar">
      <select
        className="college-id-input"
        value={collegeId}
        onChange={(e) => setCollegeId(e.target.value)}
      >
        <option value="">دانشکده</option>
        <option value="11">مهندسی برق</option>
        <option value="19">مهندسی کامپیوتر</option>
        <option value="22">مهندسی عمران</option>
        <option value="33">مهندسی مکانیک</option>
        <option value="42">فیزیک</option>
        <option value="44">علوم</option>
        <option value="48">شیمی</option>
        <option value="55">عمومی(مردان)</option>
        <option value="57">ریاضی</option>
        <option value="66">صنایع</option>
        <option value="77">مهندسی نقشه برداری</option>
        <option value="88">مهندسی هوافضا</option>
        <option value="99">مهندسی و علم مواد</option>
      </select>
      <div className="lessons">
        {availableLessons.map((lesson) => (
          <LessonItem key={lesson.lessonId} {...lesson} />
        ))}
      </div>
    </aside>
  );
}
