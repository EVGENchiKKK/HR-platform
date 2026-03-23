export const employees = [
  { id: 1, name: "Алексей Воронов", department: "Производство", position: "Старший инженер", kpi: 92, status: "active", email: "voronov@corp.ru", phone: "+7 (912) 345-67-89", hireDate: "2020-03-15", avatar: "АВ" },
  { id: 2, name: "Марина Соколова", department: "HR", position: "HR-менеджер", kpi: 88, status: "active", email: "sokolova@corp.ru", phone: "+7 (913) 456-78-90", hireDate: "2019-07-01", avatar: "МС" },
  { id: 3, name: "Дмитрий Козлов", department: "IT", position: "Разработчик", kpi: 95, status: "active", email: "kozlov@corp.ru", phone: "+7 (914) 567-89-01", hireDate: "2021-01-10", avatar: "ДК" },
  { id: 4, name: "Елена Новикова", department: "Бухгалтерия", position: "Главный бухгалтер", kpi: 78, status: "vacation", email: "novikova@corp.ru", phone: "+7 (915) 678-90-12", hireDate: "2018-05-20", avatar: "ЕН" },
  { id: 5, name: "Сергей Морозов", department: "Производство", position: "Механик", kpi: 71, status: "active", email: "morozov@corp.ru", phone: "+7 (916) 789-01-23", hireDate: "2022-09-05", avatar: "СМ" },
  { id: 6, name: "Анна Петрова", department: "Маркетинг", position: "Маркетолог", kpi: 84, status: "active", email: "petrova@corp.ru", phone: "+7 (917) 890-12-34", hireDate: "2021-11-15", avatar: "АП" },
  { id: 7, name: "Иван Белов", department: "IT", position: "Системный администратор", kpi: 89, status: "active", email: "belov@corp.ru", phone: "+7 (918) 901-23-45", hireDate: "2020-08-22", avatar: "ИБ" },
  { id: 8, name: "Ольга Захарова", department: "Производство", position: "Технолог", kpi: 76, status: "sick", email: "zaharova@corp.ru", phone: "+7 (919) 012-34-56", hireDate: "2019-12-01", avatar: "ОЗ" },
  { id: 9, name: "Павел Орлов", department: "Логистика", position: "Логист", kpi: 82, status: "active", email: "orlov@corp.ru", phone: "+7 (920) 123-45-67", hireDate: "2022-03-14", avatar: "ПО" },
  { id: 10, name: "Наталья Фёдорова", department: "Маркетинг", position: "Дизайнер", kpi: 91, status: "active", email: "fedorova@corp.ru", phone: "+7 (921) 234-56-78", hireDate: "2023-02-28", avatar: "НФ" },
];

export const departments = [
  { id: 1, name: "Производство", head: "Алексей Воронов", employeeCount: 3, kpi: 80, color: "#6366f1" },
  { id: 2, name: "IT", head: "Дмитрий Козлов", employeeCount: 2, kpi: 92, color: "#22c55e" },
  { id: 3, name: "HR", head: "Марина Соколова", employeeCount: 1, kpi: 88, color: "#f59e0b" },
  { id: 4, name: "Бухгалтерия", head: "Елена Новикова", employeeCount: 1, kpi: 78, color: "#ec4899" },
  { id: 5, name: "Маркетинг", head: "Анна Петрова", employeeCount: 2, kpi: 88, color: "#14b8a6" },
  { id: 6, name: "Логистика", head: "Павел Орлов", employeeCount: 1, kpi: 82, color: "#f97316" },
];

