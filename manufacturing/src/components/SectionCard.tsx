import type { ReactNode } from "react";

type SectionCardProps = {
  children: ReactNode;
};

function SectionCard({
  children,
}: SectionCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 mt-8">
      {children}
    </div>
  );
}

export default SectionCard;