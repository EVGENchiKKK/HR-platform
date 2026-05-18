import getRoleLabel from "./roleLabels";
import {
  formatAppealStatusLabel,
  formatAppealTypeLabel,
  formatCourseStatusLabel,
  formatPriorityLabel,
  formatSurveyStatusLabel,
  formatSurveyTypeLabel,
  formatTaskStatusLabel
} from "./uiLabels";

const DASH = "—";

const clampPercent = (value) => {
  const normalized = Number(value || 0);
  if (!Number.isFinite(normalized)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(normalized)));
};

const formatDate = (value) => {
  if (!value) {
    return DASH;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("ru-RU");
};

const formatDateTime = (value) => {
  if (!value) {
    return DASH;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("ru-RU");
};

const formatPercent = (value) => `${clampPercent(value)}%`;

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

const normalizeModuleCompletion = (course) => {
  const participants = Array.isArray(course.participants) ? course.participants : [];
  return participants.filter((participant) => participant.isCompleted || participant.status === "completed").length;
};

const buildSummaryRows = ({ employees, departments, tasks, appeals, surveys, courses }) => {
  const completedTasks = tasks.filter((task) => ["completed", "done"].includes(task.status)).length;
  const openAppeals = appeals.filter((appeal) => ["open", "in_review"].includes(appeal.status)).length;
  const completedAppeals = appeals.filter((appeal) => ["resolved", "closed"].includes(appeal.status)).length;
  const activeSurveys = surveys.filter((survey) => survey.status === "active").length;
  const completedCourses = courses.filter(
    (course) => course.myEnrollment?.isCompleted || course.myEnrollment?.status === "completed"
  ).length;
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
    { metric: "Завершённые курсы", value: completedCourses }
  ];
};

const buildReportData = ({ workspaceData = {}, user = null, scopeTitle = "Отчёт по аналитике" }) => {
  const employees = workspaceData.employees || [];
  const departments = workspaceData.departments || [];
  const tasks = workspaceData.tasks || [];
  const appeals = workspaceData.appeals || [];
  const surveys = workspaceData.surveys || [];
  const courses = workspaceData.courses || [];
  const monthlyStats = workspaceData.monthlyStats || [];

  const generatedAt = new Date();
  const currentRole = `${workspaceData.currentUserRole || user?.role || user?.R_name || ""}`.toLowerCase();
  const reportScope = ["hr", "admin", "manager"].includes(currentRole)
    ? getRoleLabel(currentRole)
    : "Сотрудник";

  const summary = buildSummaryRows({ employees, departments, tasks, appeals, surveys, courses });

  return {
    title: scopeTitle,
    generatedAt,
    reportScope,
    summary,
    monthlyStats: monthlyStats.map((item) => ({
      Месяц: item.month || DASH,
      Задачи: Number(item.tasks || 0),
      Обращения: Number(item.appeals || 0),
      Найм: Number(item.hires || 0)
    })),
    departments: departments.map((department) => ({
      Отдел: department.name || DASH,
      Сотрудники: Number(department.employeeCount || 0),
      KPI: formatPercent(department.kpi),
      "Активные задачи": Number(department.activeTasks || 0),
      Обращения: Number(department.appealCount || 0)
    })),
    employees: employees.map((employee) => ({
      Сотрудник: employee.name || DASH,
      Роль: getRoleLabel(employee.position || employee.role || employee.R_name),
      Отдел: employee.department || DASH,
      KPI: formatPercent(employee.kpi),
      "Завершено задач": `${Number(employee.completedTasks || 0)}/${Number(employee.totalTasks || 0)}`,
      "Прогресс обучения": formatPercent(employee.moduleProgress || employee.courseProgress),
      "Средний балл опросов": formatPercent(employee.averageSurveyScore),
      Активность: formatPercent(employee.activityScore),
      Статус: employee.status === "active" ? "Активен" : "Неактивен"
    })),
    tasks: tasks.map((task) => ({
      Задача: task.title || task.name || DASH,
      Исполнитель: task.assignee || task.assigneeName || task.employeeName || task.userName || DASH,
      Отдел: task.departmentName || task.department || DASH,
      Статус: formatTaskStatusLabel(task.status),
      Приоритет: formatPriorityLabel(task.priority),
      KPI: formatPercent(task.kpiWeight),
      Срок: formatDate(task.dueDate || task.deadline),
      "Дата завершения": formatDate(task.completedAt)
    })),
    appeals: appeals.map((appeal) => ({
      Тема: appeal.subject || appeal.topic || DASH,
      Автор: appeal.from || appeal.authorName || appeal.employeeName || DASH,
      Получатель: appeal.recipientName || DASH,
      Статус: formatAppealStatusLabel(appeal.status),
      Приоритет: formatPriorityLabel(appeal.priority),
      Тип: formatAppealTypeLabel(appeal.type),
      Создано: formatDate(appeal.date || appeal.createdAt),
      Обновлено: formatDate(appeal.updatedAt || appeal.closedAt || appeal.lastMessageAt)
    })),
    surveys: surveys.map((survey) => ({
      Название: survey.title || DASH,
      Тип: formatSurveyTypeLabel(survey.type),
      Статус: formatSurveyStatusLabel(survey.status),
      "Процент прохождения": formatPercent(
        survey.completionRate ??
          (survey.totalAssigned
            ? (Number(survey.completedCount || 0) / Number(survey.totalAssigned || 1)) * 100
            : survey.myResult?.isCompleted
              ? 100
              : 0)
      ),
      "Средний балл": formatPercent(survey.averageScore),
      "Доступно сотрудникам": Number(survey.totalAssigned || 0),
      Завершили: Number(survey.completedCount || 0)
    })),
    courses: courses.map((course) => ({
      Курс: course.title || DASH,
      Модули: Number(course.totalModules || 0),
      "Мой прогресс": formatPercent(course.myEnrollment?.progressPercent),
      Статус: formatCourseStatusLabel(
        course.myEnrollment?.isCompleted ? "completed" : course.myEnrollment?.status || course.status
      ),
      Участники: Number(course.participants?.length || 0),
      Завершили: Number(normalizeModuleCompletion(course))
    }))
  };
};

const appendWorksheet = (XLSX, workbook, name, rows) => {
  const data = rows?.length ? rows : [{ Данные: "Нет данных" }];
  const worksheet = XLSX.utils.json_to_sheet(data);
  const columnWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(
      String(key).length + 2,
      ...data.map((row) => String(row[key] ?? "").length + 2)
    )
  }));

  worksheet["!cols"] = columnWidths;
  XLSX.utils.book_append_sheet(workbook, worksheet, name.slice(0, 31));
};

