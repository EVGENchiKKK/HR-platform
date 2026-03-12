import { useState } from 'react';
import './../style/auth.css';

const MailIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const LockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const EyeIcon = ({ show }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {show ? (
            <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </>
        ) : (
            <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </>
        )}
    </svg>
);

export const Auth = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
        remember: false
    });

    const [registerData, setRegisterData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    });

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!loginData.email || !loginData.password) {
            setError('Пожалуйста, заполните все поля');
            return;
        }

        console.log('Login data:', loginData);
        setSuccess('Вход выполнен успешно!');

    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!registerData.firstName || !registerData.lastName || !registerData.email || !registerData.password || !registerData.confirmPassword) {
            setError('Пожалуйста, заполните все поля');
            return;
        }

        if (registerData.password.length < 6) {
            setError('Пароль должен содержать минимум 6 символов');
            return;
        }

        if (registerData.password !== registerData.confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        if (!registerData.agreeTerms) {
            setError('Необходимо согласиться с условиями использования');
            return;
        }

        console.log('Register data:', registerData);
        setSuccess('Регистрация прошла успешно!');

        setTimeout(() => {
            setActiveTab('login');
            setSuccess('');
        }, 2000);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>HR-<span>helper</span></h1>
                    <p>Платформа управления персоналом</p>
                </div>

                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => setActiveTab('login')}
                    >
                        Вход
                    </button>
                    <button
                        className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                        onClick={() => setActiveTab('register')}
                    >
                        Регистрация
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        <span>✓</span> {success}
                    </div>
                )}

                {activeTab === 'login' ? (
                    <form className="auth-form" onSubmit={handleLoginSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <div className="input-wrapper">
                                <span className="input-icon"><MailIcon /></span>
                                <input
                                    type="email"
                                    placeholder="ivanov@corp.ru"
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Пароль</label>
                            <div className="input-wrapper">
                                <span className="input-icon"><LockIcon /></span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <EyeIcon show={showPassword} />
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    checked={loginData.remember}
                                    onChange={(e) => setLoginData({ ...loginData, remember: e.target.checked })}
                                />
                                <span>Запомнить меня</span>
                            </label>
                            <a href="#" className="forgot-link">Забыли пароль?</a>
                        </div>

                        <button type="submit" className="auth-button">
                            Войти в систему
                        </button>
                    </form>
                ) : (
                    <form className="auth-form" onSubmit={handleRegisterSubmit}>
                        <div className="name-row">
                            <div className="form-group">
                                <label>Имя</label>
                                <div className="input-wrapper">
                                    <span className="input-icon"><UserIcon /></span>
                                    <input
                                        type="text"
                                        placeholder="Иван"
                                        value={registerData.firstName}
                                        onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Фамилия</label>
                                <div className="input-wrapper">
                                    <span className="input-icon"><UserIcon /></span>
                                    <input
                                        type="text"
                                        placeholder="Иванов"
                                        value={registerData.lastName}
                                        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <div className="input-wrapper">
                                <span className="input-icon"><MailIcon /></span>
                                <input
                                    type="email"
                                    placeholder="ivanov@corp.ru"
                                    value={registerData.email}
                                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Пароль</label>
                            <div className="input-wrapper">
                                <span className="input-icon"><LockIcon /></span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Минимум 6 символов"
                                    value={registerData.password}
                                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <EyeIcon show={showPassword} />
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Подтверждение пароля</label>
                            <div className="input-wrapper">
                                <span className="input-icon"><LockIcon /></span>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Введите пароль еще раз"
                                    value={registerData.confirmPassword}
                                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <EyeIcon show={showConfirmPassword} />
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="auth-button">
                            Зарегистрироваться
                        </button>
                        <p className="terms">
                            Регистрируясь, вы соглашаетесь с <a href="#">условиями использования</a> и <a href="#">политикой конфиденциальности</a>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}