import PageHeader from "@/components/PageHeader";
import StatsCard from "@/components/StatsCard";
import { Users, ClipboardList, Truck, Clock } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import PrimaryButton from "@/components/PrimaryButton";
import StatusBadge from "@/components/StatusBadge";
import SectionCard from "@/components/SectionCard";
import { useState, useEffect } from "react";
import api from "@/api/api";


const initialParties = [];



function Party() {

const [showForm, setShowForm] =
  useState(false);

  const [editIndex, setEditIndex] =
  useState(null);

  const [showView, setShowView] =
  useState(false);

const [selectedParty, setSelectedParty] =
  useState(null);

 const [newParty, setNewParty] =
  useState({
    name: "",
    processType: "",
    order: "",
    quantity: "",
    size: "",
    process: "",
    status: "Active",
  });

  const [searchTerm, setSearchTerm] = useState("");

const [partyList, setPartyList] = useState([]);



// Naya function jo data fetch karega
const fetchParties = async () => {
  try {
    const response = await api.get("/parties");
    console.log("Parties API:", response.data);
    // Swagger response me array 'data' property ke andar hai
    if (response.data && response.data.success) {
      const mappedData = response.data.data.map((item) => ({
        id: item.id,
        name: item.party_name || "",
        processType: item.process_type || "",
        order: item.current_order || "",
        process: item.current_process || "",
        quantity: item.quantity_pcs || 0,
        size: item.size || "",
        status: item.status || "active",
      }));
      setPartyList(mappedData);
    }
  } catch (error) {
    console.error("Error fetching parties:", error);
  }
};

// Component load hote hi automatic chalne ke liye
useEffect(() => {
  fetchParties();
}, []);

const sameOrderParties =
  partyList.filter(
    (p) => p.order === newParty.order
  );

const nextProcess =
  sameOrderParties.length + 1;

const handleSaveParty = async () => {

 if (
  !newParty.name ||
  !newParty.processType ||
  !newParty.order ||
  !newParty.quantity ||
  !newParty.size
) {
  alert("Please fill all fields");
  return;
}


const payload = {
  party_name: newParty.name,
  process_type: newParty.processType,
  current_order: newParty.order,
  current_process: `Process ${nextProcess}`,
  quantity_pcs: Number(newParty.quantity),
  status: "active",
  size: newParty.size,
};

console.log("Payload:", payload);


 const response = await api.post(
  "/parties",
  payload
);

console.log(
  "Party Saved",
  response.data
);

alert("Party Saved Successfully");

  setNewParty({
    name: "",
    processType: "",
    order: "",
    quantity: "",
    size: "",
    status: "Active",
  });

  setShowForm(false);
  fetchParties();
};

const totalParties = partyList.length;


const activeParties = partyList.filter(
  (party) => party.status?.toLowerCase() === "active"
).length;

  

const inactiveParties =
  partyList.filter(
    (party) => party.status === "Inactive"
  ).length;

const partiesInProcess =
  partyList.filter(
    (party) => party.process
  ).length;

const filteredParties = partyList.filter((party) =>
  party.name
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
);


  return <>
        <PageHeader
  title="Party"
  subtitle="Manage parties and their process details"
  icon={Users}
/>
    <div className="grid grid-cols-4 gap-4 mt-6">
  <StatsCard
  title="Total Parties"
  value={totalParties}
  subtitle="All Registered"
  icon={Users}
  bgColor="bg-blue-100"
  iconColor="text-blue-600"
/>

<StatsCard
  title="Active Parties"
  value={activeParties}
  subtitle="Currently Active"
  icon={ClipboardList}
  bgColor="bg-blue-100"
  iconColor="text-blue-600"
/>

<StatsCard
  title="Parties in Process"
  value={partiesInProcess}
  subtitle="Currently Handling Orders"
  icon={Truck}
  bgColor="bg-green-100"
  iconColor="text-green-600"
/>

<StatsCard
  title="Inactive Parties"
  value={inactiveParties}
  subtitle="Not Active"
  icon={Clock}
  bgColor="bg-orange-100"
  iconColor="text-orange-500"
/>
</div>

{showView && selectedParty && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-2xl p-6 w-[600px]">

      <div className="flex justify-between items-center mb-5">

        <h2 className="text-xl font-semibold">
          Party Details
        </h2>

        <button
          onClick={() => setShowView(false)}
          className="px-4 py-2 border rounded-xl"
        >
          Close
        </button>

      </div>

      <div className="grid grid-cols-2 gap-4">

        <div>
          <strong>Party Name:</strong>
          {" "}
          {selectedParty.name}
        </div>

        <div>
          <strong>Process Type:</strong>
          {" "}
          {selectedParty.processType}
        </div>

        <div>
          <strong>Order No:</strong>
          {" "}
          {selectedParty.order}
        </div>

        <div>
          <strong>Current Process:</strong>
          {" "}
          {selectedParty.process}
        </div>

        <div>
          <strong>Quantity:</strong>
          {" "}
          {selectedParty.quantity}
        </div>

        <div>
          <strong>Size:</strong>
          {" "}
          {selectedParty.size}
        </div>

        <div>
          <strong>Status:</strong>
          {" "}
          {selectedParty.status}
        </div>

      </div>

    </div>

  </div>
)}

