"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const FISICO = "#a8573d";
const PDF = "#3a6fa8";
const fmt = (n: number) => `$${n.toLocaleString("es-AR")}`;
const short = (n: number) => (n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)} M` : n >= 1000 ? `$${Math.round(n / 1000)} mil` : `$${n}`);
const day = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" });

export function SalesChart({ data }: { data: { day: string; fisico: number; pdf: number }[] }) {
  const empty = data.every((d) => d.fisico + d.pdf === 0);
  return (
    <figure>
      <div className="mb-3 flex flex-wrap items-center gap-5 text-sm" aria-hidden>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: FISICO }} />Libro físico</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: PDF }} />PDF</span>
      </div>
      {empty ? (
        <p className="grid h-64 place-items-center rounded-lg border border-dashed border-line text-sm text-ink-soft">Todavía no hay ventas pagadas en este período.</p>
      ) : (
        <div className="h-72" role="img" aria-label="Ventas de productos por día, separadas en libro físico y PDF">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }} barCategoryGap="18%">
              <CartesianGrid vertical={false} stroke="#e8dfd2" />
              <XAxis dataKey="day" tickFormatter={day} tick={{ fontSize: 11, fill: "#6e5a4b" }} axisLine={false} tickLine={false} minTickGap={24} />
              <YAxis tickFormatter={short} tick={{ fontSize: 11, fill: "#6e5a4b" }} axisLine={false} tickLine={false} width={64} />
              <Tooltip
                cursor={{ fill: "rgba(58,42,31,.06)" }}
                formatter={(v, name) => [fmt(Number(v)), name === "fisico" ? "Libro físico" : "PDF"]}
                labelFormatter={(l) => day(String(l))}
                contentStyle={{ borderRadius: 8, border: "1px solid #dccfbd", fontSize: 13 }}
              />
              <Bar isAnimationActive={false} dataKey="fisico" stackId="a" fill={FISICO} stroke="#fbf7f0" strokeWidth={1} />
              <Bar isAnimationActive={false} dataKey="pdf" stackId="a" fill={PDF} stroke="#fbf7f0" strokeWidth={1} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-ink-soft">Ver como tabla</summary>
        <table className="mt-2 w-full text-left">
          <thead className="text-ink-soft"><tr><th className="font-normal">Día</th><th className="text-right font-normal">Físico</th><th className="text-right font-normal">PDF</th></tr></thead>
          <tbody>
            {data.filter((d) => d.fisico + d.pdf > 0).map((d) => (
              <tr key={d.day}><td>{day(d.day)}</td><td className="text-right">{fmt(d.fisico)}</td><td className="text-right">{fmt(d.pdf)}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
