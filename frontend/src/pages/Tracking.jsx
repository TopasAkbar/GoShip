import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useSearchParams } from 'react-router-dom';
import { GET_TRACKING } from '../graphql/queries';
import { UPDATE_TRACKING_STATUS } from '../graphql/mutations';

// Status mapping ke Bahasa Indonesia
const STATUS_LABELS = {
  CREATED: 'Paket Dibuat',
  PICKED_UP: 'Diambil Kurir',
  IN_TRANSIT: 'Dalam Perjalanan',
  ARRIVED_AT_HUB: 'Tiba di Hub',
  OUT_FOR_DELIVERY: 'Sedang Dikirim',
  DELIVERED: 'Terkirim',
};

// Status colors untuk badge
const STATUS_COLORS = {
  CREATED: 'bg-gray-100 text-gray-800 border-gray-300',
  PICKED_UP: 'bg-blue-100 text-blue-800 border-blue-300',
  IN_TRANSIT: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  ARRIVED_AT_HUB: 'bg-purple-100 text-purple-800 border-purple-300',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800 border-orange-300',
  DELIVERED: 'bg-green-100 text-green-800 border-green-300',
};

// Status icons (emoji untuk visual)
const STATUS_ICONS = {
  CREATED: '📦',
  PICKED_UP: '🚚',
  IN_TRANSIT: '🚛',
  ARRIVED_AT_HUB: '🏢',
  OUT_FOR_DELIVERY: '🏍️',
  DELIVERED: '✅',
};

