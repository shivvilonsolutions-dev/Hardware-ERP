type PaginationProps = {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="flex justify-between items-center mt-6 text-sm text-slate-500">

      <p>
        Showing page {currentPage} of {totalPages}
      </p>

      <div className="flex gap-2">

        {Array.from(
          { length: totalPages },
          (_, index) => (
            <button
              key={index}
              onClick={() => onPageChange(index + 1)}
              className={`w-8 h-8 rounded-lg border ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : ""
              }`}
            >
              {index + 1}
            </button>
          )
        )}

      </div>

    </div>
  );
}

export default Pagination;