import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Flex,
  Modal,
  Row,
  Space,
  Upload,
  Image,
  Typography,
  Input,
  Select,
  Table,
  Col,
  Tag,
} from "antd";
import {
  CloseOutlined,
  UploadOutlined,
  RightOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";

const { Dragger } = Upload;
const { Text } = Typography;

const ExcelImportModal = ({
  isOpen,
  onClose,
  onSubmit,
  fields = [],
  customFields = [],
}) => {
  const [excelFileName, setExcelFileName] = useState("");
  const [sheetNames, setSheetNames] = useState([]);
  const [currentSheetName, setCurrentSheetName] = useState("");
  const [workbook, setWorkbook] = useState(null);

  const [excelData, setExcelData] = useState([]);
  const [columnMappings, setColumnMappings] = useState({});
  const [convertedData, setConvertedData] = useState([]);

  const [step, setStep] = useState(1);
  const [btnLoading, setBtnLoading] = useState(false);

  const { t } = useTranslation();

  const handleFileUpload = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: "binary" });
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);

      const firstSheet = wb.SheetNames[0];
      setCurrentSheetName(firstSheet);

      const sheet = wb.Sheets[firstSheet];
      const json = XLSX.utils.sheet_to_json(sheet);
      setExcelData(json);
    };

    reader.readAsBinaryString(file);
    setExcelFileName(file.name);
    return false;
  };

  const resetAll = () => {
    setExcelFileName("");
    setSheetNames([]);
    setExcelData([]);
    setWorkbook(null);
    setColumnMappings({});
    setConvertedData([]);
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
  }, [columnMappings]);

  const allFields = [
    ...(fields?.map((f) => ({
      label: f?.label,
      key: f?.key,
      alternateMatches: f?.alternateMatches || [],
    })) || []),
    ...(customFields?.map((c) => ({
      label: c?.label,
      key: c?.id,
      alternateMatches: c?.alternateMatches || [],
    })) || []),
  ];

  useEffect(() => {
    if (!excelData?.length || !allFields?.length) return;

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

    if (
      Object.keys(initialMapping).length &&
      !Object.keys(columnMappings).length
    ) {
      setColumnMappings(initialMapping);
    }
  }, [excelData, allFields]);

  useEffect(() => {
    if (!excelData?.length || !Object.keys(columnMappings).length) return;

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

  const handleSubmit = async () => {
    setBtnLoading(true);
    try {
      if (step === 1) {
        setStep(2);
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

  const modalFooter = [
    <Button key="1" onClick={() => (step === 1 ? onClose() : setStep(1))}>
      {step === 1
        ? t("cancel") !== "cancel"
          ? t("cancel")
          : "Cancel"
        : t("back") !== "back"
        ? t("back")
        : "Back"}
    </Button>,
    <Button
      key="2"
      type="primary"
      disabled={!excelFileName}
      loading={btnLoading}
      onClick={handleSubmit}
    >
      {step === 1
        ? t("next") !== "next"
          ? t("next")
          : "Next"
        : t("import") !== "import"
        ? t("import")
        : "Import"}
    </Button>,
  ];

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

  return (
    <Modal
      open={isOpen}
      width={800}
      title={
        t("import.excel") !== "import.excel"
          ? t("import.excel")
          : "Import Excel"
      }
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
        >
          {t("upload") !== "upload" ? t("upload") : "Upload"}
        </Button>
        <RightOutlined />
        <Button
          type={step === 2 ? "primary" : "default"}
          shape="round"
          size={"middle"}
          icon={<CheckCircleOutlined />}
          disabled={!excelFileName}
        >
          {t("preview") !== "preview" ? t("preview") : "Preview"}
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
                    {t("upload.file") !== "upload.file"
                      ? t("upload.file")
                      : "Upload File"}
                  </p>
                </div>
              </Card>
            </Dragger>
          ) : (
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
                        {sheetNames?.length}{" "}
                        {t("sheets") !== "sheets" ? t("sheets") : "sheets"}
                      </Tag>
                    </div>
                  </Space>

                  <Select
                    value={currentSheetName}
                    style={{ width: 200 }}
                    options={sheetNames?.map((n, i) => ({
                      label: n,
                      value: i,
                    }))}
                    onChange={handleSheetChange}
                  />
                </Flex>

                <Button
                  type="primary"
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                  style={{ position: "absolute", right: 10, top: 10 }}
                  onClick={resetAll}
                />
              </Card>

              {excelData?.length > 0 && (
                <>
                  <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                    <Col span={12}>
                      <Text strong>
                        {t("imported.columns") !== "imported.columns"
                          ? t("imported.columns")
                          : "Imported Columns"}
                        <Tag>
                          {Object.keys(excelData[0] || {})?.length}{" "}
                          {t("columns") !== "columns"
                            ? t("columns")
                            : "Columns"}
                        </Tag>
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>
                        {t("column.mapping") !== "column.mapping"
                          ? t("column.mapping")
                          : "Column Mapping"}
                      </Text>
                    </Col>
                  </Row>

                  <div
                    style={{ maxHeight: 250, overflow: "auto", marginTop: 10 }}
                  >
                    {Object.keys(excelData[0]).map((col) => (
                      <Row key={col} style={{ marginBottom: 10 }}>
                        <Space.Compact style={{ width: "100%" }}>
                          <Input readOnly value={col} />
                          <Select
                            allowClear
                            style={{ width: "100%" }}
                            placeholder={
                              t("select.field") !== "select.field"
                                ? t("select.field")
                                : "Select Field"
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
                      </Row>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

      {step === 2 && (
        <Table
          rowKey="id"
          scroll={{ y: 400 }}
          dataSource={convertedData}
          columns={[
            { title: "Sr. No.", dataIndex: "id", width: 80 },
            ...Object.keys(columnMappings).map((fieldKey) => {
              const field = allFields.find((f) => f?.key === fieldKey);
              return { title: field?.label || fieldKey, dataIndex: fieldKey };
            }),
          ]}
        />
      )}
    </Modal>
  );
};

export default ExcelImportModal;
