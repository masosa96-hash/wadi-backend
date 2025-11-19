import { pensar } from "./kivo";
import { ejecutar } from "./wadi";

export function cerebroDual(input: string) {
  const analisis = pensar(input);
  const respuesta = ejecutar(analisis);
  return respuesta;
}
