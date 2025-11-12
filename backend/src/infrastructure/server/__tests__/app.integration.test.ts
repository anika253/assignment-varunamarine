import request from 'supertest';
import { newDb, DataType } from 'pg-mem';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import { createApp } from '../app';

const loadSchema = (db: ReturnType<typeof newDb>) => {
  const schemaPath = join(__dirname, '../../db/schema.sql');
  const schemaSQL = readFileSync(schemaPath, 'utf-8').replace(/decimal\([^)]*\)/gi, 'numeric');
  db.public.none(schemaSQL);
};

const seedRoutes = async (pool: Pool) => {
  const routes = [
    ['R001', 'Container', 'HFO', 2024, 91.0, 5000, 12000, 4500, true],
    ['R002', 'BulkCarrier', 'LNG', 2024, 88.0, 4800, 11500, 4200, false],
    ['R003', 'Tanker', 'MGO', 2024, 93.5, 5100, 12500, 4700, false],
  ];

  for (const route of routes) {
    await pool.query(
      `INSERT INTO routes (route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      route
    );
  }
};

describe('HTTP API integration', () => {
  let pool: Pool;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    const db = newDb({ autoCreateForeignKeyIndices: true });
    db.public.registerFunction({ name: 'current_timestamp', returns: DataType.timestamp, implementation: () => new Date() });

    loadSchema(db);

    const pgAdapter = db.adapters.createPg();
    pool = new pgAdapter.Pool();

    await seedRoutes(pool);

    app = createApp(pool);
  });

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  it('returns all routes with filters', async () => {
    const response = await request(app).get('/routes').query({ fuelType: 'LNG' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].routeId).toBe('R002');
  });

  it('sets a new baseline route', async () => {
    const response = await request(app).post('/routes/R002/baseline');
    expect(response.status).toBe(200);

    const comparison = await request(app).get('/routes/comparison');
    expect(comparison.status).toBe(200);
    const routeIds = comparison.body.map((item: any) => item.routeId);
    expect(routeIds).toContain('R001');
    expect(routeIds).toContain('R003');
  });

  it('computes compliance balance for a ship', async () => {
    const response = await request(app).get('/compliance/cb').query({ shipId: 'R002', year: 2024 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('cbGco2eq');
  });

  it('banks surplus and applies it', async () => {
    await request(app).get('/compliance/cb').query({ shipId: 'R002', year: 2024 });

    const bankResponse = await request(app).post('/banking/bank').send({ shipId: 'R002', year: 2024 });
    expect(bankResponse.status).toBe(200);

    const records = await request(app).get('/banking/records').query({ shipId: 'R002', year: 2024 });
    expect(records.body[0]).toHaveProperty('amountGco2eq');

    const applyResponse = await request(app)
      .post('/banking/apply')
      .send({ shipId: 'R002', year: 2024, amount: 100 });
    expect(applyResponse.status).toBe(200);
    expect(applyResponse.body).toHaveProperty('cbAfter');
  });

  it('creates a valid pool', async () => {
    const poolResponse = await request(app).post('/pools').send({
      year: 2024,
      members: [
        { shipId: 'SHIP_A', cbBefore: 300 },
        { shipId: 'SHIP_B', cbBefore: -150 },
        { shipId: 'SHIP_C', cbBefore: -150 },
      ],
    });

    expect(poolResponse.status).toBe(200);
    expect(poolResponse.body.members).toHaveLength(3);
  });
});
