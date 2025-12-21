import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../auth/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  
  const menuItems = [
    {
      title: 'Courier Management',
      description: 'Kelola data kurir dan status aktif/nonaktif',
      link: '/dashboard/courier',
      icon: '🚚',
    },
    {
      title: 'Area Management',
      description: 'Kelola area cakupan pengiriman',
      link: '/dashboard/area',
      icon: '🗺️',
    },
    {
      title: 'Manifest Generator',
      description: 'Generate resi pengiriman dan barcode',
      link: '/dashboard/manifest',
      icon: '📋',
    },
    {
      title: 'Operational Analytics',
      description: 'Analisis performa operasional logistik',
      link: '/dashboard/analytics',
      icon: '📊',
    },
  ];

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          {user && (
            <p className="text-gray-600 mt-2">
              Welcome back, <span className="font-semibold">{user.name}</span>!
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start">
                <div className="text-4xl mr-4">{item.icon}</div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h2>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

