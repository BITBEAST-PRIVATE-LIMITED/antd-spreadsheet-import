import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Flex,
  Modal,
  Row,
  Space,
  Upload,
  Typography,
  Input,
  Select,
  Table,
  Col,
  Tag,
  Tooltip,
  Alert,
} from "antd";
import {
  CloseOutlined,
  UploadOutlined,
  RightOutlined,
  CheckCircleOutlined,
  FileExcelOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";

const { Dragger } = Upload;
const { Text } = Typography;

const ExcelImportModal = ({
  open,
  onClose,
  onSubmit,
  fields = [],
  translations,
  modalWidth,
  tableSize,
}) => {
  const [excelFileName, setExcelFileName] = useState("");
  const [sheetNames, setSheetNames] = useState([]);
  const [currentSheetName, setCurrentSheetName] = useState("");
  const [workbook, setWorkbook] = useState(null);

  const [excelData, setExcelData] = useState([]);
  const [columnMappings, setColumnMappings] = useState({});
  const [convertedData, setConvertedData] = useState([]);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [mappingError, setMappingError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(1);
  const [btnLoading, setBtnLoading] = useState(false);

  const handleFileUpload = (file) => {
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "binary" });
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);

        const firstSheet = wb.SheetNames[0];
        setCurrentSheetName(firstSheet);

        const sheet = wb.Sheets[firstSheet];
        const json = XLSX.utils.sheet_to_json(sheet);
        setExcelData(json);
      } catch (error) {
        console.error(error);
        setExcelData([]);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
    setExcelFileName(file.name);
    setHasUserInteracted(false);
    return false; // Prevent auto-upload
  };

  const resetAll = () => {
    setExcelFileName("");
    setSheetNames([]);
    setExcelData([]);
    setWorkbook(null);
    setColumnMappings({});
    setConvertedData([]);
    setStep(1);
    setHasUserInteracted(false);
  };

  const handleSheetChange = (index) => {
    const name = sheetNames[index];
    setCurrentSheetName(name);

    const sheet = workbook.Sheets[name];
    const json = XLSX.utils.sheet_to_json(sheet);

    setExcelData(json);
    setColumnMappings({});
    setConvertedData([]);
    setHasUserInteracted(false);
  };

  const generateConvertedData = useCallback(() => {
    if (!excelData?.length) return;

    const formatted = excelData.map((row, i) => {
      const obj = { id: i + 1 };

      Object.keys(columnMappings).forEach((fieldKey) => {
        const excelColumn = columnMappings[fieldKey];
        obj[fieldKey] = row[excelColumn];
      });

      return obj;
    });

    setConvertedData(formatted);
  }, [excelData, columnMappings]);

  useEffect(() => {
    if (Object.keys(columnMappings)?.length) generateConvertedData();
  }, [columnMappings, generateConvertedData]);

  const allFields = [
    ...(fields?.map((f) => ({
      label: f?.label,
      key: f?.key,
      alternateMatches: f?.alternateMatches || [],
    })) || []),
  ];

  useEffect(() => {
    if (!excelData?.length || !allFields?.length || hasUserInteracted) return;
    if (Object.keys(columnMappings).length > 0) return;

    const excelColumns = Object.keys(excelData[0]);
    const initialMapping = {};

    allFields.forEach((field) => {
      const match = excelColumns.find((col) => {
        const clean = (v) => String(v).toLowerCase().trim();
        if (clean(col) === clean(field.label)) return true;
        return field.alternateMatches?.some((alt) => clean(col) === clean(alt));
      });

      if (match) initialMapping[field.key] = match;
    });

    if (Object.keys(initialMapping).length > 0) {
      setColumnMappings(initialMapping);
    }
  }, [excelData, allFields, hasUserInteracted, columnMappings]);

  const handleSubmit = async () => {
    setBtnLoading(true);
    try {
      if (step === 1) {
        const requiredFields = fields.filter((f) =>
          f.validations?.some((v) => v?.rule === "required")
        );
        const missingFields = requiredFields.filter(
          (f) => !columnMappings[f.key]
        );

        if (missingFields?.length > 0) {
          setMappingError(true);
          setBtnLoading(false);
          return;
        }

        setMappingError(false);
        setStep(2);
        setBtnLoading(false);
        return;
      }

      await onSubmit(convertedData);

      resetAll();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleCancel = () => {
    resetAll();
    onClose();
  };

  const modalFooter = [
    <Button key="1" onClick={() => (step === 1 ? handleCancel() : setStep(1))}>
      {step === 1
        ? translations?.buttons?.cancel ?? "Cancel"
        : translations?.buttons?.back ?? "Back"}
    </Button>,
    <Button
      key="2"
      type="primary"
      disabled={!excelFileName || sheetNames?.length <= 0}
      loading={btnLoading}
      onClick={handleSubmit}
    >
      {step === 1
        ? translations?.buttons?.next ?? "Next"
        : translations?.buttons?.import ?? "Import"}
    </Button>,
  ];

  const handleColumnChange = (excelColumn, selectedField) => {
    setHasUserInteracted(true);

    const requiredFields = fields.filter((f) =>
      f.validations?.some((v) => v?.rule === "required")
    );
    const missingFields = requiredFields.filter((f) => !columnMappings[f.key]);

    if (missingFields?.length === 1) {
      setMappingError(false);
    }

    setColumnMappings((prev) => {
      const next = { ...prev };

      Object.keys(next).forEach((key) => {
        if (next[key] === excelColumn) delete next[key];
      });

      if (selectedField) {
        next[selectedField] = excelColumn;
      }

      return next;
    });
  };

  return (
    <Modal
      open={open}
      width={modalWidth ?? 800}
      title={translations?.title ?? "Upload Excel"}
      onCancel={() => {
        resetAll();
        onClose();
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
          disabled={step === 2}
          style={{ cursor: "not-allowed" }}
        >
          {translations?.tab?.upload ?? "Upload"}
        </Button>
        <RightOutlined />
        <Button
          type={step === 2 ? "primary" : "default"}
          shape="round"
          size={"middle"}
          icon={<CheckCircleOutlined />}
          disabled={!excelFileName}
          style={{ cursor: "not-allowed" }}
        >
          {translations?.tab?.preview ?? "Preview"}
        </Button>
      </Row>

      {step === 1 && (
        <>
          {!excelFileName ? (
            <Dragger
              beforeUpload={handleFileUpload}
              showUploadList={false}
              listType="picture-card"
              className="avatar-uploader"
              multiple={false}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            >
              <Card style={{ height: "150px" }}>
                <div>
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">
                    {translations?.uploadFileText ?? "Upload File"}
                  </p>
                </div>
              </Card>
            </Dragger>
          ) : loading ? (
            <Flex
              align="center"
              justify="center"
              vertical
              style={{ height: 150 }}
            >
              <LoadingOutlined style={{ fontSize: 45, color: "#1677ff" }} />
              <Text type="secondary" style={{ marginTop: 8, fontSize: 14 }}>
                {translations?.uploadingText ?? "Uploading"}...
              </Text>
            </Flex>
          ) : (
            <>
              <Card style={{ position: "relative" }}>
                <Flex justify="space-between" align="center">
                  <Space>
                    <FileExcelOutlined
                      style={{ fontSize: 30, color: "#107C41" }}
                    />
                    <div>
                      <Text
                        style={{
                          fontSize: 15,
                          display: "block",
                        }}
                      >
                        {excelFileName}
                      </Text>

                      <Space wrap size={1}>
                        <Tag color="blue">
                          {sheetNames?.length}{" "}
                          {translations?.sheetsText ?? "Sheets"}
                        </Tag>

                        <Tag color="green">
                          {excelData?.length}{" "}
                          {translations?.rowsFoundText ?? "Rows"}
                        </Tag>
                      </Space>
                    </div>
                  </Space>

                  <Flex vertical>
                    {sheetNames?.length > 0 ? (
                      <>
                        <Text style={{ marginBottom: 2 }}>
                          {translations?.sheetDropdownLabel ?? "Sheet"}
                        </Text>
                        <Select
                          value={currentSheetName}
                          style={{ width: 200 }}
                          options={sheetNames?.map((n, i) => ({
                            label: n,
                            value: i,
                          }))}
                          onChange={handleSheetChange}
                        />
                      </>
                    ) : loading ? null : (
                      <Alert
                        message={
                          translations?.alerts?.noSheet ?? "No Sheet Found!"
                        }
                        type="error"
                        showIcon
                        style={{ marginTop: 16 }}
                      />
                    )}
                  </Flex>
                </Flex>

                <Tooltip title={translations?.reupload ?? "Reupload"}>
                  <Button
                    type="primary"
                    danger
                    size="small"
                    icon={<CloseOutlined />}
                    style={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    }}
                    onClick={resetAll}
                  />
                </Tooltip>
              </Card>

              {sheetNames?.length <= 0 && !loading && (
                <Alert
                  message={
                    translations?.alerts?.noRows ??
                    "No rows found in this sheet!"
                  }
                  type="error"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}

              {mappingError && !loading && (
                <Alert
                  type="error"
                  closable
                  onClose={() => setMappingError(false)}
                  style={{ marginBlock: 10 }}
                  message={
                    <Text strong>
                      {" "}
                      {translations?.mappingAlertText?.heading ??
                        "Not all columns mapped"}{" "}
                    </Text>
                  }
                  description={
                    <div style={{ margin: 0 }}>
                      <p style={{ margin: 0 }}>
                        {translations?.mappingAlertText?.message ??
                          "There are required columns that are not mapped yet."}
                      </p>
                      <p style={{ margin: 0 }}>
                        {translations?.mappingAlertText?.notMappedText ??
                          "Columns not mapped:"}{" "}
                        <Text strong>
                          {fields
                            ?.filter((field) =>
                              field.validations?.some(
                                (v) => v?.rule === "required"
                              )
                            )
                            ?.filter((field) => !columnMappings[field.key])
                            ?.map((f) => f?.label)
                            .join(", ") || "None"}
                        </Text>
                      </p>
                    </div>
                  }
                />
              )}

              {excelData?.length > 0 && (
                <>
                  <Row
                    gutter={[16, 16]}
                    style={{ marginTop: 20, paddingInline: 5 }}
                  >
                    <Col span={12}>
                      <Text strong>
                        {translations?.columns?.tableColumn ?? "Table Columns"}
                        <Tag style={{ marginLeft: 5 }}>
                          {Object.keys(excelData[0] || {})?.length}{" "}
                          {translations?.columns?.columns ?? "Columns"}
                        </Tag>
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text strong style={{ marginLeft: 20 }}>
                        {translations?.columns?.mapField ?? "Mapping To"}
                      </Text>
                    </Col>
                  </Row>

                  {Object.keys(excelData[0])?.map((col, index) => (
                    <Row key={col} style={{ marginBlock: 10 }}>
                      <Col span={24}>
                        <Space.Compact style={{ width: "100%" }}>
                          <Input
                            readOnly
                            value={index + 1}
                            style={{
                              width: 60,
                              textAlign: "center",
                            }}
                          />
                          <Input
                            readOnly
                            value={col}
                            style={{ borderRadius: 0 }}
                          />
                          <Select
                            allowClear
                            style={{ width: "100%" }}
                            placeholder={
                              translations?.dropdownPlaceholder?.selectField ??
                              "Select Field"
                            }
                            value={Object.keys(columnMappings)?.find(
                              (f) => columnMappings[f] === col
                            )}
                            onChange={(value) => handleColumnChange(col, value)}
                            options={allFields
                              ?.filter((f) => {
                                const selected = Object.keys(
                                  columnMappings
                                ).find((key) => columnMappings[key] === col);
                                return (
                                  f.key === selected ||
                                  !Object.keys(columnMappings).includes(f.key)
                                );
                              })
                              ?.map((f) => ({
                                label: f.label,
                                value: f.key,
                              }))}
                          />
                        </Space.Compact>
                      </Col>
                    </Row>
                  ))}
                </>
              )}
            </>
          )}
        </>
      )}

      {step === 2 && Object.keys(columnMappings)?.length === 0 ? (
        <Alert
          message={
            translations?.alerts?.noMappingFound ?? "No Column Mapping Found!"
          }
          type="error"
          showIcon
          style={{ marginBlock: 30 }}
        />
      ) : null}

      {step === 2 && Object.keys(columnMappings)?.length > 0 ? (
        <>
          <Row gutter={[12, 12]} style={{ marginBottom: 10 }}>
            <Col xs={12}>
              <Text strong style={{ fontSize: 16 }}>
                {translations?.table?.title ?? "Mapped Data"}
              </Text>
            </Col>
          </Row>
          <Table
            rowKey="id"
            scroll={{ y: 350 }}
            dataSource={convertedData}
            // columns={[
            //   {
            //     title: translations?.table?.sn ?? "SN",
            //     dataIndex: "id",
            //     width: 80,
            //   },
            //   ...Object.keys(columnMappings).map((fieldKey) => {
            //     const field = allFields.find((f) => f?.key === fieldKey);
            //     return {
            //       title: field?.label || fieldKey,
            //       dataIndex: fieldKey,
            //       width: 150,
            //     };
            //   }),
            // ]}
            columns={[
              {
                title: translations?.table?.sn ?? "SN",
                dataIndex: "id",
                width: 80,
              },
              ...fields
                .filter((f) => columnMappings[f.key])
                .map((field) => ({
                  title: field.label,
                  dataIndex: field.key,
                  width: 150,
                })),
            ]}
            size={tableSize ?? "middle"}
          />
        </>
      ) : null}
    </Modal>
  );
};

export default ExcelImportModal;
