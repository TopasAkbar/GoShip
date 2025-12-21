import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { manifestClient } from '../apollo/client';
import { GENERATE_MANIFEST } from '../graphql/manifest';
import Layout from '../components/Layout';

const Manifest = () => {
  const [formData, setFormData] = useState({
    orderId: '',
    destination: '',
  });

  const [generateManifest, { loading, error, data }] = useMutation(
    GENERATE_MANIFEST,
    {
      client: manifestClient,
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    generateManifest({
      variables: {
        orderId: formData.orderId,
        destination: formData.destination,
      },
    });
  };

  const handleReset = () => {
    setFormData({ orderId: '', destination: '' });
  };

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Manifest Generator
          </h1>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="orderId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Order ID
                </label>
                <input
                  type="text"
                  id="orderId"
                  value={formData.orderId}
                  onChange={(e) =>
                    setFormData({ ...formData, orderId: e.target.value })
                  }
                  placeholder="Contoh: ORD001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="destination"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Destination
                </label>
                <input
                  type="text"
                  id="destination"
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({ ...formData, destination: e.target.value })
                  }
                  placeholder="Contoh: BANDUNG"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Generate Manifest'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">Error: {error.message}</p>
              </div>
            )}

            {data && data.generateManifest && (
              <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Manifest Generated Successfully!
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Order ID:
                    </span>
                    <p className="text-gray-900 font-mono">
                      {data.generateManifest.orderId}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Tracking Number:
                    </span>
                    <p className="text-gray-900 font-mono text-lg">
                      {data.generateManifest.trackingNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Barcode:
                    </span>
                    <p className="text-gray-900 font-mono text-lg">
                      {data.generateManifest.barcode}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Created At:
                    </span>
                    <p className="text-gray-900">
                      {new Date(
                        data.generateManifest.createdAt
                      ).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Manifest;




