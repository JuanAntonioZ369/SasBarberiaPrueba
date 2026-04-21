"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  day: string;
  ingresos: number;
  gastos: number;
}

interface RevenueChartProps {
  data: DataPoint[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        barCategoryGap="30%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: "#999", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#999", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          contentStyle={{
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "0.5rem",
            color: "#f5f5f5",
            fontSize: "0.8rem",
          }}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          formatter={(value, name) => [
            `$${value}`,
            name === "ingresos" ? "Ingresos" : "Gastos",
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: "0.75rem", color: "#999" }}
          formatter={(value) => (value === "ingresos" ? "Ingresos" : "Gastos")}
        />
        <Bar dataKey="ingresos" fill="#d4a843" radius={[3, 3, 0, 0]} />
        <Bar dataKey="gastos" fill="#ef4444" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
