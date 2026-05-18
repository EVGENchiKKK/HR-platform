const DATE_PLACEHOLDER = "Дата не указана";
const DATE_TIME_PLACEHOLDER = "Дата и время не указаны";

const toDate = (value) => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value, fallback = DATE_PLACEHOLDER) => {
  const date = toDate(value);
  if (!date) {
    return fallback;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
};

export const formatDateTime = (value, fallback = DATE_TIME_PLACEHOLDER) => {
  const date = toDate(value);
  if (!date) {
    return fallback;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

export const formatShortDate = (value, fallback = DATE_PLACEHOLDER) => {
  const date = toDate(value);
  if (!date) {
    return fallback;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
};

export default {
  formatDate,
  formatDateTime,
  formatShortDate
};
