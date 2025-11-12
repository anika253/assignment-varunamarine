import { useEffect, useMemo, useState } from 'react';
import { RoutesService } from '../../infrastructure/http/RoutesService';
import { ComplianceService } from '../../infrastructure/http/ComplianceService';
import { BankingService } from '../../infrastructure/http/BankingService';
import { PoolingService } from '../../infrastructure/http/PoolingService';
import { GetRoutes } from '../../../core/application/routes/GetRoutes';
import { SetBaselineRoute } from '../../../core/application/routes/SetBaselineRoute';
import { GetRouteComparison } from '../../../core/application/routes/GetRouteComparison';
import { ComputeComplianceBalance } from '../../../core/application/compliance/ComputeComplianceBalance';
import { GetAdjustedComplianceBalance } from '../../../core/application/compliance/GetAdjustedComplianceBalance';
import { GetBankRecords } from '../../../core/application/banking/GetBankRecords';
import { BankSurplusUseCase } from '../../../core/application/banking/BankSurplus';
import { ApplyBankedUseCase } from '../../../core/application/banking/ApplyBanked';
import { CreatePoolUseCase } from '../../../core/application/pooling/CreatePool';
import { Route } from '../../../core/domain/route';
import { RoutesTab } from '../tabs/RoutesTab';
import { CompareTab } from '../tabs/CompareTab';
import { BankingTab } from '../tabs/BankingTab';
import { PoolingTab } from '../tabs/PoolingTab';

const TAB_ITEMS = [
  { id: 'routes', label: 'Routes' },
  { id: 'compare', label: 'Compare' },
  { id: 'banking', label: 'Banking' },
  { id: 'pooling', label: 'Pooling' },
] as const;

type TabId = typeof TAB_ITEMS[number]['id'];

export const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>('routes');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState<boolean>(false);
  const [routesError, setRoutesError] = useState<string | null>(null);

  const routesService = useMemo(() => new RoutesService(), []);
  const complianceService = useMemo(() => new ComplianceService(), []);
  const bankingService = useMemo(() => new BankingService(), []);
  const poolingService = useMemo(() => new PoolingService(), []);

  const getRoutesUseCase = useMemo(() => new GetRoutes(routesService), [routesService]);
  const setBaselineUseCase = useMemo(() => new SetBaselineRoute(routesService), [routesService]);
  const getComparisonUseCase = useMemo(() => new GetRouteComparison(routesService), [routesService]);
  const computeComplianceUseCase = useMemo(
    () => new ComputeComplianceBalance(complianceService),
    [complianceService]
  );
  const adjustedComplianceUseCase = useMemo(
    () => new GetAdjustedComplianceBalance(complianceService),
    [complianceService]
  );
  const getBankRecordsUseCase = useMemo(() => new GetBankRecords(bankingService), [bankingService]);
  const bankSurplusUseCase = useMemo(() => new BankSurplusUseCase(bankingService), [bankingService]);
  const applyBankedUseCase = useMemo(() => new ApplyBankedUseCase(bankingService), [bankingService]);
  const createPoolUseCase = useMemo(() => new CreatePoolUseCase(poolingService), [poolingService]);

  const refreshRoutes = async () => {
    try {
      setLoadingRoutes(true);
      const data = await getRoutesUseCase.execute();
      setRoutes(data);
      setRoutesError(null);
    } catch (error) {
      setRoutesError(error instanceof Error ? error.message : 'Failed to load routes');
    } finally {
      setLoadingRoutes(false);
    }
  };

  useEffect(() => {
    void refreshRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-2xl font-semibold text-slate-900">FuelEU Compliance Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor routes, compare GHG intensity, manage banking, and configure pooling agreements.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <nav className="flex space-x-2 rounded-lg bg-white p-2 shadow-sm">
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="mt-6">
          {routesError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {routesError}
            </div>
          )}

          {activeTab === 'routes' && (
            <RoutesTab
              routes={routes}
              loading={loadingRoutes}
              onRefresh={refreshRoutes}
              getRoutesUseCase={getRoutesUseCase}
              setBaselineUseCase={setBaselineUseCase}
            />
          )}

          {activeTab === 'compare' && (
            <CompareTab
              getComparisonUseCase={getComparisonUseCase}
              loadingRoutes={loadingRoutes}
              baselineRoute={routes.find((route) => route.isBaseline) ?? null}
            />
          )}

          {activeTab === 'banking' && (
            <BankingTab
              routes={routes}
              computeComplianceUseCase={computeComplianceUseCase}
              getBankRecordsUseCase={getBankRecordsUseCase}
              bankSurplusUseCase={bankSurplusUseCase}
              applyBankedUseCase={applyBankedUseCase}
            />
          )}

          {activeTab === 'pooling' && (
            <PoolingTab
              routes={routes}
              adjustedComplianceUseCase={adjustedComplianceUseCase}
              createPoolUseCase={createPoolUseCase}
            />
          )}
        </section>
      </main>
    </div>
  );
};
