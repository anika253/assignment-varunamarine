import { RouteHttpService } from '../adapters/infrastructure/http/RouteHttpService';
import { ComplianceHttpService } from '../adapters/infrastructure/http/ComplianceHttpService';
import { BankingHttpService } from '../adapters/infrastructure/http/BankingHttpService';
import { PoolingHttpService } from '../adapters/infrastructure/http/PoolingHttpService';

const routeService = new RouteHttpService();
const complianceService = new ComplianceHttpService(routeService);
const bankingService = new BankingHttpService();
const poolingService = new PoolingHttpService();

export const services = {
  routeService,
  complianceService,
  bankingService,
  poolingService,
};
