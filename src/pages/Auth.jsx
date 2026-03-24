import { useEffect, useState } from 'react';
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

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.79.63 2.64a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.44-1.24a2 2 0 0 1 2.11-.45c.85.3 1.74.51 2.64.63A2 2 0 0 1 22 16.92z" />
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

const initialRegisterData = {
  login: '',
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  phone: '',
  hireDate: '',
  roleId: '',
  departmentId: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
};

const getDetailsMessage = (details) => {
  if (!Array.isArray(details)) {
    return '';
  }

  return details
    .map((detail) => (typeof detail === 'string' ? detail : detail?.message))
    .filter(Boolean)
    .join('; ');
};

export const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const [registerData, setRegisterData] = useState(initialRegisterData);

  useEffect(() => {
    if (activeTab !== 'register' || roles.length || departments.length) {
      return;
    }

    const loadRegisterMeta = async () => {
      setMetaLoading(true);
      try {
        const response = await authService.getRegisterMeta();
        if (!response.success) {
          setError(response.error || 'Не удалось загрузить данные для регистрации');
          return;
        }

        setRoles(response.data.roles || []);
        setDepartments(response.data.departments || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Не удалось загрузить данные для регистрации');
      } finally {
        setMetaLoading(false);
      }
    };

    loadRegisterMeta();
  }, [activeTab, roles.length, departments.length]);

  const handleRegisterChange = (field, value) => {
    setRegisterData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

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
        setSuccess('Вход выполнен успешно');

        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1000);
      } else {
        setError(result.error || 'Ошибка авторизации');
      }
    } catch (err) {
      if (err.response?.data?.details) {
        setError(getDetailsMessage(err.response.data.details) || err.response.data.error || 'Ошибка соединения с сервером');
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

    const requiredFields = [
      registerData.login,
      registerData.firstName,
      registerData.lastName,
      registerData.email,
      registerData.hireDate,
      registerData.roleId,
      registerData.departmentId,
      registerData.password,
      registerData.confirmPassword
    ];

    if (requiredFields.some((field) => !field)) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (!/[A-Z]/.test(registerData.password)) {
      setError('Пароль должен содержать хотя бы одну заглавную букву');
      return;
    }

    if (!/[a-z]/.test(registerData.password)) {
      setError('Пароль должен содержать хотя бы одну строчную букву');
      return;
    }

    if (!/[0-9]/.test(registerData.password)) {
      setError('Пароль должен содержать хотя бы одну цифру');
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
        ...registerData,
        roleId: Number(registerData.roleId),
        departmentId: Number(registerData.departmentId)
      });

      if (!result.success) {
        if (Array.isArray(result.details)) {
          setError(getDetailsMessage(result.details) || 'Ошибка регистрации');
        } else {
          setError(result.error || 'Ошибка регистрации');
        }
        return;
      }

      authService.saveAuthData(result.data.token, result.data.user, false);
      setSuccess('Регистрация прошла успешно');
      setRegisterData(initialRegisterData);

      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1200);
    } catch (err) {
      if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
        setError(getDetailsMessage(err.response.data.details) || err.response.data.error || 'Ошибка регистрации');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.request) {
        setError('Нет ответа от сервера. Проверьте, запущен ли бэкенд.');
      } else {
        setError(err.message || 'Произошла ошибка');
      }
    } finally {
      setIsLoading(false);
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
            disabled={isLoading || metaLoading}
          >
            Вход
          </button>
          <button
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => handleTabChange('register')}
            disabled={isLoading || metaLoading}
          >
            Регистрация
          </button>
        </div>

        <div className="auth-form">
          {error && (
            <div className="error-message" role="alert">
              <span>!</span> {error}
            </div>
          )}

          {success && (
            <div className="success-message" role="status">
              <span>OK</span> {success}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
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
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Введите пароль"
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
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
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

              <button type="submit" className="auth-button" disabled={isLoading}>
                {isLoading ? <span className="spinner">Загрузка...</span> : 'Войти в систему'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              {metaLoading && <div className="helper-text">Загрузка ролей и отделов...</div>}

              <div className="name-row triple-row">
                <div className="form-group">
                  <label>Фамилия *</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><UserIcon /></span>
                    <input
                      type="text"
                      placeholder="Иванов"
                      value={registerData.lastName}
                      onChange={(e) => handleRegisterChange('lastName', e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Имя *</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><UserIcon /></span>
                    <input
                      type="text"
                      placeholder="Иван"
                      value={registerData.firstName}
                      onChange={(e) => handleRegisterChange('firstName', e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Отчество</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><UserIcon /></span>
                    <input
                      type="text"
                      placeholder="Иванович"
                      value={registerData.middleName}
                      onChange={(e) => handleRegisterChange('middleName', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="name-row">
                <div className="form-group">
                  <label>Логин *</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><UserIcon /></span>
                    <input
                      type="text"
                      placeholder="ivanov.i"
                      value={registerData.login}
                      onChange={(e) => handleRegisterChange('login', e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Телефон</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><PhoneIcon /></span>
                    <input
                      type="tel"
                      placeholder="+7 (900) 123-45-67"
                      value={registerData.phone}
                      onChange={(e) => handleRegisterChange('phone', e.target.value)}
                      disabled={isLoading}
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
                    onChange={(e) => handleRegisterChange('email', e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="name-row">
                <div className="form-group">
                  <label>Роль *</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><UserIcon /></span>
                    <select
                      value={registerData.roleId}
                      onChange={(e) => handleRegisterChange('roleId', e.target.value)}
                      disabled={isLoading || metaLoading}
                      required
                    >
                      <option value="">Выберите роль</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Отдел *</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><UserIcon /></span>
                    <select
                      value={registerData.departmentId}
                      onChange={(e) => handleRegisterChange('departmentId', e.target.value)}
                      disabled={isLoading || metaLoading}
                      required
                    >
                      <option value="">Выберите отдел</option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Дата приёма на работу *</label>
                <div className="input-wrapper">
                  <span className="input-icon"><CalendarIcon /></span>
                  <input
                    type="date"
                    value={registerData.hireDate}
                    onChange={(e) => handleRegisterChange('hireDate', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Пароль *</label>
                <div className="input-wrapper">
                  <span className="input-icon"><LockIcon /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Минимум 6 символов, заглавная, строчная буква и цифра"
                    value={registerData.password}
                    onChange={(e) => handleRegisterChange('password', e.target.value)}
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
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
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
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Введите пароль ещё раз"
                    value={registerData.confirmPassword}
                    onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    <EyeIcon show={showConfirmPassword} />
                  </button>
                </div>
              </div>

              <label className="checkbox-wrapper terms-checkbox">
                <input
                  type="checkbox"
                  checked={registerData.agreeTerms}
                  onChange={(e) => handleRegisterChange('agreeTerms', e.target.checked)}
                  disabled={isLoading}
                  required
                />
                <span>
                  Я соглашаюсь с <a href="/terms" target="_blank" rel="noopener noreferrer">условиями использования</a> и{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer">политикой конфиденциальности</a>
                </span>
              </label>

              <button type="submit" className="auth-button" disabled={isLoading || metaLoading}>
                {isLoading ? <span className="spinner">Регистрация...</span> : 'Зарегистрироваться'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