const toTableRows = (rows) =>
  rows.map((row) => Object.values(row).map((value) => String(value ?? DASH)));

const getFileStamp = () => new Date().toISOString().slice(0, 10);

const safePageText = (value) => String(value ?? DASH).replace(/\s+/g, " ").trim();

const buildSectionDefinitions = (report) => [
  {
    title: "Сводка",
    headers: ["Метрика", "Значение"],
    rows: report.summary.map((row) => [row.metric, String(row.value)])
  },
  {
    title: "Месячная статистика",
    headers: Object.keys(report.monthlyStats[0] || { Месяц: "", Задачи: "", Обращения: "", Найм: "" }),
    rows: toTableRows(report.monthlyStats)
  },
  {
    title: "Отделы",
    headers: Object.keys(report.departments[0] || { Отдел: "", Сотрудники: "", KPI: "", "Активные задачи": "", Обращения: "" }),
    rows: toTableRows(report.departments)
  },
  {
    title: "Сотрудники",
    headers: Object.keys(report.employees[0] || { Сотрудник: "", Роль: "", Отдел: "", KPI: "", Активность: "" }),
    rows: toTableRows(report.employees)
  },
  {
    title: "Задачи",
    headers: Object.keys(report.tasks[0] || { Задача: "", Исполнитель: "", Статус: "", Приоритет: "", Срок: "" }),
    rows: toTableRows(report.tasks)
  },
  {
    title: "Обращения",
    headers: Object.keys(report.appeals[0] || { Тема: "", Автор: "", Получатель: "", Статус: "", Приоритет: "" }),
    rows: toTableRows(report.appeals)
  },
  {
    title: "Опросы",
    headers: Object.keys(report.surveys[0] || { Название: "", Тип: "", Статус: "", "Процент прохождения": "", "Средний балл": "" }),
    rows: toTableRows(report.surveys)
  },
  {
    title: "Курсы",
    headers: Object.keys(report.courses[0] || { Курс: "", Модули: "", "Мой прогресс": "", Статус: "", Завершили: "" }),
    rows: toTableRows(report.courses)
  }
];

