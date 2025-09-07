export const API_ROUTES = {
  // Auth endpoints
  LOGIN: '/loginUsuario',
  REGISTER: '/registroUsuario',
  CONFIRM_EMAIL: '/confirm-email',

  // Products endpoints
  CREAR_PRODUCTO: '/crearProducto',
  ELIMINAR_PRODUCTO: '/eliminarProducto',
  ACTUALIZAR_DESCRIPCION_PRODUCTO: '/actualizarDescripcionProducto',
  ACTUALIZAR_IMAGEN_PRODUCTO: '/actualizarImagenProducto',
  OBTENER_PRODUCTOS: '/obtenerProductos',
  OBTENER_PRODUCTO: '/obtenerProducto',
  OBTENER_INSUMOS_PRODUCTO: '/obtenerInsumosDelProducto',
  OBTENER_MOVIMIENTOS: '/obtenerMovimientos',

  // Legacy/Generic endpoints
  SALES: '/sales',
  STOCK_MOVEMENTS: '/stock-movements',
  RESUMEN: '/resumen',

  // Contacts/Customers endpoints
  CUSTOMERS: '/customers',
  CONTACTOS: '/contactos',

  // Budget endpoints
  CREAR_PRESUPUESTO: '/crearPresupuesto',

  // Supplies endpoints
  ALTA_PERFIL: '/altaPerfil',
  ALTA_VIDRIO: '/altaVidrio',
  ALTA_ACCESORIO: '/altaAccesorio',
  BAJA_INSUMO: '/bajaInsumo',
  EDITAR_DESCRIPCION_INSUMO: '/editarDescripcionInsumo',
  EDITAR_PRECIO_INSUMO: '/editarPrecioInsumo',
  EDITAR_IMAGEN_INSUMO: '/editarImagenInsumo',
  INSUMOS: '/insumos',

  // Stock endpoints
  VER_MOVIMIENTOS_STOCK: '/verMovimientosStock',
  STOCK: {
    MOVEMENTS: '/stock/movements'
  }
} as const;

export type ApiRoute = typeof API_ROUTES[keyof typeof API_ROUTES];