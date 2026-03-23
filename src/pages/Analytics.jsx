import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, Cell
} from "recharts";
import { employees, departments, kpiTrend } from "../data/mockData";
import { TrendingUp, TrendingDown, Remove } from "@mui/icons-material";
import "./../style/analytics.css";

const employeeRadar = [
  { metric: "Задачи", value: 88 },
  { metric: "Посещ.", value: 95 },
  { metric: "Качество", value: 82 },
  { metric: "Скорость", value: 79 },
  { metric: "Команда", value: 91 },
  { metric: "Обучение", value: 74 },
];

function KPIBadge({ kpi }) {
  if (kpi >= 90) return <span className="kpi-badge kpi-badge-up"><TrendingUp sx={{ fontSize: 11 }} />{kpi}%</span>;
  if (kpi >= 75) return <span className="kpi-badge kpi-badge-stable"><Remove sx={{ fontSize: 11 }} />{kpi}%</span>;
  return <span className="kpi-badge kpi-badge-down"><TrendingDown sx={{ fontSize: 11 }} />{kpi}%</span>;
}

export const Analytics = () => {
  const { user } = useOutletContext();
  const [view, setView] = useState("departments");
  const [selectedEmp, setSelectedEmp] = useState(employees[0]);
  const [selectedDept, setSelectedDept] = useState("Все");

  const isEmployee = user?.role === "employee" || user?.R_name === "employee";

  const userDepartment = user?.department || user?.Department_ID || null;

  const filteredEmps = isEmployee && userDepartment
    ? employees.filter(e => e.department === userDepartment)
    : employees;

  const filteredDepts = isEmployee && userDepartment
    ? departments.filter(d => d.name === userDepartment)
    : departments;

  const avgKPI = Math.round(filteredEmps.reduce((s, e) => s + e.kpi, 0) / filteredEmps.length);

  return (
    <div className="analytics-page">
      <div className="view-toggle">
        <button
          onClick={() => setView("departments")}
          className={`toggle-btn ${view === "departments" ? "toggle-btn-active" : ""}`}
        >
          По отделам
        </button>
        <button
          onClick={() => setView("employees")}
          className={`toggle-btn ${view === "employees" ? "toggle-btn-active" : ""}`}
        >
          По сотрудникам
        </button>
      </div>

      {view === "departments" ? (
        <div className="departments-view">
          <div className="chart-card-full">
            <h3 className="chart-title">Динамика KPI по отделам</h3>
            <p className="chart-subtitle">Октябрь 2025 — Март 2026</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={kpiTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="production" name="Производство" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="it" name="IT" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="hr" name="HR" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="marketing" name="Маркетинг" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="logistics" name="Логистика" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="dept-stats-grid">
            {filteredDepts.map(dept => (
              <div key={dept.id} className="dept-stat-card">
                <div className="dept-stat-icon" style={{ backgroundColor: dept.color + "20" }}>
                  <div className="dept-stat-dot" style={{ backgroundColor: dept.color }}></div>
                </div>
                <div className={`dept-stat-kpi ${dept.kpi >= 85 ? "kpi-high" : dept.kpi >= 75 ? "kpi-medium" : "kpi-low"}`}>
                  {dept.kpi}%
                </div>
                <div className="dept-stat-name">{dept.name}</div>
                <div className="dept-stat-count">{dept.employeeCount} чел.</div>
              </div>
            ))}
          </div>

          <div className="chart-card-full">
            <h3 className="chart-title">Сравнение KPI — Март 2026</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredDepts} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} formatter={(val) => [`${val}%`, "KPI"]} />
                <Bar dataKey="kpi" name="KPI" radius={[6, 6, 0, 0]}>
                  {filteredDepts.map(d => <Cell key={d.id} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="employees-view">
          <div className="employees-filters">
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="filter-select"
            >
              <option>Все</option>
              {filteredDepts.map(d => <option key={d.id}>{d.name}</option>)}
            </select>
            <div className="avg-kpi-badge">
              Средний KPI: <span className="avg-kpi-value">{avgKPI}%</span>
            </div>
          </div>

          <div className="employees-analytics-grid">
            <div className="employee-list-card">
              <div className="card-header">
                <span className="card-title">Список сотрудников</span>
              </div>
              <div className="employee-scroll-list">
                {filteredEmps.map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmp(emp)}
                    className={`employee-list-item ${selectedEmp.id === emp.id ? "employee-list-item-active" : ""}`}
                  >
                    <div className="employee-avatar-list">{emp.avatar}</div>
                    <div className="employee-info-list">
                      <p className="employee-name-list">{emp.name}</p>
                      <p className="employee-position-list">{emp.position}</p>
                    </div>
                    <KPIBadge kpi={emp.kpi} />
                  </button>
                ))}
              </div>
            </div>

            <div className="employee-detail-section">
              <div className="employee-detail-card">
                <div className="employee-detail-header">
                  <div className="employee-avatar-large">{selectedEmp.avatar}</div>
                  <div>
                    <h3 className="employee-detail-name">{selectedEmp.name}</h3>
                    <p className="employee-detail-position">{selectedEmp.position} · {selectedEmp.department}</p>
                    <KPIBadge kpi={selectedEmp.kpi} />
                  </div>
                </div>
                <div className="employee-metrics-grid">
                  {[
                    { label: "KPI общий", value: `${selectedEmp.kpi}%`, color: "indigo" },
                    { label: "Задачи", value: "12/14", color: "emerald" },
                    { label: "Курсы", value: "3/4", color: "violet" },
                  ].map(m => (
                    <div key={m.label} className={`metric-card metric-${m.color}`}>
                      <div className={`metric-value metric-value-${m.color}`}>{m.value}</div>
                      <div className="metric-label">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-card-full">
                <h4 className="radar-title">Метрики производительности</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={employeeRadar}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                    <Radar name={selectedEmp.name} dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
