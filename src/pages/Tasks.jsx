import { useMemo, useState } from "react";
import { CalendarToday, Flag, TaskAlt, WarningAmber } from "@mui/icons-material";
import { tasks } from "../data/mockData";
import "./../style/workspace-pages.css";

const statusLabels = {
  pending: "Ожидает",
  in_progress: "В работе",
  completed: "Завершена",
};

const priorityLabels = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

export const Tasks = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const departments = useMemo(
    () => [...new Set(tasks.map((task) => task.department))],
    [],
  );

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = statusFilter === "all" || task.status === statusFilter;
    const departmentMatch = departmentFilter === "all" || task.department === departmentFilter;
    return statusMatch && departmentMatch;
  });

  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const overdueTasks = tasks.filter((task) => task.deadline < "2026-03-24" && task.status !== "completed").length;

  return (
    <div className="workspace-page">
      <section className="workspace-hero">
        <div>
          <span className="workspace-eyebrow">Исполнение KPI</span>
          <h2 className="workspace-title">Задачи и контроль сроков</h2>
          <p className="workspace-description">
            Единая лента задач по подразделениям, приоритетам и дедлайнам.
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
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="workspace-select">
            <option value="all">Все статусы</option>
            <option value="pending">Ожидает</option>
            <option value="in_progress">В работе</option>
            <option value="completed">Завершена</option>
          </select>
          <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} className="workspace-select">
            <option value="all">Все отделы</option>
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </div>

        <div className="workspace-card-grid">
          {filteredTasks.map((task) => (
            <article key={task.id} className="workspace-card">
              <div className="workspace-card-top">
                <span className={`workspace-pill workspace-pill-${task.status}`}>{statusLabels[task.status]}</span>
                <span className={`workspace-pill workspace-pill-${task.priority}`}>{priorityLabels[task.priority]}</span>
              </div>
              <h3 className="workspace-card-title">{task.title}</h3>
              <p className="workspace-card-subtitle">{task.department} • {task.assignee}</p>
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
            </article>
          ))}
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
