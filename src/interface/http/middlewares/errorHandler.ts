import type { NextFunction, Request, Response } from 'express';
import { ValidationError, NotFoundError, ConflictError } from '../../../domain/errors/index.js';

// Un único punto que traduce los errores a la forma { "error": "..." }.
// Nunca responde stack traces.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // JSON malformado en el body (lo lanza express.json())
  if (err instanceof SyntaxError && (err as { type?: string }).type === 'entity.parse.failed') {
    res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido' });
    return;
  }
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }
  if (err instanceof ConflictError) {
    res.status(409).json({ error: err.message });
    return;
  }
  // Error no esperado: se registra en servidor, se responde de forma genérica.
  console.error('[error sin manejar]', err);
  res.status(500).json({ error: 'Error interno del servidor' });
}