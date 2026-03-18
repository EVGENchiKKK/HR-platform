import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  People,
  TrendingUp,
  AssignmentTurnedIn,
  ReportProblem,
  ArrowUpward,
  ArrowDownward,
  CheckCircle,
  Schedule,
  Cancel,
} from "@mui/icons-material";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { employees, kpiTrend, taskStatusData, departments } from "../data/mockData";
import "./../style/dashboard.css";

const statusConfig = {
  active: { label: "Активен", color: "status-active", icon: CheckCircle },
  vacation: { label: "Отпуск", color: "status-vacation", icon: Schedule },
  sick: { label: "Больничный", color: "status-sick", icon: Cancel },
};

export const Dashboard = () => {
  const { user } = useOutletContext();
  const [selectedPeriod, setSelectedPeriod] = useState("6м");

  const getUserName = () => {
    if (!user) return "Пользователь";
    return user.firstName || user.U_name || "Пользователь";
  };

  const statCards = [
    { label: "Всего сотрудников", value: "101", icon: People, color: "bg-indigo", change: "+3", up: true, sub: "За последний месяц" },
    { label: "Средний KPI", value: "84.6%", icon: TrendingUp, color: "bg-emerald", change: "+2.1%", up: true, sub: "По всем отделам" },
    { label: "Задач выполнено", value: "34", icon: AssignmentTurnedIn, color: "bg-violet", change: "-2", up: false, sub: "Из 88 активных" },
    { label: "Открытых обращений", value: "3", icon: ReportProblem, color: "bg-amber", change: "+1", up: false, sub: "Требуют ответа" },
  ];

  return (
    <div className="dashboard">
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1 className="welcome-title">
            Добро пожаловать, {getUserName()}!
          </h1>
          <p className="welcome-date">
            Сегодня, {new Date().toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
              weekday: "long"
            })}
          </p>
        </div>
        <div className="welcome-stats">
          <div className="stat-item">
            <span className="stat-number">5</span>
            <span className="stat-label">Новых событий</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">2</span>
            <span className="stat-label">Опросов активно</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">8</span>
            <span className="stat-label">Задач сегодня</span>
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
              <div className={`stat-card-change ${card.up ? "change-up" : "change-down"}`}>
                {card.up ? <ArrowUpward sx={{ fontSize: 14 }} /> : <ArrowDownward sx={{ fontSize: 14 }} />}
                {card.change} к прошлому месяцу
              </div>
            </div>
          );
        })}
      </div>

      <div className="charts-row">
        <div className="chart-card chart-card-large">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Динамика KPI по отделам</h3>
              <p className="chart-subtitle">Последние 6 месяцев</p>
            </div>
            <div className="period-selector">
              {["3м", "6м", "1г"].map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className={`period-btn ${selectedPeriod === p ? "period-btn-active" : ""}`}
                >{p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={kpiTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Line type="monotone" dataKey="production" name="Производство" stroke="#6366f1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="it" name="IT" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="hr" name="HR" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="marketing" name="Маркетинг" stroke="#14b8a6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="logistics" name="Логистика" stroke="#f97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Статус задач</h3>
          <p className="chart-subtitle">Текущий период</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {taskStatusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {taskStatusData.map(item => (
              <div key={item.name} className="pie-legend-item">
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
          <h3 className="chart-title">KPI по отделам</h3>
          <p className="chart-subtitle">Март 2026</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={departments} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="kpi" name="KPI %" radius={[0, 4, 4, 0]}>
                {departments.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header-link">
            <div>
              <h3 className="chart-title">Сотрудники</h3>
              <p className="chart-subtitle">Последняя активность</p>
            </div>
            <a href="/employees" className="view-all-link">Все</a>
          </div>
          <div className="employee-list">
            {employees.slice(0, 5).map(emp => {
              const s = statusConfig[emp.status];
              const SIcon = s.icon;
              return (
                <div key={emp.id} className="employee-item">
                  <div className="employee-avatar">{emp.avatar}</div>
                  <div className="employee-info">
                    <p className="employee-name">{emp.name}</p>
                    <p className="employee-department">{emp.department} · {emp.position}</p>
                  </div>
                  <div className="employee-stats">
                    <span className="employee-kpi">{emp.kpi}%</span>
                    <span className={`status-badge ${s.color}`}>{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}