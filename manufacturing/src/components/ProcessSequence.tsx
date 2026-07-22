import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus } from "lucide-react";
import FormSelect from "./FormSelect";

interface ProcessStep {
  id: string;
  processName: string;
  partyName: string;
}

interface ProcessSequenceProps {
  processes: ProcessStep[];
  setProcesses: (processes: ProcessStep[]) => void;
  availableProcesses: string[];
  availableParties: string[];
  onAddProcess?: (processName: string) => void;
  onAddParty?: (partyName: string) => void;
}

function SortableProcessStep({
  step,
  onPartyChange,
  onRemove,
  availableParties,
  onAddParty,
}: {
  step: ProcessStep;
  onPartyChange: (partyName: string) => void;
  onRemove: () => void;
  availableParties: string[];
  onAddParty?: (partyName: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-400 hover:text-slate-600"
      >
        <GripVertical size={20} />
      </button>

      <div className="flex-1">
        <div className="font-medium text-slate-700">{step.processName}</div>
      </div>

      <div className="w-48">
        <FormSelect
          label=""
          value={step.partyName}
          onChange={(value) => onPartyChange(value)}
          options={availableParties}
          onAddOption={(newParty) => {
            if (onAddParty) {
              onAddParty(newParty);
            }
          }}
          placeholder="Select Party"
        />
      </div>

      <button
        onClick={onRemove}
        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
        title="Remove process"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

function ProcessSequence({
  processes,
  setProcesses,
  availableProcesses,
  availableParties,
  onAddProcess,
  onAddParty,
}: ProcessSequenceProps) {
  const [showAddProcess, setShowAddProcess] = useState(false);
  const [newProcessName, setNewProcessName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = processes.findIndex((p) => p.id === active.id);
      const newIndex = processes.findIndex((p) => p.id === over.id);

      setProcesses(arrayMove(processes, oldIndex, newIndex));
    }
  };

  const handleAddProcess = () => {
    if (newProcessName.trim()) {
      const newStep: ProcessStep = {
        id: `process-${Date.now()}`,
        processName: newProcessName.trim(),
        partyName: "",
      };

      setProcesses([...processes, newStep]);
      
      if (onAddProcess && !availableProcesses.includes(newProcessName.trim())) {
        onAddProcess(newProcessName.trim());
      }

      setNewProcessName("");
      setShowAddProcess(false);
    }
  };

  const handleRemoveProcess = (id: string) => {
    setProcesses(processes.filter((p) => p.id !== id));
  };

  const handlePartyChange = (id: string, partyName: string) => {
    setProcesses(
      processes.map((p) => (p.id === id ? { ...p, partyName } : p))
    );
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Process Sequence
      </h3>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={processes}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {processes.map((step) => (
              <SortableProcessStep
                key={step.id}
                step={step}
                onPartyChange={(partyName) => handlePartyChange(step.id, partyName)}
                onRemove={() => handleRemoveProcess(step.id)}
                availableParties={availableParties}
                onAddParty={onAddParty}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {showAddProcess && (
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <input
            type="text"
            placeholder="Enter process name"
            value={newProcessName}
            onChange={(e) => setNewProcessName(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2 mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddProcess}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700"
            >
              Add Process
            </button>
            <button
              onClick={() => setShowAddProcess(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showAddProcess && (
        <button
          onClick={() => setShowAddProcess(true)}
          className="mt-4 flex items-center gap-2 text-blue-600 text-sm hover:underline"
        >
          <Plus size={16} />
          Add Process Step
        </button>
      )}
    </div>
  );
}

export default ProcessSequence;
