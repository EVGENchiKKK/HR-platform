import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, LineChart, Line, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Remove } from "@mui/icons-material";
import "./../style/analytics.css";

function KPIBadge({ kpi }) {
  if (kpi >= 90) return <span className="kpi-badge kpi-badge-up"><TrendingUp sx={{ fontSize: 11 }} />{kpi}%</span>;
  if (kpi >= 75) return <span className="kpi-badge kpi-badge-stable"><Remove sx={{ fontSize: 11 }} />{kpi}%</span>;
  return <span className="kpi-badge kpi-badge-down"><TrendingDown sx={{ fontSize: 11 }} />{kpi}%</span>;
}

const clampPercent = (value) => {
  const normalized = Number(value || 0);
  if (!Number.isFinite(normalized)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(normalized)));
};

const buildEmployeeRadar = (employee) => ([
  { metric: "Задачи", value: clampPercent(employee.taskCompletion) },
  { metric: "Обучение", value: clampPercent(employee.moduleProgress || employee.courseProgress) },
  { metric: "KPI", value: clampPercent(employee.kpi) },
  { metric: "Опросы", value: clampPercent(employee.averageSurveyScore) },
  { metric: "Активность", value: clampPercent(employee.activityScore) },
  { metric: "Баллы", value: clampPercent(employee.pointsBalance) },
]);

export const Analytics = () => {
  const { user, workspaceData, workspaceLoading, workspaceError } = useOutletContext();
  const [view, setView] = useState("departments");
  const [selectedDept, setSelectedDept] = useState("Все");
  const [selectedEmpId, setSelectedEmpId] = useState(null);

  const employees = workspaceData.employees || [];
  const departments = workspaceData.departments || [];
  const departmentMonthlyStats = workspaceData.departmentMonthlyStats || [];
  const currentRole = `${workspaceData.currentUserRole || user?.role || user?.R_name || ""}`.toLowerCase();
  const isManager = ["hr", "admin"].includes(currentRole);
  const currentUserId = Number(user?.id || user?.User_ID || 0);
  const currentEmployee = employees.find((employee) => Number(employee.id) === currentUserId) || employees[0] || null;

  const filteredDepts = useMemo(() => {
    if (!isManager) {
      return departments.slice(0, 1);
    }
    return departments;
  }, [departments, isManager]);

  const filteredEmps = useMemo(() => {
    if (!isManager) {
      return currentEmployee ? [currentEmployee] : [];
    }

    if (selectedDept === "Все") {
      return employees;
    }

    return employees.filter((employee) => employee.department === selectedDept);
  }, [currentEmployee, employees, isManager, selectedDept]);

  const selectedEmp = filteredEmps.find((employee) => employee.id === selectedEmpId) ?? filteredEmps[0] ?? null;
  const avgKPI = filteredEmps.length ? Math.round(filteredEmps.reduce((sum, employee) => sum + employee.kpi, 0) / filteredEmps.length) : 0;

  if (workspaceLoading) {
    return <div className="analytics-page">Загрузка данных...</div>;
  }

  if (workspaceError) {
    return <div className="analytics-page">{workspaceError}</div>;
  }

  return (
    <div className="analytics-page">
      {isManager ? (
        <div className="view-toggle">
          <button onClick={() => setView("departments")} className={`toggle-btn ${view === "departments" ? "toggle-btn-active" : ""}`}>По отделам</button>
          <button onClick={() => setView("employees")} className={`toggle-btn ${view === "employees" ? "toggle-btn-active" : ""}`}>По сотрудникам</button>
        </div>
      ) : null}

      {(!isManager || view === "departments") ? (
        <div className="departments-view">
          <div className="chart-card-full">
            <h3 className="chart-title">{isManager ? "Активность отделов по месяцам" : "Активность моего отдела"}</h3>
            <p className="chart-subtitle">Только актуальные данные, доступные текущему пользователю</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={departmentMonthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                {filteredDepts.map((department) => (
                  <Line
                    key={department.id}
                    type="monotone"
                    dataKey={department.code || department.name}
                    name={department.name}
                    stroke={department.color}
                    strokeWidth={2.5}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="dept-stats-grid">
            {filteredDepts.map((department) => (
              <div key={department.id} className="dept-stat-card">
                <div className="dept-stat-icon" style={{ backgroundColor: `${department.color}20` }}>
                  <div className="dept-stat-dot" style={{ backgroundColor: department.color }}></div>
                </div>
                <div className={`dept-stat-kpi ${department.kpi >= 85 ? "kpi-high" : department.kpi >= 75 ? "kpi-medium" : "kpi-low"}`}>{department.kpi}%</div>
                <div className="dept-stat-name">{department.name}</div>
                <div className="dept-stat-count">{department.employeeCount} чел.</div>
              </div>
            ))}
          </div>

          <div className="chart-card-full">
            <h3 className="chart-title">Операционная нагрузка</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredDepts} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="activeTasks" name="Активные задачи" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="appealCount" name="Обращения" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="employees-view">
          <div className="employees-filters">
            <select value={selectedDept} onChange={(event) => setSelectedDept(event.target.value)} className="filter-select">
              <option>Все</option>
              {departments.map((department) => <option key={department.id}>{department.name}</option>)}
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
                {filteredEmps.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => setSelectedEmpId(employee.id)}
                    className={`employee-list-item ${selectedEmp?.id === employee.id ? "employee-list-item-active" : ""}`}
                  >
                    <div className="employee-avatar-list">{employee.avatar}</div>
                    <div className="employee-info-list">
                      <p className="employee-name-list">{employee.name}</p>
                      <p className="employee-position-list">{employee.position}</p>
                    </div>
                    <KPIBadge kpi={employee.kpi} />
                  </button>
                ))}
              </div>
            </div>

            {selectedEmp ? (
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
                      { label: "KPI", value: `${clampPercent(selectedEmp.kpi)}%`, color: "indigo" },
                      { label: "Задачи", value: `${selectedEmp.completedTasks}/${selectedEmp.totalTasks}`, color: "emerald" },
                      { label: "Модули", value: `${selectedEmp.completedModules}/${selectedEmp.totalModules || 0}`, color: "violet" },
                    ].map((metric) => (
                      <div key={metric.label} className={`metric-card metric-${metric.color}`}>
                        <div className={`metric-value metric-value-${metric.color}`}>{metric.value}</div>
                        <div className="metric-label">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-card-full">
                  <h4 className="radar-title">Метрики сотрудника</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={buildEmployeeRadar(selectedEmp)}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                      <Radar name={selectedEmp.name} dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                      <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
