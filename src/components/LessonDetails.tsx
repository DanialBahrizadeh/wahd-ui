import { MdEvent, MdInfoOutline, MdLocationOn, MdPerson, MdSchool } from "react-icons/md";
import persianDate from "persian-date";
import type { Lesson } from "../types/lesson";

export default function LessonDetails({ lesson, id }: { lesson: Lesson; id?: string }) {
  const capacity = Number(lesson.cap);
  const enrolled = Number(lesson.signin);
  const fill = capacity > 0 ? Math.min(100, (enrolled / capacity) * 100) : 100;

  return <div className="lesson-details" id={id}>
    <div className="capacity-row">
      <span>ظرفیت کلاس</span><strong>{enrolled.toLocaleString("fa-IR")} از {capacity.toLocaleString("fa-IR")}</strong>
      <span className="capacity-track" aria-hidden="true"><span style={{ width: `${fill}%` }} /></span>
    </div>
    <dl className="details-grid">
      <Detail icon={<MdPerson />} label="استاد" value={lesson.teacher || "اعلام نشده"} />
      <Detail icon={<MdLocationOn />} label="مکان" value={lesson.place || "اعلام نشده"} />
      <Detail icon={<MdSchool />} label="واحد" value={`${lesson.credits} واحد${lesson.actionCredits !== "0" ? ` · ${lesson.actionCredits} عملی` : ""}`} />
      <Detail icon={<MdEvent />} label="امتحان" value={lesson.examDate ? new persianDate(lesson.examDate).format("DD MMMM YYYY · HH:mm") : "اعلام نشده"} />
    </dl>
    <div className="details-note"><strong>مخصوص ورودی</strong><p>{lesson.chosenSimister || "محدودیتی اعلام نشده"}</p></div>
    {lesson.limits && <div className="details-note"><strong><MdInfoOutline aria-hidden="true" /> محدودیت‌ها</strong><p>{lesson.limits}</p></div>}
    {lesson.moreInfo && <div className="details-note"><strong>توضیحات تکمیلی</strong><p>{lesson.moreInfo}</p></div>}
  </div>;
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div><dt>{icon}<span>{label}</span></dt><dd>{value}</dd></div>;
}
