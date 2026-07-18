import DashboardCard from "@/components/DashboardCard";
import { useNavigate } from "react-router-dom";

import {
  ShoppingCart,
  Cog,
  FileText,
  Users,
  Package,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-7xl">

       <div className="grid grid-cols-3 gap-6 mb-6">
  <DashboardCard
  title="New Order"
  icon={ShoppingCart}
  color="border-blue-500"
  iconBg="bg-blue-100"
  iconColor="text-blue-600"
  onClick={() => navigate("/new-order")}
/>

  <DashboardCard
  title="Process"
  icon={Cog}
  color="border-green-500"
  iconBg="bg-green-100"
  iconColor="text-green-600"
  onClick={() => navigate("/process")}
/>

  <DashboardCard
  title="Reports"
  icon={FileText}
  color="border-red-500"
  iconBg="bg-red-100"
  iconColor="text-red-600"
  onClick={() => navigate("/reports")}
/>
</div>

<div className="grid grid-cols-2 gap-6 w-[60%] mx-auto">
  <DashboardCard
  title="Party"
  icon={Users}
  color="border-purple-500"
  iconBg="bg-purple-100"
  iconColor="text-purple-600"
  onClick={() => navigate("/party")}
/>

  <DashboardCard
  title="Inventory"
  icon={Package}
  color="border-orange-500"
  iconBg="bg-orange-100"
  iconColor="text-orange-600"
  onClick={() => navigate("/inventory")}
/>
</div>

      </div>
    </div>
  );
}

export default Dashboard;