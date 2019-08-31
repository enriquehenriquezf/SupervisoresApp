/**
 * @author Enrique Henriquez Figueroa
 * @copyright Binar10
 */
import * as Expo from 'expo';
import React, { Component } from 'react';
import {toastr} from '../components/Toast';
import { Container, Body, Content, Form, Item, Input,Text, Button, Spinner, CheckBox, ListItem } from 'native-base';
import {View, Dimensions, KeyboardAvoidingView, AsyncStorage, Platform, Image,AppState, Alert,WebView,Linking,Modal } from 'react-native';
import styles from '../styles/Login';
import {api} from '../services/api';
import {Imagen} from '../components/Imagenes';
import { COLOR } from '../components/Colores';
import Overlay from 'react-native-modal-overlay';
import { logError } from '../components/logError';

let fail = 0;
let swChange = false;
let consola = '';
export default class Login extends Component {
  // email de prueba: programador6@binar10.co    pass de prueba: 123456
  constructor(props) {
    super(props);
    this.state = {
      email: '', 
      password: '',
      loading: true,
      updating:false,
      error:null,
      checked:true,
      estado:true,
      privacidad:'0',
      tutorial:'0',
      isVisiblePrivacidad:false,
      isVisibleTerminos:false,
      isPrivacidad:true,
      politicas: [
                      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"> <HTML> <HEAD> <META HTTP-EQUIV="CONTENT-TYPE" CONTENT="text/html; charset=utf-8"> <TITLE></TITLE> <META NAME="GENERATOR" CONTENT="LibreOffice 4.1.6.2 (Linux)"> <META NAME="AUTHOR" CONTENT="Usuario de Windows"> <META NAME="CREATED" CONTENT="20190403;203300000000000"> <META NAME="CHANGEDBY" CONTENT="Enrique Henriquez"> <META NAME="CHANGED" CONTENT="20190403;203300000000000"> <META NAME="AppVersion" CONTENT="16.0000"> <META NAME="DocSecurity" CONTENT="0"> <META NAME="HyperlinksChanged" CONTENT="false"> <META NAME="LinksUpToDate" CONTENT="false"> <META NAME="ScaleCrop" CONTENT="false"> <META NAME="ShareDoc" CONTENT="false"> <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"> <STYLE TYPE="text/css"> <!-- @page { size: 8.5in 11in; margin-left: 1.18in; margin-right: 1.18in; margin-top: 0.98in; margin-bottom: 0.98in } P { margin-bottom: 0.08in; direction: ltr; line-height: 115%; widows: 2; orphans: 2 } --> </STYLE> </HEAD> <BODY LANG="es-CO" DIR="LTR"> <P ALIGN=CENTER STYLE="margin-bottom: 0.14in"><FONT FACE="Arial, serif"><I><B>AUTORIZACIÓN TRATAMIENTO, PROTECCION, USO DE DATOS PERSONALES, HABEAS DATA Y CONFIDENCIALIDAD DE LA INFORMACIÓN.</B></I></FONT></P> <P ALIGN=JUSTIFY STYLE="margin-bottom: 0.14in"> <FONT FACE="Arial, serif"><I>Con el registro de sus datos personales en esta aplicación, usted está manifestando su consentimiento libre, expreso e informado, en los términos de la Ley de Protección de Datos Personales en la República de Colombia (Ley 1581 de 2012 y demás normas complementarias.), para que Unidrogas S.A, almacene, administre y utilice los datos suministrados por Usted en una base de datos de su propiedad, la cual tiene como finalidad enviarle información relacionada y/o en conexión con encuestas de opinión, estadísticas, eventos, páginas web, ofertas de nuestros productos o cualquier otra información relacionada con temas salud y bienestar. Asimismo, Usted declara expresamente que la finalidad de la utilización de sus datos personales, le ha sido plenamente informada</I></FONT></P> </BODY> </HTML>',
                      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"> <HTML> <HEAD> <META HTTP-EQUIV="CONTENT-TYPE" CONTENT="text/html; charset=utf-8"> <TITLE></TITLE> <META NAME="GENERATOR" CONTENT="LibreOffice 4.1.6.2 (Linux)"> <META NAME="AUTHOR" CONTENT="Usuario de Windows"> <META NAME="CREATED" CONTENT="20190403;203500000000000"> <META NAME="CHANGEDBY" CONTENT="Enrique Henriquez"> <META NAME="CHANGED" CONTENT="20190403;203500000000000"> <META NAME="AppVersion" CONTENT="16.0000"> <META NAME="DocSecurity" CONTENT="0"> <META NAME="HyperlinksChanged" CONTENT="false"> <META NAME="LinksUpToDate" CONTENT="false"> <META NAME="ScaleCrop" CONTENT="false"> <META NAME="ShareDoc" CONTENT="false"> <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"> <STYLE TYPE="text/css"> <!-- @page { size: 8.5in 11in; margin-left: 1.18in; margin-right: 1.18in; margin-top: 0.98in; margin-bottom: 0.98in } P { margin-bottom: 0.08in; direction: ltr; line-height: 115%; widows: 2; orphans: 2 } --> </STYLE> </HEAD> <BODY LANG="es-CO" DIR="LTR"> <P ALIGN=JUSTIFY STYLE="margin-bottom: 0.14in"><FONT FACE="Arial, serif"><I>y autoriza de modo expreso que sus datos sean compartidos con terceros, debidamente autorizados y entregados conforme a las disposiciones de la ley. Si Usted no está de acuerdo con el contenido de este aviso legal, le solicitamos expresar claramente que no está dispuesto a proporcionar los datos personales requeridos.  El tratamiento se realizará en cumplimiento de lo dispuesto en la política de privacidad la cual puede consultar en nuestra página web http://www.unidrogas.com/</I></FONT></P> <P ALIGN=JUSTIFY STYLE="margin-bottom: 0.14in"><A NAME="_GoBack"></A><FONT FACE="Arial, serif"><I>Para el ejercicio del Habeas Data, el titular del dato personal o quien demuestre un legítimo interés conforme lo señalado en la normatividad vigente, podrá hacerlo a través del siguiente correo electrónico habeasdata@unidrogas.net.co. Quien ejerza el habeas data deberá suministrar con precisión los datos de contacto solicitados para efecto de tramitar, atender y responder su solicitud</I></FONT></P> <P ALIGN=JUSTIFY STYLE="margin-bottom: 0.14in"><BR><BR> </P> </BODY> </HTML>',
                      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"> <HTML> <HEAD> <META HTTP-EQUIV="CONTENT-TYPE" CONTENT="text/html; charset=utf-8"> <TITLE></TITLE> <META NAME="GENERATOR" CONTENT="LibreOffice 4.1.6.2 (Linux)"> <META NAME="AUTHOR" CONTENT="Usuario de Windows"> <META NAME="CREATED" CONTENT="20190403;203500000000000"> <META NAME="CHANGEDBY" CONTENT="Enrique Henriquez"> <META NAME="CHANGED" CONTENT="20190403;203500000000000"> <META NAME="AppVersion" CONTENT="16.0000"> <META NAME="DocSecurity" CONTENT="0"> <META NAME="HyperlinksChanged" CONTENT="false"> <META NAME="LinksUpToDate" CONTENT="false"> <META NAME="ScaleCrop" CONTENT="false"> <META NAME="ShareDoc" CONTENT="false"> <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"> <STYLE TYPE="text/css"> <!-- @page { size: 8.5in 11in; margin-left: 1.18in; margin-right: 1.18in; margin-top: 0.98in; margin-bottom: 0.98in } P { margin-bottom: 0.08in; direction: ltr; line-height: 115%; widows: 2; orphans: 2 } --> </STYLE> </HEAD> <BODY LANG="es-CO" DIR="LTR"> <P ALIGN=JUSTIFY STYLE="margin-bottom: 0.14in"><FONT FACE="Arial, serif"><I>y desplegar las cargas para el ejercicio de sus derechos. Recibida la solicitud de ejercicio de Habeas Data, UNIDROGAS S.A dará respuesta en los términos de ley. </I></FONT> </P> <P ALIGN=JUSTIFY STYLE="margin-bottom: 0.14in"><FONT FACE="Arial, serif"><I>Asimismo declaro reconocer la necesidad de que </I></FONT><FONT FACE="Arial, serif"><I><SPAN STYLE="background: #ffffff">UNIDROGAS S.A.</SPAN></I></FONT><FONT FACE="Arial, serif"><I> realice diversos tipos de tratamiento respecto de los datos personales de sus empleados y del núcleo familiar de estos en relación con las obligaciones, cargas y deberes propios de la relación contractual que tengamos, así sea de naturaleza comercial,  civil o laboral. </I></FONT> </P> <P ALIGN=JUSTIFY STYLE="margin-bottom: 0.14in"><A NAME="_GoBack"></A><FONT FACE="Arial, serif"><I>En virtud de lo anterior, </I></FONT><FONT FACE="Arial, serif"><I><SPAN STYLE="background: #ffffff">UNIDROGAS S.A</SPAN></I></FONT><FONT FACE="Arial, serif"><I> podrá almacenar, conservar, analizar, investigar, trasmitir, cruzar, depurar, comunicar, compartir, informar, auditar, usar, monitorear y recolectar datos personales e información personal de sus empleados, así como evidencia y logos o rastros de navegación respecto de las actividades realizadas por sus empleados en los sistemas de información y redes,</I></FONT></P> <P ALIGN=JUSTIFY STYLE="margin-bottom: 0.14in"><BR><BR> </P> </BODY> </HTML>',
                      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"> <HTML> <HEAD> <META HTTP-EQUIV="CONTENT-TYPE" CONTENT="text/html; charset=utf-8"> <TITLE></TITLE> <META NAME="GENERATOR" CONTENT="LibreOffice 4.1.6.2 (Linux)"> <META NAME="AUTHOR" CONTENT="Usuario de Windows"> <META NAME="CREATED" CONTENT="20190403;203800000000000"> <META NAME="CHANGEDBY" CONTENT="Enrique Henriquez"> <META NAME="CHANGED" CONTENT="20190403;203800000000000"> <META NAME="AppVersion" CONTENT="16.0000"> <META NAME="DocSecurity" CONTENT="0"> <META NAME="HyperlinksChanged" CONTENT="false"> <META NAME="LinksUpToDate" CONTENT="false"> <META NAME="ScaleCrop" CONTENT="false"> <META NAME="ShareDoc" CONTENT="false"> <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"> <STYLE TYPE="text/css"> <!-- @page { size: 8.5in 11in; margin-left: 1.18in; margin-right: 1.18in; margin-top: 0.98in; margin-bottom: 0.98in } P { margin-bottom: 0.08in; direction: ltr; line-height: 115%; widows: 2; orphans: 2 } --> </STYLE> </HEAD> <BODY LANG="es-CO" DIR="LTR"> <P ALIGN=JUSTIFY STYLE="margin-bottom: 0.14in"><FONT FACE="Arial, serif"><I>bien se trate de dispositivos propios o de terceros, ubicados dentro o fuera del territorio nacional, con el fin de informarse e informar sobre el cumplimiento de las obligaciones originadas en contratos laborales, comerciales, civiles, obligaciones de ley, órdenes de autoridad competente, desarrollo de estrategias con organismos públicos, privados, sean de orden nacional o internacional. </I></FONT> </P> <P ALIGN=JUSTIFY STYLE="margin-bottom: 0.14in"><FONT FACE="Arial, serif"><I>Asimismo, por medio del presente </I></FONT><FONT FACE="Arial, serif"><I>me comprometo</I></FONT><FONT FACE="Arial, serif"><I> a proteger la información personal de UNIDROGAS S.A. y/o contenida en sus bases de datos, que  se encuentra bajo su custodia y a la cual pueda yo tener acceso y/o conocimiento; Por lo anterior me comprometo a lo siguiente:</I></FONT></P> <OL style="padding-left: 15px;"> <LI><P ALIGN=JUSTIFY STYLE="margin-bottom: 0.14in"><A NAME="_GoBack"></A> <FONT FACE="Arial, serif"><I>Dar confidencialidad a la información personal, empresarial y/o comercial de UNIDROGAS S.A. contenida en las bases de datos de la compañía.</I></FONT><FONT FACE="Arial, serif"><I> </I></FONT> </P> </OL> </BODY> </HTML>',
                      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"> <HTML> <HEAD> <META HTTP-EQUIV="CONTENT-TYPE" CONTENT="text/html; charset=utf-8"> <TITLE></TITLE> <META NAME="GENERATOR" CONTENT="LibreOffice 4.1.6.2 (Linux)"> <META NAME="AUTHOR" CONTENT="Usuario de Windows"> <META NAME="CREATED" CONTENT="20190403;203900000000000"> <META NAME="CHANGEDBY" CONTENT="Enrique Henriquez"> <META NAME="CHANGED" CONTENT="20190403;203900000000000"> <META NAME="AppVersion" CONTENT="16.0000"> <META NAME="DocSecurity" CONTENT="0"> <META NAME="HyperlinksChanged" CONTENT="false"> <META NAME="LinksUpToDate" CONTENT="false"> <META NAME="ScaleCrop" CONTENT="false"> <META NAME="ShareDoc" CONTENT="false"> <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"> <STYLE TYPE="text/css"> <!-- @page { size: 8.5in 11in; margin-left: 1.18in; margin-right: 1.18in; margin-top: 0.98in; margin-bottom: 0.98in } P { margin-bottom: 0.08in; direction: ltr; line-height: 115%; widows: 2; orphans: 2 } --> </STYLE> </HEAD> <BODY LANG="es-CO" DIR="LTR"> <OL START=2 style="padding-left: 15px;"> <LI><P ALIGN=JUSTIFY STYLE="margin-bottom: 0.14in"><FONT FACE="Arial, serif"><I>Dar y mantener el carácter de reservada a la información señalada en el numeral anterior. </I></FONT> </P> <LI><P ALIGN=JUSTIFY STYLE="margin-bottom: 0.14in"><FONT FACE="Arial, serif"><I>Comunicar a quien corresponda, una vez tenga conocimiento de manera directa o a través de las personas mencionadas en la cláusula tercera de este acuerdo, cualquier indicio</I></FONT><FONT COLOR="#ff0000"><FONT FACE="Arial, serif"><I> </I></FONT></FONT><FONT FACE="Arial, serif"><I>o hecho cierto que implique una violación a las medidas de seguridad adoptadas para proteger la información personal o que impliquen un tratamiento inadecuado de estos activos de información o un uso no autorizado de tales. </I></FONT> </P> <LI><P ALIGN=JUSTIFY STYLE="margin-bottom: 0.14in"><A NAME="_GoBack"></A> <FONT FACE="Arial, serif"><I>Colaborar a UNIDROGAS S.A. en lo que se refiera  a las denuncias que se presenten ante las autoridades competentes a las que haya lugar como consecuencia de cualquier conducta considerada como delito a la luz de la ley 1273 de 2009, en especial aquellas que puedan dar lugar a la violación de datos personales.</I></FONT><FONT FACE="Arial, serif"><I> </I></FONT> </P> </OL> </BODY> </HTML>',
                      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"> <HTML> <HEAD> <META HTTP-EQUIV="CONTENT-TYPE" CONTENT="text/html; charset=utf-8"> <TITLE></TITLE> <META NAME="GENERATOR" CONTENT="LibreOffice 4.1.6.2 (Linux)"> <META NAME="AUTHOR" CONTENT="Usuario de Windows"> <META NAME="CREATED" CONTENT="20190403;204000000000000"> <META NAME="CHANGEDBY" CONTENT="Enrique Henriquez"> <META NAME="CHANGED" CONTENT="20190403;204200000000000"> <META NAME="AppVersion" CONTENT="16.0000"> <META NAME="DocSecurity" CONTENT="0"> <META NAME="HyperlinksChanged" CONTENT="false"> <META NAME="LinksUpToDate" CONTENT="false"> <META NAME="ScaleCrop" CONTENT="false"> <META NAME="ShareDoc" CONTENT="false"> <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"> <STYLE TYPE="text/css"> <!-- @page { size: 8.5in 11in; margin-left: 1.18in; margin-right: 1.18in; margin-top: 0.98in; margin-bottom: 0.98in } P { margin-bottom: 0.08in; direction: ltr; line-height: 115%; widows: 2; orphans: 2 } --> </STYLE> </HEAD> <BODY LANG="es-CO" DIR="LTR"> <P ALIGN=JUSTIFY STYLE="margin-bottom: 0.14in"><FONT FACE="Arial, serif"><I>Por lo anterior, reconozco las siguientes prohibiciones que tengo</I></FONT><FONT FACE="Arial, serif"><I>:</I></FONT></P> <OL TYPE=I style="padding-left: 15px;"> <LI><P ALIGN=JUSTIFY STYLE="margin-bottom: 5px;margin-top: 5px;"><FONT FACE="Arial, serif"><I>Usar los datos personales en provecho propio o de un tercero en forma contraria a lo pactado en este contrato. </I></FONT> </P> <LI><P ALIGN=JUSTIFY STYLE="margin-bottom: 5px;margin-top: 5px;"><FONT FACE="Arial, serif"><I>Permitir el acceso a terceros no autorizados.</I></FONT></P> <LI><P ALIGN=JUSTIFY STYLE="margin-bottom: 5px;margin-top: 5px;"><FONT FACE="Arial, serif"><I>Entregar los datos personales, empresariales y/o comerciales a cualquier autoridad sin haber notificado el requerimiento a UNIDROGAS S.A, con el fin de que esta pueda analizar de manera previa la competencia de la autoridad solicitante y la correlación directa de la orden y el hecho objeto de investigación y/o requerimiento. </I></FONT> </P> <LI><P ALIGN=JUSTIFY STYLE="margin-bottom: 5px;margin-top: 5px;"><FONT FACE="Arial, serif"><I>Abstenerse de investigar cualquier incidente de seguridad que comprometa la seguridad de los datos personales de terceros o de otras personas, sin la participación y/o autorización de UNIDROGAS S.A</I></FONT></P> </OL> </BODY> </HTML>',
                      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"> <HTML> <HEAD> <META HTTP-EQUIV="CONTENT-TYPE" CONTENT="text/html; charset=utf-8"> <TITLE></TITLE> <META NAME="GENERATOR" CONTENT="LibreOffice 4.1.6.2 (Linux)"> <META NAME="AUTHOR" CONTENT="Usuario de Windows"> <META NAME="CREATED" CONTENT="20190403;204000000000000"> <META NAME="CHANGEDBY" CONTENT="Enrique Henriquez"> <META NAME="CHANGED" CONTENT="20190403;204000000000000"> <META NAME="AppVersion" CONTENT="16.0000"> <META NAME="DocSecurity" CONTENT="0"> <META NAME="HyperlinksChanged" CONTENT="false"> <META NAME="LinksUpToDate" CONTENT="false"> <META NAME="ScaleCrop" CONTENT="false"> <META NAME="ShareDoc" CONTENT="false"> <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"> <STYLE TYPE="text/css"> <!-- @page { size: 8.5in 11in; margin-left: 1.18in; margin-right: 1.18in; margin-top: 0.98in; margin-bottom: 0.98in } P { margin-bottom: 0.08in; direction: ltr; line-height: 115%; widows: 2; orphans: 2 } --> </STYLE> </HEAD> <BODY LANG="es-CO" DIR="LTR"> <OL TYPE=I style="padding-left: 15px;"> <LI><P ALIGN=JUSTIFY STYLE="margin-bottom: 0.14in"><FONT FACE="Arial, serif"><I>Alterar cualquiera de los atributos de la información personal a la que se accede en razón de este acuerdo. </I></FONT> </P> </OL> <P ALIGN=JUSTIFY STYLE="margin-bottom: 0.14in"><FONT FACE="Arial, serif"><I>En caso de incumplimiento de lo anteriormente expuesto,  a UNIDROGAS S.A en caso de cualquier perjuicio ocasionado por la falta de diligencia, cuidado y prudencia en relación con la protección y/o tratamiento de la información personal a la que accedo sobre la cual debo garantizar la confidencialidad y reserva de la misma, con terceros. Así mismo, seré responsable de cualquier sanción que pudiera imponerse a UNIDROGAS S.A por parte de la SIC como autoridad en materia de protección de datos personales y que derive de mi incumplimiento con la política. </I></FONT> </P> <P ALIGN=JUSTIFY STYLE="margin-bottom: 0.14in"><FONT FACE="Arial, serif"><I>Por lo anterior Acepto En señal de entendimiento y conformidad con los términos aquí contenidos.</I></FONT></P> </BODY> </HTML>',
                    ],
      // politicas: ['AUTORIZACIÓN TRATAMIENTO, PROTECCION, USO DE DATOS PERSONALES, HABEAS DATA Y CONFIDENCIALIDAD DE LA INFORMACIÓN.\n\nCon el registro de sus datos personales en esta aplicación, usted está manifestando su consentimiento libre, expreso e informado, en los términos de la Ley de Protección de Datos Personales en la República de Colombia (Ley 1581 de 2012 y demás normas complementarias.), para que Unidrogas S.A, almacene, administre y utilice los datos suministrados por Usted en una base de datos de su propiedad, la cual tiene como finalidad enviarle información relacionada y/o en conexión con encuestas de opinión, estadísticas, eventos, páginas web, ofertas de nuestros productos o cualquier otra información relacionada con temas salud y bienestar. Asimismo, Usted declara expresamente que la finalidad de la utilización por Puntos Saludables de sus datos personales, le ha sido plenamente informada y ',
      //             'autoriza de modo expreso que sus datos sean compartidos con terceros, debidamente autorizados por Puntos Saludables, y entregados conforme a las disposiciones de la ley. Si Usted no está de acuerdo con el contenido de este aviso legal, le solicitamos expresar claramente que no está dispuesto a proporcionar los datos personales requeridos.  El tratamiento se realizará en cumplimiento de lo dispuesto en la política de privacidad la cual puede consultar en nuestra página web  http://www.unidrogas.com/ \n\nPara el ejercicio del Habeas Data, el titular del dato personal o quien demuestre un legítimo interés conforme lo señalado en la normatividad vigente, podrá hacerlo a través del siguiente correo electrónico habeasdata@unidrogas.net.co. Quien ejerza el habeas data deberá suministrar con precisión los datos de contacto solicitados para efecto de tramitar, atender y responder su solicitud',
      //             'y desplegar las cargas para el ejercicio de sus derechos. Recibida la solicitud de ejercicio de Habeas Data, UNIDROGAS S.A dará respuesta en los términos de ley. \n\nAsimismo declaro reconocer la necesidad de que UNIDROGAS S.A. realice diversos tipos de tratamiento respecto de los datos personales de sus empleados y del núcleo familiar de estos en relación con las obligaciones, cargas y deberes propios de la relación contractual que tengamos, así sea de naturaleza comercial,  civil o laboral.\n\nEn virtud de lo anterior, UNIDROGAS S.A podrá almacenar, conservar, analizar, investigar, trasmitir, cruzar, depurar, comunicar, compartir, informar, auditar, usar, monitorear y recolectar datos personales e información personal de sus empleados, así como evidencia y logos o rastros de navegación respecto de las actividades realizadas por sus empleados en los sistemas de información y redes,',
      //             'bien se trate de dispositivos propios o de terceros, ubicados dentro o fuera del territorio nacional, con el fin de informarse e informar sobre el cumplimiento de las obligaciones originadas en contratos laborales, comerciales, civiles, obligaciones de ley, órdenes de autoridad competente, desarrollo de estrategias con organismos públicos, privados, sean de orden nacional o internacional.\n\nAsimismo, por medio del presente me comprometo a proteger la información personal de UNIDROGAS S.A. y/o contenida en sus bases de datos, que  se encuentra bajo su custodia y a la cual pueda yo tener acceso y/o conocimiento; Por lo anterior me comprometo a lo siguiente:\n\n1.	Dar confidencialidad a la información personal, empresarial y/o comercial de UNIDROGAS S.A. contenida en las bases de datos de la compañía.',
      //             '2.	Dar y mantener el carácter de reservada a la información señalada en el numeral anterior.\n\n3.	Comunicar a quien corresponda, una vez tenga conocimiento de manera directa o a través de las personas mencionadas en la cláusula tercera de este acuerdo, cualquier indicio o hecho cierto que implique una violación a las medidas de seguridad adoptadas para proteger la información personal o que impliquen un tratamiento inadecuado de estos activos de información o un uso no autorizado de tales.\n\n4.	Colaborar a UNIDROGAS S.A. en lo que se refiera  a las denuncias que se presenten ante las autoridades competentes a las que haya lugar como consecuencia de cualquier conducta considerada como delito a la luz de la ley 1273 de 2009, en especial aquellas que puedan dar lugar a la violación de datos personales.',
      //             'Por lo anterior, reconozco las siguientes prohibiciones que tengo:\n\nI.	Usar los datos personales en provecho propio o de un tercero en forma contraria a lo pactado en este contrato.\nII.	Permitir el acceso a terceros no autorizados.\nIII.	Entregar los datos personales, empresariales y/o comerciales a cualquier autoridad sin haber notificado el requerimiento a UNIDROGAS S.A, con el fin de que esta pueda analizar de manera previa la competencia de la autoridad solicitante y la correlación directa de la orden y el hecho objeto de investigación y/o requerimiento.\nIV.	Abstenerse de investigar cualquier incidente de seguridad que comprometa la seguridad de los datos personales de terceros o de otras personas, sin la participación y/o autorización de UNIDROGAS S.A',
      //             'V.	Alterar cualquiera de los atributos de la información personal a la que se accede en razón de este acuerdo.\n\nEn caso de incumplimiento de lo anteriormente expuesto,  a UNIDROGAS S.A en caso de cualquier perjuicio ocasionado por la falta de diligencia, cuidado y prudencia en relación con la protección y/o tratamiento de la información personal a la que accedo sobre la cual debo garantizar la confidencialidad y reserva de la misma, con terceros. Así mismo, seré responsable de cualquier sanción que pudiera imponerse a UNIDROGAS S.A por parte de la SIC como autoridad en materia de protección de datos personales y que derive de mi incumplimiento con la política.\n\nPor lo anterior Acepto En señal de entendimiento y conformidad con los términos aquí contenidos.'
      //           ],
      showReloadDialog: false,
      secure:true,
      showToast: false
    };
    this._OnLogin = this._OnLogin.bind(this);
    this.ChangePass = this.ChangePass.bind(this);
    let token = null;
  }

