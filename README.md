# antd-spreadsheet-import

A lightweight React component for importing and mapping Excel/CSV files with ease. Built with **Ant Design** and **SheetJS**, it provides a multi-step modal interface to upload, select sheets, map columns, and preview data before final import.

## ✨ Features

- ✅ Upload Excel (.xlsx) and CSV files
- ✅ Select sheets from workbooks
- ✅ Auto-detect and map columns to fields
- ✅ Support for required and custom fields
- ✅ Alternate column name matching (e.g., "mail" matches "email")
- ✅ Real-time data preview with pagination
- ✅ Multi-step modal workflow (Upload → Preview)
- ✅ Built with Ant Design for polished UI
- ✅ Fully customizable field mappings
- ✅ i18n support (internationalization ready)

## 📦 Installation

### npm

```bash
npm install antd-spreadsheet-import
```

### yarn

```bash
yarn add antd-spreadsheet-import
```

### pnpm

```bash
pnpm add antd-spreadsheet-import
```

## 🚀 Quick Start

```jsx
import { useState } from "react";
import { ExcelImporter } from "antd-spreadsheet-import";
import { Button } from "antd";

function App() {
  const [open, setOpen] = useState(false);

  const fields = [
    {
      label: "Name",
      key: "name",
      alternateMatches: ["full name", "first name"],
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
      alternateMatches: ["mail", "email address"],
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
      alternateMatches: ["mobile", "contact number"],
    },
  ];

  const handleSubmit = async (contacts) => {
    console.log("Imported contacts:", contacts);
    // Send to your API or database
    return { success: true, message: "Data imported successfully" };
  };

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Import Excel
      </Button>

      {open && (
        <ExcelImporter
          isOpen={open}
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
              notMappedText: "Columns not mapped",
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
      )}
    </>
  );
}

export default App;
```

## 📚 API Documentation

### `<ExcelImporter />` Props

| Prop           | Type                                  | Required | Description                            |
| -------------- | ------------------------------------- | -------- | -------------------------------------- |
| `isOpen`       | `boolean`                             | ✅       | Controls modal visibility              |
| `onClose`      | `() => void`                          | ✅       | Callback when user closes modal        |
| `onSubmit`     | `(data: object[]) => void \| Promise` | ✅       | Callback with imported/formatted data  |
| `fields`       | `Field[]`                             | ✅       | Required fields for mapping            |
| `translations` | `Translations`                        | ❌       | i18n translation object for UI text    |
| `modalWidth`   | `number`                              | ❌       | Modal width in pixels                  |
| `tableSize`    | `"small" \| "middle" \| "large"`      | ❌       | Table size variant (default: "middle") |
