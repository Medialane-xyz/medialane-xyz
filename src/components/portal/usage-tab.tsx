"use client";

import useSWR from "swr";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { BarChart2, AlertCircle } from "lucide-react";

interface UsageDay {
  date: string;
  requests: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatDay(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function UsageTab() {
  const { data, error, isLoading } = useSWR<{ usage: UsageDay[] }>(
    "/api/portal/usage",
    fetcher
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive p-4 rounded-xl border border-destructive/20 bg-destructive/5">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span className="text-sm">Failed to load usage data. Make sure the backend is running.</span>
      </div>
    );
  }

  const rawUsage = data?.usage ?? [];
  // Ensure 30 days; fill missing days with 0
  const chartData = rawUsage.map((d) => ({
    date: formatDay(d.date),
    requests: d.requests,
  }));

  const total = chartData.reduce((sum, d) => sum + d.requests, 0);

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            API Usage — Last 30 Days
          </CardTitle>
          <CardDescription>
            Total requests:{" "}
            <span className="text-foreground font-semibold">{total.toLocaleString()}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No usage data yet. Start making API calls to see activity here.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  cursor={{ fill: "hsl(var(--primary) / 0.08)" }}
                />
                <Bar
                  dataKey="requests"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
