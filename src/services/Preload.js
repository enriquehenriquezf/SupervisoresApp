import {Image} from 'react-native';
import { Imagen } from '../components/Imagenes';

export const Preload = {
  images: () => { 
    Image.prefetch('https://png.pngtree.com/svg/20160304/ajb_address_book_user_avatar_183015.png');
    Image.prefetch('https://assets4.domestika.org/project-items/001/228/844/sesion-estudio-barcelona-10-big.jpg?1425034585'); 
    Image.prefetch(Imagen.noDisponible);  
    Imagen.unidrogas;
    Imagen.home,
    Imagen.actividad,
    Imagen.perfil,
    Imagen.agenda,
    Imagen.activo,
    Imagen.inactivo,
    Imagen.reportes,
    Imagen.servicioTecnico,
    Imagen.cerrarSesion,
    Imagen.user;
    Imagen.pass;
    Imagen.back;
    Imagen.phone;
    Imagen.mail;
    Imagen.code;
    Imagen.find;
    Imagen.check;
    Imagen.uncheck;
    Imagen.equis;
    Imagen.profileBorder;
    Imagen.tuto1;
    Imagen.tuto2;
    Imagen.tuto3;
  }
}