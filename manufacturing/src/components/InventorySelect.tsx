import { useState } from "react";

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

type InventorySelectProps = {
  label: string;
  options: InventoryItem[];
  value?: string;
  onChange?: (item: InventoryItem) => void;
  placeholder?: string;
};

function InventorySelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select from inventory",
}: InventorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [filteredOptions, setFilteredOptions] = useState(options);

  const formatItem = (item: InventoryItem) => {
    return `${item.partyName} - ${item.orderName} - ${item.quantity} ${item.unit}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Filter options based on input
    const filtered = options.filter((item) =>
      formatItem(item).toLowerCase().includes(newValue.toLowerCase())
    );
    setFilteredOptions(filtered);
    setIsOpen(true);
  };

  const handleSelectOption = (item: InventoryItem) => {
    setInputValue(formatItem(item));
    setIsOpen(false);
    if (onChange) {
      onChange(item);
    }
  };

  const handleFocus = () => {
    setFilteredOptions(options);
    setIsOpen(true);
  };

  return (
    <div className="relative">
      <label className="block mb-2 font-medium">
        {label}
      </label>

      {/* <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div> */}

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectOption(item)}
              className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
            >
              <div className="font-medium text-slate-700">{formatItem(item)}</div>
              <div className="text-xs text-slate-500 mt-1">
                {item.orderDate} • {item.processName} • {item.status}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && inputValue && filteredOptions.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-slate-500">
          No matching inventory items found
        </div>
      )}
    </div>
  );
}

export default InventorySelect;
