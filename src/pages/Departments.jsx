import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Add, People, TrendingUp, ChevronRight, Close } from "@mui/icons-material";
import { departments as initialDepts, employees } from "../data/mockData";
import "./../style/departments.css";

export const Departments = () => {
  const { user } = useOutletContext();
  const [depts, setDepts] = useState(initialDepts);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", head: "" });

  const isHR = user?.role === "hr" || user?.R_name === "hr";
  const isManager = user?.role === "manager" || user?.R_name === "manager";
  const isAdmin = user?.role === "admin" || user?.R_name === "admin";
  const isEmployee = user?.role === "employee" || user?.R_name === "employee";

  const userDepartment = user?.department || user?.Department_ID || null;
  const filteredDepts = isEmployee && userDepartment
    ? depts.filter(d => d.name === userDepartment)
    : depts;

  const selectedDept = filteredDepts.find(d => d.id === selected);
  const deptEmployees = employees.filter(e => e.department === selectedDept?.name);

  function handleAdd() {
    if (!newDept.name) return;
    setDepts([...depts, {
      id: depts.length + 1,
      name: newDept.name,
      head: newDept.head,
      employeeCount: 0,
      kpi: 0,
      color: `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`,
    }]);
    setShowAdd(false);
    setNewDept({ name: "", head: "" });
  }

  const canAddDepartment = isHR || isAdmin;

  return (
    <div className="departments-page">
      <div className="departments-header">
        <span className="departments-summary">
          {filteredDepts.length} отделов · {employees.length} сотрудников
        </span>
        {canAddDepartment && (
          <button
            onClick={() => setShowAdd(true)}
            className="add-dept-button"
          >
            <Add sx={{ fontSize: 16 }} /> Добавить отдел
          </button>
        )}
      </div>

      <div className="departments-content">
        <div className="dept-cards-grid">
          {filteredDepts.map(dept => (
            <div
              key={dept.id}
              onClick={() => setSelected(selected === dept.id ? null : dept.id)}
              className={`dept-card ${selected === dept.id ? "dept-card-selected" : ""}`}
            >
              <div className="dept-card-header">
                <div className="dept-card-info">
                  <div className="dept-card-icon" style={{ backgroundColor: dept.color + "20" }}>
                    <div className="dept-card-dot" style={{ backgroundColor: dept.color }}></div>
                  </div>
                  <div>
                    <h3 className="dept-card-title">{dept.name}</h3>
                    <p className="dept-card-head">Рук.: {dept.head}</p>
                  </div>
                </div>
                <ChevronRight sx={{ fontSize: 16 }} className={`dept-card-arrow ${selected === dept.id ? "dept-card-arrow-rotated" : ""}`} />
              </div>

              <div className="dept-card-stats">
                <div className="dept-card-stat">
                  <People sx={{ fontSize: 16 }} className="dept-card-stat-icon" />
                  <div className="dept-card-stat-value">{dept.employeeCount}</div>
                  <div className="dept-card-stat-label">сотрудников</div>
                </div>
                <div className="dept-card-stat">
                  <TrendingUp sx={{ fontSize: 16 }} className="dept-card-stat-icon" />
                  <div className={`dept-card-stat-kpi ${dept.kpi >= 85 ? "kpi-high" : dept.kpi >= 75 ? "kpi-medium" : "kpi-low"}`}>
                    {dept.kpi}%
                  </div>
                  <div className="dept-card-stat-label">KPI</div>
                </div>
              </div>

              <div className="dept-card-kpi-bar">
                <div className="dept-card-kpi-fill" style={{ width: `${dept.kpi}%`, backgroundColor: dept.color }}></div>
              </div>
            </div>
          ))}
        </div>

        <div className="dept-detail-panel">
          {selectedDept ? (
            <div>
              <div className="dept-detail-header">
                <div className="dept-detail-icon" style={{ backgroundColor: selectedDept.color + "20" }}>
                  <div className="dept-detail-dot" style={{ backgroundColor: selectedDept.color }}></div>
                </div>
                <div>
                  <h3 className="dept-detail-title">{selectedDept.name}</h3>
                  <p className="dept-detail-count">{deptEmployees.length} сотрудников</p>
                </div>
              </div>

              <div className="dept-detail-info">
                <div className="detail-row">
                  <span className="detail-label">Руководитель</span>
                  <span className="detail-value">{selectedDept.head}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">KPI отдела</span>
                  <span className={`detail-kpi ${selectedDept.kpi >= 85 ? "kpi-high" : "kpi-medium"}`}>
                    {selectedDept.kpi}%
                  </span>
                </div>
              </div>

              <h4 className="dept-employees-title">Сотрудники отдела</h4>
              {deptEmployees.length > 0 ? (
                <div className="dept-employees-list">
                  {deptEmployees.map(emp => (
                    <div key={emp.id} className="dept-employee-item">
                      <div className="dept-employee-avatar">{emp.avatar}</div>
                      <div className="dept-employee-info">
                        <p className="dept-employee-name">{emp.name}</p>
                        <p className="dept-employee-position">{emp.position}</p>
                      </div>
                      <span className={`dept-employee-kpi ${emp.kpi >= 90 ? "kpi-high" : emp.kpi >= 75 ? "kpi-medium" : "kpi-low"}`}>
                        {emp.kpi}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="dept-employees-empty">Нет сотрудников</p>
              )}
            </div>
          ) : (
            <div className="dept-detail-empty">
              <div className="dept-detail-empty-icon">
                <People sx={{ fontSize: 24 }} />
              </div>
              <p className="dept-detail-empty-text">Выберите отдел для просмотра подробной информации</p>
            </div>
          )}
        </div>
      </div>

      <div className="summary-table-container">
        <div className="summary-table-header">
          <h3 className="summary-table-title">Сводная таблица</h3>
        </div>
        <div className="summary-table-wrapper">
          <table className="summary-table">
            <thead>
              <tr className="summary-table-header-row">
                <th className="summary-table-header">Отдел</th>
                <th className="summary-table-header">Руководитель</th>
                <th className="summary-table-header">Сотрудников</th>
                <th className="summary-table-header">KPI</th>
                <th className="summary-table-header">Прогресс</th>
              </tr>
            </thead>
            <tbody className="summary-table-body">
              {filteredDepts.map(dept => (
                <tr key={dept.id} className="summary-table-row">
                  <td className="summary-table-cell">
                    <div className="summary-dept-name">
                      <div className="summary-dept-dot" style={{ backgroundColor: dept.color }}></div>
                      <span className="summary-dept-text">{dept.name}</span>
                    </div>
                  </td>
                  <td className="summary-table-cell">{dept.head}</td>
                  <td className="summary-table-cell">{dept.employeeCount}</td>
                  <td className="summary-table-cell">
                    <span className={`summary-kpi ${dept.kpi >= 85 ? "kpi-high" : dept.kpi >= 75 ? "kpi-medium" : "kpi-low"}`}>
                      {dept.kpi}%
                    </span>
                  </td>
                  <td className="summary-table-cell progress-cell">
                    <div className="summary-progress-bar">
                      <div className="summary-progress-fill" style={{ width: `${dept.kpi}%`, backgroundColor: dept.color }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-content modal-content-small">
            <div className="modal-header">
              <h3 className="modal-title">Новый отдел</h3>
              <button onClick={() => setShowAdd(false)} className="modal-close">
                <Close sx={{ fontSize: 20 }} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Название отдела *</label>
                <input
                  type="text"
                  placeholder="Например: Юридический"
                  value={newDept.name}
                  onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Руководитель</label>
                <input
                  type="text"
                  placeholder="ФИО руководителя"
                  value={newDept.head}
                  onChange={e => setNewDept({ ...newDept, head: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAdd(false)} className="modal-btn modal-btn-secondary">
                Отмена
              </button>
              <button onClick={handleAdd} className="modal-btn modal-btn-primary">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}