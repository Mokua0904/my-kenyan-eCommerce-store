import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import {
  DollarSign, ShoppingCart, Users, TrendingUp, Eye, RefreshCw, MapPin,
} from "lucide-react";
import { analyticsService, orderService } from "../../services";
import { StatusBadge, LoadingState, Modal } from "../../components/common";

const COLORS = ["#c2621a", "#e8894a", "#f5b88a", "#2d7a4a", "#1a6fa8"];
const STATUSES = ["pending", "processing", "shipped", "delivered", "completed", "cancelled", "refunded"];

// 🇰🇪 Kenyan Currency Formatter
const kes = (v) => `KES ${Number(v || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const kesShort = (v) => {
  v = Number(v || 0);
  if (v >= 1000000) return `KES ${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `KES ${(v / 1000).toFixed(1)}K`;
  return `KES ${v.toFixed(0)}`;
};

function UpdateStatusModal({ order, onClose, onUpdate }) {
  const [status, setStatus] = useState(order?.status || "");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await orderService.updateStatus(order.id, { status, note });
      toast.success("Status updated");
      onUpdate();
      onClose();
    } catch {
      toast.error("Error updating status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-bold text-[#4E3B2C] mb-1.5">New Status</label>
        <select className="w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-[#4E3B2C]" value={status} onChange={(e) => setStatus(e.target.value)} required>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold text-[#4E3B2C] mb-1.5">Note (optional)</label>
        <textarea className="w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-[#4E3B2C] resize-none" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
      </div>
      <div className="flex gap-3 justify-end mt-6">
        <button type="button" className="px-4 py-2 rounded-lg font-bold text-[#7C6652] border border-[#DCC7AA] bg-white hover:bg-gray-50" onClick={onClose}>Cancel</button>
        <button type="submit" className="px-4 py-2 rounded-lg font-bold text-white bg-[#A6754D] hover:bg-[#8D5F3B] disabled:opacity-60" disabled={loading}>
          {loading ? "Updating..." : "Update Status"}
        </button>
      </div>
    </form>
  );
}

// Custom Stat Card to match theme
function StatCard({ icon: Icon, label, value, color = "#A6754D" }) {
  return (
    <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm p-6 relative overflow-hidden">
      <div className="absolute right-[-10px] top-[-10px] w-20 h-20 rounded-full opacity-10" style={{ background: color }} />
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: color + '20', color }}>
        <Icon size={20} />
      </div>
      <div className="text-2xl font-bold text-[#4E3B2C] mb-1">{value}</div>
      <div className="text-sm text-[#7C6652] font-medium">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState(null);
  const [updateOrder, setUpdateOrder] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, salesRes, catRes, custRes, ordersRes] = await Promise.all([
        analyticsService.dashboard(),
        analyticsService.salesChart(30),
        analyticsService.productCategories(),
        analyticsService.topCustomers(),
        orderService.list({ page_size: 5 }),
      ]);
      setStats(statsRes.data || null);
      setSalesData(salesRes.data || []);
      setCategoryData(catRes.data || []);
      setTopCustomers(custRes.data || []);
      setRecentOrders(ordersRes.data.results || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshOrders = async () => {
    try {
      const res = await orderService.list({ page_size: 5 });
      setRecentOrders(res.data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="bg-[#F4EDE4] min-h-screen p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#4E3B2C]">Dashboard Overview</h1>
        <p className="text-sm text-[#7C6652] mt-1 flex items-center gap-1">
          <MapPin size={14} className="text-[#A6754D]" /> Nairobi CBD Shop · Live Data
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={DollarSign} label="Total Sales" value={kesShort(stats?.total_sales)} color="#A6754D" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={stats?.orders_count || 0} color="#1a6fa8" />
        <StatCard icon={Users} label="New Customers" value={`${stats?.new_customers_pct || 0}%`} color="#2d7a4a" />
        <StatCard icon={TrendingUp} label="Avg Order Value" value={kesShort(stats?.avg_order_value)} color="#6a1a8a" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Daily Sales */}
        <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm p-6">
          <h3 className="text-lg font-bold text-[#4E3B2C] mb-4">Daily Sales (KES)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e2db" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => kesShort(v).replace('KES ', '')} />
              <Tooltip formatter={(v) => [kes(v), "Sales"]} contentStyle={{ borderRadius: 8, border: 'none', background: '#4E3B2C', color: 'white' }} />
              <Line type="monotone" dataKey="sales" stroke="#A6754D" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Product Category */}
        <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm p-6">
          <h3 className="text-lg font-bold text-[#4E3B2C] mb-4">Product Categories</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={categoryData} dataKey="count" nameKey="category__name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: 'none', background: '#4E3B2C', color: 'white' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm p-6">
          <h3 className="text-lg font-bold text-[#4E3B2C] mb-4">Top Customers</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topCustomers} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => kesShort(v).replace('KES ', '')} />
              <YAxis type="category" dataKey="customer__first_name" tick={{ fontSize: 10 }} width={60} />
              <Tooltip formatter={(v) => [kes(v), "Revenue"]} contentStyle={{ borderRadius: 8, border: 'none', background: '#4E3B2C', color: 'white' }} />
              <Bar dataKey="total_spent" fill="#A6754D" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#DCC7AA] bg-[#FAF6F0]">
          <h3 className="text-lg font-bold text-[#4E3B2C]">Recent Orders</h3>
          <button className="text-sm font-bold text-[#A6754D] hover:text-[#4E3B2C] transition" onClick={() => navigate("/admin/orders")}>
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-[#7C6652] uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-[#4E3B2C]">{order.order_number ?? "—"}</td>
                  <td className="px-6 py-4 font-medium text-[#4E3B2C]">{order.customer_name ?? "—"}</td>
                  <td className="px-6 py-4"><StatusBadge status={(order.status ?? "pending").toLowerCase()} /></td>
                  <td className="px-6 py-4 font-bold text-[#4E3B2C]">{kes(order.total)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <button className="flex items-center gap-1 text-xs font-bold text-[#7C6652] border border-[#DCC7AA] px-3 py-1.5 rounded-lg hover:bg-[#FAF6F0]" onClick={() => setViewOrder(order)}>
                        <Eye size={13} /> View
                      </button>
                      <button className="flex items-center gap-1 text-xs font-bold text-white bg-[#A6754D] px-3 py-1.5 rounded-lg hover:bg-[#8D5F3B]" onClick={() => setUpdateOrder(order)}>
                        <RefreshCw size={13} /> Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-[#7C6652]">No recent orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Order Modal */}
      <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title={`Order ${viewOrder?.order_number ?? ""}`}>
        {viewOrder && (
          <div className="space-y-3 text-sm text-[#4E3B2C]">
            <p><strong>Customer:</strong> {viewOrder.customer_name}</p>
            <p><strong>Status:</strong> <StatusBadge status={viewOrder.status} /></p>
            <p><strong>Total:</strong> {kes(viewOrder.total)}</p>
            <p><strong>Date:</strong> {new Date(viewOrder.created_at).toLocaleString("en-KE")}</p>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal open={!!updateOrder} onClose={() => setUpdateOrder(null)} title="Update Order Status">
        {updateOrder && <UpdateStatusModal order={updateOrder} onClose={() => setUpdateOrder(null)} onUpdate={refreshOrders} />}
      </Modal>
    </div>
  );
}