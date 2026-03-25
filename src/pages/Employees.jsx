import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, Email, Phone, School, Poll, WorkOutline } from "@mui/icons-material";
import "./../style/employees.css";

const statusConfig = {
  active: { label: "Активен", color: "status-active" },
  inactive: { label: "Неактивен", color: "status-sick" },
};

function kpiColor(kpi) {
  if (kpi >= 90) return "kpi-high";
  if (kpi >= 75) return "kpi-medium";
  return "kpi-low";
}

const formatDate = (value) => {
  if (!value) {
    return "Не указано";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "long", year: "numeric" }).format(date);
};

export const Employees = () => {
  const { user, workspaceData, workspaceLoading, workspaceError } = useOutletContext();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("Все");
  const [statusFilter, setStatusFilter] = useState("Все");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const employees = workspaceData.employees || [];
  const departments = workspaceData.departments || [];
  const courses = workspaceData.courses || [];
  const surveys = workspaceData.surveys || [];

  const isEmployee = user?.role === "employee" || user?.R_name === "employee";
  const userDepartment = user?.department || null;

  const availableEmployees = useMemo(() => {
    if (!isEmployee || !userDepartment) {
      return employees;
    }
    return employees.filter((employee) => employee.department === userDepartment);
  }, [employees, isEmployee, userDepartment]);

  const filteredEmployees = useMemo(() => availableEmployees.filter((employee) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchSearch = !normalizedSearch
      || employee.name.toLowerCase().includes(normalizedSearch)
      || employee.position.toLowerCase().includes(normalizedSearch)
      || employee.email.toLowerCase().includes(normalizedSearch);
    const matchDept = deptFilter === "Все" || employee.department === deptFilter;
    const matchStatus = statusFilter === "Все" || statusConfig[employee.status]?.label === statusFilter;
    return matchSearch && matchDept && matchStatus;
  }), [availableEmployees, deptFilter, search, statusFilter]);

  const selectedEmployee = filteredEmployees.find((employee) => employee.id === selectedEmployeeId)
    ?? availableEmployees.find((employee) => employee.id === selectedEmployeeId)
    ?? filteredEmployees[0]
    ?? availableEmployees[0]
    ?? null;

  useEffect(() => {
    if (!selectedEmployee) {
      setSelectedEmployeeId(null);
      return;
    }

    if (!selectedEmployeeId || !availableEmployees.some((employee) => employee.id === selectedEmployeeId)) {
      setSelectedEmployeeId(selectedEmployee.id);
    }
  }, [availableEmployees, selectedEmployee, selectedEmployeeId]);

  const employeeStats = [
    { label: "Всего", value: availableEmployees.length, color: "stat-indigo" },
    { label: "Активны", value: availableEmployees.filter((employee) => employee.status === "active").length, color: "stat-emerald" },
    { label: "Неактивны", value: availableEmployees.filter((employee) => employee.status === "inactive").length, color: "stat-red" },
    { label: "Средний KPI", value: availableEmployees.length ? `${Math.round(availableEmployees.reduce((sum, employee) => sum + employee.kpi, 0) / availableEmployees.length)}%` : "0%", color: "stat-blue" },
  ];

  const employeeCourseDetails = useMemo(() => {
    if (!selectedEmployee) {
      return [];
    }

    return (selectedEmployee.trainingRecords || []).map((record) => {
      const course = courses.find((item) => item.id === record.courseId);
      return {
        ...record,
        title: course?.title || `Курс #${record.courseId}`,
        category: course?.category || "Курс"
      };
    });
  }, [courses, selectedEmployee]);

  const employeeSurveyDetails = useMemo(() => {
    if (!selectedEmployee) {
      return [];
    }

    return (selectedEmployee.surveyRecords || []).map((record) => {
      const survey = surveys.find((item) => item.id === record.surveyId);
      return {
        ...record,
        title: survey?.title || `Опрос #${record.surveyId}`,
        type: survey?.type || "survey"
      };
    });
  }, [selectedEmployee, surveys]);

  if (workspaceLoading) {
    return <div className="employees-page">Загрузка данных...</div>;
  }

  if (workspaceError) {
    return <div className="employees-page">{workspaceError}</div>;
  }

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div className="search-box">
          <Search sx={{ fontSize: 15 }} className="search-icon" />
          <input
            type="text"
            placeholder="Поиск сотрудника..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="search-input"
          />
        </div>
        <select value={deptFilter} onChange={(event) => setDeptFilter(event.target.value)} className="filter-select">
          <option>Все</option>
          {departments.map((department) => <option key={department.id}>{department.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="filter-select">
          <option>Все</option>
          <option>Активен</option>
          <option>Неактивен</option>
        </select>
      </div>

      <div className="stats-grid">
        {employeeStats.map((stat) => (
          <div key={stat.label} className="stat-card-small">
            <span className="stat-label-small">{stat.label}</span>
            <span className={`stat-value-small ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr className="table-header-row">
                <th className="table-header">Сотрудник</th>
                <th className="table-header">Отдел</th>
                <th className="table-header">Роль</th>
                <th className="table-header">KPI</th>
                <th className="table-header">Статус</th>
                <th className="table-header">Дата найма</th>
                <th className="table-header">Контакты</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredEmployees.map((employee) => {
                const status = statusConfig[employee.status] || statusConfig.active;
                return (
                  <tr
                    key={employee.id}
                    className={`table-row ${selectedEmployee?.id === employee.id ? "table-row-selected" : ""}`}
                    onClick={() => setSelectedEmployeeId(employee.id)}
                  >
                    <td className="table-cell">
                      <div className="employee-cell">
                        <div className="employee-avatar-small">{employee.avatar}</div>
                        <span className="employee-name-cell">{employee.name}</span>
                      </div>
                    </td>
                    <td className="table-cell">{employee.department}</td>
                    <td className="table-cell">{employee.position}</td>
                    <td className="table-cell">
                      <div className="kpi-cell">
                        <div className="kpi-bar-container">
                          <div className={`kpi-bar ${kpiColor(employee.kpi)}`} style={{ width: `${employee.kpi}%` }}></div>
                        </div>
                        <span className={`kpi-value ${kpiColor(employee.kpi)}`}>{employee.kpi}%</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge-small ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="table-cell date-cell">{employee.hireDate}</td>
                    <td className="table-cell">
                      <div className="contact-icons">
                        <a href={`mailto:${employee.email}`} className="contact-icon" title={employee.email} onClick={(event) => event.stopPropagation()}>
                          <Email sx={{ fontSize: 15 }} />
                        </a>
                        <span className="contact-icon" title={employee.phone || "Телефон не указан"}>
                          <Phone sx={{ fontSize: 15 }} />
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && (
            <div className="empty-state">Сотрудники не найдены</div>
          )}
        </div>
      </div>

      {selectedEmployee ? (
        <section className="employee-detail-panel">
          <div className="employee-detail-hero">
            <div className="employee-detail-avatar">{selectedEmployee.avatar}</div>
            <div className="employee-detail-copy">
              <h2>{selectedEmployee.name}</h2>
              <div className="employee-detail-tags">
                <span className="detail-tag">{selectedEmployee.position}</span>
                <span className="detail-tag">{selectedEmployee.department}</span>
                <span className="detail-tag">{statusConfig[selectedEmployee.status]?.label || "Активен"}</span>
              </div>
              <p>Логин: {selectedEmployee.login || "Не указан"} · Email: {selectedEmployee.email}</p>
              <p>Телефон: {selectedEmployee.phone || "Не указан"} · Дата найма: {formatDate(selectedEmployee.hireDate)}</p>
            </div>
          </div>

          <div className="employee-detail-stats">
            <div className="employee-detail-card">
              <span>Баланс баллов</span>
              <strong>{selectedEmployee.pointsBalance}</strong>
            </div>
            <div className="employee-detail-card">
              <span>Выполнено задач</span>
              <strong>{selectedEmployee.completedTasks} / {selectedEmployee.totalTasks}</strong>
            </div>
            <div className="employee-detail-card">
              <span>Модули обучения</span>
              <strong>{selectedEmployee.completedModules || 0} завершено</strong>
            </div>
            <div className="employee-detail-card">
              <span>Опросы</span>
              <strong>{selectedEmployee.surveyCount} пройдено</strong>
            </div>
            <div className="employee-detail-card">
              <span>Активность</span>
              <strong>{selectedEmployee.activityScore || 0}</strong>
            </div>
          </div>

          <div className="employee-detail-grid">
            <article className="employee-detail-section">
              <div className="employee-detail-section-top">
                <h3><School sx={{ fontSize: 18 }} /> Прогресс обучения</h3>
              </div>
              {employeeCourseDetails.length ? employeeCourseDetails.map((course) => (
                <div key={`${course.courseId}-${course.enrollmentId}`} className="employee-detail-item">
                  <div className="employee-detail-item-head">
                    <strong>{course.title}</strong>
                    <span className={`workspace-pill workspace-pill-${course.isCompleted ? "completed" : "open"}`}>
                      {course.isCompleted ? "Завершен" : `${course.progressPercent}%`}
                    </span>
                  </div>
                  <p>{course.category}</p>
                            <div className="workspace-progress">
                              <div className="workspace-progress-track">
                                <div className="workspace-progress-fill" style={{ width: `${course.progressPercent}%` }} />
                              </div>
                              <span className="workspace-progress-label">{course.progressPercent}%</span>
                            </div>
                            <div className="employee-inline-meta">
                              <span>{course.completedModules} из {course.totalModules || course.totalLessons} модулей</span>
                              <span>{course.completedAt ? `Завершён: ${formatDate(course.completedAt)}` : "В процессе"}</span>
                            </div>
                          </div>
              )) : <div className="empty-state compact-empty">Нет данных по обучению</div>}
            </article>

            <article className="employee-detail-section">
              <div className="employee-detail-section-top">
                <h3><Poll sx={{ fontSize: 18 }} /> Результаты опросов</h3>
              </div>
              {employeeSurveyDetails.length ? employeeSurveyDetails.map((survey) => (
                <div key={`${survey.surveyId}-${survey.resultId}`} className="employee-detail-item">
                  <div className="employee-detail-item-head">
                    <strong>{survey.title}</strong>
                    <span className="workspace-pill workspace-pill-active">{survey.score}%</span>
                  </div>
                  <p>{survey.type === "test" ? "Тест" : "Опрос/анкета"}</p>
                  <div className="employee-inline-meta">
                    <span>{survey.isCompleted ? "Пройден" : "Не завершён"}</span>
                    <span>{survey.submittedAt ? `Отправлен: ${formatDate(survey.submittedAt)}` : "Черновик"}</span>
                  </div>
                </div>
              )) : <div className="empty-state compact-empty">Нет данных по опросам</div>}
            </article>

            <article className="employee-detail-section">
              <div className="employee-detail-section-top">
                <h3><WorkOutline sx={{ fontSize: 18 }} /> Общая информация</h3>
              </div>
              <div className="employee-detail-item">
                <div className="employee-inline-meta employee-inline-meta-grid">
                  <span>Отдел: {selectedEmployee.department}</span>
                  <span>Роль: {selectedEmployee.position}</span>
                  <span>Обращения: {selectedEmployee.appealCount}</span>
                  <span>Темы форума: {selectedEmployee.forumTopics}</span>
                  <span>KPI по задачам: {selectedEmployee.taskCompletion}%</span>
                  <span>Прогресс обучения: {selectedEmployee.moduleProgress || selectedEmployee.courseProgress}%</span>
                  <span>Средний балл опросов: {selectedEmployee.averageSurveyScore || 0}%</span>
                  <span>Индекс активности: {selectedEmployee.activityScore || 0}</span>
                </div>
              </div>
            </article>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default Employees;
