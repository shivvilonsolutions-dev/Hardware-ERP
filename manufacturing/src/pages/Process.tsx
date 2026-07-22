import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import ProductProcessModal from "@/components/ProductProcessModal";
import InventorySelect from "@/components/InventorySelect";
import ProcessFlowVisualization from "@/components/ProcessFlowVisualization";
import FormSelect from "@/components/FormSelect";
import DynamicProcessStep from "@/components/DynamicProcessStep";
import api from "@/api/api";
import { PROCESS_TYPES } from "@/config/processTypes";
import {
  Factory,
  Save,
  Package,
  Trash2,
  Archive,
  Settings,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";


function Process() {

  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

    const [showProcessModal, setShowProcessModal] = useState(false);
  const [processNames, setProcessNames] = useState([
    "Cutting",
    "Polishing",
    "Packaging",
    "Quality Check",
    "Painting",
    "Assembly",
    "Testing",
  ]);
  const [partyNames, setPartyNames] = useState([
    "Party A",
    "Party B",
    "Party C",
    "Party D",
  ]);

  // Fetch parties from API
  const fetchParties = async () => {
    try {
      const response = await api.get("/parties");
      console.log("Parties API:", response.data);
      if (response.data && response.data.success) {
        const partyNames = response.data.data.map((item) => item.party_name || "");
        setPartyNames(partyNames);
      }
    } catch (error) {
      console.error("Error fetching parties:", error);
    }
  };

  useEffect(() => {
    fetchParties();
    if (order?.order_id_custom) {
      fetchProcessSequences(order.order_id_custom);
    }
  }, [order]);

  // Fetch existing process sequences from API and update default processes
  const fetchProcessSequences = async (orderId: string) => {
    try {
      const response = await api.get(`/process-sequences/order/${orderId}`);
      if (response.data?.success && response.data.data.length > 0) {
        // Update default processes with saved data
        const savedSequences = response.data.data;
        setProductProcessSequence((prev) => 
          prev.map((step, index) => {
            const saved = savedSequences[index];
            if (saved) {
              return {
                ...step,
                partyName: saved.party_name || "",
                fields: {
                  ...step.fields,
                  inputQty: saved.input_qty || step.fields.inputQty,
                  output: saved.output_qty || step.fields.output,
                  rejection: saved.rejection || step.fields.rejection,
                  extra: saved.extra || step.fields.extra,
                  size: saved.size || step.fields.size,
                  rate: saved.rate || step.fields.rate,
                  totalCost: saved.total_cost || step.fields.totalCost,
                  totalBoxes: saved.total_boxes || step.fields.totalBoxes,
                  cutting: saved.cutting || step.fields.cutting,
                }
              };
            }
            return step;
          })
        );
      }
    } catch (error) {
      console.error("Error fetching process sequences:", error);
    }
  };

  // Save process sequences to API
  const saveProcessSequences = async () => {
    try {
      // First delete existing sequences for this order
      if (order?.order_id_custom) {
        await api.delete(`/process-sequences/order/${order.order_id_custom}`);
      }

      // Then save new sequences
      for (let i = 0; i < productProcessSequence.length; i++) {
        const step = productProcessSequence[i];
        const payload = {
          order_id: order?.order_id_custom,
          process_name: step.processName,
          process_type: step.processType,
          sequence_number: i + 1,
          party_id: step.partyName ? parties.find((p: any) => p.party_name === step.partyName)?.id : null,
          input_qty: step.fields.inputQty || 0,
          output_qty: step.fields.output || 0,
          rejection: step.fields.rejection || 0,
          extra: step.fields.extra || 0,
          size: step.fields.size || null,
          rate: step.fields.rate || 0,
          total_cost: step.fields.totalCost || 0,
          total_boxes: step.fields.totalBoxes || 0,
          cutting: step.fields.cutting || 0,
          status: "completed"
        };
        await api.post("/process-sequences", payload);
      }

      alert("Process sequences saved successfully!");
    } catch (error) {
      console.error("Error saving process sequences:", error);
      alert("Error saving process sequences");
    }
  };

  const [productProcessSequence, setProductProcessSequence] = useState([
    { id: "process-1", processName: "Raw Material", processType: "basic", partyName: "", fields: { inputQty: 0, rejection: 0, extra: 0, output: 0 } },
    { id: "process-2", processName: "Cutting", processType: "withSize", partyName: "", fields: { size: "", inputQty: 0, rejection: 0, extra: 0, output: 0 } },
    { id: "process-3", processName: "Drilling", processType: "cutting", partyName: "", fields: { size: "", inputQty: 0, cutting: 0, hole: 0, rate: 0, rejection: 0, extra: 0, output: 0 } },
    { id: "process-4", processName: "Polish", processType: "finishing", partyName: "", fields: { size: "", inputQty: 0, finishing: "", rate: 0, totalCost: 0, rejection: 0, extra: 0, output: 0 } },
    { id: "process-5", processName: "Packing", processType: "packing", partyName: "", fields: { size: "", inputQty: 0, piecesPerBox: 0, totalBoxes: 0 } },
  ]);

  const [inventoryItems, setInventoryItems] = useState([
    {
      id: 1,
      partyName: "Party A",
      orderName: "ORD-001",
      orderDate: "2024-05-15",
      processName: "Cutting",
      quantity: 15,
      unit: "Pieces",
      status: "Available"
    },
    {
      id: 2,
      partyName: "Party B",
      orderName: "ORD-002",
      orderDate: "2024-05-16",
      processName: "Polishing",
      quantity: 8,
      unit: "Pieces",
      status: "Available"
    },
    {
      id: 3,
      partyName: "Party C",
      orderName: "ORD-003",
      orderDate: "2024-05-17",
      processName: "Packaging",
      quantity: 12,
      unit: "Pieces",
      status: "In Process"
    },
  ]);


  // Handle field changes and trigger calculations
  const handleFieldChange = (stepId: string, fieldKey: string, value: any) => {
    setProductProcessSequence((prevSequence) => {
      return prevSequence.map((step) => {
        if (step.id !== stepId) return step;
        
        // If changing processName, update it directly
        if (fieldKey === "processName") {
          return { ...step, processName: value };
        }
        
        const updatedFields = { ...step.fields, [fieldKey]: value };
        const processConfig = PROCESS_TYPES[step.processType as keyof typeof PROCESS_TYPES];
        
        // Calculate output and other derived fields
        if (processConfig) {
          // Calculate cutting for cutting type
          if (step.processType === "cutting" && updatedFields.size > 0) {
            updatedFields.cutting = updatedFields.inputQty / updatedFields.size;
          }
          
          // Calculate total cost for finishing type
          if (step.processType === "finishing") {
            updatedFields.totalCost = updatedFields.inputQty * updatedFields.rate;
          }
          
          // Calculate total boxes for packing type
          if (step.processType === "packing" && updatedFields.piecesPerBox > 0) {
            updatedFields.totalBoxes = updatedFields.inputQty / updatedFields.piecesPerBox;
          }
          
          // Calculate output for all types except packing
          if (step.processType !== "packing") {
            updatedFields.output = updatedFields.inputQty - (updatedFields.rejection || 0) - (updatedFields.extra || 0);
          }
        }
        
        return { ...step, fields: updatedFields };
      });
    });
  };

  // Handle party change
  const handlePartyChange = (stepId: string, partyName: string) => {
    setProductProcessSequence((prevSequence) =>
      prevSequence.map((step) => (step.id === stepId ? { ...step, partyName } : step))
    );
  };

  // Handle inventory selection
  const handleInventorySelect = (stepId: string, item: any) => {
    handleFieldChange(stepId, "inputQty", item.quantity);
  };

  // Calculate totals across all processes
  const calculateTotals = () => {
    let totalExtra = 0;
    let totalRejection = 0;
    let finalOutput = 0;

    productProcessSequence.forEach((step) => {
      totalExtra += step.fields.extra || 0;
      totalRejection += step.fields.rejection || 0;
      if (step.processType === "packing") {
        finalOutput = step.fields.totalBoxes || 0;
      }
    });

    return { totalExtra, totalRejection, finalOutput };
  };

  const { totalExtra, totalRejection, finalOutput } = calculateTotals();

  return (
    <>
      <PageHeader
        title="Manufacturing Process"
        subtitle="Manage Production Flow"
        icon={Factory}
      />

      <SectionCard>

  <div className="grid grid-cols-7 gap-6 items-center">

    <div>
      <p className="text-sm text-slate-500">
        Order No.
      </p>
      <h3 className="font-semibold">
        {order?.order_id_custom}
      </h3>
    </div>

    <div>
      <p className="text-sm text-slate-500">
        Order Date
      </p>
      <h3 className="font-semibold">
        {new Date(
  order?.created_at
).toLocaleDateString()}
      </h3>
    </div>

    <div>
      <p className="text-sm text-slate-500">
        Delivery Date
      </p>
      <h3 className="font-semibold">
        30 May 2024
      </h3>
    </div>

    <div>
      <p className="text-sm text-slate-500">
        Party Name (From Order)
      </p>
      <h3 className="font-semibold text-blue-600">
        {order?.client_name}
      </h3>
    </div>

    <div>
      <p className="text-sm text-slate-500">
        Total Qty (Order)
      </p>
      <h3 className="font-semibold">
        {order?.quantity} Pcs
      </h3>
    </div>

     <div>
      <p className="text-sm text-slate-500">
        Status
      </p>

      <h3 className="font-semibold text-green-600">
        {order?.status}
      </h3>
    </div>

    <div className="flex justify-end">
     <button
  onClick={() => navigate("/process")}
  className="px-5 py-3 border rounded-xl hover:bg-slate-50"
>
  ← Back to Orders
</button>
    </div>

  </div>

</SectionCard>


<SectionCard>

  <div className="grid grid-cols-4 gap-6 items-end">

    <div className="col-span-2">
      <label className="block text-sm font-medium mb-2">
        Product Name (From Inventory)
      </label>

      <div className="flex gap-2">
        <input
    value={order?.product_name || ""}
    readOnly
    className="
      flex-1
      border
      rounded-xl
      px-4 py-3
      bg-slate-50
    "
  />
        <button
      onClick={() => setShowProcessModal(true)}
      className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
      title="Configure Process Sequence"
    >
      <Settings size={18} />
    </button>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">
        Selected Unit
      </label>

      <div className="flex gap-6 mt-3">

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="unit"
          />
          KG
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="unit"
            defaultChecked
          />
          Pieces
        </label>

      </div>
    </div>

    <div className="flex justify-end gap-3">

     <button
  className="
    px-6 py-3
    bg-blue-600
    text-white
    rounded-xl
    flex items-center gap-2
  "
>
  <Save size={18} />
  Save Process
</button>

      <button
        onClick={() => {
          console.log("Generating report with data:", {
            order,
            processSequence: productProcessSequence,
            inventoryItems,
          });
          navigate(`/report/${order?.order_id_custom || order?.id || 'new'}`, {
            state: {
              order,
              processSequence: productProcessSequence,
              inventoryItems,
            },
          });
        }}
        className="
          px-6 py-3
          bg-violet-600
          text-white
          rounded-xl
          flex items-center gap-2
        "
      >
        <FileText size={18} />
        Generate Report
      </button>

      <button
        className="
          px-6 py-3
          border
          rounded-xl
        "
      >
        Reset
      </button>

    </div>

  </div>

</SectionCard>

<h2 className="text-xl font-bold mt-8 mb-4">
  PROCESS FLOW
</h2>

<SectionCard>
  {productProcessSequence.map((step, index) => (
    <div key={step.id}>
      <DynamicProcessStep
        step={step}
        index={index}
        totalSteps={productProcessSequence.length}
        partyNames={partyNames}
        inventoryItems={inventoryItems}
        onFieldChange={handleFieldChange}
        onPartyChange={handlePartyChange}
        onInventorySelect={handleInventorySelect}
      />
      {index < productProcessSequence.length - 1 && (
        <div className="border-t border-slate-200 my-8"></div>
      )}
    </div>
  ))}
</SectionCard>

<SectionCard>

  <div className="grid grid-cols-3 gap-8">

    {/* Total Extra */}

    <div className="flex items-center gap-4">

      <Package size={32} className="text-green-600" />

      <div>
        <p className="text-sm text-slate-500">
          Total Added To Inventory (Extra)
        </p>

        <h2 className="text-3xl font-bold">
         {totalExtra}  <span className="text-lg font-normal">Pcs</span>
        </h2>
      </div>

      {Number(totalExtra) > 0 && (
        <button
          onClick={() => {
            const newItem = {
              id: Date.now(),
              partyName: order?.client_name || "Unknown",
              orderName: order?.order_id_custom || "Unknown",
              orderDate: new Date().toISOString().split('T')[0],
              processName: "Process Surplus",
              quantity: totalExtra,
              unit: "Pieces",
              status: "Available"
            };
            setInventoryItems([...inventoryItems, newItem]);
            alert(`${totalExtra} items sent to inventory`);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700"
        >
          Send to Inventory
        </button>
      )}

    </div>

    {/* Rejection */}

    <div className="flex items-center gap-4">

      <Trash2 size={32} className="text-red-600" />

      <div>
        <p className="text-sm text-slate-500">
          Total Rejection (Scrap)
        </p>

        <h2 className="text-3xl font-bold">
          {totalRejection} <span className="text-lg font-normal">Pcs</span>
        </h2>
      </div>

    </div>

    {/* Final Output */}

    <div className="flex items-center gap-4">

     <Archive size={32} className="text-blue-600" />

      <div>
        <p className="text-sm text-slate-500">
          Final Output (Boxes)
        </p>

        <h2 className="text-3xl font-bold">
          {finalOutput}<span className="text-lg font-normal">Box</span>
        </h2>
      </div>

    </div>

  </div>

</SectionCard>

<SectionCard>
  <h2 className="text-xl font-semibold mb-6">
    Available Inventory
  </h2>

  <div className="bg-slate-50 rounded-xl px-4 py-4">
    <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-slate-600">
      <div>Party Name</div>
      <div>Order Name</div>
      <div>Order Date</div>
      <div>Process Name</div>
      <div>Quantity</div>
      <div>Status</div>
    </div>

    {inventoryItems.length === 0 ? (
      <div className="py-8 text-center text-slate-500">
        No inventory items available
      </div>
    ) : (
      inventoryItems.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-6 gap-4 py-4 px-3 border-b border-slate-100 items-center hover:bg-slate-50 transition"
        >
          <div className="font-medium">{item.partyName}</div>
          <div>{item.orderName}</div>
          <div>{item.orderDate}</div>
          <div>{item.processName}</div>
          <div>
            {item.quantity} {item.unit}
          </div>
          <div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.status === "Available"
                  ? "bg-green-100 text-green-700"
                  : item.status === "In Process"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {item.status}
            </span>
          </div>
        </div>
      ))
    )}
  </div>
</SectionCard>

<SectionCard>
  <h2 className="text-xl font-semibold mb-6">
    Process Flow with Inventory
  </h2>
  <ProcessFlowVisualization
    processSequence={productProcessSequence}
    inventoryItems={inventoryItems}
  />
</SectionCard>

      
      <ProductProcessModal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        productName={order?.product_name || "Product"}
        onSave={(sequence) => {
          // Link process outputs to next process inputs
          const updatedSequence = sequence.map((step, index) => {
            if (index > 0) {
              const prevStep = sequence[index - 1];
              const prevConfig = PROCESS_TYPES[prevStep.processType as keyof typeof PROCESS_TYPES];
              let inputValue = 0;
              
              if (prevStep.processType === "packing") {
                inputValue = prevStep.fields.totalBoxes || 0;
              } else {
                inputValue = prevStep.fields.output || 0;
              }
              
              return {
                ...step,
                fields: {
                  ...step.fields,
                  inputQty: inputValue,
                },
              };
            }
            return step;
          });
          setProductProcessSequence(updatedSequence);
          
          // Deduct inventory items that are used
          sequence.forEach((step) => {
            if (step.inventoryItemId && step.inventoryQuantity) {
              setInventoryItems((prevItems) =>
                prevItems.map((item) =>
                  item.id === step.inventoryItemId
                    ? {
                        ...item,
                        quantity: Math.max(0, item.quantity - step.inventoryQuantity),
                        status: item.quantity - step.inventoryQuantity <= 0 ? "Used" : "In Process",
                      }
                    : item
                )
              );
            }
          });
        }}
        initialSequence={productProcessSequence}
        availableProcesses={processNames}
        availableParties={partyNames}
        availableInventory={inventoryItems}
        onAddProcess={(newProcess) => {
          if (!processNames.includes(newProcess)) {
            setProcessNames([...processNames, newProcess]);
          }
        }}
      />

      
    </>
  );
}

export default Process;