import { useEffect, useMemo, useState } from "react";
import { MdClose, MdMenuBook, MdSearch } from "react-icons/md";
import { useLessonContext } from "../contexts/LessonContext";
import type { Lesson } from "../types/lesson";
import LessonDetails from "./LessonDetails";
import LessonItem from "./LessonItem";
import CustomSelect, { type SelectOption } from "./CustomSelect";

type SidebarProps = { isOpen: boolean; onClose: () => void };

const collegeOptions: SelectOption[] = [
  { value: "11-1", label: "مهندسی برق" }, { value: "19-1", label: "مهندسی کامپیوتر" },
  { value: "22-1", label: "مهندسی عمران" }, { value: "33-1", label: "مهندسی مکانیک" },
  { value: "42-1", label: "فیزیک (مردان)" }, { value: "42-0", label: "فیزیک (بانوان)" },
  { value: "44-1", label: "علوم" }, { value: "48-1", label: "شیمی" },
  { value: "55-1", label: "عمومی (مردان)" }, { value: "55-0", label: "عمومی (بانوان)" },
  { value: "57-1", label: "ریاضی" }, { value: "66-1", label: "صنایع" },
  { value: "77-1", label: "مهندسی نقشه‌برداری" }, { value: "88-1", label: "مهندسی هوافضا" },
  { value: "99-1", label: "مهندسی و علم مواد" },
];

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
        <span className="control-label">دانشکده یا گروه</span>
        <CustomSelect value={collegeIdAndGender} options={collegeOptions} onChange={setCollegeIdAndGender} placeholder="انتخاب دانشکده" ariaLabel="دانشکده یا گروه" />
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
