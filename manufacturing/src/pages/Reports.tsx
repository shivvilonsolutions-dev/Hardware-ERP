import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import StatusBadge from "@/components/StatusBadge";
import { FileText, Calendar, Package, Archive, TrendingUp, Download, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "@/api/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Reports() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [parties, setParties] = useState([]);
  const [processSequences, setProcessSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("custom");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showReportPreview, setShowReportPreview] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      console.log("Orders response:", res.data);
      if (res.data && res.data.success) {
        setOrders(res.data.data || []);
        filterOrdersByDate(res.data.data || [], dateRange);
      } else {
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setFilteredOrders([]);
    }
  };

  const fetchParties = async () => {
    try {
      const res = await api.get("/parties");
      console.log("Parties response:", res.data);
      if (res.data && res.data.success) {
        setParties(res.data.data || []);
      } else {
        setParties([]);
      }
    } catch (error) {
      console.error("Error fetching parties:", error);
      setParties([]);
    }
  };

  const fetchProcessSequences = async () => {
    try {
      const res = await api.get("/process-sequences");
      console.log("Process sequences response:", res.data);
      if (res.data && res.data.success) {
        setProcessSequences(res.data.data || []);
      } else {
        setProcessSequences([]);
      }
    } catch (error) {
      console.error("Error fetching process sequences:", error);
      setProcessSequences([]);
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
        if (!customStartDate && !customEndDate) {
          // Show all orders if no dates selected
          setFilteredOrders(orderList);
          return;
        }
        startDate = customStartDate ? new Date(customStartDate) : new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = customEndDate ? new Date(customEndDate) : now;
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
    }

    const filtered = orderList.filter((order) => {
      const orderDate = order.order_date ? new Date(order.order_date) : new Date(order.created_at);
      return orderDate >= startDate && orderDate <= endDate;
    });

    setFilteredOrders(filtered);
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchOrders(),
        fetchParties(),
        fetchProcessSequences()
      ]);
      setLoading(false);
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    filterOrdersByDate(orders, dateRange);
  }, [dateRange, customStartDate, customEndDate]);

  const calculateSummary = () => {
    const totalOrders = filteredOrders.length;
    const totalQuantity = filteredOrders.reduce((sum, order) => sum + (order.quantity || 0), 0);
    const completedOrders = filteredOrders.filter((order) => order.status === "Completed").length;
    const pendingOrders = filteredOrders.filter((order) => order.status === "Pending").length;
    const totalParties = parties.length;
    const totalProcesses = processSequences.length;

    return { totalOrders, totalQuantity, completedOrders, pendingOrders, totalParties, totalProcesses };
  };

  const summary = calculateSummary();

  // Calculate advanced analytics
  const calculateAnalytics = () => {
    // Orders per party
    const ordersPerParty: any = {};
    parties.forEach((party: any) => {
      if (filteredOrders.some((o: any) => o.order_id_custom === party.current_order)) {
        if (!ordersPerParty[party.party_name]) {
          ordersPerParty[party.party_name] = 0;
        }
        ordersPerParty[party.party_name]++;
      }
    });

    // Processes per party
    const processesPerParty: any = {};
    parties.forEach((party: any) => {
      if (filteredOrders.some((o: any) => o.order_id_custom === party.current_order)) {
        if (!processesPerParty[party.party_name]) {
          processesPerParty[party.party_name] = 0;
        }
        processesPerParty[party.party_name]++;
      }
    });

    // Order completion time (days)
    const orderCompletionTimes = filteredOrders.map((order: any) => {
      const orderDate = order.order_date ? new Date(order.order_date) : new Date(order.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
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

  const exportToPDF = () => {
    const doc = new jsPDF();
    let currentY = 22;
    
    // Add title
    doc.setFontSize(18);
    doc.text("Manufacturing Report", 14, currentY);
    currentY += 10;
    
    // Add date range info
    doc.setFontSize(12);
    doc.text(`Period: Custom Range (${customStartDate} to ${customEndDate})`, 14, currentY);
    currentY += 8;
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, currentY);
    currentY += 15;
    
    // Summary section
    doc.setFontSize(14);
    doc.text("Summary", 14, currentY);
    currentY += 5;
    
    autoTable(doc, {
      startY: currentY,
      head: [["Total Orders", "Total Quantity", "Completed", "Pending", "Total Parties", "Total Processes"]],
      body: [[
        summary.totalOrders,
        summary.totalQuantity,
        summary.completedOrders,
        summary.pendingOrders,
        summary.totalParties,
        summary.totalProcesses
      ]],
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }
    });
    
    // Orders table
    doc.addPage();
    currentY = 22;
    doc.setFontSize(18);
    doc.text("Manufacturing Report", 14, currentY);
    currentY += 13;
    doc.setFontSize(14);
    doc.text("Order Details", 14, currentY);
    currentY += 5;
    
    const orderData = filteredOrders.map(order => [
      order.order_id_custom,
      order.client_name,
      order.brand_name,
      order.product_name,
      order.quantity,
      order.status,
      order.order_date || (order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A")
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [["Order ID", "Client", "Brand", "Product", "Quantity", "Status", "Date"]],
      body: orderData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }
    });
    
    // Process details
    doc.addPage();
    currentY = 22;
    doc.setFontSize(18);
    doc.text("Manufacturing Report", 14, currentY);
    currentY += 13;
    doc.setFontSize(14);
    doc.text("Process Details", 14, currentY);
    currentY += 5;
    
    const processData = [];
    filteredOrders.forEach(order => {
      const orderParties = parties.filter(p => p.current_order === order.order_id_custom);
      orderParties.forEach(party => {
        processData.push([
          order.order_id_custom,
          party.current_process || "N/A",
          party.party_name || "Not Assigned",
          party.quantity_pcs || 0,
          party.size || "N/A",
          party.status || "Pending"
        ]);
      });
    });
    
    autoTable(doc, {
      startY: currentY,
      head: [["Order ID", "Process Name", "Party", "Quantity (Pcs)", "Size", "Status"]],
      body: processData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }
    });
    
    // Party details
    doc.addPage();
    currentY = 22;
    doc.setFontSize(18);
    doc.text("Manufacturing Report", 14, currentY);
    currentY += 13;
    doc.setFontSize(14);
    doc.text("Party Details", 14, currentY);
    currentY += 5;
    
    const partyData = parties.map(party => [
      party.party_name,
      party.current_order || "N/A",
      party.current_process || "N/A",
      party.quantity_pcs || 0,
      party.size || "N/A",
      party.status || "Pending"
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [["Party Name", "Current Order", "Current Process", "Quantity (Pcs)", "Size", "Status"]],
      body: partyData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }
    });
    
    doc.save(`report_${customStartDate}_to_${customEndDate}.pdf`);
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
      <div className="grid grid-cols-5 gap-6 mb-6">
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
        <div className="bg-pink-50 rounded-xl p-6 border border-pink-200">
          <Users size={32} className="text-pink-600 mb-2" />
          <p className="text-sm text-slate-600">Total Parties</p>
          <h2 className="text-3xl font-bold text-pink-700">{summary.totalParties}</h2>
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
              onClick={exportToPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Download size={18} />
              Export PDF
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
              <div className="grid grid-cols-5 gap-4 bg-slate-50 p-4 rounded-lg">
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
                <div className="text-center">
                  <p className="text-sm text-slate-600">Total Parties</p>
                  <p className="text-2xl font-bold text-pink-600">{summary.totalParties}</p>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-3 text-slate-700">Order Details ({filteredOrders.length})</h4>
              {filteredOrders.length === 0 ? (
                <p className="text-center text-slate-500 py-4">No orders found. Select a date range or check if orders exist.</p>
              ) : (
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
                        <td className="border border-slate-300 px-4 py-2">{order.order_date || (order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Process Details */}
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-3 text-slate-700">Process Details</h4>
              {(() => {
                const processData = [];
                filteredOrders.forEach((order) => {
                  const orderParties = parties.filter((p) => p.current_order === order.order_id_custom);
                  orderParties.forEach((party) => {
                    processData.push({
                      order,
                      party
                    });
                  });
                });
                
                if (processData.length === 0) {
                  return <p className="text-center text-slate-500 py-4">No process data available for these orders. Parties may not be assigned to orders yet.</p>;
                }
                
                return (
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
                      {processData.map(({ order, party }, pIndex) => (
                        <tr key={`${order.id}-${party.id}`} className={pIndex % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="border border-slate-300 px-4 py-2">{order.order_id_custom}</td>
                          <td className="border border-slate-300 px-4 py-2">{party.current_process || party.process_type || "N/A"}</td>
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
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>

            {/* Party Performance */}
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-3 text-slate-700">Party Details</h4>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-4 py-2 text-left">Party Name</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Current Order</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Current Process</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Quantity (Pcs)</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Size</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parties.map((party, index) => (
                    <tr key={party.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="border border-slate-300 px-4 py-2 font-medium">{party.party_name}</td>
                      <td className="border border-slate-300 px-4 py-2">{party.current_order || "N/A"}</td>
                      <td className="border border-slate-300 px-4 py-2">{party.current_process || "N/A"}</td>
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
                  ))}
                </tbody>
              </table>
              {parties.length === 0 && (
                <p className="text-center text-slate-500 py-4">No party data available</p>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No orders found in selected date range</div>
        ) : (
          <div className="bg-slate-50 rounded-xl px-4 py-4">
            <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-slate-600">
              <div>Order ID</div>
              <div>Client Name</div>
              <div>Brand</div>
              <div>Product</div>
              <div>Quantity</div>
              <div>Status</div>
            </div>

            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-6 gap-4 py-4 px-2 border-b border-slate-100 items-center"
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
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </>
  );
}

export default Reports;
