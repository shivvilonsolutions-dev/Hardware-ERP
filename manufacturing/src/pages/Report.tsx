import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import { FileText, Package, Factory, Archive, TrendingUp, Users, Loader2 } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "@/api/api";

function Report() {
  const location = useLocation();
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [processSequence, setProcessSequence] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  // Fetch data from API
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        console.log("=== Report Page Data Fetch ===");
        console.log("Location state:", location.state);
        console.log("OrderId:", orderId);
        
        // If data is passed via state, use it immediately
        if (location.state?.order || location.state?.processSequence) {
          console.log("Using state data:", location.state);
          setOrder(location.state.order);
          setProcessSequence(location.state.processSequence || []);
          setInventoryItems(location.state.inventoryItems || []);
          setLoading(false);
          console.log("Data loaded from state");
          return;
        }

        // Try sessionStorage as fallback
        const sessionData = sessionStorage.getItem('reportData');
        if (sessionData) {
          console.log("Using sessionStorage data");
          const parsedData = JSON.parse(sessionData);
          setOrder(parsedData.order);
          setProcessSequence(parsedData.processSequence || []);
          setInventoryItems(parsedData.inventoryItems || []);
          sessionStorage.removeItem('reportData'); // Clear after use
          setLoading(false);
          console.log("Data loaded from sessionStorage");
          return;
        }

        console.log("No state data, fetching from API");

        // Otherwise fetch from API using orderId
        if (orderId && orderId !== 'new') {
          // Fetch order details
          const orderResponse = await api.get(`/orders`);
          console.log("Orders API response:", orderResponse.data);
          if (orderResponse.data?.data) {
            const foundOrder = orderResponse.data.data.find((o: any) => o.order_id_custom === orderId || o.id === orderId);
            if (foundOrder) {
              setOrder(foundOrder);
              console.log("Found order:", foundOrder);
            }
          }

          // Try to fetch parties for this order (as proxy for process data)
          const partyResponse = await api.get(`/parties`);
          console.log("Parties API response:", partyResponse.data);
          if (partyResponse.data?.data) {
            const orderParties = partyResponse.data.data.filter((p: any) => p.current_order === orderId);
            console.log("Order parties:", orderParties);
            // Convert party data to process sequence format
            const processSteps = orderParties.map((party: any, index: number) => ({
              id: `process-${party.id}`,
              processName: party.current_process || `Process ${index + 1}`,
              processType: "basic",
              partyName: party.party_name,
              fields: {
                inputQty: party.quantity_pcs || 0,
                rejection: 0,
                extra: 0,
                output: party.quantity_pcs || 0,
                size: party.size || "",
              },
            }));
            setProcessSequence(processSteps);
            console.log("Process steps created:", processSteps);
          }
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
        console.log("Loading complete. Order:", order, "Process count:", processSequence.length);
      }
    };

    fetchReportData();
  }, [orderId, location.state]);

  // Calculate totals
  const calculateTotals = () => {
    let totalExtra = 0;
    let totalRejection = 0;
    let finalOutput = 0;

    processSequence.forEach((step: any) => {
      totalExtra += step.fields.extra || 0;
      totalRejection += step.fields.rejection || 0;
      if (step.processType === "packing") {
        finalOutput = step.fields.totalBoxes || 0;
      }
    });

    return { totalExtra, totalRejection, finalOutput };
  };

  const { totalExtra, totalRejection, finalOutput } = calculateTotals();

  const colors = ["green", "blue", "violet", "pink", "indigo", "orange", "teal"];

  // Loading state
  if (loading) {
    return (
      <>
        <PageHeader
          title="Manufacturing Report"
          subtitle="Complete Process Summary"
          icon={FileText}
        />
        <SectionCard>
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-600">Loading report data...</p>
          </div>
        </SectionCard>
      </>
    );
  }

  // No data state
  if (processSequence.length === 0) {
    return (
      <>
        <PageHeader
          title="Manufacturing Report"
          subtitle="Complete Process Summary"
          icon={FileText}
        />
        <SectionCard>
          <div className="flex flex-col items-center justify-center py-20">
            <FileText className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-slate-600 mb-2">No process data available for this report</p>
            <p className="text-sm text-slate-500">Please navigate from the Process page after adding processes</p>
          </div>
        </SectionCard>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Manufacturing Report"
        subtitle="Complete Process Summary"
        icon={FileText}
      />

      {/* Order Details */}
      <SectionCard>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Factory size={24} className="text-blue-600" />
          Order Details
        </h2>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="block text-sm text-slate-500 mb-1">Order ID</label>
            <p className="font-semibold text-lg">{order?.order_id_custom || "N/A"}</p>
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Product Name</label>
            <p className="font-semibold text-lg">{order?.product_name || "N/A"}</p>
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Client Name</label>
            <p className="font-semibold text-lg">{order?.client_name || "N/A"}</p>
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Order Date</label>
            <p className="font-semibold text-lg">{order?.order_date || "N/A"}</p>
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Quantity</label>
            <p className="font-semibold text-lg">{order?.quantity || 0} {order?.unit || "Pcs"}</p>
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Status</label>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              order?.status === "Completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
            }`}>
              {order?.status || "In Progress"}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Process Flow Summary */}
      <SectionCard>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <TrendingUp size={24} className="text-violet-600" />
          Process Flow Summary
        </h2>
        <div className="space-y-6">
          {processSequence.map((step: any, index: number) => {
            const color = colors[index % colors.length];
            return (
              <div key={step.id} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full bg-${color}-500 text-white flex items-center justify-center font-bold text-xl`}>
                    {index + 1}
                  </div>
                  {index < processSequence.length - 1 && <div className="w-[2px] h-24 bg-slate-300 mt-2"></div>}
                </div>
                <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{step.processName}</h3>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold bg-${color}-500 text-white`}>
                      PROCESS {index + 1}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Party:</span>
                      <span className="ml-2 font-medium">{step.partyName || "Not Assigned"}</span>
                    </div>
                    {step.fields.inputQty !== undefined && (
                      <div>
                        <span className="text-slate-500">Input:</span>
                        <span className="ml-2 font-medium">{step.fields.inputQty}</span>
                      </div>
                    )}
                    {step.fields.rejection !== undefined && (
                      <div>
                        <span className="text-slate-500">Rejection:</span>
                        <span className="ml-2 font-medium text-red-600">{step.fields.rejection}</span>
                      </div>
                    )}
                    {step.fields.extra !== undefined && (
                      <div>
                        <span className="text-slate-500">Extra:</span>
                        <span className="ml-2 font-medium text-orange-600">{step.fields.extra}</span>
                      </div>
                    )}
                    {step.fields.output !== undefined && (
                      <div>
                        <span className="text-slate-500">Output:</span>
                        <span className="ml-2 font-medium text-green-600">{step.fields.output}</span>
                      </div>
                    )}
                    {step.fields.size && (
                      <div>
                        <span className="text-slate-500">Size:</span>
                        <span className="ml-2 font-medium">{step.fields.size}</span>
                      </div>
                    )}
                    {step.fields.rate !== undefined && (
                      <div>
                        <span className="text-slate-500">Rate:</span>
                        <span className="ml-2 font-medium">{step.fields.rate}</span>
                      </div>
                    )}
                    {step.fields.totalCost !== undefined && (
                      <div>
                        <span className="text-slate-500">Total Cost:</span>
                        <span className="ml-2 font-medium">{step.fields.totalCost}</span>
                      </div>
                    )}
                    {step.fields.totalBoxes !== undefined && (
                      <div>
                        <span className="text-slate-500">Total Boxes:</span>
                        <span className="ml-2 font-medium text-green-600">{step.fields.totalBoxes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Calculations Summary */}
      <SectionCard>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Archive size={24} className="text-green-600" />
          Calculations Summary
        </h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="flex items-center gap-4 bg-orange-50 rounded-xl p-6 border border-orange-200">
            <Package size={32} className="text-orange-600" />
            <div>
              <p className="text-sm text-slate-500">Total Added To Inventory (Extra)</p>
              <h2 className="text-3xl font-bold text-orange-700">{totalExtra} <span className="text-lg font-normal">Pcs</span></h2>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-red-50 rounded-xl p-6 border border-red-200">
            <Archive size={32} className="text-red-600" />
            <div>
              <p className="text-sm text-slate-500">Total Rejection (Scrap)</p>
              <h2 className="text-3xl font-bold text-red-700">{totalRejection} <span className="text-lg font-normal">Pcs</span></h2>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-green-50 rounded-xl p-6 border border-green-200">
            <Archive size={32} className="text-green-600" />
            <div>
              <p className="text-sm text-slate-500">Final Output (Boxes)</p>
              <h2 className="text-3xl font-bold text-green-700">{finalOutput} <span className="text-lg font-normal">Box</span></h2>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Party Assignments */}
      <SectionCard>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Users size={24} className="text-blue-600" />
          Party Assignments
        </h2>
        <div className="bg-slate-50 rounded-xl overflow-hidden">
          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-100 text-sm font-semibold text-slate-600">
            <div>Process</div>
            <div>Party Name</div>
            <div>Status</div>
          </div>
          {processSequence.map((step: any, index: number) => (
            <div key={step.id} className="grid grid-cols-3 gap-4 p-4 border-t border-slate-200 items-center">
              <div className="font-medium">{step.processName}</div>
              <div>{step.partyName || "Not Assigned"}</div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  step.partyName ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}>
                  {step.partyName ? "Assigned" : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Inventory Usage */}
      {inventoryItems.length > 0 && (
        <SectionCard>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Package size={24} className="text-violet-600" />
            Inventory Usage
          </h2>
          <div className="bg-slate-50 rounded-xl overflow-hidden">
            <div className="grid grid-cols-5 gap-4 p-4 bg-slate-100 text-sm font-semibold text-slate-600">
              <div>Party Name</div>
              <div>Order Name</div>
              <div>Process Name</div>
              <div>Quantity Used</div>
              <div>Status</div>
            </div>
            {inventoryItems.map((item: any) => (
              <div key={item.id} className="grid grid-cols-5 gap-4 p-4 border-t border-slate-200 items-center">
                <div className="font-medium">{item.partyName}</div>
                <div>{item.orderName}</div>
                <div>{item.processName}</div>
                <div>{item.quantity} {item.unit}</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === "Available" ? "bg-green-100 text-green-700" :
                    item.status === "In Process" ? "bg-blue-100 text-blue-700" :
                    item.status === "Used" ? "bg-gray-100 text-gray-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </>
  );
}

export default Report;
