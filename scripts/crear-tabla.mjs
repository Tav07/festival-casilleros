// Crea la tabla del módulo 16 en la base compartida y verifica los datos que usan las pruebas.
// Uso (desde la raíz del proyecto, con DATABASE_URL en el .env):
//   node scripts/crear-tabla.mjs
// Luego: npm run sync   (debe aparecer el modelo número 24: alquileres_casillero)

import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import pg from 'pg';

const sql = await readFile(new URL('../sql/16-casilleros.sql', import.meta.url), 'utf8');

// Seguro extra: el script solo puede crear/insertar en alquileres_casillero.
const prohibido = /\b(DROP|TRUNCATE|ALTER|DELETE)\b/i;
if (prohibido.test(sql.replace(/--.*$/gm, ''))) {
  console.error('El SQL contiene una instrucción destructiva. No se ejecuta.');
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query(sql);
  const { rows: [{ n }] } = await client.query('SELECT count(*)::int AS n FROM alquileres_casillero');
  console.log(`✓ Tabla alquileres_casillero lista con ${n} registros.`);

  // Supuestos de las pruebas públicas
  const boleta = async (asistente, dia) => (await client.query(
    "SELECT 1 FROM boletas WHERE asistente_id = $1 AND dia_id = $2 AND state = 'ACTIVE'", [asistente, dia])).rowCount > 0;
  const chequeos = [
    ['Asistente 5 tiene boleta activa del día 1', await boleta(5, 1), true],
    ['Asistente 16 NO tiene boleta activa del día 1', await boleta(16, 1), false],
  ];
  for (const [texto, real, esperado] of chequeos) {
    console.log(`${real === esperado ? '✓' : '✗ REVISAR'} ${texto}`);
  }
} finally {
  await client.end();
}
