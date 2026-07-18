type StatusBadgeProps = {
  text: string;
  color: "green" | "red" | "orange" | "blue" | "purple";
};

function StatusBadge({
  text,
  color,
}: StatusBadgeProps) {
  const colors = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${colors[color]}`}
    >
      {text}
    </span>
  );
}

export default StatusBadge;