type PrimaryButtonProps = {
  text: string;
};

function PrimaryButton({
  text,
}: PrimaryButtonProps) {
  return (
    <button className="w-48 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-medium transition">
      {text}
    </button>
  );
}

export default PrimaryButton;