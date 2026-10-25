// Lectura de boletas (tabla de otro módulo: solo lectura, nunca se escribe).
export interface BoletaReadRepository {
  // Regla 1: solo alquila quien tiene una boleta ACTIVE para el día del alquiler.
  tieneBoletaActiva(asistenteId: number, diaId: number): Promise<boolean>;
}