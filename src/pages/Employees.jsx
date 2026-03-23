import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, Add, Close, Edit, Delete, Email, Phone } from "@mui/icons-material";
import { employees as initialEmployees, departments } from "../data/mockData";
import "./../style/employees.css";

const statusConfig = {
  active: { label: "Активен", color: "status-active" },
  vacation: { label: "Отпуск", color: "status-vacation" },
  sick: { label: "Больничный", color: "status-sick" },
};

function kpiColor(kpi) {
  if (kpi >= 90) return "kpi-high";
  if (kpi >= 75) return "kpi-medium";
  return "kpi-low";
}

export const Employees = () => {
  const { user } = useOutletContext();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("Все");
  const [statusFilter, setStatusFilter] = useState("Все");
  const [showAddModal, setShowAddModal] = useState(false);
  const [employees, setEmployees] = useState(initialEmployees);
  const [newEmp, setNewEmp] = useState({
    name: "",
    department: "IT",
    position: "",
    email: "",
    phone: "",
    status: "active",
  });

  const isHR = user?.role === "hr" || user?.R_name === "hr";
  const isAdmin = user?.role === "admin" || user?.R_name === "admin";
  const isEmployee = user?.role === "employee" || user?.R_name === "employee";

  const userDepartment = user?.department || user?.Department_ID || null;
  const employeeDepartmentMatch = employees.filter((employee) => employee.department === userDepartment);
  const shouldLimitByDepartment = isEmployee && userDepartment && employeeDepartmentMatch.length > 0;
  const availableEmployees = shouldLimitByDepartment ? employeeDepartmentMatch : employees;

  const filteredEmployees = availableEmployees.filter((employee) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchSearch = !normalizedSearch
      || employee.name.toLowerCase().includes(normalizedSearch)
      || employee.position.toLowerCase().includes(normalizedSearch);
    const matchDept = deptFilter === "Все" || employee.department === deptFilter;
    const matchStatus = statusFilter === "Все" || statusConfig[employee.status]?.label === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const employeeStats = [
    { label: "Всего", value: availableEmployees.length, color: "stat-indigo" },
    { label: "Активны", value: availableEmployees.filter((employee) => employee.status === "active").length, color: "stat-emerald" },
    { label: "В отпуске", value: availableEmployees.filter((employee) => employee.status === "vacation").length, color: "stat-blue" },
    { label: "На больничном", value: availableEmployees.filter((employee) => employee.status === "sick").length, color: "stat-red" },
  ];

  function handleAdd() {
    if (!newEmp.name || !newEmp.position) return;

    const employee = {
      id: employees.length + 1,
      ...newEmp,
      kpi: Math.floor(70 + Math.random() * 25),
      hireDate: "2026-03-11",
      avatar: newEmp.name.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase(),
    };

    setEmployees([...employees, employee]);
    setShowAddModal(false);
    setNewEmp({ name: "", department: "IT", position: "", email: "", phone: "", status: "active" });
  }

  const canAddEmployee = isHR || isAdmin;

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
        <select
          value={deptFilter}
          onChange={(event) => setDeptFilter(event.target.value)}
          className="filter-select"
        >
          <option>Все</option>
          {departments.map((department) => <option key={department.id}>{department.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="filter-select"
        >
          <option>Все</option>
          <option>Активен</option>
          <option>Отпуск</option>
          <option>Больничный</option>
        </select>
        {canAddEmployee && (
          <button
            onClick={() => setShowAddModal(true)}
            className="add-button"
          >
            <Add sx={{ fontSize: 16 }} /> Добавить сотрудника
          </button>
        )}
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
                <th className="table-header">Должность</th>
                <th className="table-header">KPI</th>
                <th className="table-header">Статус</th>
                <th className="table-header">Дата найма</th>
                <th className="table-header">Контакты</th>
                {canAddEmployee && <th className="table-header"></th>}
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredEmployees.map((employee) => {
                const status = statusConfig[employee.status];
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
                          <div
                            className={`kpi-bar ${kpiColor(employee.kpi)}`}
                            style={{ width: `${employee.kpi}%` }}
                          ></div>
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
                        <span className="contact-icon" title={employee.phone}>
                          <Phone sx={{ fontSize: 15 }} />
                        </span>
                      </div>
                    </td>
                    {canAddEmployee && (
                      <td className="table-cell">
                        <div className="action-buttons">
                          <button className="action-btn edit-btn">
                            <Edit sx={{ fontSize: 13 }} />
                          </button>
                          <button
                            onClick={() => setEmployees(employees.filter((item) => item.id !== employee.id))}
                            className="action-btn delete-btn"
                          >
                            <Delete sx={{ fontSize: 13 }} />
                          </button>
                        </div>
                      </td>
                    )}
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

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Добавить сотрудника</h3>
              <button onClick={() => setShowAddModal(false)} className="modal-close">
                <Close sx={{ fontSize: 20 }} />
              </button>
            </div>
            <div className="modal-body">
              {[
                { label: "ФИО *", key: "name", type: "text", placeholder: "Иванов Иван Иванович" },
                { label: "Должность *", key: "position", type: "text", placeholder: "Инженер" },
                { label: "Email", key: "email", type: "email", placeholder: "ivanov@corp.ru" },
                { label: "Телефон", key: "phone", type: "text", placeholder: "+7 (900) 000-00-00" },
              ].map((field) => (
                <div key={field.key} className="form-group">
                  <label className="form-label">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={newEmp[field.key]}
                    onChange={(event) => setNewEmp({ ...newEmp, [field.key]: event.target.value })}
                    className="form-input"
                  />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Отдел</label>
                <select
                  value={newEmp.department}
                  onChange={(event) => setNewEmp({ ...newEmp, department: event.target.value })}
                  className="form-select"
                >
                  {departments.map((department) => <option key={department.id}>{department.name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAddModal(false)} className="modal-btn modal-btn-secondary">
                Отмена
              </button>
              <button onClick={handleAdd} className="modal-btn modal-btn-primary">
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
