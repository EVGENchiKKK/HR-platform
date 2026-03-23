import { useMemo, useState } from "react";
import { Campaign, ErrorOutline, MarkEmailRead, Schedule, SendRounded } from "@mui/icons-material";
import { appeals } from "../data/mockData";
import "./../style/workspace-pages.css";

const statusLabels = {
  open: "Открыто",
  in_review: "На рассмотрении",
  resolved: "Решено",
};

const priorityLabels = {
  high: "Высокий",
  medium: "Средний",
  low: "Низкий",
};

const initialMessages = {
  1: [
    { id: "1-1", author: "Сергей Морозов", role: "employee", time: "09:14", text: "В цехе №2 сломана система вентиляции, температура превышает допустимую норму." },
    { id: "1-2", author: "HR Support", role: "support", time: "09:32", text: "Приняли обращение. Передали информацию руководителю производства и службе эксплуатации." },
  ],
  2: [
    { id: "2-1", author: "Ольга Захарова", role: "employee", time: "11:05", text: "Премия за февраль не была начислена вовремя." },
    { id: "2-2", author: "HR Support", role: "support", time: "11:41", text: "Проверяем начисления с бухгалтерией. Вернемся с ответом до конца дня." },
  ],
  3: [
    { id: "3-1", author: "Аноним", role: "employee", time: "14:25", text: "Описание ситуации конфликта с непосредственным руководителем." },
    { id: "3-2", author: "HR Support", role: "support", time: "16:10", text: "Провели внутреннюю встречу и закрыли кейс после согласования сторон." },
  ],
  4: [
    { id: "4-1", author: "Иван Белов", role: "employee", time: "10:12", text: "Предлагаю внедрить систему CI/CD для ускорения разработки." },
  ],
  5: [
    { id: "5-1", author: "Наталья Фёдорова", role: "employee", time: "13:08", text: "Нужен графический планшет для работы дизайнера." },
    { id: "5-2", author: "HR Support", role: "support", time: "13:40", text: "Запрос передан на согласование бюджета и закупки." },
  ],
};

export const Appeals = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(appeals[0]?.id ?? null);
  const [draftMessage, setDraftMessage] = useState("");
  const [appealStatuses, setAppealStatuses] = useState(
    () => appeals.reduce((acc, item) => {
      acc[item.id] = item.status;
      return acc;
    }, {}),
  );
  const [messagesByAppeal, setMessagesByAppeal] = useState(initialMessages);

  const mappedAppeals = useMemo(
    () => appeals.map((item) => ({ ...item, status: appealStatuses[item.id] ?? item.status })),
    [appealStatuses],
  );

  const filteredAppeals = mappedAppeals.filter((item) => {
    const statusMatch = statusFilter === "all" || item.status === statusFilter;
    const priorityMatch = priorityFilter === "all" || item.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const selectedAppeal = filteredAppeals.find((item) => item.id === selectedId) ?? filteredAppeals[0] ?? null;

  const handleStatusChange = (appealId, nextStatus) => {
    setAppealStatuses((current) => ({
      ...current,
      [appealId]: nextStatus,
    }));
  };

  const handleSendMessage = () => {
    if (!selectedAppeal || !draftMessage.trim()) {
      return;
    }

    setMessagesByAppeal((current) => ({
      ...current,
      [selectedAppeal.id]: [
        ...(current[selectedAppeal.id] ?? []),
        {
          id: `${selectedAppeal.id}-${Date.now()}`,
          author: "HR Support",
          role: "support",
          time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
          text: draftMessage.trim(),
        },
      ],
    }));
    setDraftMessage("");
  };

  return (
    <div className="workspace-page">
      <section className="workspace-hero">
        <div>
          <span className="workspace-eyebrow">Служба поддержки</span>
          <h2 className="workspace-title">Обращения сотрудников</h2>
          <p className="workspace-description">
            Канал для жалоб, предложений и запросов на внутренние изменения.
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
            <span className="workspace-metric-label">Высокий риск</span>
          </div>
        </div>
      </section>

      <section className="workspace-toolbar">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="workspace-select">
          <option value="all">Все статусы</option>
          <option value="open">Открыто</option>
          <option value="in_review">На рассмотрении</option>
          <option value="resolved">Решено</option>
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
                  <span className="workspace-pill workspace-pill-neutral">{item.category}</span>
                </div>
                <div className="appeal-list-meta">
                  <span>{item.from}</span>
                  <span>{item.date}</span>
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
                    <span className="workspace-pill workspace-pill-neutral">{selectedAppeal.category}</span>
                  </div>
                  <p className="appeal-detail-meta">
                    От: {selectedAppeal.from} · {selectedAppeal.department} · {selectedAppeal.date}
                  </p>
                </div>
                <select
                  value={selectedAppeal.status}
                  onChange={(event) => handleStatusChange(selectedAppeal.id, event.target.value)}
                  className="workspace-select appeal-status-select"
                >
                  <option value="open">Открыто</option>
                  <option value="in_review">На рассмотрении</option>
                  <option value="resolved">Решено</option>
                </select>
              </div>

              <div className="appeal-detail-body">
                <div className="appeal-detail-message">
                  <p>{selectedAppeal.description}</p>
                </div>

                <div className="appeal-detail-facts">
                  <div className="workspace-meta-item">
                    {selectedAppeal.status === "resolved" ? (
                      <MarkEmailRead sx={{ fontSize: 18 }} />
                    ) : selectedAppeal.priority === "high" ? (
                      <ErrorOutline sx={{ fontSize: 18 }} />
                    ) : (
                      <Campaign sx={{ fontSize: 18 }} />
                    )}
                    <span>Тип обращения: {selectedAppeal.category}</span>
                  </div>
                  <div className="workspace-meta-item">
                    <Schedule sx={{ fontSize: 18 }} />
                    <span>Дата регистрации: {selectedAppeal.date}</span>
                  </div>
                </div>

                <div className="appeal-chat-section">
                  <div className="appeal-chat-thread">
                    {(messagesByAppeal[selectedAppeal.id] ?? []).map((message) => (
                      <div
                        key={message.id}
                        className={`appeal-chat-message ${message.role === "support" ? "appeal-chat-message-outgoing" : "appeal-chat-message-incoming"}`}
                      >
                        <div className="appeal-chat-bubble">
                          <div className="appeal-chat-message-meta">
                            <span className="appeal-chat-author">{message.author}</span>
                            <span className="appeal-chat-time">{message.time}</span>
                          </div>
                          <p>{message.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="appeal-chat-composer">
                    <input
                      type="text"
                      value={draftMessage}
                      onChange={(event) => setDraftMessage(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleSendMessage();
                        }
                      }}
                      placeholder="Введите ответ..."
                      className="appeal-chat-input"
                    />
                    <button type="button" onClick={handleSendMessage} className="appeal-chat-send">
                      <SendRounded sx={{ fontSize: 22 }} />
                    </button>
                  </div>
                </div>
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
