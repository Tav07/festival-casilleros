import type { AlquilerCasillero, DatosNuevoCasillero } from '../entities/AlquilerCasillero.js';
import type { Tamano, EstadoAlquiler } from '../constants/casilleros.js';

// Interfaz de repositorio del dominio: los casos de uso dependen de esto,
// nunca de Prisma. La implementación vive en infrastructure/.
export interface AlquilerCasilleroRepository {
  listar(filtros: FiltrosListado, page: number, limit: number): Promise<{
    total: number;
    datos: AlquilerCasillero[];
  }>;

  obtenerPorId(id: number): Promise<AlquilerCasillero | null>;

  crear(datos: DatosNuevoCasillero, precio: number): Promise<AlquilerCasillero>;

  actualizar(
    id: number,
    cambio: { tamano?: Tamano; precio?: number; estado?: EstadoAlquiler; fecha_devolucion?: string | null },
  ): Promise<AlquilerCasillero | null>;

  // Borrado lógico: cambia state a 'REMOVED', no borra la fila.
  marcarEliminado(id: number): Promise<AlquilerCasillero | null>;

  // Conteo para disponibilidad: alquileres ACTIVE y EN_USO de un día, agrupados por tamaño.
  contarEnUsoPorTamano(diaId: number): Promise<{ tamano: Tamano; ocupados: number }[]>;

  // Regla 3 (cupo): cuántos alquileres ACTIVE y EN_USO hay de un tamaño en un día,
  // sin contarse a sí mismo (excluirId) cuando se revalida con PATCH.
  contarEnUsoDeTamano(diaId: number, tamano: Tamano, excluirId?: number): Promise<number>;

  // Regla 2 (uno por día): true si el asistente ya tiene otro alquiler
  // ACTIVE y EN_USO ese día (el propio no cuenta, con excluirId).
  existeOtroEnUso(asistenteId: number, diaId: number, excluirId?: number): Promise<boolean>;
}

export interface FiltrosListado {
  asistente_id?: number;
  dia_id?: number;
  tamano?: Tamano;
  estado?: EstadoAlquiler;
}