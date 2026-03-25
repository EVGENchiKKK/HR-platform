import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AssignmentTurnedIn, Groups, Poll, Quiz, TaskAlt } from "@mui/icons-material";
import workspaceService from "../api/workspaceService";
import "./../style/workspace-pages.css";

const typeLabels = {
  survey: "Опрос",
  test: "Тест",
};

const statusLabels = {
  active: "Активен",
  completed: "Завершен",
  draft: "Черновик",
};

const buildInitialAnswers = (survey) => {
  const answerMap = {};
  const previousAnswers = Array.isArray(survey?.myResult?.answers) ? survey.myResult.answers : [];

  previousAnswers.forEach((item) => {
    answerMap[String(item.question_id)] = item.answer ?? "";
  });

  (survey?.questions || []).forEach((question) => {
    if (!(String(question.id) in answerMap)) {
      answerMap[String(question.id)] = "";
    }
  });

  return answerMap;
};

const isSurveyOpenNow = (survey) => {
  if (survey.status !== "active") {
    return false;
  }

  if (!survey.deadline) {
    return true;
  }

  const endDate = new Date(survey.deadline);
  return Number.isNaN(endDate.getTime()) || endDate >= new Date();
};

export const Surveys = () => {
  const { user, workspaceData, workspaceLoading, workspaceError, refreshWorkspaceData } = useOutletContext();
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const currentRole = `${workspaceData.currentUserRole || user?.role || user?.R_name || ""}`.toLowerCase();
  const canViewPeopleInsights = ["hr", "admin"].includes(currentRole);
  const userDepartment = user?.departmentId || user?.Department_ID || null;

  const surveys = useMemo(
    () => (workspaceData.surveys || []).filter((survey) => {
      if (canViewPeopleInsights) {
        return true;
      }

      return survey.visibleToCurrentUser !== false
        && (!survey.departmentId || Number(survey.departmentId) === Number(userDepartment));
    }),
    [canViewPeopleInsights, userDepartment, workspaceData.surveys]
  );

  const visibleSurveys = useMemo(
    () => surveys.filter((item) => typeFilter === "all" || item.type === typeFilter),
    [surveys, typeFilter]
  );

  const selectedSurvey = visibleSurveys.find((item) => item.id === selectedSurveyId) ?? visibleSurveys[0] ?? null;

  useEffect(() => {
    if (!selectedSurvey) {
      if (selectedSurveyId !== null) {
        setSelectedSurveyId(null);
      }
      setAnswers((current) => (Object.keys(current).length ? {} : current));
      return;
    }

    if (!visibleSurveys.some((item) => item.id === selectedSurveyId)) {
      setSelectedSurveyId(selectedSurvey.id);
      return;
    }

    const nextAnswers = buildInitialAnswers(selectedSurvey);
    setAnswers((current) => {
      const currentSerialized = JSON.stringify(current);
      const nextSerialized = JSON.stringify(nextAnswers);
      return currentSerialized === nextSerialized ? current : nextAnswers;
    });
    setSubmitError("");
    setSubmitSuccess("");
  }, [
    selectedSurvey,
    selectedSurveyId,
    visibleSurveys,
    selectedSurvey?.id,
    selectedSurvey?.myResult?.id,
    selectedSurvey?.myResult?.submittedAt,
  ]);

  const completionRate = useMemo(() => {
    if (canViewPeopleInsights) {
      const openSurveys = surveys.filter((survey) => isSurveyOpenNow(survey));
      const totalEmployees = workspaceData.employees?.length || 0;
      const totalExpected = openSurveys.reduce((sum, survey) => sum + totalEmployees, 0);
      const totalDone = openSurveys.reduce((sum, survey) => sum + (survey.submissions?.length || 0), 0);
      return totalExpected ? Math.round((totalDone / totalExpected) * 100) : 0;
    }

    const openForCurrentUser = surveys.filter((survey) => isSurveyOpenNow(survey));
    const completedByCurrentUser = openForCurrentUser.filter((survey) => survey.myResult?.isCompleted).length;
    return openForCurrentUser.length ? Math.round((completedByCurrentUser / openForCurrentUser.length) * 100) : 0;
  }, [canViewPeopleInsights, surveys, workspaceData.employees]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [String(questionId)]: value
    }));
  };

  const handleSubmitSurvey = async () => {
    if (!selectedSurvey) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const result = await workspaceService.submitSurvey(selectedSurvey.id, { answers });

      if (!result.success) {
        setSubmitError(result.error || "Не удалось сохранить ответы");
        return;
      }

      setSubmitSuccess(`Ответы сохранены. Результат: ${result.data?.score ?? 0}%`);
      await refreshWorkspaceData();
    } catch (error) {
      setSubmitError(error.response?.data?.error || "Не удалось сохранить ответы");
    } finally {
      setIsSubmitting(false);
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
          <span className="workspace-eyebrow">Обратная связь</span>
          <h2 className="workspace-title">Опросы и тестирование</h2>
          <p className="workspace-description">
            Процент прохождения теперь считается по реально открытым пользователю опросам, а HR и администратор видят корректную
            сводку по сотрудникам.
          </p>
        </div>
        <div className="workspace-metrics">
          <div className="workspace-metric">
            <span className="workspace-metric-value">{surveys.length}</span>
            <span className="workspace-metric-label">Доступно</span>
          </div>
          <div className="workspace-metric">
            <span className="workspace-metric-value">{completionRate}%</span>
            <span className="workspace-metric-label">
              {canViewPeopleInsights ? "Прохождение по сотрудникам" : "Ваш процент прохождения"}
            </span>
          </div>
          <div className="workspace-metric">
            <span className="workspace-metric-value">{surveys.filter((item) => item.myResult?.isCompleted).length}</span>
            <span className="workspace-metric-label">Пройдены вами</span>
          </div>
        </div>
      </section>

      <section className="workspace-toolbar">
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="workspace-select">
          <option value="all">Все форматы</option>
          <option value="survey">Опросы</option>
          <option value="test">Тесты</option>
        </select>
      </section>

      <section className="appeals-layout">
        <div className="appeals-list-panel">
          <div className="appeals-list-header">
            <h3 className="appeals-list-title">Список ({visibleSurveys.length})</h3>
          </div>
          <div className="appeals-list">
            {visibleSurveys.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedSurveyId(item.id)}
                className={`appeal-list-item ${selectedSurvey?.id === item.id ? "appeal-list-item-active" : ""}`}
              >
                <div className="appeal-list-item-top">
                  <span className="appeal-list-subject">{item.title}</span>
                  <span className={`workspace-pill workspace-pill-${item.myResult?.isCompleted ? "completed" : item.status}`}>
                    {item.myResult?.isCompleted ? "Пройден" : statusLabels[item.status] || item.status}
                  </span>
                </div>
                <div className="workspace-card-top">
                  <span className="workspace-pill workspace-pill-neutral">{typeLabels[item.type] || item.type}</span>
                  {item.myResult?.isCompleted ? (
                    <span className="workspace-pill workspace-pill-active">Ваш результат: {item.myResult.score}%</span>
                  ) : null}
                </div>
                <div className="appeal-list-meta">
                  <span>{canViewPeopleInsights ? `${item.submissions?.length || 0} результатов` : item.department || "Общий доступ"}</span>
                  <span>{item.deadline || "Без срока"}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="appeal-detail-panel">
          {selectedSurvey ? (
            <div className="appeal-detail-body">
              <div className="appeal-detail-header survey-detail-header">
                <div>
                  <h3 className="appeal-detail-title">{selectedSurvey.title}</h3>
                  <div className="workspace-card-top">
                    <span className={`workspace-pill workspace-pill-${selectedSurvey.status}`}>{statusLabels[selectedSurvey.status] || selectedSurvey.status}</span>
                    <span className="workspace-pill workspace-pill-neutral">{typeLabels[selectedSurvey.type] || selectedSurvey.type}</span>
                    {selectedSurvey.myResult?.isCompleted ? (
                      <span className="workspace-pill workspace-pill-active">Ваш результат: {selectedSurvey.myResult.score}%</span>
                    ) : null}
                  </div>
                </div>
              </div>

              <p className="workspace-card-copy">{selectedSurvey.description}</p>

              <div className="workspace-meta-list">
                <div className="workspace-meta-item">
                  {selectedSurvey.type === "survey" ? <Poll sx={{ fontSize: 16 }} /> : <Quiz sx={{ fontSize: 16 }} />}
                  <span>Автор: {selectedSurvey.createdBy}</span>
                </div>
                <div className="workspace-meta-item">
                  <Groups sx={{ fontSize: 16 }} />
                  <span>
                    {canViewPeopleInsights ? `${selectedSurvey.submissions?.length || 0} сотрудников прошли` : selectedSurvey.department || "Доступно всем"}
                  </span>
                </div>
                <div className="workspace-meta-item">
                  <AssignmentTurnedIn sx={{ fontSize: 16 }} />
                  <span>Дедлайн: {selectedSurvey.deadline || "Не указан"}</span>
                </div>
              </div>

              <div className="survey-question-list">
                {(selectedSurvey.questions || []).map((question, index) => (
                  <article key={question.id || index} className="survey-question-card">
                    <div className="survey-question-header">
                      <span className="workspace-pill workspace-pill-neutral">Вопрос {index + 1}</span>
                      {question.required ? <span className="workspace-pill workspace-pill-high">Обязательный</span> : null}
                    </div>
                    <h4 className="survey-question-title">{question.text}</h4>

                    {question.type === "choice" ? (
                      <div className="survey-options">
                        {(question.options || []).map((option, optionIndex) => {
                          const optionValue = String(selectedSurvey.type === "test" ? optionIndex : option);
                          const answerValue = String(answers[String(question.id)] ?? "");
                          return (
                            <label key={optionValue} className={`survey-option ${answerValue === optionValue ? "survey-option-active" : ""}`}>
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                checked={answerValue === optionValue}
                                onChange={() => handleAnswerChange(question.id, optionValue)}
                              />
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : question.type === "rating" ? (
                      <div className="survey-options survey-options-inline">
                        {(question.options || []).map((option) => {
                          const optionValue = String(option);
                          const answerValue = String(answers[String(question.id)] ?? "");
                          return (
                            <label key={optionValue} className={`survey-option survey-option-compact ${answerValue === optionValue ? "survey-option-active" : ""}`}>
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                checked={answerValue === optionValue}
                                onChange={() => handleAnswerChange(question.id, optionValue)}
                              />
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <textarea
                        className="appeal-chat-input appeal-chat-input-multiline"
                        placeholder="Введите ответ"
                        value={answers[String(question.id)] ?? ""}
                        onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                      />
                    )}
                  </article>
                ))}
              </div>

              {submitError ? <div className="workspace-empty">{submitError}</div> : null}
              {submitSuccess ? <div className="workspace-success">{submitSuccess}</div> : null}

              <div className="survey-actions">
                <button type="button" className="appeal-secondary-action" onClick={() => setAnswers(buildInitialAnswers(selectedSurvey))}>
                  Сбросить ответы
                </button>
                <button type="button" className="appeal-chat-send survey-submit-button" onClick={handleSubmitSurvey} disabled={isSubmitting}>
                  <TaskAlt sx={{ fontSize: 18 }} />
                  <span>{isSubmitting ? "Сохранение..." : selectedSurvey.myResult?.isCompleted ? "Отправить заново" : "Отправить ответы"}</span>
                </button>
              </div>

              {canViewPeopleInsights ? (
                <div className="survey-question-list">
                  <article className="survey-question-card">
                    <div className="survey-question-header">
                      <span className="workspace-pill workspace-pill-neutral">HR / Администратор</span>
                      <span className="workspace-pill workspace-pill-active">{selectedSurvey.submissions?.length || 0} результатов</span>
                    </div>
                    <h4 className="survey-question-title">Результаты сотрудников</h4>
                    {(selectedSurvey.submissions || []).length ? (
                      <div className="people-result-list">
                        {selectedSurvey.submissions.map((submission) => (
                          <div key={submission.resultId} className="people-result-card">
                            <div className="employee-detail-item-head">
                              <strong>{submission.employeeName}</strong>
                              <span className="workspace-pill workspace-pill-active">{submission.score}%</span>
                            </div>
                            <p>{submission.department || "Без отдела"} · {submission.role || "employee"}</p>
                            <div className="employee-inline-meta">
                              <span>{submission.isCompleted ? "Пройден" : "Не завершён"}</span>
                              <span>{submission.submittedAt || submission.startedAt || "Без даты"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state compact-empty">Пока нет результатов сотрудников</div>
                    )}
                  </article>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="workspace-empty">
              <span>Нет доступных опросов по выбранному фильтру.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Surveys;
