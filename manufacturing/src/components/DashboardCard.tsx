import type { LucideIcon } from "lucide-react";

type DashboardCardProps = {
  title: string;
  icon: LucideIcon;
  color: string;
  iconBg: string;
  iconColor: string;
  onClick: () => void;
};
function DashboardCard({
  title,
  icon: Icon,
  color,
  iconBg,
  iconColor,
  onClick,
}: DashboardCardProps) {
  return (
   <div
  onClick={onClick}
  className={`bg-white h-52 rounded-[30px] shadow-xl border-b-4 ${color} cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center justify-center`}
>
      <div
  className={`w-20 h-20 rounded-full ${iconBg} flex items-center justify-center mb-5`}
>
  <Icon
    size={40}
    className={iconColor}
  />
</div>

      <h2 className="text-3xl font-bold text-slate-800">
        {title}
      </h2>
      <p className="text-gray-500 text-sm mt-2">
  Manage {title}
</p>
    </div>
  );
}

export default DashboardCard;