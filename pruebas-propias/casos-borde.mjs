// Pruebas de casos borde del módulo 16 — Casilleros.
// Uso (con la API encendida):  node pruebas-propias/casos-borde.mjs http://localhost:3000
// Sin dependencias: usa fetch de node. El script limpia todo lo que crea.

const BASE = process.argv[2] || 'http://localhost:3000';
const RUTA = `${BASE}/api/alquileres-casillero`;

let fallidas = 0;

async function pedir(metodo, url, body) {
  const opciones = { method: metodo, headers: {} };
  if (body !== undefined) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const res = await fetch(url, opciones);
  let json = null;
  try {
    json = await res.json();
  } catch {
    // el body podía estar vacío: no pasa nada
  }
  return { status: res.status, json };
}

function chequear(nombre, obtenido, esperado) {
  const ok = obtenido === esperado;
  if (!ok) fallidas++;
  console.log(`${ok ? '✓' : '✗ ESPERABA ' + esperado + ' PERO FUE'} ${nombre} → ${obtenido}`);
}

const R = RUTA;

async function main() {
  console.log(`Pruebas de casos borde contra ${BASE}\n`);

  // ---------- Paginación ----------
  let r = await pedir('GET', `${R}?limit=0`);
  chequear('limit=0', r.status, 400);
  r = await pedir('GET', `${R}?limit=51`);
  chequear('limit=51', r.status, 400);
  r = await pedir('GET', `${R}?page=-1`);
  chequear('page=-1', r.status, 400);
  r = await pedir('GET', `${R}?limit=abc`);
  chequear('limit=abc', r.status, 400);
  r = await pedir('GET', `${R}?page=1.5`);
  chequear('page=1.5', r.status, 400);
  r = await pedir('GET', `${R}?page=2&limit=1`);
  chequear('page=2&limit=1', r.status, 200);
  if (r.json?.pagination?.currentPage !== 2) {
    fallidas++;
    console.log(`✗ page=2&limit=1 debía traer currentPage=2, trajo ${r.json?.pagination?.currentPage}`);
  }

  // ---------- Filtros inválidos ----------
  r = await pedir('GET', `${R}?dia_id=abc`);
  chequear('?dia_id=abc', r.status, 400);
  r = await pedir('GET', `${R}?asistente_id=-3`);
  chequear('?asistente_id=-3', r.status, 400);
  r = await pedir('GET', `${R}?tamano=MEDIANO`);
  chequear('?tamano=MEDIANO', r.status, 400);
  r = await pedir('GET', `${R}?estado=X`);
  chequear('?estado=X', r.status, 400);

  // ---------- Ids por ruta ---------- (ojo: id 1 es precargado, solo se consulta)
  for (const id of ['0', '-1', '1.5', 'abc']) {
    r = await pedir('GET', `${R}/${id}`);
    chequear(`GET /${id}`, r.status, 400);
  }
  r = await pedir('GET', `${R}/999999`);
  chequear('GET /999999', r.status, 404);

  // ---------- POST validaciones (no crean nada) ----------
  r = await pedir('POST', R, { asistente_id: '5', dia_id: 1, tamano: 'PEQUENO' });
  chequear('POST asistente_id como texto', r.status, 400);
  r = await pedir('POST', R, { asistente_id: 5, dia_id: 1.5, tamano: 'PEQUENO' });
  chequear('POST dia_id 1.5', r.status, 400);
  r = await pedir('POST', R, { asistente_id: 5, dia_id: 1 });
  chequear('POST sin tamano', r.status, 400);
  r = await pedir('POST', R, {});
  chequear('POST vacío', r.status, 400);
  r = await pedir('POST', R, '{no es json');
  chequear('POST JSON malformado', r.status, 400);
  r = await pedir('POST', R, { asistente_id: 999, dia_id: 1, tamano: 'PEQUENO' });
  chequear('POST asistente 999', r.status, 404);
  r = await pedir('POST', R, { asistente_id: 5, dia_id: 999, tamano: 'PEQUENO' });
  chequear('POST día 999', r.status, 404);
  r = await pedir('POST', R, { asistente_id: 999, dia_id: 1, tamano: 'GIGANTE' });
  chequear('POST asistente inexistente + tamano inválido (gana 400)', r.status, 400);
  r = await pedir('POST', R, { asistente_id: 16, dia_id: 1, tamano: 'PEQUENO' });
  chequear('POST asistente 16 (sin boleta activa)', r.status, 409);

  // ---------- POST válido + ciclo de vida completo ----------
  // El asistente 5 tiene boleta activa del día 1. PEQUENO tiene cupo de sobra.
  r = await pedir('POST', R, { asistente_id: 5, dia_id: 1, tamano: 'PEQUENO', precio: 1, estado: 'DEVUELTO', extrano: 'x' });
  chequear('POST válido (el precio del cliente se ignora)', r.status, 201);
  chequear('POST devuelve precio calculado 15000', r.json?.data?.precio, 15000);
  chequear('POST devuelve estado EN_USO', r.json?.data?.estado, 'EN_USO');
  chequear('POST devuelve state ACTIVE', r.json?.data?.state, 'ACTIVE');
  chequear('POST devuelve fecha_devolucion null', r.json?.data?.fecha_devolucion, null);

  const creado = r.json?.data?.id;
  try {
    if (creado) {
      // Regla 2: el mismo asistente no puede alquilar otro casillero el mismo día.
      const r2 = await pedir('POST', R, { asistente_id: 5, dia_id: 1, tamano: 'GRANDE' });
      chequear('POST repetido mismo asistente/día (uno por día)', r2.status, 409);

      // PATCH: campos no editables.
      r = await pedir('PATCH', `${R}/${creado}`, { precio: 1 });
      chequear('PATCH precio', r.status, 400);
      r = await pedir('PATCH', `${R}/${creado}`, { estado: 'DEVUELTO' });
      chequear('PATCH estado', r.status, 400);
      r = await pedir('PATCH', `${R}/${creado}`, { asistente_id: 2 });
      chequear('PATCH asistente_id', r.status, 400);
      r = await pedir('PATCH', `${R}/${creado}`, { tamano: 'X' });
      chequear('PATCH tamano inválido', r.status, 400);
      r = await pedir('PATCH', `${R}/${creado}`, {});
      chequear('PATCH con {}', r.status, 404);
      r = await pedir('PATCH', `${R}/999999`, {});
      chequear('PATCH /999999 con {}', r.status, 404);
      r = await pedir('PATCH', `${R}/abc`, {});
      chequear('PATCH /abc con {}', r.status, 400);

      // PATCH al mismo tamaño: 200, sin conflicto de cupo.
      r = await pedir('PATCH', `${R}/${creado}`, { tamano: 'PEQUENO' });
      chequear('PATCH mismo tamaño', r.status, 200);
      chequear('PATCH mismo tamaño mantiene precio', r.json?.data?.precio, 15000);

      // PATCH a GRANDE el viernes: el cupo GRANDE del día 1 está lleno (ids 1 y 2 precargados).
      r = await pedir('PATCH', `${R}/${creado}`, { tamano: 'GRANDE' });
      chequear('PATCH a GRANDE con cupo lleno (no se cuenta a sí mismo y no está en GRANDE)', r.status, 409);

      // Devolver dos veces.
      r = await pedir('POST', `${R}/${creado}/devolver`);
      chequear('POST devolver', r.status, 200);
      chequear('devolver pone DEVUELTO', r.json?.data?.estado, 'DEVUELTO');
      if (!r.json?.data?.fecha_devolucion) {
        fallidas++;
        console.log('✗ devolver debía poner fecha_devolucion');
      }
      r = await pedir('POST', `${R}/${creado}/devolver`);
      chequear('POST devolver otra vez', r.status, 409);

      // Un DEVUELTO no se edita ni se elimina.
      r = await pedir('PATCH', `${R}/${creado}`, { tamano: 'GRANDE' });
      chequear('PATCH a un DEVUELTO', r.status, 409);
      r = await pedir('DELETE', `${R}/${creado}`);
      chequear('DELETE a un DEVUELTO', r.status, 409);

      // Tras devolver, el asistente puede alquilar otra vez el mismo día.
      const r3 = await pedir('POST', R, { asistente_id: 5, dia_id: 1, tamano: 'PEQUENO' });
      chequear('POST tras devolver (cupo libre de nuevo)', r3.status, 201);
      const segundo = r3.json?.data?.id;
      if (segundo) {
        const rd = await pedir('DELETE', `${R}/${segundo}`);
        chequear('DELETE del segundo alquiler', rd.status, 200);
        r = await pedir('DELETE', `${R}/${segundo}`);
        chequear('DELETE dos veces', r.status, 404);
        r = await pedir('GET', `${R}/${segundo}`);
        chequear('GET de un REMOVED', r.status, 404);
        r = await pedir('POST', `${R}/${segundo}/devolver`);
        chequear('devolver un REMOVED', r.status, 404);

        // Tras eliminar también puede volver a alquilar.
        const r4 = await pedir('POST', R, { asistente_id: 5, dia_id: 1, tamano: 'PEQUENO' });
        chequear('POST tras eliminar', r4.status, 201);
        if (r4.json?.data?.id) {
          await pedir('DELETE', `${R}/${r4.json.data.id}`);
        }
      }
    }
  } finally {
    // Limpieza: el registro creado en EN_USO se devuelve para dejar la base como estaba.
    if (creado && r) {
      await pedir('POST', `${R}/${creado}/devolver`);
    }
  }

  // ---------- Disponibilidad ----------
  r = await pedir('GET', `${R}/dia/abc/disponibilidad`);
  chequear('disponibilidad diaId=abc', r.status, 400);
  r = await pedir('GET', `${R}/dia/999/disponibilidad`);
  chequear('disponibilidad día 999', r.status, 404);
  r = await pedir('GET', `${R}/dia/1/disponibilidad`);
  chequear('disponibilidad día 1', r.status, 200);
  chequear('día 1: dos tamaños', r.json?.data?.tamanos?.length, 2);
  const grandeDia1 = r.json?.data?.tamanos?.find((t) => t.tamano === 'GRANDE');
  chequear('día 1: cupo GRANDE lleno (2/2)', grandeDia1?.disponibles, 0);
  r = await pedir('GET', `${R}/dia/4/disponibilidad`);
  chequear('disponibilidad día 4', r.status, 200);

  // Contrato del cuerpo de disponibilidad.
  r = await pedir('GET', `${R}/dia/1/disponibilidad`);
  if (r.json?.data?.dia_id !== 1 || r.json?.data?.tamanos?.[0]?.tamano !== 'PEQUENO') {
    fallidas++;
    console.log('✗ disponibilidad debía empezar con PEQUENO y traer dia_id');
  }

  // ---------- Rutas inexistentes ----------
  r = await pedir('GET', `${BASE}/api/cajones`);
  chequear('ruta inexistente', r.status, 404);
  chequear('ruta inexistente responde {error}', r.json?.error !== undefined, true);
  r = await pedir('GET', `${R}/1/devolver`);
  chequear('GET no está permitido en devolver', r.status, 404);

  console.log(`\nResultado: ${fallidas === 0 ? 'TODAS EN VERDE ✓' : fallidas + ' fallidas ✗'}`);
  process.exit(fallidas === 0 ? 0 : 1);
}

main();