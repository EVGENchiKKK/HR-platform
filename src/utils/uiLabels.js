export const PRIORITY_LABELS = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
  urgent: "Срочный",
};

export const TASK_STATUS_LABELS = {
  pending: "Ожидает",
  in_progress: "В работе",
  completed: "Завершена",
  done: "Завершена",
  cancelled: "Отменена",
  overdue: "Просрочена",
};

export const APPEAL_STATUS_LABELS = {
  open: "Открыто",
  in_review: "На рассмотрении",
  resolved: "Решено",
  closed: "Закрыто",
};

export const APPEAL_TYPE_LABELS = {
  complaint: "Жалоба",
  suggestion: "Предложение",
  question: "Вопрос",
};

export const SURVEY_TYPE_LABELS = {
  survey: "Опрос",
  test: "Тест",
};

export const SURVEY_STATUS_LABELS = {
  active: "Активен",
  completed: "Завершен",
  draft: "Черновик",
  archived: "Архив",
};

export const COURSE_STATUS_LABELS = {
  active: "Активен",
  completed: "Завершен",
  draft: "Черновик",
};

export const CATEGORY_LABELS = {
  "IT": "ИТ",
  "IT-поддержка": "ИТ-поддержка",
  "Soft Skills": "Гибкие навыки",
};

export const formatPriorityLabel = (value) => PRIORITY_LABELS[`${value || ""}`.trim().toLowerCase()] || value || "—";
export const formatTaskStatusLabel = (value) => TASK_STATUS_LABELS[`${value || ""}`.trim().toLowerCase()] || value || "—";
export const formatAppealStatusLabel = (value) => APPEAL_STATUS_LABELS[`${value || ""}`.trim().toLowerCase()] || value || "—";
export const formatAppealTypeLabel = (value) => APPEAL_TYPE_LABELS[`${value || ""}`.trim().toLowerCase()] || value || "Обращение";
export const formatSurveyTypeLabel = (value) => SURVEY_TYPE_LABELS[`${value || ""}`.trim().toLowerCase()] || value || "—";
export const formatSurveyStatusLabel = (value) => SURVEY_STATUS_LABELS[`${value || ""}`.trim().toLowerCase()] || value || "—";
export const formatCourseStatusLabel = (value) => COURSE_STATUS_LABELS[`${value || ""}`.trim().toLowerCase()] || value || "—";
export const formatCategoryLabel = (value) => CATEGORY_LABELS[`${value || ""}`.trim()] || value || "—";
