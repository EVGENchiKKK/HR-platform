import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AssignmentTurnedIn, Groups, Poll, Quiz } from "@mui/icons-material";
import "./../style/workspace-pages.css";

const typeLabels = {
  survey: "Опрос",
  test: "Тест",
};

const statusLabels = {
  active: "Активен",
  completed: "Завершен",
  draft: "Черновик",
};

export const Surveys = () => {
  const { workspaceData, workspaceLoading, workspaceError } = useOutletContext();
  const [typeFilter, setTypeFilter] = useState("all");

  const surveys = workspaceData.surveys || [];
  const visibleSurveys = surveys.filter((item) => typeFilter === "all" || item.type === typeFilter);
  const completionRate = useMemo(() => {
    const totals = surveys.reduce(
      (acc, item) => {
        acc.responses += item.responses;
        acc.total += item.total;
        return acc;
      },
      { responses: 0, total: 0 },
    );

    return totals.total ? Math.round((totals.responses / totals.total) * 100) : 0;
  }, [surveys]);

  if (workspaceLoading) {
    return <div className="workspace-page">Загрузка данных...</div>;
  }

  if (workspaceError) {
    return <div className="workspace-page">{workspaceError}</div>;
  }

  return (
    <div className="workspace-page">
      <section className="workspace-hero">
        <div>
          <span className="workspace-eyebrow">Обратная связь</span>
          <h2 className="workspace-title">Опросы и тестирование</h2>
          <p className="workspace-description">Контроль прохождения опросов, аттестаций и внутренних проверок знаний.</p>
        </div>
        <div className="workspace-metrics">
          <div className="workspace-metric">
            <span className="workspace-metric-value">{surveys.length}</span>
            <span className="workspace-metric-label">Активности</span>
          </div>
          <div className="workspace-metric">
            <span className="workspace-metric-value">{completionRate}%</span>
            <span className="workspace-metric-label">Средний отклик</span>
          </div>
          <div className="workspace-metric">
            <span className="workspace-metric-value">{surveys.filter((item) => item.status === "active").length}</span>
            <span className="workspace-metric-label">Идут сейчас</span>
          </div>
        </div>
      </section>

      <section className="workspace-panel">
        <div className="workspace-toolbar">
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="workspace-select">
            <option value="all">Все форматы</option>
            <option value="survey">Опросы</option>
            <option value="test">Тесты</option>
          </select>
        </div>

        <div className="workspace-card-grid">
          {visibleSurveys.map((item) => {
            const progress = item.total ? Math.round((item.responses / item.total) * 100) : 0;

            return (
              <article key={item.id} className="workspace-card">
                <div className="workspace-card-top">
                  <span className={`workspace-pill workspace-pill-${item.status}`}>{statusLabels[item.status] || item.status}</span>
                  <span className="workspace-pill workspace-pill-neutral">{typeLabels[item.type] || item.type}</span>
                </div>
                <h3 className="workspace-card-title">{item.title}</h3>
                <p className="workspace-card-copy">{item.description}</p>
                <div className="workspace-meta-list">
                  <div className="workspace-meta-item">
                    {item.type === "survey" ? <Poll sx={{ fontSize: 16 }} /> : <Quiz sx={{ fontSize: 16 }} />}
                    <span>Автор: {item.createdBy}</span>
                  </div>
                  <div className="workspace-meta-item">
                    <Groups sx={{ fontSize: 16 }} />
                    <span>{item.responses} из {item.total} ответили</span>
                  </div>
                  <div className="workspace-meta-item">
                    <AssignmentTurnedIn sx={{ fontSize: 16 }} />
                    <span>Дедлайн: {item.deadline || "Не указан"}</span>
                  </div>
                </div>
                <div className="workspace-progress">
                  <div className="workspace-progress-track">
                    <div className="workspace-progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <span className="workspace-progress-label">{progress}%</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
