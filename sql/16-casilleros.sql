-- Módulo 16 — Casilleros
-- Crea UNA tabla nueva en la base compartida. No modifica ni borra ninguna de las 23 existentes.
-- Es seguro ejecutarlo más de una vez: no duplica la tabla ni los datos.
-- NO usar prisma migrate ni prisma db push: este SQL se ejecuta con scripts/crear-tabla.mjs.

BEGIN;

CREATE TABLE IF NOT EXISTS alquileres_casillero (
  id               SERIAL PRIMARY KEY,
  asistente_id     INT          NOT NULL REFERENCES asistentes(id),
  dia_id           INT          NOT NULL REFERENCES dias(id),
  tamano           VARCHAR(7)   NOT NULL CHECK (tamano IN ('PEQUENO', 'GRANDE')),
  precio           INT          NOT NULL CHECK (precio > 0),
  estado           VARCHAR(10)  NOT NULL DEFAULT 'EN_USO' CHECK (estado IN ('EN_USO', 'DEVUELTO')),
  fecha_devolucion TIMESTAMPTZ,
  state            VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
);

-- Datos iniciales (solo si la tabla está vacía). Las pruebas públicas dependen de ellos:
--   * Viernes (día 1): los 2 casilleros GRANDE están ocupados → cupo GRANDE lleno.
--   * El id 4 está DEVUELTO.
INSERT INTO alquileres_casillero (asistente_id, dia_id, tamano, precio, estado, fecha_devolucion)
SELECT * FROM (VALUES
  (1, 1, 'GRANDE',  25000, 'EN_USO',   NULL::timestamptz),
  (2, 1, 'GRANDE',  25000, 'EN_USO',   NULL),
  (3, 1, 'PEQUENO', 15000, 'EN_USO',   NULL),
  (4, 2, 'PEQUENO', 15000, 'DEVUELTO', '2026-11-21 23:40:00-05'),
  (1, 2, 'PEQUENO', 15000, 'EN_USO',   NULL),
  (3, 3, 'GRANDE',  25000, 'EN_USO',   NULL)
) AS v
WHERE NOT EXISTS (SELECT 1 FROM alquileres_casillero);

COMMIT;