  /**
   * Verificar que se subió una nueva versión
   */
  _checkUpdates = async () => {
    if (this._checking_update !== true) {
      console.log('Verificando por actualizaciones...');
      this._checking_update = true;
      try {
        const update = await fetch(api.ipInfoApp, {
          method: 'GET',
          headers: {
              'Authorization': 'Access',
              'Content-Type': 'application/json',
              'Accept':'application/json'
          },
          body: ''
        });
        // console.log(JSON.parse(update._bodyInit));
        // console.log(Expo.Constants.manifest.releaseChannel);
        // console.log(Expo.Constants.manifest.version);
        // console.log(Platform.OS);
        var data = JSON.parse(update._bodyInit);
        if(Expo.Constants.manifest.releaseChannel.indexOf(data.Release) !== -1){//Expo.Constants.manifest.releaseChannel.indexOf(data.Release)
          if(Platform.OS === 'ios' ? (data.version_ios > Expo.Constants.manifest.version) : (data.version_android > Expo.Constants.manifest.version)){
            console.log('Se ha encontrado una actualización...');
            this.setState({updating:true});
            Alert.alert(
              'Nueva Versión Disponible',
              'Actualización encontrada, favor descargarla para continuar.',
              [
                {
                  text: 'Descargar',
                  onPress: () => {
                    Linking.openURL(api.ipGoToStore);//Platform.OS === 'ios' ? Linking.openURL(api.ipGoToAppStore); : Linking.openURL(api.ipGoToPlayStore);
                  }
                },
              ],
              { cancelable: false }
            );
          }
          else{
            console.log('No se encontraron actualizaciones');
          }
        }
        else{
          console.log('No se puede buscar actualizaciones en modo debug')
        }
      } catch (e) {
        console.log('Error while trying to check for updates', e);
      }
      delete this._checking_update;
    } else {
      console.log('Currently checking for an update');
    }
  }

