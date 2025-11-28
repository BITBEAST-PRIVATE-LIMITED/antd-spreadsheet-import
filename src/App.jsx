import { useState } from "react";
import ExcelImportModal from "./components/ExcelImportModal";
import { Button } from "antd";

function App() {
  const [open, setOpen] = useState(false);
  const fields = [
    {
      label: "Name",
      key: "name",
      alternateMatches: ["full name", "name", "instance name"],
      validations: [
        {
          rule: "required",
          errorMessage: "Name is required",
        },
      ],
    },
    {
      label: "Email",
      key: "email",
      alternateMatches: ["mail", "email address", "email"],
      validations: [
        {
          rule: "required",
          errorMessage: "Email is required",
        },
      ],
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
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
          fields={fields}
          modalWidth={800}
          tableSize={"middle"}
          translations={{
            title: "Upload Excel",
            uploadFileText: "Upload File",
            reupload: "Reupload",
            sheetDropdownLabel: "Sheet",
            sheetsText: "Sheets",
            rowsFoundText: "Rows",
            uploadingText: "Uploading",
            tab: {
              upload: "Upload",
              preview: "Preview",
            },
            mappingAlertText: {
              heading: "Not all columns mapped",
              message: "There are required columns that are not mapped yet.",
              notMappedText: "Columns not mapped:",
            },
            buttons: {
              cancel: "Cancel",
              import: "Import",
              back: "Back",
              next: "Next",
            },
            columns: {
              tableColumn: "Table Columns",
              mapField: "Mapping To",
              columns: "Columns",
            },
            table: {
              title: "Mapped Data",
              sn: "SN",
            },
            dropdownPlaceholder: {
              selectField: "Select Field",
            },
            alerts: {
              noRows: "No rows found in this sheet",
              noMappingFound: "No Column Mapping Found",
              noSheet: "No Sheet Found",
            },
          }}
        />

        // <ExcelImportModal
        //   open={open}
        //   fields={fields}
        //   onClose={() => setOpen(false)}
        //   onSubmit={(validData) => {
        //     console.log("Imported data:", validData);
        //     // validData: array of row objects from the import component
        //     const prepared = (Array.isArray(validData) ? validData : []).map(
        //       (x, i) => ({
        //         id: x.id ?? i,
        //         key: x.key ?? i,
        //         filter: false,
        //         is_valid: false,
        //         ...x,
        //       })
        //     );
        //     // setContact(checkValidNumbers(prepared));
        //     setOpen(false);
        //   }}
        // />
      )}
    </>
  );
}

export default App;
