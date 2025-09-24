import { useEffect, useRef, useState } from "react";
import { useLessonContext } from "../contexts/LessonContext";
import { MdDelete, MdClose, MdAdd } from "react-icons/md";
import Lesson from "./Lesson";
import type { Schedule } from "../types/lesson";

export default function Plan() {
  const { lessons, setLessons, lessonsId, hoveredLesson } = useLessonContext();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState<Schedule>({
    day: 0,
    start: 7,
    end: 9.5,
  });

  useEffect(() => {
    if (!selectedLessonId) return dialogRef.current?.close();
    dialogRef.current?.showModal();
  }, [selectedLessonId, dialogRef]);

  const handleScheduleChange = (
    id: string,
    index: number,
    field: "day" | "start" | "end",
    value: string,
  ) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === id
          ? {
              ...lesson,
              classTime: lesson.classTime.map((c, i) =>
                i === index
                  ? {
                      ...c,
                      [field]:
                        Number(value) > 24 ? Number(value) / 10 : Number(value),
                    }
                  : c,
              ),
            }
          : lesson,
      ),
    );
  };

  const handleDeleteScheule = (id: string, index: number) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === id
          ? {
              ...lesson,
              classTime: [
                ...lesson.classTime.slice(0, index),
                ...lesson.classTime.slice(index + 1),
              ],
            }
          : lesson,
      ),
    );
  };

  const handleAddScheule = (id: string) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === id
          ? {
              ...lesson,
              classTime: [...lesson.classTime, newSchedule],
            }
          : lesson,
      ),
    );
    setNewSchedule({ day: 0, start: 7, end: 9.5 });
  };
  return (
    <section className="plan">
      <dialog
        ref={dialogRef}
        onClose={() => setSelectedLessonId(null)}
        className="dialog"
        style={selectedLessonId === null ? { display: "none" } : {}}
      >
        {lessons
          .find((lesson) => lesson.id === selectedLessonId)
          ?.classTime.map(({ start, end, day }, idx) => (
            <div key={selectedLessonId + String(idx)} className="schedule">
              <button
                className="del"
                onClick={() => handleDeleteScheule(selectedLessonId!, idx)}
              >
                <MdDelete />
              </button>
              <div className="times">
                <span className="day">
                  day:{" "}
                  <input
                    value={day}
                    onChange={(e) =>
                      handleScheduleChange(
                        selectedLessonId!,
                        idx,
                        "day",
                        e.target.value,
                      )
                    }
                  />
                </span>
                <span className="start">
                  start:{" "}
                  <input
                    value={start}
                    onChange={(e) =>
                      handleScheduleChange(
                        selectedLessonId!,
                        idx,
                        "start",
                        e.target.value,
                      )
                    }
                  />
                </span>
                <span className="end">
                  end:{" "}
                  <input
                    value={end}
                    onChange={(e) =>
                      handleScheduleChange(
                        selectedLessonId!,
                        idx,
                        "end",
                        e.target.value,
                      )
                    }
                  />
                </span>
              </div>
            </div>
          ))}

        <div className="schedule">
          <button
            className="add"
            onClick={() => handleAddScheule(selectedLessonId!)}
          >
            <MdAdd />
          </button>
          <div className="times">
            <span className="day">
              day:{" "}
              <input
                value={newSchedule.day}
                onChange={(e) =>
                  setNewSchedule((prevSchedule) => ({
                    ...prevSchedule,
                    day: Number(e.target.value),
                  }))
                }
              />
            </span>
            <span className="start">
              start:{" "}
              <input
                value={newSchedule.start}
                onChange={(e) =>
                  setNewSchedule((prevSchedule) => ({
                    ...prevSchedule,
                    start:
                      Number(e.target.value) > 24
                        ? Number(e.target.value) / 10
                        : Number(e.target.value),
                  }))
                }
              />
            </span>
            <span className="end">
              end:{" "}
              <input
                value={newSchedule.end}
                onChange={(e) =>
                  setNewSchedule((prevSchedule) => ({
                    ...prevSchedule,
                    end:
                      Number(e.target.value) > 24
                        ? Number(e.target.value) / 10
                        : Number(e.target.value),
                  }))
                }
              />
            </span>
          </div>
        </div>
        <button
          className="close-btn"
          onClick={() => dialogRef.current?.close()}
        >
          <MdClose />
        </button>
      </dialog>
      <div className="hours-bar">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i}>{i + 7}</span>
        ))}
      </div>
      <div className="day-bar">
        <span>شنبه</span>
        <span>یک شنبه</span>
        <span>دو شنبه</span>
        <span>سه شنبه</span>
        <span>چهار شنبه</span>
        <span>پنج شنبه</span>
      </div>

      <div className="lessons">
        {lessons.map((lesson) =>
          lesson.classTime.map(({ day, start, end }) => (
            <Lesson
              key={lesson.id + `${day}-${start}-${end}`}
              id={lesson.id}
              day={day + 1}
              start={-(start - 6) * 2}
              end={-(end - 6) * 2}
              name={lesson.lessonName}
              code={lesson.lessonId}
              setSelectedLessonId={setSelectedLessonId}
            />
          )),
        )}
        {hoveredLesson &&
          hoveredLesson.classTime.map(({ day, start, end }) => (
            <Lesson
              key={hoveredLesson.id + `${day}-${start}-${end}`}
              id={hoveredLesson.id}
              day={day + 1}
              start={-(start - 6) * 2}
              end={-(end - 6) * 2}
              name={hoveredLesson.lessonName}
              code={hoveredLesson.lessonId}
              ghost={!lessonsId.has(hoveredLesson.id)}
            />
          ))}
      </div>
    </section>
  );
}
