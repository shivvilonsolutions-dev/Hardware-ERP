import { X, ArrowDownLeft } from "lucide-react";

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

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItems: InventoryItem[];
  onSelectItem: (item: InventoryItem) => void;
}

function InventoryModal({
  isOpen,
  onClose,
  inventoryItems,
  onSelectItem,
}: InventoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Select from Inventory
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl px-4 py-4">
          <div className="grid grid-cols-7 gap-4 text-sm font-semibold text-slate-600">
            <div>Party Name</div>
            <div>Order Name</div>
            <div>Date</div>
            <div>Process</div>
            <div>Quantity</div>
            <div>Status</div>
            <div>Action</div>
          </div>

          {inventoryItems.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No items available in inventory
            </div>
          ) : (
            inventoryItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-7 gap-4 py-4 px-3 border-b border-slate-100 items-center hover:bg-slate-50 transition"
              >
                <div className="font-medium">{item.partyName}</div>
                <div>{item.orderName}</div>
                <div>{item.orderDate}</div>
                <div>{item.processName}</div>
                <div>
                  {item.quantity} {item.unit}
                </div>
                <div className="text-green-600 font-medium">{item.status}</div>
                <div>
                  <button
                    onClick={() => {
                      onSelectItem(item);
                      onClose();
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 flex items-center gap-2"
                  >
                    <ArrowDownLeft size={16} />
                    Use
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default InventoryModal;
