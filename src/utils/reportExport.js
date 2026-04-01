import getRoleLabel from "./roleLabels";

const clampPercent = (value) => {
  const normalized = Number(value || 0);
  if (!Number.isFinite(normalized)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(normalized)));
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("ru-RU");
};

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("ru-RU");
};

const formatPercent = (value) => `${clampPercent(value)}%`;

const formatTaskStatus = (status) => {
  const labels = {
    pending: "Ожидает",
    in_progress: "В работе",
    completed: "Выполнена",
    done: "Выполнена",
    cancelled: "Отменена",
    overdue: "Просрочена",
  };

  return labels[status] || status || "—";
};

const formatAppealStatus = (status) => {
  const labels = {
    open: "Открыто",
    in_review: "На рассмотрении",
    resolved: "Решено",
    closed: "Закрыто",
  };

  return labels[status] || status || "—";
};

const formatSurveyStatus = (status) => {
  const labels = {
    active: "Активен",
    draft: "Черновик",
    completed: "Завершен",
    archived: "Архив",
  };

  return labels[status] || status || "—";
};

const formatPriority = (priority) => {
  const labels = {
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
    urgent: "Срочный",
  };

  return labels[priority] || priority || "—";
};

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const buildSummaryRows = ({ employees, departments, tasks, appeals, surveys, courses }) => {
  const completedTasks = tasks.filter((task) => ["completed", "done"].includes(task.status)).length;
  const openAppeals = appeals.filter((appeal) => ["open", "in_review"].includes(appeal.status)).length;
  const completedAppeals = appeals.filter((appeal) => ["resolved", "closed"].includes(appeal.status)).length;
  const activeSurveys = surveys.filter((survey) => survey.status === "active").length;
  const completedCourses = courses.filter((course) => course.myEnrollment?.status === "completed").length;
  const avgKpi = employees.length
    ? Math.round(employees.reduce((sum, employee) => sum + Number(employee.kpi || 0), 0) / employees.length)
    : 0;

  return [
    { metric: "Сотрудники", value: employees.length },
    { metric: "Отделы", value: departments.length },
    { metric: "Средний KPI", value: formatPercent(avgKpi) },
    { metric: "Всего задач", value: tasks.length },
    { metric: "Выполнено задач", value: completedTasks },
    { metric: "Открытые обращения", value: openAppeals },
    { metric: "Закрытые обращения", value: completedAppeals },
    { metric: "Активные опросы", value: activeSurveys },
    { metric: "Доступные курсы", value: courses.length },
    { metric: "Завершенные курсы", value: completedCourses },
  ];
};

const buildReportData = ({ workspaceData = {}, user = null, scopeTitle = "Отчет по аналитике" }) => {
  const employees = workspaceData.employees || [];
  const departments = workspaceData.departments || [];
  const tasks = workspaceData.tasks || [];
  const appeals = workspaceData.appeals || [];
  const surveys = workspaceData.surveys || [];
  const courses = workspaceData.courses || [];
  const monthlyStats = workspaceData.monthlyStats || [];
  const departmentMonthlyStats = workspaceData.departmentMonthlyStats || [];

  const generatedAt = new Date();
  const currentRole = `${workspaceData.currentUserRole || user?.role || user?.R_name || ""}`.toLowerCase();
  const reportScope = ["hr", "admin"].includes(currentRole) ? "HR/Admin" : "Сотрудник";

  const summary = buildSummaryRows({ employees, departments, tasks, appeals, surveys, courses });

  return {
    title: scopeTitle,
    generatedAt,
    reportScope,
    summary,
    monthlyStats: monthlyStats.map((item) => ({
      Месяц: item.month || "—",
      Задачи: Number(item.tasks || 0),
      Обращения: Number(item.appeals || 0),
      Найм: Number(item.hires || 0),
    })),
    departmentMonthlyStats: departmentMonthlyStats.map((item) => ({ ...item })),
    departments: departments.map((department) => ({
      Отдел: department.name || "—",
      Сотрудники: Number(department.employeeCount || 0),
      KPI: formatPercent(department.kpi),
      "Активные задачи": Number(department.activeTasks || 0),
      Обращения: Number(department.appealCount || 0),
    })),
    employees: employees.map((employee) => ({
      Сотрудник: employee.name || "—",
      Роль: getRoleLabel(employee.position || employee.role || employee.R_name),
      Отдел: employee.department || "—",
      KPI: formatPercent(employee.kpi),
      "Завершено задач": `${Number(employee.completedTasks || 0)}/${Number(employee.totalTasks || 0)}`,
      "Прогресс обучения": formatPercent(employee.moduleProgress || employee.courseProgress),
      "Опросы": formatPercent(employee.averageSurveyScore),
      Активность: formatPercent(employee.activityScore),
      Статус: employee.status || "active",
    })),
    tasks: tasks.map((task) => ({
      Задача: task.title || task.name || "—",
      Исполнитель: task.assigneeName || task.employeeName || task.userName || "—",
      Отдел: task.departmentName || task.department || "—",
      Статус: formatTaskStatus(task.status),
      Приоритет: formatPriority(task.priority),
      KPI: formatPercent(task.kpiWeight),
      Срок: formatDate(task.dueDate || task.deadline),
      "Дата завершения": formatDate(task.completedAt),
    })),
    appeals: appeals.map((appeal) => ({
      Тема: appeal.topic || appeal.subject || "—",
      Автор: appeal.authorName || appeal.employeeName || "—",
      Получатель: appeal.recipientName || "—",
      Статус: formatAppealStatus(appeal.status),
      Приоритет: formatPriority(appeal.priority),
      Тип: appeal.type || "—",
      Создано: formatDate(appeal.createdAt),
      Обновлено: formatDate(appeal.updatedAt || appeal.closedAt),
    })),
    surveys: surveys.map((survey) => ({
      Название: survey.title || "—",
      Тип: survey.type || "—",
      Статус: formatSurveyStatus(survey.status),
      "Процент прохождения": formatPercent(
        survey.completionRate
          ?? (survey.totalAssigned
            ? (Number(survey.completedCount || 0) / Number(survey.totalAssigned || 1)) * 100
            : survey.myResult?.isCompleted ? 100 : 0)
      ),
      "Средний балл": formatPercent(survey.averageScore),
      "Доступно сотрудникам": Number(survey.totalAssigned || 0),
      Завершили: Number(survey.completedCount || 0),
    })),
    courses: courses.map((course) => ({
      Курс: course.title || "—",
      Модули: Number(course.totalModules || 0),
      "Мой прогресс": formatPercent(course.myEnrollment?.progressPercent),
      Статус: course.myEnrollment?.status || course.status || "—",
      Участники: Number(course.participants?.length || 0),
      Завершили: Number(
        course.participants?.filter((participant) => participant.status === "completed").length || 0
      ),
    })),
  };
};

