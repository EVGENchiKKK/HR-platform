import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  People,
  TrendingUp,
  AssignmentTurnedIn,
  ReportProblem,
  ArrowUpward,
  ArrowDownward,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import getRoleLabel from "../utils/roleLabels";
import ReportExportPanel from "../components/ReportExportPanel";
import "./../style/dashboard.css";

const statusConfig = {
  active: { label: "Активен", color: "status-active", icon: CheckCircle },
  inactive: { label: "Неактивен", color: "status-sick", icon: Cancel },
};

const clampPercent = (value) => {
  const normalized = Number(value || 0);
  if (!Number.isFinite(normalized)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(normalized)));
};

export const Dashboard = () => {
  const { user, workspaceData, workspaceLoading, workspaceError } = useOutletContext();

  const { employees = [], tasks = [], appeals = [], departments = [], surveys = [], monthlyStats = [], currentUserRole } = workspaceData;

  const isManager = ["hr", "admin"].includes((currentUserRole || user?.role || user?.R_name || "").toLowerCase());
  const currentUserId = Number(user?.id || user?.User_ID || 0);
  const currentEmployee = employees.find((employee) => Number(employee.id) === currentUserId) || employees[0] || null;

  const getUserName = () => {
    if (!user) {
      return "Пользователь";
    }
    return user.firstName || user.U_name || currentEmployee?.firstName || "Пользователь";
  };

  const taskStatusData = useMemo(() => {
    const source = [
      { key: "completed", name: "Выполнено", color: "#22c55e" },
      { key: "in_progress", name: "В работе", color: "#6366f1" },
      { key: "pending", name: "Ожидает", color: "#f59e0b" },
      { key: "cancelled", name: "Отменено", color: "#ef4444" },
    ];

    return source.map((item) => ({
      ...item,
      value: tasks.filter((task) => task.status === item.key).length,
    }));
  }, [tasks]);

  const avgKpi = employees.length
    ? Math.round(employees.reduce((sum, employee) => sum + Number(employee.kpi || 0), 0) / employees.length)
    : 0;

  const openAppeals = appeals.filter((item) => item.status === "open" || item.status === "in_review").length;
  const activeSurveys = surveys.filter((survey) => survey.status === "active").length;
  const currentMonth = monthlyStats.at(-1);
  const previousMonth = monthlyStats.at(-2);

  const monthDelta = (currentValue, previousValue) => {
    const diff = Number(currentValue || 0) - Number(previousValue || 0);
    return `${diff >= 0 ? "+" : ""}${diff}`;
  };

  const employeeSurveyCompletion = useMemo(() => {
    if (!currentEmployee) {
      return 0;
    }
    const total = surveys.length || 0;
    if (!total) {
      return 0;
    }
    return clampPercent((surveys.filter((survey) => survey.myResult?.isCompleted).length / total) * 100);
  }, [currentEmployee, surveys]);

  const employeeProgressCards = currentEmployee
    ? [
      {
        label: "Личный KPI",
        value: `${clampPercent(currentEmployee.kpi)}%`,
        sub: "Фактическое значение из базы",
        change: `${clampPercent(currentEmployee.kpi) >= 75 ? "+" : ""}${clampPercent(currentEmployee.kpi) - 75}%`,
        up: clampPercent(currentEmployee.kpi) >= 75,
        progress: clampPercent(currentEmployee.kpi),
        icon: TrendingUp,
        color: "bg-emerald",
      },
      {
        label: "Прогресс обучения",
        value: `${clampPercent(currentEmployee.moduleProgress || currentEmployee.courseProgress)}%`,
        sub: `${currentEmployee.completedModules || 0} из ${currentEmployee.totalModules || 0} модулей`,
        change: `${currentEmployee.completedCourses || 0} курсов завершено`,
        up: true,
        progress: clampPercent(currentEmployee.moduleProgress || currentEmployee.courseProgress),
        icon: AssignmentTurnedIn,
        color: "bg-violet",
      },
      {
        label: "Опросы",
        value: `${employeeSurveyCompletion}%`,
        sub: `${surveys.filter((survey) => survey.myResult?.isCompleted).length} из ${surveys.length}`,
        change: activeSurveys ? `${activeSurveys} активных` : "Нет активных",
        up: employeeSurveyCompletion >= 50,
        progress: employeeSurveyCompletion,
        icon: ReportProblem,
        color: "bg-amber",
      },
      {
        label: "Задачи",
        value: `${clampPercent(currentEmployee.taskCompletion)}%`,
        sub: `${currentEmployee.completedTasks || 0} из ${currentEmployee.totalTasks || 0} выполнено`,
        change: `${tasks.filter((task) => task.status === "in_progress").length} в работе`,
        up: clampPercent(currentEmployee.taskCompletion) >= 50,
        progress: clampPercent(currentEmployee.taskCompletion),
        icon: People,
        color: "bg-indigo",
      },
    ]
    : [];

  const managerCards = [
    {
      label: "Всего сотрудников",
      value: `${employees.length}`,
      icon: People,
      color: "bg-indigo",
      change: monthDelta(currentMonth?.hires, previousMonth?.hires),
      up: (currentMonth?.hires || 0) >= (previousMonth?.hires || 0),
      sub: "Найм по месяцам",
      progress: employees.length ? clampPercent(avgKpi) : 0,
    },
    {
      label: "Средний KPI",
      value: `${avgKpi}%`,
      icon: TrendingUp,
      color: "bg-emerald",
      change: `${avgKpi >= 80 ? "+" : ""}${avgKpi - 75}%`,
      up: avgKpi >= 75,
      sub: "По видимым сотрудникам",
      progress: clampPercent(avgKpi),
    },
    {
      label: "Задач за месяц",
      value: `${currentMonth?.tasks || 0}`,
      icon: AssignmentTurnedIn,
      color: "bg-violet",
      change: monthDelta(currentMonth?.tasks, previousMonth?.tasks),
      up: (currentMonth?.tasks || 0) >= (previousMonth?.tasks || 0),
      sub: "Текущий месяц",
      progress: tasks.length ? clampPercent((tasks.filter((task) => task.status === "completed").length / tasks.length) * 100) : 0,
    },
    {
      label: "Обращения за месяц",
      value: `${currentMonth?.appeals || 0}`,
      icon: ReportProblem,
      color: "bg-amber",
      change: monthDelta(currentMonth?.appeals, previousMonth?.appeals),
      up: (currentMonth?.appeals || 0) <= (previousMonth?.appeals || 0),
      sub: "Сравнение с прошлым месяцем",
      progress: appeals.length ? clampPercent((openAppeals / appeals.length) * 100) : 0,
    },
  ];

  const statCards = isManager ? managerCards : employeeProgressCards;

  if (workspaceLoading) {
    return <div className="dashboard">Загрузка данных...</div>;
  }

  if (workspaceError) {
    return <div className="dashboard">{workspaceError}</div>;
  }

  return (
    <div className="dashboard">
      <ReportExportPanel
        workspaceData={workspaceData}
        user={user}
        title="Экспорт аналитики и метрик"
        scopeTitle="Дашборд HR-платформы"
      />

      <div className="welcome-banner">
        <div className="welcome-content">
          <h1 className="welcome-title">Добро пожаловать, {getUserName()}!</h1>
          <p className="welcome-date">
            Сегодня, {new Date().toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
              weekday: "long",
            })}
          </p>
        </div>
        <div className="welcome-stats">
          <div className="stat-item">
            <span className="stat-number">{openAppeals}</span>
            <span className="stat-label">{isManager ? "Активных обращений" : "Моих обращений"}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{activeSurveys}</span>
            <span className="stat-label">Активных опросов</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{tasks.filter((task) => task.status === "in_progress").length}</span>
            <span className="stat-label">Задач в работе</span>
          </div>
        </div>
        <div className="welcome-icon">
          <People sx={{ fontSize: 160 }} />
        </div>
      </div>

      <div className="stat-cards-grid">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-info">
                  <p className="stat-card-label">{card.label}</p>
                  <p className="stat-card-value">{card.value}</p>
                  <p className="stat-card-sub">{card.sub}</p>
                </div>
                <div className={`stat-card-icon ${card.color}`}>
                  <Icon sx={{ fontSize: 20 }} />
                </div>
              </div>
              <div className="dashboard-progress">
                <div className="dashboard-progress-track">
                  <div className="dashboard-progress-fill" style={{ width: `${clampPercent(card.progress)}%` }} />
                </div>
                <span className="dashboard-progress-label">{clampPercent(card.progress)}%</span>
              </div>
              <div className={`stat-card-change ${card.up ? "change-up" : "change-down"}`}>
                {card.up ? <ArrowUpward sx={{ fontSize: 14 }} /> : <ArrowDownward sx={{ fontSize: 14 }} />}
                {card.change}
              </div>
            </div>
          );
        })}
      </div>

      <div className="charts-row">
        <div className="chart-card chart-card-large">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Статистика по месяцам</h3>
              <p className="chart-subtitle">Только данные, доступные текущему пользователю</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Line type="monotone" dataKey="tasks" name="Задачи" stroke="#6366f1" strokeWidth={2.5} />
              <Line type="monotone" dataKey="appeals" name="Обращения" stroke="#f59e0b" strokeWidth={2.5} />
              <Line type="monotone" dataKey="hires" name="Найм" stroke="#22c55e" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Статусы задач</h3>
          <p className="chart-subtitle">Актуальный срез из базы данных</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {taskStatusData.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {taskStatusData.map((item) => (
              <div key={item.key} className="pie-legend-item">
                <div className="pie-legend-color" style={{ backgroundColor: item.color }}></div>
                <span className="pie-legend-label">{item.name}</span>
                <span className="pie-legend-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bottom-row">
        <div className="chart-card">
          <h3 className="chart-title">{isManager ? "Нагрузка отделов" : "Мой отдел"}</h3>
          <p className="chart-subtitle">Активные задачи и обращения</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={departments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="activeTasks" name="Активные задачи" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="appealCount" name="Обращения" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header-link">
            <div>
              <h3 className="chart-title">{isManager ? "Сотрудники" : "Мой профиль"}</h3>
              <p className="chart-subtitle">Актуальные записи из БД</p>
            </div>
          </div>
          <div className="employee-list">
            {employees.slice(0, isManager ? 5 : 1).map((employee) => {
              const status = statusConfig[employee.status] || statusConfig.active;
              return (
                <div key={employee.id} className="employee-item">
                  <div className="employee-avatar">{employee.avatar}</div>
                  <div className="employee-info">
                    <p className="employee-name">{employee.name}</p>
                    <p className="employee-department">{employee.department} · {getRoleLabel(employee.position)}</p>
                  </div>
                  <div className="employee-stats">
                    <span className="employee-kpi">{clampPercent(employee.kpi)}%</span>
                    <span className={`status-badge ${status.color}`}>{status.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
