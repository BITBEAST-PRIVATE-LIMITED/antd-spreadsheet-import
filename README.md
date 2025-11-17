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
import ExcelImportModal from "antd-spreadsheet-import";
import { Button } from "antd";

function App() {
  const [open, setOpen] = useState(false);

  const fields = [
    {
      label: "Name",
      key: "name",
      alternateMatches: ["full name", "first name"],
    },
    {
      label: "Email",
      key: "email",
      alternateMatches: ["mail", "email address"],
    },
    {
      label: "Phone",
      key: "phone",
      alternateMatches: ["mobile", "contact number"],
    },
  ];

  const customFields = [
    {
      label: "Company",
      id: "company",
      alternateMatches: ["organization", "business"],
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
```

## 📚 API Documentation

### `<ExcelImportModal />` Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✅ | Controls modal visibility |
| `onClose` | `() => void` | ✅ | Callback when user closes modal |
| `onSubmit` | `(data: object[]) => void \| Promise` | ✅ | Callback with imported/formatted data |
| `fields` | `Field[]` | ✅ | Required fields for mapping |
| `customFields` | `CustomField[]` | ❌ | Additional custom fields (optional) |
