import PageHeader from "@/components/PageHeader";
import { ClipboardPlus } from "lucide-react";
import SectionCard from "@/components/SectionCard";
import StatusBadge from "@/components/StatusBadge";
import FormSelect from "@/components/FormSelect";
import { useState, useEffect } from "react";
import api from "@/api/api";


function NewOrder() {

  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
  try {
    const res = await api.get("/orders");

    console.log("Orders API:", res.data);

    setOrders(res.data.data);

  } catch (error) {
    console.error(error);
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
});

const handleSaveOrder = async () => {

  if (
    !formData.clientName ||
    !formData.brandName ||
    !formData.productName ||
    !formData.quantity ||
    !formData.deliveryLocation
  ) {
    alert("Please fill all required fields");
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
    };

    const response = await api.post(
      "/orders",
      payload
    );

    console.log("Order Saved", response.data);

    alert("Order Saved Successfully");

    await fetchOrders();

    setFormData({
      clientName: "",
      brandName: "",
      productName: "",
      quantity: "",
      deliveryLocation: "",
      notes: "",
    });

  } catch (error) {
    console.error(error);
    alert("Order Save Failed");
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
  onChange={(e) =>
    setFormData({
      ...formData,
      clientName: e.target.value,
    })
  }
  options={[
    "ABC Industries",
    "XYZ Foods",
    "Patidar Group",
  ]}
/>

<div>
  <label className="block mb-2 font-medium">
    Brand Name <span className="text-red-500">*</span>
  </label>

  <input
  type="text"
  placeholder="Enter Brand Name"
  value={formData.brandName}
  onChange={(e) =>
    setFormData({
      ...formData,
      brandName: e.target.value,
    })
  }
  className="w-full border border-slate-200 rounded-xl px-4 py-3"
/>
</div>

<FormSelect
  label="Product Name"
  required
  value={formData.productName}
  onChange={(e) =>
    setFormData({
      ...formData,
      productName: e.target.value,
    })
  }
  options={[
    "Product A",
    "Product B",
    "Product C",
  ]}
/>

  </div>

  <div className="grid grid-cols-3 gap-8 mt-8">

  <div>
    <label className="block mb-2 font-medium">
      Quantity (KG) <span className="text-red-500">*</span>
    </label>

    <input
  type="number"
  placeholder="Enter Quantity in KG"
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
/>
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

 {orders.length === 0 ? (

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