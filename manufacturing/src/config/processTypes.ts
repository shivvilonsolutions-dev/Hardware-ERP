// Process type configurations with their fields and calculations
const PROCESS_TYPES = {
  basic: {
    name: "Basic Process",
    fields: [
      { key: "partyName", label: "Party Name", type: "select" },
      { key: "unit", label: "Unit", type: "radio", options: ["KG", "Pieces"] },
      { key: "inputQty", label: "Input Qty", type: "number", editable: true },
      { key: "rejection", label: "Rejection", type: "number", editable: true },
      { key: "extra", label: "Extra (To Inventory)", type: "number", editable: true },
      { key: "output", label: "Output To Next Process", type: "number", calculated: true },
    ],
    calculation: (fields: any) => fields.inputQty - fields.rejection - fields.extra,
  },
  withSize: {
    name: "Process with Size",
    fields: [
      { key: "partyName", label: "Party Name", type: "select" },
      { key: "size", label: "Size", type: "text", editable: true },
      { key: "inputQty", label: "Pieces (Input)", type: "number", editable: true },
      { key: "rejection", label: "Rejection", type: "number", editable: true },
      { key: "extra", label: "Extra", type: "number", editable: true },
      { key: "output", label: "Output To Next Process", type: "number", calculated: true },
    ],
    calculation: (fields: any) => fields.inputQty - fields.rejection - fields.extra,
  },
  cutting: {
    name: "Cutting Process",
    fields: [
      { key: "partyName", label: "Party Name", type: "select" },
      { key: "size", label: "Size", type: "text", editable: true },
      { key: "inputQty", label: "Pieces (Input)", type: "number", editable: true },
      { key: "cutting", label: "Cutting (Auto)", type: "number", calculated: true },
      { key: "hole", label: "Hole (Per Pc)", type: "number", editable: true },
      { key: "rate", label: "Rate (Per Cutting)", type: "number", editable: true },
      { key: "rejection", label: "Rejection", type: "number", editable: true },
      { key: "extra", label: "Extra (Inventory)", type: "number", editable: true },
      { key: "output", label: "Output To Next Process", type: "number", calculated: true },
    ],
    calculation: (fields: any) => {
      const cutting = fields.size > 0 ? fields.inputQty / fields.size : 0;
      return fields.inputQty - fields.rejection - fields.extra;
    },
  },
  finishing: {
    name: "Finishing Process",
    fields: [
      { key: "partyName", label: "Party Name", type: "select" },
      { key: "size", label: "Size", type: "text", editable: true },
      { key: "inputQty", label: "Pieces (Input)", type: "number", editable: true },
      { key: "finishing", label: "Finishing", type: "text", editable: true },
      { key: "rate", label: "Rate / Pc", type: "number", editable: true },
      { key: "totalCost", label: "Total Cost", type: "number", calculated: true },
      { key: "rejection", label: "Rejection", type: "number", editable: true },
      { key: "extra", label: "Extra (Inventory)", type: "number", editable: true },
      { key: "output", label: "Output To Next Process", type: "number", calculated: true },
    ],
    calculation: (fields: any) => {
      const totalCost = fields.inputQty * fields.rate;
      return fields.inputQty - fields.rejection - fields.extra;
    },
  },
  packing: {
    name: "Packing Process",
    fields: [
      { key: "partyName", label: "Party Name", type: "select" },
      { key: "size", label: "Size", type: "text", editable: true },
      { key: "inputQty", label: "Input Qty", type: "number", editable: true },
      { key: "piecesPerBox", label: "Pieces Per Box", type: "number", editable: true },
      { key: "totalBoxes", label: "Total Boxes", type: "number", calculated: true },
    ],
    calculation: (fields: any) => {
      return fields.piecesPerBox > 0 ? fields.inputQty / fields.piecesPerBox : 0;
    },
  },
};

export { PROCESS_TYPES };
