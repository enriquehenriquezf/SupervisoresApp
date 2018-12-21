import {Image} from 'react-native';

export const Preload = {
  images: () => { 
    Image.prefetch('https://png.pngtree.com/svg/20160304/ajb_address_book_user_avatar_183015.png');
    Image.prefetch('https://assets4.domestika.org/project-items/001/228/844/sesion-estudio-barcelona-10-big.jpg?1425034585');
    require('../../assets/unidrogas.png');
  },
}