import { FormEvent, useState } from 'react';
import { services } from '../../../shared/serviceContainer';
import { ComplianceBalance } from '../../../core/domain/Compliance';
import { BankRecord, BankingActionResult } from '../../../core/domain/Banking';
import { SummaryCard } from '../components/SummaryCard';
import { ErrorState } from '../components/State';

const currentYear = new Date().getFullYear();

type ActionStatus = {
  type: 'success' | 'error';
  message: string;
};

export const BankingTab = () => {
  const [shipId, setShipId] = useState('R001');
  const [year, setYear] = useState(currentYear);
  const [amountToApply, setAmountToApply] = useState(0);

  const [balance, setBalance] = useState<ComplianceBalance | null>(null);
  const [bankRecords, setBankRecords] = useState<BankRecord[]>([]);
  const [applyResult, setApplyResult] = useState<BankingActionResult | null>(null);
  const [status, setStatus] = useState<ActionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async (targetShipId: string, targetYear: number) => {
    setLoading(true);
    setError(null);
    try {
      const [cb, records] = await Promise.all([
        services.complianceService.getComplianceBalance(targetShipId, targetYear),
        services.bankingService.listBankRecords(targetShipId, targetYear),
      ]);
      setBalance(cb);
      setBankRecords(records);
      setApplyResult(null);
      setStatus({ type: 'success', message: 'Data refreshed' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load compliance data';
      setError(message);
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await refreshData(shipId, year);
  };

  const handleBankSurplus = async () => {
    if (!shipId) return;
    try {
      setLoading(true);
      await services.bankingService.bankSurplus(shipId, year);
      setStatus({ type: 'success', message: 'Surplus banked successfully' });
      await refreshData(shipId, year);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to bank surplus';
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBanked = async () => {
    if (!shipId || amountToApply <= 0) return;
    try {
      setLoading(true);
      const result = await services.bankingService.applyBanked(shipId, year, amountToApply);
      setApplyResult(result);
      setStatus({ type: 'success', message: 'Banked surplus applied' });
      await refreshData(shipId, year);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to apply banked surplus';
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:grid-cols-3"
      >
        <label className="text-sm text-slate-300">
          Ship / Route ID
          <input
            value={shipId}
            onChange={(event) => setShipId(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="R001"
            required
          />
        </label>
        <label className="text-sm text-slate-300">
          Year
          <input
            type="number"
            value={year}
            min={2020}
            max={2100}
            onChange={(event) => setYear(Number(event.target.value))}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand"
            required
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Load compliance'}
          </button>
        </div>
      </form>

      {status && (
        <p
          className={`text-sm ${
            status.type === 'success' ? 'text-emerald-300' : 'text-rose-300'
          }`}
        >
          {status.message}
        </p>
      )}

      {error && <ErrorState title="Action failed" message={error} />}

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Compliance Balance"
          value={balance ? balance.cbGco2eq.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '--'}
          subtitle={balance ? `${balance.shipId} • ${balance.year}` : 'Load a ship to view CB'}
          tone={balance && balance.cbGco2eq >= 0 ? 'success' : 'danger'}
        />
        <SummaryCard
          title="Banked Records"
          value={bankRecords.length}
          subtitle="Positive CB entries in vault"
        />
        <SummaryCard
          title="Last Apply"
          value={applyResult ? applyResult.cbAfter.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '--'}
          subtitle={applyResult ? `Applied ${applyResult.applied.toLocaleString()}` : 'No applications yet'}
        />
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-lg font-semibold text-white">Actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <button
            onClick={handleBankSurplus}
            disabled={!balance || balance.cbGco2eq <= 0 || loading}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Bank positive balance
          </button>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={amountToApply}
              min={0}
              onChange={(event) => setAmountToApply(Number(event.target.value))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Amount to apply"
            />
            <button
              onClick={handleApplyBanked}
              disabled={amountToApply <= 0 || loading}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply banked surplus
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left">Entry</th>
              <th className="px-4 py-3 text-left">Ship</th>
              <th className="px-4 py-3 text-right">Year</th>
              <th className="px-4 py-3 text-right">Amount (gCO₂e)</th>
              <th className="px-4 py-3 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {bankRecords.map((record) => (
              <tr key={record.id ?? `${record.shipId}-${record.createdAt}`} className="hover:bg-slate-900/40">
                <td className="px-4 py-3 font-medium text-white">{record.id ?? '—'}</td>
                <td className="px-4 py-3">{record.shipId}</td>
                <td className="px-4 py-3 text-right">{record.year}</td>
                <td className="px-4 py-3 text-right">{record.amountGco2eq.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  {record.createdAt ? new Date(record.createdAt).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-4 text-sm text-slate-400">Processing…</div>}
        {!loading && bankRecords.length === 0 && (
          <div className="p-4 text-sm text-slate-400">No bank records yet</div>
        )}
      </section>
    </div>
  );
};
