import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Home = () => {
  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Selamat Datang di GoShip
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistem Logistik Terpercaya untuk Pengiriman Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Link
            to="/tariff"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Cek Ongkir
              </h2>
              <p className="text-gray-600">
                Hitung ongkos kirim berdasarkan origin, destination, dan berat
              </p>
            </div>
          </Link>

          <Link
            to="/tracking"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">📦</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Tracking Paket
              </h2>
              <p className="text-gray-600">
                Lacak status dan posisi paket Anda dengan mudah
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">⚙️</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Admin Dashboard
              </h2>
              <p className="text-gray-600">
                Kelola courier, area, manifest, dan analytics
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-12 bg-primary-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Mengapa Pilih GoShip?
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">✓</span>
              <span>Pengiriman cepat dan aman</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">✓</span>
              <span>Tracking real-time</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">✓</span>
              <span>Harga transparan</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">✓</span>
              <span>Jangkauan luas</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Home;




