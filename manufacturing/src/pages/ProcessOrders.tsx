import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import StatusBadge from "@/components/StatusBadge";
import api from "@/api/api";

function ProcessOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders");
      setOrders(res.data.data);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
      <PageHeader
  title="Process Orders"
  subtitle="Select Order To Start Process"
  icon={ClipboardList}
/>

      <SectionCard>

        <h2 className="text-2xl font-semibold mb-6">
          Orders List
        </h2>

        <div className="bg-slate-50 rounded-xl px-4 py-4">

          <div className="grid grid-cols-7 gap-4 text-sm font-semibold text-slate-600">

            <div>Order ID</div>
            <div>Client Name</div>
            <div>Brand</div>
            <div>Product</div>
            <div>Quantity</div>
            <div>Status</div>
            <div>Action</div>

          </div>

        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-500">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            No orders found
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-7 gap-4 py-4 px-2 border-b border-slate-100 items-center"
            >
              <div>{order.order_id_custom}</div>
              <div>{order.client_name}</div>
              <div>{order.brand_name}</div>
              <div>{order.product_name}</div>
              <div>{order.quantity}</div>
              <div>
                <StatusBadge
                  text={order.status}
                  color={
                    order.status === "Pending"
                      ? "orange"
                      : "green"
                  }
                />
              </div>
              <div>
                <button
                  onClick={() =>
                    navigate(
                      `/process/${order.order_id_custom}`,
                      {
                        state: {
                          order,
                        },
                      }
                    )
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Open
                </button>
              </div>
            </div>
          ))
        )}

      </SectionCard>
    </>
  );
}

export default ProcessOrders;