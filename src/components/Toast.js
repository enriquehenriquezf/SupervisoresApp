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
  };