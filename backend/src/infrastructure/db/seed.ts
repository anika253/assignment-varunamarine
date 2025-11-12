import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fueleu_maritime',
});

async function seed() {
  try {
    console.log('Seeding database...');

    // Clear existing data
    await pool.query('DELETE FROM pool_members');
    await pool.query('DELETE FROM pools');
    await pool.query('DELETE FROM bank_entries');
    await pool.query('DELETE FROM ship_compliance');
    await pool.query('DELETE FROM routes');

    // Insert routes (from assignment spec)
    const routes = [
      {
        route_id: 'R001',
        vessel_type: 'Container',
        fuel_type: 'HFO',
        year: 2024,
        ghg_intensity: 91.0,
        fuel_consumption: 5000,
        distance: 12000,
        total_emissions: 4500,
        is_baseline: true, // Set R001 as baseline
      },
      {
        route_id: 'R002',
        vessel_type: 'BulkCarrier',
        fuel_type: 'LNG',
        year: 2024,
        ghg_intensity: 88.0,
        fuel_consumption: 4800,
        distance: 11500,
        total_emissions: 4200,
        is_baseline: false,
      },
      {
        route_id: 'R003',
        vessel_type: 'Tanker',
        fuel_type: 'MGO',
        year: 2024,
        ghg_intensity: 93.5,
        fuel_consumption: 5100,
        distance: 12500,
        total_emissions: 4700,
        is_baseline: false,
      },
      {
        route_id: 'R004',
        vessel_type: 'RoRo',
        fuel_type: 'HFO',
        year: 2025,
        ghg_intensity: 89.2,
        fuel_consumption: 4900,
        distance: 11800,
        total_emissions: 4300,
        is_baseline: false,
      },
      {
        route_id: 'R005',
        vessel_type: 'Container',
        fuel_type: 'LNG',
        year: 2025,
        ghg_intensity: 90.5,
        fuel_consumption: 4950,
        distance: 11900,
        total_emissions: 4400,
        is_baseline: false,
      },
    ];

    for (const route of routes) {
      await pool.query(
        `INSERT INTO routes (route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          route.route_id,
          route.vessel_type,
          route.fuel_type,
          route.year,
          route.ghg_intensity,
          route.fuel_consumption,
          route.distance,
          route.total_emissions,
          route.is_baseline,
        ]
      );
    }

    console.log('✅ Seeded routes successfully');
    await pool.end();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await pool.end();
    process.exit(1);
  }
}

seed();


