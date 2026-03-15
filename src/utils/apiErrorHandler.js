export const handleApiError = (error, customMessages = {}) => {
  if (!error.response) {
    return {
      type: 'network',
      message: customMessages.network || 'Нет соединения с сервером. Проверьте подключение к интернету.',
      code: 'NETWORK_ERROR'
    };
  }

  if (error.response.status === 400) {
    const details = error.response.data.details;
    
    if (details && Array.isArray(details)) {
      return {
        type: 'validation',
        message: 'Ошибка валидации данных',
        details: details,
        code: 'VALIDATION_ERROR'
      };
    }
    
    return {
      type: 'error',
      message: error.response.data.error || 'Некорректные данные',
      code: 'BAD_REQUEST'
    };
  }

  if (error.response.status === 401) {
    return {
      type: 'auth',
      message: customMessages.unauthorized || 'Требуется авторизация',
      code: 'UNAUTHORIZED',
      action: 'redirect_to_login'
    };
  }

  if (error.response.status === 403) {
    return {
      type: 'forbidden',
      message: customMessages.forbidden || 'Недостаточно прав для выполнения этого действия',
      code: 'FORBIDDEN'
    };
  }

  if (error.response.status === 404) {
    return {
      type: 'not_found',
      message: customMessages.notFound || 'Ресурс не найден',
      code: 'NOT_FOUND'
    };
  }

  if (error.response.status === 409) {
    return {
      type: 'conflict',
      message: error.response.data.error || 'Конфликт данных',
      code: 'CONFLICT'
    };
  }

  if (error.response.status >= 500) {
    return {
      type: 'server',
      message: customMessages.server || 'Ошибка сервера. Попробуйте позже.',
      code: 'SERVER_ERROR'
    };
  }

  return {
    type: 'unknown',
    message: error.response.data.error || 'Произошла непредвиденная ошибка',
    code: 'UNKNOWN_ERROR'
  };
};

export default handleApiError;