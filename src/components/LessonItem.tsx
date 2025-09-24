import { useLessonContext } from "../contexts/LessonContext";
import type { Lesson } from "../types/lesson";
import { isLessonConflicting } from "../utils/lessonConfilicting";
import persianDate from "persian-date";

export default function LessonItem({
  id,
  lessonId,
  lessonName,
  teacher,
  place,
  signin,
  cap,
  chosenSimister,
  examDate,
  limits,
  moreInfo,
  credits,
  actionCredits,
  classTime,
}: Lesson) {
  const { lessonsId, setLessonsId, setLessons, setHoveredLesson, lessons } =
    useLessonContext();

  const lesson: Lesson = {
    id,
    lessonId,
    lessonName,
    teacher,
    place,
    signin,
    cap,
    chosenSimister,
    examDate,
    limits,
    moreInfo,
    credits,
    actionCredits,
    classTime,
  };
  return (
    <div
      className={`lesson${lessonsId.has(id) ? " active" : ""}${isLessonConflicting(lesson, lessons) ? " conflicting" : ""}`}
      onClick={() => {
        if (lessonsId.has(id)) {
          setLessonsId((state) => {
            const newState = new Set(state);
            newState.delete(id);
            return newState;
          });
          setLessons((prevState) =>
            prevState.filter((lesson) => lesson.id !== id),
          );
        } else {
          if (isLessonConflicting(lesson, lessons)) return;
          setLessonsId((prevState) => {
            const newState = new Set(prevState);
            newState.add(id);
            return newState;
          });

          setLessons((prevLessons) => [...prevLessons, lesson]);
        }
      }}
      onMouseEnter={() => setHoveredLesson(lesson)}
      onMouseLeave={() => setHoveredLesson(null)}
    >
      <span>{lessonName}</span>
      <div className="info">
        <div className="base-info">
          <span
            className="sign-cap"
            style={
              {
                "--progress": `${Number(cap) !== 0 ? (Number(signin) * 100) / Number(cap) : 100}%`,
              } as React.CSSProperties
            }
          >
            {`${signin}/${cap}`}
          </span>
          <span className="code">
            <span className="filed">کد درس: </span>
            {lessonId}
          </span>

          <span className="credits">
            <span className="filed">واحد: </span>
            {credits}
            {actionCredits !== "0" && `(${actionCredits} واحد عملی)`}
          </span>

          {teacher && (
            <span className="teacher">
              <span className="filed">استاد: </span>
              {teacher}
            </span>
          )}

          {place && (
            <span className="place">
              <span className="filed">مکان: </span>
              {place}
            </span>
          )}
          <span className="chosen-simister">
            <span className="filed">مخصوص ورودی: </span>
            {chosenSimister}
          </span>
          {examDate && (
            <span className="exam-date">
              <span className="filed">تاریخ امتحان: </span>
              {new persianDate(examDate).format("DD/MM HH:mm")}
            </span>
          )}
        </div>
        <p className="limit">
          <span className="filed">محدودیت: </span>
          {limits}
        </p>
        {moreInfo && (
          <p className="more-info">
            <span className="filed">توضیحات: </span>
            {moreInfo}
          </p>
        )}
      </div>
    </div>
  );
}
