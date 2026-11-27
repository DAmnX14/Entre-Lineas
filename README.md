# Puño y Letra — tienda de libros de recuerdos

Tienda online de libros para completar con recuerdos (para mamá, papá, abuelos, hermanos, parejas, hijos, amigos y para uno mismo), en formato físico y PDF.

> «Puño y Letra» es un nombre provisorio. Se cambia en `src/lib/brand.ts` junto con contactos, redes y reglas comerciales.

## Cómo correrla

```bash
npm install
cp .env.example .env.local   # completá los valores
npm run dev
```

- Tienda: http://localhost:3000
- Panel: http://localhost:3000/admin (usuario de `ADMIN_EMAIL` / `ADMIN_PASSWORD`; sin variables se crea `admin@punoyletra.local` con la clave `cambiar-esta-clave`, solo para desarrollo).
- La base de datos (SQLite) se crea y se carga sola la primera vez en `data/tienda.db`, con 46 libros, 10 packs y 2 cupones (`BIENVENIDA10`, `ENVIOGRATIS`).

## Qué incluye

**Tienda**: inicio, catálogo con buscador y filtros (destinatario, ocasión, formato, orden), ficha de producto con selector físico/PDF, vista de tapa, mockup e interiores, índice completo del libro, personalización del regalo (destinatario, remitente, dedicatoria, ocasión, fecha, packaging y tarjeta), packs fijos y de «elegí N libros», carrito con cupones, checkout con envío por código postal y facturación, cuenta con historial y descargas, favoritos, preguntas frecuentes, contacto, WhatsApp, newsletter y botones para compartir.

**Pagos**: Mercado Pago Checkout Pro (se activa con `MP_ACCESS_TOKEN`; webhook en `/api/pagos/mercadopago`) y transferencia bancaria con descuento. Sin token, en desarrollo aparece un «Pago de prueba» para recorrer el flujo completo.

**PDF**: al pagarse, cada PDF genera un enlace seguro (30 días, 10 descargas) que se puede renovar. Si el libro no tiene un PDF diseñado subido, se genera automáticamente desde su estructura, en A4 o 17 × 24 cm, con la dedicatoria del cliente impresa.

**Panel**: resumen con ventas por día (físico y PDF por separado), más vendidos, stock bajo y pedidos por despachar; pedidos con estados y seguimiento; ABM de libros (portada, PDF, precios, precio promocional, stock, estructura editable); packs; cupones; clientes; opiniones; mensajes, suscriptores y correos generados; reportes CSV.

## Antes de publicar

1. **Base de datos y archivos.** SQLite y la carpeta `storage/` sirven para un servidor propio (VPS, Railway, Render con disco). En Vercel u otro hosting sin disco persistente hay que migrar a PostgreSQL (todo el SQL está en `src/lib/db.ts` y `src/lib/repo.ts`) y guardar portadas y PDF en un almacenamiento de archivos (por ejemplo, Vercel Blob privado).
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
