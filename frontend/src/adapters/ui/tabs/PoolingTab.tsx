import { useEffect, useMemo, useState } from 'react';
import { services } from '../../../shared/serviceContainer';
import { AdjustedComplianceBalance } from '../../../core/domain/Compliance';
import { CreatePoolResponse } from '../../../core/domain/Pooling';
import { SummaryCard } from '../components/SummaryCard';
import { LoadingState, ErrorState } from '../components/State';

const currentYear = new Date().getFullYear();

type SelectionMap = Record<string, boolean>;

type Status = {
  tone: 'success' | 'danger';
  message: string;
};

export const PoolingTab = () => {
  const [year, setYear] = useState(currentYear);
  const [balances, setBalances] = useState<AdjustedComplianceBalance[]>([]);
  const [selection, setSelection] = useState<SelectionMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [creating, setCreating] = useState(false);
  const [poolResult, setPoolResult] = useState<CreatePoolResponse | null>(null);

  const fetchAdjustedBalances = async (targetYear: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await services.complianceService.getAdjustedComplianceBalances(targetYear);
      setBalances(data);
      setSelection(data.reduce<SelectionMap>((map, item) => ({ ...map, [item.shipId]: true }), {}));
      setStatus({ tone: 'success', message: `Loaded ${data.length} ships for ${targetYear}` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load adjusted balances';
      setError(message);
      setStatus({ tone: 'danger', message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdjustedBalances(year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const selectedMembers = useMemo(
    () =>
      balances
        .filter((item) => selection[item.shipId])
        .map((item) => ({ shipId: item.shipId, cbBefore: item.adjustedCb ?? item.cbGco2eq })),
    [balances, selection]
  );

  const poolSum = selectedMembers.reduce((sum, member) => sum + member.cbBefore, 0);
  const hasDeficit = selectedMembers.some((member) => member.cbBefore < 0);

  const isValid = selectedMembers.length >= 2 && poolSum >= 0;

  const handleToggle = (shipId: string) => {
    setSelection((prev) => ({ ...prev, [shipId]: !prev[shipId] }));
  };

  const handleCreatePool = async () => {
    if (!isValid) return;
    try {
      setCreating(true);
      const payload = {
        year,
        members: selectedMembers.map((member) => ({
          shipId: member.shipId,
          cbBefore: Math.round(member.cbBefore * 100) / 100,
        })),
      };
      const result = await services.poolingService.createPool(payload);
      setPoolResult(result);
      setStatus({ tone: 'success', message: `Pool ${result.poolId} created successfully` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create pool';
      setStatus({ tone: 'danger', message });
    } finally {
      setCreating(false);
    }
  };

  if (loading && balances.length === 0) {
    return <LoadingState title="Loading adjusted balances" message="Calculating pool eligibility" />;
  }

  if (error && balances.length === 0) {
    return <ErrorState title="Unable to load pooling data" message={error} />;
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Selected Ships"
          value={selectedMembers.length}
          subtitle="Members included in pool"
        />
        <SummaryCard
          title="Pool Sum (gCO₂e)"
          value={poolSum.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          subtitle="Must remain ≥ 0"
          tone={poolSum >= 0 ? 'success' : 'danger'}
        />
        <SummaryCard
          title="Outcome"
          value={poolResult ? `Pool #${poolResult.poolId}` : '—'}
          subtitle={poolResult ? 'Allocation complete' : 'Create pool to view results'}
          tone={poolResult ? 'success' : 'default'}
        />
      </section>

      {status && (
        <p className={`text-sm ${status.tone === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>{status.message}</p>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Adjusted Compliance Balances</h2>
            <p className="text-sm text-slate-300">Select ships to include in pool (deficits require surplus partners).</p>
          </div>
          <label className="text-sm text-slate-300">
            Year
            <input
              type="number"
              value={year}
              min={2020}
              max={2100}
              onChange={(event) => setYear(Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </label>
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Include</th>
                <th className="px-4 py-3 text-left">Ship</th>
                <th className="px-4 py-3 text-right">Compliance Balance</th>
                <th className="px-4 py-3 text-right">Adjusted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {balances.map((item) => {
                const cb = item.cbGco2eq;
                const adjusted = item.adjustedCb ?? cb;
                const isSelected = selection[item.shipId];
                const tone = adjusted >= 0 ? 'text-emerald-300' : 'text-rose-300';

                return (
                  <tr key={item.shipId} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => handleToggle(item.shipId)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-brand focus:ring-brand"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{item.shipId}</td>
                    <td className={`px-4 py-3 text-right ${tone}`}>{cb.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className={`px-4 py-3 text-right ${tone}`}>{adjusted.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {loading && <div className="p-4 text-sm text-slate-400">Refreshing data…</div>}
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className={`text-sm ${poolSum >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            Pool sum must remain positive. {hasDeficit ? 'Ensure deficits have sufficient surplus coverage.' : ''}
          </p>
          <button
            onClick={handleCreatePool}
            disabled={!isValid || creating}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? 'Creating…' : 'Create Pool'}
          </button>
        </div>
      </section>

      {poolResult && (
        <section className="overflow-hidden rounded-xl border border-slate-800">
          <header className="bg-slate-900/60 px-4 py-3 text-sm font-semibold text-white">
            Pool Allocation Results
          </header>
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/40 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Ship</th>
                <th className="px-4 py-3 text-right">Before (gCO₂e)</th>
                <th className="px-4 py-3 text-right">After (gCO₂e)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {poolResult.members.map((member) => (
                <tr key={member.shipId} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-medium text-white">{member.shipId}</td>
                  <td className="px-4 py-3 text-right">{member.cbBefore.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="px-4 py-3 text-right">{member.cbAfter.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};
