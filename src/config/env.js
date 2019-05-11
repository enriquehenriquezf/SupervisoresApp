import {Constants} from 'expo';

/**
 * url de la api
 * @example: localhost: 192.168.1.4 | public: 200.116.66.129
 */
var devUrl ='http://192.168.1.136';//Ronaldo
var stagingUrl ='http://sistemas.binar10.co';// Servidor Privada http://sistemas.binar10.co
var prodUrl ='http://31.220.60.151'; // Servidor Publica
var port = '8000';

const ENV = {
    dev: {
        apiUrl: devUrl,
        port: port,
    },
    staging: {
        apiUrl: stagingUrl,
        port: port,
    },
    prod: {
        apiUrl: prodUrl,
        port: port,
    }
  }
  
  /**
   * Obtiene las Environment variables
   * @param {String} env canal de release de la app
   */
  function getEnvVars(env = '') {
    if (env === null || env === undefined || env === '' || __DEV__) return ENV.dev
    if (env.indexOf('dev') !== -1) return ENV.dev
    if (env.indexOf('staging') !== -1) return ENV.staging
    if (env.indexOf('default') !== -1) return ENV.prod
    if (env.indexOf('prod') !== -1) return ENV.prod
  }
  
  
  export default getEnvVars(Constants.manifest.releaseChannel)