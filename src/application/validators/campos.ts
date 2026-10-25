import { TAMANOS, Tamano, ESTADOS_ALQUILER, EstadoAlquiler } from '../../domain/constants/casilleros.js';
import { ValidationError } from '../../domain/errors/index.js';
import type { DatosNuevoCasillero } from '../../domain/entities/AlquilerCasillero.js';
import { validarEnteroPositivo } from './enteros.js';

// El tamaño va en mayúsculas exactas: PEQUENO o GRANDE.
export function validarTamano(valor: unknown): Tamano {
  if (typeof valor !== 'string' || !(TAMANOS as readonly unknown[]).includes(valor)) {
    throw new ValidationError('El tamaño debe ser PEQUENO o GRANDE');
  }
  return valor as Tamano;
}

export function validarEstadoFiltro(valor: unknown): EstadoAlquiler {
  if (typeof valor !== 'string' || !(ESTADOS_ALQUILER as readonly unknown[]).includes(valor)) {
    throw new ValidationError('El filtro estado debe ser EN_USO o DEVUELTO');
  }
  return valor as EstadoAlquiler;
}

export type EntradaCreacion = DatosNuevoCasillero;

// POST: solo asistente_id, dia_id y tamano. Lo demás (precio, estado,
// fecha_devolucion y campos desconocidos) se ignora, sin error.
export function validarCreacion(body: unknown): EntradaCreacion {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('El cuerpo de la petición debe ser un objeto JSON');
  }
  const datos = body as Record<string, unknown>;
  const asistente_id = datos.asistente_id;
  const dia_id = datos.dia_id;

  if (asistente_id === undefined) throw new ValidationError('El campo asistente_id es obligatorio');
  if (dia_id === undefined) throw new ValidationError('El campo dia_id es obligatorio');
  if (datos.tamano === undefined) throw new ValidationError('El campo tamano es obligatorio');

  return {
    asistente_id: validarEnteroPositivo(asistente_id, 'asistente_id'),
    dia_id: validarEnteroPositivo(dia_id, 'dia_id'),
    tamano: validarTamano(datos.tamano),
  };
}

// PATCH: el único campo editable es tamano. Cualquier otra clave es 400.
// El body vacío ({}) no se valida aquí: la decisión del módulo es responder
// 404 (el caso de uso lo maneja).
export interface EntradaEdicion {
  tamano?: Tamano;
}

export function validarEdicion(body: unknown): EntradaEdicion {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('El cuerpo de la petición debe ser un objeto JSON');
  }
  const datos = body as Record<string, unknown>;
  const cambio: EntradaEdicion = {};
  for (const clave of Object.keys(datos)) {
    if (clave !== 'tamano') {
      throw new ValidationError(`No se puede editar el campo ${clave}; el único campo editable es tamano`);
    }
  }
  if (datos.tamano !== undefined) {
    cambio.tamano = validarTamano(datos.tamano);
  }
  return cambio;
}