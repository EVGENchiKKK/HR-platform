import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, Email, Phone } from "@mui/icons-material";
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

export const Employees = () => {
  const { user, workspaceData, workspaceLoading, workspaceError } = useOutletContext();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("Все");
  const [statusFilter, setStatusFilter] = useState("Все");

  const employees = workspaceData.employees || [];
  const departments = workspaceData.departments || [];

  const isEmployee = user?.role === "employee" || user?.R_name === "employee";
  const userDepartment = user?.department || null;

  const availableEmployees = useMemo(() => {
    if (!isEmployee || !userDepartment) {
      return employees;
    }
    return employees.filter((employee) => employee.department === userDepartment);
  }, [employees, isEmployee, userDepartment]);

  const filteredEmployees = availableEmployees.filter((employee) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchSearch = !normalizedSearch
      || employee.name.toLowerCase().includes(normalizedSearch)
      || employee.position.toLowerCase().includes(normalizedSearch)
      || employee.email.toLowerCase().includes(normalizedSearch);
    const matchDept = deptFilter === "Все" || employee.department === deptFilter;
    const matchStatus = statusFilter === "Все" || statusConfig[employee.status]?.label === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const employeeStats = [
    { label: "Всего", value: availableEmployees.length, color: "stat-indigo" },
    { label: "Активны", value: availableEmployees.filter((employee) => employee.status === "active").length, color: "stat-emerald" },
    { label: "Неактивны", value: availableEmployees.filter((employee) => employee.status === "inactive").length, color: "stat-red" },
    { label: "Средний KPI", value: availableEmployees.length ? `${Math.round(availableEmployees.reduce((sum, employee) => sum + employee.kpi, 0) / availableEmployees.length)}%` : "0%", color: "stat-blue" },
  ];

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
                  <tr key={employee.id} className="table-row">
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
                        <a href={`mailto:${employee.email}`} className="contact-icon" title={employee.email}>
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
    </div>
  );
};
