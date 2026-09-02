import { useEffect, useMemo, useRef, useState } from "react";
import { MdAdd, MdClose, MdDelete, MdEventNote, MdSchedule, MdViewWeek, MdWarningAmber } from "react-icons/md";
import { useLessonContext } from "../contexts/LessonContext";
import type { Lesson as LessonType, Schedule } from "../types/lesson";
import { isLessonConflicting } from "../utils/lessonConfilicting";
import Lesson from "./Lesson";
import CustomSelect from "./CustomSelect";

const days = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه"];
const dayOptions = days.map((day, index) => ({ value: String(index), label: day }));
const hours = Array.from({ length: 12 }, (_, index) => index + 7);

export default function Plan() {
  const {
    lessons, setLessons, lessonsId, hoveredLesson, plans, activePlanId,
    setActivePlanId, createPlan, removePlan,
  } = useLessonContext();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [planView, setPlanView] = useState<"weekly" | "exams">("weekly");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState<Schedule>({ day: 0, start: 7, end: 9.5 });

  useEffect(() => {
    if (selectedLessonId && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [selectedLessonId]);

  useEffect(() => {
    dialogRef.current?.close();
    setSelectedLessonId(null);
  }, [activePlanId]);

  const updateSchedule = (id: string, index: number, field: keyof Schedule, value: string) => {
    setLessons((current) => current.map((lesson) => lesson.id === id ? {
      ...lesson, classTime: lesson.classTime.map((schedule, scheduleIndex) => scheduleIndex === index ? { ...schedule, [field]: Number(value) } : schedule),
    } : lesson));
  };
  const deleteSchedule = (id: string, index: number) => setLessons((current) => current.map((lesson) => lesson.id === id ? { ...lesson, classTime: lesson.classTime.filter((_, scheduleIndex) => scheduleIndex !== index) } : lesson));
  const addSchedule = (id: string) => {
    setLessons((current) => current.map((lesson) => lesson.id === id ? { ...lesson, classTime: [...lesson.classTime, newSchedule] } : lesson));
    setNewSchedule({ day: 0, start: 7, end: 9.5 });
  };
  const closeDialog = () => { dialogRef.current?.close(); setSelectedLessonId(null); };
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId);
  const currentHoveredLesson = hoveredLesson && lessons.find((lesson) => lesson.id === hoveredLesson.id);
  const hoveredScheduleChanged = Boolean(currentHoveredLesson && hoveredLesson && (
    currentHoveredLesson.examDate !== hoveredLesson.examDate ||
    JSON.stringify(currentHoveredLesson.classTime) !== JSON.stringify(hoveredLesson.classTime)
  ));
  const showPreview = hoveredLesson && (!lessonsId.has(hoveredLesson.id) || hoveredScheduleChanged);
  const previewConflicts = showPreview
    ? isLessonConflicting(hoveredLesson, lessons.filter((lesson) => lesson.id !== hoveredLesson.id))
    : false;

  return <section className="plan" aria-labelledby="plan-title">
    <div className="plan-header">
      <div><span className="eyebrow">{planView === "weekly" ? "برنامه هفتگی" : "تقویم امتحانات"}</span><h2 id="plan-title">{planView === "weekly" ? "تقویم درسی" : "برنامه امتحان‌ها"}</h2></div>
      <div className="plan-view-switch" role="tablist" aria-label="نوع نمایش برنامه">
        <button type="button" role="tab" aria-selected={planView === "weekly"} aria-controls="weekly-plan" onClick={() => setPlanView("weekly")}><MdViewWeek aria-hidden="true" /><span>هفتگی</span></button>
        <button type="button" role="tab" aria-selected={planView === "exams"} aria-controls="exam-plan" onClick={() => setPlanView("exams")}><MdEventNote aria-hidden="true" /><span>امتحان‌ها</span></button>
      </div>
      <div className="plan-tabs" role="tablist" aria-label="برنامه‌های درسی">
        {plans.map((plan) => <div className={`plan-tab${plan.id === activePlanId ? " active" : ""}`} key={plan.id}>
          <button type="button" role="tab" aria-selected={plan.id === activePlanId} onClick={() => setActivePlanId(plan.id)}>{plan.name}</button>
          {plans.length > 1 && <button type="button" className="remove-plan" onClick={() => removePlan(plan.id)} aria-label={`حذف ${plan.name}`}><MdClose /></button>}
        </div>)}
        <button type="button" className="add-plan" onClick={createPlan} aria-label="ساخت برنامه جدید"><MdAdd /><span>برنامه جدید</span></button>
      </div>
      {planView === "weekly" && <div className="legend" aria-label="راهنمای تقویم"><span><i className="selected-dot" />انتخاب‌شده</span><span><i className="preview-dot" />پیش‌نمایش</span><span><i className="conflict-dot" />تداخل</span></div>}
    </div>
    <div className="calendar-scroll" id="weekly-plan" role="tabpanel" tabIndex={0} aria-label="تقویم هفتگی؛ در نمایشگر کوچک امکان پیمایش افقی دارد" hidden={planView !== "weekly"}>
      <div className="calendar">
        <div className="calendar-corner">روز / ساعت</div>
        <div className="hours-bar">{hours.map((hour) => <span key={hour} style={{ gridColumn: `${(hour - 7) * 2 + 1}/span 2` }}>{hour.toLocaleString("fa-IR")}</span>)}</div>
        <div className="day-bar">{days.map((day) => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid" aria-live="polite">
          {lessons.length === 0 && <div className="calendar-empty"><MdEventNote aria-hidden="true" /><strong>برنامه شما هنوز خالی است</strong><span>از فهرست درس‌ها، یک درس را انتخاب کنید.</span></div>}
          {lessons.flatMap((lesson) => lesson.classTime.map(({ day, start, end }, index) => <Lesson key={`${lesson.id}-${index}-${day}-${start}-${end}`} id={lesson.id} day={day + 1} start={start} end={end} name={lesson.lessonName} code={lesson.lessonId} teacher={lesson.teacher} setSelectedLessonId={setSelectedLessonId} />))}
          {showPreview && hoveredLesson.classTime.map(({ day, start, end }, index) => <Lesson key={`preview-${hoveredLesson.id}-${index}`} id={hoveredLesson.id} day={day + 1} start={start} end={end} name={hoveredLesson.lessonName} code={hoveredLesson.lessonId} ghost conflicting={previewConflicts} />)}
        </div>
      </div>
    </div>
    <div id="exam-plan" role="tabpanel" hidden={planView !== "exams"} className="exam-view">
      <ExamPlan lessons={lessons} />
    </div>

    <dialog ref={dialogRef} onClose={() => setSelectedLessonId(null)} className="dialog" aria-labelledby="schedule-dialog-title">
      <div className="dialog-header"><div><span className="eyebrow">ویرایش زمان</span><h2 id="schedule-dialog-title">{selectedLesson?.lessonName}</h2></div><button type="button" className="icon-button" onClick={closeDialog} aria-label="بستن"><MdClose /></button></div>
      <div className="dialog-body">
        {selectedLesson?.classTime.map((schedule, index) => <ScheduleRow key={`${selectedLesson.id}-${index}`} schedule={schedule} onChange={(field, value) => updateSchedule(selectedLesson.id, index, field, value)} onDelete={() => deleteSchedule(selectedLesson.id, index)} />)}
        <div className="schedule new-schedule"><div className="schedule-title"><strong>افزودن زمان جدید</strong></div><ScheduleFields schedule={newSchedule} onChange={(field, value) => setNewSchedule((current) => ({ ...current, [field]: Number(value) }))} /><button type="button" className="add schedule-action" onClick={() => selectedLessonId && addSchedule(selectedLessonId)}><MdAdd />افزودن</button></div>
      </div>
    </dialog>
  </section>;
}

function ExamPlan({ lessons }: { lessons: LessonType[] }) {
  const { groups, undated, conflictCount } = useMemo(() => {
    const dated = lessons.filter((lesson) => lesson.examDate > 0).sort((a, b) => a.examDate - b.examDate);
    const grouped = new Map<string, LessonType[]>();
    dated.forEach((lesson) => {
      const date = new Date(lesson.examDate);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      grouped.set(key, [...(grouped.get(key) ?? []), lesson]);
    });
    const collisions = dated.filter((lesson) => dated.some((other) => other.id !== lesson.id && other.examDate === lesson.examDate)).length;
    return {
      groups: [...grouped.values()],
      undated: lessons.filter((lesson) => !lesson.examDate),
      conflictCount: collisions,
    };
  }, [lessons]);

  if (lessons.length === 0) return <div className="exam-empty"><MdEventNote aria-hidden="true" /><strong>هنوز درسی انتخاب نکرده‌اید</strong><span>با انتخاب درس‌ها، برنامه امتحانی شما اینجا شکل می‌گیرد.</span></div>;

  return <div className="exam-board">
    <div className="exam-summary">
      <div><span>امتحان‌های زمان‌بندی‌شده</span><strong>{lessons.filter((lesson) => lesson.examDate > 0).length.toLocaleString("fa-IR")}</strong></div>
      <div className={conflictCount ? "summary-conflict" : ""}><span>تداخل امتحان</span><strong>{conflictCount.toLocaleString("fa-IR")}</strong></div>
      <div><span>بدون تاریخ</span><strong>{undated.length.toLocaleString("fa-IR")}</strong></div>
    </div>
    {groups.length > 0 && <div className="exam-timeline">
      {groups.map((group) => <ExamDay key={group[0].examDate} lessons={group} />)}
    </div>}
    {groups.length === 0 && <div className="exam-empty compact"><MdSchedule aria-hidden="true" /><strong>هنوز تاریخی اعلام نشده است</strong><span>درس‌های بدون تاریخ را پایین‌تر می‌بینید.</span></div>}
    {undated.length > 0 && <section className="undated-exams" aria-labelledby="undated-title">
      <div className="undated-heading"><span><MdSchedule aria-hidden="true" /></span><div><strong id="undated-title">در انتظار اعلام تاریخ</strong><small>{undated.length.toLocaleString("fa-IR")} درس</small></div></div>
      <div className="undated-list">{undated.map((lesson) => <div key={lesson.id}><strong>{lesson.lessonName}</strong><span dir="ltr">{lesson.lessonId}</span></div>)}</div>
    </section>}
  </div>;
}

function ExamDay({ lessons }: { lessons: LessonType[] }) {
  const date = new Date(lessons[0].examDate);
  const dateLabel = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
  const dayNumber = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "numeric" }).format(date);
  const month = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { month: "short" }).format(date);

  return <section className="exam-day">
    <div className="exam-date-badge" aria-hidden="true"><strong>{dayNumber}</strong><span>{month}</span></div>
    <div className="exam-day-content">
      <h3>{dateLabel}</h3>
      <div className="exam-cards">{lessons.map((lesson) => {
        const conflicts = lessons.some((other) => other.id !== lesson.id && other.examDate === lesson.examDate);
        const time = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(new Date(lesson.examDate));
        return <article className={`exam-card${conflicts ? " conflict" : ""}`} key={lesson.id}>
          <div className="exam-time"><MdSchedule aria-hidden="true" /><strong>{time}</strong></div>
          <div className="exam-course"><strong>{lesson.lessonName}</strong><span><bdi>{lesson.lessonId}</bdi>{lesson.teacher ? ` · ${lesson.teacher}` : ""}</span></div>
          {conflicts && <span className="exam-conflict"><MdWarningAmber aria-hidden="true" />تداخل</span>}
        </article>;
      })}</div>
    </div>
  </section>;
}

function ScheduleRow({ schedule, onChange, onDelete }: { schedule: Schedule; onChange: (field: keyof Schedule, value: string) => void; onDelete: () => void }) {
  return <div className="schedule"><div className="schedule-title"><strong>زمان برگزاری</strong><button type="button" className="del" onClick={onDelete} aria-label="حذف زمان"><MdDelete /></button></div><ScheduleFields schedule={schedule} onChange={onChange} /></div>;
}

function ScheduleFields({ schedule, onChange }: { schedule: Schedule; onChange: (field: keyof Schedule, value: string) => void }) {
  return <div className="times"><label>روز<CustomSelect value={String(schedule.day)} options={dayOptions} onChange={(value) => onChange("day", value)} ariaLabel="روز برگزاری" /></label><label>شروع<input type="number" min="7" max="18.5" step="0.5" value={schedule.start} onChange={(event) => onChange("start", event.target.value)} /></label><label>پایان<input type="number" min="7.5" max="19" step="0.5" value={schedule.end} onChange={(event) => onChange("end", event.target.value)} /></label></div>;
}
