import { useEffect, useMemo, useState } from 'react';
import { services } from '../../../shared/serviceContainer';
import { Route, RouteFilters } from '../../../core/domain/Route';
import { LoadingState, ErrorState } from '../components/State';
import { SummaryCard } from '../components/SummaryCard';

const initialFilters: RouteFilters = {
  vesselType: undefined,
  fuelType: undefined,
  year: undefined,
};

export const RoutesTab = () => {
  const [filters, setFilters] = useState<RouteFilters>(initialFilters);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchRoutes = async (activeFilters: RouteFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await services.routeService.listRoutes(activeFilters);
      setRoutes(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load routes';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.vesselType, filters.fuelType, filters.year]);

  const vesselOptions = useMemo(() => {
    const values = new Set(routes.map((route) => route.vesselType));
    return Array.from(values);
  }, [routes]);

  const fuelOptions = useMemo(() => {
    const values = new Set(routes.map((route) => route.fuelType));
    return Array.from(values);
  }, [routes]);

  const yearOptions = useMemo(() => {
    const values = new Set(routes.map((route) => route.year));
    return Array.from(values).sort();
  }, [routes]);

  const handleFilterChange = (key: keyof RouteFilters, value: string) => {
    setSuccessMessage(null);
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' || value === '' ? undefined : key === 'year' ? Number(value) : value,
    }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleSetBaseline = async (routeId: string) => {
    try {
      await services.routeService.setBaseline(routeId);
      setSuccessMessage(`Route ${routeId} is now the baseline.`);
      await fetchRoutes(filters);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set baseline';
      setError(message);
    }
  };

  const baselineRoute = routes.find((route) => route.isBaseline);

  if (loading && routes.length === 0) {
    return <LoadingState title="Loading routes" message="Fetching voyage and emissions data" />;
  }

  if (error && routes.length === 0) {
    return <ErrorState title="Unable to load routes" message={error} />;
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Routes"
          value={routes.length}
          subtitle="Filtered result count"
        />
        <SummaryCard
          title="Baseline"
          value={baselineRoute ? baselineRoute.routeId : 'Not set'}
          subtitle={baselineRoute ? baselineRoute.vesselType : 'Select a route to establish baseline'}
          tone={baselineRoute ? 'success' : 'danger'}
        />
        {successMessage ? (
          <SummaryCard title="Status" value="Updated" subtitle={successMessage} tone="success" />
        ) : (
          <SummaryCard title="Status" value="In sync" subtitle="Data pulled from backend API" />
        )}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <header className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-white">Filters</h2>
          <button
            onClick={handleResetFilters}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            Reset
          </button>
        </header>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm text-slate-300">
            Vessel Type
            <select
              value={filters.vesselType ?? 'all'}
              onChange={(event) => handleFilterChange('vesselType', event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="all">All</option>
              {vesselOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-300">
            Fuel Type
            <select
              value={filters.fuelType ?? 'all'}
              onChange={(event) => handleFilterChange('fuelType', event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="all">All</option>
              {fuelOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-300">
            Year
            <select
              value={filters.year ?? 'all'}
              onChange={(event) => handleFilterChange('year', event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="all">All</option>
              {yearOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left">Route ID</th>
              <th className="px-4 py-3 text-left">Vessel</th>
              <th className="px-4 py-3 text-left">Fuel</th>
              <th className="px-4 py-3 text-right">Year</th>
              <th className="px-4 py-3 text-right">GHG (gCO₂e/MJ)</th>
              <th className="px-4 py-3 text-right">Fuel (t)</th>
              <th className="px-4 py-3 text-right">Distance (km)</th>
              <th className="px-4 py-3 text-right">Emissions (t)</th>
              <th className="px-4 py-3 text-right">Baseline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {routes.map((route) => (
              <tr key={route.routeId} className="hover:bg-slate-900/40">
                <td className="px-4 py-3 font-medium text-white">{route.routeId}</td>
                <td className="px-4 py-3">{route.vesselType}</td>
                <td className="px-4 py-3">{route.fuelType}</td>
                <td className="px-4 py-3 text-right">{route.year}</td>
                <td className="px-4 py-3 text-right">{route.ghgIntensity.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{route.fuelConsumption.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{route.distance.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{route.totalEmissions.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  {route.isBaseline ? (
                    <span className="rounded-full bg-emerald-600/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                      Baseline
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetBaseline(route.routeId)}
                      className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:bg-brand hover:text-slate-950"
                    >
                      Set Baseline
                    </button>
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
