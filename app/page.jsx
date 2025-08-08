
"use client";
import React, { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Wallet, Factory, Users, LineChart as LineChartIcon, Banknote, Flame, CalendarClock, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

// --- Helper utilities ---
const fmt = (n, c = "$") => `${c}${Number(n).toLocaleString()}`;
const pct = (n) => `${(n * 100).toFixed(1)}%`;

// Fake companies & segments
const CUSTOMERS = [
  { name: "Spinlytics AI", segment: "Enterprise", acct: "SPN-1029" },
  { name: "GyroFlow Robotics", segment: "Enterprise", acct: "GFR-2211" },
  { name: "FidgetCloud", segment: "Mid-Market", acct: "FGC-9876" },
  { name: "LoopNest Labs", segment: "Mid-Market", acct: "LNL-5542" },
  { name: "QuantaSpin", segment: "SMB", acct: "QSP-3030" },
  { name: "OrbitMind", segment: "SMB", acct: "ORB-7781" },
  { name: "ZenSpinner", segment: "SMB", acct: "ZSP-9001" },
  { name: "VectorBay", segment: "Enterprise", acct: "VBY-6402" },
  { name: "AxiomKinetics", segment: "Mid-Market", acct: "AXK-1210" },
  { name: "FluxAgents", segment: "SMB", acct: "FLX-4141" },
];

function generateTimeSeries(days = 90) {
  const today = new Date();
  return Array.from({ length: days }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    // Lightly correlated series for demo
    const bookings = 180000 + Math.sin(i / 6) * 25000 + Math.random() * 15000;
    const revenue = bookings * (0.78 + Math.sin(i / 14) * 0.05);
    const cogs = revenue * (0.36 + Math.cos(i / 10) * 0.03);
    const opEx = 130000 + Math.cos(i / 7) * 18000 + Math.random() * 12000;
    const cashIn = revenue * 0.9; // assume some AR
    const cashOut = cogs + opEx;
    const churn = 0.012 + (Math.sin(i / 20) + 1) * 0.004; // 1.2%–2.0%
    const newCust = 18 + Math.round(Math.max(0, 16 + Math.sin(i / 5) * 6 + (Math.random() - 0.5) * 8));
    return {
      date: d.toISOString().slice(0, 10),
      bookings: Math.max(80000, Math.round(bookings)),
      revenue: Math.max(60000, Math.round(revenue)),
      cogs: Math.round(cogs),
      opEx: Math.round(opEx),
      cashIn: Math.round(cashIn),
      cashOut: Math.round(cashOut),
      churn,
      newCust,
    };
  });
}

function useDemoData(range) {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return useMemo(() => generateTimeSeries(days), [range]);
}

// Simple AR aging buckets (fake)
function makeARAging() {
  const rows = CUSTOMERS.slice(0, 7).map((c) => {
    const b0 = Math.round(Math.random() * 40000);
    const b30 = Math.round(Math.random() * 30000);
    const b60 = Math.round(Math.random() * 20000);
    const b90 = Math.round(Math.random() * 15000);
    return { ...c, b0, b30, b60, b90, total: b0 + b30 + b60 + b90 };
  });
  return rows.sort((a, b) => b.total - a.total);
}