const appendWorksheet = (workbook, name, rows) => {
  const data = rows?.length ? rows : [{ Данные: "Нет данных" }];
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, name.slice(0, 31));
};

export const exportAnalyticsToExcel = async ({ workspaceData, user, scopeTitle }) => {
  const report = buildReportData({ workspaceData, user, scopeTitle });
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  appendWorksheet(workbook, "Сводка", report.summary.map((row) => ({ Метрика: row.metric, Значение: row.value })));
  appendWorksheet(workbook, "Месячная статистика", report.monthlyStats);
  appendWorksheet(workbook, "Отделы", report.departments);
  appendWorksheet(workbook, "Сотрудники", report.employees);
  appendWorksheet(workbook, "Задачи", report.tasks);
  appendWorksheet(workbook, "Обращения", report.appeals);
  appendWorksheet(workbook, "Опросы", report.surveys);
  appendWorksheet(workbook, "Курсы", report.courses);

  const fileName = `analytics-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportAnalyticsToPdf = async ({ workspaceData, user, scopeTitle }) => {
  const report = buildReportData({ workspaceData, user, scopeTitle });
  const [{ jsPDF }] = await Promise.all([
    import("jspdf"),
  ]);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = "1120px";
  container.style.padding = "32px";
  container.style.background = "#ffffff";
  container.style.color = "#0f172a";
  container.style.fontFamily = "Arial, sans-serif";

  const renderTable = (title, headers, rows) => `
    <section style="margin-top: 24px;">
      <h2 style="font-size: 18px; margin: 0 0 12px 0;">${title}</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr>
            ${headers.map((header) => `<th style="border: 1px solid #cbd5e1; background: #e0e7ff; padding: 8px; text-align: left;">${header}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${(rows.length ? rows : [["Нет данных"]]).map((row) => `
            <tr>
              ${headers.map((_, index) => `<td style="border: 1px solid #cbd5e1; padding: 8px; vertical-align: top;">${row[index] ?? "—"}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;

  container.innerHTML = `
    <div>
      <h1 style="font-size: 28px; margin: 0 0 12px 0;">${report.title}</h1>
      <p style="margin: 0 0 6px 0; font-size: 13px;">Сформировано: ${formatDateTime(report.generatedAt)}</p>
      <p style="margin: 0; font-size: 13px;">Область видимости: ${report.reportScope}</p>
      ${renderTable("Сводка", ["Метрика", "Значение"], report.summary.map((row) => [row.metric, String(row.value)]))}
      ${renderTable("Месячная статистика", ["Месяц", "Задачи", "Обращения", "Найм"], report.monthlyStats.map((row) => [row.Месяц, row.Задачи, row.Обращения, row.Найм]))}
      ${renderTable("Отделы", ["Отдел", "Сотрудники", "KPI", "Активные задачи", "Обращения"], report.departments.map((row) => [row.Отдел, row.Сотрудники, row.KPI, row["Активные задачи"], row.Обращения]))}
      ${renderTable("Сотрудники", ["Сотрудник", "Роль", "Отдел", "KPI", "Активность"], report.employees.map((row) => [row.Сотрудник, row.Роль, row.Отдел, row.KPI, row.Активность]))}
      ${renderTable("Задачи", ["Задача", "Исполнитель", "Статус", "Приоритет", "Срок"], report.tasks.map((row) => [row.Задача, row.Исполнитель, row.Статус, row.Приоритет, row.Срок]))}
      ${renderTable("Опросы", ["Название", "Тип", "Статус", "Процент прохождения", "Средний балл"], report.surveys.map((row) => [row.Название, row.Тип, row.Статус, row["Процент прохождения"], row["Средний балл"]]))}
      ${renderTable("Курсы", ["Курс", "Модули", "Мой прогресс", "Статус", "Завершили"], report.courses.map((row) => [row.Курс, row.Модули, row["Мой прогресс"], row.Статус, row.Завершили]))}
    </div>
  `;

  document.body.appendChild(container);

  await doc.html(container, {
    margin: [12, 10, 12, 10],
    autoPaging: "text",
    width: 190,
    windowWidth: 1120,
    callback: (instance) => {
      instance.save(`analytics-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    },
  });

  document.body.removeChild(container);
};

const buildDocxTable = (docx, title, headers, rows) => ([
  new docx.Paragraph({
    text: title,
    heading: docx.HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
  }),
  new docx.Table({
    width: { size: 100, type: docx.WidthType.PERCENTAGE },
    rows: [
      new docx.TableRow({
        children: headers.map((header) => new docx.TableCell({
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: header, bold: true })] })],
        })),
      }),
      ...(rows.length ? rows : [["Нет данных"]]).map((row) => new docx.TableRow({
        children: headers.map((_, index) => new docx.TableCell({
          children: [new docx.Paragraph(String(row[index] ?? "—"))],
        })),
      })),
    ],
  }),
]);

