import path from "node:path";

/**
 * Carpeta de datos persistentes: base de datos, portadas y PDF subidos.
 * En el servidor, DATA_DIR tiene que apuntar a un disco que no se borre
 * entre publicaciones (por ejemplo, un volumen montado en /data).
 */
export const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
export const PDFS_DIR = path.join(DATA_DIR, "pdfs");