const STATUS_ORDER = ['CREATED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_HUB', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const STATUS_OPTIONS = STATUS_ORDER.slice(1).map(status => ({
  value: status,
  label: STATUS_LABELS[status],
}));

function Tracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resiInput, setResiInput] = useState('');
  const [form, setForm] = useState({ status: '', location: '', description: '' });
  const [msg, setMsg] = useState(null);

  const resiUrl = searchParams.get('resi') || '';

  // Query dengan polling setiap 10 detik untuk auto-refresh (berguna untuk simulation mode)
  const { data, loading, error, refetch } = useQuery(GET_TRACKING, {
    variables: { resiNumber: resiUrl },
    skip: !resiUrl,
    pollInterval: resiUrl ? 10000 : 0, // Poll setiap 10 detik jika ada resi
    fetchPolicy: 'network-and-cache', // Always check for updates
  });

  const [updateStatus, { loading: updating }] = useMutation(UPDATE_TRACKING_STATUS, {
    onCompleted: () => {
      setMsg({ type: 'success', text: '✅ Status berhasil diperbarui!' });
      setForm({ status: '', location: '', description: '' });
      refetch(); // Refresh data setelah update
    },
    onError: (err) => {
      setMsg({ type: 'error', text: `❌ ${err.message}` });
    },
  });

  useEffect(() => {
    if (resiUrl) {
      setResiInput(resiUrl);
    }
  }, [resiUrl]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (resiInput) {
      setSearchParams({ resi: resiInput.trim().toUpperCase() });
      setMsg(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg(null);
    await updateStatus({ 
      variables: { 
        resiNumber: resiUrl, 
        status: form.status,
        location: form.location,
        description: form.description,
      } 
    });
  };

  const tracking = data?.trackingByResi;
  const histories = tracking?.histories || [];

  // Get next available statuses untuk form
  const getNextAvailableStatuses = () => {
    if (!tracking) return STATUS_OPTIONS;
    const currentIndex = STATUS_ORDER.indexOf(tracking.currentStatus);
    if (currentIndex < 0 || currentIndex >= STATUS_ORDER.length - 1) return [];
    // Return max 2 next statuses (sesuai validasi backend)
    const nextStatuses = STATUS_ORDER.slice(currentIndex + 1, currentIndex + 3);
    return STATUS_OPTIONS.filter(opt => nextStatuses.includes(opt.value));
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Pelacakan Paket</h1>
        <p className="text-gray-600">Cari dan lacak status pengiriman paket Anda</p>
      </div>
      
      {/* Search Bar */}
      <div className="bg-white shadow-lg p-6 rounded-lg mb-8 border-t-4 border-blue-600">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input 
            className="flex-1 border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
            placeholder="Masukkan Nomor Resi (Contoh: GS12345678)" 
            value={resiInput} 
            onChange={(e) => setResiInput(e.target.value.toUpperCase())} 
          />
          <button 
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
          >
            🔍 Cari Paket
          </button>
        </form>
      </div>

      {loading && (
        <div className="text-center p-10 bg-white rounded-lg shadow">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Memuat data tracking...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow">
          <p className="font-bold mb-1">⚠️ Data Tidak Ditemukan</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {tracking && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Info & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card: Detail Resi */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold border-b pb-3 mb-4 text-gray-800">
                Detail Resi: <span className="text-blue-600">{tracking.resiNumber}</span>
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order ID</p>
                  <p className="font-semibold text-gray-800">{tracking.orderId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tanggal Dibuat</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(tracking.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">Status Saat Ini</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-bold ${STATUS_COLORS[tracking.currentStatus] || STATUS_COLORS.CREATED}`}>
                  <span className="text-lg">{STATUS_ICONS[tracking.currentStatus] || '📦'}</span>
                  <span>{STATUS_LABELS[tracking.currentStatus] || tracking.currentStatus}</span>
                </div>
              </div>
            </div>

            {/* Card: Timeline History */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold mb-6 text-gray-800">📋 Timeline Perjalanan Paket</h2>
              
              {histories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Belum ada riwayat tracking</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {histories.map((history, index) => {
                    const isLast = index === histories.length - 1;
                    const isActive = index === histories.length - 1;
                    const dateTime = formatDateTime(history.timestamp);
                    const statusLabel = STATUS_LABELS[history.status] || history.status;
                    const statusColor = STATUS_COLORS[history.status] || STATUS_COLORS.CREATED;
                    const statusIcon = STATUS_ICONS[history.status] || '📦';

                    return (
                      <div key={history.id || index} className="relative mb-6 last:mb-0">
                        {/* Timeline Dot */}
                        <div className={`absolute left-4 top-1 w-4 h-4 rounded-full border-2 ${
                          isActive 
                            ? 'bg-blue-600 border-blue-600 shadow-lg' 
                            : 'bg-white border-gray-400'
                        } z-10`}>
                          {isActive && (
                            <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-75"></div>
                          )}
                        </div>
                        
                        {/* Content Card */}
                        <div className={`ml-12 pl-4 ${
                          isActive ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                        } border rounded-lg p-4 transition-all`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{statusIcon}</span>
                              <span className={`font-bold text-sm px-3 py-1 rounded-full border ${statusColor}`}>
                                {statusLabel}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-600 font-semibold">{dateTime.date}</p>
                              <p className="text-xs text-gray-500">{dateTime.time}</p>
                            </div>
                          </div>
                          
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
                              <span>📍</span>
                              <span>{history.location}</span>
                            </p>
                            <p className="text-sm text-gray-600">{history.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Form Update Status */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg shadow-lg border border-gray-200 sticky top-6">
              <h2 className="text-lg font-bold mb-4 text-gray-800">✏️ Update Status Tracking</h2>
              
              {tracking.currentStatus === 'DELIVERED' ? (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
                  <p className="text-green-800 font-bold mb-2">✅ Paket Sudah Terkirim</p>
                  <p className="text-sm text-green-700">Status tidak dapat diubah lagi</p>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">
                      Status Baru
                    </label>
                    <select 
                      className="w-full border-2 border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      value={form.status} 
                      onChange={(e) => setForm({...form, status: e.target.value})} 
                      required
                    >
                      <option value="">-- Pilih Status --</option>
                      {getNextAvailableStatuses().map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Hanya status berikutnya yang dapat dipilih
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">
                      Lokasi
                    </label>
                    <input 
                      className="w-full border-2 border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="Contoh: Hub Bandung, Jl. Soekarno Hatta" 
                      value={form.location} 
                      onChange={(e) => setForm({...form, location: e.target.value})} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">
                      Keterangan
                    </label>
                    <textarea 
                      className="w-full border-2 border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                      rows="3"
                      placeholder="Deskripsi aktivitas atau keterangan tambahan" 
                      value={form.description} 
                      onChange={(e) => setForm({...form, description: e.target.value})} 
                      required 
                    />
                  </div>
                  
                  {msg && (
                    <div className={`p-3 text-sm rounded-lg border ${
                      msg.type === 'success' 
                        ? 'bg-green-50 text-green-800 border-green-300' 
                        : 'bg-red-50 text-red-800 border-red-300'
                    }`}>
                      {msg.text}
                    </div>
                  )}
                  
                  <button 
                    type="submit"
                    disabled={updating || !form.status || tracking.currentStatus === 'DELIVERED'} 
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition shadow-md"
                  >
                    {updating ? '⏳ Menyimpan...' : '💾 Simpan Update'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tracking;