import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import StatusBadge from "@/components/StatusBadge";
import { FileText, Calendar, Package, Archive, TrendingUp, Download, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "@/api/api";

function Reports() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("thisMonth");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showReportPreview, setShowReportPreview] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data.data || []);
      filterOrdersByDate(res.data.data || [], dateRange);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParties = async () => {
    try {
      const res = await api.get("/parties");
      setParties(res.data.data || []);
    } catch (error) {
      console.error("Error fetching parties:", error);
    }
  };

  const filterOrdersByDate = (orderList, range) => {
    const now = new Date();
    let startDate, endDate;

    switch (range) {
      case "thisWeek":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = startOfWeek;
        endDate = now;
        break;
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "custom":
        startDate = customStartDate ? new Date(customStartDate) : new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = customEndDate ? new Date(customEndDate) : now;
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
    }

    const filtered = orderList.filter((order) => {
      const orderDate = new Date(order.order_date);
      return orderDate >= startDate && orderDate <= endDate;
    });

    setFilteredOrders(filtered);
  };

  useEffect(() => {
    fetchOrders();
    fetchParties();
  }, []);

  useEffect(() => {
    filterOrdersByDate(orders, dateRange);
  }, [dateRange, customStartDate, customEndDate]);

  const calculateSummary = () => {
    const totalOrders = filteredOrders.length;
    const totalQuantity = filteredOrders.reduce((sum, order) => sum + (order.quantity || 0), 0);
    const completedOrders = filteredOrders.filter((order) => order.status === "Completed").length;
    const pendingOrders = filteredOrders.filter((order) => order.status === "Pending").length;

    return { totalOrders, totalQuantity, completedOrders, pendingOrders };
  };

  const summary = calculateSummary();

  // Calculate advanced analytics
  const calculateAnalytics = () => {
    // Orders per party
    const ordersPerParty = {};
    parties.forEach(party => {
      if (filteredOrders.some(o => o.order_id_custom === party.current_order)) {
        if (!ordersPerParty[party.party_name]) {
          ordersPerParty[party.party_name] = 0;
        }
        ordersPerParty[party.party_name]++;
      }
    });

    // Processes per party
    const processesPerParty = {};
    parties.forEach(party => {
      if (filteredOrders.some(o => o.order_id_custom === party.current_order)) {
        if (!processesPerParty[party.party_name]) {
          processesPerParty[party.party_name] = 0;
        }
        processesPerParty[party.party_name]++;
      }
    });

    // Order completion time (days)
    const orderCompletionTimes = filteredOrders.map(order => {
      const orderDate = new Date(order.order_date);
      const now = new Date();
      const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
      return {
        orderId: order.order_id_custom,
        days: daysDiff,
        status: order.status
      };
    });

    // Average completion time
    const completedOrders = orderCompletionTimes.filter(o => o.status === "Completed");
    const avgCompletionTime = completedOrders.length > 0 
      ? Math.round(completedOrders.reduce((sum, o) => sum + o.days, 0) / completedOrders.length)
      : 0;

    // Weekly order count
    const weeklyOrders = filteredOrders.filter(order => {
      const orderDate = new Date(order.order_date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= weekAgo;
    }).length;

    // Monthly order count
    const monthlyOrders = filteredOrders.filter(order => {
      const orderDate = new Date(order.order_date);
      const now = new Date();
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return orderDate >= monthAgo;
    }).length;

    return {
      ordersPerParty,
      processesPerParty,
      orderCompletionTimes,
      avgCompletionTime,
      weeklyOrders,
      monthlyOrders
    };
  };

  const analytics = calculateAnalytics();

  const exportToCSV = () => {
    const headers = ["Order ID", "Client Name", "Brand", "Product", "Quantity", "Status", "Order Date"];
    const rows = filteredOrders.map(order => [
      order.order_id_custom,
      order.client_name,
      order.brand_name,
      order.product_name,
      order.quantity,
      order.status,
      order.order_date
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${dateRange}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    // Build process data for each order
    const ordersWithProcesses = filteredOrders.map(order => {
      const orderParties = parties.filter((p) => p.current_order === order.order_id_custom);
      return {
        ...order,
        processes: orderParties.map(party => ({
          processName: party.current_process,
          partyName: party.party_name,
          quantityPcs: party.quantity_pcs,
          size: party.size,
          status: party.status
        }))
      };
    });

    const reportData = {
      dateRange,
      startDate: customStartDate || new Date().toISOString().split("T")[0],
      endDate: customEndDate || new Date().toISOString().split("T")[0],
      summary,
      orders: ordersWithProcesses
    };

    const jsonContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${dateRange}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="View Manufacturing Reports"
        icon={FileText}
      />

      {/* Date Range Selector */}
      <SectionCard>
        <div className="flex items-center gap-4 mb-4">
          <Calendar size={20} className="text-slate-600" />
          <h3 className="font-semibold text-lg">Select Date Range:</h3>
        </div>
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setDateRange("thisWeek")}
            className={`px-4 py-2 rounded-lg ${
              dateRange === "thisWeek"
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setDateRange("thisMonth")}
            className={`px-4 py-2 rounded-lg ${
              dateRange === "thisMonth"
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateRange("lastMonth")}
            className={`px-4 py-2 rounded-lg ${
              dateRange === "lastMonth"
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setDateRange("custom")}
            className={`px-4 py-2 rounded-lg ${
              dateRange === "custom"
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Custom Range
          </button>
        </div>
        {dateRange === "custom" && (
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        )}
      </SectionCard>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <Package size={32} className="text-blue-600 mb-2" />
          <p className="text-sm text-slate-600">Total Orders</p>
          <h2 className="text-3xl font-bold text-blue-700">{summary.totalOrders}</h2>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <TrendingUp size={32} className="text-green-600 mb-2" />
          <p className="text-sm text-slate-600">Total Quantity</p>
          <h2 className="text-3xl font-bold text-green-700">{summary.totalQuantity}</h2>
        </div>
        <div className="bg-violet-50 rounded-xl p-6 border border-violet-200">
          <Archive size={32} className="text-violet-600 mb-2" />
          <p className="text-sm text-slate-600">Completed</p>
          <h2 className="text-3xl font-bold text-violet-700">{summary.completedOrders}</h2>
        </div>
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <Calendar size={32} className="text-orange-600 mb-2" />
          <p className="text-sm text-slate-600">Pending</p>
          <h2 className="text-3xl font-bold text-orange-700">{summary.pendingOrders}</h2>
        </div>
      </div>

      {/* Advanced Analytics Cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
          <Calendar size={32} className="text-indigo-600 mb-2" />
          <p className="text-sm text-slate-600">This Week</p>
          <h2 className="text-3xl font-bold text-indigo-700">{analytics.weeklyOrders}</h2>
        </div>
        <div className="bg-teal-50 rounded-xl p-6 border border-teal-200">
          <Calendar size={32} className="text-teal-600 mb-2" />
          <p className="text-sm text-slate-600">This Month</p>
          <h2 className="text-3xl font-bold text-teal-700">{analytics.monthlyOrders}</h2>
        </div>
        <div className="bg-pink-50 rounded-xl p-6 border border-pink-200">
          <TrendingUp size={32} className="text-pink-600 mb-2" />
          <p className="text-sm text-slate-600">Avg Completion (Days)</p>
          <h2 className="text-3xl font-bold text-pink-700">{analytics.avgCompletionTime}</h2>
        </div>
        <div className="bg-cyan-50 rounded-xl p-6 border border-cyan-200">
          <Users size={32} className="text-cyan-600 mb-2" />
          <p className="text-sm text-slate-600">Total Parties</p>
          <h2 className="text-3xl font-bold text-cyan-700">{Object.keys(analytics.ordersPerParty).length}</h2>
        </div>
      </div>

      {/* Orders List */}
      <SectionCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            Orders in Selected Period ({filteredOrders.length})
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowReportPreview(!showReportPreview)}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg flex items-center gap-2 hover:bg-violet-700"
            >
              <FileText size={18} />
              {showReportPreview ? "Hide Preview" : "Show Preview"}
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700"
            >
              <Download size={18} />
              Export CSV
            </button>
            <button
              onClick={exportToJSON}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Download size={18} />
              Export JSON
            </button>
          </div>
        </div>

        {/* Report Preview */}
        {showReportPreview && (
          <div className="mb-6 bg-white border-2 border-slate-200 rounded-xl p-6">
            <div className="border-b-2 border-slate-200 pb-4 mb-4">
              <h3 className="text-xl font-bold text-slate-800">Manufacturing Report</h3>
              <p className="text-slate-600">Period: {dateRange === "thisWeek" ? "This Week" : dateRange === "thisMonth" ? "This Month" : dateRange === "lastMonth" ? "Last Month" : "Custom Range"}</p>
              <p className="text-slate-500 text-sm">Generated on: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Summary Section */}
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-3 text-slate-700">Summary</h4>
              <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-slate-600">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.totalOrders}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600">Total Quantity</p>
                  <p className="text-2xl font-bold text-green-600">{summary.totalQuantity}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-violet-600">{summary.completedOrders}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{summary.pendingOrders}</p>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-3 text-slate-700">Order Details</h4>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-4 py-2 text-left">Order ID</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Client</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Brand</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Product</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Quantity</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Status</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr key={order.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="border border-slate-300 px-4 py-2">{order.order_id_custom}</td>
                      <td className="border border-slate-300 px-4 py-2">{order.client_name}</td>
                      <td className="border border-slate-300 px-4 py-2">{order.brand_name}</td>
                      <td className="border border-slate-300 px-4 py-2">{order.product_name}</td>
                      <td className="border border-slate-300 px-4 py-2">{order.quantity}</td>
                      <td className="border border-slate-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === "Completed" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-4 py-2">{order.order_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Process Details */}
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-3 text-slate-700">Process Details (Real-time Status)</h4>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-4 py-2 text-left">Order ID</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Process Name</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Party</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Quantity (Pcs)</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Size</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const orderParties = parties.filter((p) => p.current_order === order.order_id_custom);
                    if (orderParties.length === 0) return null;
                    return orderParties.map((party, pIndex) => (
                      <tr key={`${order.id}-${party.id}`} className={pIndex % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="border border-slate-300 px-4 py-2">{order.order_id_custom}</td>
                        <td className="border border-slate-300 px-4 py-2">{party.current_process || "N/A"}</td>
                        <td className="border border-slate-300 px-4 py-2">{party.party_name || "Not Assigned"}</td>
                        <td className="border border-slate-300 px-4 py-2">{party.quantity_pcs || 0}</td>
                        <td className="border border-slate-300 px-4 py-2">{party.size || "N/A"}</td>
                        <td className="border border-slate-300 px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            party.status === "active" ? "bg-green-100 text-green-700" : 
                            party.status === "completed" ? "bg-blue-100 text-blue-700" : 
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {party.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
              {parties.filter(p => filteredOrders.some(o => o.order_id_custom === p.current_order)).length === 0 && (
                <p className="text-center text-slate-500 py-4">No process data available for these orders</p>
              )}
            </div>

            {/* Party Performance */}
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-3 text-slate-700">Party Performance (Orders & Processes)</h4>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-4 py-2 text-left">Party Name</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Total Orders</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Total Processes</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Total Quantity (Pcs)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(analytics.ordersPerParty).map(([partyName, orderCount], index) => (
                    <tr key={partyName} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="border border-slate-300 px-4 py-2 font-medium">{partyName}</td>
                      <td className="border border-slate-300 px-4 py-2">{orderCount}</td>
                      <td className="border border-slate-300 px-4 py-2">{analytics.processesPerParty[partyName] || 0}</td>
                      <td className="border border-slate-300 px-4 py-2">
                        {parties.filter(p => p.party_name === partyName).reduce((sum, p) => sum + (p.quantity_pcs || 0), 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {Object.keys(analytics.ordersPerParty).length === 0 && (
                <p className="text-center text-slate-500 py-4">No party data available</p>
              )}
            </div>

            {/* Order Completion Times */}
            <div>
              <h4 className="font-semibold text-lg mb-3 text-slate-700">Order Completion Time (Days)</h4>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-4 py-2 text-left">Order ID</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Days Since Order</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.orderCompletionTimes.map((item, index) => (
                    <tr key={item.orderId} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="border border-slate-300 px-4 py-2">{item.orderId}</td>
                      <td className="border border-slate-300 px-4 py-2">{item.days} days</td>
                      <td className="border border-slate-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === "Completed" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No orders found in selected date range</div>
        ) : (
          <div className="bg-slate-50 rounded-xl px-4 py-4">
            <div className="grid grid-cols-7 gap-4 text-sm font-semibold text-slate-600">
              <div>Order ID</div>
              <div>Client Name</div>
              <div>Brand</div>
              <div>Product</div>
              <div>Quantity</div>
              <div>Status</div>
              <div>Action</div>
            </div>

            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-7 gap-4 py-4 px-2 border-b border-slate-100 items-center"
              >
                <div>{order.order_id_custom}</div>
                <div>{order.client_name}</div>
                <div>{order.brand_name}</div>
                <div>{order.product_name}</div>
                <div>{order.quantity}</div>
                <div>
                  <StatusBadge
                    text={order.status}
                    color={order.status === "Pending" ? "orange" : "green"}
                  />
                </div>
                <div>
                  <button
                    onClick={() => navigate(`/report/${order.order_id_custom}`)}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                  >
                    View Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </>
  );
}

export default Reports;
