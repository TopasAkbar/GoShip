import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PROVINSI, GET_KOTA, GET_SHIPPING_OPTIONS } from '../graphql/queries';

function CheckOngkir() {
  const [provinsiAsal, setProvinsiAsal] = useState('');
  const [kotaAsal, setKotaAsal] = useState('');
  const [provinsiTujuan, setProvinsiTujuan] = useState('');
  const [kotaTujuan, setKotaTujuan] = useState('');
  const [berat, setBerat] = useState('1');

  const { data: provinsiData } = useQuery(GET_PROVINSI);
  const { data: kotaAsalData } = useQuery(GET_KOTA, {
    variables: { provinsiId: provinsiAsal },
    skip: !provinsiAsal,
  });
  const { data: kotaTujuanData } = useQuery(GET_KOTA, {
    variables: { provinsiId: provinsiTujuan },
    skip: !provinsiTujuan,
  });

  const { data: shippingData, loading } = useQuery(GET_SHIPPING_OPTIONS, {
    variables: {
      kotaAsal,
      kotaTujuan,
      berat: parseFloat(berat) || 1,
    },
    skip: !kotaAsal || !kotaTujuan || !berat,
  });

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Cek Ongkir</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <form className="space-y-6">
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

            <div>
              <label className="block text-sm font-medium text-gray-700">Berat (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={berat}
                onChange={(e) => setBerat(e.target.value)}
              />
            </div>
          </div>
        </form>
      </div>

      {loading && (
        <div className="bg-white shadow rounded-lg p-6 text-center">Loading...</div>
      )}

      {shippingData?.getShippingOptions && shippingData.getShippingOptions.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Opsi Pengiriman</h2>
          <div className="space-y-4">
            {shippingData.getShippingOptions.map((option, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{option.metodePengiriman}</h3>
                    <p className="text-sm text-gray-600">
                      Estimasi: {option.estimasiHari} hari
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      Rp {option.hargaOngkir.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckOngkir;




