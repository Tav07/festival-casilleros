// Errores de dominio: el errorHandler los mapea al código HTTP que corresponde.
export class ValidationError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(mensaje = 'Recurso no encontrado') {
    super(mensaje);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ConflictError';
  }
}