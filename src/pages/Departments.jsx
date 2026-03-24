import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { People, TrendingUp, ChevronRight } from "@mui/icons-material";
import "./../style/departments.css";

export const Departments = () => {
  const { user, workspaceData, workspaceLoading, workspaceError } = useOutletContext();
  const [selected, setSelected] = useState(null);

  const departments = workspaceData.departments || [];
  const employees = workspaceData.employees || [];

  const isEmployee = user?.role === "employee" || user?.R_name === "employee";
  const userDepartment = user?.department || null;

  const filteredDepts = useMemo(() => {
    if (!isEmployee || !userDepartment) {
      return departments;
    }
    return departments.filter((department) => department.name === userDepartment);
  }, [departments, isEmployee, userDepartment]);

  const selectedDept = filteredDepts.find((department) => department.id === selected) ?? filteredDepts[0] ?? null;
  const deptEmployees = employees.filter((employee) => employee.department === selectedDept?.name);
  const totalVisibleEmployees = filteredDepts.reduce((sum, department) => sum + department.employeeCount, 0);

  if (workspaceLoading) {
    return <div className="departments-page">Загрузка данных...</div>;
  }

  if (workspaceError) {
    return <div className="departments-page">{workspaceError}</div>;
  }

  return (
    <div className="departments-page">
      <div className="departments-header">
        <span className="departments-summary">
          {filteredDepts.length} отделов · {totalVisibleEmployees} сотрудников
        </span>
      </div>

      <div className="departments-content">
        <div className="dept-cards-grid">
          {filteredDepts.map((department) => (
            <div
              key={department.id}
              onClick={() => setSelected(selected === department.id ? null : department.id)}
              className={`dept-card ${selectedDept?.id === department.id ? "dept-card-selected" : ""}`}
            >
              <div className="dept-card-header">
                <div className="dept-card-info">
                  <div className="dept-card-icon" style={{ backgroundColor: `${department.color}20` }}>
                    <div className="dept-card-dot" style={{ backgroundColor: department.color }}></div>
                  </div>
                  <div>
                    <h3 className="dept-card-title">{department.name}</h3>
                    <p className="dept-card-head">Рук.: {department.head || "Не назначен"}</p>
                  </div>
                </div>
                <ChevronRight sx={{ fontSize: 16 }} className={`dept-card-arrow ${selectedDept?.id === department.id ? "dept-card-arrow-rotated" : ""}`} />
              </div>

              <div className="dept-card-stats">
                <div className="dept-card-stat">
                  <People sx={{ fontSize: 16 }} className="dept-card-stat-icon" />
                  <div className="dept-card-stat-value">{department.employeeCount}</div>
                  <div className="dept-card-stat-label">сотрудников</div>
                </div>
                <div className="dept-card-stat">
                  <TrendingUp sx={{ fontSize: 16 }} className="dept-card-stat-icon" />
                  <div className={`dept-card-stat-kpi ${department.kpi >= 85 ? "kpi-high" : department.kpi >= 75 ? "kpi-medium" : "kpi-low"}`}>
                    {department.kpi}%
                  </div>
                  <div className="dept-card-stat-label">KPI</div>
                </div>
              </div>

              <div className="dept-card-kpi-bar">
                <div className="dept-card-kpi-fill" style={{ width: `${department.kpi}%`, backgroundColor: department.color }}></div>
              </div>
            </div>
          ))}
        </div>

        <div className="dept-detail-panel">
          {selectedDept ? (
            <div>
              <div className="dept-detail-header">
                <div className="dept-detail-icon" style={{ backgroundColor: `${selectedDept.color}20` }}>
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
                  <span className="detail-value">{selectedDept.head || "Не назначен"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Активные задачи</span>
                  <span className="detail-value">{selectedDept.activeTasks}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Обращения</span>
                  <span className="detail-value">{selectedDept.appealCount}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">KPI отдела</span>
                  <span className={`detail-kpi ${selectedDept.kpi >= 85 ? "kpi-high" : selectedDept.kpi >= 75 ? "kpi-medium" : "kpi-low"}`}>
                    {selectedDept.kpi}%
                  </span>
                </div>
              </div>

              <h4 className="dept-employees-title">Сотрудники отдела</h4>
              {deptEmployees.length > 0 ? (
                <div className="dept-employees-list">
                  {deptEmployees.map((employee) => (
                    <div key={employee.id} className="dept-employee-item">
                      <div className="dept-employee-avatar">{employee.avatar}</div>
                      <div className="dept-employee-info">
                        <p className="dept-employee-name">{employee.name}</p>
                        <p className="dept-employee-position">{employee.position}</p>
                      </div>
                      <span className={`dept-employee-kpi ${employee.kpi >= 90 ? "kpi-high" : employee.kpi >= 75 ? "kpi-medium" : "kpi-low"}`}>
                        {employee.kpi}%
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
              {filteredDepts.map((department) => (
                <tr key={department.id} className="summary-table-row">
                  <td className="summary-table-cell">
                    <div className="summary-dept-name">
                      <div className="summary-dept-dot" style={{ backgroundColor: department.color }}></div>
                      <span className="summary-dept-text">{department.name}</span>
                    </div>
                  </td>
                  <td className="summary-table-cell">{department.head || "Не назначен"}</td>
                  <td className="summary-table-cell">{department.employeeCount}</td>
                  <td className="summary-table-cell">
                    <span className={`summary-kpi ${department.kpi >= 85 ? "kpi-high" : department.kpi >= 75 ? "kpi-medium" : "kpi-low"}`}>
                      {department.kpi}%
                    </span>
                  </td>
                  <td className="summary-table-cell progress-cell">
                    <div className="summary-progress-bar">
                      <div className="summary-progress-fill" style={{ width: `${department.kpi}%`, backgroundColor: department.color }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
