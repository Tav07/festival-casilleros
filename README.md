# Módulo 16 — Casilleros · Festival Picnic 2026

Microservicio de la maratón del Festival Picnic 2026: gestiona el alquiler de casilleros (lockers) por día del festival. Cada asistente con boleta activa puede alquilar un casillero PEQUENO ($15.000) o GRANDE ($25.000) para uno de los días del evento, devolverlo cuando quiera y consultar la disponibilidad de cada tamaño por día.

## Integrante

Gustavo Andres Mendez Barrera. Hice todo el módulo solo: el diseño de las cuatro capas, el dominio con sus reglas de negocio, la API REST y las pruebas. Usé Claude Code como apoyo para escribir y revisar el código.

## Instalación y ejecución

```bash
# 1. Clonar y entrar
git clone https://github.com/Tav07/festival-casilleros.git
cd festival-casilleros

# 2. Instalar dependencias
npm install

# 3. Variables de entorno: copiar .env.example a .env y poner la DATABASE_URL real
#    (la base PostgreSQL es compartida por la clase; la entrega el docente)
cp .env.example .env

# 4. Sincronizar el esquema (prisma db pull + generate). NUNCA usar migrate ni db push:
#    la base es compartida por ~15 equipos.
npm run sync

# 5. Levantar la API
npm run dev        # escucha en el puerto de PORT (3000 por defecto)
```

Probar la API:

```bash
# Pruebas públicas del kit (con la API encendida), desde la carpeta del kit:
node pruebas/correr.mjs casilleros http://localhost:3000

# Pruebas propias de casos borde (están en este repo):
node pruebas-propias/casos-borde.mjs http://localhost:3000
```

## Endpoints

| Método | Ruta | Éxito | Descripción |
|---|---|---|---|
| GET | `/api/alquileres-casillero` | 200 | Listado paginado. Filtros: `?dia_id=`, `?asistente_id=`, `?tamano=`, `?estado=` |
| GET | `/api/alquileres-casillero/:id` | 200 | Un alquiler |
| POST | `/api/alquileres-casillero` | 201 | Crear. Body: `{ "asistente_id", "dia_id", "tamano" }` |
| PATCH | `/api/alquileres-casillero/:id` | 200 | Editar el tamaño (recalcula el precio) |
| DELETE | `/api/alquileres-casillero/:id` | 200 | Borrado lógico (`state: REMOVED`) |
| POST | `/api/alquileres-casillero/:id/devolver` | 200 | Devolver el casillero |
| GET | `/api/alquileres-casillero/dia/:diaId/disponibilidad` | 200 | Cupo y ocupación por tamaño de un día |

## Arquitectura (cuatro capas)

```
src/
├── domain/            # Entidad, constantes (precios, cupos), errores e INTERFACES de repositorio. Sin Prisma.
├── application/       # Casos de uso (toda la lógica) y validadores puros. Dependen solo de las interfaces.
├── infrastructure/    # PrismaClient (único lugar) e implementaciones Prisma de las interfaces.
└── interface/         # Controladores delgados, rutas HTTP, middlewares de error y container (inyección).
```

El flujo de una petición: `ruta → controlador → caso de uso → interfaz de repositorio → implementación Prisma`. Los errores de dominio (`ValidationError`, `NotFoundError`, `ConflictError`) salen por un único `errorHandler` que los traduce a 400/404/409 con un body `{ "error": "..." }`, sin stack traces.

## Regla de negocio: el cupo por tamaño

El festival tiene 100 casilleros PEQUENO y 2 GRANDE por cada día, y ese cupo no se pasa nunca. Lo que valida el servidor es sencillo: cuenta cuántos alquileres están con `estado = 'EN_USO'` y `state = 'ACTIVE'` en ese día y ese tamaño, y si ya llegaron al límite, el nuevo alquiler no entra y responde 409. Los casilleros devueltos o eliminados liberan su espacio.

La regla está en `src/application/use-cases/CrearAlquiler.ts` cuando se hace el POST. Lo que más me costó fue la parte del PATCH: si alguien cambia de tamaño, el cupo del tamaño nuevo se vuelve a revisar pero el propio alquiler no se cuenta a sí mismo, porque entonces nunca alcanzaría a moverse cuando el cupo está lleno. Esa parte quedó en `src/application/use-cases/EditarAlquiler.ts`. Si el tamaño que llega es el mismo que ya tenía, ni siquiera se revisa el cupo, así que ese PATCH siempre responde 200.

Cómo la probé: la precarga deja el cupo GRANDE del día 1 lleno con los ids 1 y 2, así que aproveché eso. Un POST con `{"asistente_id": 5, "dia_id": 1, "tamano": "GRANDE"}` responde 409 porque no queda ninguno. Un PATCH de un alquiler del día 1 a GRANDE también da 409, pero el mismo PATCH a PEQUENO responde 200 con el precio recalculado a 15000. La prueba pública "PATCH a GRANDE con el cupo lleno (409)" cubre este caso, y las pruebas propias de casos borde del repo lo repiten en otros escenarios.

## Notas

- `precio`, `estado` y `fecha_devolucion` los calcula y pone el servidor; si el cliente los manda en el POST, se ignoran.
- El borrado es lógico: la fila nunca se elimina, solo se marca `state = 'REMOVED'`.
- Solo se escribe en `alquileres_casillero`; de `asistentes`, `dias` y `boletas` solo se lee.