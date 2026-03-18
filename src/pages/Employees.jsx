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
  const [newEmp, setNewEmp] = useState({ name: "", department: "IT", position: "", email: "", phone: "", status: "active" });

  const isHR = user?.role === "hr" || user?.R_name === "hr";
  const isManager = user?.role === "manager" || user?.R_name === "manager";
  const isAdmin = user?.role === "admin" || user?.R_name === "admin";
  const isEmployee = user?.role === "employee" || user?.R_name === "employee";

  const userDepartment = user?.department || user?.Department_ID || null;
  const baseEmployees = isEmployee && userDepartment
    ? employees.filter(e => e.department === userDepartment)
    : employees;

  const filtered = baseEmployees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.position.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "Все" || e.department === deptFilter;
    const matchStatus = statusFilter === "Все" || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  function handleAdd() {
    if (!newEmp.name || !newEmp.position) return;
    const emp = {
      id: employees.length + 1,
      ...newEmp,
      kpi: Math.floor(70 + Math.random() * 25),
      hireDate: "2026-03-11",
      avatar: newEmp.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
    };
    setEmployees([...employees, emp]);
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
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="filter-select"
        >
          <option>Все</option>
          {departments.map(d => <option key={d.id}>{d.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
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
        {[
          { label: "Всего", value: filtered.length, color: "stat-indigo" },
          { label: "Активны", value: filtered.filter(e => e.status === "active").length, color: "stat-emerald" },
          { label: "В отпуске", value: filtered.filter(e => e.status === "vacation").length, color: "stat-blue" },
          { label: "На больничном", value: filtered.filter(e => e.status === "sick").length, color: "stat-red" },
        ].map(s => (
          <div key={s.label} className="stat-card-small">
            <span className="stat-label-small">{s.label}</span>
            <span className={`stat-value-small ${s.color}`}>{s.value}</span>
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
              {filtered.map(emp => {
                const s = statusConfig[emp.status];
                return (
                  <tr key={emp.id} className="table-row">
                    <td className="table-cell">
                      <div className="employee-cell">
                        <div className="employee-avatar-small">{emp.avatar}</div>
                        <span className="employee-name-cell">{emp.name}</span>
                      </div>
                    </td>
                    <td className="table-cell">{emp.department}</td>
                    <td className="table-cell">{emp.position}</td>
                    <td className="table-cell">
                      <div className="kpi-cell">
                        <div className="kpi-bar-container">
                          <div
                            className={`kpi-bar ${kpiColor(emp.kpi)}`}
                            style={{ width: `${emp.kpi}%` }}
                          ></div>
                        </div>
                        <span className={`kpi-value ${kpiColor(emp.kpi)}`}>{emp.kpi}%</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge-small ${s.color}`}>{s.label}</span>
                    </td>
                    <td className="table-cell date-cell">{emp.hireDate}</td>
                    <td className="table-cell">
                      <div className="contact-icons">
                        <a href={`mailto:${emp.email}`} className="contact-icon" title={emp.email}>
                          <Email sx={{ fontSize: 15 }} />
                        </a>
                        <span className="contact-icon" title={emp.phone}>
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
                            onClick={() => setEmployees(employees.filter(e => e.id !== emp.id))}
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
          {filtered.length === 0 && (
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
              ].map(field => (
                <div key={field.key} className="form-group">
                  <label className="form-label">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={newEmp[field.key]}
                    onChange={e => setNewEmp({ ...newEmp, [field.key]: e.target.value })}
                    className="form-input"
                  />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Отдел</label>
                <select
                  value={newEmp.department}
                  onChange={e => setNewEmp({ ...newEmp, department: e.target.value })}
                  className="form-select"
                >
                  {departments.map(d => <option key={d.id}>{d.name}</option>)}
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
}