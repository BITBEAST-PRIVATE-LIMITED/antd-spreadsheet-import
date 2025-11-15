import { useState } from "react";
import ExcelImportModal from "./components/ExcelImportModal";
import { Button } from "antd";

function App() {
  const [open, setOpen] = useState(false);

  // Required fields to show in mapping UI
  const requiredFields = ["name", "email", "phone"];

  // Custom fields (dynamic)
  const customFields = [
    { id: "city", label: "City" },
    { id: "company", label: "Company" },
  ];

  // Fake API: load groups
  const loadGroups = async () => {
    return [
      { id: "g1", name: "Friends" },
      { id: "g2", name: "Family" },
      { id: "g3", name: "Work" },
    ];
  };

  // Fake API: create a new group
  const createGroup = async (name) => {
    return { id: `g_${Date.now()}`, name };
  };

  // Format row before final import
  const formatContactData = async (row) => {
    return {
      name: row.name,
      email: row.email,
      phone: row.phone,
      city: row.city,
      company: row.company,
    };
  };

  // Final callback with imported data
  const onImport = async (contacts, selectedGroups) => {
    console.log("📌 Final Imported Contacts:", contacts);
    console.log("📌 Selected Groups:", selectedGroups);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} type="primary">Upload</Button>

      {open && (
        <ExcelImportModal
          open={open}
          setOpen={setOpen}
          requiredFields={requiredFields}
          customFields={customFields}
          loadGroups={loadGroups}
          createGroup={createGroup}
          formatContactData={formatContactData}
          onImport={onImport}
        />
      )}
    </>
  );
}

export default App;
