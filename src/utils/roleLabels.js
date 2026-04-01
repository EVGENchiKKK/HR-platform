const ROLE_LABELS = {
  admin: "Администратор",
  hr: "HR-специалист",
  manager: "Руководитель",
  employee: "Сотрудник",
};

export const getRoleLabel = (roleValue) => {
  const normalizedRole = `${roleValue || ""}`.trim().toLowerCase();
  return ROLE_LABELS[normalizedRole] || roleValue || "Сотрудник";
};

export default getRoleLabel;
