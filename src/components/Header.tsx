import { MdMenuBook } from "react-icons/md";
import { useLessonContext } from "../contexts/LessonContext";

export default function Header({
  onOpenBrowser,
}: {
  onOpenBrowser: () => void;
}) {
  const { lessons } = useLessonContext();
  const credits = lessons.reduce(
    (sum, lesson) => sum + Number(lesson.credits || 0),
    0,
  );

  return (
    <header className="header">
      <div className="logo">
        <img
          src="/imgs/kntu-logo.png"
          alt="نشان دانشگاه صنعتی خواجه نصیرالدین طوسی"
        />
        <div>
          <strong>واحد</strong>
          <span>برنامه‌ریز درسی</span>
        </div>
      </div>
      <div className="header-actions">
        <div
          className="plan-summary"
          aria-label={`${lessons.length} درس و ${credits} واحد انتخاب شده`}
        >
          <span>
            <strong>{lessons.length}</strong> درس
          </span>
          <span className="summary-divider" />
          <span>
            <strong>{credits}</strong> واحد
          </span>
        </div>
        <button className="browser-trigger" onClick={onOpenBrowser} type="button">
          <MdMenuBook aria-hidden="true" />
          <span>درس‌ها</span>
        </button>
      </div>
    </header>
  );
}
