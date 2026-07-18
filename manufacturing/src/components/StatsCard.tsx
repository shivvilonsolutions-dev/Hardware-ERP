import type { LucideIcon } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
};

function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  bgColor,
  iconColor,
}: StatsCardProps) {
  return (
  <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
    
    <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center`}>
      <Icon size={28} className={iconColor} />
    </div>

    <div>
      <h3 className="text-sm text-slate-500">
        {title}
      </h3>

      <p className="text-3xl font-bold">
        {value}
      </p>

      <p className="text-sm text-slate-400">
        {subtitle}
      </p>
    </div>

  </div>
);
}

export default StatsCard;