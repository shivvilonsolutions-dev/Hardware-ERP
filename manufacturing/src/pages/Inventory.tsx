import PageHeader from "@/components/PageHeader";
import StatsCard from "@/components/StatsCard";
import SectionCard from "@/components/SectionCard";
import SearchBar from "@/components/SearchBar";
import PrimaryButton from "@/components/PrimaryButton";
import StatusBadge from "@/components/StatusBadge";
import { useState, useEffect } from "react";
import api from "@/api/api";
import { useToast } from "@/contexts/ToastContext";

import {
  Package,
  Boxes,
  AlertCircle,
  PackageX,
  Pencil,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
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
  const { showToast } = useToast();

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
    lowStockThreshold: "30",
    size: "",
    finish: ""
  });

  const [processInventoryForm, setProcessInventoryForm] = useState({
    id: null,
    partyName: "",
    orderName: "",
    orderDate: "",
    processName: "",
    quantity: "",
    unit: "",
    status: ""
  });

  const [showProcessInventoryForm, setShowProcessInventoryForm] = useState(false);
  const [editProcessInventoryIndex, setEditProcessInventoryIndex] = useState(null);

  const itemsPerPage = 5;

  const [currentPage, setCurrentPage] =
    useState(1);

  const [materials, setMaterials] = useState([]);

  const [boxes, setBoxes] = useState<any[]>([]);
  const [fittings, setFittings] = useState<any[]>([]);
  
  const [boxForm, setBoxForm] = useState({ id: null as null | number, boxSize: "", brandName: "", quantity: "" });
  const [fittingForm, setFittingForm] = useState({ id: null as null | number, fittingName: "", size: "", quantity: "" });
  
  const [showBoxForm, setShowBoxForm] = useState(false);
  const [showFittingForm, setShowFittingForm] = useState(false);

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
    fetchProcessInventory();
    fetchBoxes();
    fetchFittings();
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
          availableStock: item.stock_quantity || 0,
          reservedStock:
            item.reserved_stock ?? 0,
          lowStockThreshold: item.low_stock_threshold || 30,
          size: item.size || "",
          finish: item.finish || "",
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBoxes = async () => {
    try {
      const res = await api.get("/boxes");
      if (res.data && res.data.success) {
        setBoxes(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching boxes:", error);
    }
  };

  const fetchFittings = async () => {
    try {
      const res = await api.get("/fittings");
      if (res.data && res.data.success) {
        setFittings(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching fittings:", error);
    }
  };

  const handleSaveBox = async () => {
    if (!boxForm.boxSize || !boxForm.brandName || !boxForm.quantity) {
      showToast("Please fill all box fields", "warning");
      return;
    }
    try {
      if (boxForm.id !== null) {
        await api.put(`/boxes/${boxForm.id}`, {
          box_size: boxForm.boxSize,
          brand_name: boxForm.brandName,
          quantity: Number(boxForm.quantity)
        });
        showToast("Box updated successfully");
      } else {
        await api.post("/boxes", {
          box_size: boxForm.boxSize,
          brand_name: boxForm.brandName,
          quantity: Number(boxForm.quantity)
        });
        showToast("Box added successfully");
      }
      await fetchBoxes();
      setShowBoxForm(false);
      setBoxForm({ id: null, boxSize: "", brandName: "", quantity: "" });
    } catch (error) {
      console.error(error);
      showToast("Failed to save box", "error");
    }
  };

  const handleDeleteBox = async (id: number) => {
    try {
      await api.delete(`/boxes/${id}`);
      showToast("Box deleted successfully");
      await fetchBoxes();
    } catch (error) {
      console.error(error);
      showToast("Failed to delete box", "error");
    }
  };

  const handleSaveFitting = async () => {
    if (!fittingForm.fittingName || !fittingForm.size || !fittingForm.quantity) {
      showToast("Please fill all fitting fields", "warning");
      return;
    }
    try {
      if (fittingForm.id !== null) {
        await api.put(`/fittings/${fittingForm.id}`, {
          fitting_name: fittingForm.fittingName,
          size: fittingForm.size,
          quantity: Number(fittingForm.quantity)
        });
        showToast("Fitting updated successfully");
      } else {
        await api.post("/fittings", {
          fitting_name: fittingForm.fittingName,
          size: fittingForm.size,
          quantity: Number(fittingForm.quantity)
        });
        showToast("Fitting added successfully");
      }
      await fetchFittings();
      setShowFittingForm(false);
      setFittingForm({ id: null, fittingName: "", size: "", quantity: "" });
    } catch (error) {
      console.error(error);
      showToast("Failed to save fitting", "error");
    }
  };

  const handleDeleteFitting = async (id: number) => {
    try {
      await api.delete(`/fittings/${id}`);
      showToast("Fitting deleted successfully");
      await fetchFittings();
    } catch (error) {
      console.error(error);
      showToast("Failed to delete fitting", "error");
    }
  };

  const fetchProcessInventory = async () => {
    try {
      const res = await api.get("/process-inventory");
      console.log("Process Inventory API:", res.data);
      if (res.data && res.data.success) {
        setProcessInventory(res.data.data.map((item: any) => ({
          id: item.id,
          partyName: item.party_name,
          orderName: item.order_name,
          orderDate: item.order_date,
          processName: item.process_name,
          quantity: item.quantity,
          unit: item.unit,
          status: item.status
        })));
      }
    } catch (error) {
      console.error("Error fetching process inventory:", error);
    }
  };

  const handleEditProcessInventory = (item: any, index: number) => {
    setProcessInventoryForm({
      id: item.id,
      partyName: item.partyName,
      orderName: item.orderName,
      orderDate: item.orderDate,
      processName: item.processName,
      quantity: item.quantity.toString(),
      unit: item.unit,
      status: item.status
    });
    setEditProcessInventoryIndex(index);
    setShowProcessInventoryForm(true);
  };

  const handleDeleteProcessInventory = async (id: number) => {
    try {
      await api.delete(`/process-inventory/${id}`);
      showToast("Process inventory item deleted successfully");
      await fetchProcessInventory();
    } catch (error) {
      console.error("Error deleting process inventory item:", error);
      showToast("Failed to delete item", "error");
    }
  };

  const handleSaveProcessInventory = async () => {
    try {
      if (editProcessInventoryIndex !== null) {
        await api.put(`/process-inventory/${processInventoryForm.id}`, {
          party_name: processInventoryForm.partyName,
          order_name: processInventoryForm.orderName,
          order_date: processInventoryForm.orderDate,
          process_name: processInventoryForm.processName,
          quantity: Number(processInventoryForm.quantity),
          unit: processInventoryForm.unit,
          status: processInventoryForm.status
        });
        showToast("Process inventory item updated successfully");
      } else {
        await api.post("/process-inventory", {
          party_name: processInventoryForm.partyName,
          order_name: processInventoryForm.orderName,
          order_date: processInventoryForm.orderDate,
          process_name: processInventoryForm.processName,
          quantity: Number(processInventoryForm.quantity),
          unit: processInventoryForm.unit,
          status: processInventoryForm.status
        });
        showToast("Process inventory item added successfully");
      }
      await fetchProcessInventory();
      setShowProcessInventoryForm(false);
      setEditProcessInventoryIndex(null);
      setProcessInventoryForm({
        id: null,
        partyName: "",
        orderName: "",
        orderDate: "",
        processName: "",
        quantity: "",
        unit: "",
        status: ""
      });
    } catch (error) {
      console.error("Error saving process inventory item:", error);
      showToast("Failed to save item", "error");
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
      item.availableStock < (item.lowStockThreshold || 30) &&
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

            <div onClick={() => setShowBoxForm(true)}>
              <PrimaryButton text="Add Box" />
            </div>

            <div onClick={() => setShowFittingForm(true)}>
              <PrimaryButton text="Add Fitting" />
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

              <div>
                <label className="block mb-2 font-medium">
                  Low Stock Threshold
                </label>

                <input
                  type="number"
                  placeholder="Enter Low Stock Threshold"
                  value={materialForm.lowStockThreshold}
                  onChange={(e) =>
                    setMaterialForm({
                      ...materialForm,
                      lowStockThreshold: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">
                  Size
                </label>

                <input
                  type="text"
                  placeholder="Enter Size"
                  value={materialForm.size}
                  onChange={(e) =>
                    setMaterialForm({
                      ...materialForm,
                      size: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">
                  Finish
                </label>

                <input
                  type="text"
                  placeholder="Enter Finish "
                  value={materialForm.finish}
                  onChange={(e) =>
                    setMaterialForm({
                      ...materialForm,
                      finish: e.target.value,
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
                    showToast("Please fill all fields", "warning");
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
                      low_stock_threshold: Number(materialForm.lowStockThreshold || 30),
                      status:
                        Number(materialForm.availableStock) === 0
                          ? "Out Of Stock"
                          : Number(materialForm.availableStock) < Number(materialForm.lowStockThreshold || 30)
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
                          low_stock_threshold: Number(materialForm.lowStockThreshold || 30),
                          size: materialForm.size,
                          finish: materialForm.finish,
                          status:
                            Number(materialForm.availableStock) === 0
                              ? "Out Of Stock"
                              : Number(materialForm.availableStock) < Number(materialForm.lowStockThreshold || 30)
                                ? "Low Stock"
                                : "In Stock",
                        }
                      );

                      showToast("Material Updated Successfully");

                      await fetchMaterials();

                      setEditIndex(null);

                      setMaterialForm({
                        id: null,
                        name: "",
                        unit: "",
                        availableStock: "",
                        lowStockThreshold: "30",
                        size: "",
                        finish: ""
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
                      low_stock_threshold: Number(materialForm.lowStockThreshold || 30),
                      size: materialForm.size,
                      finish: materialForm.finish,
                    });

                    showToast("Material Added Successfully");

                    await fetchMaterials();

                    setMaterialForm({
                      id: null,
                      name: "",
                      unit: "",
                      availableStock: "",
                      lowStockThreshold: "30",
                      size: "",
                      finish: ""
                    });


                    setShowForm(false);

                  } catch (error) {
                    console.error(error);

                    if (error.response) {
                      console.log("Backend Error:", error.response.data);
                    }

                    showToast("Failed To Update Material", "error");
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

              <div className="flex gap-2">

                <button
                  onClick={() => {
                    console.log("Edit Item:", item);
                    setMaterialForm({
                      id: item.id,
                      name: item.name,
                      unit: item.unit,
                      availableStock:
                        item.availableStock.toString(),
                      lowStockThreshold: (item.lowStockThreshold || 30).toString(),
                      size: (item.size || 0).toString(),
                      finish: (item.finish || 0).toString(),
                    });

                    console.log("Setting Form ID:", item.id);

                    setEditIndex(index);

                    setShowForm(true);

                  }}
                  className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                >

                  <Pencil size={16} />

                </button>

                <button
                  onClick={() => {
                    console.log("View Item:", item);
                    // Add view functionality here
                    showToast(`Viewing ${item.name}`, "info");
                  }}
                  className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                >

                  <Eye size={16} />

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
                    className={`w-9 h-9 rounded-lg border ${currentPage === i + 1
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Boxes Inventory</h2>
        </div>

        {showBoxForm && (
          <div className="bg-slate-50 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">{boxForm.id !== null ? "Edit Box" : "Add New Box"}</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block mb-2 font-medium">Box Size</label>
                <input type="text" list="box-sizes" placeholder="Enter Box Size" value={boxForm.boxSize} onChange={(e) => setBoxForm({ ...boxForm, boxSize: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3" />
                <datalist id="box-sizes">
                  {[...new Set(boxes.map(b => b.box_size).filter(Boolean))].map((size: any) => (
                    <option key={size} value={size} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block mb-2 font-medium">Brand Name</label>
                <input type="text" placeholder="Enter Brand Name" value={boxForm.brandName} onChange={(e) => setBoxForm({ ...boxForm, brandName: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3" />
              </div>
              <div>
                <label className="block mb-2 font-medium">Quantity (Pieces)</label>
                <input type="number" placeholder="Enter Quantity" value={boxForm.quantity} onChange={(e) => setBoxForm({ ...boxForm, quantity: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowBoxForm(false); setBoxForm({ id: null, boxSize: "", brandName: "", quantity: "" }); }} className="px-6 py-3 border rounded-xl">Cancel</button>
              <button onClick={handleSaveBox} className="px-6 py-3 bg-blue-600 text-white rounded-xl">Save Box</button>
            </div>
          </div>
        )}

        <div className="bg-slate-50 rounded-xl px-4 py-4">
          <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-slate-600 border-b pb-3 mb-2">
            <div>Box Size</div>
            <div>Brand Name</div>
            <div>Quantity (pcs)</div>
            <div>Action</div>
          </div>
          {boxes.length === 0 ? (
            <div className="py-4 text-center text-slate-500">No boxes found</div>
          ) : (
            boxes.map((item, index) => (
              <div key={item.id} className="grid grid-cols-4 gap-4 py-4 px-3 border-b border-slate-100 items-center hover:bg-slate-50 transition">
                <div>{item.box_size}</div>
                <div>{item.brand_name}</div>
                <div>{item.quantity}</div>
                <div className="flex gap-2">
                  <button onClick={() => { setBoxForm({ id: item.id, boxSize: item.box_size, brandName: item.brand_name, quantity: item.quantity.toString() }); setShowBoxForm(true); }} className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200"><Pencil size={16} /></button>
                  <button onClick={() => handleDeleteBox(item.id)} className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center hover:bg-red-200 text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Fittings Inventory</h2>
        </div>

        {showFittingForm && (
          <div className="bg-slate-50 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">{fittingForm.id !== null ? "Edit Fitting" : "Add New Fitting"}</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block mb-2 font-medium">Fitting Name</label>
                <input type="text" placeholder="Enter Fitting Name" value={fittingForm.fittingName} onChange={(e) => setFittingForm({ ...fittingForm, fittingName: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3" />
              </div>
              <div>
                <label className="block mb-2 font-medium">Size</label>
                <input type="text" list="fitting-sizes" placeholder="Enter Size" value={fittingForm.size} onChange={(e) => setFittingForm({ ...fittingForm, size: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3" />
                <datalist id="fitting-sizes">
                  {[...new Set([...fittings.map(f => f.size), ...materials.map((m: any) => m.size)].filter(Boolean))].map((size: any) => (
                    <option key={size} value={size} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block mb-2 font-medium">Quantity (Pieces)</label>
                <input type="number" placeholder="Enter Quantity" value={fittingForm.quantity} onChange={(e) => setFittingForm({ ...fittingForm, quantity: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowFittingForm(false); setFittingForm({ id: null, fittingName: "", size: "", quantity: "" }); }} className="px-6 py-3 border rounded-xl">Cancel</button>
              <button onClick={handleSaveFitting} className="px-6 py-3 bg-blue-600 text-white rounded-xl">Save Fitting</button>
            </div>
          </div>
        )}

        <div className="bg-slate-50 rounded-xl px-4 py-4">
          <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-slate-600 border-b pb-3 mb-2">
            <div>Fitting Name</div>
            <div>Size</div>
            <div>Quantity (pcs)</div>
            <div>Action</div>
          </div>
          {fittings.length === 0 ? (
            <div className="py-4 text-center text-slate-500">No fittings found</div>
          ) : (
            fittings.map((item, index) => (
              <div key={item.id} className="grid grid-cols-4 gap-4 py-4 px-3 border-b border-slate-100 items-center hover:bg-slate-50 transition">
                <div>{item.fitting_name}</div>
                <div>{item.size}</div>
                <div>{item.quantity}</div>
                <div className="flex gap-2">
                  <button onClick={() => { setFittingForm({ id: item.id, fittingName: item.fitting_name, size: item.size, quantity: item.quantity.toString() }); setShowFittingForm(true); }} className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200"><Pencil size={16} /></button>
                  <button onClick={() => handleDeleteFitting(item.id)} className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center hover:bg-red-200 text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          )}
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

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditProcessInventory(item, processInventory.indexOf(item))}
                  className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDeleteProcessInventory(item.id)}
                  className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center hover:bg-red-200 text-red-600"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          ))}

        </div>

        {showProcessInventoryForm && (
          <div className="bg-slate-50 rounded-2xl p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">
              {editProcessInventoryIndex !== null ? "Edit Process Inventory Item" : "Add Process Inventory Item"}
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block mb-2 font-medium">Party Name</label>
                <input
                  type="text"
                  placeholder="Enter Party Name"
                  value={processInventoryForm.partyName}
                  onChange={(e) => setProcessInventoryForm({ ...processInventoryForm, partyName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Order Name</label>
                <input
                  type="text"
                  placeholder="Enter Order Name"
                  value={processInventoryForm.orderName}
                  onChange={(e) => setProcessInventoryForm({ ...processInventoryForm, orderName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Order Date</label>
                <input
                  type="date"
                  value={processInventoryForm.orderDate}
                  onChange={(e) => setProcessInventoryForm({ ...processInventoryForm, orderDate: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Process Name</label>
                <input
                  type="text"
                  placeholder="Enter Process Name"
                  value={processInventoryForm.processName}
                  onChange={(e) => setProcessInventoryForm({ ...processInventoryForm, processName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Quantity</label>
                <input
                  type="number"
                  placeholder="Enter Quantity"
                  value={processInventoryForm.quantity}
                  onChange={(e) => setProcessInventoryForm({ ...processInventoryForm, quantity: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Unit</label>
                <input
                  type="text"
                  placeholder="Enter Unit"
                  value={processInventoryForm.unit}
                  onChange={(e) => setProcessInventoryForm({ ...processInventoryForm, unit: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Status</label>
                <select
                  value={processInventoryForm.status}
                  onChange={(e) => setProcessInventoryForm({ ...processInventoryForm, status: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3"
                >
                  <option value="Available">Available</option>
                  <option value="Used">Used</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowProcessInventoryForm(false);
                  setEditProcessInventoryIndex(null);
                  setProcessInventoryForm({
                    id: null,
                    partyName: "",
                    orderName: "",
                    orderDate: "",
                    processName: "",
                    quantity: "",
                    unit: "",
                    status: ""
                  });
                }}
                className="px-5 py-2 border rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProcessInventory}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl"
              >
                {editProcessInventoryIndex !== null ? "Update" : "Save"}
              </button>
            </div>
          </div>
        )}

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
                    className={`px-2 py-1 rounded-full text-xs font-medium ${entry.action === "Added"
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