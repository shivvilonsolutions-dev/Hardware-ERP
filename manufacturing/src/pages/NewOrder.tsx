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
  const [clientNames, setClientNames] = useState([
    "ABC Industries",
    "XYZ Foods",
    "Patidar Group",
  ]);
  const [surfaceFinishes, setSurfaceFinishes] = useState([
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
  const [brandNames, setBrandNames] = useState([]);
  const [productNames, setProductNames] = useState([
    "Product A",
    "Product B",
    "Product C",
  ]);
  const [deliveryLocations, setDeliveryLocations] = useState([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders");

      console.log("Orders API:", res.data);

      const ordersData = res.data?.data || [];
      setOrders(ordersData);

      // Extract unique values for autocomplete
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

  const [formData, setFormData] = useState({
    clientName: "",
    brandName: "",
    productName: "",
    quantity: "",
    deliveryLocation: "",
    notes: "",
    surfaceFinish: "",
    model: "",
    size: "",
  });

  const handleSaveOrder = async () => {

    if (
      !formData.clientName ||
      !formData.brandName ||
      !formData.productName ||
      !formData.quantity ||
      !formData.deliveryLocation
    ) {
      showToast("Please fill all required fields", "warning");
      return;
    }

    try {

      const payload = {
        client_name: formData.clientName,
        brand_name: formData.brandName,
        product_name: formData.productName,
        quantity: Number(formData.quantity),
        delivery_location: formData.deliveryLocation,
        notes: formData.notes,
        surfaceFinishes: formData.surfaceFinish,
        model: formData.model,
        size: formData.size
      };

      const response = await api.post(
        "/orders",
        payload
      );

      console.log("Order Saved", response.data);

      showToast("Order Saved Successfully");

      await fetchOrders();

      setFormData({
        clientName: "",
        brandName: "",
        productName: "",
        quantity: "",
        deliveryLocation: "",
        notes: "",
        model: "",
        surfaceFinish: "",
        size: ""
      });

    } catch (error) {
      console.error(error);
      showToast("Order Save Failed", "error");
    }
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

          <h2 className="text-2xl font-semibold text-slate-800">
            Order Details
          </h2>

          <div className="w-10 h-1 bg-blue-500 rounded-full mt-3 mb-10"></div>

          <div className="grid grid-cols-3 gap-8">

            <FormSelect
              label="Client Name"
              required
              value={formData.clientName}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  clientName: value,
                })
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
                setFormData({
                  ...formData,
                  brandName: value,
                })
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
                setFormData({
                  ...formData,
                  productName: value,
                })
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
                Quantity (Pcs) <span className="text-red-500">*</span>
              </label>

              <input
                type="number"
                placeholder="Enter Quantity in Pcs"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: e.target.value,
                  })
                }
                className="w-full border border-slate-200 rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Delivery Location <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Enter Delivery Location"
                value={formData.deliveryLocation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deliveryLocation: e.target.value,
                  })
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

            <div>
              <label className="block mb-2 font-medium">
                Notes
              </label>

              <input
                type="text"
                placeholder="Enter any notes (optional)"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notes: e.target.value,
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
                placeholder="Enter size in inches"
                value={formData.size}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    size: e.target.value,
                  })
                }
                className="w-full border border-slate-200 rounded-xl px-4 py-3"
              />
            </div>


            {/* <div>
              <label className="block mb-2 font-medium">
                Surface Finish
              </label>

              <input
                type="text"
                placeholder="Enter surface finish"
                value={formData.surfaceFinish}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    surfaceFinish: e.target.value,
                  })
                }
                className="w-full border border-slate-200 rounded-xl px-4 py-3"
              />
            </div> */}


            <FormSelect
              label="Surface Finish"
              required
              value={formData.surfaceFinish}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  surfaceFinish: value,
                })
              }
              options={surfaceFinishes}
              onAddOption={(newSurfaceFinish) => {
                setSurfaceFinishes([...surfaceFinishes, newSurfaceFinish]);
              }}
            />


            <div>
              <label className="block mb-2 font-medium">
                Model
              </label>

              <input
                type="text"
                placeholder="Enter model number"
                value={formData.model}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    model: e.target.value,
                  })
                }
                className="w-full border border-slate-200 rounded-xl px-4 py-3"
              />
            </div>


          </div>

          <div className="flex justify-end gap-4 mt-6">

            <button
              onClick={() =>
                setFormData({
                  clientName: "",
                  brandName: "",
                  productName: "",
                  quantity: "",
                  deliveryLocation: "",
                  notes: "",
                  surfaceFinish: "",
                  size: "",
                  model: ""
                })
              }
              className="px-8 py-3 border border-slate-300 rounded-xl font-medium hover:bg-slate-50"
            >
              Reset
            </button>

            <button
              onClick={handleSaveOrder}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
            >
              Save Order
            </button>

          </div>

        </SectionCard>
      </div>

      <SectionCard>

        <h2 className="text-2xl font-semibold text-slate-800">
          Recent Saved Orders
        </h2>

        <div className="bg-slate-50 rounded-xl px-4 py-4 mt-6">

          <div className="grid grid-cols-7 gap-4 text-sm font-semibold text-slate-600">

            <div>Order ID</div>
            <div>Client Name</div>
            <div>Brand</div>
            <div>Product</div>
            <div>Quantity</div>
            <div>Date</div>
            <div>Status</div>

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
          orders.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-7 gap-4 py-4 px-2 border-b border-slate-100 items-center hover:bg-slate-50 transition"
            >
              <div>{order.order_id_custom}</div>

              <div>{order.client_name}</div>

              <div>{order.brand_name}</div>

              <div>{order.product_name}</div>

              <div>{order.quantity}</div>

              <div>
                {new Date(order.created_at)
                  .toLocaleDateString()}
              </div>

              <div>
                <StatusBadge
                  text={order.status}
                  color={order.status === "Pending" ? "orange" : "green"}
                />
              </div>
            </div>
          ))

        )}

      </SectionCard>
    </>
  );
}

export default NewOrder;
