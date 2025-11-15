import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Traducciones en español
const resources = {
  es: {
    translation: {
      // Navegación
      nav: {
        home: 'Inicio',
        services: 'Servicios',
        products: 'Productos',
        cart: 'Carrito',
        profile: 'Perfil',
        history: 'Historial',
        admin: 'Administración',
        login: 'Iniciar Sesión',
        register: 'Registrarse',
        logout: 'Cerrar Sesión',
      },

      // Autenticación
      auth: {
        login: {
          title: 'Iniciar Sesión',
          subtitle: 'Accede a tu cuenta para continuar',
          email: 'Email',
          password: 'Contraseña',
          forgotPassword: '¿Olvidaste tu contraseña?',
          submit: 'Iniciar Sesión',
          submitting: 'Iniciando...',
          noAccount: '¿No tienes cuenta?',
          registerHere: 'Regístrate aquí',
        },
        register: {
          title: 'Crear Cuenta',
          subtitle: 'Únete a nuestra comunidad',
          name: 'Nombre',
          lastName: 'Apellido',
          dni: 'DNI',
          phone: 'Teléfono',
          email: 'Email',
          password: 'Contraseña',
          confirmPassword: 'Confirmar Contraseña',
          submit: 'Crear Cuenta',
          submitting: 'Creando cuenta...',
          hasAccount: '¿Ya tienes cuenta?',
          loginHere: 'Inicia sesión aquí',
          success: '¡Registro Exitoso! 🎉',
          successDescription: 'Tu cuenta ha sido creada correctamente. Por favor, verifica tu email para activarla.',
        },
        forgotPassword: {
          title: '¿Olvidaste tu Contraseña?',
          subtitle: 'Ingresa tu email y te enviaremos un enlace para recuperarla',
          submit: 'Enviar Enlace de Recuperación',
          submitting: 'Enviando...',
          backToLogin: 'Volver al Inicio de Sesión',
          emailSent: '¡Email Enviado!',
          emailSentDescription: 'Hemos enviado un enlace de recuperación a',
          nextSteps: 'Próximos pasos:',
          step1: 'Revisa tu bandeja de entrada',
          step2: 'Haz clic en el enlace del correo',
          step3: 'Establece tu nueva contraseña',
          checkSpam: 'Si no recibes el correo en unos minutos, revisa tu carpeta de spam.',
          requestProcessed: 'Solicitud procesada',
          requestProcessedDescription: 'Si el email está registrado, recibirás un enlace de recuperación.',
        },
        resetPassword: {
          title: 'Nueva Contraseña',
          subtitle: 'Establece una contraseña segura para tu cuenta',
          newPassword: 'Nueva Contraseña',
          confirmPassword: 'Confirmar Contraseña',
          submit: 'Restablecer Contraseña',
          submitting: 'Actualizando...',
          invalidLink: 'Enlace Inválido o Expirado',
          invalidLinkDescription: 'El enlace de recuperación no es válido o ha expirado. Por favor, solicita uno nuevo.',
          requestNewLink: 'Solicitar Nuevo Enlace',
          verifyingLink: 'Verificando enlace...',
          passwordUpdated: '¡Contraseña actualizada!',
          passwordUpdatedDescription: 'Tu contraseña ha sido actualizada exitosamente.',
        },
        passwordRequirements: {
          title: 'La contraseña debe contener:',
          minLength: 'Mínimo 8 caracteres',
          uppercase: 'Al menos una letra mayúscula',
          lowercase: 'Al menos una letra minúscula',
          number: 'Al menos un número',
          special: 'Al menos un carácter especial (!@#$%^&*)',
        },
        passwordMatch: {
          mismatch: 'Las contraseñas no coinciden',
          match: 'Las contraseñas coinciden',
        },
        validation: {
          invalidPassword: 'Contraseña inválida',
          invalidPasswordDescription: 'La contraseña no cumple con los requisitos de seguridad',
          passwordsMismatch: 'Las contraseñas no coinciden',
          passwordsMismatchDescription: 'Por favor verifica que ambas contraseñas sean iguales',
        },
      },

      // Errores de Supabase traducidos
      errors: {
        auth: {
          invalidCredentials: 'Credenciales de inicio de sesión inválidas',
          emailNotConfirmed: 'El correo electrónico no ha sido confirmado',
          userAlreadyRegistered: 'El usuario ya está registrado',
          userNotFound: 'Usuario no encontrado',
          invalidEmail: 'Correo electrónico inválido',
          emailAlreadyExists: 'Este correo electrónico ya está registrado',
          invalidPassword: 'Contraseña inválida',
          weakPassword: 'La contraseña es demasiado débil',
          passwordMustBeDifferent: 'La nueva contraseña debe ser diferente a la contraseña anterior',
          emailRateLimit: 'Se ha excedido el límite de envíos de correo. Intenta más tarde',
          signupDisabled: 'El registro está deshabilitado temporalmente',
          invalidRefreshToken: 'Token de sesión inválido. Por favor, inicia sesión nuevamente',
          tokenNotFound: 'Sesión expirada. Por favor, inicia sesión nuevamente',
          invalidJwt: 'Sesión expirada. Por favor, inicia sesión nuevamente',
          userBanned: 'Este usuario ha sido suspendido',
        },
        database: {
          duplicateKey: 'Este registro ya existe',
          foreignKeyViolation: 'No se puede completar la operación debido a restricciones de datos',
          notNullViolation: 'Faltan datos requeridos',
          checkConstraintViolation: 'Los datos no cumplen con las restricciones de validación',
          permissionDenied: 'No tienes permisos para realizar esta acción',
          insufficientPrivilege: 'Permisos insuficientes',
          policyViolation: 'Violación de políticas de seguridad',
          recordExists: 'Este registro ya existe en el sistema',
          referenceError: 'Referencia a un registro inexistente',
        },
        network: {
          failedToFetch: 'Error de conexión. Verifica tu conexión a internet',
          networkRequestFailed: 'Error de red. Verifica tu conexión a internet',
          timeout: 'La solicitud ha tardado demasiado. Intenta nuevamente',
        },
        validation: {
          invalidInput: 'Entrada inválida',
          validEmail: 'Debe ser un correo electrónico válido',
          valueTooLong: 'El valor es demasiado largo',
          valueTooShort: 'El valor es demasiado corto',
        },
        generic: {
          notFound: 'No encontrado',
          unauthorized: 'No autorizado',
          forbidden: 'Prohibido',
          badRequest: 'Solicitud incorrecta',
          internalServerError: 'Error interno del servidor',
          serviceUnavailable: 'Servicio no disponible temporalmente',
          somethingWentWrong: 'Algo salió mal',
          unknownError: 'Error desconocido',
          unexpectedError: 'Ha ocurrido un error inesperado',
        },
        titles: {
          error: 'Error',
          authError: 'Error de Autenticación',
          duplicateRecord: 'Registro Duplicado',
          referenceError: 'Error de Referencia',
          permissionDenied: 'Permiso Denegado',
          connectionError: 'Error de Conexión',
          validationError: 'Error de Validación',
        },
      },

      // Mensajes comunes
      common: {
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        create: 'Crear',
        update: 'Actualizar',
        loading: 'Cargando...',
        search: 'Buscar',
        filter: 'Filtrar',
        export: 'Exportar',
        import: 'Importar',
        close: 'Cerrar',
        confirm: 'Confirmar',
        yes: 'Sí',
        no: 'No',
        back: 'Volver',
        next: 'Siguiente',
        previous: 'Anterior',
        submit: 'Enviar',
        clear: 'Limpiar',
      },

      // Servicios
      services: {
        title: 'Servicios',
        newService: 'Nuevo Servicio',
        editService: 'Editar Servicio',
        searchServices: 'Buscar servicios...',
        addService: 'Agregar Servicio',
        updateService: 'Actualizar Servicio',
        deleteService: 'Eliminar Servicio',
        
        fields: {
          name: 'Nombre del Servicio',
          description: 'Descripción',
          price: 'Precio',
          image: 'Imagen del Servicio',
          imagePreview: 'Vista previa:',
        },
        
        placeholders: {
          name: 'Ej: Lavado Premium',
          description: 'Describe el servicio',
          price: '0,00',
        },
        
        hints: {
          price: 'Ingrese el precio sin puntos de miles, use coma (,) para decimales. Ej: 1500,50',
          image: 'Formato: JPG, PNG, GIF. Tamaño máximo: 5MB',
        },
        
        validation: {
          nameRequired: 'El nombre del servicio es obligatorio',
          nameMaxLength: 'El nombre no puede superar los 100 caracteres',
          descriptionMaxLength: 'La descripción no puede superar los 255 caracteres',
          priceRequired: 'El precio es obligatorio',
          pricePositive: 'El precio debe ser mayor a 0',
          priceInvalid: 'El precio ingresado no es válido. Use formato: 1500,50',
          priceTooLarge: 'El precio es demasiado grande. Máximo permitido: 999.999.999,99',
          priceDecimalPlaces: 'El precio no puede tener más de 2 decimales',
          imageFormat: 'Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF)',
          imageSize: 'La imagen no debe superar los 5MB',
          completeRequired: 'Complete todos los campos obligatorios',
        },
        
        messages: {
          adding: 'Agregando...',
          saving: 'Guardando...',
          added: '¡Servicio Agregado!',
          addedDescription: 'El servicio ha sido creado exitosamente',
          updated: '¡Servicio Actualizado!',
          updatedDescription: 'El servicio ha sido actualizado correctamente',
          deleted: 'Servicio Eliminado',
          deletedDescription: 'El servicio ha sido eliminado del sistema',
          visibilityChanged: 'Visibilidad Actualizada',
          visibilityChangedDescription: 'La visibilidad del servicio ha sido modificada',
          uploadError: 'Error al Subir Imagen',
          uploadErrorDescription: 'No se pudo subir la imagen al servidor',
          loadError: 'Error al Cargar',
          loadErrorDescription: 'No se pudieron cargar los servicios',
        },
        
        visible: 'Visible',
        hidden: 'Oculto',
      },

      // Turnos
      bookings: {
        title: 'Reservar Turno',
        selectDate: 'Selecciona una Fecha',
        selectTime: 'Selecciona una Hora',
        confirm: 'Confirmar Reserva',
        cancel: 'Cancelar',
        
        validation: {
          dateRequired: 'Debe seleccionar una fecha',
          timeRequired: 'Debe seleccionar una hora',
          pastDateTime: 'No puede reservar turnos para fechas u horas anteriores al momento actual',
          slotTaken: 'Ya existe una reserva para esta fecha y hora. Por favor, seleccione otro horario',
          loginRequired: 'Debe iniciar sesión para reservar un turno',
        },
        
        messages: {
          success: '¡Turno Reservado!',
          successDescription: 'Tu turno ha sido confirmado exitosamente',
          error: 'Error al Reservar',
          errorDescription: 'No se pudo crear la reserva. Intenta nuevamente',
        },
      },

      // Productos
      products: {
        title: 'Productos',
        newProduct: 'Nuevo Producto',
        editProduct: 'Editar Producto',
        searchProducts: 'Buscar productos...',
        addProduct: 'Agregar Producto',
        updateProduct: 'Actualizar Producto',
        deleteProduct: 'Eliminar Producto',
        
        fields: {
          name: 'Nombre del Producto',
          description: 'Descripción',
          price: 'Precio',
          stock: 'Stock',
          image: 'Imagen del Producto',
          imagePreview: 'Vista previa:',
        },
        
        placeholders: {
          name: 'Ej: Shampoo Premium',
          description: 'Describe el producto',
          price: '0,00',
          stock: '0',
        },
        
        hints: {
          price: 'Ingrese el precio sin puntos de miles, use coma (,) para decimales. Ej: 1500,50',
          stock: 'Cantidad disponible en inventario',
          image: 'Formato: JPG, PNG, GIF. Tamaño máximo: 5MB',
        },
        
        validation: {
          nameRequired: 'El nombre del producto es obligatorio',
          nameMaxLength: 'El nombre no puede superar los 100 caracteres',
          descriptionMaxLength: 'La descripción no puede superar los 255 caracteres',
          priceRequired: 'El precio es obligatorio',
          pricePositive: 'El precio debe ser mayor a 0',
          priceInvalid: 'El precio ingresado no es válido. Use formato: 1500,50',
          priceTooLarge: 'El precio es demasiado grande. Máximo permitido: 999.999.999,99',
          priceDecimalPlaces: 'El precio no puede tener más de 2 decimales',
          stockRequired: 'El stock es obligatorio',
          stockNonNegative: 'El stock no puede ser negativo',
          stockInvalid: 'El stock debe ser un número entero válido',
          stockTooLarge: 'El stock es demasiado grande. Máximo: 2.147.483.647',
          imageFormat: 'Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF)',
          imageSize: 'La imagen no debe superar los 5MB',
          completeRequired: 'Complete todos los campos obligatorios',
        },
        
        messages: {
          adding: 'Agregando...',
          saving: 'Guardando...',
          added: '¡Producto Agregado!',
          addedDescription: 'El producto ha sido creado exitosamente',
          updated: '¡Producto Actualizado!',
          updatedDescription: 'El producto ha sido actualizado correctamente',
          deleted: 'Producto Eliminado',
          deletedDescription: 'El producto ha sido desactivado del sistema',
          visibilityChanged: 'Visibilidad Actualizada',
          visibilityChangedDescription: 'La visibilidad del producto ha sido modificada',
          uploadError: 'Error al Subir Imagen',
          uploadErrorDescription: 'No se pudo subir la imagen al servidor',
          loadError: 'Error al Cargar',
          loadErrorDescription: 'No se pudieron cargar los productos',
        },
        
        stock: 'Stock:',
        visible: 'Visible',
        hidden: 'Oculto',
      },
    },
  },
  en: {
    translation: {
      // Aquí puedes agregar traducciones en inglés si lo deseas
      nav: {
        home: 'Home',
        services: 'Services',
        products: 'Products',
        cart: 'Cart',
        profile: 'Profile',
        history: 'History',
        admin: 'Administration',
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
      },
      // ... más traducciones en inglés
    },
  },
};

i18n
  .use(LanguageDetector) // Detecta el idioma del navegador
  .use(initReactI18next) // Pasa i18n a react-i18next
  .init({
    resources,
    fallbackLng: 'es', // Idioma por defecto
    lng: 'es', // Idioma inicial
    debug: false, // Cambiar a true para debugging

    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },

    // Opciones del detector de idioma
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
