export function ejecutar(analisis: any) {
  // Wadi toma lo que Kivo pensó y lo convierte en acción
  const primerPaso = analisis.plan[0];

  return `Listo, lo bajé a concreto.
  Arrancamos por esto: **${primerPaso}**.
  Si algo se rompe, lo acomodamos en el camino. Vos tirá la data.`;
}
