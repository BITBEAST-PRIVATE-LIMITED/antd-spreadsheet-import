import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Flex,
  Modal,
  Row,
  Space,
  Upload,
  Image,
  Tag,
  Typography,
  Input,
  Select,
  Table,
  message,
  Form,
  Divider,
} from "antd";
import {
  CloseOutlined,
  LoadingOutlined,
  UploadOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useToast } from "../hooks/useToastMessage";

const { Dragger } = Upload;
const { Text } = Typography;

const ExcelImportModal = ({
  open,
  setOpen,
  requiredFields,
  customFields,
  loadGroups,
  createGroup,
  onImport,
  formatContactData,
  getData,
  labels = {
    importTitle: "Import Excel",
    uploadFile: "Upload Excel File",
    uploading: "Uploading...",
    selectSheet: "Select Sheet",
    columnsTypes: "Column Mapping",
    importedColumns: "Imported Columns",
    groups: "Groups",
    addGroup: "Add Group",
    selectGroups: "Select Groups",
    next: "Next",
    back: "Back",
    cancel: "Cancel",
    import: "Import",
    saveContacts: "Save Contacts",
    upload: "Upload",
    sheets: "Sheets",
    columns: "Columns",
    noContactsToImport: "No contacts to import",
    requiredFieldMissing: (field) => `Please map required field: ${field}`,
  },
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [excelFileName, setExcelFileName] = useState("");
  const [sheetNames, setSheetNames] = useState([]);
  const [currentSheetName, setCurrentSheetName] = useState("");
  const [workbook, setWorkbook] = useState(null);

  const [excelData, setExcelData] = useState([]);
  const [columnMappings, setColumnMappings] = useState({});
  const [convertedData, setConvertedData] = useState([]);

  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const [step, setStep] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { showSuccess, showError, showWarning } = useToast();

  const [form] = Form.useForm();
  const handleFileUpload = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: "binary" });
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);

      const sheetName = wb.SheetNames[0];
      setCurrentSheetName(sheetName);

      const sheet = wb.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);
      setExcelData(json);
    };

    reader.readAsBinaryString(file);
    setExcelFileName(file.name);
    return false;
  };

  if (open) {
    if (typeof setOpen !== "function")
      throw new Error("Prop 'setOpen' is required and must be a function");
    if (!Array.isArray(requiredFields))
      throw new Error("Prop 'requiredFields' must be an array");
    if (!Array.isArray(customFields))
      throw new Error("Prop 'customFields' must be an array");
    if (typeof loadGroups !== "function")
      throw new Error("Prop 'loadGroups' is required and must be a function");
    if (typeof createGroup !== "function")
      throw new Error("Prop 'createGroup' is required and must be a function");
    if (typeof onImport !== "function")
      throw new Error("Prop 'onImport' is required and must be a function");
    if (typeof formatContactData !== "function")
      throw new Error("Prop 'formatContactData' must be a function");
    if (typeof getData !== "function")
      throw new Error("Prop 'getData' must be a function");
  }

  const resetAll = () => {
    setExcelFileName("");
    setSheetNames([]);
    setExcelData([]);
    setWorkbook(null);
    setColumnMappings({});
    setConvertedData([]);
    setSelectedGroups([]);
    setStep(1);
  };

  const handleSheetChange = (index) => {
    const name = sheetNames[index];
    setCurrentSheetName(name);
    const sheet = workbook.Sheets[name];
    const json = XLSX.utils.sheet_to_json(sheet);
    setExcelData(json);
    setColumnMappings({});
    setConvertedData([]);
  };

  const availableOptions = () => {
    const used = new Set(Object.keys(columnMappings));
    return [
      ...requiredFields,
      ...customFields.map((field) => field.name),
    ].filter((field) => !used.has(field));
  };

  const handleColumnChange = (excelColumn, selectedField) => {
    setColumnMappings((prev) => {
      const next = { ...prev };

      Object.keys(next).forEach((f) => {
        if (next[f] === excelColumn) delete next[f];
      });

      if (selectedField) next[selectedField] = excelColumn;

      return next;
    });
  };

  const generateConvertedData = useCallback(() => {
    if (excelData.length === 0) return;

    const formatted = excelData.map((row, index) => {
      const obj = { id: index + 1 };

      requiredFields.forEach((f) => {
        obj[f] = row[columnMappings[f]];
      });

      customFields.forEach((f) => {
        obj[f?._id] = row[columnMappings[f?.name]];
      });

      return obj;
    });

    setConvertedData(formatted);
  }, [excelData, columnMappings]);

  useEffect(() => {
    if (Object.keys(columnMappings).length) generateConvertedData();
  }, [columnMappings]);

  const validateMapping = () => {
    for (const field of requiredFields) {
      if (!columnMappings[field]) {
        showWarning(labels.requiredFieldMissing(field));
        return false;
      }
    }
    return true;
  };

  const loadAllGroups = async () => {
    if (typeof loadGroups === "function") {
      const data = await loadGroups();
      setGroups(data || []);
    }
  };

  useEffect(() => {
    if (open) loadAllGroups();
  }, [open]);

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      setCreatingGroup(true);
      const newGroup = await createGroup(newGroupName.trim());
      loadAllGroups();
      setNewGroupName("");
    } catch (e) {
      message.error(e.message);
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setBtnLoading(true);

      if (step === 1) {
        if (!validateMapping()) return;
        setStep(2);
        return;
      }

      if (step === 2) {
        if (convertedData.length === 0) {
          message.error(labels.noContactsToImport);
          return;
        }

        const formatted = await Promise.all(
          convertedData.map((row) => formatContactData(row, selectedGroups))
        );

        const data = await onImport(formatted);

        if (data?.status) {
          showSuccess(data?.message);
          setOpen(false);
          resetAll();
          getData();
        } else {
          showError(data?.message);
        }
      }
    } catch (error) {
      console.log(error);
      showError(error.message);
    } finally {
      setBtnLoading(false);
    }
  };

  const tableColumns = [
    {
      title: "SN",
      render: (_, __, idx) => (page - 1) * pageSize + (idx + 1),
    },
    ...requiredFields.map((f) => ({
      title: f,
      dataIndex: f,
    })),
    ...customFields.map((f) => ({
      title: f.label,
      dataIndex: f.id,
    })),
  ];

  const modalFooter = [
    <Button key="1" onClick={() => (step === 1 ? setOpen(false) : setStep(1))}>
      {step === 1 ? labels.cancel : labels.back}
    </Button>,
    <Button
      disabled={!excelFileName ? true : false || btnLoading}
      key="2"
      onClick={handleSubmit}
      type="primary"
      loading={btnLoading}
    >
      {step === 1 ? labels.next : labels.import}
    </Button>,
  ];

  return (
    <Modal
      open={open}
      width={800}
      title={labels.importTitle}
      onCancel={() => {
        resetAll();
        setOpen(false);
      }}
      footer={modalFooter}
    >
      <Row
        justify={"center"}
        align={"middle"}
        style={{ marginBottom: "1.5rem", gap: "1rem" }}
      >
        <Button
          type={step === 1 ? "primary" : "default"}
          shape="round"
          size={"middle"}
          icon={<CheckCircleOutlined />}
        >
          {labels.upload}
        </Button>
        <RightOutlined />
        <Button
          type={step === 2 ? "primary" : "default"}
          shape="round"
          size={"middle"}
          icon={<CheckCircleOutlined />}
          disabled={!excelFileName}
        >
          {labels.saveContacts}
        </Button>
      </Row>

      {step === 1 && (
        <>
          {!excelFileName && (
            <Dragger
              beforeUpload={handleFileUpload}
              showUploadList={false}
              listType="picture-card"
              className="avatar-uploader"
              multiple={false}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            >
              <Card style={{ height: "150px" }}>
                {isUploading ? (
                  <div>
                    <p className="ant-upload-drag-icon">
                      <LoadingOutlined />
                    </p>
                    <p className="ant-upload-text"> {labels.uploading} </p>
                  </div>
                ) : (
                  <div>
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined />
                    </p>
                    <p className="ant-upload-text">{labels.uploadFile}</p>
                  </div>
                )}
              </Card>
            </Dragger>
          )}

          {excelFileName && (
            <>
              <Card>
                <Flex justify="space-between">
                  <Space>
                    <Image src="/excel.svg" preview={false} width={40} />
                    <div>
                      <Text
                        type="secondary"
                        style={{ fontSize: "14px", display: "block" }}
                      >
                        {excelFileName}
                      </Text>
                      <Tag style={{ fontSize: "11px" }}>
                        {sheetNames?.length} {"sheets"}
                      </Tag>
                    </div>
                  </Space>

                  <Select
                    value={currentSheetName}
                    style={{ width: 200 }}
                    options={sheetNames.map((n, i) => ({ label: n, value: i }))}
                    onChange={handleSheetChange}
                  />
                </Flex>

                <Button
                  type="primary"
                  danger
                  icon={<CloseOutlined />}
                  size="small"
                  style={{ position: "absolute", right: 10, top: 10 }}
                  onClick={resetAll}
                />
              </Card>

              <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                <Col span={12}>
                  <Text strong>
                    {labels.importedColumns}
                    <Tag>
                      {Object.keys(excelData[0] || {}).length} {labels.columns}
                    </Tag>
                  </Text>
                </Col>

                <Col span={12}>
                  <Text strong>{labels.columnsTypes}</Text>
                </Col>
              </Row>

              <div style={{ maxHeight: 250, overflow: "auto", marginTop: 10 }}>
                {(excelData[0] ? Object.keys(excelData[0]) : []).map((col) => (
                  <Row key={col} style={{ marginBottom: 10 }}>
                    <Space.Compact style={{ width: "100%" }}>
                      <Input readOnly value={col} />
                      <Select
                        allowClear
                        placeholder="Select Field"
                        style={{ width: "100%" }}
                        value={Object.keys(columnMappings).find(
                          (f) => columnMappings[f] === col
                        )}
                        onChange={(value) => handleColumnChange(col, value)}
                        options={availableOptions().map((f) => ({
                          label: f,
                          value: f,
                        }))}
                      />
                    </Space.Compact>
                  </Row>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <Form layout="vertical" form={form}>
            <Form.Item label={labels.groups}>
              <Select
                mode="multiple"
                value={selectedGroups}
                onChange={setSelectedGroups}
                placeholder={labels.selectGroups}
                options={groups?.map((g) => ({
                  label: g?.name,
                  value: g?._id,
                }))}
                popupRender={(menu) => (
                  <>
                    {menu}
                    <Divider />
                    <Space.Compact style={{ width: "100%" }}>
                      <Input
                        placeholder="Enter group name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                      />
                      <Button
                        type="primary"
                        loading={creatingGroup}
                        icon={<PlusOutlined />}
                        onClick={handleAddGroup}
                      >
                        {labels.addGroup}
                      </Button>
                    </Space.Compact>
                  </>
                )}
              />
            </Form.Item>
          </Form>

          <Table
            rowKey="id"
            columns={tableColumns}
            dataSource={convertedData}
            pagination={{
              current: page,
              pageSize,
              total: convertedData.length,
              showSizeChanger: true,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
            }}
          />
        </>
      )}
    </Modal>
  );
};

export default ExcelImportModal;
