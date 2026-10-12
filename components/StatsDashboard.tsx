// components/StatsDashboard.tsx
"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  Image as ImageIcon,
  ScanLine,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
} from "lucide-react";
type Summary = {
  totalImages: number;
  totalScans: number;
  scansToday: number;
  scansThisWeek: number;
};

type TopImage = { id: string; count: number };
type ScanDay = { date: string; label: string; count: number };
type Referrer = { source: string; count: number };
type RecentScan = {
  id: number;
  imageId: string;
  scannedAt: string;
  referrer: string | null;
  country: string | null;
};

export default function StatsDashboard({
  summary,
  topImages,
  scansByDay,
  topReferrers,
  recentScans,
}: {
  summary: Summary;
  topImages: TopImage[];
  scansByDay: ScanDay[];
  topReferrers: Referrer[];
  recentScans: RecentScan[];
}) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total images"
          value={summary.totalImages}
          icon={<ImageIcon className="w-5 h-5 text-blue-500" />}
        />
        <StatCard
          label="Total scans"
          value={summary.totalScans}
          icon={<ScanLine className="w-5 h-5 text-purple-500" />}
        />
        <StatCard
          label="Scans today"
          value={summary.scansToday}
          icon={<Calendar className="w-5 h-5 text-green-500" />}
        />
        <StatCard
          label="Scans this week"
          value={summary.scansThisWeek}
          icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
        />
      </div>

      {/* Line chart — scans last 30 days */}
      <Card
        title="Scans over the last 30 days"
        icon={<TrendingUp className="w-4 h-4 text-blue-500" />}
      >
        {scansByDay.length === 0 ? (
          <Empty />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scansByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Bar chart — top 10 images */}
      <Card
        title="Top 10 most-scanned images"
        icon={<BarChart3 className="w-4 h-4 text-purple-500" />}
      >
        {topImages.length === 0 ? (
          <Empty />
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topImages.map((i) => ({
                  id: i.id,
                  label: i.id.slice(0, 6),
                  count: i.count,
                }))}
                layout="vertical"
                margin={{ left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  width={70}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Referrers */}
        <Card
          title="Top referrers"
          icon={<Users className="w-4 h-4 text-green-500" />}
        >
          {topReferrers.length === 0 ? (
            <Empty />
          ) : (
            <ul className="divide-y divide-slate-100">
              {topReferrers.map((r) => (
                <li
                  key={r.source}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="text-slate-700 truncate mr-2">
                    {r.source}
                  </span>
                  <span className="font-medium text-slate-900">{r.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent scans */}
        <Card
          title="Recent scans"
          icon={<Clock className="w-4 h-4 text-amber-500" />}
        >
          {recentScans.length === 0 ? (
            <Empty />
          ) : (
            <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {recentScans.map((s) => (
                <li key={s.id} className="py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/i/${s.imageId}`}
                      target="_blank"
                      className="font-mono text-xs text-blue-600 hover:underline"
                    >
                      {s.imageId}
                    </Link>
                    <span className="text-xs text-slate-500">
                      {new Date(s.scannedAt).toLocaleString()}
                    </span>
                  </div>
                  {s.referrer && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      from {s.referrer}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

// ---- Small helpers ----

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase text-slate-500 tracking-wide">
          {label}
        </p>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function Empty() {
  return (
    <p className="text-sm text-slate-400 py-6 text-center">
      Not enough data yet.
    </p>
  );
}
