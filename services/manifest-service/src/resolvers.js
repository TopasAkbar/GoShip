const ManifestLog = require('./models/ManifestLog');
const crypto = require('crypto');

// Generate simple barcode based on orderId and destination
function generateBarcode(orderId, destination) {
  const data = `${orderId}-${destination}-${Date.now()}`;
  return crypto.createHash('md5').update(data).digest('hex').substring(0, 16).toUpperCase();
}

// Generate tracking number
function generateTrackingNumber(orderId) {
  const prefix = 'GS';
  const timestamp = Date.now().toString().slice(-8);
  const orderHash = crypto.createHash('md5').update(orderId).digest('hex').substring(0, 6).toUpperCase();
  return `${prefix}${timestamp}${orderHash}`;
}

const resolvers = {
  Mutation: {
    generateManifest: async (_, { orderId, destination }) => {
      try {
        // Generate tracking number and barcode
        const trackingNumber = generateTrackingNumber(orderId);
        const barcode = generateBarcode(orderId, destination);

        // Create manifest log
        const manifest = await ManifestLog.create({
          order_id: orderId,
          tracking_number: trackingNumber,
          barcode: barcode,
          created_at: new Date(),
        });

        return {
          id: manifest.id,
          orderId: manifest.order_id,
          trackingNumber: manifest.tracking_number,
          barcode: manifest.barcode,
          createdAt: manifest.created_at.toISOString(),
        };
      } catch (error) {
        throw new Error(`Error generating manifest: ${error.message}`);
      }
    },
  },
};

module.exports = resolvers;





