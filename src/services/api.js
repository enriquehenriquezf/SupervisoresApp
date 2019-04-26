import getEnvVars from '../config/env';

/**
 * url de la api
 */
var ENV = getEnvVars;
var port = ENV.port;
var baseUrl = ENV.apiUrl;

export const api = {
 ipLogin : baseUrl + "/supervisores_api/public/api/login",
 ipLogout : baseUrl + "/supervisores_api/public/api/logout",
 ipProfileUser : baseUrl + "/supervisores_api/public/api/profileUser",
 ipHome : baseUrl + "/supervisores_api/public/api/homeSupervisor",
 ipHomeCompletados : baseUrl + "/supervisores_api/public/api/actividades_completas",
 ipShowActivities : baseUrl + "/supervisores_api/public/api/mostrarActividades",
 ipActivity : baseUrl + "/supervisores_api/public/api/actividad",
 ipDescripcion : baseUrl + "/supervisores_api/public/api/descripcionActividad",
 ipChangePassword : baseUrl + "/supervisores_api/public/api/changePass",
 ipVerify : baseUrl + "/supervisores_api/public/api/verifyPass",
 ipImg: baseUrl + "/supervisores_api/storage/app/public/img/",
 ipIcons: baseUrl + "/supervisores_api/storage/app/public/icons/",
 ipBuscarProducto: baseUrl + "/supervisores_api/public/api/searchProducts",
 ipBuscarLaboratorio: baseUrl + "/supervisores_api/public/api/searchLaboratories",
 ipListarDocumentacion: baseUrl + "/supervisores_api/public/api/listarDocumentacion",
 ipAccederDocumento: baseUrl + "/supervisores_api/public/api/accederDocumento",
 ipTerminarDocumento: baseUrl + "/supervisores_api/public/api/terminarDocumento",
 ipListarCondiciones: baseUrl + "/supervisores_api/public/api/listarCondicionesLocativas",
 ipAccederCondicion: baseUrl + "/supervisores_api/public/api/accederCondicion",
 ipTerminarCondicion: baseUrl + "/supervisores_api/public/api/terminarCondicionesLocativas",
 ipPorcentajeActividades: baseUrl + "/supervisores_api/public/api/porcentajeActividades",
 ipObtenerReporteSucursal: baseUrl + "/supervisores_api/public/api/obtenerReporteSucursal",
 ipReporteSupervisor: baseUrl + "/supervisores_api/public/api/reporteSupervisor",
 ipDetalleRepSucursal: baseUrl + "/supervisores_api/public/api/detalleRepSucursal",
 ipEnviarMensajeReporte: baseUrl + "/supervisores_api/public/api/enviarMensajeReporte",
 ipBuscarSucursales: baseUrl + "/supervisores_api/public/api/searchSucursales",
 ipLogNotificacionesUsuario: baseUrl + "/supervisores_api/public/api/logNotificacionesUsuario",
 ipNotificacionLeidaMensaje: baseUrl + "/supervisores_api/public/api/notificacionLeidaMensaje",
 ipSoporteTecnico: baseUrl + "/supervisores_api/public/api/soporteTecnico",
 ipLogErrors: baseUrl + "/supervisores_api/public/api/logErrors",
 ipEmpleadosSucursal: baseUrl + "/supervisores_api/public/api/empleadosSucursal", 
 ipSenalizacion: baseUrl + "/supervisores_api/public/api/senalizacion", 
 ipOcultarReporte: baseUrl + "/supervisores_api/public/api/ocultarReporte",
 ipTipoReporteList: baseUrl + "/supervisores_api/public/api/tipoReporteList",
 ipCoordinadoresList: baseUrl + "/supervisores_api/public/api/coordinadoresList",
}