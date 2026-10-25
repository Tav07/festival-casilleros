import { ValidationError } from '../../domain/errors/index.js';

// Enteros con formato estricto: nada de "1.5", "0", "-1", " 1", "1e2".
const ENTERO_POSITIVO = /^\d+$/;
const ENTERO = /^\d+$/;

// Los ids por ruta llegan como texto del params.
export function validarIdDeRuta(valor: string, campo = 'id'): number {
  if (typeof valor !== 'string' || !ENTERO_POSITIVO.test(valor) || Number(valor) < 1) {
    throw new ValidationError(`El ${campo} debe ser un entero positivo`);
  }
  return Number(valor);
}

// Un id que llega en el JSON: el tipo también debe ser entero (notexto, no 1.5).
export function validarEnteroPositivo(valor: unknown, campo: string): number {
  if (typeof valor !== 'number' || !Number.isSafeInteger(valor) || valor < 1) {
    throw new ValidationError(`El campo ${campo} debe ser un entero positivo`);
  }
  return valor;
}

// Filtro numérico del query string (?dia_id=, ?asistente_id=).
export function validarFiltroNumerico(valor: unknown, campo: string): number | undefined {
  if (valor === undefined) return undefined;
  if (typeof valor !== 'string' || !ENTERO.test(valor) || Number(valor) < 1) {
    throw new ValidationError(`El filtro ${campo} debe ser un entero positivo`);
  }
  return Number(valor);
}

// Un array de dos filtros combinados ya se maneja en el caso de uso.
export function esEnteroPositivo(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isSafeInteger(valor) && valor > 0;
}