import { useEffect, useMemo, useState } from "react";
import { MdCheck, MdClose, MdMenuBook, MdPlaylistAddCheck, MdRefresh, MdSearch } from "react-icons/md";
import { useLessonContext } from "../contexts/LessonContext";
import type { Lesson } from "../types/lesson";
import { getLessonConflictReason } from "../utils/lessonConfilicting";
import { getSearchQueryVariants, matchesSearchQuery } from "../utils/search";
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
  const { hoveredLesson, setHoveredLesson, lessons, setLessons, plans, activePlanId } = useLessonContext();
  const [activeTab, setActiveTab] = useState<"browser" | "plan">("browser");
  const [inspectedLesson, setInspectedLesson] = useState<Lesson | null>(null);
  const [collegeIdAndGender, setCollegeIdAndGender] = useState("");
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [refreshStatus, setRefreshStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, Lesson>>({});
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
        setAvailableLessons(((await res.json()) as Lesson[]).map((lesson) => ({
          ...lesson,
          collegeId: lesson.collegeId ?? collegeId,
          sourceGender: gender as "0" | "1",
        })));
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
    const queryVariants = getSearchQueryVariants(query);
    if (queryVariants.length === 0) return availableLessons;
    return availableLessons.filter((lesson) =>
      [lesson.lessonName, lesson.teacher, lesson.lessonId].some((value) =>
        matchesSearchQuery(value, queryVariants),
      ),
    );
  }, [availableLessons, query]);

  const detailsContent = inspectedLesson
    ? <LessonDetails lesson={inspectedLesson} />
    : <BrowserMessage title="جزئیات درس" text="نشانگر ماوس را روی یک درس نگه دارید یا با کلید Tab آن را انتخاب کنید." />;
  const activePlanName = plans.find((plan) => plan.id === activePlanId)?.name ?? "برنامه فعلی";

  useEffect(() => {
    setPendingUpdates({});
    setRefreshStatus("idle");
  }, [activePlanId]);

  const refreshLessons = async () => {
    if (lessons.length === 0 || refreshStatus === "loading") return;
    setRefreshStatus("loading");
    const requestCache = new Map<string, Promise<Lesson[]>>();
    const fetchGroup = (collegeId: string, gender: "0" | "1") => {
      const key = `${collegeId}-${gender}`;
      const cached = requestCache.get(key);
      if (cached) return cached;
      const request = fetch(`${apiUrl}/classes?collegeId=${collegeId}&gender=${gender}`, {
        headers: { "Content-Type": "application/json" },
      }).then(async (response) => {
        if (!response.ok) throw new Error("Request failed");
        return ((await response.json()) as Lesson[]).map((lesson) => ({ ...lesson, collegeId, sourceGender: gender }));
      });
      requestCache.set(key, request);
      return request;
    };

    try {
      const refreshed = await Promise.all(lessons.map(async (lesson) => {
        const collegeId = lesson.collegeId ?? lesson.id.slice(3, 5);
        const genders: ("0" | "1")[] = lesson.sourceGender ? [lesson.sourceGender] : lesson.sex === 0 ? ["0"] : lesson.sex === 1 ? ["1"] : ["1", "0"];
        for (const gender of genders) {
          const match = (await fetchGroup(collegeId, gender)).find((candidate) => candidate.id === lesson.id);
          if (match) return match;
        }
        return null;
      }));

      const freshById = new Map(refreshed.filter((lesson): lesson is Lesson => lesson !== null).map((lesson) => [lesson.id, lesson]));
      const nextPending: Record<string, Lesson> = {};
      const nextLessons = lessons.map((lesson) => {
        const fresh = freshById.get(lesson.id);
        if (!fresh) return lesson;
        const scheduleChanged = lesson.examDate !== fresh.examDate || JSON.stringify(lesson.classTime) !== JSON.stringify(fresh.classTime);
        if (scheduleChanged) {
          nextPending[lesson.id] = fresh;
          return { ...fresh, classTime: lesson.classTime, examDate: lesson.examDate };
        }
        return fresh;
      });
      setLessons(nextLessons);
      setPendingUpdates(nextPending);
      setRefreshStatus("done");
    } catch {
      setRefreshStatus("error");
    }
  };

  const acceptUpdate = (id: string) => {
    const update = pendingUpdates[id];
    if (!update) return;
    setLessons((current) => current.map((lesson) => lesson.id === id ? update : lesson));
    setPendingUpdates((current) => { const next = { ...current }; delete next[id]; return next; });
    setInspectedLesson(update);
    setHoveredLesson(null);
  };

  return <>
    <button type="button" className={`sidebar-backdrop${isOpen ? " visible" : ""}`} onClick={onClose} aria-label="بستن فهرست درس‌ها" tabIndex={isOpen ? 0 : -1} />
    <aside className={`sidebar${isOpen ? " open" : ""}`} aria-label="مرور درس‌ها">
      <div className="sidebar-header">
        <div><span className="eyebrow">انتخاب واحد</span><h1>{activeTab === "browser" ? "درس‌های ارائه‌شده" : activePlanName}</h1></div>
        <button type="button" className="icon-button sidebar-close" onClick={onClose} aria-label="بستن"><MdClose aria-hidden="true" /></button>
      </div>
      <div className="sidebar-tabs" role="tablist" aria-label="نمایش درس‌ها">
        <button type="button" role="tab" id="browser-tab" aria-selected={activeTab === "browser"} aria-controls="browser-panel" onClick={() => setActiveTab("browser")}><MdMenuBook aria-hidden="true" />درس‌ها</button>
        <button type="button" role="tab" id="plan-lessons-tab" aria-selected={activeTab === "plan"} aria-controls="plan-lessons-panel" onClick={() => setActiveTab("plan")}><MdPlaylistAddCheck aria-hidden="true" />برنامه من<span className="tab-count">{lessons.length.toLocaleString("fa-IR")}</span></button>
      </div>
      <div role="tabpanel" id="browser-panel" aria-labelledby="browser-tab" className="sidebar-panel" hidden={activeTab !== "browser"}>
        <div className="browser-controls">
          <span className="control-label">دانشکده یا گروه</span>
          <CustomSelect value={collegeIdAndGender} options={collegeOptions} onChange={setCollegeIdAndGender} placeholder="انتخاب دانشکده" ariaLabel="دانشکده یا گروه" />
          <label className="search-field"><MdSearch aria-hidden="true" /><span className="sr-only">جستجوی درس</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="نام درس، استاد یا کد..." disabled={!collegeIdAndGender} />
          </label>
        </div>
        <LessonDetailsSlot id="active-lesson-details">{detailsContent}</LessonDetailsSlot>
        <div className="lesson-list-heading"><span>فهرست درس‌ها</span>{status === "ready" && <span>{filteredLessons.length.toLocaleString("fa-IR")} مورد</span>}</div>
        <div className="lessons" aria-live="polite" aria-busy={status === "loading"}>
          {status === "idle" && <BrowserMessage icon={<MdMenuBook />} title="از یک دانشکده شروع کنید" text="پس از انتخاب، درس‌های ارائه‌شده اینجا نمایش داده می‌شوند." />}
          {status === "loading" && Array.from({ length: 5 }).map((_, index) => <div className="lesson-skeleton" key={index} />)}
          {status === "error" && <BrowserMessage title="دریافت درس‌ها ممکن نشد" text="اتصال خود را بررسی کنید یا دانشکده را دوباره انتخاب کنید." />}
          {status === "ready" && filteredLessons.length === 0 && <BrowserMessage title="درسی پیدا نشد" text="عبارت جستجو را تغییر دهید." />}
          {filteredLessons.map((lesson) => <LessonItem key={lesson.id} {...lesson} />)}
        </div>
      </div>
      <div role="tabpanel" id="plan-lessons-panel" aria-labelledby="plan-lessons-tab" className="sidebar-panel" hidden={activeTab !== "plan"}>
        <LessonDetailsSlot id="plan-active-lesson-details">{detailsContent}</LessonDetailsSlot>
        <div className="plan-lessons-toolbar">
          <div><strong>درس‌های انتخاب‌شده</strong><span>{refreshStatus === "done" ? "اطلاعات درس‌ها به‌روز شد" : refreshStatus === "error" ? "به‌روزرسانی انجام نشد؛ دوباره تلاش کنید" : "ظرفیت، استاد و محدودیت‌ها را تازه کنید"}</span></div>
          <button type="button" className="refresh-lessons" onClick={() => void refreshLessons()} disabled={lessons.length === 0 || refreshStatus === "loading"}><MdRefresh aria-hidden="true" className={refreshStatus === "loading" ? "spinning" : ""} />{refreshStatus === "loading" ? "در حال بررسی" : "به‌روزرسانی"}</button>
        </div>
        <div className="lessons" aria-live="polite">
          {lessons.length === 0
            ? <BrowserMessage icon={<MdPlaylistAddCheck />} title="این برنامه هنوز خالی است" text="از تب درس‌ها، درس‌های موردنظرتان را به این برنامه اضافه کنید." />
            : lessons.map((lesson) => {
              const update = pendingUpdates[lesson.id];
              const conflict = update ? getPendingConflict(update, lessons) : null;
              return <div className="plan-lesson-item" key={lesson.id}>
                <LessonItem {...lesson} detailsId="plan-active-lesson-details" previewLesson={update} updated={Boolean(update)} updateConflicts={Boolean(conflict)} />
                {update && <div className="lesson-update-actions">
                  <span>{conflict === "exam" ? "تاریخ جدید امتحان تداخل دارد" : conflict === "schedule" ? "زمان جدید کلاس تداخل دارد" : "زمان یا تاریخ این درس تغییر کرده است"}</span>
                  <button type="button" onClick={() => acceptUpdate(lesson.id)}><MdCheck aria-hidden="true" />تأیید تغییر</button>
                </div>}
              </div>;
            })}
        </div>
      </div>
    </aside>
  </>;
}

function getPendingConflict(update: Lesson, lessons: Lesson[]) {
  return getLessonConflictReason(update, lessons.filter((lesson) => lesson.id !== update.id));
}

function LessonDetailsSlot({ children, id }: { children: React.ReactNode; id: string }) {
  return <div className="mobile-details-slot" id={id}>{children}</div>;
}

function BrowserMessage({ icon, title, text }: { icon?: React.ReactNode; title: string; text: string }) {
  return <div className="browser-message">{icon}<strong>{title}</strong><span>{text}</span></div>;
}
