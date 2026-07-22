import { useState } from "react";
import { PROCESS_TYPES } from "@/config/processTypes";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus, X, Package } from "lucide-react";

interface InventoryItem {
  id: number;
  partyName: string;
  orderName: string;
  orderDate: string;
  processName: string;
  quantity: number;
  unit: string;
  status: string;
}

interface ProcessStep {
  id: string;
  processName: string;
  processType: string;
  partyName: string;
  fields: Record<string, any>;
  inventoryItemId?: number;
  inventoryQuantity?: number;
}

interface ProductProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  onSave: (processSequence: ProcessStep[]) => void;
  initialSequence?: ProcessStep[];
  availableProcesses: string[];
  availableParties: string[];
  availableInventory: InventoryItem[];
  onAddProcess?: (processName: string) => void;
}

function SortableProcessStep({
  step,
  onPartyChange,
  onRemove,
  availableParties,
  onProcessNameChange,
  availableInventory,
  onInventoryChange,
}: {
  step: ProcessStep;
  onPartyChange: (partyName: string) => void;
  onRemove: () => void;
  availableParties: string[];
  onProcessNameChange: (processName: string) => void;
  availableInventory: InventoryItem[];
  onInventoryChange: (itemId: number, quantity: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-slate-50 p-4 rounded-xl border border-slate-200"
    >
      <div className="flex items-center gap-3 mb-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-slate-400 hover:text-slate-600"
        >
          <GripVertical size={20} />
        </button>

        <div className="flex-1">
          <input
            type="text"
            value={step.processName}
            onChange={(e) => onProcessNameChange(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* <div className="w-48">
          <select
            value={step.partyName}
            onChange={(e) => onPartyChange(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Party</option>
            {availableParties.map((party) => (
              <option key={party} value={party}>
                {party}
              </option>
            ))}
          </select>
        </div> */}

        <button
          onClick={onRemove}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
          title="Remove process"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3 pl-8">
        <Package size={16} className="text-blue-600" />
        <div className="flex-1">
          <select
            value={step.inventoryItemId || ""}
            onChange={(e) => {
              const itemId = e.target.value ? Number(e.target.value) : undefined;
              const selectedItem = availableInventory.find(item => item.id === itemId);
              onInventoryChange(itemId, selectedItem?.quantity || 0);
            }}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Select from Inventory (Optional)</option>
            {availableInventory.map((item) => (
              <option key={item.id} value={item.id}>
                {item.partyName} - {item.orderName} - {item.quantity} {item.unit}
              </option>
            ))}
          </select>
        </div>
        {step.inventoryItemId && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={step.inventoryQuantity || 0}
              onChange={(e) => onInventoryChange(step.inventoryItemId!, Number(e.target.value))}
              className="w-24 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Qty"
            />
            <span className="text-sm text-slate-500">
              {availableInventory.find(i => i.id === step.inventoryItemId)?.unit || ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductProcessModal({
  isOpen,
  onClose,
  productName,
  onSave,
  initialSequence = [],
  availableProcesses,
  availableParties,
  availableInventory,
  onAddProcess,
}: ProductProcessModalProps) {
  const [processSequence, setProcessSequence] = useState<ProcessStep[]>(initialSequence);
  const [showAddProcess, setShowAddProcess] = useState(false);
  const [newProcessName, setNewProcessName] = useState("");
  const [newProcessType, setNewProcessType] = useState("basic");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  // All available field options
  const ALL_FIELDS = [
    { key: "partyName", label: "Party Name", type: "select" },
    { key: "size", label: "Size", type: "text" },
    { key: "inputQty", label: "Input Qty", type: "number" },
    { key: "rejection", label: "Rejection", type: "number" },
    { key: "extra", label: "Extra (To Inventory)", type: "number" },
    { key: "output", label: "Output To Next Process", type: "number", calculated: true },
    { key: "cutting", label: "Cutting (Auto)", type: "number", calculated: true },
    { key: "hole", label: "Hole (Per Pc)", type: "number" },
    { key: "rate", label: "Rate", type: "number" },
    { key: "totalCost", label: "Total Cost", type: "number", calculated: true },
    { key: "finishing", label: "Finishing", type: "text" },
    { key: "piecesPerBox", label: "Pieces Per Box", type: "number" },
    { key: "totalBoxes", label: "Total Boxes", type: "number", calculated: true },
    { key: "unit", label: "Unit", type: "radio", options: ["KG", "Pieces"] },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = processSequence.findIndex((p) => p.id === active.id);
      const newIndex = processSequence.findIndex((p) => p.id === over.id);

      setProcessSequence(arrayMove(processSequence, oldIndex, newIndex));
    }
  };

  const handleAddProcess = () => {
    if (newProcessName.trim() && selectedFields.length > 0) {
      const initialFields: Record<string, any> = {};
      
      selectedFields.forEach(fieldKey => {
        const field = ALL_FIELDS.find(f => f.key === fieldKey);
        if (field) {
          if (field.type === "number") {
            initialFields[field.key] = 0;
          } else if (field.type === "text") {
            initialFields[field.key] = "";
          } else if (field.type === "radio") {
            initialFields[field.key] = field.options?.[0] || "";
          }
        }
      });
      
      const newStep: ProcessStep = {
        id: `process-${Date.now()}`,
        processName: newProcessName.trim(),
        processType: "custom",
        partyName: "",
        fields: initialFields,
      };

      setProcessSequence([...processSequence, newStep]);
      
      if (onAddProcess && !availableProcesses.includes(newProcessName.trim())) {
        onAddProcess(newProcessName.trim());
      }

      setNewProcessName("");
      setSelectedFields([]);
      setShowAddProcess(false);
    }
  };

  const handleRemoveProcess = (id: string) => {
    setProcessSequence(processSequence.filter((p) => p.id !== id));
  };

  const handlePartyChange = (id: string, partyName: string) => {
    setProcessSequence(
      processSequence.map((p) => (p.id === id ? { ...p, partyName } : p))
    );
  };

  const handleProcessNameChange = (id: string, processName: string) => {
    setProcessSequence(
      processSequence.map((p) => (p.id === id ? { ...p, processName } : p))
    );
  };

  const handleInventoryChange = (id: string, itemId: number | undefined, quantity: number) => {
    setProcessSequence(
      processSequence.map((p) => (p.id === id ? { ...p, inventoryItemId: itemId, inventoryQuantity: quantity } : p))
    );
  };

  const handleSave = () => {
    onSave(processSequence);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Configure Process Sequence
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-slate-600">
            Product: <span className="font-semibold">{productName}</span>
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Process Steps
          </h3>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={processSequence}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {processSequence.map((step) => (
                  <SortableProcessStep
                    key={step.id}
                    step={step}
                    onPartyChange={(partyName) => handlePartyChange(step.id, partyName)}
                    onRemove={() => handleRemoveProcess(step.id)}
                    availableParties={availableParties}
                    onProcessNameChange={(processName) => handleProcessNameChange(step.id, processName)}
                    availableInventory={availableInventory}
                    onInventoryChange={(itemId, quantity) => handleInventoryChange(step.id, itemId, quantity)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {showAddProcess && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="text"
                placeholder="Enter process name"
                value={newProcessName}
                onChange={(e) => setNewProcessName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 mb-3"
              />
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">Select Fields:</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {ALL_FIELDS.map((field) => (
                    <label key={field.key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(field.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFields([...selectedFields, field.key]);
                          } else {
                            setSelectedFields(selectedFields.filter(f => f !== field.key));
                          }
                        }}
                      />
                      {field.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddProcess}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700"
                >
                  Add Process
                </button>
                <button
                  onClick={() => {
                    setShowAddProcess(false);
                    setSelectedFields([]);
                    setNewProcessName("");
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!showAddProcess && (
            <button
              onClick={() => setShowAddProcess(true)}
              className="mt-4 flex items-center gap-2 text-blue-600 text-sm hover:underline"
            >
              <Plus size={16} />
              Add Process Step
            </button>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Save Sequence
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductProcessModal;
