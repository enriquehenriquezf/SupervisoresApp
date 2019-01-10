/**
 * url de la api
 * @example: localhost: 192.168.1.4 | public: 200.116.66.129
 */
var baseUrl ='http://192.168.1.4';// Servidor Privada
//var baseUrl ='http://200.116.66.129'; // Servidor Publica
//var baseUrl2 ='http://192.168.1.185';//cudris
//var baseUrl3 ='http://192.168.1.136';//ronaldo
export const api = {
 ipLogin : baseUrl + "/supervisores_api/public/api/login",
 ipLogout : baseUrl + "/supervisores_api/public/api/logout",
 ipHome : baseUrl + "/supervisores_api/public/api/homeSupervisor",
 ipHomeCompletados : baseUrl + "/supervisores_api/public/api/actividades_completas",
 ipShowActivities : baseUrl + "/supervisores_api/public/api/mostrarActividades",
 ipActivity : baseUrl + "/supervisores_api/public/api/actividad",
 ipDescripcion : baseUrl + "/supervisores_api/public/api/descripcionActividad",
 ipChangePassword : baseUrl + "/supervisores_api/public/api/changePass",
 ipVerify : baseUrl + "/supervisores_api/public/api/verifyPass",
 ipImg: baseUrl + "/supervisores_api/storage/app/public/img/",
}