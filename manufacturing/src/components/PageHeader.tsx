import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
};

function PageHeader({
  title,
  subtitle,
  icon: Icon,
}: PageHeaderProps) {

  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-5">
      
  <button
  onClick={() => navigate(-1)}
  className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
     <ArrowLeft size={20} />
  </button>

  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
    <Icon
      size={24}
      className="text-blue-600"
    />
  </div>

  <div>
    <h1 className="text-3xl font-bold">
      {title}
    </h1>

    <p className="text-slate-500 ">
      {subtitle}
    </p>
  </div>

</div>
  );
}

export default PageHeader;

