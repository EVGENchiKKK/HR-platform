import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './../hooks/useAuth';
import authService from './../api/authService';
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
    const navigate = useNavigate();
    const { login } = useAuth();
    const [activeTab, setActiveTab] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!loginData.email || !loginData.password) {
            setError('Пожалуйста, заполните все поля');
            return;
        }

        setIsLoading(true);

        try {
            const result = await login({
                email: loginData.email,
                password: loginData.password,
                remember: loginData.remember
            });

            if (result.success) {
                setSuccess('Вход выполнен успешно!');

                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 1000);
            } else {
                setError(result.error || 'Ошибка авторизации');
            }
        } catch (err) {
            console.error('Login error:', err);

            if (err.response?.data?.details) {
                setError(err.response.data.details.map(d => d.message).join(', '));
            } else {
                setError(err.response?.data?.error || 'Ошибка соединения с сервером');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!registerData.firstName || !registerData.lastName || !registerData.email || !registerData.password) {
            setError('Пожалуйста, заполните все обязательные поля');
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

        setIsLoading(true);

        try {
            const result = await authService.register({
                firstName: registerData.firstName,
                lastName: registerData.lastName,
                email: registerData.email,
                password: registerData.password,
                confirmPassword: registerData.confirmPassword,
                agreeTerms: registerData.agreeTerms
            });

            if (result.success) {
                setSuccess('Регистрация прошла успешно!');

                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);
            } else {
                if (result.details && Array.isArray(result.details)) {
                    setError(result.details.map(d => d.message).join('; '));
                } else {
                    setError(result.error || 'Ошибка регистрации');
                }
            }
        } catch (err) {
            console.error('Register error:', err);

            if (err.response) {
                console.log('Status:', err.response.status);
                console.log('Data:', err.response.data);
                console.log('Headers:', err.response.headers);

                if (err.response.data.details && Array.isArray(err.response.data.details)) {
                    const messages = err.response.data.details.map(d => d.message).join('; ');
                    setError(messages);
                } else {
                    setError(err.response.data.error || 'Ошибка регистрации');
                }
            } else if (err.request) {
                setError('Нет ответа от сервера. Проверьте, запущен ли бэкенд.');
            } else {
                setError(err.message || 'Произошла ошибка');
            }
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setError('');
        setSuccess('');
        setShowPassword(false);
        setShowConfirmPassword(false);
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
                        onClick={() => handleTabChange('login')}
                        disabled={isLoading}
                    >
                        Вход
                    </button>
                    <button
                        className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                        onClick={() => handleTabChange('register')}
                        disabled={isLoading}
                    >
                        Регистрация
                    </button>
                </div>

                {error && (
                    <div className="error-message" role="alert">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {success && (
                    <div className="success-message" role="status">
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
                                    disabled={isLoading}
                                    required
                                    autoComplete="email"
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
                                    disabled={isLoading}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
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
                                    disabled={isLoading}
                                />
                                <span>Запомнить меня</span>
                            </label>
                            <a href="/forgot-password" className="forgot-link">Забыли пароль?</a>
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="spinner">Загрузка...</span>
                            ) : 'Войти в систему'}
                        </button>
                    </form>
                ) : (
                    <form className="auth-form" onSubmit={handleRegisterSubmit}>
                        <div className="name-row">
                            <div className="form-group">
                                <label>Имя *</label>
                                <div className="input-wrapper">
                                    <span className="input-icon"><UserIcon /></span>
                                    <input
                                        type="text"
                                        placeholder="Иван"
                                        value={registerData.firstName}
                                        onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                                        disabled={isLoading}
                                        required
                                        title="Только буквы, пробелы и дефис"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Фамилия *</label>
                                <div className="input-wrapper">
                                    <span className="input-icon"><UserIcon /></span>
                                    <input
                                        type="text"
                                        placeholder="Иванов"
                                        value={registerData.lastName}
                                        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                                        disabled={isLoading}
                                        required
                                        title="Только буквы, пробелы и дефис"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email *</label>
                            <div className="input-wrapper">
                                <span className="input-icon"><MailIcon /></span>
                                <input
                                    type="email"
                                    placeholder="ivanov@corp.ru"
                                    value={registerData.email}
                                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                    disabled={isLoading}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Пароль *</label>
                            <div className="input-wrapper">
                                <span className="input-icon"><LockIcon /></span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Минимум 6 символов"
                                    value={registerData.password}
                                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                    disabled={isLoading}
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                                >
                                    <EyeIcon show={showPassword} />
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Подтверждение пароля *</label>
                            <div className="input-wrapper">
                                <span className="input-icon"><LockIcon /></span>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Введите пароль еще раз"
                                    value={registerData.confirmPassword}
                                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                                    disabled={isLoading}
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={isLoading}
                                    aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
                                >
                                    <EyeIcon show={showConfirmPassword} />
                                </button>
                            </div>
                        </div>

                        <label className="checkbox-wrapper terms-checkbox">
                            <input
                                type="checkbox"
                                checked={registerData.agreeTerms}
                                onChange={(e) => setRegisterData({ ...registerData, agreeTerms: e.target.checked })}
                                disabled={isLoading}
                                required
                            />
                            <span>
                                Я соглашаюсь с <a href="/terms" target="_blank" rel="noopener noreferrer">условиями использования</a> и <a href="/privacy" target="_blank" rel="noopener noreferrer">политикой конфиденциальности</a>
                            </span>
                        </label>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="spinner">Регистрация...</span>
                            ) : 'Зарегистрироваться'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};