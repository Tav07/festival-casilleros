// Constantes del dominio de casilleros.
export const TAMANOS = ['PEQUENO', 'GRANDE'] as const;
export type Tamano = (typeof TAMANOS)[number];

export const PRECIOS: Record<Tamano, number> = {
  PEQUENO: 15000,
  GRANDE: 25000,
};

export const CUPOS: Record<Tamano, number> = {
  PEQUENO: 100,
  GRANDE: 2,
};

export const ESTADOS_ALQUILER = ['EN_USO', 'DEVUELTO'] as const;
export type EstadoAlquiler = (typeof ESTADOS_ALQUILER)[number];

export const ESTADOS_REGISTRO = ['ACTIVE', 'REMOVED'] as const;
export type EstadoRegistro = (typeof ESTADOS_REGISTRO)[number];

// El precio solo depende del tamaño: lo calcula el servidor, nunca el cliente.
export function calcularPrecio(tamano: Tamano): number {
  return PRECIOS[tamano];
}