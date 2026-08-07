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
  Package,
  Trash2,
  Archive,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/contexts/ToastContext";


function Process() {
  const { showToast } = useToast();

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

  const [parties, setParties] = useState<any[]>([]);

  // Fetch parties from API
  const fetchParties = async () => {
    try {
      const response = await api.get("/parties");
      if (response.data && response.data.success) {
        setParties(response.data.data);
        const names = response.data.data.map((item: any) => item.party_name || "");
        setPartyNames(names);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching parties:", error);
    }
    return [];
  };

  useEffect(() => {
    const initData = async () => {
      const partiesData = await fetchParties();
      if (order?.order_id_custom) {
        await fetchProcessSequences(order.order_id_custom, partiesData);
      }
    };
    initData();
  }, [order]);

  // Fetch existing process sequences from API and update default processes
  const fetchProcessSequences = async (orderId: string, currentParties: any[]) => {
    try {
      const response = await api.get(`/process-sequences/order/${orderId}`);
      if (response.data?.success && response.data.data.length > 0) {
        const savedSequences = response.data.data;

        // Reconstruct the sequence array based on what's in the database
        const newSequence = savedSequences.map((saved: any) => {
          // Find the party name from the party_id
          const matchedParty = currentParties.find(p => p.id === saved.party_id);

          // Only include fields that make sense for this process type
          const fields: any = {};

          // Map database columns back to frontend field keys
          const dbToFieldMap: Record<string, any> = {
            inputQty: Number(saved.input_qty) || 0,
            output: Number(saved.output_qty) || 0,
            rejection: Number(saved.rejection) || 0,
            extra: Number(saved.extra) || 0,
            size: saved.size || "",
            size_unit: saved.size_unit || "Pieces",
            kg: Number(saved.kg) || 0,
            pieces: Number(saved.pieces) || 0,
            rate: Number(saved.rate) || 0,
            totalCost: Number(saved.total_cost) || 0,
            totalBoxes: Number(saved.total_boxes) || 0,
            cutting: Number(saved.cutting) || 0,
            hole: Number(saved.hole) || 0,
            finishing: saved.finishing || "",
            piecesPerBox: Number(saved.pieces_per_box) || 0,
          };

          const processConfig = PROCESS_TYPES[saved.process_type as keyof typeof PROCESS_TYPES];

          if (processConfig) {
            // It's a standard process, so only pick its specific fields
            processConfig.fields.forEach(f => {
              if (f.key !== "partyName") {
                fields[f.key] = dbToFieldMap[f.key];
              }
            });
          } else if (saved.process_type && saved.process_type.startsWith("custom:")) {
            // It's a custom process, and we saved the exact fields inside the process_type string!
            const selectedKeys = saved.process_type.split(":")[1].split(",");
            selectedKeys.forEach((key: string) => {
              if (dbToFieldMap[key] !== undefined) {
                fields[key] = dbToFieldMap[key];
              }
            });
          } else {
            // Fallback for old custom processes
            const basicKeys = ["inputQty", "output", "rejection", "extra"];
            Object.keys(dbToFieldMap).forEach(key => {
              if (basicKeys.includes(key) || (typeof dbToFieldMap[key] === "number" && dbToFieldMap[key] > 0) || (typeof dbToFieldMap[key] === "string" && dbToFieldMap[key] !== "" && dbToFieldMap[key] !== "Pieces")) {
                fields[key] = dbToFieldMap[key];
              }
            });
          }

          return {
            id: `process-${saved.id}`,
            processName: saved.process_name || "",
            processType: saved.process_type || "basic",
            partyName: matchedParty ? matchedParty.party_name : "",
            fields: fields,
            activeFields: saved.process_type && saved.process_type.startsWith("custom:")
              ? saved.process_type.split(":")[1].split(",")
              : undefined
          };
        });

        setProductProcessSequence(newSequence);
      }
    } catch (error) {
      console.error("Error fetching process sequences:", error);
    }
  };

  // Save process sequences to API
  const saveProcessSequences = async (sequenceToSave = productProcessSequence) => {
    try {
      // First delete existing sequences for this order
      if (order?.order_id_custom) {
        await api.delete(`/process-sequences/order/${order.order_id_custom}`);
      }

      // Then save new sequences
      for (let i = 0; i < sequenceToSave.length; i++) {
        const step = sequenceToSave[i];
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
          size_unit: step.fields.size_unit || "Pieces",
          kg: step.fields.kg || 0,
          pieces: step.fields.pieces || 0,
          rate: step.fields.rate || 0,
          total_cost: step.fields.totalCost || 0,
          total_boxes: step.fields.totalBoxes || 0,
          cutting: step.fields.cutting || 0,
          status: "completed"
        };
        await api.post("/process-sequences", payload);
      }

      showToast("Process sequences saved successfully!");
    } catch (error) {
      console.error("Error saving process sequences:", error);
      showToast("Error saving process sequences", "error");
    }
  };

  const [productProcessSequence, setProductProcessSequence] = useState<any[]>([
    { id: "process-1", processName: "Raw Material", processType: "basic", partyName: "", fields: { inputQty: 0, rejection: 0, extra: 0, output: 0, kg: 0, pieces: 0, size_unit: "Pieces" } },
    { id: "process-2", processName: "Cutting", processType: "withSize", partyName: "", fields: { size: "", size_unit: "Pieces", kg: 0, pieces: 0, inputQty: 0, rejection: 0, extra: 0, output: 0 } },
    { id: "process-3", processName: "Drilling", processType: "cutting", partyName: "", fields: { size: "", size_unit: "Pieces", kg: 0, pieces: 0, inputQty: 0, cutting: 0, hole: 0, rate: 0, rejection: 0, extra: 0, output: 0 } },
    { id: "process-4", processName: "Polish", processType: "finishing", partyName: "", fields: { size: "", size_unit: "Pieces", kg: 0, pieces: 0, inputQty: 0, finishing: "", rate: 0, totalCost: 0, rejection: 0, extra: 0, output: 0 } },
    { id: "process-5", processName: "Packing", processType: "packing", partyName: "", fields: { size: "", size_unit: "Pieces", kg: 0, pieces: 0, inputQty: 0, piecesPerBox: 0, totalBoxes: 0 } },
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

        if (fieldKey === "processName") {
          return { ...step, processName: value };
        }

        const updatedFields = { ...step.fields, [fieldKey]: value };

        // Find which fields are actively selected for this specific step
        const activeKeys = step.activeFields ||
          PROCESS_TYPES[step.processType as keyof typeof PROCESS_TYPES]?.fields?.map((f: any) => f.key) ||
          Object.keys(updatedFields);

        // ONLY calculate formulas for fields that the user explicitly added to this step

        if (activeKeys.includes('cutting') && activeKeys.includes('size') && updatedFields.size > 0) {
          updatedFields.cutting = (updatedFields.inputQty || 0) / updatedFields.size;
        }

        if (activeKeys.includes('totalCost') && activeKeys.includes('rate')) {
          updatedFields.totalCost = (updatedFields.inputQty || 0) * (updatedFields.rate || 0);
        }

        if (activeKeys.includes('totalBoxes') && activeKeys.includes('piecesPerBox') && updatedFields.piecesPerBox > 0) {
          updatedFields.totalBoxes = (updatedFields.inputQty || 0) / updatedFields.piecesPerBox;
        }

        if (activeKeys.includes('output')) {
          // If they removed rejection or extra fields, treat them as 0
          const rej = activeKeys.includes('rejection') ? (updatedFields.rejection || 0) : 0;
          const ext = activeKeys.includes('extra') ? (updatedFields.extra || 0) : 0;
          updatedFields.output = (updatedFields.inputQty || 0) - rej - ext;
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

  // Handle adding a new party
  const handleAddParty = async (partyName: string) => {
    try {
      const response = await api.post("/parties", { party_name: partyName });
      if (response.data && response.data.success) {
        setParties((prev) => [...prev, response.data.data]);
        setPartyNames((prev) => [...prev, partyName]);
        showToast("Party added successfully!");
      }
    } catch (error) {
      console.error("Error adding party:", error);
      showToast("Error adding party", "error");
    }
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
      totalExtra += Number(step.fields.extra) || 0;
      totalRejection += Number(step.fields.rejection) || 0;
      if (step.processType === "packing") {
        finalOutput = Number(step.fields.totalBoxes) || 0;
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

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => saveProcessSequences()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium shadow hover:bg-blue-700 transition-colors"
            >
              Save Process Details
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
              onAddParty={handleAddParty}
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
                onClick={async () => {
                  const newItem = {
                    party_name: order?.client_name || "Unknown",
                    order_name: order?.order_id_custom || "Unknown",
                    order_date: new Date().toISOString().split('T')[0],
                    process_name: "Process Surplus",
                    quantity: totalExtra,
                    unit: "Pieces",
                    status: "Available"
                  };
                  try {
                    await api.post("/process-inventory", newItem);
                    showToast(`${totalExtra} items sent to inventory`);
                  } catch (error) {
                    console.error("Error sending to inventory:", error);
                    showToast("Failed to send to inventory", "error");
                  }
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
                    className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === "Available"
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

          // Save to backend immediately
          saveProcessSequences(updatedSequence);

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