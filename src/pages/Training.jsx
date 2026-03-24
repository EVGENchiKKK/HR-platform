import { useOutletContext } from "react-router-dom";
import { AutoStories, CheckCircleOutline, Groups, School } from "@mui/icons-material";
import "./../style/workspace-pages.css";

export const Training = () => {
  const { workspaceData, workspaceLoading, workspaceError } = useOutletContext();
  const courses = workspaceData.courses || [];

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
          <span className="workspace-eyebrow">Развитие команды</span>
          <h2 className="workspace-title">Обучение и курсы</h2>
          <p className="workspace-description">Каталог программ для онбординга, безопасности и развития управленческих навыков.</p>
        </div>
        <div className="workspace-metrics">
          <div className="workspace-metric">
            <span className="workspace-metric-value">{courses.length}</span>
            <span className="workspace-metric-label">Курсов</span>
          </div>
          <div className="workspace-metric">
            <span className="workspace-metric-value">{courses.filter((course) => course.status === "active").length}</span>
            <span className="workspace-metric-label">Активны</span>
          </div>
          <div className="workspace-metric">
            <span className="workspace-metric-value">{courses.reduce((sum, course) => sum + course.completed, 0)}</span>
            <span className="workspace-metric-label">Завершений</span>
          </div>
        </div>
      </section>

      <section className="workspace-panel">
        <div className="workspace-card-grid">
          {courses.map((course) => {
            const progress = course.enrolled ? Math.round((course.completed / course.enrolled) * 100) : 0;

            return (
              <article key={course.id} className="workspace-card">
                <div className="workspace-card-top">
                  <span className={`workspace-pill workspace-pill-${course.status}`}>{course.status === "draft" ? "Черновик" : "Активен"}</span>
                  <span className="workspace-pill workspace-pill-neutral">{course.category}</span>
                </div>
                <h3 className="workspace-card-title">{course.title}</h3>
                <p className="workspace-card-copy">{course.description}</p>
                <div className="workspace-meta-list">
                  <div className="workspace-meta-item">
                    <School sx={{ fontSize: 16 }} />
                    <span>Преподаватель: {course.instructor}</span>
                  </div>
                  <div className="workspace-meta-item">
                    <AutoStories sx={{ fontSize: 16 }} />
                    <span>{course.modules} модулей · {course.duration}</span>
                  </div>
                  <div className="workspace-meta-item">
                    <Groups sx={{ fontSize: 16 }} />
                    <span>{course.enrolled} записаны</span>
                  </div>
                </div>
                <div className="workspace-progress">
                  <div className="workspace-progress-track">
                    <div className="workspace-progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <span className="workspace-progress-label">{progress}%</span>
                </div>
                <div className="workspace-footer-note">
                  <CheckCircleOutline sx={{ fontSize: 16 }} />
                  <span>{course.completed} сотрудников уже завершили курс</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