export const exportAnalyticsToWord = async ({ workspaceData, user, scopeTitle }) => {
  const report = buildReportData({ workspaceData, user, scopeTitle });
  const docx = await import("docx");

  const children = [
    new docx.Paragraph({
      text: report.title,
      heading: docx.HeadingLevel.TITLE,
      spacing: { after: 120 },
    }),
    new docx.Paragraph(`Сформировано: ${formatDateTime(report.generatedAt)}`),
    new docx.Paragraph(`Область видимости: ${report.reportScope}`),
    ...buildDocxTable(
      docx,
      "Сводка",
      ["Метрика", "Значение"],
      report.summary.map((row) => [row.metric, String(row.value)])
    ),
    ...buildDocxTable(
      docx,
      "Месячная статистика",
      ["Месяц", "Задачи", "Обращения", "Найм"],
      report.monthlyStats.map((row) => [row.Месяц, row.Задачи, row.Обращения, row.Найм])
    ),
    ...buildDocxTable(
      docx,
      "Отделы",
      ["Отдел", "Сотрудники", "KPI", "Активные задачи", "Обращения"],
      report.departments.map((row) => [row.Отдел, row.Сотрудники, row.KPI, row["Активные задачи"], row.Обращения])
    ),
    ...buildDocxTable(
      docx,
      "Сотрудники",
      ["Сотрудник", "Роль", "Отдел", "KPI", "Активность"],
      report.employees.map((row) => [row.Сотрудник, row.Роль, row.Отдел, row.KPI, row.Активность])
    ),
    ...buildDocxTable(
      docx,
      "Задачи",
      ["Задача", "Исполнитель", "Статус", "Приоритет", "Срок"],
      report.tasks.map((row) => [row.Задача, row.Исполнитель, row.Статус, row.Приоритет, row.Срок])
    ),
    ...buildDocxTable(
      docx,
      "Опросы",
      ["Название", "Тип", "Статус", "Процент прохождения", "Средний балл"],
      report.surveys.map((row) => [row.Название, row.Тип, row.Статус, row["Процент прохождения"], row["Средний балл"]])
    ),
    ...buildDocxTable(
      docx,
      "Курсы",
      ["Курс", "Модули", "Мой прогресс", "Статус", "Завершили"],
      report.courses.map((row) => [row.Курс, row.Модули, row["Мой прогресс"], row.Статус, row.Завершили])
    ),
  ];

  const document = new docx.Document({
    sections: [{ children }],
  });

  const blob = await docx.Packer.toBlob(document);
  downloadBlob(blob, `analytics-report-${new Date().toISOString().slice(0, 10)}.docx`);
};

export default {
  exportAnalyticsToExcel,
  exportAnalyticsToPdf,
  exportAnalyticsToWord,
};
