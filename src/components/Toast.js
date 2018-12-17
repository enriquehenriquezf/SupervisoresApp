import {Toast} from 'native-base';
export const toastr = {
    /***
     * Mostrar Toast en la parte de abajo durante 3 segundos con un mensaje y tipo especifico
     * @param {String} message mensaje a mostrar en el Toast
     * @param {String} tipo tipo de Toast (success,warning,danger)
     */
    showToast: (message,tipo) => {
      Toast.show({
        text: message,
        duration: 3000,
        buttonText: "Ok",
        type: tipo
      });
    },
    /***
     * Mostrar Toast en la parte de abajo durante 3 segundos con un mensaje y tipo especifico
     * @param {String} message mensaje a mostrar en el Toast
     * @param {String} tipo tipo de Toast (success,warning,danger)
     * @param {int} time duración del Toast en ms
     * @param {String} pos posición del Toast ("top" | "bottom") 
     */
    showToast2: (message,tipo,time,pos) => {
      Toast.show({
        text: message,
        duration: time,
        position: pos,
        buttonText: "Ok",
        type: tipo
      });
    },
  };