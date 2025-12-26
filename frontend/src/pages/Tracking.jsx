import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useSearchParams } from 'react-router-dom';
import { GET_TRACKING } from '../graphql/queries';
import { UPDATE_TRACKING_STATUS } from '../graphql/mutations';

const STATUS_OPTIONS = [
  { value: 'PICKED_UP', label: 'Diambil Kurir' },
  { value: 'IN_TRANSIT', label: 'Dalam Perjalanan' },
  { value: 'ARRIVED_AT_HUB', label: 'Tiba di Hub' },
  { value: 'OUT_FOR_DELIVERY', label: 'Sedang Dikirim' },
  { value: 'DELIVERED', label: 'Diterima' },
];

function Tracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resiInput, setResiInput] = useState('');
  const [form, setForm] = useState({ status: '', location: '', description: '' });
  const [msg, setMsg] = useState(null);

  const resiUrl = searchParams.get('resi') || '';

  const { data, loading, error, refetch } = useQuery(GET_TRACKING, {
    variables: { resiNumber: resiUrl },
    skip: !resiUrl,
  });

  const [updateStatus, { loading: updating }] = useMutation(UPDATE_TRACKING_STATUS, {
    onCompleted: () => {
      setMsg({ type: 'success', text: '✅ Status berhasil diperbarui!' });
      setForm({ status: '', location: '', description: '' });
      refetch();
    },
    onError: (err) => setMsg({ type: 'error', text: `❌ ${err.message}` }),
  });

  useEffect(() => { if (resiUrl) setResiInput(resiUrl); }, [resiUrl]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (resiInput) setSearchParams({ resi: resiInput.trim().toUpperCase() });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateStatus({ variables: { resiNumber: resiUrl, ...form } });
  };

  const tracking = data?.trackingByResi;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Pelacakan Paket</h1>
      
      {/* Search Bar */}
      <div className="bg-white shadow p-6 rounded-lg mb-8 border-t-4 border-blue-600">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input 
            className="flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Masukkan Nomor Resi (Contoh: GS...)" 
            value={resiInput} onChange={(e) => setResiInput(e.target.value)} 
          />
          <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold">Cari Paket</button>
        </form>
      </div>

      {loading && <div className="text-center p-10 bg-white rounded shadow">Memuat data...</div>}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
          <p className="font-bold">Data Tidak Ditemukan</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {tracking && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kolom Kiri: Timeline & Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded shadow">
              <h2 className="font-bold border-b pb-2 mb-4">Detail Resi: {tracking.resiNumber}</h2>
              <p className="text-sm">Status Saat Ini: <span className="font-bold text-blue-600">{tracking.currentStatus}</span></p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <h2 className="font-bold mb-4">Timeline Perjalanan</h2>
              {tracking.histories.map((h, i) => (
                <div key={i} className="border-l-2 border-blue-600 ml-2 pl-4 pb-6 relative">
                  <div className="absolute -left-1.5 top-1 w-3 h-3 bg-blue-600 rounded-full"></div>
                  <p className="text-xs text-gray-400">{new Date(h.timestamp).toLocaleString()}</p>
                  <p className="font-bold text-gray-800">{h.status}</p>
                  <p className="text-sm text-gray-600">📍 {h.location} - {h.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Kolom Kanan: Form Update Status */}
          <div className="bg-gray-50 p-6 rounded shadow border h-fit sticky top-6">
            <h2 className="font-bold mb-4 text-gray-700">Update Status Tracking</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Status Baru</label>
                <select className="w-full border p-2 rounded" value={form.status} onChange={(e)=>setForm({...form, status:e.target.value})} required>
                  <option value="">-- Pilih --</option>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Lokasi</label>
                <input className="w-full border p-2 rounded" placeholder="Contoh: Gudang Jakarta" value={form.location} onChange={(e)=>setForm({...form, location:e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Keterangan</label>
                <textarea className="w-full border p-2 rounded" placeholder="Deskripsi aktivitas" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} required />
              </div>
              
              {msg && <p className={`p-2 text-xs rounded ${msg.type==='success'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{msg.text}</p>}
              
              <button disabled={updating || tracking.currentStatus === 'DELIVERED'} className="w-full bg-green-600 text-white py-2 rounded font-bold disabled:opacity-50 hover:bg-green-700 transition">
                {updating ? 'Menyimpan...' : 'Simpan Update'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default Tracking;