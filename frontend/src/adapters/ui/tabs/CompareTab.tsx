import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  ReferenceLine,
} from 'recharts';
import { services } from '../../../shared/serviceContainer';
import { RouteComparisonRow } from '../../../core/domain/Route';
import { TARGET_INTENSITY_2025 } from '../../../core/domain/Compliance';
import { LoadingState, ErrorState } from '../components/State';

const formatPercent = (value: number) => `${value.toFixed(2)} %`;

export const CompareTab = () => {
  const [rows, setRows] = useState<RouteComparisonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await services.routeService.getComparisons();
        setRows(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load comparison data';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const baselineIntensity = rows[0]?.baseline.ghgIntensity ?? TARGET_INTENSITY_2025;

  const chartData = useMemo(() => {
    return rows.map((row) => ({
      routeId: row.routeId,
      baseline: row.baseline.ghgIntensity,
      comparison: row.comparison.ghgIntensity,
    }));
  }, [rows]);

  if (loading && rows.length === 0) {
    return <LoadingState title="Loading comparison" message="Computing intensity differences" />;
  }

  if (error && rows.length === 0) {
    return <ErrorState title="Unable to compare routes" message={error} />;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-lg font-semibold text-white">Baseline vs Comparison</h2>
        <p className="mt-1 text-sm text-slate-300">
          Target intensity (2025): <span className="font-mono">{TARGET_INTENSITY_2025.toFixed(4)} gCO₂e/MJ</span>
        </p>
        <div className="mt-6 h-80 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="routeId" stroke="#cbd5f5" />
                <YAxis stroke="#cbd5f5" label={{ value: 'ghgIntensity', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '0.75rem', color: '#e2e8f0' }}
                />
                <Legend />
                <ReferenceLine y={TARGET_INTENSITY_2025} stroke="#22d3ee" strokeDasharray="4 4" label={{ value: 'Target', fill: '#22d3ee' }} />
                <Bar dataKey="baseline" fill="#38bdf8" radius={[6, 6, 0, 0]} name="Baseline" />
                <Bar dataKey="comparison" fill="#f97316" radius={[6, 6, 0, 0]} name="Comparison" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">No data available</div>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left">Route ID</th>
              <th className="px-4 py-3 text-right">Baseline Intensity</th>
              <th className="px-4 py-3 text-right">Comparison Intensity</th>
              <th className="px-4 py-3 text-right">Difference</th>
              <th className="px-4 py-3 text-center">Compliant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.map((row) => (
              <tr key={row.routeId} className="hover:bg-slate-900/40">
                <td className="px-4 py-3 font-medium text-white">{row.routeId}</td>
                <td className="px-4 py-3 text-right">{row.baseline.ghgIntensity.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{row.comparison.ghgIntensity.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{formatPercent(row.percentDiff)}</td>
                <td className="px-4 py-3 text-center">
                  {row.compliant ? (
                    <span className="text-lg" role="img" aria-label="compliant">
                      ✅
                    </span>
                  ) : (
                    <span className="text-lg" role="img" aria-label="non-compliant">
                      ❌
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-4 text-sm text-slate-400">Refreshing data…</div>}
        {error && <div className="p-4 text-sm text-rose-300">{error}</div>}
      </section>
    </div>
  );
};
