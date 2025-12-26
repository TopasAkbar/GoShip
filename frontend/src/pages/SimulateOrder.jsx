import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_SHIPMENT } from '../graphql/mutations';
import { GET_PROVINSI, GET_KOTA } from '../graphql/queries';

function SimulateOrder() {
  const [orderId, setOrderId] = useState('');
  const [alamatPenjemputan, setAlamatPenjemputan] = useState('');
  const [alamatPengiriman, setAlamatPengiriman] = useState('');
  const [berat, setBerat] = useState('');
  const [provinsiAsal, setProvinsiAsal] = useState('');
  const [kotaAsal, setKotaAsal] = useState('');
  const [provinsiTujuan, setProvinsiTujuan] = useState('');
  const [kotaTujuan, setKotaTujuan] = useState('');
  const [message, setMessage] = useState('');

  const { data: provinsiData } = useQuery(GET_PROVINSI);
  const { data: kotaAsalData } = useQuery(GET_KOTA, {
    variables: { provinsiId: provinsiAsal },
    skip: !provinsiAsal,
  });
  const { data: kotaTujuanData } = useQuery(GET_KOTA, {
    variables: { provinsiId: provinsiTujuan },
    skip: !provinsiTujuan,
  });

  const [createShipment, { loading }] = useMutation(CREATE_SHIPMENT, {
    refetchQueries: ['GetShipments'],
    onCompleted: (data) => {
      setMessage(`✅ Order berhasil dibuat! ID: ${data.createShipmentFromMarketplace.orderId}`);
      setOrderId('');
      setAlamatPenjemputan('');
      setAlamatPengiriman('');
      setBerat('');
    },
    onError: (error) => {
      setMessage(`❌ Error: ${error.message}`);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!kotaAsal || !kotaTujuan) {
      setMessage('❌ Pilih kota asal dan tujuan');
      return;
    }

    try {
      await createShipment({
        variables: {
          orderId: orderId || `ORDER-${Date.now()}`,
          alamatPengiriman,
          alamatPenjemputan,
          berat: parseFloat(berat) || Math.random() * 9 + 1,
          kotaAsal,
          kotaTujuan,
        },
      });
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Simulasi Order dari Marketplace</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Order ID</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Auto-generate jika kosong"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Berat (kg)</label>
              <input
                type="number"
                step="0.1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="1-10"
                value={berat}
                onChange={(e) => setBerat(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Alamat Penjemputan</label>
            <textarea
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Jl. Contoh No. 123"
              value={alamatPenjemputan}
              onChange={(e) => setAlamatPenjemputan(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Alamat Pengiriman</label>
            <textarea
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Jl. Contoh No. 456"
              value={alamatPengiriman}
              onChange={(e) => setAlamatPengiriman(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Provinsi Asal</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={provinsiAsal}
                onChange={(e) => {
                  setProvinsiAsal(e.target.value);
                  setKotaAsal('');
                }}
                required
              >
                <option value="">Pilih Provinsi</option>
                {provinsiData?.provinsi?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kota Asal</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={kotaAsal}
                onChange={(e) => setKotaAsal(e.target.value)}
                required
                disabled={!provinsiAsal}
              >
                <option value="">Pilih Kota</option>
                {kotaAsalData?.kota?.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Provinsi Tujuan</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={provinsiTujuan}
                onChange={(e) => {
                  setProvinsiTujuan(e.target.value);
                  setKotaTujuan('');
                }}
                required
              >
                <option value="">Pilih Provinsi</option>
                {provinsiData?.provinsi?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kota Tujuan</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={kotaTujuan}
                onChange={(e) => setKotaTujuan(e.target.value)}
                required
                disabled={!provinsiTujuan}
              >
                <option value="">Pilih Kota</option>
                {kotaTujuanData?.kota?.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {message && (
            <div
              className={`p-4 rounded ${
                message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Membuat Order...' : 'Simulasi Order dari Marketplace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SimulateOrder;




