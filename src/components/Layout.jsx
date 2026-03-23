import { useState, useRef, useEffect } from "react";
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
import "./../style/layout.css";

const navItems = [
    { path: "/dashboard", icon: Dashboard, label: "Дашборд" },
    { path: "/employees", icon: People, label: "Сотрудники" },
    { path: "/departments", icon: Business, label: "Отделы" },
    { path: "/analytics", icon: BarChart, label: "Аналитика KPI" },
    { path: "/tasks", icon: Assignment, label: "Задачи" },
    { path: "/surveys", icon: QuestionAnswer, label: "Опросы и тесты" },
    { path: "/appeals", icon: Chat, label: "Обращения" },
    { path: "/training", icon: MenuBook, label: "Обучение" },
    { path: "/forum", icon: Tag, label: "Форум" },
];

const notifications = [
    { id: 1, text: "Новое обращение от Сергея Морозова", time: "5 мин назад", unread: true },
    { id: 2, text: "Тест по ТБ: 34 из 42 ответили", time: "1 час назад", unread: true },
    { id: 3, text: "Задача №4 просрочена", time: "3 часа назад", unread: false },
];

export function Layout() {
    const [collapsed, setCollapsed] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const notifRef = useRef(null);
    const profileRef = useRef(null);

    const currentPage = navItems.find(item =>
        item.path === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(item.path)
    );

    const handleLogout = async () => {
        await logout();
        navigate("/auth");
    };

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
        return user.role || user.R_name || "Сотрудник";
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
                                onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
                                className="notification-btn"
                            >
                                <Notifications sx={{ fontSize: 17 }} className="notification-icon" />
                                <span className="notification-badge"></span>
                            </button>
                            {showNotif && (
                                <div className="dropdown-menu notification-dropdown">
                                    <div className="dropdown-header">
                                        <span className="dropdown-title">Уведомления</span>
                                        <span className="dropdown-action">Отметить все</span>
                                    </div>
                                    {notifications.map(n => (
                                        <div key={n.id} className={`dropdown-item ${n.unread ? "dropdown-item-unread" : ""}`}>
                                            <p className="dropdown-text">{n.text}</p>
                                            <p className="dropdown-time">{n.time}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="profile-container" ref={profileRef}>
                            <button
                                onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
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
                                    <button className="dropdown-btn">
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
                    <Outlet context={{ user }} />
                </main>
            </div>
        </div>
    );
}

export default Layout;