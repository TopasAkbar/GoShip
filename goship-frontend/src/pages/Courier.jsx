import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { courierClient } from '../apollo/client';
import {
  GET_COURIERS,
  ADD_COURIER,
  UPDATE_COURIER_STATUS,
} from '../graphql/courier';
import Layout from '../components/Layout';

const Courier = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleType: 'MOTORCYCLE',
    isActive: true,
  });

  const { loading, error, data, refetch } = useQuery(GET_COURIERS, {
    client: courierClient,
    variables: { isActive: null },
  });

  const [addCourier, { loading: adding }] = useMutation(ADD_COURIER, {
    client: courierClient,
    onCompleted: () => {
      setShowForm(false);
      setFormData({
        name: '',
        phone: '',
        vehicleType: 'MOTORCYCLE',
        isActive: true,
      });
      refetch();
    },
  });

  const [updateCourierStatus] = useMutation(UPDATE_COURIER_STATUS, {
    client: courierClient,
    onCompleted: () => {
      refetch();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addCourier({
      variables: {
        input: {
          name: formData.name,
          phone: formData.phone,
          vehicleType: formData.vehicleType,
          isActive: formData.isActive,
        },
      },
    });
  };

  const handleToggleStatus = (id, currentStatus) => {
    updateCourierStatus({
      variables: {
        id,
        isActive: !currentStatus,
      },
    });
  };

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Courier Management
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            {showForm ? 'Batal' : '+ Tambah Courier'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Tambah Courier Baru
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleType: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="MOTORCYCLE">Motorcycle</option>
                  <option value="VAN">Van</option>
                  <option value="TRUCK">Truck</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Aktif
                </label>
              </div>
              <button
                type="submit"
                disabled={adding}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {adding ? 'Menambah...' : 'Tambah Courier'}
              </button>
            </form>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">Error: {error.message}</p>
          </div>
        )}

        {data && data.getCouriers && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.getCouriers.map((courier) => (
                  <tr key={courier.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {courier.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {courier.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {courier.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {courier.vehicleType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          courier.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {courier.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() =>
                          handleToggleStatus(courier.id, courier.isActive)
                        }
                        className={`${
                          courier.isActive
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {courier.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Courier;




