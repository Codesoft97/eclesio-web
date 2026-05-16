"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = {
  accent: "var(--color-accent)",
  success: "#22c55e",
  danger: "#ef4444",
  primary: "var(--color-primary)",
  muted: "var(--color-muted)",
  border: "var(--color-border)",
};

const PALETTE = [
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#f97316",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f43f5e",
];

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string | number;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-surface/95 px-3 py-2 shadow-lg backdrop-blur-xl">
      {label ? (
        <p className="mb-1 text-xs font-medium text-muted">{label}</p>
      ) : null}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-foreground">
            {entry.name}:{" "}
            <strong>
              {formatter ? formatter(entry.value) : entry.value}
            </strong>
          </span>
        </div>
      ))}
    </div>
  );
}

export function RechartsDonut({
  data,
  emptyMessage,
  formatter,
}: {
  data: { label: string; value: number }[];
  emptyMessage: string;
  formatter?: (v: number) => string;
}) {
  const filtered = data.filter((d) => d.value > 0);

  if (filtered.length === 0) {
    return (
      <div className="grid min-h-56 place-items-center rounded-lg border border-dashed border-border bg-surface-subtle p-6 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  const total = filtered.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
      <ResponsiveContainer width={200} height={200}>
        <PieChart>
          <Pie
            data={filtered}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            strokeWidth={0}
          >
            {filtered.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => (
              <ChartTooltip
                active={active}
                payload={payload?.map((p) => ({
                  value: p.value as number,
                  name: p.name as string,
                  color: p.payload?.fill ?? PALETTE[0],
                }))}
                formatter={formatter}
              />
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid gap-2">
        {filtered.map((item, i) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
            />
            <span className="text-muted">{item.label}</span>
            <span className="ml-auto font-semibold text-foreground">
              {formatter ? formatter(item.value) : item.value}
            </span>
            <span className="text-xs text-muted">
              ({Math.round((item.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RechartsBar({
  data,
  emptyMessage,
  color = "accent",
  formatter,
  layout = "horizontal",
}: {
  data: { label: string; value: number }[];
  emptyMessage: string;
  color?: keyof typeof CHART_COLORS;
  formatter?: (v: number) => string;
  layout?: "horizontal" | "vertical";
}) {
  const filtered = data.filter((d) => d.value > 0);

  if (filtered.length === 0) {
    return (
      <div className="grid min-h-56 place-items-center rounded-lg border border-dashed border-border bg-surface-subtle p-6 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  const fillColor = CHART_COLORS[color] ?? CHART_COLORS.accent;

  if (layout === "vertical") {
    return (
      <ResponsiveContainer width="100%" height={Math.max(filtered.length * 48, 180)}>
        <BarChart data={filtered} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} tickFormatter={formatter} />
          <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 12, fill: "var(--color-foreground)" }} axisLine={false} tickLine={false} />
          <Tooltip content={({ active, payload, label }) => <ChartTooltip active={active} payload={payload?.map((p) => ({ value: p.value as number, name: p.name as string, color: fillColor }))} label={label as string | number} formatter={formatter} />} />
          <Bar dataKey="value" name="Valor" fill={fillColor} radius={[0, 6, 6, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={filtered} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} tickFormatter={formatter} />
        <Tooltip content={({ active, payload, label }) => <ChartTooltip active={active} payload={payload?.map((p) => ({ value: p.value as number, name: p.name as string, color: fillColor }))} label={label as string | number} formatter={formatter} />} />
        <Bar dataKey="value" name="Quantidade" fill={fillColor} radius={[6, 6, 0, 0]} barSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RechartsStacked({
  data,
  emptyMessage,
}: {
  data: { label: string; accepted: number; pending: number; declined: number }[];
  emptyMessage: string;
}) {
  if (data.length === 0) {
    return (
      <div className="grid min-h-56 place-items-center rounded-lg border border-dashed border-border bg-surface-subtle p-6 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
        <Tooltip content={({ active, payload, label }) => <ChartTooltip active={active} payload={payload?.map((p) => ({ value: p.value as number, name: p.name as string, color: p.color as string }))} label={label as string | number} />} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="accepted" name="Aceites" fill={CHART_COLORS.success} stackId="a" radius={[0, 0, 0, 0]} />
        <Bar dataKey="pending" name="Pendentes" fill={CHART_COLORS.accent} stackId="a" radius={[0, 0, 0, 0]} />
        <Bar dataKey="declined" name="Recusas" fill={CHART_COLORS.danger} stackId="a" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