export const exportAnalyticsToExcel = async ({ workspaceData, user, scopeTitle }) => {
  const report = buildReportData({ workspaceData, user, scopeTitle });
  const xlsxModule = await import("xlsx");
  const XLSX = xlsxModule.default || xlsxModule;
  const workbook = XLSX.utils.book_new();

  appendWorksheet(
    XLSX,
    workbook,
    "Сводка",
    report.summary.map((row) => ({ Метрика: row.metric, Значение: row.value }))
  );
  appendWorksheet(XLSX, workbook, "Месячная статистика", report.monthlyStats);
  appendWorksheet(XLSX, workbook, "Отделы", report.departments);
  appendWorksheet(XLSX, workbook, "Сотрудники", report.employees);
  appendWorksheet(XLSX, workbook, "Задачи", report.tasks);
  appendWorksheet(XLSX, workbook, "Обращения", report.appeals);
  appendWorksheet(XLSX, workbook, "Опросы", report.surveys);
  appendWorksheet(XLSX, workbook, "Курсы", report.courses);

  XLSX.writeFile(workbook, `analytics-report-${getFileStamp()}.xlsx`);
};


export const exportAnalyticsToPdf = async ({ workspaceData, user, scopeTitle }) => {
  const report = buildReportData({ workspaceData, user, scopeTitle });
  const jspdfModule = await import("jspdf");
  const jsPDF = jspdfModule.jsPDF || jspdfModule.default?.jsPDF || jspdfModule.default;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 12;
  const topMargin = 14;
  const bottomMargin = 12;
  const lineHeight = 6;
  const contentWidth = pageWidth - marginX * 2;
  let cursorY = topMargin;

  const ensureSpace = (requiredHeight = lineHeight) => {
    if (cursorY + requiredHeight <= pageHeight - bottomMargin) {
      return;
    }

    doc.addPage();
    cursorY = topMargin;
  };

  const writeWrappedText = (text, { indent = 0, fontSize = 10, bold = false } = {}) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(safePageText(text), contentWidth - indent);

    lines.forEach((line) => {
      ensureSpace(lineHeight);
      doc.text(line, marginX + indent, cursorY);
      cursorY += lineHeight;
    });
  };

  const writeSection = (section) => {
    ensureSpace(lineHeight * 2);
    cursorY += 2;
    writeWrappedText(section.title, { fontSize: 12, bold: true });

    if (!section.rows.length) {
      writeWrappedText("Нет данных", { indent: 4 });
      return;
    }

    section.rows.forEach((row, rowIndex) => {
      ensureSpace(lineHeight * (section.headers.length + 1));
      writeWrappedText(`${rowIndex + 1}.`, { bold: true });

      section.headers.forEach((header, headerIndex) => {
        writeWrappedText(`${header}: ${row[headerIndex] ?? DASH}`, { indent: 6 });
      });

      cursorY += 1;
    });
  };

  writeWrappedText(report.title, { fontSize: 16, bold: true });
  writeWrappedText(`Сформировано: ${formatDateTime(report.generatedAt)}`);
  writeWrappedText(`Область видимости: ${report.reportScope}`);

  buildSectionDefinitions(report).forEach(writeSection);
  doc.save(`analytics-report-${getFileStamp()}.pdf`);
};

const buildDocxTable = (docx, title, headers, rows) => [
  new docx.Paragraph({
    text: title,
    heading: docx.HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 }
  }),
  new docx.Table({
    width: { size: 100, type: docx.WidthType.PERCENTAGE },
    rows: [
      new docx.TableRow({
        children: headers.map(
          (header) =>
            new docx.TableCell({
              children: [new docx.Paragraph({ children: [new docx.TextRun({ text: header, bold: true })] })]
            })
        )
      }),
      ...(rows.length ? rows : [["Нет данных"]]).map(
        (row) =>
          new docx.TableRow({
            children: headers.map(
              (_, index) =>
                new docx.TableCell({
                  children: [new docx.Paragraph(String(row[index] ?? DASH))]
                })
            )
          })
      )
    ]
  })
];

export const exportAnalyticsToWord = async ({ workspaceData, user, scopeTitle }) => {
  const report = buildReportData({ workspaceData, user, scopeTitle });
  const docx = await import("docx");

  const children = [
    new docx.Paragraph({
      text: report.title,
      heading: docx.HeadingLevel.TITLE,
      spacing: { after: 120 }
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
    )
  ];

  const document = new docx.Document({
    sections: [{ children }]
  });

  const blob = await docx.Packer.toBlob(document);
  downloadBlob(blob, `analytics-report-${getFileStamp()}.docx`);
};

export default {
  exportAnalyticsToExcel,
  exportAnalyticsToPdf,
  exportAnalyticsToWord
};
