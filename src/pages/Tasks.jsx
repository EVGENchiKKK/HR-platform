import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CalendarToday, Flag, TaskAlt, WarningAmber } from "@mui/icons-material";
import workspaceService from "../api/workspaceService";
import "./../style/workspace-pages.css";

const statusLabels = {
  pending: "Ожидает",
  in_progress: "В работе",
  completed: "Завершена",
  cancelled: "Отменена",
};

const priorityLabels = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

const initialTaskForm = {
  title: "",
  description: "",
  assigneeId: "",
  priority: "medium",
  deadline: "",
  kpiWeight: 25,
};

const employeeTaskStatuses = [
  { value: "pending", label: "Ожидает" },
  { value: "in_progress", label: "В работе" },
  { value: "completed", label: "Завершена" },
];

export const Tasks = () => {
  const { user, workspaceData, workspaceLoading, workspaceError, refreshWorkspaceData } = useOutletContext();
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isUpdatingTaskId, setIsUpdatingTaskId] = useState(null);
  const [taskStatusDrafts, setTaskStatusDrafts] = useState({});
  const [taskError, setTaskError] = useState("");
  const [taskSuccess, setTaskSuccess] = useState("");

  const currentRole = `${workspaceData.currentUserRole || user?.role || user?.R_name || ""}`.toLowerCase();
  const canManageTasks = ["hr", "admin"].includes(currentRole);
  const tasks = workspaceData.tasks || [];
  const employees = workspaceData.employees || [];
  const departments = useMemo(() => [...new Set(tasks.map((task) => task.department).filter(Boolean))], [tasks]);

  const assignableEmployees = useMemo(
    () =>
      employees.filter((employee) => {
        const role = `${employee.role || employee.position || ""}`.toLowerCase();
        return employee.status === "active" && !["hr", "admin"].includes(role);
      }),
    [employees]
  );

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = statusFilter === "all" || task.status === statusFilter;
    const departmentMatch = departmentFilter === "all" || task.department === departmentFilter;
    return statusMatch && departmentMatch;
  });

  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const overdueTasks = tasks.filter((task) => task.deadline < new Date().toISOString().slice(0, 10) && task.status !== "completed").length;

  useEffect(() => {
    setTaskStatusDrafts(
      tasks.reduce((accumulator, task) => {
        accumulator[task.id] = task.status;
        return accumulator;
      }, {})
    );
  }, [tasks]);

  const handleTaskFormChange = (field) => (event) => {
    setTaskForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleCreateTask = async () => {
    if (!taskForm.title.trim() || !taskForm.description.trim() || !taskForm.assigneeId || !taskForm.deadline) {
      setTaskError("Заполните название, описание, сотрудника и срок задачи.");
      setTaskSuccess("");
      return;
    }

    setIsCreatingTask(true);
    setTaskError("");
    setTaskSuccess("");

    try {
      const result = await workspaceService.createTask({
        ...taskForm,
        assigneeId: Number(taskForm.assigneeId),
        kpiWeight: Number(taskForm.kpiWeight),
      });

      if (!result.success) {
        setTaskError(result.error || "Не удалось создать задачу.");
        return;
      }

      setTaskForm(initialTaskForm);
      setTaskSuccess("Задача создана и назначена сотруднику.");
      setIsCreateTaskModalOpen(false);
      await refreshWorkspaceData();
    } catch (error) {
      setTaskError(error.response?.data?.error || "Не удалось создать задачу.");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleTaskStatusDraftChange = (taskId) => (event) => {
    const nextStatus = event.target.value;
    setTaskStatusDrafts((current) => ({
      ...current,
      [taskId]: nextStatus,
    }));
  };

  const handleUpdateTaskStatus = async (taskId) => {
    const nextStatus = taskStatusDrafts[taskId];
    if (!nextStatus) {
      return;
    }

    setIsUpdatingTaskId(taskId);
    setTaskError("");
    setTaskSuccess("");

    try {
      const result = await workspaceService.updateTaskStatus(taskId, { status: nextStatus });

      if (!result.success) {
        setTaskError(result.error || "Не удалось обновить статус задачи.");
        return;
      }

      setTaskSuccess(result.message || "Статус задачи обновлён.");
      await refreshWorkspaceData();
    } catch (error) {
      setTaskError(error.response?.data?.error || "Не удалось обновить статус задачи.");
    } finally {
      setIsUpdatingTaskId(null);
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
          <span className="workspace-eyebrow">Исполнение KPI</span>
          <h2 className="workspace-title">Задачи и контроль сроков</h2>
          <p className="workspace-description">
            HR видит все задачи и может назначать их конкретным сотрудникам. Сотрудник видит только свои задачи и
            может сам менять статус выполнения.
          </p>
        </div>
        <div className="workspace-metrics">
          <div className="workspace-metric">
            <span className="workspace-metric-value">{tasks.length}</span>
            <span className="workspace-metric-label">Всего задач</span>
          </div>
          <div className="workspace-metric">
            <span className="workspace-metric-value">{completedTasks}</span>
            <span className="workspace-metric-label">Закрыто</span>
          </div>
          <div className="workspace-metric">
            <span className="workspace-metric-value">{overdueTasks}</span>
            <span className="workspace-metric-label">Просрочено</span>
          </div>
        </div>
      </section>

      <section className="workspace-panel">
        <div className="workspace-toolbar">
          {canManageTasks ? (
            <button type="button" className="appeal-primary-action" onClick={() => setIsCreateTaskModalOpen(true)}>
              Новая задача
            </button>
          ) : null}
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="workspace-select">
            <option value="all">Все статусы</option>
            <option value="pending">Ожидает</option>
            <option value="in_progress">В работе</option>
            <option value="completed">Завершена</option>
            <option value="cancelled">Отменена</option>
          </select>
          <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} className="workspace-select">
            <option value="all">Все отделы</option>
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </div>

        {taskError ? <div className="workspace-empty">{taskError}</div> : null}
        {taskSuccess ? <div className="workspace-success">{taskSuccess}</div> : null}

        <div className="workspace-card-grid">
          {filteredTasks.map((task) => {
            const canUpdateStatus = !canManageTasks && task.status !== "cancelled";
            const selectedStatus = taskStatusDrafts[task.id] || task.status;
            const hasStatusChanged = selectedStatus !== task.status;

            return (
              <article key={task.id} className="workspace-card">
                <div className="workspace-card-top">
                  <span className={`workspace-pill workspace-pill-${task.status}`}>{statusLabels[task.status]}</span>
                  <span className={`workspace-pill workspace-pill-${task.priority}`}>{priorityLabels[task.priority]}</span>
                </div>
                <h3 className="workspace-card-title">{task.title}</h3>
                <p className="workspace-card-copy">{task.description}</p>
                <p className="workspace-card-subtitle">{task.department} · {task.assignee}</p>
                <div className="workspace-meta-list">
                  <div className="workspace-meta-item">
                    <CalendarToday sx={{ fontSize: 16 }} />
                    <span>Срок: {task.deadline}</span>
                  </div>
                  <div className="workspace-meta-item">
                    <TaskAlt sx={{ fontSize: 16 }} />
                    <span>Вес KPI: {task.kpiWeight}%</span>
                  </div>
                  <div className="workspace-meta-item">
                    <Flag sx={{ fontSize: 16 }} />
                    <span>Приоритет: {priorityLabels[task.priority]}</span>
                  </div>
                </div>

                {canUpdateStatus ? (
                  <div className="appeal-form-actions">
                    <select
                      value={selectedStatus}
                      onChange={handleTaskStatusDraftChange(task.id)}
                      className="workspace-select"
                      disabled={isUpdatingTaskId === task.id}
                    >
                      {employeeTaskStatuses.map((statusOption) => (
                        <option key={statusOption.value} value={statusOption.value}>
                          {statusOption.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="appeal-primary-action"
                      onClick={() => handleUpdateTaskStatus(task.id)}
                      disabled={isUpdatingTaskId === task.id || !hasStatusChanged}
                    >
                      {isUpdatingTaskId === task.id ? "Сохранение..." : "Сохранить статус"}
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        {filteredTasks.length === 0 && (
          <div className="workspace-empty">
            <WarningAmber sx={{ fontSize: 20 }} />
            <span>По выбранным фильтрам задач нет.</span>
          </div>
        )}
      </section>

      {canManageTasks && isCreateTaskModalOpen ? (
        <div className="modal-overlay" onClick={() => setIsCreateTaskModalOpen(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="appeals-list-title">Новая задача</h3>
                <p className="appeal-create-description">Задача будет сразу привязана к выбранному сотруднику.</p>
              </div>
              <button type="button" className="modal-close" onClick={() => setIsCreateTaskModalOpen(false)}>
                ×
              </button>
            </div>

            <div className="appeal-form-grid">
              <label className="appeal-form-field">
                <span>Сотрудник</span>
                <select value={taskForm.assigneeId} onChange={handleTaskFormChange("assigneeId")} className="workspace-select">
                  <option value="">Выберите сотрудника</option>
                  {assignableEmployees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} · {employee.department}
                    </option>
                  ))}
                </select>
              </label>

              <label className="appeal-form-field">
                <span>Приоритет</span>
                <select value={taskForm.priority} onChange={handleTaskFormChange("priority")} className="workspace-select">
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </label>

              <label className="appeal-form-field">
                <span>Срок</span>
                <input type="date" value={taskForm.deadline} onChange={handleTaskFormChange("deadline")} className="appeal-chat-input" />
              </label>

              <label className="appeal-form-field appeal-form-field-wide">
                <span>Название</span>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={handleTaskFormChange("title")}
                  className="appeal-chat-input"
                  placeholder="Например: Пройти вводный инструктаж"
                />
              </label>

              <label className="appeal-form-field appeal-form-field-wide">
                <span>Описание</span>
                <textarea
                  value={taskForm.description}
                  onChange={handleTaskFormChange("description")}
                  className="appeal-chat-input appeal-chat-input-multiline"
                  placeholder="Опишите ожидаемый результат"
                />
              </label>

              <label className="appeal-form-field">
                <span>Вес KPI, %</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taskForm.kpiWeight}
                  onChange={handleTaskFormChange("kpiWeight")}
                  className="appeal-chat-input"
                />
              </label>
            </div>

            {taskError ? <div className="workspace-empty">{taskError}</div> : null}

            <div className="appeal-form-actions">
              <button type="button" className="appeal-secondary-action" onClick={() => setIsCreateTaskModalOpen(false)}>
                Отмена
              </button>
              <button type="button" className="appeal-primary-action" onClick={handleCreateTask} disabled={isCreatingTask}>
                {isCreatingTask ? "Сохранение..." : "Создать задачу"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Tasks;
