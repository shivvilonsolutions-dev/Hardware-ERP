import PageHeader from "@/components/PageHeader";
import { ClipboardPlus } from "lucide-react";
import SectionCard from "@/components/SectionCard";
import StatusBadge from "@/components/StatusBadge";
import FormSelect from "@/components/FormSelect";
import { useState, useEffect } from "react";
import api from "@/api/api";
import { useToast } from "@/contexts/ToastContext";

function NewOrder() {
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientNames, setClientNames] = useState<string[]>([
    "ABC Industries",
    "XYZ Foods",
    "Patidar Group",
  ]);
  const [surfaceFinishes, setSurfaceFinishes] = useState<string[]>([
    "Galvanized",
    "Painted",
    "Powder Coated",
    "Anodized",
    "Zinc Plated",
    "Nickel Plated",
    "Chromed",
    "Stainless Steel",
    "Aluminum",
    "Brass",
    "Copper",
    "Bronze",
    "Black Oxide",
    "Clear Anodize",
    "Hard Anodize",
    "Natural",
    "Unfinished",
  ]);
  const [brandNames, setBrandNames] = useState<string[]>([]);
  const [productNames, setProductNames] = useState<string[]>([
    "Product A",
    "Product B",
    "Product C",
  ]);
  const [deliveryLocations, setDeliveryLocations] = useState<string[]>([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders");
      const ordersData = res.data?.data || [];
      setOrders(ordersData);

      const uniqueClients = [...new Set(ordersData.map((o: any) => o.client_name).filter(Boolean))] as string[];
      const uniqueBrands = [...new Set(ordersData.map((o: any) => o.brand_name).filter(Boolean))] as string[];
      const uniqueProducts = [...new Set(ordersData.map((o: any) => o.product_name).filter(Boolean))] as string[];
      const uniqueLocations = [...new Set(ordersData.map((o: any) => o.delivery_location).filter(Boolean))] as string[];

      setClientNames(uniqueClients.length > 0 ? uniqueClients : ["ABC Industries", "XYZ Foods", "Patidar Group"]);
      setBrandNames(uniqueBrands.length > 0 ? uniqueBrands : []);
      setProductNames(uniqueProducts.length > 0 ? uniqueProducts : ["Product A", "Product B", "Product C"]);
      setDeliveryLocations(uniqueLocations.length > 0 ? uniqueLocations : []);
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    clientName: "",
    brandName: "",
    productName: "",
    deliveryLocation: "",
    notes: "",
  });

  const [lineItems, setLineItems] = useState([
    { size: "", quantity: "", model: "", surfaceFinish: "Galvanized" }
  ]);

  const handleSaveOrder = async () => {
    if (
      !formData.clientName ||
      !formData.brandName ||
      !formData.productName ||
      !formData.deliveryLocation ||
      lineItems.length === 0
    ) {
      showToast("Please fill all required parent fields and add at least one line item", "warning");
      return;
    }

    try {
      const totalQuantity = lineItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

      const payload = {
        client_name: formData.clientName,
        brand_name: formData.brandName,
        product_name: formData.productName,
        quantity: totalQuantity,
        delivery_location: formData.deliveryLocation,
        notes: formData.notes,
        // Legacy fallbacks
        surfaceFinishes: lineItems[0]?.surfaceFinish || "",
        model: lineItems[0]?.model || "",
        size: lineItems[0]?.size || "",
      };

      let orderIdCustom = "";

      if (editId) {
        const response = await api.put(`/orders/${editId}`, payload);
        orderIdCustom = response.data.data.order_id_custom;
        showToast("Order Updated Successfully (Line item sync requires backend PUT routes)", "success");
        setEditId(null);
      } else {
        const response = await api.post("/orders", payload);
        orderIdCustom = response.data.data.order_id_custom;

        // POST LINE ITEMS
        await Promise.all(lineItems.map(item =>
          api.post(`/orders/${orderIdCustom}/items`, {
            size: item.size,
            quantity: Number(item.quantity),
            model: item.model,
            surface_finish: item.surfaceFinish
          })
        ));

        showToast("Order & Line Items Saved Successfully", "success");
      }

      await fetchOrders();

      setFormData({
        clientName: "",
        brandName: "",
        productName: "",
        deliveryLocation: "",
        notes: "",
      });
      setLineItems([{ size: "", quantity: "", model: "", surfaceFinish: "Galvanized" }]);
    } catch (error) {
      console.error(error);
      showToast(editId ? "Order Update Failed" : "Order Save Failed", "error");
    }
  };

  const handleEditOrder = (order: any) => {
    setEditId(order.id);

    if (order.client_name && !clientNames.includes(order.client_name)) {
      setClientNames((prev) => [...prev, order.client_name]);
    }
    if (order.brand_name && !brandNames.includes(order.brand_name)) {
      setBrandNames((prev) => [...prev, order.brand_name]);
    }
    if (order.product_name && !productNames.includes(order.product_name)) {
      setProductNames((prev) => [...prev, order.product_name]);
    }

    setFormData({
      clientName: order.client_name || "",
      brandName: order.brand_name || "",
      productName: order.product_name || "",
      deliveryLocation: order.delivery_location || "",
      notes: order.notes || "",
    });

    if (order.items && order.items.length > 0) {
      setLineItems(order.items.map((i: any) => ({
        size: i.size || "",
        quantity: i.quantity?.toString() || "",
        model: i.model || "",
        surfaceFinish: i.surface_finish || "Galvanized"
      })));
    } else {
      setLineItems([{
        size: order.size || "",
        quantity: order.quantity?.toString() || "",
        model: order.model || "",
        surfaceFinish: order.surface_finishes || order.surfaceFinishes || order.surface_finish || "Galvanized"
      }]);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const triggerDelete = (id: string) => {
    setOrderToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await api.delete(`/orders/${orderToDelete}`);
      showToast("Order deleted successfully", "success");
      fetchOrders();
    } catch (error) {
      console.error(error);
      showToast("Failed to delete order", "error");
    } finally {
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  return (
    <>
      <PageHeader
        title="New Order"
        subtitle="Create a new product order"
        icon={ClipboardPlus}
      />

      <div className="mt-8">
        <SectionCard>
          <h2 className="text-2xl font-semibold text-slate-800">Order Details</h2>
          <div className="w-10 h-1 bg-blue-500 rounded-full mt-3 mb-10"></div>

          <div className="grid grid-cols-3 gap-8">
            <FormSelect
              label="Client Name"
              required
              value={formData.clientName}
              onChange={(value) =>
                setFormData({ ...formData, clientName: value })
              }
              options={clientNames}
              onAddOption={(newClient) => {
                setClientNames([...clientNames, newClient]);
              }}
            />

            <FormSelect
              label="Brand Name"
              required
              value={formData.brandName}
              onChange={(value) =>
                setFormData({ ...formData, brandName: value })
              }
              options={brandNames}
              onAddOption={(newBrand) => {
                setBrandNames([...brandNames, newBrand]);
              }}
            />

            <FormSelect
              label="Product Name"
              required
              value={formData.productName}
              onChange={(value) =>
                setFormData({ ...formData, productName: value })
              }
              options={productNames}
              onAddOption={(newProduct) => {
                setProductNames([...productNames, newProduct]);
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-8 mt-8">
            <div>
              <label className="block mb-2 font-medium">
                Delivery Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Delivery Location"
                value={formData.deliveryLocation}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryLocation: e.target.value })
                }
                className="w-full border border-slate-200 rounded-xl px-4 py-3"
                list="delivery-locations"
              />
              <datalist id="delivery-locations">
                {deliveryLocations.map((loc, idx) => (
                  <option key={idx} value={loc} />
                ))}
              </datalist>
            </div>

            <div className="col-span-2">
              <label className="block mb-2 font-medium">Notes</label>
              <input
                type="text"
                placeholder="Enter any notes (optional)"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full border border-slate-200 rounded-xl px-4 py-3"
              />
            </div>
          </div>

          {/* LINE ITEMS TABLE */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-800">Order Line Items (Sizes)</h3>
              <button
                onClick={() => setLineItems([...lineItems, { size: "", quantity: "", model: "", surfaceFinish: "Galvanized" }])}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition"
              >
                + Add Size
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-medium text-slate-600">Size</th>
                    <th className="p-3 font-medium text-slate-600">Quantity (Pcs)</th>
                    <th className="p-3 font-medium text-slate-600">Model</th>
                    <th className="p-3 font-medium text-slate-600">Surface Finish</th>
                    <th className="p-3 font-medium text-slate-600 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100 last:border-b-0">
                      <td className="p-3">
                        <input type="text" value={item.size} onChange={(e) => {
                          const newItems = [...lineItems]; newItems[index].size = e.target.value; setLineItems(newItems);
                        }} className="w-full border border-slate-200 rounded-lg px-3 py-2" placeholder='e.g. 1/2"' />
                      </td>
                      <td className="p-3">
                        <input type="number" value={item.quantity} onChange={(e) => {
                          const newItems = [...lineItems]; newItems[index].quantity = e.target.value; setLineItems(newItems);
                        }} className="w-full border border-slate-200 rounded-lg px-3 py-2" placeholder="Qty" />
                      </td>
                      <td className="p-3">
                        <input type="text" value={item.model} onChange={(e) => {
                          const newItems = [...lineItems]; newItems[index].model = e.target.value; setLineItems(newItems);
                        }} className="w-full border border-slate-200 rounded-lg px-3 py-2" placeholder="Model" />
                      </td>
                      <td className="p-3">
                        <select value={item.surfaceFinish} onChange={(e) => {
                          const newItems = [...lineItems]; newItems[index].surfaceFinish = e.target.value; setLineItems(newItems);
                        }} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white">
                          {surfaceFinishes.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        {lineItems.length > 1 && (
                          <button onClick={() => setLineItems(lineItems.filter((_, i) => i !== index))} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition">
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={() => {
                setEditId(null);
                setFormData({
                  clientName: "",
                  brandName: "",
                  productName: "",
                  deliveryLocation: "",
                  notes: "",
                });
                setLineItems([{ size: "", quantity: "", model: "", surfaceFinish: "Galvanized" }]);
              }}
              className="px-8 py-3 border border-slate-300 rounded-xl font-medium hover:bg-slate-50 transition"
            >
              Reset
            </button>

            <button
              onClick={handleSaveOrder}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            >
              {editId ? "Update Order" : "Save Order"}
            </button>
          </div>
        </SectionCard>
      </div>

      <SectionCard>
        <h2 className="text-2xl font-semibold text-slate-800">Recent Saved Orders</h2>

        <div className="bg-slate-50 rounded-xl px-4 py-4 mt-6">
          <div className="grid grid-cols-8 gap-4 text-sm font-semibold text-slate-600">
            <div>Order ID</div>
            <div>Client Name</div>
            <div>Brand</div>
            <div>Product</div>
            <div>Quantity/Sizes</div>
            <div>Date</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-500">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            No Orders Found
          </div>
        ) : (
          orders.map((order: any) => (
            <div
              key={order.id}
              className="grid grid-cols-8 gap-4 py-4 px-2 border-b border-slate-100 items-center hover:bg-slate-50 transition"
            >
              <div>{order.order_id_custom}</div>
              <div>{order.client_name}</div>
              <div>{order.brand_name}</div>
              <div>{order.product_name}</div>
              <div>
                {order.items && order.items.length > 1
                  ? <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">{order.items.length} Sizes</span>
                  : `${order.quantity} Pcs`
                }
              </div>
              <div>{new Date(order.created_at).toLocaleDateString()}</div>
              <div>
                <StatusBadge
                  text={order.status}
                  color={order.status === "Pending" ? "orange" : "green"}
                />
              </div>
              <div className="flex gap-3 text-sm">
                <button
                  onClick={() => handleEditOrder(order)}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => triggerDelete(order.id)}
                  className="text-red-600 font-medium hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </SectionCard>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-800">Confirm Deletion</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Are you sure you want to delete this order? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={cancelDelete}
                className="px-5 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 shadow-sm shadow-red-600/30 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NewOrder;