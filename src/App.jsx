import { useState } from "react";
import ExcelImportModal from "./components/ExcelImportModal";
import { Button } from "antd";

function App() {
  const [open, setOpen] = useState(false);
  const fields = [
    {
      label: "Name",
      key: "name",
      alternateMatches: ["full name","name", "instance name"],
    },
    
    {
      label: "Email",
      key: "email",
      alternateMatches: ["mail", "email address", "email"],
    },
    {
      label: "Phone",
      key: "phone",
      alternateMatches: ["mobile", "contact"],
    },
  ];

  const handleSubmit = async (contacts) => {
    console.log("📌 Final Imported Contacts:", contacts);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} type="primary">
        Upload
      </Button>

      {open && (
        <ExcelImportModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
          fields={fields}
          customFields={customFields}
        />
      )}
    </>
  );
}

export default App;
