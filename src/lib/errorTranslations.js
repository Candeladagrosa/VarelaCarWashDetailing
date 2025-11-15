import i18n from '@/i18n';

/**
 * Traduce mensajes de error comunes de Supabase usando i18n
 * @param {string} errorMessage - Mensaje de error en inglés
 * @param {string} errorCode - Código de error de Supabase (opcional)
 * @returns {string} Mensaje traducido al español
 */
export const translateSupabaseError = (errorMessage, errorCode = null) => {
  if (!errorMessage) return i18n.t('errors.generic.unexpectedError');

  const message = errorMessage.toLowerCase();

  // Mapeo de códigos de error a claves de i18n
  const errorCodeMap = {
    '23505': 'errors.database.recordExists',
    '23503': 'errors.database.referenceError',
    '42501': 'errors.database.permissionDenied',
    'invalid_credentials': 'errors.auth.invalidCredentials',
    'email_not_confirmed': 'errors.auth.emailNotConfirmed',
    'user_already_registered': 'errors.auth.userAlreadyRegistered',
    'weak_password': 'errors.auth.weakPassword',
  };

  // Si hay un código de error específico, usarlo primero
  if (errorCode && errorCodeMap[errorCode]) {
    return i18n.t(errorCodeMap[errorCode]);
  }

  // Mapeo de mensajes a claves de i18n
  const messageMap = {
    'invalid login credentials': 'errors.auth.invalidCredentials',
    'email not confirmed': 'errors.auth.emailNotConfirmed',
    'user already registered': 'errors.auth.userAlreadyRegistered',
    'user not found': 'errors.auth.userNotFound',
    'invalid email': 'errors.auth.invalidEmail',
    'email already exists': 'errors.auth.emailAlreadyExists',
    'invalid password': 'errors.auth.invalidPassword',
    'weak password': 'errors.auth.weakPassword',
    'new password should be different': 'errors.auth.passwordMustBeDifferent',
    'password should be different': 'errors.auth.passwordMustBeDifferent',
    'email rate limit exceeded': 'errors.auth.emailRateLimit',
    'signup disabled': 'errors.auth.signupDisabled',
    'invalid refresh token': 'errors.auth.invalidRefreshToken',
    'refresh token not found': 'errors.auth.tokenNotFound',
    'invalid or expired jwt': 'errors.auth.invalidJwt',
    'user banned': 'errors.auth.userBanned',
    'duplicate key value': 'errors.database.duplicateKey',
    'violates foreign key constraint': 'errors.database.foreignKeyViolation',
    'violates not-null constraint': 'errors.database.notNullViolation',
    'violates check constraint': 'errors.database.checkConstraintViolation',
    'permission denied': 'errors.database.permissionDenied',
    'insufficient privilege': 'errors.database.insufficientPrivilege',
    'failed to fetch': 'errors.network.failedToFetch',
    'network request failed': 'errors.network.networkRequestFailed',
    'timeout': 'errors.network.timeout',
    'invalid input': 'errors.validation.invalidInput',
    'must be a valid email': 'errors.validation.validEmail',
    'value too long': 'errors.validation.valueTooLong',
    'value too short': 'errors.validation.valueTooShort',
    'not found': 'errors.generic.notFound',
    'unauthorized': 'errors.generic.unauthorized',
    'forbidden': 'errors.generic.forbidden',
    'bad request': 'errors.generic.badRequest',
    'internal server error': 'errors.generic.internalServerError',
    'service unavailable': 'errors.generic.serviceUnavailable',
    'policy violation': 'errors.database.policyViolation',
    'something went wrong': 'errors.generic.somethingWentWrong',
    'unknown error': 'errors.generic.unknownError',
  };

  // Buscar traducción por coincidencia parcial
  for (const [key, i18nKey] of Object.entries(messageMap)) {
    if (message.includes(key)) {
      return i18n.t(i18nKey);
    }
  }

  // Patrones específicos
  if (message.includes('email') && message.includes('already')) {
    return i18n.t('errors.auth.emailAlreadyExists');
  }

  if (message.includes('password') && (message.includes('weak') || message.includes('strong'))) {
    return i18n.t('errors.auth.weakPassword');
  }

  if (message.includes('rate limit')) {
    return i18n.t('errors.auth.emailRateLimit');
  }

  if (message.includes('token') && (message.includes('expired') || message.includes('invalid'))) {
    return i18n.t('errors.auth.invalidRefreshToken');
  }

  // Si no encuentra traducción, devolver el mensaje original
  return errorMessage;
};

/**
 * Obtiene un mensaje de error formateado y traducido desde un error de Supabase
 * @param {Object} error - Objeto de error de Supabase
 * @returns {Object} { title: string, description: string }
 */
export const getSupabaseErrorMessage = (error) => {
  if (!error) {
    return {
      title: 'Error',
      description: 'Ha ocurrido un error inesperado',
    };
  }

  // Extraer información del error
  const message = error.message || error.msg || '';
  const code = error.code || error.error_code || null;
  const hint = error.hint || '';
  const details = error.details || '';

  // Traducir el mensaje principal
  const translatedMessage = translateSupabaseError(message, code);

  // Determinar el título según el tipo de error usando i18n
  let title = i18n.t('errors.titles.error');
  
  if (code === '23505' || message.includes('duplicate')) {
    title = i18n.t('errors.titles.duplicateRecord');
  } else if (code === '23503' || message.includes('foreign key')) {
    title = i18n.t('errors.titles.referenceError');
  } else if (code === '42501' || message.includes('permission') || message.includes('unauthorized')) {
    title = i18n.t('errors.titles.permissionDenied');
  } else if (message.includes('login') || message.includes('credentials')) {
    title = i18n.t('errors.titles.authError');
  } else if (message.includes('network') || message.includes('fetch')) {
    title = i18n.t('errors.titles.connectionError');
  } else if (message.includes('validation') || message.includes('invalid')) {
    title = i18n.t('errors.titles.validationError');
  }

  return {
    title,
    description: translatedMessage,
  };
};
