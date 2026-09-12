import { TEMA_LOGIN } from 'config/loginTheme';

import defectoBg1 from 'assets/img/themes/defecto/carrusel/bg1.jpg';
import defectoBg2 from 'assets/img/themes/defecto/carrusel/bg2.jpg';
import defectoBg3 from 'assets/img/themes/defecto/carrusel/bg3.jpg';
import defectoUplogin from 'assets/img/themes/defecto/uplogin.png';
import defectoResetlogin from 'assets/img/themes/defecto/resetlogin.png';

import navidadBg1 from 'assets/img/themes/navidad/carrusel/bg1.jpg';
import navidadBg2 from 'assets/img/themes/navidad/carrusel/bg2.jpg';
import navidadBg3 from 'assets/img/themes/navidad/carrusel/bg3.jpg';
import navidadUplogin from 'assets/img/themes/navidad/uplogin.png';
import navidadResetlogin from 'assets/img/themes/navidad/resetlogin.png';

const TEMAS_DISPONIBLES = {
    defecto: {
        carrusel:    [defectoBg1, defectoBg2, defectoBg3],
        uplogin:     defectoUplogin,
        resetlogin:  defectoResetlogin,
        decorNavidad: false,
    },
    navidad: {
        carrusel:    [navidadBg1, navidadBg2, navidadBg3],
        uplogin:     navidadUplogin,
        resetlogin:  navidadResetlogin,
        decorNavidad: true,
    },
};

const tema = TEMAS_DISPONIBLES[TEMA_LOGIN] ?? TEMAS_DISPONIBLES.defecto;

export const carruselImages  = tema.carrusel;
export const uploginImg      = tema.uplogin;
export const resetloginImg   = tema.resetlogin;
export const decorNavidad    = tema.decorNavidad;