export const tasks = [
  { id: 1, title: "Обновить документацию по охране труда", assignee: "Алексей Воронов", department: "Производство", deadline: "2026-03-20", status: "in_progress", kpiWeight: 10, priority: "high" },
  { id: 2, title: "Провести аудит IT-инфраструктуры", assignee: "Дмитрий Козлов", department: "IT", deadline: "2026-03-25", status: "pending", kpiWeight: 15, priority: "medium" },
  { id: 3, title: "Составить отчёт по персоналу за Q1", assignee: "Марина Соколова", department: "HR", deadline: "2026-04-01", status: "completed", kpiWeight: 8, priority: "low" },
  { id: 4, title: "Оптимизация производственной линии №3", assignee: "Сергей Морозов", department: "Производство", deadline: "2026-04-10", status: "in_progress", kpiWeight: 20, priority: "high" },
  { id: 5, title: "Разработать маркетинговую стратегию Q2", assignee: "Анна Петрова", department: "Маркетинг", deadline: "2026-03-30", status: "pending", kpiWeight: 12, priority: "high" },
  { id: 6, title: "Настройка VPN для удалённого доступа", assignee: "Иван Белов", department: "IT", deadline: "2026-03-18", status: "completed", kpiWeight: 7, priority: "medium" },
  { id: 7, title: "Квартальная сверка бухгалтерских данных", assignee: "Елена Новикова", department: "Бухгалтерия", deadline: "2026-04-05", status: "pending", kpiWeight: 18, priority: "high" },
  { id: 8, title: "Оптимизация маршрутов доставки", assignee: "Павел Орлов", department: "Логистика", deadline: "2026-03-28", status: "in_progress", kpiWeight: 11, priority: "medium" },
];

export const surveys = [
  { id: 1, title: "Удовлетворённость условиями труда 2026", type: "survey", status: "active", responses: 87, total: 101, deadline: "2026-03-31", createdBy: "Марина Соколова", description: "Ежегодный опрос по условиям труда и рабочей среде" },
  { id: 2, title: "Тест по технике безопасности", type: "test", status: "active", responses: 34, total: 42, deadline: "2026-03-22", createdBy: "Алексей Воронов", description: "Обязательный тест для сотрудников производственного цеха" },
  { id: 3, title: "Обратная связь о корпоративной культуре", type: "survey", status: "completed", responses: 95, total: 95, deadline: "2026-02-28", createdBy: "Марина Соколова", description: "Анонимный опрос о корпоративной культуре" },
  { id: 4, title: "Аттестация знаний IT-специалистов", type: "test", status: "draft", responses: 0, total: 15, deadline: "2026-04-15", createdBy: "Дмитрий Козлов", description: "Проверка технических компетенций IT-отдела" },
  { id: 5, title: "NPS: рекомендуете ли вы нашу компанию?", type: "survey", status: "active", responses: 58, total: 101, deadline: "2026-04-10", createdBy: "Марина Соколова", description: "Оценка лояльности сотрудников" },
];

export const appeals = [
  { id: 1, subject: "Некомфортные условия в цехе №2", from: "Сергей Морозов", department: "Производство", date: "2026-03-08", status: "open", priority: "high", category: "Условия труда", description: "В цехе №2 сломана система вентиляции, температура превышает допустимую норму." },
  { id: 2, subject: "Задержка выплаты премиальных", from: "Ольга Захарова", department: "Производство", date: "2026-03-05", status: "in_review", priority: "medium", category: "Оплата труда", description: "Премия за февраль не была начислена вовремя." },
  { id: 3, subject: "Конфликт с непосредственным руководителем", from: "Аноним", department: "Логистика", date: "2026-03-01", status: "resolved", priority: "high", category: "Рабочие отношения", description: "Описание ситуации конфликта с непосредственным руководителем." },
  { id: 4, subject: "Предложение по улучшению рабочего процесса", from: "Иван Белов", department: "IT", date: "2026-03-10", status: "open", priority: "low", category: "Предложение", description: "Предлагаю внедрить систему CI/CD для ускорения разработки." },
  { id: 5, subject: "Запрос на дополнительное оборудование", from: "Наталья Фёдорова", department: "Маркетинг", date: "2026-03-09", status: "in_review", priority: "medium", category: "Оснащение", description: "Необходим графический планшет для работы дизайнера." },
];

