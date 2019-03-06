import { api } from "../services/api";

export const logError = {
    /***
     * Enviar errores del servidor a un log en la DB
     * @param {String} header Header del error
     * @param {String} body cuerpo del error
     * @param {String} auth token de autenticación
     */
    sendError: (header,body,auth) => {
        console.log(JSON.parse(header));
        console.log(JSON.parse(body));
        fetch(api.ipLogErrors, {
            method: 'POST',
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json',
                'Accept':'application/json'
            },
            body: JSON.stringify({
                header: header,
                body: body,
                tipo_usuario: 1,
            })
            }).then(function(response) {
                //console.log(response);
                newToken = JSON.parse(response._bodyInit);
                var message = "message";
                if(response.ok === true && response.status === 200)
                {
                    //toastr.showToast(newToken[message],'success');
                }
                else
                {
                    //console.log(response);
                    if(response.status === 500){
                        //toastr.showToast('Error con el servidor','danger');
                    }
                    else if(response.status === 401){
                        //toastr.showToast('Su sesión expiró','danger');
                    }
                    else{
                        //toastr.showToast(newToken[message],'warning');
                    }
                }
        }).catch(function(error){
            //toastr.showToast('Su sesión expiró','danger');
            console.log(error);
        });
    },
  };