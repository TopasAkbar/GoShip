import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { trackingClient } from '../apollo/client';
import { TRACK_PACKAGE } from '../graphql/tracking';
import Layout from '../components/Layout';

const Tracking = () => {
  const [trackingNumber, setTrackingNumber] = useState('');

  const [trackPackage, { loading, error, data }] = useLazyQuery(TRACK_PACKAGE, {
    client: trackingClient,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (trackingNumber) {
      trackPackage({
        variables: {
          trackingNumber: trackingNumber.trim(),
        },
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Tracking Paket
          </h1>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="trackingNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nomor Resi / Tracking Number
                </label>
                <input
                  type="text"
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Contoh: GS001234567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Mencari...' : 'Track Paket'}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  Error: {error.message}
                </p>
              </div>
            )}

            {data && data.trackPackage && (
              <div className="mt-6 p-6 bg-gray-50 rounded-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informasi Paket
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Tracking Number:
                    </span>
                    <p className="text-gray-900 font-mono">
                      {data.trackPackage.trackingNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Status:
                    </span>
                    <span
                      className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        data.trackPackage.status
                      )}`}
                    >
                      {data.trackPackage.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Lokasi:
                    </span>
                    <p className="text-gray-900">{data.trackPackage.location}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Update Terakhir:
                    </span>
                    <p className="text-gray-900">
                      {new Date(data.trackPackage.updatedAt).toLocaleString(
                        'id-ID'
                      )}
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

export default Tracking;