export const courses = [
  { id: 1, title: "Введение в корпоративную культуру", description: "Базовый курс для новых сотрудников", duration: "2 часа", modules: 5, enrolled: 12, completed: 8, status: "active", category: "Онбординг", instructor: "Марина Соколова" },
  { id: 2, title: "Техника безопасности на производстве", description: "Обязательный курс для всех сотрудников", duration: "4 часа", modules: 8, enrolled: 101, completed: 76, status: "active", category: "Безопасность", instructor: "Алексей Воронов" },
  { id: 3, title: "Основы работы с корпоративными системами", description: "Работа с внутренними IT-системами компании", duration: "3 часа", modules: 6, enrolled: 45, completed: 33, status: "active", category: "IT", instructor: "Иван Белов" },
  { id: 4, title: "Эффективная коммуникация в команде", description: "Навыки командной работы и коммуникации", duration: "1.5 часа", modules: 4, enrolled: 28, completed: 21, status: "active", category: "Soft Skills", instructor: "Марина Соколова" },
  { id: 5, title: "Финансовая грамотность для руководителей", description: "Основы финансового планирования", duration: "5 часов", modules: 10, enrolled: 8, completed: 3, status: "draft", category: "Управление", instructor: "Елена Новикова" },
];

export const forumPosts = [
  { id: 1, title: "Предложения по организации корпоратива на 8 марта", author: "Анна Петрова", category: "Корпоративная жизнь", replies: 23, views: 145, date: "2026-03-08", pinned: true, tags: ["мероприятие", "корпоратив"] },
  { id: 2, title: "Обновление регламента работы с поставщиками", author: "Павел Орлов", category: "Рабочие процессы", replies: 7, views: 89, date: "2026-03-07", pinned: false, tags: ["регламент", "логистика"] },
  { id: 3, title: "Вопрос: как оформить заявку на отпуск в новой системе?", author: "Сергей Морозов", category: "Помощь и поддержка", replies: 12, views: 203, date: "2026-03-06", pinned: false, tags: ["вопрос", "отпуск"] },
  { id: 4, title: "Итоги хакатона IT-отдела: делимся результатами", author: "Дмитрий Козлов", category: "Достижения", replies: 31, views: 312, date: "2026-03-05", pinned: true, tags: ["it", "хакатон", "результаты"] },
  { id: 5, title: "Нужна помощь с настройкой рабочего места", author: "Наталья Фёдорова", category: "Помощь и поддержка", replies: 5, views: 67, date: "2026-03-04", pinned: false, tags: ["помощь", "оборудование"] },
  { id: 6, title: "Обсуждаем новые KPI на Q2 2026", author: "Марина Соколова", category: "Рабочие процессы", replies: 18, views: 178, date: "2026-03-03", pinned: false, tags: ["kpi", "цели"] },
];

export const kpiTrend = [
  { month: "Окт", production: 78, it: 88, hr: 82, marketing: 79, logistics: 71 },
  { month: "Ноя", production: 80, it: 90, hr: 84, marketing: 81, logistics: 73 },
  { month: "Дек", production: 77, it: 87, hr: 83, marketing: 84, logistics: 72 },
  { month: "Янв", production: 82, it: 91, hr: 85, marketing: 85, logistics: 76 },
  { month: "Фев", production: 80, it: 93, hr: 86, marketing: 87, logistics: 74 },
  { month: "Мар", production: 81, it: 92, hr: 87, marketing: 88, logistics: 75 },
];

export const taskStatusData = [
  { name: "Выполнено", value: 34, color: "#22c55e" },
  { name: "В процессе", value: 28, color: "#6366f1" },
  { name: "Ожидает", value: 19, color: "#f59e0b" },
  { name: "Просрочено", value: 7, color: "#ef4444" },
];
