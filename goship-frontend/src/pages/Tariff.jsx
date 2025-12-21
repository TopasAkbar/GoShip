import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { tariffClient } from '../apollo/client';
import { GET_SHIPPING_COST } from '../graphql/tariff';
import Layout from '../components/Layout';

const Tariff = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState('');

  const [getShippingCost, { loading, error, data }] = useLazyQuery(
    GET_SHIPPING_COST,
    { client: tariffClient }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (origin && destination && weight) {
      getShippingCost({
        variables: {
          origin: origin.toUpperCase(),
          destination: destination.toUpperCase(),
          weight: parseFloat(weight),
        },
      });
    }
  };

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Cek Ongkos Kirim
          </h1>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="origin"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Origin (Kota Asal)
                </label>
                <input
                  type="text"
                  id="origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Contoh: JAKARTA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="destination"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Destination (Kota Tujuan)
                </label>
                <input
                  type="text"
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Contoh: BANDUNG"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="weight"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Berat (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Contoh: 2.5"
                  step="0.1"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Menghitung...' : 'Hitung Ongkir'}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  Error: {error.message}
                </p>
              </div>
            )}

            {data && data.getShippingCost && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Hasil Perhitungan Ongkir
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-medium">Origin:</span>{' '}
                    {data.getShippingCost.origin}
                  </p>
                  <p>
                    <span className="font-medium">Destination:</span>{' '}
                    {data.getShippingCost.destination}
                  </p>
                  <p>
                    <span className="font-medium">Berat:</span>{' '}
                    {data.getShippingCost.weight} kg
                  </p>
                  <p className="text-2xl font-bold text-primary-600 mt-4">
                    Rp {data.getShippingCost.price.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Tariff;