// --- Main Component ---
export default function Page() {
  const [range, setRange] = useState("30d");
  const [currency, setCurrency] = useState("USD");
  const [search, setSearch] = useState("");
  const [openRange, setOpenRange] = useState(false);
  const [openCurrency, setOpenCurrency] = useState(false);

  const data = useDemoData(range);
  const arAging = useMemo(() => makeARAging(), [range]);

  const currencySymbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";

  // KPIs derived from data
  const last = data[data.length - 1];
  const first = data[0];
  const revSum = data.reduce((s, d) => s + d.revenue, 0);
  const opSum = data.reduce((s, d) => s + d.opEx, 0);
  const cogsSum = data.reduce((s, d) => s + d.cogs, 0);
  const grossMargin = (revSum - cogsSum) / Math.max(revSum, 1);
  const burn = Math.max(0, opSum + cogsSum - revSum) / data.length; // avg daily burn
  const cash = 22500000 - data.reduce((s, d) => s + Math.max(0, d.cashOut - d.cashIn), 0); // fake cash runway calc
  const runwayDays = Math.max(0, Math.floor(cash / Math.max(burn, 1)));
  const growth = (last.revenue - first.revenue) / Math.max(first.revenue, 1);
  const cac = 420; // demo constant
  const arpu = (revSum / data.reduce((s, d) => s + d.newCust, 0)) * 2.4; // rough demo
  const ltv = arpu * 18; // 18-month horizon
  const ltvCac = ltv / cac;
  const payback = Math.max(1, Math.round(cac / Math.max(arpu, 1)));

  const filteredCustomers = CUSTOMERS.filter((c) =>
    `${c.name} ${c.segment} ${c.acct}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100 p-6">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/90 shadow-md shadow-fuchsia-700/30">
              <Factory className="h-5 w-5" />
            </span>
            SpinNest, Inc. — CFO Daily Dashboard
          </h1>
          <p className="text-slate-300/80 text-sm md:text-base mt-1">Digital fidget spinners for AI agents · Series D</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Range Select */}
          <div className="relative">
            <Select value={range} onValueChange={setRange}>
              {({ value, onValueChange }) => (
                <>
                  <SelectTrigger
                    className="w-32 bg-slate-800/70 border-slate-700 text-slate-100"
                    onClick={() => setOpenRange((o) => !o)}
                  >
                    <SelectValue placeholder="Range" value={value} />
                  </SelectTrigger>
                  <SelectContent
                    className="bg-slate-800 text-slate-100 border-slate-700 w-32 rounded-xl"
                    open={openRange}
                    onClose={() => setOpenRange(false)}
                  >
                    <SelectItem value="7d" onSelect={(v) => { onValueChange(v); setOpenRange(false); }}>Last 7 days</SelectItem>
                    <SelectItem value="30d" onSelect={(v) => { onValueChange(v); setOpenRange(false); }}>Last 30 days</SelectItem>
                    <SelectItem value="90d" onSelect={(v) => { onValueChange(v); setOpenRange(false); }}>Last 90 days</SelectItem>
                  </SelectContent>
                </>
              )}
            </Select>
          </div>

          {/* Currency Select */}
          <div className="relative">
            <Select value={currency} onValueChange={setCurrency}>
              {({ value, onValueChange }) => (
                <>
                  <SelectTrigger
                    className="w-28 bg-slate-800/70 border-slate-700 text-slate-100"
                    onClick={() => setOpenCurrency((o) => !o)}
                  >
                    <SelectValue placeholder="Currency" value={value} />
                  </SelectTrigger>
                  <SelectContent
                    className="bg-slate-800 text-slate-100 border-slate-700 w-28 rounded-xl"
                    open={openCurrency}
                    onClose={() => setOpenCurrency(false)}
                  >
                    <SelectItem value="USD" onSelect={(v) => { onValueChange(v); setOpenCurrency(false); }}>USD</SelectItem>
                    <SelectItem value="EUR" onSelect={(v) => { onValueChange(v); setOpenCurrency(false); }}>EUR</SelectItem>
                    <SelectItem value="GBP" onSelect={(v) => { onValueChange(v); setOpenCurrency(false); }}>GBP</SelectItem>
                  </SelectContent>
                </>
              )}
            </Select>
          </div>

          <Button className="text-white">Export CSV</Button>
        </div>
      </header>

      {/* KPI Ribbon */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Revenue (period)"
          value={fmt(revSum, currencySymbol)}
          sub={`${pct(growth)} vs. period start`}
          icon={<LineChartIcon className="h-5 w-5" />}
          accent="from-emerald-500 to-teal-500"
          trendUp={growth >= 0}
        />
        <KpiCard
          title="Gross Margin"
          value={pct(grossMargin)}
          sub={`${fmt(revSum - cogsSum, currencySymbol)} gross profit`}
          icon={<Wallet className="h-5 w-5" />}
          accent="from-sky-500 to-indigo-500"
          trendUp={grossMargin >= 0.6}
        />
        <KpiCard
          title="Avg Daily Burn"
          value={`-${fmt(Math.round(burn), currencySymbol)}`}
          sub={`${runwayDays} days runway`}
          icon={<Flame className="h-5 w-5" />}
          accent="from-rose-500 to-fuchsia-600"
          trendUp={false}
        />
        <KpiCard
          title="LTV : CAC"
          value={`${ltvCac.toFixed(2)}x`}
          sub={`Payback ~${payback} mo`}
          icon={<Users className="h-5 w-5" />}
          accent="from-amber-500 to-orange-600"
          trendUp={ltvCac >= 3}
        />
      </section>

      {/* Charts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Revenue vs. Cost</h3>
              <span className="text-xs text-slate-400">Daily</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedRevenue data={data} currency={currencySymbol} />
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Cash In / Out & Burn</h3>
              <span className="text-xs text-slate-400">Daily</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="cashIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cashOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8" }} hide />
                  <YAxis tick={{ fill: "#94a3b8" }} />
                  <Tooltip content={<MoneyTooltip currency={currencySymbol} />} />
                  <Area type="monotone" dataKey="cashIn" stroke="#22d3ee" fillOpacity={1} fill="url(#cashIn)" />
                  <Area type="monotone" dataKey="cashOut" stroke="#f97316" fillOpacity={1} fill="url(#cashOut)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">New Customers & Churn</h3>
              <span className="text-xs text-slate-400">Daily</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8" }} hide />
                  <YAxis tick={{ fill: "#94a3b8" }} />
                  <Tooltip content={<CustomerTooltip />} />
                  <Bar dataKey="newCust" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                  <Line type="monotone" dataKey={(d) => d.churn * 1000} stroke="#ef4444" dot={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* AR Aging & Pipeline */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
        <Card className="bg-slate-900/60 border-slate-800 lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
              <h3 className="font-semibold">Top A/R Aging</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 text-slate-400 absolute left-2 top-2.5" />
                  <Input
                    placeholder="Search customers"
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Banknote className="h-4 w-4 mr-2" /> Record Payment
                </Button>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-300">
                  <tr className="border-b border-slate-800">
                    <th className="py-2 pr-2">Customer</th>
                    <th className="py-2 pr-2">Segment</th>
                    <th className="py-2 pr-2 text-right">0–30</th>
                    <th className="py-2 pr-2 text-right">31–60</th>
                    <th className="py-2 pr-2 text-right">61–90</th>
                    <th className="py-2 pr-2 text-right">90+</th>
                    <th className="py-2 pr-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {arAging
                    .filter((r) => filteredCustomers.some((c) => c.name === r.name))
                    .map((r) => (
                      <tr key={r.acct} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                        <td className="py-2 pr-2">
                          <div className="font-medium">{r.name}</div>
                          <div className="text-xs text-slate-400">{r.acct}</div>
                        </td>
                        <td className="py-2 pr-2">{r.segment}</td>
                        <td className="py-2 pr-2 text-right text-sky-300">{fmt(r.b0, currencySymbol)}</td>
                        <td className="py-2 pr-2 text-right text-emerald-300">{fmt(r.b30, currencySymbol)}</td>
                        <td className="py-2 pr-2 text-right text-amber-300">{fmt(r.b60, currencySymbol)}</td>
                        <td className="py-2 pr-2 text-right text-rose-300">{fmt(r.b90, currencySymbol)}</td>
                        <td className="py-2 pr-2 text-right font-semibold">{fmt(r.total, currencySymbol)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Bookings Pipeline (demo)</h3>
              <CalendarClock className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-sm text-slate-300 mb-3">Next 60–90 days by stage</div>
            <div className="space-y-3">
              <Stage label="Qualified" amount={680000} pct={0.55} color="bg-emerald-500" currency={currencySymbol} />
              <Stage label="Proposal" amount={420000} pct={0.34} color="bg-sky-500" currency={currencySymbol} />
              <Stage label="Negotiation" amount={240000} pct={0.19} color="bg-amber-500" currency={currencySymbol} />
              <Stage label="Verbal Win" amount={120000} pct={0.12} color="bg-fuchsia-500" currency={currencySymbol} />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer notes */}
      <footer className="text-xs text-slate-400/80">
        <p>
          Demo data only. KPIs shown: Revenue, Gross Margin, Burn/Runway, LTV:CAC, Cash In/Out, A/R Aging, New Customers, Churn, and
          Pipeline. Designed for CFO & C‑suite daily review.
        </p>
      </footer>
    </div>
  );
}

// --- Subcomponents ---
function KpiCard({ title, value, sub, icon, accent = "from-teal-500 to-cyan-500", trendUp = true }) {
  return (
    <Card className="bg-slate-900/60 border-slate-800 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">{title}</div>
            <div className="text-2xl font-bold mt-1 flex items-center gap-2">
              {value}
              {trendUp ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-rose-400" />
              )}
            </div>
            <div className="text-slate-400 text-xs mt-1">{sub}</div>
          </div>
          <div className={`p-3 rounded-2xl text-white bg-gradient-to-br ${accent} shadow-xl shadow-black/30`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stage({ label, amount, pct, color, currency }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-200">{label}</span>
        <span className="font-medium">{fmt(amount, currency)}</span>
      </div>
      <div className="h-2 mt-2 rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${Math.min(100, pct * 100)}%` }} />
      </div>
    </div>
  );
}

