import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { analyticsClient } from '../apollo/client';
import {
  AVERAGE_DELIVERY_TIME_BY_AREA,
  COURIER_PERFORMANCE,
  SHIPMENT_VOLUME,
  DELIVERY_FAILURE_RATE,
} from '../graphql/analytics';
import Layout from '../components/Layout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const Analytics = () => {
  const [selectedArea, setSelectedArea] = useState('JAKARTA');

  const { data: deliveryTimeData, loading: loadingDeliveryTime } = useQuery(
    AVERAGE_DELIVERY_TIME_BY_AREA,
    {
      client: analyticsClient,
      variables: { area: selectedArea },
    }
  );

  const { data: courierData, loading: loadingCourier } = useQuery(
    COURIER_PERFORMANCE,
    {
      client: analyticsClient,
    }
  );

  const { data: shipmentData, loading: loadingShipment } = useQuery(
    SHIPMENT_VOLUME,
    {
      client: analyticsClient,
    }
  );

  const { data: failureRateData, loading: loadingFailure } = useQuery(
    DELIVERY_FAILURE_RATE,
    {
      client: analyticsClient,
      variables: { area: null },
    }
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const courierChartData =
    courierData?.courierPerformance?.map((c) => ({
      name: c.courierName,
      deliveries: c.totalDeliveries,
      successRate: c.successRate,
      avgTime: c.averageDeliveryTime,
    })) || [];

  const shipmentChartData =
    shipmentData?.shipmentVolume?.byStatus?.map((s) => ({
      name: s.status,
      count: s.count,
    })) || [];

  return (
    <Layout>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Operational Analytics
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Average Delivery Time */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Average Delivery Time by Area
            </h2>
            <div className="mb-4">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="JAKARTA">Jakarta</option>
                <option value="BANDUNG">Bandung</option>
                <option value="SURABAYA">Surabaya</option>
              </select>
            </div>
            {loadingDeliveryTime ? (
              <p className="text-gray-600">Loading...</p>
            ) : deliveryTimeData?.averageDeliveryTimeByArea ? (
              <div className="space-y-2">
                <p className="text-3xl font-bold text-primary-600">
                  {deliveryTimeData.averageDeliveryTimeByArea.averageDays} days
                </p>
                <p className="text-gray-600">
                  Total Shipments:{' '}
                  {deliveryTimeData.averageDeliveryTimeByArea.totalShipments}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No data available</p>
            )}
          </div>

          {/* Delivery Failure Rate */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Overall Delivery Failure Rate
            </h2>
            {loadingFailure ? (
              <p className="text-gray-600">Loading...</p>
            ) : failureRateData?.deliveryFailureRate ? (
              <div className="space-y-2">
                <p className="text-3xl font-bold text-red-600">
                  {failureRateData.deliveryFailureRate.failureRate.toFixed(2)}%
                </p>
                <p className="text-gray-600">
                  Failed: {failureRateData.deliveryFailureRate.failedShipments}{' '}
                  / {failureRateData.deliveryFailureRate.totalShipments}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No data available</p>
            )}
          </div>

          {/* Courier Performance Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Courier Performance
            </h2>
            {loadingCourier ? (
              <p className="text-gray-600">Loading...</p>
            ) : courierChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courierChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="deliveries" fill="#8884d8" name="Total Deliveries" />
                  <Bar dataKey="successRate" fill="#82ca9d" name="Success Rate %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600">No data available</p>
            )}
          </div>

          {/* Shipment Volume by Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Shipment Volume by Status
            </h2>
            {loadingShipment ? (
              <p className="text-gray-600">Loading...</p>
            ) : shipmentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={shipmentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {shipmentChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600">No data available</p>
            )}
          </div>

          {/* Courier Average Delivery Time */}
          {courierChartData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Courier Average Delivery Time
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={courierChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgTime"
                    stroke="#8884d8"
                    name="Average Time (days)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;




