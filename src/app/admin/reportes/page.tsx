const REPORTS = [
  ["ventas", "Ventas por producto", "Unidades e ingresos de cada libro y pack, separados por formato físico y PDF."],
  ["pedidos", "Pedidos", "Todos los pedidos con cliente, estado, medio de pago, envío y totales."],
  ["clientes", "Clientes", "Clientes registrados e invitados, con compras y total gastado."],
  ["stock", "Stock", "Stock físico de cada libro."],
  ["newsletter", "Suscriptores", "Correos suscriptos al newsletter."],
];

export default function ReportsAdmin() {
  return (
    <div>
      <h1 className="text-4xl">Reportes</h1>
      <p className="mt-2 text-sm text-ink-soft">Archivos CSV que se abren con Excel o Google Sheets.</p>
      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {REPORTS.map(([k, t, d]) => (
          <li key={k} className="flex flex-col rounded-xl bg-paper p-6">
            <h2 className="text-xl">{t}</h2>
            <p className="mt-1 flex-1 text-sm text-ink-soft">{d}</p>
            <a href={`/api/admin/reportes?tipo=${k}`} className="btn btn-ghost mt-4 w-fit min-h-0 py-2">Descargar CSV</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
