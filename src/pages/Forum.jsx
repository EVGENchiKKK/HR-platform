import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ForumOutlined, PushPin, RemoveRedEye, Send, SmsOutlined } from "@mui/icons-material";
import workspaceService from "../api/workspaceService";
import "./../style/workspace-pages.css";

const initialTopicForm = {
  title: "",
  category: "Обсуждение",
  content: "",
};

const formatDateTime = (value) => {
  if (!value) {
    return "Дата не указана";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const Forum = () => {
  const { user, workspaceData, workspaceLoading, workspaceError, refreshWorkspaceData } = useOutletContext();
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [topicForm, setTopicForm] = useState(initialTopicForm);
  const [replyText, setReplyText] = useState("");
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [topicError, setTopicError] = useState("");
  const [topicSuccess, setTopicSuccess] = useState("");
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState("");
  const threadRef = useRef(null);

  const forumPosts = workspaceData.forumPosts || [];
  const currentUserId = Number(user?.id || user?.User_ID || 0);

  const selectedTopic = forumPosts.find((post) => post.id === selectedTopicId) ?? forumPosts[0] ?? null;

  const totalReplies = useMemo(
    () => forumPosts.reduce((sum, post) => sum + (post.messages?.length || 0), 0),
    [forumPosts]
  );

  useEffect(() => {
    if (!selectedTopic) {
      setSelectedTopicId(null);
      return;
    }

    if (!forumPosts.some((post) => post.id === selectedTopicId)) {
      setSelectedTopicId(selectedTopic.id);
    }
  }, [forumPosts, selectedTopic, selectedTopicId]);

  useEffect(() => {
    if (!threadRef.current) {
      return;
    }

    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [selectedTopic]);

  const handleTopicFormChange = (field) => (event) => {
    setTopicForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleCreateTopic = async () => {
    if (!topicForm.title.trim() || !topicForm.content.trim()) {
      setTopicError("Заполните заголовок и первое сообщение темы.");
      setTopicSuccess("");
      return;
    }

    setIsCreatingTopic(true);
    setTopicError("");
    setTopicSuccess("");

    try {
      const result = await workspaceService.createForumTopic(topicForm);

      if (!result.success) {
        setTopicError(result.error || "Не удалось создать тему.");
        return;
      }

      setTopicForm(initialTopicForm);
      setTopicSuccess("Тема форума создана.");
      await refreshWorkspaceData();

      if (result.data?.id) {
        setSelectedTopicId(Number(result.data.id));
      }
    } catch (error) {
      setTopicError(error.response?.data?.error || "Не удалось создать тему.");
    } finally {
      setIsCreatingTopic(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTopic || !replyText.trim() || selectedTopic.isLocked) {
      return;
    }

    setIsSendingReply(true);
    setReplyError("");
    setReplySuccess("");

    try {
      const result = await workspaceService.createForumPost(selectedTopic.id, { content: replyText });

      if (!result.success) {
        setReplyError(result.error || "Не удалось отправить сообщение.");
        return;
      }

      setReplyText("");
      setReplySuccess("Сообщение отправлено.");
      await refreshWorkspaceData();
    } catch (error) {
      setReplyError(error.response?.data?.error || "Не удалось отправить сообщение.");
    } finally {
      setIsSendingReply(false);
    }
  };

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
          <span className="workspace-eyebrow">Внутреннее сообщество</span>
          <h2 className="workspace-title">Общий форум компании</h2>
          <p className="workspace-description">
            Все сотрудники видят общие темы и могут переписываться внутри них. Новые темы и ответы сохраняются
            в базе данных через таблицы `forum_them` и `forum_posts`.
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
            <span className="workspace-metric-value">{totalReplies}</span>
            <span className="workspace-metric-label">Сообщений</span>
          </div>
        </div>
      </section>

      <section className="appeal-create-panel">
        <div className="appeal-create-header">
          <div>
            <h3 className="appeals-list-title">Новая тема</h3>
            <p className="appeal-create-description">Создайте общую тему для обсуждения, вопроса или объявления.</p>
          </div>
        </div>

        <div className="appeal-form-grid">
          <label className="appeal-form-field appeal-form-field-wide">
            <span>Заголовок</span>
            <input
              type="text"
              value={topicForm.title}
              onChange={handleTopicFormChange("title")}
              className="appeal-chat-input"
              placeholder="Например: Вопрос по отпуску или идея для процесса"
            />
          </label>

          <label className="appeal-form-field">
            <span>Категория</span>
            <select value={topicForm.category} onChange={handleTopicFormChange("category")} className="workspace-select">
              <option value="Обсуждение">Обсуждение</option>
              <option value="IT-поддержка">IT-поддержка</option>
              <option value="Организационные вопросы">Организационные вопросы</option>
              <option value="Корпоративная жизнь">Корпоративная жизнь</option>
              <option value="Объявления">Объявления</option>
            </select>
          </label>

          <label className="appeal-form-field appeal-form-field-wide">
            <span>Первое сообщение</span>
            <textarea
              value={topicForm.content}
              onChange={handleTopicFormChange("content")}
              className="appeal-chat-input appeal-chat-input-multiline"
              placeholder="Опишите тему обсуждения"
            />
          </label>
        </div>

        <div className="appeal-form-actions">
          <button type="button" onClick={handleCreateTopic} className="appeal-primary-action" disabled={isCreatingTopic}>
            {isCreatingTopic ? "Сохранение..." : "Создать тему"}
          </button>
          {topicError ? <div className="workspace-empty">{topicError}</div> : null}
          {topicSuccess ? <div className="workspace-success">{topicSuccess}</div> : null}
        </div>
      </section>

      <section className="appeals-layout">
        <div className="appeals-list-panel">
          <div className="appeals-list-header">
            <h3 className="appeals-list-title">Темы форума ({forumPosts.length})</h3>
          </div>

          <div className="appeals-list">
            {forumPosts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedTopicId(post.id)}
                className={`appeal-list-item ${selectedTopic?.id === post.id ? "appeal-list-item-active" : ""}`}
              >
                <div className="appeal-list-item-top">
                  <span className="appeal-list-subject">{post.title}</span>
                  <span className={`workspace-pill ${post.pinned ? "workspace-pill-active" : "workspace-pill-neutral"}`}>
                    {post.pinned ? "Закреплено" : post.category}
                  </span>
                </div>
                <div className="appeal-list-meta">
                  <span>{post.author}</span>
                  <span>{formatDateTime(post.messages?.at(-1)?.createdAt || post.date)}</span>
                </div>
                <div className="workspace-meta-list forum-topic-meta">
                  <div className="workspace-meta-item">
                    <SmsOutlined sx={{ fontSize: 16 }} />
                    <span>{post.messages?.length || 0}</span>
                  </div>
                  <div className="workspace-meta-item">
                    <RemoveRedEye sx={{ fontSize: 16 }} />
                    <span>{post.views}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="appeal-detail-panel">
          {selectedTopic ? (
            <>
              <div className="appeal-detail-header">
                <div>
                  <h3 className="appeal-detail-title">{selectedTopic.title}</h3>
                  <div className="workspace-card-top">
                    <span className={`workspace-pill ${selectedTopic.pinned ? "workspace-pill-active" : "workspace-pill-neutral"}`}>
                      {selectedTopic.pinned ? "Закреплено" : selectedTopic.category}
                    </span>
                    {selectedTopic.isLocked ? <span className="workspace-pill workspace-pill-closed">Тема закрыта</span> : null}
                  </div>
                  <p className="appeal-detail-meta">
                    Автор: {selectedTopic.author} · {selectedTopic.department || "Без отдела"} · {formatDateTime(selectedTopic.date)}
                  </p>
                </div>
              </div>

              <div className="appeal-detail-body">
                <div className="appeal-chat-section forum-chat-section">
                  <div className="appeal-chat-thread" ref={threadRef}>
                    {(selectedTopic.messages || []).map((message) => {
                      const isOutgoing = Number(message.authorId) === currentUserId;

                      return (
                        <div
                          key={message.id}
                          className={`appeal-chat-message ${isOutgoing ? "appeal-chat-message-outgoing" : "appeal-chat-message-incoming"}`}
                        >
                          <div className="appeal-chat-bubble">
                            <div className="appeal-chat-message-meta">
                              <span className="appeal-chat-author">{message.authorName}</span>
                              <span className="appeal-chat-time">{formatDateTime(message.createdAt)}</span>
                            </div>
                            <p>{message.content}</p>
                            <div className="workspace-card-top forum-message-meta">
                              <span className="workspace-pill workspace-pill-neutral">{message.authorRole}</span>
                              {message.isSolution ? <span className="workspace-pill workspace-pill-active">Решение</span> : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedTopic.isLocked ? (
                    <div className="appeal-chat-readonly">Эта тема закрыта для новых сообщений.</div>
                  ) : (
                    <div className="appeal-chat-composer-wrap">
                      <textarea
                        value={replyText}
                        onChange={(event) => setReplyText(event.target.value)}
                        placeholder="Напишите ответ в тему"
                        className="appeal-chat-input appeal-chat-input-multiline"
                      />
                      <button
                        type="button"
                        onClick={handleSendReply}
                        className="appeal-chat-send"
                        disabled={isSendingReply || !replyText.trim()}
                        aria-label="Отправить сообщение"
                      >
                        <Send sx={{ fontSize: 20 }} />
                      </button>
                    </div>
                  )}
                </div>

                {replyError ? <div className="workspace-empty">{replyError}</div> : null}
                {replySuccess ? <div className="workspace-success">{replySuccess}</div> : null}
              </div>
            </>
          ) : (
            <div className="workspace-empty">
              <span>На форуме пока нет тем.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Forum;
