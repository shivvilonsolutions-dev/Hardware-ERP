import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import {
  Factory,
  Save,
  Package,
  Trash2,
  Archive
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";


function Process() {

  const location = useLocation();

  const navigate = useNavigate();

const order =
  location.state?.order;

  const [process1Name, setProcess1Name] = useState("Raw Material");
const [process2Name, setProcess2Name] = useState("Cutting");
const [process3Name, setProcess3Name] = useState("Drilling");
const [process4Name, setProcess4Name] = useState("Polish");
const [process5Name, setProcess5Name] = useState("Packing");
 

const [process1Input, setProcess1Input] = useState(
  Number(order?.quantity || 0)
);
const [process1Rejection, setProcess1Rejection] = useState("");
const [process1Extra, setProcess1Extra] = useState("");

const process1Output =
  process1Input -
  process1Rejection -
  process1Extra;

  const [size, setSize] = useState("");

const [process2Rejection, setProcess2Rejection] = useState("");

const [process2Extra, setProcess2Extra] = useState("");

const process2Input = process1Output;

const process2Output =
  process2Input -
  process2Rejection -
  process2Extra;


const [process3Hole, setProcess3Hole] = useState("");

const [process3Rejection, setProcess3Rejection] = useState("");

const [process3Extra, setProcess3Extra] = useState("");
const [process3Rate, setProcess3Rate] = useState("");

const process3Input = process2Output;

const process3Cutting =
  Number(size) > 0
    ? process3Input / Number(size)
    : 0;
const process3Output =
  process3Input -
  process3Rejection -
  process3Extra;


  const [process4Finishing, setProcess4Finishing] = useState("");

const [process4Rate, setProcess4Rate] =
  useState("");

const [process4Rejection, setProcess4Rejection] =
  useState("");

const [process4Extra, setProcess4Extra] =
  useState("");

const process4Input = process3Output;

const process4TotalCost =
  process4Input * process4Rate;

const process4Output =
  process4Input -
  process4Rejection -
  process4Extra;

  const [piecesPerBox, setPiecesPerBox] =
  useState("");

const process5Input =
  process4Output;

const totalBoxes =
  piecesPerBox > 0
    ? process5Input / piecesPerBox
    : 0;

    const totalExtra =
  process1Extra +
  process2Extra +
  process3Extra +
  process4Extra;

const totalRejection =
  process1Rejection +
  process2Rejection +
  process3Rejection +
  process4Rejection;

  return (
    <>
      <PageHeader
        title="Manufacturing Process"
        subtitle="Manage Production Flow"
        icon={Factory}
      />

      <SectionCard>

  <div className="grid grid-cols-7 gap-6 items-center">

    <div>
      <p className="text-sm text-slate-500">
        Order No.
      </p>
      <h3 className="font-semibold">
        {order?.order_id_custom}
      </h3>
    </div>

    <div>
      <p className="text-sm text-slate-500">
        Order Date
      </p>
      <h3 className="font-semibold">
        {new Date(
  order?.created_at
).toLocaleDateString()}
      </h3>
    </div>

    <div>
      <p className="text-sm text-slate-500">
        Delivery Date
      </p>
      <h3 className="font-semibold">
        30 May 2024
      </h3>
    </div>

    <div>
      <p className="text-sm text-slate-500">
        Party Name (From Order)
      </p>
      <h3 className="font-semibold text-blue-600">
        {order?.client_name}
      </h3>
    </div>

    <div>
      <p className="text-sm text-slate-500">
        Total Qty (Order)
      </p>
      <h3 className="font-semibold">
        {order?.quantity} Pcs
      </h3>
    </div>

     <div>
      <p className="text-sm text-slate-500">
        Status
      </p>

      <h3 className="font-semibold text-green-600">
        {order?.status}
      </h3>
    </div>

    <div className="flex justify-end">
     <button
  onClick={() => navigate("/process")}
  className="px-5 py-3 border rounded-xl hover:bg-slate-50"
>
  ← Back to Orders
</button>
    </div>

  </div>

</SectionCard>


<SectionCard>

  <div className="grid grid-cols-4 gap-6 items-end">

    <div className="col-span-2">
      <label className="block text-sm font-medium mb-2">
        Product Name (From Inventory)
      </label>

      <input
  value={order?.product_name || ""}
  readOnly
  className="
    w-full
    border
    rounded-xl
    px-4 py-3
    bg-slate-50
  "
/>
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">
        Selected Unit
      </label>

      <div className="flex gap-6 mt-3">

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="unit"
          />
          KG
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="unit"
            defaultChecked
          />
          Pieces
        </label>

      </div>
    </div>

    <div className="flex justify-end gap-3">

     <button
  className="
    px-6 py-3
    bg-blue-600
    text-white
    rounded-xl
    flex items-center gap-2
  "
>
  <Save size={18} />
  Save Process
</button>

      <button
        className="
          px-6 py-3
          border
          rounded-xl
        "
      >
        Reset
      </button>

    </div>

  </div>

</SectionCard>

<h2 className="text-xl font-bold mt-8 mb-4">
  PROCESS FLOW
</h2>

<SectionCard>

  <div className="flex gap-6">

    {/* Left Timeline */}

    <div className="flex flex-col items-center">

      <div
        className="
          w-12 h-12
          rounded-full
          bg-green-500
          text-white
          flex items-center justify-center
          font-bold text-xl
        "
      >
        1
      </div>

      <div className="w-[2px] h-32 bg-slate-300 mt-2"></div>

    </div>

    {/* Process Content */}

    <div className="flex-1">

      <span
        className="
          inline-block
          px-3 py-1
          rounded-md
          text-xs font-semibold
          bg-green-500
          text-white
          mb-4
        "
      >
        PROCESS 1
      </span>

      <div className="grid grid-cols-7 gap-6 items-end">

        {/* Process Name */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Process Name
          </label>

          <input
  type="text"
  value={process1Name}
  onChange={(e) => setProcess1Name(e.target.value)}
  className="w-full border rounded-xl px-4 py-3"
/>

        </div>

        {/* Party Name */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Party Name
          </label>

          <input
  value={order?.client_name || ""}
  readOnly
  className="
    w-full
    border
    rounded-xl
    px-4 py-3
    bg-slate-50
  "
/>

        </div>

        {/* Unit */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Unit
          </label>

          <div className="flex gap-4 mt-3">

            <label className="flex items-center gap-2">
              <input type="radio" />
              KG
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                defaultChecked
              />
              Pieces
            </label>

          </div>

        </div>

        {/* Input Qty */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Input Qty
          </label>

          <input
  type="number"
  value={process1Input}
  onChange={(e) =>
    setProcess1Input(Number(e.target.value))
  }
  className="
    w-full
    border
    border-blue-300
    rounded-xl
    px-4 py-3
  "
/>

        </div>

        {/* Rejection */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Rejection
          </label>

          <input
  type="number"
  value={process1Rejection}
  onChange={(e) =>
    setProcess1Rejection(Number(e.target.value))
  }
  className="
    w-full
    border
    border-red-300
    rounded-xl
    px-4 py-3
    bg-red-50
  "
/>

        </div>

        {/* Extra */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Extra (To Inventory)
          </label>

          <input
  type="number"
  value={process1Extra}
  onChange={(e) =>
    setProcess1Extra(Number(e.target.value))
  }
  className="
    w-full
    border
    border-orange-300
    rounded-xl
    px-4 py-3
    bg-orange-50
  "
/>

        </div>

        {/* Output */}

        <div>

          <label className="block text-sm font-medium mb-2 text-green-600">
            Output To Next Process
          </label>

          <input
  type="number"
  value={process1Output}
  readOnly
  className="
    w-full
    border
    border-green-300
    rounded-xl
    px-4 py-3
    bg-green-50
  "
/>

        </div>

      </div>

    </div>

  </div>

  <div className="border-t border-slate-200 my-8"></div>

  

  <div className="flex gap-6">

    {/* Left Timeline */}

    <div className="flex flex-col items-center">

      <div
        className="
          w-12 h-12
          rounded-full
          bg-blue-500
          text-white
          flex items-center justify-center
          font-bold text-xl
        "
      >
        2
      </div>

      <div className="w-[2px] h-32 bg-slate-300 mt-2"></div>

    </div>

    {/* Content */}

    <div className="flex-1">

      <span
        className="
          inline-block
          px-3 py-1
          rounded-md
          text-xs font-semibold
          bg-blue-500
          text-white
          mb-4
        "
      >
        PROCESS 2
      </span>

      <div className="grid grid-cols-7 gap-6 items-end">

        <div>
          <label className="block text-sm mb-2">
            Process Name
          </label>

          <input
            value={process2Name}
onChange={(e) => setProcess2Name(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">
            Party Name
          </label>

          <input
  value={order?.client_name || ""}
  readOnly
  className="
    w-full
    border
    rounded-xl
    px-4 py-3
    bg-slate-50
  "
/>
        </div>

        <div>
          <label className="block text-sm mb-2">
            Size
          </label>

          <input
  value={size}
  onChange={(e) => setSize(e.target.value)}
  placeholder="Enter Size"
  className="w-full border rounded-xl px-4 py-3"
/>
        </div>

        <div>
          <label className="block text-sm mb-2">
            Pieces (Input)
          </label>

          <input
  value={process2Input}
  readOnly
  className="
    w-full
    border
    border-blue-300
    rounded-xl
    px-4 py-3
    bg-blue-50
  "
/>
        </div>

        <div>
          <label className="block text-sm mb-2">
            Rejection
          </label>

          <input
  type="number"
  value={process2Rejection}
  onChange={(e) =>
    setProcess2Rejection(Number(e.target.value))
  }
  className="
    w-full
    border
    border-red-300
    bg-red-50
    rounded-xl
    px-4 py-3
  "
/>
        </div>

        <div>
          <label className="block text-sm mb-2">
            Extra
          </label>

          <input
  type="number"
  value={process2Extra}
  onChange={(e) =>
    setProcess2Extra(Number(e.target.value))
  }
  className="
    w-full
    border
    border-orange-300
    bg-orange-50
    rounded-xl
    px-4 py-3
  "
/>
        </div>

        <div>
          <label className="block text-sm mb-2 text-green-600">
            Output To Next Process
          </label>

          <input
  value={process2Output}
  readOnly
  className="
    w-full
    border
    border-green-300
    bg-green-50
    rounded-xl
    px-4 py-3
  "
/>
        </div>

      </div>

    </div>

  </div>

  <div className="border-t border-slate-200 my-8"></div>

<div className="flex gap-6">

  {/* Timeline */}

  <div className="flex flex-col items-center">

    <div
      className="
        w-12 h-12
        rounded-full
        bg-violet-500
        text-white
        flex items-center justify-center
        font-bold text-xl
      "
    >
      3
    </div>

    <div className="w-[2px] h-32 bg-slate-300 mt-2"></div>

  </div>

  {/* Process 3 */}

  <div className="flex-1">

    <span
      className="
        inline-block
        px-3 py-1
        rounded-md
        text-xs font-semibold
        bg-violet-500
        text-white
        mb-4
      "
    >
      PROCESS 3
    </span>

    <div className="grid grid-cols-10 gap-4 items-end">

      {/* Process Name */}

      <div>
        <label className="block text-sm mb-2">
          Process Name
        </label>

       <input
  value={process3Name}
  onChange={(e) => setProcess3Name(e.target.value)}
  className="w-full border rounded-xl px-4 py-3"
/>
      </div>

      {/* Party */}

      <div>
        <label className="block text-sm mb-2">
          Party Name
        </label>

        <input
  value={order?.client_name || ""}
  readOnly
  className="
    w-full
    border
    rounded-xl
    px-4 py-3
    bg-slate-50
  "
/>
      </div>

      {/* Size */}

      <div>
        <label className="block text-sm mb-2">
          Size
        </label>

        <input
  value={size}
  readOnly
  className="w-full border rounded-xl px-4 py-3 bg-slate-50"
/>
      </div>

      {/* Pieces */}

      <div>
        <label className="block text-sm mb-2">
          Pieces (Input)
        </label>

        <input
          value={process3Input}
          readOnly
          className="
            w-full
            border
            border-blue-300
            rounded-xl
            px-4 py-3
          "
        />
      </div>

      {/* Cutting Auto */}

      <div>
        <label className="block text-sm mb-2">
          Cutting (Auto)
        </label>

        <input
          value={process3Cutting}
          readOnly
          className="w-full border rounded-xl px-4 py-3"
        />
      </div>

      {/* Hole */}

      <div>
        <label className="block text-sm mb-2">
          Hole (Per Pc)
        </label>

        <input
          value={process3Hole}
          onChange={(e) =>
            setProcess3Hole(Number(e.target.value))
          }
          className="w-full border rounded-xl px-4 py-3"
        />
      </div>

      {/* Rate */}

      <div>
        <label className="block text-sm mb-2">
          Rate (Per Cutting)
        </label>

       <input
  type="number"
  value={process3Rate}
  onChange={(e) =>
    setProcess3Rate(Number(e.target.value))
  }
  className="w-full border rounded-xl px-4 py-3"
/>
      </div>

      {/* Rejection */}

      <div>
        <label className="block text-sm mb-2">
          Rejection
        </label>

        <input
          value={process3Rejection}
onChange={(e) =>
  setProcess3Rejection(Number(e.target.value))
}
          className="
            w-full
            border
            border-red-300
            bg-red-50
            rounded-xl
            px-4 py-3
          "
        />
      </div>

      {/* Extra */}

      <div>
        <label className="block text-sm mb-2">
          Extra (Inventory)
        </label>

        <input
          value={process3Extra}
onChange={(e) =>
  setProcess3Extra(Number(e.target.value))
}
          className="
            w-full
            border
            border-orange-300
            bg-orange-50
            rounded-xl
            px-4 py-3
          "
        />
      </div>

      {/* Output */}

<div>
  <label className="block text-sm mb-2 text-green-600">
    Output To Next Process
  </label>

  <input
    value={process3Output}
    readOnly
    className="
      w-full
      border
      border-green-300
      bg-green-50
      rounded-xl
      px-4 py-3
    "
  />
</div>

    </div>
  </div>

</div>

<div className="border-t border-slate-200 my-8"></div>

<div className="flex gap-6">

  {/* Timeline */}

  <div className="flex flex-col items-center">

    <div
      className="
        w-12 h-12
        rounded-full
        bg-pink-500
        text-white
        flex items-center justify-center
        font-bold text-xl
      "
    >
      4
    </div>

    <div className="w-[2px] h-32 bg-slate-300 mt-2"></div>

  </div>

  {/* Process 4 */}

  <div className="flex-1">

    <span
      className="
        inline-block
        px-3 py-1
        rounded-md
        text-xs font-semibold
        bg-pink-500
        text-white
        mb-4
      "
    >
      PROCESS 4
    </span>

    <div className="grid grid-cols-10 gap-4 items-end">

      <div>
        <label className="block text-sm mb-2">
          Process Name
        </label>

        <input
  value={process4Name}
  onChange={(e) => setProcess4Name(e.target.value)}
  className="w-full border rounded-xl px-4 py-3"
/>
      </div>

      <div>
        <label className="block text-sm mb-2">
          Party Name
        </label>

        <input
  value={order?.client_name || ""}
  readOnly
  className="
    w-full
    border
    rounded-xl
    px-4 py-3
    bg-slate-50
  "
/>
      </div>

      <div>
        <label className="block text-sm mb-2">
          Size
        </label>

        <input
  value={size}
  readOnly
  className="w-full border rounded-xl px-4 py-3 bg-slate-50"
/>
      </div>

      <div>
        <label className="block text-sm mb-2">
          Pieces (Input)
        </label>

        <input
          value={process4Input}
          readOnly
          className="
            w-full
            border
            border-blue-300
            rounded-xl
            px-4 py-3
          "
        />
      </div>

      <div>
  <label className="block text-sm mb-2">
    Finishing
  </label>

 <input
  value={process4Finishing}
  onChange={(e) =>
    setProcess4Finishing(e.target.value)
  }
  placeholder="Enter Finishing"
  className="w-full border rounded-xl px-4 py-3"
/>

  
</div>

      <div>
        <label className="block text-sm mb-2">
          Rate / Pc
        </label>

        <input
          value={process4Rate}
onChange={(e) =>
  setProcess4Rate(Number(e.target.value))
}
          className="w-full border rounded-xl px-4 py-3"
        />
      </div>

      <div>
        <label className="block text-sm mb-2">
          Total Cost
        </label>

        <input
          value={process4TotalCost}
          readOnly
          className="w-full border rounded-xl px-4 py-3"
        />
      </div>

      <div>
        <label className="block text-sm mb-2">
          Rejection
        </label>

        <input
          value={process4Rejection}
onChange={(e) =>
  setProcess4Rejection(Number(e.target.value))
}
          className="
            w-full
            border
            border-red-300
            bg-red-50
            rounded-xl
            px-4 py-3
          "
        />
      </div>

      <div>
        <label className="block text-sm mb-2">
          Extra (Inventory)
        </label>

        <input
          value={process4Extra}
onChange={(e) =>
  setProcess4Extra(Number(e.target.value))
}
          className="
            w-full
            border
            border-orange-300
            bg-orange-50
            rounded-xl
            px-4 py-3
          "
        />
      </div>

      <div>
        <label className="block text-sm mb-2 text-green-600">
          Output To Next Process
        </label>

        <input
          value={process4Output}
          readOnly
          className="
            w-full
            border
            border-green-300
            bg-green-50
            rounded-xl
            px-4 py-3
          "
        />
      </div>

    </div>

  </div>

</div>

<div className="border-t border-slate-200 my-8"></div>

<div className="flex gap-6">

  <div className="flex flex-col items-center">

    <div
      className="
        w-12 h-12
        rounded-full
        bg-indigo-500
        text-white
        flex items-center justify-center
        font-bold text-xl
      "
    >
      5
    </div>

  </div>

  <div className="flex-1">

    <span
      className="
        inline-block
        px-3 py-1
        rounded-md
        text-xs font-semibold
        bg-indigo-500
        text-white
        mb-4
      "
    >
      PROCESS 5
    </span>

    <div className="grid grid-cols-8 gap-4 items-end">

  <div>
    <label className="block text-sm mb-2">
      Process Name
    </label>

    <input
  value={process5Name}
  onChange={(e) => setProcess5Name(e.target.value)}
  className="w-full border rounded-xl px-4 py-3"
/>
  </div>

  <div>
    <label className="block text-sm mb-2">
      Party Name
    </label>

    <input
  value={order?.client_name || ""}
  readOnly
  className="
    w-full
    border
    rounded-xl
    px-4 py-3
    bg-slate-50
  "
/>
  </div>

  <div>
    <label className="block text-sm mb-2">
      Size
    </label>

    <input
  value={size}
  readOnly
  className="w-full border rounded-xl px-4 py-3 bg-slate-50"
/>
  </div>

  <div>
    <label className="block text-sm mb-2">
      Input Qty
    </label>

    <input
      value={process5Input}
      readOnly
      className="
        w-full
        border
        border-blue-300
        bg-blue-50
        rounded-xl
        px-4 py-3
      "
    />
  </div>

  <div>
    <label className="block text-sm mb-2">
      Pieces Per Box
    </label>

    <input
      value={piecesPerBox}
onChange={(e) =>
  setPiecesPerBox(Number(e.target.value))
}
      className="
        w-full
        border
        rounded-xl
        px-4 py-3
      "
    />
  </div>

  <div className="flex justify-center items-center text-3xl font-bold">
    =
  </div>

  <div className="col-span-2">
    <label className="block text-sm mb-2 text-green-600 font-semibold">
      Total Boxes
    </label>

    <input
      value={totalBoxes}
      readOnly
      className="
        w-full
        border
        border-green-300
        bg-green-50
        rounded-xl
        px-4 py-3
        font-bold
        text-green-700
      "
    />
  </div>

</div>

  </div>

</div>


</SectionCard>

<SectionCard>

  <div className="grid grid-cols-3 gap-8">

    {/* Total Extra */}

    <div className="flex items-center gap-4">

      <Package size={32} className="text-green-600" />

      <div>
        <p className="text-sm text-slate-500">
          Total Added To Inventory (Extra)
        </p>

        <h2 className="text-3xl font-bold">
         {totalExtra}  <span className="text-lg font-normal">Pcs</span>
        </h2>
      </div>

    </div>

    {/* Rejection */}

    <div className="flex items-center gap-4">

      <Trash2 size={32} className="text-red-600" />

      <div>
        <p className="text-sm text-slate-500">
          Total Rejection (Scrap)
        </p>

        <h2 className="text-3xl font-bold">
          {totalRejection} <span className="text-lg font-normal">Pcs</span>
        </h2>
      </div>

    </div>

    {/* Final Output */}

    <div className="flex items-center gap-4">

     <Archive size={32} className="text-blue-600" />

      <div>
        <p className="text-sm text-slate-500">
          Final Output (Boxes)
        </p>

        <h2 className="text-3xl font-bold">
          {totalBoxes}<span className="text-lg font-normal">Box</span>
        </h2>
      </div>

    </div>

  </div>

</SectionCard>

      
    </>
  );
}

export default Process;