import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { REQUEST_RESI, CREATE_TRACKING } from '../graphql/mutations';
import { GET_SHIPMENTS } from '../graphql/queries';

function RequestResi() {
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [message, setMessage] = useState('');

  const { data, loading: loadingShipments, refetch } = useQuery(GET_SHIPMENTS);
  const [createdResi, setCreatedResi] = useState(null);
  
  // Mutation untuk membuat tracking di database tracking-service
  const [createTracking] = useMutation(CREATE_TRACKING);

  const [requestResi, { loading }] = useMutation(REQUEST_RESI, {
    onCompleted: async (data) => {
      if (data.requestResi.success) {
        const resiBaru = data.requestResi.nomorResi;
        
        // PENTING: Daftarkan resi ke tracking service
        try {
          await createTracking({
            variables: { resiNumber: resiBaru, orderId: selectedOrderId }
          });
          
          setCreatedResi(resiBaru);
          setMessage(`✅ Resi berhasil dibuat & Tracking aktif! Nomor: ${resiBaru}`);
          refetch();
        } catch (err) {
          setMessage(`⚠️ Resi dibuat (${resiBaru}), tapi gagal init tracking: ${err.message}`);
        }
      } else {
        setMessage(`❌ ${data.requestResi.message}`);
      }
    },
    onError: (error) => {
      setMessage(`❌ Error: ${error.message}`);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!selectedOrderId) {
      setMessage('❌ Pilih order terlebih dahulu');
      return;
    }

    try {
      await requestResi({
        variables: { orderId: selectedOrderId },
      });
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const shipments = data?.shipments || [];
  const pendingShipments = shipments.filter((s) => !s.nomorResi);

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Request Resi</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Order (yang belum punya resi)
            </label>
            <select
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              required
            >
              <option value="">Pilih Order</option>
              {pendingShipments.map((shipment) => (
                <option key={shipment.id} value={shipment.orderId}>
                  {shipment.orderId} - {shipment.alamatPengiriman.substring(0, 30)}...
                </option>
              ))}
            </select>
          </div>

          {message && (
            <div className={`p-4 rounded ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <p>{message}</p>
              {createdResi && (
                <div className="mt-3">
                  <Link to={`/tracking?resi=${createdResi}`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium">
                    Lihat & Update Tracking
                  </Link>
                </div>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !selectedOrderId}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Request Resi (Payment Success)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestResi;