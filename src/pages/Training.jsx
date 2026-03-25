import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AutoStories, CheckCircleOutline, Groups, PlayCircleOutline, School } from "@mui/icons-material";
import workspaceService from "../api/workspaceService";
import "./../style/workspace-pages.css";

const formatDate = (value) => {
  if (!value) {
    return "Без даты";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const buildModules = (contentStructure = []) =>
  contentStructure.map((module, moduleIndex) => ({
    id: String(moduleIndex),
    title: module.module || `Модуль ${moduleIndex + 1}`,
    lessons: Array.isArray(module.lessons) ? module.lessons : [],
    moduleIndex,
  }));

export const Training = () => {
  const { user, workspaceData, workspaceLoading, workspaceError, refreshWorkspaceData } = useOutletContext();
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [courseError, setCourseError] = useState("");
  const [courseSuccess, setCourseSuccess] = useState("");

  const currentRole = `${workspaceData.currentUserRole || user?.role || user?.R_name || ""}`.toLowerCase();
  const canViewPeopleInsights = ["hr", "admin"].includes(currentRole);
  const userDepartment = user?.departmentId || user?.Department_ID || null;
  const courses = (workspaceData.courses || []).filter((course) => {
    if (canViewPeopleInsights) {
      return true;
    }

    return course.visibleToCurrentUser !== false
      && (!course.departmentId || Number(course.departmentId) === Number(userDepartment));
  });

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0] ?? null;
  const modules = useMemo(() => buildModules(selectedCourse?.contentStructure || []), [selectedCourse]);
  const myEnrollment = selectedCourse?.myEnrollment || null;
  const currentModuleIndex = Math.min(myEnrollment?.currentModuleIndex || 0, Math.max(modules.length - 1, 0));
  const currentModule = modules[currentModuleIndex] || null;

  useEffect(() => {
    if (!selectedCourse) {
      setSelectedCourseId(null);
      return;
    }

    if (!courses.some((course) => course.id === selectedCourseId)) {
      setSelectedCourseId(selectedCourse.id);
    }

    setCourseError("");
    setCourseSuccess("");
  }, [courses, selectedCourse, selectedCourseId]);

  const handleStartCourse = async () => {
    if (!selectedCourse) {
      return;
    }

    setIsStarting(true);
    setCourseError("");
    setCourseSuccess("");

    try {
      const result = await workspaceService.startCourse(selectedCourse.id);

      if (!result.success) {
        setCourseError(result.error || "Не удалось начать курс");
        return;
      }

      setCourseSuccess(result.message || "Курс начат");
      await refreshWorkspaceData();
    } catch (error) {
      setCourseError(error.response?.data?.error || "Не удалось начать курс");
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteModule = async () => {
    if (!selectedCourse || !myEnrollment || myEnrollment.isCompleted) {
      return;
    }

    setIsAdvancing(true);
    setCourseError("");
    setCourseSuccess("");

    try {
      const result = await workspaceService.advanceCourseProgress(selectedCourse.id);

      if (!result.success) {
        setCourseError(result.error || "Не удалось обновить прогресс курса");
        return;
      }

      setCourseSuccess(result.message || "Модуль завершен");
      await refreshWorkspaceData();
    } catch (error) {
      setCourseError(error.response?.data?.error || "Не удалось обновить прогресс курса");
    } finally {
      setIsAdvancing(false);
    }
  };

  if (workspaceLoading) {
    return <div className="workspace-page">Загрузка данных...</div>;
  }

  if (workspaceError) {
    return <div className="workspace-page">{workspaceError}</div>;
  }

  return (
    <div className="workspace-page">
      <section className="workspace-hero">
        <div>
          <span className="workspace-eyebrow">Развитие команды</span>
          <h2 className="workspace-title">Обучение и курсы</h2>
          <p className="workspace-description">
            Прогресс теперь идет по модулям: после завершения текущего модуля открывается следующий, а после последнего курс
            автоматически считается завершенным.
          </p>
        </div>
        <div className="workspace-metrics">
          <div className="workspace-metric">
            <span className="workspace-metric-value">{courses.length}</span>
            <span className="workspace-metric-label">Доступно курсов</span>
          </div>
          <div className="workspace-metric">
            <span className="workspace-metric-value">{courses.filter((course) => course.myEnrollment).length}</span>
            <span className="workspace-metric-label">Начаты вами</span>
          </div>
          <div className="workspace-metric">
            <span className="workspace-metric-value">{courses.filter((course) => course.myEnrollment?.isCompleted).length}</span>
            <span className="workspace-metric-label">Завершены вами</span>
          </div>
        </div>
      </section>

      <section className="appeals-layout">
        <div className="appeals-list-panel">
          <div className="appeals-list-header">
            <h3 className="appeals-list-title">Каталог ({courses.length})</h3>
          </div>
          <div className="appeals-list">
            {courses.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => setSelectedCourseId(course.id)}
                className={`appeal-list-item ${selectedCourse?.id === course.id ? "appeal-list-item-active" : ""}`}
              >
                <div className="appeal-list-item-top">
                  <span className="appeal-list-subject">{course.title}</span>
                  <span className={`workspace-pill workspace-pill-${course.myEnrollment?.isCompleted ? "completed" : course.status}`}>
                    {course.myEnrollment?.isCompleted ? "Завершен" : course.status === "draft" ? "Черновик" : "Активен"}
                  </span>
                </div>
                <div className="workspace-card-top">
                  <span className="workspace-pill workspace-pill-neutral">{course.category}</span>
                  {course.myEnrollment ? (
                    <span className="workspace-pill workspace-pill-active">{course.myEnrollment.progressPercent}%</span>
                  ) : null}
                </div>
                <div className="appeal-list-meta">
                  <span>{course.totalModules || course.modules} модулей</span>
                  <span>{course.duration}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="appeal-detail-panel">
          {selectedCourse ? (
            <div className="appeal-detail-body">
              <div className="appeal-detail-header survey-detail-header">
                <div>
                  <h3 className="appeal-detail-title">{selectedCourse.title}</h3>
                  <div className="workspace-card-top">
                    <span className={`workspace-pill workspace-pill-${selectedCourse.status}`}>
                      {selectedCourse.status === "draft" ? "Черновик" : "Активен"}
                    </span>
                    <span className="workspace-pill workspace-pill-neutral">{selectedCourse.category}</span>
                    {selectedCourse.myEnrollment ? (
                      <span className="workspace-pill workspace-pill-active">
                        Прогресс: {selectedCourse.myEnrollment.progressPercent}%
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <p className="workspace-card-copy">{selectedCourse.description}</p>

              <div className="workspace-meta-list">
                <div className="workspace-meta-item">
                  <School sx={{ fontSize: 16 }} />
                  <span>Преподаватель: {selectedCourse.instructor}</span>
                </div>
                <div className="workspace-meta-item">
                  <AutoStories sx={{ fontSize: 16 }} />
                  <span>
                    {selectedCourse.totalModules || selectedCourse.modules} модулей · {selectedCourse.totalLessons} материалов · {selectedCourse.duration}
                  </span>
                </div>
                <div className="workspace-meta-item">
                  <Groups sx={{ fontSize: 16 }} />
                  <span>{selectedCourse.enrolled} записаны</span>
                </div>
              </div>

              <div className="workspace-progress">
                <div className="workspace-progress-track">
                  <div
                    className="workspace-progress-fill"
                    style={{ width: `${selectedCourse.myEnrollment?.progressPercent || 0}%` }}
                  ></div>
                </div>
                <span className="workspace-progress-label">{selectedCourse.myEnrollment?.progressPercent || 0}%</span>
              </div>

              <div className="course-lesson-list">
                {modules.map((module, moduleIndex) => {
                  const completedModules = selectedCourse.myEnrollment?.completedModules || 0;
                  const isCompleted = moduleIndex < completedModules;
                  const isCurrent = moduleIndex === currentModuleIndex && !selectedCourse.myEnrollment?.isCompleted;

                  return (
                    <article
                      key={module.id}
                      className={`course-lesson-card ${
                        isCompleted ? "course-lesson-card-completed" : isCurrent ? "course-lesson-card-current" : ""
                      }`}
                    >
                      <div className="course-lesson-header">
                        <span className="workspace-pill workspace-pill-neutral">Модуль {moduleIndex + 1}</span>
                        <span className={`workspace-pill workspace-pill-${isCompleted ? "completed" : isCurrent ? "open" : "pending"}`}>
                          {isCompleted ? "Пройден" : isCurrent ? "Текущий модуль" : "Ожидает"}
                        </span>
                      </div>
                      <h4 className="survey-question-title">{module.title}</h4>
                      <div className="module-lesson-list">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div key={`${module.id}-${lessonIndex}`} className="module-lesson-item">
                            <div>
                              <strong>{lesson.title || `Материал ${lessonIndex + 1}`}</strong>
                              <p>
                                {lesson.type || "материал"}
                                {lesson.duration ? ` · ${Math.max(1, Math.round(Number(lesson.duration) / 60))} мин` : ""}
                              </p>
                            </div>
                            {lesson.url ? (
                              <a href={lesson.url} target="_blank" rel="noreferrer" className="course-link">
                                Открыть
                              </a>
                            ) : null}
                          </div>
                        ))}
                      </div>
                      {isCurrent && myEnrollment && !myEnrollment.isCompleted ? (
                        <button
                          type="button"
                          className="appeal-chat-send survey-submit-button module-complete-button"
                          onClick={handleCompleteModule}
                          disabled={isAdvancing}
                        >
                          <CheckCircleOutline sx={{ fontSize: 18 }} />
                          <span>{isAdvancing ? "Сохранение..." : "Завершить модуль"}</span>
                        </button>
                      ) : null}
                    </article>
                  );
                })}
              </div>

              {currentModule && myEnrollment && !myEnrollment.isCompleted ? (
                <div className="workspace-panel course-current-panel">
                  <div className="workspace-card-top">
                    <span className="workspace-pill workspace-pill-open">Сейчас открыт</span>
                    <span className="workspace-pill workspace-pill-neutral">{currentModule.title}</span>
                  </div>
                  <h4 className="workspace-card-title">
                    Модуль {currentModuleIndex + 1} из {selectedCourse.totalModules || selectedCourse.modules}
                  </h4>
                  <p className="workspace-card-copy">
                    После нажатия на кнопку завершения текущий модуль будет закрыт, а следующий откроется автоматически.
                  </p>
                </div>
              ) : null}

              {courseError ? <div className="workspace-empty">{courseError}</div> : null}
              {courseSuccess ? <div className="workspace-success">{courseSuccess}</div> : null}

              <div className="survey-actions">
                {!myEnrollment ? (
                  <button type="button" className="appeal-chat-send survey-submit-button" onClick={handleStartCourse} disabled={isStarting}>
                    <PlayCircleOutline sx={{ fontSize: 18 }} />
                    <span>{isStarting ? "Запуск..." : "Начать курс"}</span>
                  </button>
                ) : myEnrollment.isCompleted ? (
                  <div className="workspace-footer-note">
                    <CheckCircleOutline sx={{ fontSize: 16 }} />
                    <span>Курс завершен автоматически после последнего модуля. Итоговый результат: {myEnrollment.finalScore ?? 100}%</span>
                  </div>
                ) : null}
              </div>

              {canViewPeopleInsights ? (
                <div className="course-lesson-list">
                  <article className="course-lesson-card">
                    <div className="course-lesson-header">
                      <span className="workspace-pill workspace-pill-neutral">HR / Администратор</span>
                      <span className="workspace-pill workspace-pill-active">{selectedCourse.participants?.length || 0} сотрудников</span>
                    </div>
                    <h4 className="survey-question-title">Прогресс сотрудников по курсу</h4>
                    {(selectedCourse.participants || []).length ? (
                      <div className="people-result-list">
                        {selectedCourse.participants.map((participant) => (
                          <div key={participant.enrollmentId} className="people-result-card">
                            <div className="employee-detail-item-head">
                              <strong>{participant.employeeName}</strong>
                              <span className={`workspace-pill workspace-pill-${participant.isCompleted ? "completed" : "open"}`}>
                                {participant.isCompleted ? "Завершен" : `${participant.progressPercent}%`}
                              </span>
                            </div>
                            <p>{participant.department || "Без отдела"} · {participant.role || "employee"}</p>
                            <div className="workspace-progress">
                              <div className="workspace-progress-track">
                                <div className="workspace-progress-fill" style={{ width: `${participant.progressPercent}%` }} />
                              </div>
                              <span className="workspace-progress-label">{participant.progressPercent}%</span>
                            </div>
                            <div className="employee-inline-meta">
                              <span>{participant.completedModules} из {participant.totalModules} модулей</span>
                              <span>{participant.completedAt ? `Завершён: ${formatDate(participant.completedAt)}` : "В процессе"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state compact-empty">Пока никто не начал этот курс</div>
                    )}
                  </article>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="workspace-empty">
              <span>Нет доступных курсов.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Training;
