import { useMemo, useState } from "react";
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

export const Tasks = () => {
  const { user, workspaceData, workspaceLoading, workspaceError, refreshWorkspaceData } = useOutletContext();
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isCompletingTaskId, setIsCompletingTaskId] = useState(null);
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
      await refreshWorkspaceData();
    } catch (error) {
      setTaskError(error.response?.data?.error || "Не удалось создать задачу.");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    setIsCompletingTaskId(taskId);
    setTaskError("");
    setTaskSuccess("");

    try {
      const result = await workspaceService.completeTask(taskId);

      if (!result.success) {
        setTaskError(result.error || "Не удалось завершить задачу.");
        return;
      }

      setTaskSuccess(result.message || "Задача завершена.");
      await refreshWorkspaceData();
    } catch (error) {
      setTaskError(error.response?.data?.error || "Не удалось завершить задачу.");
    } finally {
      setIsCompletingTaskId(null);
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
            может сам отмечать их завершение.
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

      {canManageTasks ? (
        <section className="appeal-create-panel">
          <div className="appeal-create-header">
            <div>
              <h3 className="appeals-list-title">Новая задача</h3>
              <p className="appeal-create-description">Задача будет сразу привязана к выбранному сотруднику.</p>
            </div>
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

          <div className="appeal-form-actions">
            <button type="button" className="appeal-primary-action" onClick={handleCreateTask} disabled={isCreatingTask}>
              {isCreatingTask ? "Сохранение..." : "Создать задачу"}
            </button>
          </div>
        </section>
      ) : null}

      <section className="workspace-panel">
        <div className="workspace-toolbar">
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
            const canComplete = !canManageTasks && task.status !== "completed" && task.status !== "cancelled";

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

                {canComplete ? (
                  <div className="appeal-form-actions">
                    <button
                      type="button"
                      className="appeal-primary-action"
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={isCompletingTaskId === task.id}
                    >
                      {isCompletingTaskId === task.id ? "Завершение..." : "Отметить выполнение"}
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
    </div>
  );
};

export default Tasks;
