/**
 * Timeline compartido de la animación "De semilla a árbol".
 * Vive en un módulo propio (sin three.js) para que el modal pueda importar
 * los tiempos sin arrastrar la escena 3D al bundle inicial.
 */

// Momento (s) en que se alcanza cada uno de los 9 niveles.
export const STAGE_TIMES = [0, 2.1, 4.4, 6.2, 7.8, 9.4, 11.0, 12.8, 14.6];

// Fin del crecimiento: a partir de aquí el árbol queda en idle (viento).
export const T_END = 16;
