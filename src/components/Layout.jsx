import { useState, useRef, useEffect, useCallback } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    Dashboard,
    People,
    Business,
    BarChart,
    Assignment,
    QuestionAnswer,
    Chat,
    MenuBook,
    Tag,
    ChevronLeft,
    ChevronRight,
    Notifications,
    Search,
    Settings,
    Logout,
    ExpandMore,
    Person,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import workspaceService from "../api/workspaceService";
import getRoleLabel from "../utils/roleLabels";
import "./../style/layout.css";

const navItems = [
    { path: "/dashboard", icon: Dashboard, label: "Дашборд" },
    { path: "/profile", icon: Person, label: "Личный кабинет" },
    { path: "/employees", icon: People, label: "Сотрудники" },
    { path: "/departments", icon: Business, label: "Отделы" },
    { path: "/analytics", icon: BarChart, label: "Аналитика KPI" },
    { path: "/tasks", icon: Assignment, label: "Задачи" },
    { path: "/surveys", icon: QuestionAnswer, label: "Опросы и тесты" },
    { path: "/appeals", icon: Chat, label: "Обращения" },
    { path: "/training", icon: MenuBook, label: "Обучение" },
    { path: "/forum", icon: Tag, label: "Форум" },
];

export function Layout() {
    const [collapsed, setCollapsed] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const { user, logout } = useAuth();
    const [workspaceData, setWorkspaceData] = useState({
        employees: [],
        departments: [],
        tasks: [],
        appeals: [],
        forumPosts: [],
        courses: [],
        surveys: [],
        notifications: [],
    });
    const [workspaceLoading, setWorkspaceLoading] = useState(true);
    const [workspaceError, setWorkspaceError] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    const notifRef = useRef(null);
    const profileRef = useRef(null);

    const currentPage = navItems.find((item) =>
        item.path === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(item.path)
    );
    const notifications = workspaceData.notifications || [];
    const unreadNotifications = notifications.filter((notification) => notification.unread).length;

    const handleLogout = async () => {
        await logout();
        navigate("/auth");
    };

    const loadWorkspaceData = useCallback(async () => {
        setWorkspaceLoading(true);
        setWorkspaceError("");

        try {
            const response = await workspaceService.getWorkspaceData();
            if (response.success) {
                setWorkspaceData(response.data);
            } else {
                setWorkspaceError(response.error || "Не удалось загрузить данные");
            }
        } catch (error) {
            setWorkspaceError(error.response?.data?.error || "Не удалось загрузить данные");
        } finally {
            setWorkspaceLoading(false);
        }
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotif(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        loadWorkspaceData();
    }, [loadWorkspaceData]);

    const getUserInitials = () => {
        if (!user) return "П";
        const name = user.firstName || user.U_name || "Пользователь";
        const lastName = user.lastName || user.U_surname || "";
        return (name[0] + (lastName[0] || "")).toUpperCase();
    };

    const getUserName = () => {
        if (!user) return "Пользователь";
        return `${user.firstName || user.U_name || ""} ${user.lastName || user.U_surname || ""}`.trim() || "Пользователь";
    };

    const getUserRole = () => {
        if (!user) return "Сотрудник";
        return getRoleLabel(user.role || user.R_name);
    };

    return (
        <div className="layout-container">
            <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
                <div className={`sidebar-logo ${collapsed ? "sidebar-logo-collapsed" : ""}`}>
                    <span className="logo-text">HR</span>
                    {!collapsed && (
                        <div className="logo-subtitle">
                            <span className="logo-highlight">Helper</span>
                            <span className="logo-description">Платформа управления</span>
                        </div>
                    )}
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                title={collapsed ? item.label : undefined}
                                className={`nav-item ${isActive ? "nav-item-active" : ""} ${collapsed ? "nav-item-collapsed" : ""}`}
                            >
                                <Icon sx={{ fontSize: 18 }} className="nav-icon" />
                                {!collapsed && <span>{item.label}</span>}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`collapse-btn ${collapsed ? "collapse-btn-collapsed" : ""}`}
                    >
                        {collapsed ? <ChevronRight sx={{ fontSize: 18 }} /> : (
                            <>
                                <ChevronLeft sx={{ fontSize: 18 }} />
                                <span>Свернуть</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            <div className={`main-wrapper ${collapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
                <header className="top-header">
                    <div className="header-left">
                        <h1 className="page-title">{currentPage?.label || "Страница"}</h1>
                    </div>

                    <div className="header-right">
                        <div className="search-container">
                            <Search sx={{ fontSize: 15 }} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Поиск..."
                                className="search-input"
                            />
                        </div>

                        <div className="notification-container" ref={notifRef}>
                            <button
                                onClick={async () => {
                                    const nextState = !showNotif;
                                    setShowNotif(nextState);
                                    setShowProfile(false);
                                    if (nextState && unreadNotifications > 0) {
                                        try {
                                            await workspaceService.markNotificationsRead();
                                            await loadWorkspaceData();
                                        } catch (error) {
                                        }
                                    }
                                }}
                                className="notification-btn"
                            >
                                <Notifications sx={{ fontSize: 17 }} className="notification-icon" />
                                {unreadNotifications > 0 ? <span className="notification-badge"></span> : null}
                            </button>
                            {showNotif && (
                                <div className="dropdown-menu notification-dropdown">
                                    <div className="dropdown-header">
                                        <span className="dropdown-title">Уведомления</span>
                                        <span className="dropdown-action">{unreadNotifications ? `${unreadNotifications} новых` : "Все прочитаны"}</span>
                                    </div>
                                    {notifications.length > 0 ? notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`dropdown-item ${notification.unread ? "dropdown-item-unread" : ""}`}
                                            onClick={() => {
                                                if (notification.link) {
                                                    navigate(notification.link);
                                                    setShowNotif(false);
                                                }
                                            }}
                                        >
                                            <p className="dropdown-text">{notification.title}</p>
                                            <p className="dropdown-text">{notification.text}</p>
                                            <p className="dropdown-time">{notification.time}</p>
                                        </div>
                                    )) : (
                                        <div className="dropdown-item">
                                            <p className="dropdown-text">Пока нет новых уведомлений</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="profile-container" ref={profileRef}>
                            <button
                                onClick={() => {
                                    setShowProfile(!showProfile);
                                    setShowNotif(false);
                                }}
                                className="profile-btn"
                            >
                                <div className="profile-avatar">{getUserInitials()}</div>
                                <span className="profile-name">{getUserName()}</span>
                                <ExpandMore sx={{ fontSize: 14 }} className="profile-arrow" />
                            </button>
                            {showProfile && (
                                <div className="dropdown-menu profile-dropdown">
                                    <div className="profile-dropdown-header">
                                        <p className="profile-dropdown-name">{getUserName()}</p>
                                        <p className="profile-dropdown-role">{getUserRole()}</p>
                                    </div>
                                    <button
                                        className="dropdown-btn"
                                        onClick={() => {
                                            navigate("/profile");
                                            setShowProfile(false);
                                        }}
                                    >
                                        <Person sx={{ fontSize: 15 }} /> Профиль
                                    </button>
                                    <button className="dropdown-btn">
                                        <Settings sx={{ fontSize: 15 }} /> Настройки
                                    </button>
                                    <button className="dropdown-btn dropdown-btn-danger" onClick={handleLogout}>
                                        <Logout sx={{ fontSize: 15 }} /> Выйти
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="page-content">
                    <Outlet context={{ user, workspaceData, workspaceLoading, workspaceError, refreshWorkspaceData: loadWorkspaceData }} />
                </main>
            </div>
        </div>
    );
}

export default Layout;