{showForm && (
  <SectionCard>

    <h2 className="text-xl font-semibold mb-5">
      Add New Party
    </h2>

    <div className="grid grid-cols-2 gap-4">

      <input
        type="text"
        placeholder="Party Name"
        value={newParty.name}
        onChange={(e) =>
          setNewParty({
            ...newParty,
            name: e.target.value,
          })
        }
        className="border rounded-xl px-4 py-3"
      />

      


<input
  type="text"
  placeholder="Process Type"
  value={newParty.processType}
  onChange={(e) =>
    setNewParty({
      ...newParty,
      processType: e.target.value,
    })
  }
  className="border rounded-xl px-4 py-3"
/>


      <input
        type="text"
        placeholder="Order No"
        value={newParty.order}
        onChange={(e) =>
          setNewParty({
            ...newParty,
            order: e.target.value,
          })
        }
        className="border rounded-xl px-4 py-3"
      />

      <input
        type="text"
        placeholder="Quantity"
        value={newParty.quantity}
        onChange={(e) =>
          setNewParty({
            ...newParty,
            quantity: e.target.value,
          })
        }
        className="border rounded-xl px-4 py-3"
      />

      <input
        type="text"
        placeholder="Size"
        value={newParty.size}
        onChange={(e) =>
          setNewParty({
            ...newParty,
            size: e.target.value,
          })
        }
        className="border rounded-xl px-4 py-3"
      />

     

      <div className="col-span-2 flex justify-end gap-3">

  <button
    onClick={() => setShowForm(false)}
    className="px-5 py-2 border rounded-xl"
  >
    Cancel
  </button>

  <button
    onClick={handleSaveParty}
    className="px-5 py-2 bg-blue-600 text-white rounded-xl"
  >
    Save Party
  </button>

</div>

    </div>

  </SectionCard>
)}


<SectionCard>
   <div className="flex items-center justify-between mb-6">

  <h2 className="text-xl font-semibold">
    Party List
  </h2>

  <div className="flex items-center gap-2">
    <SearchBar
  value={searchTerm}
  onChange={(e) =>
    setSearchTerm(e.target.value)
  }
/>
    <div
  onClick={() =>
    setShowForm(true)
  }
>
  <PrimaryButton text="Add New Party" />
</div>
  </div>

</div>

<div className="bg-slate-50 rounded-xl px-2 py-4 text-sm font-semibold text-slate-600">

  <div className="grid grid-cols-9 gap-4">
    <div>Party ID</div>
    <div>Party Name</div>
    <div>Process Type</div>
    <div>Current Order</div>
    <div>Current Process</div>
    <div>Quantity</div>
    <div>Size</div>
    <div>Status</div>
    <div>Actions</div>
  </div>

</div>

{filteredParties.map((party, index) => (
<div className="grid grid-cols-9 gap-4 px-3 py-5 border-b border-slate-100 items-center text-sm">

  <div>{party.id}</div>

  <div>{party.name}</div>

  <div>{party.processType}</div>

  <div>{party.order}</div>

  <div>
    <StatusBadge
  text={party.process}
  color="green"
/>
  </div>

  <div>{party.quantity}</div>

  <div>{party.size}</div>

  <div>
    <StatusBadge
  text={party.status}
  color="green"
/>
  </div>

  <div className="flex gap-3">
   <button
  onClick={() => {
    setSelectedParty(party);
    setShowView(true);
  }}
  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"
>
  👁️
</button>

    <button
  onClick={() => {
    setNewParty(party);
    setEditIndex(index);
    setShowForm(true);
  }}
  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"
>
  ✏️
</button>
  </div>

</div>

))}

</SectionCard>
  </>
 
}

export default Party;