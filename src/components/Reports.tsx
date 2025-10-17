import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

type Category = {
  name: string;
  value: number;
  color?: string;
};

type Trend = {
  name: string;
  stock: number;
  dispensed: number;
};

type Stats = {
  totalMedicines: number;
  lowStockItems: number;
  expiringItems: number;
};

type Medicine = {
  id: number;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  expiryDate: string;
  batchNumber: string;
  supplier: string;
};

type ReportData = {
  medicines: Medicine[];
  stats: Stats;
  categories: Category[];
  trends: Trend[];
};

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL;

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data: ReportData = await res.json();
      setReportData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error("Reports fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading reports...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!reportData) return <p>No report data available.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Clinic Reports (Live)</h2>
      {lastUpdated && (
        <p className="text-sm text-gray-500 mb-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-gray-100 rounded shadow">
          <h3 className="font-semibold">Medicines</h3>
          <p className="text-xl">{reportData.stats.totalMedicines}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded shadow">
          <h3 className="font-semibold">Low Stock</h3>
          <p className="text-xl">{reportData.stats.lowStockItems}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded shadow">
          <h3 className="font-semibold">Expiring Soon</h3>
          <p className="text-xl">{reportData.stats.expiringItems}</p>
        </div>
      </div>

      {/* Charts */}
      <h3 className="text-xl font-semibold mb-4">Visualizations</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pie Chart */}
        <div className="w-full h-80 bg-white rounded shadow p-4">
          <h4 className="mb-2 font-semibold">Medicines by Category</h4>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={reportData.categories}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {reportData.categories.map((cat, index) => (
                  <Cell
                    key={index}
                    fill={cat.color ?? ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#00C49F"][index % 5]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="w-full h-80 bg-white rounded shadow p-4">
          <h4 className="mb-2 font-semibold">Category Distribution</h4>
          <ResponsiveContainer>
            <BarChart data={reportData.categories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trends */}
      <div className="w-full h-96 bg-white rounded shadow p-4 mb-8">
        <h4 className="mb-2 font-semibold">Stock & Dispensing Trends</h4>
        <ResponsiveContainer>
          <LineChart data={reportData.trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="stock" stroke="#8884d8" />
            <Line type="monotone" dataKey="dispensed" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        <h4 className="mb-2 font-semibold">Medicines List</h4>
        <table className="table-auto w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Stock</th>
              <th className="p-2 border">Min Stock</th>
              <th className="p-2 border">Expiry Date</th>
              <th className="p-2 border">Batch</th>
              <th className="p-2 border">Supplier</th>
            </tr>
          </thead>
          <tbody>
            {reportData.medicines.map((med) => (
              <tr key={med.id}>
                <td className="p-2 border">{med.name}</td>
                <td className="p-2 border">{med.category}</td>
                <td className="p-2 border">{med.stock}</td>
                <td className="p-2 border">{med.minStock}</td>
                <td className="p-2 border">{new Date(med.expiryDate).toLocaleDateString()}</td>
                <td className="p-2 border">{med.batchNumber}</td>
                <td className="p-2 border">{med.supplier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