  _handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      this._checkUpdates();
    }
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    // fresh start check
    this._checkUpdates();
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  componentDidUpdate(prevProps, prevState) {
    const {showReloadDialog,} = this.state;
    if (showReloadDialog === true && showReloadDialog !== prevState.showReloadDialog) {
      Alert.alert(
        'Update',
        'Nuevo update.',
        [
          {
            text: 'Aceptar',
            onPress: () => {
              Linking.openURL(api.ipGoToStore);//Updates.reloadFromCache();
            }
          },
        ],
        { cancelable: false }
      );
    }
  }

  async componentWillMount() {
    this._retrieveData();
    this.setState({ loading: false });
  }
  /**
   * Verificar credenciales de inicio de sesión
   * @param {function} handler Obtiene el token y un valor de un layout para cargar otro layout
   */
  _OnLogin(handler){
    let username = this.state.email;
    let pass = this.state.password;
    this._storeData();
    var that = this;
    fetch(api.ipLogin, {
    method: 'POST',
    headers: {
        'Authorization': 'Access',
        'Content-Type': 'application/json',
        'Accept':'application/json'
    },
    body: JSON.stringify({username: username, password: pass})
    }).then(function(response) {
      //console.log(response);
      if(response.ok === true)
      {
        console.log(Expo.Constants.deviceName);
        console.log(Expo.Constants.deviceId);
        token = response;
        fail = 0;
        that.getPorcentaje(token,handler);
        // toastr.showToast('Ha iniciado sesión!','success');
      }
      else
      {
        console.log(response);
        if(response.status === 500){
          var newToken = JSON.parse(response._bodyInit);
          var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
          var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
          logError.sendError(header,body,auth);
          toastr.showToast('Error con el servidor','danger');
        }
        else{
          toastr.showToast('Credenciales incorrectas','danger');
          fail += 1;
        }
      }
      return response.json();
    }).catch(function(error){
      console.log(error);
      toastr.showToast('Verifique su conexión a internet','warning');
      if(error.toString().includes('Network request failed')){toastr.showToast('Verifique su conexión a internet ó Contactese con el administrador','warning');}
    });
  }

  /**
   * Obtener cantidad de las actividades (activas, completas, noRealizadas)
   */
  async getPorcentaje(token2,handler){
    let bodyInit = JSON.parse(token2._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    var that = this;
    await fetch(api.ipPorcentajeActividades, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept':'application/json'
      },
      body: ''
      }).then(function(response) {
        //console.log(response);
        if(response.ok === true)
        {
          var porcentajes = JSON.parse(response._bodyInit);
          var general = (porcentajes.porcentaje_general.actividades_completas / porcentajes.porcentaje_general.todas_las_actividades) * 100;
          that._storeDataPorcentajes(Math.floor(general),porcentajes);
          that._storeData();
          if(that.state.tutorial < '4'){handler(10,token);}
          else{toastr.showToast('Ha iniciado sesión!','success');handler(1,token);}
          //console.log(Math.floor(general));
        }
        else
        {
          console.log(response);
          var newToken = JSON.parse(response._bodyInit);
          var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
          var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
          if(response.status === 500){
            logError.sendError(header,body,auth);
            toastr.showToast('Error con el servidor','danger');
          }
          else if(401){
            handler(8,token);
            //toastr.showToast('Credenciales incorrectas','danger');
          }
        }
        return response.json();
      }).catch(function(error){
        console.log(error);
        toastr.showToast('Verifique su conexión a internet','warning');
        if(error.toString().includes('Network request failed')){toastr.showToast('Verifique su conexión a internet ó Contactese con el administrador','warning');}
    });
  }

  /**
   * Guardar datos de usuario y contraseña en los datos globales de la aplicación
   */
  _storeData = async () => {
    if(this.state.checked){
      try {
        await AsyncStorage.multiSet([['USER', this.state.email],['PASS', this.state.password],['PRIVACIDAD',this.state.privacidad],['TUTORIAL',this.state.tutorial]]);
      } catch (error) {
        console.log(error);
      }
    }
    else{
      try {
        await AsyncStorage.multiRemove(['USER', 'PASS']);
        await AsyncStorage.setItem('PRIVACIDAD',this.state.privacidad);
        await AsyncStorage.setItem('TUTORIAL',this.state.tutorial);
      } catch (error) {
        console.log(error);
      }
    }
  }

  /**
   * Guardar datos de cantidad de actividades
   */
  _storeDataPorcentajes = async (general,porcentajes) => {
    try {
      await AsyncStorage.multiSet([['PORCENTAJE', ''+general],['PORCENTAJES', JSON.stringify(porcentajes)],['ESTADO',this.state.estado]]);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Obtener datos de usuario y contraseña guardados en los datos globales de la apicación y enviarlos en los inputs correspondientes
   */
  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.multiGet(['USER','PASS','ESTADO','PRIVACIDAD','TUTORIAL']);
      if (value !== null) {
        //console.log(value);
        var state = 'true';
        var priv = false;
        var tutorial = '0'
        var privacidad = '0';
        if(value[2][1] !== null){if(value[2][1] === 'false'){state='false'}}
        if(value[3][1] !== ''+(this.state.politicas.length-1) || value[3][1] === null){priv = true}
        if(value[3][1] !== null){privacidad = value[3][1]}
        if(value[4][1] !== null){tutorial = value[4][1]}
        this.setState({ email: value[0][1] , password: value[1][1], estado: state, privacidad:privacidad,tutorial:tutorial, isVisiblePrivacidad:priv, isPrivacidad:priv});
      }
      else{
        this.setState({privacidad:'0', tutorial:'0', isVisiblePrivacidad:true})
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Enviar correo de cambio de contraseña e ir al layout de cambio de contraseña
   */
  ChangePass(handler)
  {
    var items = null;
    var correo = this.state.email;
    if(!swChange){
      swChange = true;
      fetch(api.ipChangePassword, {
        method: 'POST',
        headers: {
            'Authorization': 'Access',
            'Content-Type': 'application/json',
            'Accept':'application/json'
        },
        body: JSON.stringify({email: correo})
      }).then(function(response) {
        //console.log(response);
        if(response.ok === true)
        {
          items = {correo: correo, nombre: '', apellido: '', FromLogin:true};
          //console.log(items);
          toastr.showToast(JSON.parse(response._bodyInit),'success');
          fail = 0;
          handler(6,null,items);
          swChange = false;
        }
        else
        {
          console.log(response);
          var newToken = JSON.parse(response._bodyInit);
          var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
          var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
          logError.sendError(header,body,auth);
          if(response.status === 500){
            toastr.showToast('Error con el servidor','danger');
          }
          else{
            toastr.showToast('Error al enviar el correo','danger');
          }
        }
        return response.json();
      }).catch(function(error){
        console.log(error);
      });
    }
  }

  render() {
    /***
     * Mostrar layout luego de cargar los componentes
     */
    if (this.state.loading) {
      return (<View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color={COLOR.azul} /></View>);
    }
    var height = Dimensions.get('window').height;
    return (
      <Container>
        <KeyboardAvoidingView behavior="padding" enabled style={{flex: Platform.OS === 'ios' ? 1 : 1}}>
          <Content contentContainerStyle={{ justifyContent: 'center', flex: 1 }}>
            <View>
              <Image style={{height: 192, width: 192, marginLeft: 'auto', marginRight:'auto',marginBottom:15}} source={Imagen.icon}/>
              <Form >
                <Item regular style={styles.form}>
                  {/*<Icon active ios='ios-person' android='md-person' style={styles.icon}/>*/}
                  <Image style={styles.icon} source={Imagen.user}/>
                  <Input placeholder='Correo' placeholderTextColor={COLOR.gris} defaultValue={this.state.email} onChangeText={(text) => this.setState({email: text})} keyboardType='email-address' autoCapitalize='none'  style={styles.input}/>
                </Item>
                <Item regular style={styles.form}>
                  {/*<Icon active ios='ios-lock' android='md-lock'  style={styles.icon}/>*/}
                  <Image style={styles.icon} source={Imagen.pass}/>
                  <Input placeholder='Contraseña' placeholderTextColor={COLOR.gris} defaultValue={this.state.password} secureTextEntry={this.state.secure}  onChangeText={(text) => this.setState({password: text})} autoCapitalize='none'  style={styles.pass}/>
                  <Button transparent style={{paddingTop:0,paddingBottom:0, height:40}} onPress={() => this.setState({secure: !this.state.secure})}><Text style={{fontFamily:'BebasNeueBold', color:COLOR.secundary}}>{this.state.secure? 'Mostrar' : 'Ocultar'}</Text></Button>
                </Item>
                
                {fail >= 1 && <Text style={styles.forgotPass} onPress={() => { !this.state.updating ? this.ChangePass(this.props.handler2) : this._checkUpdates()}}>Olvidaste tu contraseña?</Text>}              
                <Button block onPress={() => { !this.state.updating ? this._OnLogin(this.props.handler) : this._checkUpdates()}} style={styles.boton2}>
                  <Text style={styles.text}>Ingresar</Text>
                </Button>
                <ListItem underlayColor={COLOR.azul} style={styles.checkbox2} button onPress={() => this.setState({checked: !this.state.checked})}>
                  <CheckBox color={COLOR.azul} checked={this.state.checked} onPress={() => this.setState({checked: !this.state.checked})}/>
                  <Body>
                    <Text style={styles.checkbox}>Recordar Credenciales</Text>
                  </Body>
                </ListItem>        
              </Form>
              <Text style={{alignSelf:'center', marginTop:20,color:COLOR.azul}} onPress={() => this.setState({isVisibleTerminos:true})}>Términos y Condiciones</Text>
              <Text style={{alignSelf:'center', fontSize:12, marginTop:30}}>v {Expo.Constants.manifest.version}</Text>
              {/* <Text style={{alignSelf:'center', fontSize:12, marginTop:50}}>{consola}</Text> */}
            </View>
          </Content>
        </KeyboardAvoidingView>
        {this.state.isPrivacidad && !this.state.updating &&
          <Overlay
            visible={this.state.isVisiblePrivacidad}
            animationType="zoomIn"
            closeOnTouchOutside={false}
            onClose={() => this.setState({isVisiblePrivacidad: true})}
            containerStyle={{backgroundColor: "rgba(0, 0, 0, .8)", width:"auto",height:"auto"}}
            childrenWrapperStyle={{backgroundColor: "rgba(255, 255, 255, 1)", borderRadius: 10,padding:10}}
          >
            <View style={{justifyContent:'space-between', width:"100%", height:"100%"}}>
              {/* <Text style={{textAlign:'justify',fontSize:13+Dimensions.get('window').scale}}>{this.state.politicas[this.state.privacidad]}</Text> */}
              <WebView style={{width:"100%"}} source={{html: this.state.politicas[this.state.privacidad]}}/>
              <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                <Button disabled={this.state.privacidad !== ''+(this.state.politicas.length-1)} style={{backgroundColor:this.state.privacidad === ''+(this.state.politicas.length-1)?COLOR.verde:COLOR.gris,alignSelf:'center'}} onPress={() => {this.setState({isVisiblePrivacidad: false,isPrivacidad:false, privacidad:''+(this.state.politicas.length-1)})}}>
                  <Text style={{fontFamily:'BebasNeueBold', fontSize:20}}>Aceptar</Text>
                </Button>
                <Button disabled={this.state.privacidad === '0'} style={{backgroundColor:this.state.privacidad > '0'?COLOR.verde:COLOR.gris,alignSelf:'flex-end'}} onPress={() => {var priv = parseInt(this.state.privacidad); this.setState({privacidad:(priv-1).toString()})}}>
                  <Text style={{fontFamily:'BebasNeueBold', fontSize:20}}>Atrás</Text>
                </Button>
                <Button disabled={this.state.privacidad >= ''+(this.state.politicas.length-1)} style={{backgroundColor:this.state.privacidad < ''+(this.state.politicas.length-1)?COLOR.verde:COLOR.gris,alignSelf:'flex-end'}} onPress={() => {var priv = parseInt(this.state.privacidad); this.setState({privacidad:(priv+1).toString()})}}>
                  <Text style={{fontFamily:'BebasNeueBold', fontSize:20}}>Siguiente</Text>
                </Button>
              </View>
            </View>
          </Overlay>
        }
        {this.state.isVisibleTerminos &&
          <Modal
            animationType="fade"
            transparent={true}
            visible={this.state.isVisibleTerminos}
            onRequestClose={() => {
              // Alert.alert('Modal has been closed.');
            }}>
            <View style={{flex:1,justifyContent:'center',backgroundColor:'rgba(0,0,0,.8)'}}>
              <View style={{margin: 22,padding:10,borderRadius:10,justifyContent:'center',backgroundColor:'white',flex:1}}>
                <View style={{justifyContent:'space-between', width:"100%", height:"100%"}}>
                  <WebView style={{flex:1}} source={{uri: 'https://superat.co/terms.html'}}/>
                  <View style={{justifyContent:'center',marginTop:5}}>
                    <Button disabled={false} style={{backgroundColor:COLOR.verde,alignSelf:'center'}} onPress={() => {this.setState({isVisibleTerminos: false})}}>
                      <Text style={{fontFamily:'BebasNeueBold', fontSize:20}}>Aceptar</Text>
                    </Button>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        }
      </Container>
    );
  }
}