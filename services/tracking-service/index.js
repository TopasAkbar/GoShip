require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { readFileSync } = require('fs');
const { join } = require('path');
const cors = require('cors');
const { initDB, pool } = require('./db');
const resolvers = require('./resolvers');

const app = express();
const PORT = process.env.PORT || 4006;
const SIMULATION_MODE = process.env.SIMULATION_MODE === 'true';
const SIMULATION_INTERVAL = parseInt(process.env.SIMULATION_INTERVAL || '15000'); // Default 15 detik

const STATUS_ORDER = ['CREATED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_HUB', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const STATUS_DESCRIPTIONS = {
  PICKED_UP: 'Paket telah diambil oleh kurir',
  IN_TRANSIT: 'Paket sedang dalam perjalanan ke hub tujuan',
  ARRIVED_AT_HUB: 'Paket telah tiba di hub regional',
  OUT_FOR_DELIVERY: 'Paket sedang dikirim ke alamat tujuan',
  DELIVERED: 'Paket telah diterima oleh penerima'
};
const STATUS_LOCATIONS = {
  PICKED_UP: 'Gudang Pusat, Jakarta',
  IN_TRANSIT: 'Tol Cipularang, KM 45',
  ARRIVED_AT_HUB: 'Hub Bandung, Jl. Soekarno Hatta No. 456',
  OUT_FOR_DELIVERY: 'Hub Bandung',
  DELIVERED: 'Jl. Merdeka No. 789, Bandung'
};

/**
 * Simulation Mode: Auto-update tracking status secara otomatis
 * Berguna untuk DEMO frontend
 */
async function simulateTrackingUpdates() {
  if (!SIMULATION_MODE) return;

  try {
    // Ambil semua tracking yang belum DELIVERED
    const { rows } = await pool.query(
      `SELECT id, resi_number, current_status 
       FROM tracking 
       WHERE current_status != 'DELIVERED' 
       ORDER BY created_at ASC`
    );

    for (const tracking of rows) {
      const currentIndex = STATUS_ORDER.indexOf(tracking.current_status);
      
      // Skip jika sudah di akhir atau tidak ditemukan
      if (currentIndex < 0 || currentIndex >= STATUS_ORDER.length - 1) {
        continue;
      }

      // Ambil status berikutnya (maju 1 langkah)
      const nextStatus = STATUS_ORDER[currentIndex + 1];
      const description = STATUS_DESCRIPTIONS[nextStatus] || 'Status updated';
      const location = STATUS_LOCATIONS[nextStatus] || 'Unknown location';

      try {
        // Update status menggunakan resolver
        await resolvers.Mutation.updateTrackingStatus(
          null,
          {
            resiNumber: tracking.resi_number,
            status: nextStatus,
            description,
            location
          }
        );
        
        console.log(`📦 [SIMULATION] Updated ${tracking.resi_number}: ${tracking.current_status} → ${nextStatus}`);
      } catch (error) {
        // Skip jika error (misal sudah di-update manual)
        console.log(`⚠️ [SIMULATION] Skip ${tracking.resi_number}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ [SIMULATION] Error:', error.message);
  }
}

// Start simulation mode jika enabled
let simulationInterval = null;
if (SIMULATION_MODE) {
  console.log(`🎮 Simulation Mode: ENABLED (interval: ${SIMULATION_INTERVAL}ms)`);
  simulationInterval = setInterval(simulateTrackingUpdates, SIMULATION_INTERVAL);
  
  // Run immediately on startup
  setTimeout(simulateTrackingUpdates, 5000); // Start after 5 seconds
} else {
  console.log('🚫 Simulation Mode: DISABLED');
}

async function startServer() {
  await initDB();

  const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf-8');

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(cors());
  app.use(express.json());
  app.use('/graphql', expressMiddleware(server));

  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'tracking-service',
      simulationMode: SIMULATION_MODE 
    });
  });

  app.listen(PORT, () => {
    console.log(`🚀 Tracking Service running on http://localhost:${PORT}/graphql`);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    console.log('🛑 Simulation mode stopped');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    console.log('🛑 Simulation mode stopped');
  }
  process.exit(0);
});

startServer().catch(console.error);




