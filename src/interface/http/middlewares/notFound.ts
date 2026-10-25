import type { Request, Response } from 'express';

// Cualquier ruta no registrada responde 404 { error }, nunca un HTML.
export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
}