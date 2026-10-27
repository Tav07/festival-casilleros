import { ValidationError } from '../../domain/errors/index.js';

const ENTERO_POSITIVO = /^[1-9]\d*$/;
const LIMITE_MAXIMO = 50;

// page y limit son opcionales; por defecto 1 y 10. limit máximo 50.
export interface Paginacion {
  page: number;
  limit: number;
}

export function validarPaginacion(query: Record<string, unknown>): Paginacion {
  const { page, limit } = query;
  if (page !== undefined && (typeof page !== 'string' || !ENTERO_POSITIVO.test(page))) {
    throw new ValidationError('El parámetro page debe ser un entero positivo');
  }
  if (limit !== undefined && (typeof limit !== 'string' || !ENTERO_POSITIVO.test(limit))) {
    throw new ValidationError('El parámetro limit debe ser un entero positivo');
  }
  const pageActual = page === undefined ? 1 : Number(page);
  const limitActual = limit === undefined ? 10 : Number(limit);
  if (limitActual > LIMITE_MAXIMO) {
    throw new ValidationError(`El parámetro limit no puede ser mayor a ${LIMITE_MAXIMO}`);
  }
  return { page: pageActual, limit: limitActual };
}