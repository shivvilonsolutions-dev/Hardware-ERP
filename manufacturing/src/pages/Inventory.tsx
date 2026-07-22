import PageHeader from "@/components/PageHeader";
import StatsCard from "@/components/StatsCard";
import SectionCard from "@/components/SectionCard";
import SearchBar from "@/components/SearchBar";
import PrimaryButton from "@/components/PrimaryButton";
import StatusBadge from "@/components/StatusBadge";
import { useState, useEffect } from "react";
import api from "@/api/api";

import {
  Package,
  Boxes,
  AlertCircle,
  PackageX,
  Pencil,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";


const initialMaterials = [
  {
    name: "Mango",
    unit: "KG",
    availableStock: 70,
    reservedStock: 20,
  },
  {
    name: "Salt",
    unit: "KG",
    availableStock: 50,
    reservedStock: 10,
  },
  {
    name: "Garlic",
    unit: "KG",
    availableStock: 15,
    reservedStock: 5,
  },
  {
    name: "Fenugreek",
    unit: "KG",
    availableStock: 0,
    reservedStock: 0,
  },
];


function Inventory() {


  const [editIndex, setEditIndex] =
  useState<number | null>(null);

  const [showForm, setShowForm] =
  useState(false);

  const [searchTerm, setSearchTerm] =
  useState("");

  const [materialForm, setMaterialForm] = useState({
  id: null,
  name: "",
  unit: "",
  availableStock: "",
});

const itemsPerPage = 5;

const [currentPage, setCurrentPage] =
  useState(1);

const [materials, setMaterials] = useState([]);

const [processInventory, setProcessInventory] = useState([
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
]);

const [inventoryHistory, setInventoryHistory] = useState([
  {
    id: 1,
    itemId: 1,
    action: "Added",
    quantity: 15,
    orderName: "ORD-001",
    partyName: "Party A",
    processName: "Cutting",
    timestamp: "2024-05-15 10:30",
    reason: "Process surplus"
  },
  {
    id: 2,
    itemId: 2,
    action: "Used",
    quantity: 5,
    orderName: "ORD-002",
    partyName: "Party B",
    processName: "Polishing",
    timestamp: "2024-05-16 14:20",
    reason: "Process allocation"
  },
]);

  useEffect(() => {
  fetchMaterials();
}, []);

const fetchMaterials = async () => {
  try {
    const res = await api.get("/materials");
  console.log(res.data.data);
    console.log("Materials API:", res.data.data);
    console.log("First Material:", res.data.data[0]);

    setMaterials(
  res.data.data.map((item) => ({
    id: item.id,
    name: item.material_name,
    unit: item.unit,
    availableStock: item.stock_quantity,
    reservedStock:
      item.reserved_stock ?? 0,
  }))
);
  } catch (error) {
    console.error(error);
  }
};

   const totalMaterials = materials.length;

   const filteredMaterials =
  materials.filter((item) =>
    item.name
      .toLowerCase()
      .includes(
        searchTerm.toLowerCase()
      )
  );

  const totalPages = Math.ceil(
  filteredMaterials.length /
    itemsPerPage
);

const startIndex =
  (currentPage - 1) *
  itemsPerPage;

const currentMaterials =
  filteredMaterials.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const totalStock = materials.reduce(
    (total, item) =>
      total +
      item.availableStock +
      item.reservedStock,
    0
  );

  const lowStockItems = materials.filter(
    (item) =>
      item.availableStock < 30 &&
      item.availableStock > 0
  ).length;

  const outOfStockItems = materials.filter(
    (item) =>
      item.availableStock === 0
  ).length;


  return <>

  <PageHeader
  title="Inventory"
  subtitle="Manage raw materials and stock"
  icon={Package}
/>

<div className="mt-8">


<div className="grid grid-cols-4 gap-4">

  <StatsCard
    title="Total Materials"
    value={totalMaterials}
    subtitle="All Materials"
    icon={Boxes}
    bgColor="bg-blue-100"
    iconColor="text-blue-600"
  />

 <StatsCard
  title="Total Stock"
  value={totalStock}
  subtitle="All Units"
    icon={Boxes}
    bgColor="bg-green-100"
    iconColor="text-green-600"
  />

  <StatsCard
    title="Low Stock Items"
    value={lowStockItems}
    subtitle="Need Attention"
    icon={AlertCircle}
    bgColor="bg-orange-100"
    iconColor="text-orange-500"
  />

  <StatsCard
    title="Out of Stock Items"
    value={outOfStockItems}
    subtitle="Out of Stock"
    icon={PackageX}
    bgColor="bg-red-100"
    iconColor="text-red-500"
  />

</div>

<SectionCard>

  <div className="flex justify-between items-center mb-6">

    <h2 className="text-xl font-semibold">
      Inventory List
    </h2>

    <div className="flex gap-2">

    <SearchBar
  value={searchTerm}
  onChange={(e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }}
/>

      <div onClick={() => setShowForm(true)}>
  <PrimaryButton text="Add Material" />
</div>

    </div>

  </div>

  {showForm && (

  <div className="bg-slate-50 rounded-2xl p-6 mb-6">

    <h3 className="text-lg font-semibold mb-4">
      Add New Material
    </h3>

    <div className="grid grid-cols-3 gap-6">

      <div>
        <label className="block mb-2 font-medium">
          Material Name
        </label>

        <input
  type="text"
  placeholder="Enter Material Name"
  value={materialForm.name}
  onChange={(e) =>
    setMaterialForm({
      ...materialForm,
      name: e.target.value,
    })
  }
  className="w-full border border-slate-200 rounded-xl px-4 py-3"
/>
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Unit
        </label>

<select
  value={materialForm.unit}
  onChange={(e) =>
    setMaterialForm({
      ...materialForm,
      unit: e.target.value,
    })
  }
  className="w-full border border-slate-200 rounded-xl px-4 py-3"
>
  <option value="">
    Select Unit
  </option>

  <option value="KG">
    KG
  </option>

  <option value="Piece">
    Piece
  </option>
</select>
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Available Stock
        </label>

        <input
  type="number"
  placeholder="Enter Stock"
  value={materialForm.availableStock}
  onChange={(e) =>
    setMaterialForm({
      ...materialForm,
      availableStock: e.target.value,
    })
  }
  className="w-full border border-slate-200 rounded-xl px-4 py-3"
/>
      </div>

    </div>

    <div className="flex justify-end gap-3 mt-6">

      <button
        onClick={() => setShowForm(false)}
        className="px-6 py-3 border rounded-xl"
      >
        Cancel
      </button>

    <button
  onClick={async () => {

    if (
      !materialForm.name ||
      !materialForm.unit ||
      !materialForm.availableStock
    ) {
      alert("Please fill all fields");
      return;
    }

    try {


      console.log("Material ID:", materialForm.id);

console.log("Request Body:", {
  stock_quantity: Number(
    materialForm.availableStock
  ),
  reserved_stock: 0,
  total_stock: Number(
    materialForm.availableStock
  ),
  status:
    Number(materialForm.availableStock) === 0
      ? "Out Of Stock"
      : Number(materialForm.availableStock) < 30
      ? "Low Stock"
      : "In Stock",
});

console.log("Current Material Form:", materialForm);
      if (editIndex !== null) {

 await api.put(
  `/materials/${materialForm.id}`,
  {
    stock_quantity: Number(
      materialForm.availableStock
    ),
    reserved_stock: 0,
    total_stock: Number(
      materialForm.availableStock
    ),
    status:
      Number(materialForm.availableStock) === 0
        ? "Out Of Stock"
        : Number(materialForm.availableStock) < 30
        ? "Low Stock"
        : "In Stock",
  }
);

  alert("Material Updated Successfully");

  await fetchMaterials();

  setEditIndex(null);

  setMaterialForm({
    id: null,
    name: "",
    unit: "",
    availableStock: "",
  });

  setShowForm(false);

  return;
}

      await api.post("/materials", {
        material_name: materialForm.name,
        stock_quantity: Number(
          materialForm.availableStock
        ),
        unit: materialForm.unit,
      });

      alert("Material Added Successfully");

      await fetchMaterials();

      setMaterialForm({
        name: "",
        unit: "",
        availableStock: "",
      });

      setShowForm(false);

    } catch (error) {
  console.error(error);

  if (error.response) {
    console.log("Backend Error:", error.response.data);
  }

  alert("Failed To Update Material");
}

  }}
  className="px-6 py-3 bg-blue-600 text-white rounded-xl"
>
  Save Material
</button>

    </div>

  </div>

)}

<div className="bg-slate-50 rounded-xl px-4 py-4">

  <div className="grid grid-cols-7 gap-4 text-sm font-semibold text-slate-600">

    <div>Material Name</div>
    <div>Unit</div>
    <div>Available Stock</div>
    <div>Reserved Stock</div>
    <div>Total Stock</div>
    <div>Status</div>
    <div>Action</div>

  </div>

  {currentMaterials.map((item, index) => (
  <div
    key={item.name}
    className="grid grid-cols-7 gap-4 py-4 px-3 border-b border-slate-100 items-center hover:bg-slate-50 transition"
  >

    <div>{item.name}</div>

    <div>{item.unit}</div>

    <div>
  {item.availableStock} {item.unit}
</div>

    <div>{item.reservedStock}</div>

    <div>
  {item.availableStock + item.reservedStock}
  {" "}
  {item.unit}
</div>

   <div>

  <StatusBadge
    text={
      item.availableStock === 0
        ? "Out Of Stock"
        : item.availableStock < 30
        ? "Low Stock"
        : "In Stock"
    }
    color={
      item.availableStock === 0
        ? "red"
        : item.availableStock < 30
        ? "orange"
         : "green"
    }
  />

</div>

   <div>

  <button
  onClick={() => {
 console.log("Edit Item:", item);
    setMaterialForm({
      id: item.id,
      name: item.name,
      unit: item.unit,
      availableStock:
        item.availableStock.toString(),
    });

    console.log("Setting Form ID:", item.id);

    setEditIndex(index);

    setShowForm(true);

  }}
  className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200"
>

    <Pencil size={16} />

  </button>

</div>

  </div>
))}

<div className="flex justify-between items-center mt-6">

  <p className="text-sm text-slate-500">
    Showing {currentMaterials.length}
    {" "}
    of
    {" "}
    {filteredMaterials.length}
    entries
  </p>

  <div className="flex gap-2">

    {Array.from(
      { length: totalPages },
      (_, i) => (
        <button
          key={i}
          onClick={() =>
            setCurrentPage(i + 1)
          }
          className={`w-9 h-9 rounded-lg border ${
            currentPage === i + 1
              ? "bg-blue-600 text-white"
              : "bg-white"
          }`}
        >
          {i + 1}
        </button>
      )
    )}

  </div>

</div>

</div>

</SectionCard>

<SectionCard>

  <h2 className="text-xl font-semibold mb-6">
    Process Extra Items
  </h2>

  <div className="bg-slate-50 rounded-xl px-4 py-4">

    <div className="grid grid-cols-7 gap-4 text-sm font-semibold text-slate-600">

      <div>Party Name</div>
      <div>Order Name</div>
      <div>Order Date</div>
      <div>Process Name</div>
      <div>Quantity</div>
      <div>Status</div>
      <div>Action</div>

    </div>

    {processInventory.map((item) => (
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

        <div>
          <StatusBadge
            text={item.status}
            color="green"
          />
        </div>

        <div>
          <button
            className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center hover:bg-blue-200 text-blue-600"
            title="Use in Process"
          >
            <ArrowDownLeft size={16} />
          </button>
        </div>

      </div>
    ))}

  </div>

</SectionCard>

<SectionCard>

  <h2 className="text-xl font-semibold mb-6">
    Inventory History / Audit Trail
  </h2>

  <div className="bg-slate-50 rounded-xl px-4 py-4">

    <div className="grid grid-cols-7 gap-4 text-sm font-semibold text-slate-600">

      <div>Timestamp</div>
      <div>Action</div>
      <div>Order Name</div>
      <div>Party Name</div>
      <div>Process</div>
      <div>Quantity</div>
      <div>Reason</div>

    </div>

    {inventoryHistory.length === 0 ? (
      <div className="py-8 text-center text-slate-500">
        No inventory history available
      </div>
    ) : (
      inventoryHistory.map((entry) => (
        <div
          key={entry.id}
          className="grid grid-cols-7 gap-4 py-4 px-3 border-b border-slate-100 items-center hover:bg-slate-50 transition"
        >

          <div className="text-sm text-slate-600">{entry.timestamp}</div>

          <div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                entry.action === "Added"
                  ? "bg-green-100 text-green-700"
                  : entry.action === "Used"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {entry.action}
            </span>
          </div>

          <div>{entry.orderName}</div>

          <div className="font-medium">{entry.partyName}</div>

          <div>{entry.processName}</div>

          <div className="font-semibold">{entry.quantity}</div>

          <div className="text-sm text-slate-500">{entry.reason}</div>

        </div>
      ))
    )}

  </div>

</SectionCard>



</div>
  
  </>;
  
}

export default Inventory;