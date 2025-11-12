import express, { Express } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { RoutesController } from '../../adapters/inbound/http/routesController';
import { ComplianceController } from '../../adapters/inbound/http/complianceController';
import { BankingController } from '../../adapters/inbound/http/bankingController';
import { PoolingController } from '../../adapters/inbound/http/poolingController';
import { PostgresRouteRepository } from '../../adapters/outbound/postgres/PostgresRouteRepository';
import { PostgresComplianceRepository } from '../../adapters/outbound/postgres/PostgresComplianceRepository';
import { PostgresBankingRepository } from '../../adapters/outbound/postgres/PostgresBankingRepository';
import { PostgresPoolingRepository } from '../../adapters/outbound/postgres/PostgresPoolingRepository';

dotenv.config();

export const createApp = (dbPool?: Pool): Express => {
  const app: Express = express();

  app.use(cors());
  app.use(express.json());

  const db =
    dbPool ||
    new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fueleu_maritime',
    });

  const routeRepository = new PostgresRouteRepository(db);
  const bankingRepository = new PostgresBankingRepository(db);
  const complianceRepository = new PostgresComplianceRepository(db, bankingRepository);
  const poolingRepository = new PostgresPoolingRepository(db);

  const routesController = new RoutesController(routeRepository, complianceRepository);
  const complianceController = new ComplianceController(complianceRepository);
  const bankingController = new BankingController(bankingRepository, complianceRepository);
  const poolingController = new PoolingController(poolingRepository);

  app.get('/routes', (req, res) => routesController.getAllRoutes(req, res));
  app.post('/routes/:routeId/baseline', (req, res) => routesController.setBaseline(req, res));
  app.get('/routes/comparison', (req, res) => routesController.getComparison(req, res));

  app.get('/compliance/cb', (req, res) => routesController.computeComplianceBalance(req, res));
  app.get('/compliance/adjusted-cb', (req, res) => complianceController.getAdjustedComplianceBalance(req, res));

  app.get('/banking/records', (req, res) => bankingController.getBankRecords(req, res));
  app.post('/banking/bank', (req, res) => bankingController.bankSurplus(req, res));
  app.post('/banking/apply', (req, res) => bankingController.applyBanked(req, res));

  app.post('/pools', (req, res) => poolingController.createPool(req, res));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
};
