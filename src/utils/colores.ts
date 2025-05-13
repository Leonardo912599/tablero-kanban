const colores: string[] = [
    '#FF5733', // rojo anaranjado
    '#33FF57', // verde lima
    '#3357FF', // azul fuerte
    '#F1C40F', // amarillo
    '#9B59B6', // morado
    '#E67E22', // naranja
    '#1ABC9C', // turquesa
    '#E74C3C', // rojo
    '#2ECC71', // verde
    '#34495E'  // gris azulado
  ];
  
  export const seleccionarColorAleatorio = (): string => {
    const indice = Math.floor(Math.random() * colores.length);
    return colores[indice];
  };
  