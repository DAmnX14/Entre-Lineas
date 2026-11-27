# Entre Líneas — libros para guardar historias

Tienda online de libros para completar con recuerdos (para mamá, papá, abuelos, hermanos, parejas, hijos, amigos y para uno mismo), en formato físico y PDF.

> El nombre, el logo (`public/brand/`), los contactos, las redes y las reglas comerciales se configuran en `src/lib/brand.ts`.

## Cómo correrla

```bash
npm install
cp .env.example .env.local   # completá los valores
npm run dev
```

- Tienda: http://localhost:3000
- Panel: http://localhost:3000/admin (usuario de `ADMIN_EMAIL` / `ADMIN_PASSWORD`; sin variables se crea `admin@entrelineas.local` con la clave `cambiar-esta-clave`, solo para desarrollo).
- La base de datos (SQLite) se crea y se carga sola la primera vez en `data/tienda.db`, con 46 libros, 10 packs y 2 cupones (`BIENVENIDA10`, `ENVIOGRATIS`).

## Qué incluye

**Tienda**: inicio, catálogo con buscador y filtros (destinatario, ocasión, formato, orden), ficha de producto con selector físico/PDF, vista de tapa, mockup e interiores, índice completo del libro, personalización del regalo (destinatario, remitente, dedicatoria, ocasión, fecha, packaging y tarjeta), packs fijos y de «elegí N libros», carrito con cupones, checkout con envío por código postal y facturación, cuenta con historial y descargas, favoritos, preguntas frecuentes, contacto, WhatsApp, newsletter y botones para compartir.

**Pagos**: Mercado Pago Checkout Pro (se activa con `MP_ACCESS_TOKEN`; webhook en `/api/pagos/mercadopago`) y transferencia bancaria con descuento. Sin token, en desarrollo aparece un «Pago de prueba» para recorrer el flujo completo.

**PDF**: al pagarse, cada PDF genera un enlace seguro (30 días, 10 descargas) que se puede renovar. Si el libro no tiene un PDF diseñado subido, se genera automáticamente desde su estructura, en A4 o 17 × 24 cm, con la dedicatoria del cliente impresa.

**Panel**: resumen con ventas por día (físico y PDF por separado), más vendidos, stock bajo y pedidos por despachar; pedidos con estados y seguimiento; ABM de libros (portada, PDF, precios, precio promocional, stock, estructura editable); packs; cupones; clientes; opiniones; mensajes, suscriptores y correos generados; reportes CSV.

## Publicar en Railway

1. En railway.com: **New Project → Deploy from GitHub repo** y elegí este repositorio.
2. En el servicio, **Variables**: cargá las de `.env.example` y además `DATA_DIR=/data`. `NEXT_PUBLIC_SITE_URL` es la dirección pública con `https://`.
3. Agregá un **Volume** al servicio con el punto de montaje `/data`. Ahí viven la base de datos, las portadas y los PDF subidos: sin volumen se borran en cada publicación.
4. **Settings → Networking → Generate Domain** (o conectá tu dominio).
5. En Mercado Pago, configurá el webhook `https://tu-dominio/api/pagos/mercadopago` y cargá `MP_WEBHOOK_SECRET`.

Cada `git push` a `main` vuelve a publicar la tienda.

## Antes de publicar

1. **Base de datos y archivos.** La base (SQLite), las portadas y los PDF subidos se guardan en `DATA_DIR`, que tiene que estar en un disco persistente (volumen de Railway, Render o un VPS). En Vercel u otro hosting sin disco persistente hay que migrar a PostgreSQL (todo el SQL está en `src/lib/db.ts` y `src/lib/repo.ts`) y guardar portadas y PDF en un almacenamiento de archivos.
2. **Correo.** Los correos (confirmación, descargas, envíos) se guardan en la tabla `outbox` y se ven en el panel. Para enviarlos hay que conectar un proveedor (Resend, Postmark, etc.) en `queueEmail` de `src/lib/repo.ts`.
3. **Fotografías.** El sitio usa tapas e ilustraciones generadas. Reemplazalas por fotos reales del producto: portadas desde el panel y la polaroid del inicio en `src/components/home/Hero.tsx`.
4. **Opiniones.** La sección de opiniones muestra solo testimonios reales aprobados en el panel. No hay reseñas inventadas.
5. **Datos comerciales.** CBU, alias, WhatsApp, redes, tarifas de envío (`src/lib/pricing.ts`) y precios.
6. Definí `SESSION_SECRET`, `ADMIN_PASSWORD` y `NEXT_PUBLIC_SITE_URL`.

## Estructura

```
src/lib/content/   catálogo, preguntas de cada libro, taxonomías y FAQ
src/lib/           base de datos, precios, pagos, PDF, sesiones
src/app/(tienda)/  páginas públicas
src/app/admin/     panel de administración
src/app/api/       carrito, checkout, pagos, descargas, reportes
```
