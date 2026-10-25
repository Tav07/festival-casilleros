import type { Tamano } from '../constants/casilleros.js';

// Entidad del dominio. Los nombres de los campos son los de las columnas
// de la tabla alquileres_casillero: así viaja tal cual por la API.
export interface AlquilerCasillero {
  id: number;
  asistente_id: number;
  dia_id: number;
  tamano: Tamano;
  precio: number;
  estado: 'EN_USO' | 'DEVUELTO';
  fecha_devolucion: string | null;
  state: 'ACTIVE' | 'REMOVED';
}

// Datos de un alquiler ya devuelto (se entrega al crear o al editar).
export interface DatosNuevoCasillero {
  asistente_id: number;
  dia_id: number;
  tamano: Tamano;
}