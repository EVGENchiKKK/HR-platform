import { ForumOutlined, PushPin, RemoveRedEye, SmsOutlined } from "@mui/icons-material";
import { forumPosts } from "../data/mockData";
import "./../style/workspace-pages.css";

export const Forum = () => {
  return (
    <div className="workspace-page">
      <section className="workspace-hero">
        <div>
          <span className="workspace-eyebrow">Внутреннее сообщество</span>
          <h2 className="workspace-title">Форум компании</h2>
          <p className="workspace-description">
            Дискуссии по рабочим процессам, инициативам и обмену опытом между отделами.
          </p>
        </div>
        <div className="workspace-metrics">
          <div className="workspace-metric">
            <span className="workspace-metric-value">{forumPosts.length}</span>
            <span className="workspace-metric-label">Тем</span>
          </div>
          <div className="workspace-metric">
            <span className="workspace-metric-value">{forumPosts.filter((post) => post.pinned).length}</span>
            <span className="workspace-metric-label">Закреплено</span>
          </div>
          <div className="workspace-metric">
            <span className="workspace-metric-value">{forumPosts.reduce((sum, post) => sum + post.replies, 0)}</span>
            <span className="workspace-metric-label">Ответов</span>
          </div>
        </div>
      </section>

      <section className="workspace-panel workspace-list-panel">
        {forumPosts.map((post) => (
          <article key={post.id} className="workspace-list-item">
            <div className="workspace-list-icon">
              {post.pinned ? <PushPin sx={{ fontSize: 22 }} /> : <ForumOutlined sx={{ fontSize: 22 }} />}
            </div>
            <div className="workspace-list-body">
              <div className="workspace-card-top">
                <span className={`workspace-pill ${post.pinned ? "workspace-pill-active" : "workspace-pill-neutral"}`}>
                  {post.pinned ? "Закреплено" : post.category}
                </span>
              </div>
              <h3 className="workspace-card-title">{post.title}</h3>
              <p className="workspace-card-subtitle">{post.author} • {post.date}</p>
              <div className="workspace-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="workspace-tag">#{tag}</span>
                ))}
              </div>
              <div className="workspace-meta-list">
                <div className="workspace-meta-item">
                  <SmsOutlined sx={{ fontSize: 16 }} />
                  <span>{post.replies} ответов</span>
                </div>
                <div className="workspace-meta-item">
                  <RemoveRedEye sx={{ fontSize: 16 }} />
                  <span>{post.views} просмотров</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};
