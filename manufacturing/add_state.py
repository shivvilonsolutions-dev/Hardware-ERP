file_path = r'C:\Users\Asus\CascadeProjects\Hardware-ERP\manufacturing\src\pages\Process.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

state_code = '''
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processNames, setProcessNames] = useState([
    "Cutting",
    "Polishing",
    "Packaging",
    "Quality Check",
    "Painting",
    "Assembly",
    "Testing",
  ]);
  const [partyNames, setPartyNames] = useState([
    "Party A",
    "Party B",
    "Party C",
    "Party D",
  ]);
  const [productProcessSequence, setProductProcessSequence] = useState([
    { id: "process-1", processName: "Cutting", partyName: "Party A" },
    { id: "process-2", processName: "Polishing", partyName: "Party B" },
    { id: "process-3", processName: "Packaging", partyName: "Party C" },
  ]);
'''

content = content.replace(
    'const [piecesPerBox, setPiecesPerBox] =\n  useState("");',
    'const [piecesPerBox, setPiecesPerBox] =\n  useState("");' + state_code
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("State variables added successfully")
