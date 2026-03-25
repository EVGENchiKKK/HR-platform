import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Campaign, ErrorOutline, MarkEmailRead, Schedule, Send } from "@mui/icons-material";
import workspaceService from "../api/workspaceService";
import "./../style/workspace-pages.css";

const statusLabels = {
  open: "Открыто",
  in_review: "На рассмотрении",
  resolved: "Решено",
  closed: "Закрыто",
};

const priorityLabels = {
  high: "Высокий",
  medium: "Средний",
  low: "Низкий",
};

const typeLabels = {
  complaint: "Жалоба",
  suggestion: "Предложение",
  question: "Вопрос",
};

const initialAppealForm = {
  recipientId: "",
  type: "question",
  category: "",
  priority: "medium",
  content: "",
  isAnonymous: false,
  isConfidential: false,
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

export const Appeals = () => {
  const { user, workspaceData, workspaceLoading, workspaceError, refreshWorkspaceData } = useOutletContext();
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("open");
  const [messageText, setMessageText] = useState("");
  const [appealForm, setAppealForm] = useState(initialAppealForm);
  const [isSending, setIsSending] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isCreatingAppeal, setIsCreatingAppeal] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [messageSuccess, setMessageSuccess] = useState("");
  const [statusError, setStatusError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const chatThreadRef = useRef(null);

  const appeals = workspaceData.appeals || [];
  const employees = workspaceData.employees || [];
  const currentUserId = Number(user?.id || user?.User_ID || 0);
  const currentUserRole = `${user?.role || user?.R_name || ""}`.toLowerCase();
  const canManageAppeals = ["hr", "admin"].includes(currentUserRole);

  const recipients = useMemo(
    () =>
      employees.filter((employee) => {
        const role = `${employee.role || employee.position || ""}`.toLowerCase();
        return ["hr", "admin"].includes(role) && employee.status === "active";
      }),
    [employees]
  );

  const filteredAppeals = useMemo(
    () =>
      appeals.filter((item) => {
        const statusMatch = statusFilter === "all" || item.status === statusFilter;
        const priorityMatch = priorityFilter === "all" || item.priority === priorityFilter;
        return statusMatch && priorityMatch;
      }),
    [appeals, priorityFilter, statusFilter]
  );

  const selectedAppeal = filteredAppeals.find((item) => item.id === selectedId) ?? filteredAppeals[0] ?? null;
  const canReplyToAppeal = Boolean(selectedAppeal && (canManageAppeals || Number(selectedAppeal.authorId) === currentUserId));

  useEffect(() => {
    if (!selectedAppeal) {
      setSelectedId(null);
      return;
    }

    if (selectedId === null || !filteredAppeals.some((item) => item.id === selectedId)) {
      setSelectedId(selectedAppeal.id);
    }
  }, [filteredAppeals, selectedAppeal, selectedId]);

  useEffect(() => {
    if (!selectedAppeal) {
      return;
    }

    setEditedStatus(selectedAppeal.status);
    setMessageText("");
    setMessageError("");
    setMessageSuccess("");
    setStatusError("");
    setStatusSuccess("");
  }, [selectedAppeal]);

  useEffect(() => {
    if (!chatThreadRef.current) {
      return;
    }

    chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight;
  }, [selectedAppeal]);

  const handleAppealFormChange = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setAppealForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreateAppeal = async () => {
    if (!appealForm.recipientId || !appealForm.category.trim() || !appealForm.content.trim()) {
      setCreateError("Заполните получателя, тему и текст обращения.");
      setCreateSuccess("");
      return;
    }

    setIsCreatingAppeal(true);
    setCreateError("");
    setCreateSuccess("");

    try {
      const result = await workspaceService.createAppeal({
        recipientId: Number(appealForm.recipientId),
        type: appealForm.type,
        category: appealForm.category,
        priority: appealForm.priority,
        content: appealForm.content,
        isAnonymous: appealForm.isAnonymous,
        isConfidential: appealForm.isConfidential,
      });

      if (!result.success) {
        setCreateError(result.error || "Не удалось создать обращение.");
        return;
      }

      setAppealForm(initialAppealForm);
      setCreateSuccess("Обращение зарегистрировано.");
      await refreshWorkspaceData();

      if (result.data?.id) {
        setSelectedId(Number(result.data.id));
      }
    } catch (error) {
      setCreateError(error.response?.data?.error || "Не удалось создать обращение.");
    } finally {
      setIsCreatingAppeal(false);
    }
  };

  const handleSaveStatus = async () => {
    if (!selectedAppeal || !canManageAppeals) {
      return;
    }

    setIsSavingStatus(true);
    setStatusError("");
    setStatusSuccess("");

    try {
      const result = await workspaceService.updateAppeal(selectedAppeal.id, {
        status: editedStatus,
      });

      if (!result.success) {
        setStatusError(result.error || "Не удалось обновить статус обращения.");
        return;
      }

      setStatusSuccess("Статус обращения обновлён.");
      await refreshWorkspaceData();
    } catch (error) {
      setStatusError(error.response?.data?.error || "Не удалось обновить статус обращения.");
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedAppeal || !canReplyToAppeal || !messageText.trim()) {
      return;
    }

    setIsSending(true);
    setMessageError("");
    setMessageSuccess("");

    try {
      const result = await workspaceService.sendAppealMessage(selectedAppeal.id, {
        content: messageText,
      });

      if (!result.success) {
        setMessageError(result.error || "Не удалось отправить сообщение.");
        return;
      }

      setMessageText("");
      setMessageSuccess("Сообщение отправлено.");
      await refreshWorkspaceData();
    } catch (error) {
      setMessageError(error.response?.data?.error || "Не удалось отправить сообщение.");
    } finally {
      setIsSending(false);
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
          <span className="workspace-eyebrow">Служба поддержки</span>
          <h2 className="workspace-title">Обращения сотрудников</h2>
          <p className="workspace-description">
            Создавайте обращения сразу с получателем, приоритетом, темой и полным текстом. Внутри каждого обращения
            сохраняется переписка в формате чата.
          </p>
        </div>
        <div className="workspace-metrics">
          <div className="workspace-metric">
            <span className="workspace-metric-value">{appeals.filter((item) => item.status === "open").length}</span>
            <span className="workspace-metric-label">Новые</span>
          </div>
          <div className="workspace-metric">
            <span className="workspace-metric-value">{appeals.filter((item) => item.status === "in_review").length}</span>
            <span className="workspace-metric-label">В работе</span>
          </div>
          <div className="workspace-metric">
            <span className="workspace-metric-value">{appeals.filter((item) => item.priority === "high").length}</span>
            <span className="workspace-metric-label">Высокий приоритет</span>
          </div>
        </div>
      </section>

      <section className="appeal-create-panel">
        <div className="appeal-create-header">
          <div>
            <h3 className="appeals-list-title">Новое обращение</h3>
            <p className="appeal-create-description">Все поля сохраняются в таблицу `appeal` в базе данных.</p>
          </div>
        </div>

        <div className="appeal-form-grid">
          <label className="appeal-form-field">
            <span>Получатель</span>
            <select
              value={appealForm.recipientId}
              onChange={handleAppealFormChange("recipientId")}
              className="workspace-select"
              disabled={recipients.length === 0}
            >
              <option value="">Выберите HR или администратора</option>
              {recipients.map((recipient) => (
                <option key={recipient.id} value={recipient.id}>
                  {recipient.name} · {recipient.role}
                </option>
              ))}
            </select>
          </label>

          <label className="appeal-form-field">
            <span>Тип обращения</span>
            <select value={appealForm.type} onChange={handleAppealFormChange("type")} className="workspace-select">
              <option value="question">Вопрос</option>
              <option value="suggestion">Предложение</option>
              <option value="complaint">Жалоба</option>
            </select>
          </label>

          <label className="appeal-form-field">
            <span>Приоритет</span>
            <select value={appealForm.priority} onChange={handleAppealFormChange("priority")} className="workspace-select">
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
          </label>

          <label className="appeal-form-field appeal-form-field-wide">
            <span>Тема обращения</span>
            <input
              type="text"
              value={appealForm.category}
              onChange={handleAppealFormChange("category")}
              className="appeal-chat-input"
              placeholder="Например: Переработки, отпуск, доступ к системе"
            />
          </label>

          <label className="appeal-form-field appeal-form-field-wide">
            <span>Текст обращения</span>
            <textarea
              value={appealForm.content}
              onChange={handleAppealFormChange("content")}
              className="appeal-chat-input appeal-chat-input-multiline"
              placeholder="Опишите ситуацию подробно"
            />
          </label>
        </div>

        <div className="appeal-form-options">
          <label className="appeal-option">
            <input type="checkbox" checked={appealForm.isAnonymous} onChange={handleAppealFormChange("isAnonymous")} />
            <span>Анонимное обращение</span>
          </label>
          <label className="appeal-option">
            <input type="checkbox" checked={appealForm.isConfidential} onChange={handleAppealFormChange("isConfidential")} />
            <span>Конфиденциальное обращение</span>
          </label>
        </div>

        <div className="appeal-form-actions">
          <button type="button" onClick={handleCreateAppeal} className="appeal-primary-action" disabled={isCreatingAppeal || recipients.length === 0}>
            {isCreatingAppeal ? "Сохранение..." : "Отправить обращение"}
          </button>
          {createError ? <div className="workspace-empty">{createError}</div> : null}
          {createSuccess ? <div className="workspace-success">{createSuccess}</div> : null}
        </div>
      </section>

      <section className="workspace-toolbar">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="workspace-select">
          <option value="all">Все статусы</option>
          <option value="open">Открыто</option>
          <option value="in_review">На рассмотрении</option>
          <option value="resolved">Решено</option>
          <option value="closed">Закрыто</option>
        </select>
        <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="workspace-select">
          <option value="all">Все приоритеты</option>
          <option value="high">Высокий</option>
          <option value="medium">Средний</option>
          <option value="low">Низкий</option>
        </select>
      </section>

      <section className="appeals-layout">
        <div className="appeals-list-panel">
          <div className="appeals-list-header">
            <h3 className="appeals-list-title">Обращения ({filteredAppeals.length})</h3>
          </div>

          <div className="appeals-list">
            {filteredAppeals.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`appeal-list-item ${selectedAppeal?.id === item.id ? "appeal-list-item-active" : ""}`}
              >
                <div className="appeal-list-item-top">
                  <span className="appeal-list-subject">{item.subject}</span>
                  <span className={`workspace-pill workspace-pill-${item.priority}`}>{priorityLabels[item.priority]}</span>
                </div>
                <div className="workspace-card-top">
                  <span className={`workspace-pill workspace-pill-${item.status}`}>{statusLabels[item.status]}</span>
                  <span className="workspace-pill workspace-pill-neutral">{typeLabels[item.type] || item.type}</span>
                </div>
                <div className="appeal-list-meta">
                  <span>{item.from}</span>
                  <span>{formatDateTime(item.lastMessageAt || item.date)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="appeal-detail-panel">
          {selectedAppeal ? (
            <>
              <div className="appeal-detail-header">
                <div>
                  <h3 className="appeal-detail-title">{selectedAppeal.subject}</h3>
                  <div className="workspace-card-top">
                    <span className={`workspace-pill workspace-pill-${selectedAppeal.status}`}>{statusLabels[selectedAppeal.status]}</span>
                    <span className={`workspace-pill workspace-pill-${selectedAppeal.priority}`}>{priorityLabels[selectedAppeal.priority]}</span>
                    <span className="workspace-pill workspace-pill-neutral">{typeLabels[selectedAppeal.type] || selectedAppeal.type}</span>
                  </div>
                  <p className="appeal-detail-meta">
                    От: {selectedAppeal.from} · {selectedAppeal.department} · {formatDateTime(selectedAppeal.date)}
                  </p>
                </div>

                {canManageAppeals ? (
                  <div className="appeal-status-panel">
                    <select
                      value={editedStatus}
                      onChange={(event) => setEditedStatus(event.target.value)}
                      className="workspace-select appeal-status-select"
                    >
                      <option value="open">Открыто</option>
                      <option value="in_review">На рассмотрении</option>
                      <option value="resolved">Решено</option>
                      <option value="closed">Закрыто</option>
                    </select>
                    <button type="button" onClick={handleSaveStatus} className="appeal-secondary-action" disabled={isSavingStatus}>
                      {isSavingStatus ? "Сохранение..." : "Сохранить статус"}
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="appeal-detail-body">
                <div className="appeal-detail-facts">
                  <div className="workspace-meta-item">
                    {selectedAppeal.status === "resolved" ? (
                      <MarkEmailRead sx={{ fontSize: 18 }} />
                    ) : selectedAppeal.priority === "high" ? (
                      <ErrorOutline sx={{ fontSize: 18 }} />
                    ) : (
                      <Campaign sx={{ fontSize: 18 }} />
                    )}
                    <span>Тема: {selectedAppeal.category}</span>
                  </div>
                  <div className="workspace-meta-item">
                    <Schedule sx={{ fontSize: 18 }} />
                    <span>Получатель: {selectedAppeal.recipientName || "Не назначен"}</span>
                  </div>
                  <div className="workspace-meta-item">
                    <Schedule sx={{ fontSize: 18 }} />
                    <span>Зарегистрировано: {formatDateTime(selectedAppeal.date)}</span>
                  </div>
                  <div className="workspace-card-top">
                    {selectedAppeal.isAnonymous ? <span className="workspace-pill workspace-pill-neutral">Анонимно</span> : null}
                    {selectedAppeal.isConfidential ? <span className="workspace-pill workspace-pill-neutral">Конфиденциально</span> : null}
                  </div>
                </div>

                {statusError ? <div className="workspace-empty">{statusError}</div> : null}
                {statusSuccess ? <div className="workspace-success">{statusSuccess}</div> : null}

                <div className="appeal-chat-section">
                  <div className="appeal-chat-thread" ref={chatThreadRef}>
                    {(selectedAppeal.messages || []).map((message) => {
                      const isOutgoing = Number(message.authorId) === currentUserId;

                      return (
                        <div
                          key={message.id}
                          className={`appeal-chat-message ${
                            isOutgoing ? "appeal-chat-message-outgoing" : "appeal-chat-message-incoming"
                          }`}
                        >
                          <div className="appeal-chat-bubble">
                            <div className="appeal-chat-message-meta">
                              <span className="appeal-chat-author">{message.authorName}</span>
                              <span className="appeal-chat-time">{formatDateTime(message.createdAt)}</span>
                            </div>
                            <p>{message.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {canReplyToAppeal ? (
                    <div className="appeal-chat-composer-wrap">
                      <textarea
                        value={messageText}
                        onChange={(event) => setMessageText(event.target.value)}
                        placeholder="Введите сообщение по обращению"
                        className="appeal-chat-input appeal-chat-input-multiline"
                        disabled={selectedAppeal.status === "closed"}
                      />
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        className="appeal-chat-send"
                        disabled={isSending || !messageText.trim() || selectedAppeal.status === "closed"}
                        aria-label="Отправить сообщение"
                      >
                        <Send sx={{ fontSize: 20 }} />
                      </button>
                    </div>
                  ) : (
                    <div className="appeal-chat-readonly">Только автор обращения и HR могут писать в этот чат.</div>
                  )}
                </div>

                {messageError ? <div className="workspace-empty">{messageError}</div> : null}
                {messageSuccess ? <div className="workspace-success">{messageSuccess}</div> : null}
              </div>
            </>
          ) : (
            <div className="workspace-empty">
              <span>Нет обращений по выбранным фильтрам.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Appeals;
