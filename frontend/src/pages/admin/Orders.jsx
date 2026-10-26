import React, { useState, useEffect, useCallback } from "react";
import {
  Eye, RefreshCw, ShoppingCart, DollarSign, Clock, TrendingUp,
  Package, MapPin, Phone, User as UserIcon, Truck, Hash,
  Calendar, ChevronRight, Search,
} from "lucide-react";
import { orderService } from "../../services";
import { StatusBadge, LoadingState, Pagination, Modal, EmptyState } from "../../components/common";
import toast from "react-hot-toast";

const STATUSES = ["", "pending", "processing", "shipped", "delivered", "completed", "cancelled", "refunded"];
const DATE_RANGES = [
  { label: "All Time", value: "" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

const n = (v) => Number(v) || 0;
const money = (v) => `KES ${n(v).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

// ─── Timeline ────────────────────────────────────────────────────────────────
function OrderTimeline({ timeline }) {
  const icons = {
    pending: "📋", processing: "⚙️", shipped: "📦",
    completed: "✅", cancelled: "❌", refunded: "↩️",
  };
  return (
    <div>
      {timeline.map((event, i) => (
        <div key={event.id} style={{ display: "flex", gap: 12, marginBottom: i < timeline.length - 1 ? 16 : 0 }}>
          <div className="w-9 h-9 rounded-full bg-[#FAF6F0] border border-[#DCC7AA] flex items-center justify-center flex-shrink-0 text-sm">
            {icons[event.status] || "📌"}
          </div>
          <div>
            <div className="font-bold text-[#4E3B2C] text-sm capitalize">{event.status ?? "—"}</div>
            <div className="text-xs text-[#7C6652]">
              {event.created_at ? new Date(event.created_at).toLocaleString("en-KE") : "—"}
            </div>
            {event.note && <div className="text-xs text-[#A6754D] mt-1 font-medium">{event.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Update Status Modal ──────────────────────────────────────────────────────
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
        <select className="w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D]" value={status} onChange={(e) => setStatus(e.target.value)} required>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold text-[#4E3B2C] mb-1.5">Note (optional)</label>
        <textarea className="w-full bg-gray-50 border border-[#DCC7AA] rounded-lg px-4 py-2.5 text-[#4E3B2C] resize-none" value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="e.g., Rider dispatched to CBD" />
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

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function OrderDetailModal({ order, onClose, onUpdateClick }) {
  if (!order) return null;

  const items = order.items || [];
  const addr = order.address;
  const zone = order.shipping_zone;
  const isFree = n(order.shipping_cost) === 0;

  const Section = ({ icon: Icon, title, children }) => (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
        <Icon size={16} className="text-[#A6754D]" />
        <span className="text-xs font-bold uppercase tracking-wider text-[#7C6652]">{title}</span>
      </div>
      {children}
    </div>
  );

  const Row = ({ label, value, mono }) => (
    <div className="flex justify-between items-center mb-2">
      <span className="text-xs text-[#7C6652]">{label}</span>
      <span className={`text-sm font-semibold text-[#4E3B2C] ${mono ? 'font-mono' : ''}`}>{value ?? "—"}</span>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-start mb-6 p-4 bg-[#FAF6F0] rounded-xl border border-[#DCC7AA]">
        <div>
          <div className="font-mono font-bold text-lg text-[#4E3B2C]">{order.order_number ?? "—"}</div>
          <div className="text-xs text-[#7C6652] mt-1 flex items-center gap-1">
            <Calendar size={12} />
            {order.created_at ? new Date(order.created_at).toLocaleString("en-KE") : "—"}
          </div>
        </div>
        <StatusBadge status={(order.status ?? "pending").toLowerCase()} />
      </div>

      <Section icon={UserIcon} title="Customer">
        <Row label="Name" value={order.customer_name} />
        <Row label="Email" value={order.customer_email} />
        {order.customer_phone && <Row label="Phone" value={order.customer_phone} />}
      </Section>

      <Section icon={Package} title={`Items (${items.length})`}>
        {items.length === 0 ? (
          <div className="text-sm text-[#7C6652]">No items</div>
        ) : (
          items.map((item, i) => (
            <div key={item.id ?? i} className={`flex justify-between items-center py-2 ${i < items.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex items-center gap-3">
                {item.product_image ? (
                  <img src={item.product_image} alt={item.product_name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#FAF6F0] border border-[#DCC7AA] flex items-center justify-center">
                    <Package size={16} className="text-[#A6754D]" />
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-[#4E3B2C]">{item.product_name ?? "—"}</div>
                  {item.size && <div className="text-xs text-[#7C6652]">Size: {item.size}</div>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-[#4E3B2C]">{money(item.price)}</div>
                <div className="text-xs text-[#7C6652]">× {item.quantity}</div>
              </div>
            </div>
          ))
        )}
      </Section>

      {addr && (
        <Section icon={MapPin} title="Delivery Address">
          <Row label="Name" value={addr.full_name} />
          <Row label="Phone" value={addr.phone_number} />
          <Row label="Address" value={addr.address_line1} />
          {addr.address_line2 && <Row label="" value={addr.address_line2} />}
          <Row label="City" value={addr.city} />
          <Row label="County" value={addr.county} />
        </Section>
      )}

      <Section icon={Truck} title="Shipping">
        {zone && <Row label="Zone" value={`${zone.name} (${zone.zone_type})`} />}
        <Row label="Cost" value={isFree ? "FREE" : money(order.shipping_cost)} mono />
      </Section>

      <Section icon={Hash} title="Order Summary">
        <Row label="Subtotal" value={money(order.subtotal)} mono />
        <Row label="Shipping" value={isFree ? "FREE" : money(order.shipping_cost)} mono />
        <div className="flex justify-between items-center mt-3 pt-3 border-t-2 border-[#DCC7AA]">
          <span className="font-bold text-[#4E3B2C]">Total</span>
          <span className="font-extrabold text-lg font-mono text-[#A6754D]">{money(order.total)}</span>
        </div>
      </Section>

      {order.timeline?.length > 0 && (
        <Section icon={ChevronRight} title="Timeline">
          <OrderTimeline timeline={order.timeline} />
        </Section>
      )}

      <div className="flex gap-3 justify-end mt-6">
        <button className="px-4 py-2 rounded-lg font-bold text-[#7C6652] border border-[#DCC7AA] bg-white hover:bg-gray-50" onClick={onClose}>Close</button>
        <button className="px-4 py-2 rounded-lg font-bold text-white bg-[#A6754D] hover:bg-[#8D5F3B] flex items-center gap-2" onClick={() => { onClose(); onUpdateClick(order); }}>
          <RefreshCw size={14} /> Update Status
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewOrder, setViewOrder] = useState(null);
  const [updateOrder, setUpdateOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (dateRange) params.date_range = dateRange;
      const { data } = await orderService.list(params);
      setOrders(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch {
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, dateRange]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    orderService.stats().then((r) => setStats(r.data || {})).catch(() => {});
  }, []);

  return (
    <div className="bg-[#F4EDE4] min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#4E3B2C]">Order Management</h1>
          <p className="text-sm text-[#7C6652] mt-1">Track and fulfill customer orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-[#DCC7AA] p-4 shadow-sm">
                <div className="w-8 h-8 bg-[#FAF6F0] rounded-lg flex items-center justify-center mb-2"><ShoppingCart size={16} className="text-[#A6754D]" /></div>
                <div className="text-xl font-bold text-[#4E3B2C]">{n(stats.total_orders).toLocaleString()}</div>
                <div className="text-xs text-[#7C6652]">Total Orders</div>
              </div>
              <div className="bg-white rounded-xl border border-[#DCC7AA] p-4 shadow-sm">
                <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center mb-2"><Clock size={16} className="text-yellow-600" /></div>
                <div className="text-xl font-bold text-[#4E3B2C]">{n(stats.pending)}</div>
                <div className="text-xs text-[#7C6652]">Pending</div>
              </div>
              <div className="bg-white rounded-xl border border-[#DCC7AA] p-4 shadow-sm">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mb-2"><DollarSign size={16} className="text-green-600" /></div>
                <div className="text-lg font-bold text-[#4E3B2C]">{money(stats.revenue_today)}</div>
                <div className="text-xs text-[#7C6652]">Rev. Today</div>
              </div>
              <div className="bg-white rounded-xl border border-[#DCC7AA] p-4 shadow-sm">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-2"><TrendingUp size={16} className="text-blue-600" /></div>
                <div className="text-lg font-bold text-[#4E3B2C]">{money(stats.revenue_sales)}</div>
                <div className="text-xs text-[#7C6652]">Total Rev.</div>
              </div>
            </div>

            {/* Filters & Table */}
            <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm overflow-hidden">
              
              {/* Filter Bar */}
              <div className="p-4 border-b border-[#DCC7AA] bg-[#FAF6F0] flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A6754D]" size={16} />
                  <input type="text" placeholder="Search by order number or customer..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2 bg-white border border-[#DCC7AA] rounded-lg text-sm text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D]" />
                </div>
                <select className="bg-white border border-[#DCC7AA] rounded-lg px-3 py-2 text-sm text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D]" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : "All Status"}</option>)}
                </select>
                <select className="bg-white border border-[#DCC7AA] rounded-lg px-3 py-2 text-sm text-[#4E3B2C] focus:outline-none focus:ring-2 focus:ring-[#A6754D]" value={dateRange} onChange={(e) => { setDateRange(e.target.value); setPage(1); }}>
                  {DATE_RANGES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>

              {loading ? (
                <div className="py-20 flex justify-center"><LoadingState /></div>
              ) : orders.length === 0 ? (
                <div className="py-20 text-center"><EmptyState icon={ShoppingCart} title="No orders found" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-[#7C6652] uppercase text-xs font-bold">
                      <tr>
                        <th className="px-4 py-3">Order ID</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setViewOrder(order)}>
                          <td className="px-4 py-3 font-mono text-xs font-bold text-[#4E3B2C]">{order.order_number ?? "—"}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#A6754D]/10 flex items-center justify-center text-[#A6754D] text-xs font-bold">{order.customer_name?.[0] ?? "?"}</div>
                              <span className="font-medium text-[#4E3B2C]">{order.customer_name ?? "—"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-bold text-[#4E3B2C]">{money(order.total)}</td>
                          <td className="px-4 py-3"><StatusBadge status={(order.status ?? "pending").toLowerCase()} /></td>
                          <td className="px-4 py-3 text-xs text-[#7C6652]">{order.created_at ? new Date(order.created_at).toLocaleDateString("en-KE") : "—"}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 justify-end">
                              <button className="p-1.5 text-[#7C6652] hover:bg-gray-100 rounded-md" onClick={(e) => { e.stopPropagation(); setViewOrder(order); }}><Eye size={16} /></button>
                              <button className="p-1.5 text-[#A6754D] hover:bg-[#FAF6F0] rounded-md" onClick={(e) => { e.stopPropagation(); setUpdateOrder(order); }}><RefreshCw size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="p-4 border-t border-[#DCC7AA] bg-[#FAF6F0]">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm p-5">
              <h3 className="font-bold text-[#4E3B2C] mb-4 pb-2 border-b border-gray-100">Tracking Timeline</h3>
              {viewOrder?.timeline?.length > 0 ? (
                <OrderTimeline timeline={viewOrder.timeline} />
              ) : (
                <div className="text-sm text-[#7C6652] text-center py-6">Click an order to view its timeline.</div>
              )}
            </div>

            {/* 🇰🇪 HIGH VALUE ORDERS (Adjusted for KES) */}
            <div className="bg-white rounded-2xl border border-[#DCC7AA] shadow-sm p-5">
              <h3 className="font-bold text-[#4E3B2C] mb-4 pb-2 border-b border-gray-100">High Value Orders</h3>
              <div className="space-y-3">
                {orders.filter((o) => n(o.total) > 3000).slice(0, 5).map((o) => (
                  <div key={o.id} onClick={() => setViewOrder(o)} className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                    <div>
                      <div className="font-mono text-xs font-bold text-[#4E3B2C]">{o.order_number}</div>
                      <div className="text-xs text-[#7C6652]">{o.customer_name}</div>
                    </div>
                    <StatusBadge status={(o.status ?? "pending").toLowerCase()} />
                  </div>
                ))}
                {orders.filter((o) => n(o.total) > 3000).length === 0 && (
                  <div className="text-sm text-[#7C6652] text-center py-4">No high value orders yet.</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title="Order Details">
        <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} onUpdateClick={(o) => setUpdateOrder(o)} />
      </Modal>

      <Modal open={!!updateOrder} onClose={() => setUpdateOrder(null)} title="Update Order Status">
        {updateOrder && <UpdateStatusModal order={updateOrder} onClose={() => setUpdateOrder(null)} onUpdate={fetchOrders} />}
      </Modal>
    </div>
  );
}