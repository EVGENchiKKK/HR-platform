import { Link, useOutletContext } from 'react-router-dom';
import {
  AutoGraph,
  ChatBubbleOutline,
  Groups,
  LocalLibrary,
  RocketLaunch,
  Shield,
  StarBorder,
  TaskAlt,
  TrendingUp,
} from '@mui/icons-material';
import './../style/workspace-pages.css';
import './../style/profile.css';

const roleProfiles = {
  admin: {
    badge: 'Полный контур управления',
    accent: 'profile-tone-admin',
    summary: 'Кабинет администратора собирает ключевые сигналы по людям, задачам и внутренним процессам платформы.',
    actions: [
      { title: 'Проверить пользователей', description: 'Просмотреть сотрудников, роли и отделы.', to: '/employees' },
      { title: 'Посмотреть KPI отделов', description: 'Открыть оперативную аналитику по подразделениям.', to: '/analytics' },
      { title: 'Разобрать обращения', description: 'Проверить новые и критичные обращения.', to: '/appeals' },
    ],
    permissions: ['Доступ ко всем разделам', 'Управление пользователями и ролями', 'Контроль KPI и обращений'],
  },
  hr: {
    badge: 'HR-операции и развитие',
    accent: 'profile-tone-hr',
    summary: 'Фокус на вовлечённости сотрудников, опросах, обучении и кадровых процессах.',
    actions: [
      { title: 'Запустить опрос', description: 'Проверить активные опросы и тесты.', to: '/surveys' },
      { title: 'Сверить обучение', description: 'Открыть каталог курсов и прогресс.', to: '/training' },
      { title: 'Проверить обращения', description: 'Разобрать сигналы от сотрудников.', to: '/appeals' },
    ],
    permissions: ['Опросы, тесты и обучение', 'Просмотр сотрудников и отделов', 'Работа с обращениями'],
  },
  manager: {
    badge: 'Управление командой',
    accent: 'profile-tone-manager',
    summary: 'Кабинет руководителя помогает контролировать задачи, нагрузку команды и рабочие сигналы подразделения.',
    actions: [
      { title: 'Перераспределить задачи', description: 'Открыть список задач по отделам.', to: '/tasks' },
      { title: 'Посмотреть аналитику', description: 'Проверить KPI и активность отдела.', to: '/analytics' },
      { title: 'Открыть форум', description: 'Посмотреть обсуждения команды.', to: '/forum' },
    ],
    permissions: ['Контроль задач и сроков', 'Командная аналитика', 'Форум и внутренние коммуникации'],
  },
  employee: {
    badge: 'Ежедневная рабочая зона',
    accent: 'profile-tone-employee',
    summary: 'Персональная лента задач, обучения, опросов и внутренних коммуникаций.',
    actions: [
      { title: 'Открыть задачи', description: 'Проверить приоритеты и сроки.', to: '/tasks' },
      { title: 'Продолжить обучение', description: 'Открыть обязательные и активные курсы.', to: '/training' },
      { title: 'Оставить обращение', description: 'Проверить актуальные обращения и ответы.', to: '/appeals' },
    ],
    permissions: ['Персональные задачи', 'Обучение и тесты', 'Форум и обращения'],
  },
};

const normalizeRole = (roleValue) => {
  const role = `${roleValue || ''}`.trim().toLowerCase();
  if (role.includes('admin')) return 'admin';
  if (role.includes('hr')) return 'hr';
  if (role.includes('manager')) return 'manager';
  return 'employee';
};

