"use client";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/** Paleta validada (CVD/normal) para até 3 séries; a cor do texto nunca usa a cor da série. */
export const SERIES = { a: "#138A65", b: "#4F6FC2", c: "#C9952F" };

const axis = { stroke: "#5b6f66", fontSize: 12, tickLine: false, axisLine: false } as const;

function TooltipBox({ active, payload, label, suffix = "" }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string; suffix?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-lift">
      <p className="mb-1 font-bold text-ink">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-ink/80">
          <span className="size-2.5 rounded-full" style={{ background: p.color }} />
          {p.name}: <strong className="text-ink">{p.value ?? "—"}{p.value != null ? suffix : ""}</strong>
        </p>
      ))}
    </div>
  );
}

export function PercentBars({ data, label }: { data: { label: string; value: number }[]; label: string }) {
  return (
    <figure>
      <div className="h-56 w-full" role="img" aria-label={label}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e3e9e5" strokeDasharray="3 3" />
            <XAxis dataKey="label" {...axis} />
            <YAxis domain={[0, 100]} ticks={[0, 50, 100]} {...axis} tickFormatter={(v) => `${v}%`} />
            <Tooltip cursor={{ fill: "#e8f6ef" }} content={<TooltipBox suffix="%" />} />
            <Bar dataKey="value" name="Concluído" fill={SERIES.a} radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <DataTable caption={label} columns={["Período", "Concluído"]} rows={data.map((d) => [d.label, `${d.value}%`])} />
    </figure>
  );
}

export function WellbeingLines({ data, label }: { data: { label: string; humor: number | null; energia: number | null; sono: number | null }[]; label: string }) {
  return (
    <figure>
      <div className="h-60 w-full" role="img" aria-label={label}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e3e9e5" strokeDasharray="3 3" />
            <XAxis dataKey="label" {...axis} />
            <YAxis domain={[1, 5]} ticks={[1, 3, 5]} {...axis} />
            <Tooltip content={<TooltipBox />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#20352d" }} />
            <Line dataKey="humor" name="Humor" stroke={SERIES.a} strokeWidth={2} dot={{ r: 4 }} connectNulls />
            <Line dataKey="energia" name="Energia" stroke={SERIES.b} strokeWidth={2} dot={{ r: 4 }} connectNulls />
            <Line dataKey="sono" name="Sono" stroke={SERIES.c} strokeWidth={2} dot={{ r: 4 }} connectNulls strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <DataTable
        caption={label}
        columns={["Dia", "Humor", "Energia", "Sono"]}
        rows={data.map((d) => [d.label, d.humor ?? "—", d.energia ?? "—", d.sono ?? "—"].map(String))}
      />
    </figure>
  );
}

function DataTable({ caption, columns, rows }: { caption: string; columns: string[]; rows: string[][] }) {
  return (
    <details className="mt-2 text-xs text-muted">
      <summary className="cursor-pointer font-semibold">Ver dados em tabela</summary>
      <table className="mt-2 w-full text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>{columns.map((c) => <th key={c} className="py-1 pr-2 font-bold text-ink">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line">{r.map((c, j) => <td key={j} className="py-1 pr-2">{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
