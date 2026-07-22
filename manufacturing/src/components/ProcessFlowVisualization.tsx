import { ArrowRight, Package } from "lucide-react";

interface ProcessStep {
  id: string;
  processName: string;
  partyName: string;
  inventoryItemId?: number;
  inventoryQuantity?: number;
}

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

interface ProcessFlowVisualizationProps {
  processSequence: ProcessStep[];
  inventoryItems: InventoryItem[];
}

function ProcessFlowVisualization({
  processSequence,
  inventoryItems,
}: ProcessFlowVisualizationProps) {
  if (processSequence.length === 0) {
    return (
      <div className="text-center text-slate-500 py-8">
        No process steps configured
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {processSequence.map((step, index) => {
        const inventoryItem = step.inventoryItemId
          ? inventoryItems.find((item) => item.id === step.inventoryItemId)
          : null;

        return (
          <div key={step.id} className="flex items-center gap-4">
            <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{step.processName}</h4>
                    <p className="text-sm text-slate-500">{step.partyName}</p>
                  </div>
                </div>
              </div>

              {inventoryItem && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Package size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Inventory Source
                    </span>
                  </div>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div>Order: {inventoryItem.orderName}</div>
                    <div>Party: {inventoryItem.partyName}</div>
                    <div>
                      Quantity: {step.inventoryQuantity} {inventoryItem.unit} /{" "}
                      {inventoryItem.quantity} {inventoryItem.unit} available
                    </div>
                  </div>
                </div>
              )}

              {!inventoryItem && (
                <div className="mt-3 p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500">No inventory assigned</p>
                </div>
              )}
            </div>

            {index < processSequence.length - 1 && (
              <ArrowRight size={24} className="text-slate-400 flex-shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProcessFlowVisualization;