function MoneyTooltip({ active, payload, label, currency }) {
  if (active && payload && payload.length) {
    const ci = payload.find((p) => p.dataKey === "cashIn");
    const co = payload.find((p) => p.dataKey === "cashOut");
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/90 p-2 text-xs">
        <div className="text-slate-400">{label}</div>
        <div className="mt-1">Cash In: <span className="font-semibold">{fmt(ci?.value ?? 0, currency)}</span></div>
        <div>Cash Out: <span className="font-semibold">{fmt(co?.value ?? 0, currency)}</span></div>
      </div>
    );
  }
  return null;
}

function CustomerTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const nc = payload.find((p) => p.dataKey === "newCust");
    const churnApprox = payload.find((p) => typeof p.dataKey === "function");
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/90 p-2 text-xs">
        <div className="text-slate-400">{label}</div>
        <div className="mt-1">New Customers: <span className="font-semibold">{nc?.value ?? 0}</span></div>
        <div>Churn Index: <span className="font-semibold">{Math.round((churnApprox?.value ?? 0) / 10) / 10}%</span></div>
      </div>
    );
  }
  return null;
}

function ComposedRevenue({ data, currency }) {
  return (
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
      <XAxis dataKey="date" tick={{ fill: "#94a3b8" }} hide />
      <YAxis tick={{ fill: "#94a3b8" }} />
      <Tooltip content={<RevTooltip currency={currency} />} />
      <Line type="monotone" dataKey="revenue" stroke="#34d399" dot={false} strokeWidth={2} />
      <Line type="monotone" dataKey="opEx" stroke="#a78bfa" dot={false} />
      <Line type="monotone" dataKey="cogs" stroke="#f59e0b" dot={false} />
    </LineChart>
  );
}

function RevTooltip({ active, payload, label, currency }) {
  if (active && payload && payload.length) {
    const rec = Object.fromEntries(payload.map((p) => [p.dataKey, p.value]));
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/90 p-2 text-xs">
        <div className="text-slate-400">{label}</div>
        <div className="mt-1">Revenue: <span className="font-semibold">{fmt(rec.revenue ?? 0, currency)}</span></div>
        <div>OpEx: <span className="font-semibold">{fmt(rec.opEx ?? 0, currency)}</span></div>
        <div>COGS: <span className="font-semibold">{fmt(rec.cogs ?? 0, currency)}</span></div>
      </div>
    );
  }
  return null;
}