export const Profile = () => {
  const { user, workspaceData, workspaceLoading, workspaceError } = useOutletContext();
  const profileKey = normalizeRole(user?.role || user?.R_name);
  const profile = roleProfiles[profileKey];

  const employees = workspaceData.employees || [];
  const tasks = workspaceData.tasks || [];
  const courses = workspaceData.courses || [];
  const forumPosts = workspaceData.forumPosts || [];
  const surveys = workspaceData.surveys || [];
  const appeals = workspaceData.appeals || [];

  const userName = `${user?.firstName || user?.U_name || ''} ${user?.lastName || user?.U_surname || ''}`.trim() || 'Пользователь';
  const userRole = user?.role || user?.R_name || 'Сотрудник';
  const userEmail = user?.email || user?.U_email || 'user@company.local';
  const userDepartment = user?.department || null;

  const scopedTasks = profileKey === 'employee'
    ? tasks.filter((task) => task.assignee.includes(user?.firstName || '') || task.department === userDepartment)
    : tasks;
  const scopedCourses = profileKey === 'employee'
    ? courses.filter((course) => course.status === 'active')
    : courses;
  const scopedPosts = forumPosts.slice(0, 3);
  const scopedAppeals = profileKey === 'employee'
    ? appeals.filter((appeal) => appeal.from.includes(user?.firstName || ''))
    : appeals;

  const highlights = {
    admin: [
      { label: 'Активные пользователи', value: `${employees.length}`, icon: Groups },
      { label: 'Открытые обращения', value: `${appeals.filter((appeal) => appeal.status === 'open').length}`, icon: ChatBubbleOutline },
      { label: 'Активные задачи', value: `${tasks.filter((task) => task.status === 'in_progress').length}`, icon: Shield },
    ],
    hr: [
      { label: 'Активные опросы', value: `${surveys.filter((survey) => survey.status === 'active').length}`, icon: ChatBubbleOutline },
      { label: 'Курсы в работе', value: `${courses.filter((course) => course.status === 'active').length}`, icon: LocalLibrary },
      { label: 'Сотрудники', value: `${employees.length}`, icon: Groups },
    ],
    manager: [
      { label: 'Задачи в работе', value: `${tasks.filter((task) => task.status === 'in_progress').length}`, icon: TaskAlt },
      { label: 'Командный KPI', value: `${employees.length ? Math.round(employees.reduce((sum, employee) => sum + employee.kpi, 0) / employees.length) : 0}%`, icon: AutoGraph },
      { label: 'Обращения отдела', value: `${appeals.filter((appeal) => appeal.department === userDepartment).length}`, icon: ChatBubbleOutline },
    ],
    employee: [
      { label: 'Мои задачи', value: `${scopedTasks.length}`, icon: TaskAlt },
      { label: 'Курсы к завершению', value: `${scopedCourses.filter((course) => course.status === 'active').length}`, icon: LocalLibrary },
      { label: 'Мои обращения', value: `${scopedAppeals.length}`, icon: ChatBubbleOutline },
    ],
  };

  if (workspaceLoading) {
    return <div className="workspace-page">Загрузка данных...</div>;
  }

  if (workspaceError) {
    return <div className="workspace-page">{workspaceError}</div>;
  }

  return (
    <div className="workspace-page profile-page">
      <section className={`workspace-hero profile-hero ${profile.accent}`}>
        <div className="profile-hero-copy">
          <span className="workspace-eyebrow">Личный кабинет</span>
          <h1 className="workspace-title">{userName}</h1>
          <p className="profile-role">{userRole}</p>
          <p className="workspace-description">{profile.summary}</p>

          <div className="profile-identity-grid">
            <div className="profile-identity-card">
              <span className="profile-identity-label">Рабочий email</span>
              <strong>{userEmail}</strong>
            </div>
            <div className="profile-identity-card">
              <span className="profile-identity-label">Роль в платформе</span>
              <strong>{profile.badge}</strong>
            </div>
          </div>
        </div>

        <div className="workspace-metrics profile-metrics">
          {highlights[profileKey].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="workspace-metric profile-metric">
                <div className="profile-metric-icon">
                  <Icon sx={{ fontSize: 20 }} />
                </div>
                <span className="workspace-metric-value">{item.value}</span>
                <span className="workspace-metric-label">{item.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="profile-grid">
        <article className="workspace-panel profile-panel">
          <div className="profile-section-header">
            <div>
              <span className="profile-section-kicker">Доступно по роли</span>
              <h2 className="profile-section-title">Ключевые возможности</h2>
            </div>
            <Shield sx={{ fontSize: 20 }} />
          </div>

          <div className="profile-permissions-list">
            {profile.permissions.map((permission) => (
              <div key={permission} className="profile-permission-item">
                <StarBorder sx={{ fontSize: 18 }} />
                <span>{permission}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="workspace-panel profile-panel">
          <div className="profile-section-header">
            <div>
              <span className="profile-section-kicker">Следующие шаги</span>
              <h2 className="profile-section-title">Быстрые действия</h2>
            </div>
            <RocketLaunch sx={{ fontSize: 20 }} />
          </div>

          <div className="profile-action-list">
            {profile.actions.map((action) => (
              <Link key={action.title} to={action.to} className="profile-action-card">
                <div>
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
                <TrendingUp sx={{ fontSize: 18 }} />
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="profile-content-grid">
        <article className="workspace-panel profile-panel">
          <div className="profile-section-header">
            <div>
              <span className="profile-section-kicker">Фокус дня</span>
              <h2 className="profile-section-title">Актуальные задачи</h2>
            </div>
            <TaskAlt sx={{ fontSize: 20 }} />
          </div>

          <div className="profile-stack">
            {scopedTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="profile-list-card">
                <div className="profile-list-top">
                  <h3>{task.title}</h3>
                  <span className={`workspace-pill workspace-pill-${task.priority}`}>{task.priority}</span>
                </div>
                <p>{task.department}</p>
                <div className="profile-inline-meta">
                  <span>Статус: {task.status}</span>
                  <span>Срок: {task.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="workspace-panel profile-panel">
          <div className="profile-section-header">
            <div>
              <span className="profile-section-kicker">Развитие</span>
              <h2 className="profile-section-title">Обучение и прогресс</h2>
            </div>
            <LocalLibrary sx={{ fontSize: 20 }} />
          </div>

          <div className="profile-stack">
            {scopedCourses.slice(0, 2).map((course, index) => {
              const progress = course.enrolled ? Math.round((course.completed / course.enrolled) * 100) : 0;
              return (
                <div key={course.id} className="profile-list-card">
                  <div className="profile-list-top">
                    <h3>{course.title}</h3>
                    <span className="profile-course-index">0{index + 1}</span>
                  </div>
                  <p>{course.description}</p>
                  <div className="workspace-progress">
                    <div className="workspace-progress-track">
                      <div className="workspace-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="workspace-progress-label">{progress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="workspace-panel profile-panel">
          <div className="profile-section-header">
            <div>
              <span className="profile-section-kicker">Коммуникации</span>
              <h2 className="profile-section-title">Свежие обсуждения</h2>
            </div>
            <ChatBubbleOutline sx={{ fontSize: 20 }} />
          </div>

          <div className="profile-stack">
            {scopedPosts.map((post) => (
              <div key={post.id} className="profile-list-card">
                <div className="profile-list-top">
                  <h3>{post.title}</h3>
                  <span className="workspace-pill workspace-pill-neutral">{post.replies} ответов</span>
                </div>
                <p>{post.category}</p>
                <div className="profile-inline-meta">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};

export default Profile;
