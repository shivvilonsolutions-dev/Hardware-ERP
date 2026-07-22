import { PROCESS_TYPES } from "@/config/processTypes";
import FormSelect from "@/components/FormSelect";
import InventorySelect from "@/components/InventorySelect";

// All available field options (same as in ProductProcessModal)
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

interface DynamicProcessStepProps {
  step: any;
  index: number;
  totalSteps: number;
  partyNames: string[];
  inventoryItems: any[];
  onFieldChange: (stepId: string, fieldKey: string, value: any) => void;
  onPartyChange: (stepId: string, partyName: string) => void;
  onInventorySelect: (stepId: string, item: any) => void;
}

function DynamicProcessStep({
  step,
  index,
  totalSteps,
  partyNames,
  inventoryItems,
  onFieldChange,
  onPartyChange,
  onInventorySelect,
}: DynamicProcessStepProps) {
  const processConfig = PROCESS_TYPES[step.processType as keyof typeof PROCESS_TYPES];
  
  // For custom processes, use the fields directly from step.fields
  const fields = step.processType === "custom" 
    ? Object.keys(step.fields).map(key => {
        const field = ALL_FIELDS.find(f => f.key === key);
        return field || { key, label: key, type: "text" };
      })
    : processConfig?.fields || [];

  const colors = ["green", "blue", "violet", "pink", "indigo", "orange", "teal"];
  const color = colors[index % colors.length];

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    green: { bg: "bg-green-500", text: "text-green-600", border: "border-green-300" },
    blue: { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-300" },
    violet: { bg: "bg-violet-500", text: "text-violet-600", border: "border-violet-300" },
    pink: { bg: "bg-pink-500", text: "text-pink-600", border: "border-pink-300" },
    indigo: { bg: "bg-indigo-500", text: "text-indigo-600", border: "border-indigo-300" },
    orange: { bg: "bg-orange-500", text: "text-orange-600", border: "border-orange-300" },
    teal: { bg: "bg-teal-500", text: "text-teal-600", border: "border-teal-300" },
  };

  const colorClasses = colorMap[color] || colorMap.blue;

  const renderField = (field: any) => {
    const value = step.fields[field.key] !== undefined && step.fields[field.key] !== null && step.fields[field.key] !== "" 
      ? step.fields[field.key] 
      : (field.type === "number" ? 0 : "");
    const isCalculated = field.calculated;
    const isEditable = field.editable;

    if (field.key === "partyName") {
      return (
        <div>
          <label className="block text-sm font-medium mb-2">
            {field.label}
          </label>
          <FormSelect
            label=""
            options={partyNames}
            value={step.partyName || ""}
            onChange={(value) => onPartyChange(step.id, value)}
            placeholder="Select Party"
          />
        </div>
      );
    }

    if (field.key === "inputQty" && !isEditable) {
      return (
        <div>
          <label className="block text-sm font-medium mb-2">
            {field.label}
          </label>
          <input
            type="number"
            value={value}
            readOnly
            className="w-full border border-blue-300 rounded-xl px-4 py-3 bg-blue-50"
          />
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div>
          <label className="block text-sm font-medium mb-2">
            {field.label}
          </label>
          <select
            value={value}
            onChange={(e) => onFieldChange(step.id, field.key, e.target.value)}
            disabled={isCalculated}
            className="w-full border rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {field.options?.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === "radio") {
      return (
        <div>
          <label className="block text-sm font-medium mb-2">
            {field.label}
          </label>
          <div className="flex gap-4 mt-3">
            {field.options?.map((opt: string) => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`${step.id}-${field.key}`}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => onFieldChange(step.id, field.key, e.target.value)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (field.type === "text") {
      return (
        <div>
          <label className="block text-sm font-medium mb-2">
            {field.label}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onFieldChange(step.id, field.key, e.target.value)}
            readOnly={isCalculated}
            className={`w-full border rounded-xl px-4 py-3 ${
              isCalculated ? "bg-slate-50" : "bg-white"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      );
    }

    if (field.type === "number") {
      const bgColor = isCalculated 
        ? (field.key === "output" || field.key === "totalBoxes" ? "bg-green-50 border-green-300" : "bg-slate-50")
        : (field.key === "rejection" ? "bg-red-50 border-red-300" : field.key === "extra" ? "bg-orange-50 border-orange-300" : "bg-white");
      
      const borderColor = isCalculated
        ? (field.key === "output" || field.key === "totalBoxes" ? "border-green-300" : "border-slate-200")
        : (field.key === "rejection" ? "border-red-300" : field.key === "extra" ? "border-orange-300" : "border-slate-200");

      return (
        <div>
          <label className={`block text-sm font-medium mb-2 ${field.key === "output" || field.key === "totalBoxes" ? "text-green-600" : ""}`}>
            {field.label}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => onFieldChange(step.id, field.key, Number(e.target.value))}
            readOnly={isCalculated}
            className={`w-full border ${borderColor} rounded-xl px-4 py-3 ${bgColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex gap-6">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div
          className={`w-12 h-12 rounded-full ${colorClasses.bg} text-white flex items-center justify-center font-bold text-xl`}
        >
          {index + 1}
        </div>
        {index < totalSteps - 1 && <div className="w-[2px] h-32 bg-slate-300 mt-2"></div>}
      </div>

      {/* Process Content */}
      <div className="flex-1">
        <span
          className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${colorClasses.bg} text-white mb-4`}
        >
          PROCESS {index + 1}
        </span>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Process Name
          </label>
          <input
            type="text"
            value={step.processName}
            onChange={(e) => onFieldChange(step.id, "processName", e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className={`grid gap-4 items-end`} style={{ gridTemplateColumns: `repeat(${fields.length}, minmax(0, 1fr))` }}>
          {fields.map((field) => (
            <div key={field.key}>
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DynamicProcessStep;
