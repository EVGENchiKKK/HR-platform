import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Search,
  Email,
  Phone,
  School,
  Poll,
  WorkOutline,
  DeleteOutline,
  Close
} from "@mui/icons-material";
import workspaceService from "../api/workspaceService";
import authService from "../api/authService";
import getRoleLabel from "../utils/roleLabels";
import { formatCategoryLabel } from "../utils/uiLabels";
import "./../style/workspace-pages.css";
import "./../style/employees.css";

const ALL_FILTER = "Все";

const statusConfig = {
  active: { label: "Активен", color: "status-active" },
  inactive: { label: "Неактивен", color: "status-sick" }
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

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
};

const formatSurveyType = (type) => (type === "test" ? "Тест" : "Опрос/анкета");

export const Employees = () => {
  const { user, workspaceData, workspaceLoading, workspaceError, refreshWorkspaceData } = useOutletContext();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState(ALL_FILTER);
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [registerMeta, setRegisterMeta] = useState({ roles: [], departments: [] });
  const [employeeForm, setEmployeeForm] = useState({
    login: "",
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    hireDate: "",
    roleId: "",
    departmentId: "",
    password: ""
  });
  const [employeeError, setEmployeeError] = useState("");
  const [employeeSuccess, setEmployeeSuccess] = useState("");
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState(null);

  const employees = workspaceData.employees || [];
  const departments = workspaceData.departments || [];
  const courses = workspaceData.courses || [];
  const surveys = workspaceData.surveys || [];

  const currentRole = `${workspaceData.currentUserRole || user?.role || user?.R_name || ""}`.toLowerCase();
  const currentUserId = Number(workspaceData.currentUserId || user?.id || user?.userId || user?.User_ID || 0) || null;
  const currentDepartmentId = Number(workspaceData.currentUserDepartmentId || 0) || null;
  const currentDepartmentName = workspaceData.currentUserDepartmentName || user?.department || null;

  const isEmployee = currentRole === "employee";
  const isManager = currentRole === "manager";
  const canManageEmployees = ["hr", "admin"].includes(currentRole);
  const canDeleteEmployees = canManageEmployees || isManager;

  const availableEmployees = useMemo(() => {
    if (isManager && currentDepartmentId) {
      return employees.filter((employee) => Number(employee.departmentId) === Number(currentDepartmentId));
    }

    if (!isEmployee || !currentDepartmentName) {
      return employees;
    }

    return employees.filter((employee) => employee.department === currentDepartmentName);
  }, [currentDepartmentId, currentDepartmentName, employees, isEmployee, isManager]);

  const filteredEmployees = useMemo(
    () =>
      availableEmployees.filter((employee) => {
        const normalizedSearch = search.trim().toLowerCase();
        const matchSearch =
          !normalizedSearch ||
          employee.name.toLowerCase().includes(normalizedSearch) ||
          employee.position.toLowerCase().includes(normalizedSearch) ||
          employee.email.toLowerCase().includes(normalizedSearch);
        const matchDept = deptFilter === ALL_FILTER || employee.department === deptFilter;
        const matchStatus = statusFilter === ALL_FILTER || statusConfig[employee.status]?.label === statusFilter;
        return matchSearch && matchDept && matchStatus;
      }),
    [availableEmployees, deptFilter, search, statusFilter]
  );

  const selectedEmployee =
    availableEmployees.find((employee) => employee.id === selectedEmployeeId) || null;

  const employeeCourseDetails = useMemo(() => {
    if (!selectedEmployee) {
      return [];
    }

    return (selectedEmployee.trainingRecords || []).map((record) => {
      const course = courses.find((item) => item.id === record.courseId);
      return {
        ...record,
        title: course?.title || `Курс #${record.courseId}`,
        category: course?.category || "Курс",
        totalModules: course?.totalModules || record.totalLessons || 0
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

  useEffect(() => {
    if (!canManageEmployees) {
      return;
    }

    authService
      .getRegisterMeta()
      .then((response) => {
        if (response.success) {
          setRegisterMeta(response.data);
        }
      })
      .catch(() => {});
  }, [canManageEmployees]);

  useEffect(() => {
    if (selectedEmployeeId && !availableEmployees.some((employee) => employee.id === selectedEmployeeId)) {
      setSelectedEmployeeId(null);
      setShowEmployeeModal(false);
    }
  }, [availableEmployees, selectedEmployeeId]);

  const employeeStats = [
    { label: "Всего", value: availableEmployees.length, color: "stat-indigo" },
    {
      label: "Активны",
      value: availableEmployees.filter((employee) => employee.status === "active").length,
      color: "stat-emerald"
    },
    {
      label: "Неактивны",
      value: availableEmployees.filter((employee) => employee.status === "inactive").length,
      color: "stat-red"
    },
    {
      label: "Средний KPI",
      value: availableEmployees.length
        ? `${Math.round(availableEmployees.reduce((sum, employee) => sum + employee.kpi, 0) / availableEmployees.length)}%`
        : "0%",
      color: "stat-blue"
    }
  ];

  const canDeleteEmployee = (employee) => {
    if (!canDeleteEmployees || !employee) {
      return false;
    }

    if (currentUserId && Number(employee.id) === Number(currentUserId)) {
      return false;
    }

    if (canManageEmployees) {
      return true;
    }

    return (
      isManager &&
      Number(employee.departmentId) === Number(currentDepartmentId) &&
      !["admin", "hr", "manager"].includes(`${employee.role || employee.position || ""}`.toLowerCase())
    );
  };

  const openEmployeeModal = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setShowEmployeeModal(true);
  };

  const closeEmployeeModal = () => {
    setShowEmployeeModal(false);
  };

  const handleEmployeeChange = (field) => (event) => {
    setEmployeeForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleCreateEmployee = async () => {
    if (
      !employeeForm.login ||
      !employeeForm.firstName ||
      !employeeForm.lastName ||
      !employeeForm.email ||
      !employeeForm.password ||
      !employeeForm.roleId ||
      !employeeForm.departmentId ||
      !employeeForm.hireDate
    ) {
      setEmployeeError("Заполните обязательные поля сотрудника.");
      setEmployeeSuccess("");
      return;
    }

    setIsCreatingEmployee(true);
    setEmployeeError("");
    setEmployeeSuccess("");

    try {
      const result = await workspaceService.createEmployee({
        ...employeeForm,
        roleId: Number(employeeForm.roleId),
        departmentId: Number(employeeForm.departmentId)
      });

      if (!result.success) {
        setEmployeeError(result.error || "Не удалось создать сотрудника.");
        return;
      }

      setEmployeeForm({
        login: "",
        firstName: "",
        lastName: "",
        middleName: "",
        email: "",
        phone: "",
        hireDate: "",
        roleId: "",
        departmentId: "",
        password: ""
      });
      setEmployeeSuccess("Сотрудник создан.");
      await refreshWorkspaceData();
      setShowCreateEmployeeModal(false);
    } catch (error) {
      const details = error.response?.data?.details;
      setEmployeeError(
        (Array.isArray(details) ? details.join(" ") : "") ||
          error.response?.data?.error ||
          "Не удалось создать сотрудника."
      );
    } finally {
      setIsCreatingEmployee(false);
    }
  };

  const handleDeleteEmployee = async (employee) => {
    if (!canDeleteEmployee(employee)) {
      return;
    }

    const confirmed = window.confirm(`Удалить сотрудника "${employee.name}"?`);
    if (!confirmed) {
      return;
    }

    setDeletingEmployeeId(employee.id);
    setEmployeeError("");
    setEmployeeSuccess("");

    try {
      const result = await workspaceService.deleteEmployee(employee.id);
      if (!result.success) {
        setEmployeeError(result.error || "Не удалось удалить сотрудника.");
        return;
      }

      if (selectedEmployeeId === employee.id) {
        setShowEmployeeModal(false);
        setSelectedEmployeeId(null);
      }

      setEmployeeSuccess("Сотрудник удалён.");
      await refreshWorkspaceData();
    } catch (error) {
      setEmployeeError(error.response?.data?.error || "Не удалось удалить сотрудника.");
    } finally {
      setDeletingEmployeeId(null);
    }
  };

  if (workspaceLoading) {
    return <div className="employees-page">Загрузка данных...</div>;
  }

  if (workspaceError) {
    return <div className="employees-page">{workspaceError}</div>;
  }

  return (
    <div className="employees-page">
      {canManageEmployees ? (
        <section className="workspace-toolbar">
          <button
            type="button"
            className="appeal-primary-action"
            onClick={() => setShowCreateEmployeeModal(true)}
          >
            Добавить сотрудника
          </button>
          {employeeSuccess ? <div className="workspace-success">{employeeSuccess}</div> : null}
          {employeeError ? <div className="workspace-empty">{employeeError}</div> : null}
        </section>
      ) : employeeSuccess || employeeError ? (
        <section className="workspace-toolbar">
          {employeeSuccess ? <div className="workspace-success">{employeeSuccess}</div> : null}
          {employeeError ? <div className="workspace-empty">{employeeError}</div> : null}
        </section>
      ) : null}

      {showCreateEmployeeModal ? (
        <div className="modal-overlay" onClick={() => setShowCreateEmployeeModal(false)}>
          <div className="modal-card modal-card-wide" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="appeals-list-title">Новый сотрудник</h3>
                <p className="appeal-create-description">
                  Запись создаётся сразу в базе данных.
                </p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowCreateEmployeeModal(false)}
              >
                <Close sx={{ fontSize: 20 }} />
              </button>
            </div>
            <div className="appeal-form-grid">
              <label className="appeal-form-field">
                <span>Логин</span>
                <input
                  type="text"
                  value={employeeForm.login}
                  onChange={handleEmployeeChange("login")}
                  className="appeal-chat-input"
                />
              </label>
              <label className="appeal-form-field">
                <span>Имя</span>
                <input
                  type="text"
                  value={employeeForm.firstName}
                  onChange={handleEmployeeChange("firstName")}
                  className="appeal-chat-input"
                />
              </label>
              <label className="appeal-form-field">
                <span>Фамилия</span>
                <input
                  type="text"
                  value={employeeForm.lastName}
                  onChange={handleEmployeeChange("lastName")}
                  className="appeal-chat-input"
                />
              </label>
              <label className="appeal-form-field">
                <span>Отчество</span>
                <input
                  type="text"
                  value={employeeForm.middleName}
                  onChange={handleEmployeeChange("middleName")}
                  className="appeal-chat-input"
                />
              </label>
              <label className="appeal-form-field">
                <span>Email</span>
                <input
                  type="email"
                  value={employeeForm.email}
                  onChange={handleEmployeeChange("email")}
                  className="appeal-chat-input"
                />
              </label>
              <label className="appeal-form-field">
                <span>Телефон</span>
                <input
                  type="text"
                  value={employeeForm.phone}
                  onChange={handleEmployeeChange("phone")}
                  className="appeal-chat-input"
                />
              </label>
              <label className="appeal-form-field">
                <span>Дата найма</span>
                <input
                  type="date"
                  value={employeeForm.hireDate}
                  onChange={handleEmployeeChange("hireDate")}
                  className="appeal-chat-input"
                />
              </label>
              <label className="appeal-form-field">
                <span>Роль</span>
                <select
                  value={employeeForm.roleId}
                  onChange={handleEmployeeChange("roleId")}
                  className="workspace-select"
                >
                  <option value="">Выберите роль</option>
                  {registerMeta.roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {getRoleLabel(role.name)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="appeal-form-field">
                <span>Отдел</span>
                <select
                  value={employeeForm.departmentId}
                  onChange={handleEmployeeChange("departmentId")}
                  className="workspace-select"
                >
                  <option value="">Выберите отдел</option>
                  {registerMeta.departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="appeal-form-field">
                <span>Пароль</span>
                <input
                  type="password"
                  value={employeeForm.password}
                  onChange={handleEmployeeChange("password")}
                  className="appeal-chat-input"
                />
              </label>
            </div>
            <div className="appeal-form-actions">
              <button
                type="button"
                className="appeal-primary-action"
                onClick={handleCreateEmployee}
                disabled={isCreatingEmployee}
              >
                {isCreatingEmployee ? "Сохранение..." : "Создать сотрудника"}
              </button>
              {employeeError ? <div className="workspace-empty">{employeeError}</div> : null}
            </div>
          </div>
        </div>
      ) : null}

      {showEmployeeModal && selectedEmployee ? (
        <div className="modal-overlay" onClick={closeEmployeeModal}>
          <div className="modal-card modal-card-wide employee-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="appeals-list-title">{selectedEmployee.name}</h3>
                <p className="appeal-create-description">
                  Полная информация по сотруднику, обучению и опросам.
                </p>
              </div>
              <div className="employee-modal-actions">
                {canDeleteEmployee(selectedEmployee) ? (
                  <button
                    type="button"
                    className="employee-delete-button"
                    onClick={() => handleDeleteEmployee(selectedEmployee)}
                    disabled={deletingEmployeeId === selectedEmployee.id}
                  >
                    <DeleteOutline sx={{ fontSize: 18 }} />
                    {deletingEmployeeId === selectedEmployee.id ? "Удаление..." : "Удалить"}
                  </button>
                ) : null}
                <button type="button" className="modal-close" onClick={closeEmployeeModal}>
                  <Close sx={{ fontSize: 20 }} />
                </button>
              </div>
            </div>

            <div className="employee-detail-panel employee-detail-panel-modal">
              <div className="employee-detail-hero">
                <div className="employee-detail-avatar">{selectedEmployee.avatar}</div>
                <div className="employee-detail-copy">
                  <h2>{selectedEmployee.name}</h2>
                  <div className="employee-detail-tags">
                    <span className="detail-tag">{getRoleLabel(selectedEmployee.position)}</span>
                    <span className="detail-tag">{selectedEmployee.department}</span>
                    <span className="detail-tag">
                      {statusConfig[selectedEmployee.status]?.label || "Активен"}
                    </span>
                  </div>
                  <p>Логин: {selectedEmployee.login || "Не указан"} · Email: {selectedEmployee.email}</p>
                  <p>
                    Телефон: {selectedEmployee.phone || "Не указан"} · Дата найма:{" "}
                    {formatDate(selectedEmployee.hireDate)}
                  </p>
                </div>
              </div>

              <div className="employee-detail-stats">
                <div className="employee-detail-card">
                  <span>Баланс баллов</span>
                  <strong>{selectedEmployee.pointsBalance}</strong>
                </div>
                <div className="employee-detail-card">
                  <span>Выполнено задач</span>
                  <strong>
                    {selectedEmployee.completedTasks} / {selectedEmployee.totalTasks}
                  </strong>
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
                    <h3>
                      <School sx={{ fontSize: 18 }} /> Прогресс обучения
                    </h3>
                  </div>
                  {employeeCourseDetails.length ? (
                    employeeCourseDetails.map((course) => (
                      <div key={`${course.courseId}-${course.enrollmentId}`} className="employee-detail-item">
                        <div className="employee-detail-item-head">
                          <strong>{course.title}</strong>
                          <span className={`workspace-pill workspace-pill-${course.isCompleted ? "completed" : "open"}`}>
                            {course.isCompleted ? "Завершён" : `${course.progressPercent}%`}
                          </span>
                        </div>
                        <p>{formatCategoryLabel(course.category)}</p>
                        <div className="workspace-progress">
                          <div className="workspace-progress-track">
                            <div
                              className="workspace-progress-fill"
                              style={{ width: `${course.progressPercent}%` }}
                            />
                          </div>
                          <span className="workspace-progress-label">{course.progressPercent}%</span>
                        </div>
                        <div className="employee-inline-meta">
                          <span>
                            {course.completedModules || 0} из {course.totalModules || course.totalLessons || 0} модулей
                          </span>
                          <span>
                            {course.completedAt
                              ? `Завершён: ${formatDate(course.completedAt)}`
                              : "В процессе"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state compact-empty">Нет данных по обучению</div>
                  )}
                </article>

                <article className="employee-detail-section">
                  <div className="employee-detail-section-top">
                    <h3>
                      <Poll sx={{ fontSize: 18 }} /> Результаты опросов
                    </h3>
                  </div>
                  {employeeSurveyDetails.length ? (
                    employeeSurveyDetails.map((survey) => (
                      <div key={`${survey.surveyId}-${survey.resultId}`} className="employee-detail-item">
                        <div className="employee-detail-item-head">
                          <strong>{survey.title}</strong>
                          <span className="workspace-pill workspace-pill-active">{survey.score}%</span>
                        </div>
                        <p>{formatSurveyType(survey.type)}</p>
                        <div className="employee-inline-meta">
                          <span>{survey.isCompleted ? "Пройден" : "Не завершён"}</span>
                          <span>
                            {survey.submittedAt
                              ? `Отправлен: ${formatDate(survey.submittedAt)}`
                              : "Черновик"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state compact-empty">Нет данных по опросам</div>
                  )}
                </article>

                <article className="employee-detail-section">
                  <div className="employee-detail-section-top">
                    <h3>
                      <WorkOutline sx={{ fontSize: 18 }} /> Общая информация
                    </h3>
                  </div>
                  <div className="employee-detail-item">
                    <div className="employee-inline-meta employee-inline-meta-grid">
                      <span>Отдел: {selectedEmployee.department}</span>
                      <span>Роль: {getRoleLabel(selectedEmployee.position)}</span>
                      <span>Обращения: {selectedEmployee.appealCount}</span>
                      <span>Темы форума: {selectedEmployee.forumTopics}</span>
                      <span>KPI по задачам: {selectedEmployee.taskCompletion}%</span>
                      <span>
                        Прогресс обучения: {selectedEmployee.moduleProgress || selectedEmployee.courseProgress}%
                      </span>
                      <span>Средний балл опросов: {selectedEmployee.averageSurveyScore || 0}%</span>
                      <span>Индекс активности: {selectedEmployee.activityScore || 0}</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      ) : null}

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
          <option>{ALL_FILTER}</option>
          {departments.map((department) => (
            <option key={department.id}>{department.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="filter-select"
        >
          <option>{ALL_FILTER}</option>
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
                {canDeleteEmployees ? <th className="table-header">Действия</th> : null}
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredEmployees.map((employee) => {
                const status = statusConfig[employee.status] || statusConfig.active;
                const employeeCanBeDeleted = canDeleteEmployee(employee);

                return (
                  <tr
                    key={employee.id}
                    className={`table-row ${selectedEmployee?.id === employee.id && showEmployeeModal ? "table-row-selected" : ""}`}
                    onClick={() => openEmployeeModal(employee.id)}
                  >
                    <td className="table-cell">
                      <div className="employee-cell">
                        <div className="employee-avatar-small">{employee.avatar}</div>
                        <span className="employee-name-cell">{employee.name}</span>
                      </div>
                    </td>
                    <td className="table-cell">{employee.department}</td>
                    <td className="table-cell">{getRoleLabel(employee.position)}</td>
                    <td className="table-cell">
                      <div className="kpi-cell">
                        <div className="kpi-bar-container">
                          <div
                            className={`kpi-bar ${kpiColor(employee.kpi)}`}
                            style={{ width: `${employee.kpi}%` }}
                          />
                        </div>
                        <span className={`kpi-value ${kpiColor(employee.kpi)}`}>{employee.kpi}%</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge-small ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="table-cell date-cell">{formatDate(employee.hireDate)}</td>
                    <td className="table-cell">
                      <div className="contact-icons">
                        <a
                          href={`mailto:${employee.email}`}
                          className="contact-icon"
                          title={employee.email}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Email sx={{ fontSize: 15 }} />
                        </a>
                        <span className="contact-icon" title={employee.phone || "Телефон не указан"}>
                          <Phone sx={{ fontSize: 15 }} />
                        </span>
                      </div>
                    </td>
                    {canDeleteEmployees ? (
                      <td className="table-cell">
                        <div className="action-buttons">
                          {employeeCanBeDeleted ? (
                            <button
                              type="button"
                              className="action-btn delete-btn"
                              title="Удалить сотрудника"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteEmployee(employee);
                              }}
                              disabled={deletingEmployeeId === employee.id}
                            >
                              <DeleteOutline sx={{ fontSize: 18 }} />
                            </button>
                          ) : (
                            <span className="employee-action-placeholder">—</span>
                          )}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && <div className="empty-state">Сотрудники не найдены</div>}
        </div>
      </div>
    </div>
  );
};

export default Employees;
