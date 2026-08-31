import { useEffect, useMemo, useState } from "react";
import { MdClose, MdMenuBook, MdSearch } from "react-icons/md";
import { useLessonContext } from "../contexts/LessonContext";
import type { Lesson } from "../types/lesson";
import LessonDetails from "./LessonDetails";
import LessonItem from "./LessonItem";

type SidebarProps = { isOpen: boolean; onClose: () => void };

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { hoveredLesson } = useLessonContext();
  const [inspectedLesson, setInspectedLesson] = useState<Lesson | null>(null);
  const [collegeIdAndGender, setCollegeIdAndGender] = useState("");
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!collegeIdAndGender) {
      setAvailableLessons([]);
      setStatus("idle");
      return;
    }
    const controller = new AbortController();
    const [collegeId, gender] = collegeIdAndGender.split("-");
    setStatus("loading");
    void (async () => {
      try {
        const res = await fetch(`${apiUrl}/classes?collegeId=${collegeId}&gender=${gender}`, {
          headers: { "Content-Type": "application/json" }, signal: controller.signal,
        });
        if (!res.ok) throw new Error("Request failed");
        setAvailableLessons((await res.json()) as Lesson[]);
        setStatus("ready");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setAvailableLessons([]);
        setStatus("error");
      }
    })();
    return () => controller.abort();
  }, [apiUrl, collegeIdAndGender]);

  useEffect(() => {
    if (hoveredLesson) setInspectedLesson(hoveredLesson);
  }, [hoveredLesson]);

  const filteredLessons = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fa");
    if (!normalizedQuery) return availableLessons;
    return availableLessons.filter((lesson) =>
      [lesson.lessonName, lesson.teacher, lesson.lessonId].some((value) =>
        value?.toLocaleLowerCase("fa").includes(normalizedQuery),
      ),
    );
  }, [availableLessons, query]);

  const detailsContent = inspectedLesson
    ? <LessonDetails lesson={inspectedLesson} />
    : <BrowserMessage title="جزئیات درس" text="نشانگر ماوس را روی یک درس نگه دارید یا با کلید Tab آن را انتخاب کنید." />;

  return <>
    <button type="button" className={`sidebar-backdrop${isOpen ? " visible" : ""}`} onClick={onClose} aria-label="بستن فهرست درس‌ها" tabIndex={isOpen ? 0 : -1} />
    <aside className={`sidebar${isOpen ? " open" : ""}`} aria-label="مرور درس‌ها">
      <div className="sidebar-header">
        <div><span className="eyebrow">انتخاب واحد</span><h1>درس‌های ارائه‌شده</h1></div>
        <button type="button" className="icon-button sidebar-close" onClick={onClose} aria-label="بستن"><MdClose aria-hidden="true" /></button>
      </div>
      <div className="browser-controls">
        <label htmlFor="college-select">دانشکده یا گروه</label>
        <select id="college-select" className="college-id-input" value={collegeIdAndGender} onChange={(event) => setCollegeIdAndGender(event.target.value)}>
          <option value="">انتخاب دانشکده</option>
          <option value="11-1">مهندسی برق</option><option value="19-1">مهندسی کامپیوتر</option>
          <option value="22-1">مهندسی عمران</option><option value="33-1">مهندسی مکانیک</option>
          <option value="42-1">فیزیک (مردان)</option><option value="42-0">فیزیک (بانوان)</option>
          <option value="44-1">علوم</option><option value="48-1">شیمی</option>
          <option value="55-1">عمومی (مردان)</option><option value="55-0">عمومی (بانوان)</option>
          <option value="57-1">ریاضی</option><option value="66-1">صنایع</option>
          <option value="77-1">مهندسی نقشه‌برداری</option><option value="88-1">مهندسی هوافضا</option>
          <option value="99-1">مهندسی و علم مواد</option>
        </select>
        <label className="search-field"><MdSearch aria-hidden="true" /><span className="sr-only">جستجوی درس</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="نام درس، استاد یا کد..." disabled={!collegeIdAndGender} />
        </label>
      </div>
      <div className="mobile-details-slot" id="active-lesson-details">
        {detailsContent}
      </div>
      <div className="lesson-list-heading"><span>فهرست درس‌ها</span>{status === "ready" && <span>{filteredLessons.length.toLocaleString("fa-IR")} مورد</span>}</div>
      <div className="lessons" aria-live="polite" aria-busy={status === "loading"}>
        {status === "idle" && <BrowserMessage icon={<MdMenuBook />} title="از یک دانشکده شروع کنید" text="پس از انتخاب، درس‌های ارائه‌شده اینجا نمایش داده می‌شوند." />}
        {status === "loading" && Array.from({ length: 5 }).map((_, index) => <div className="lesson-skeleton" key={index} />)}
        {status === "error" && <BrowserMessage title="دریافت درس‌ها ممکن نشد" text="اتصال خود را بررسی کنید یا دانشکده را دوباره انتخاب کنید." />}
        {status === "ready" && filteredLessons.length === 0 && <BrowserMessage title="درسی پیدا نشد" text="عبارت جستجو را تغییر دهید." />}
        {filteredLessons.map((lesson) => <LessonItem key={lesson.id} {...lesson} />)}
      </div>
    </aside>
  </>;
}

function BrowserMessage({ icon, title, text }: { icon?: React.ReactNode; title: string; text: string }) {
  return <div className="browser-message">{icon}<strong>{title}</strong><span>{text}</span></div>;
}
