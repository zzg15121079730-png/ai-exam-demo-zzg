import React, { useState, useEffect, useRef, useCallback } from "react";
import { Table, Input, Button, Space, Tooltip, Tag } from "antd";
import { standardFields } from "@/utils/excel";
import { ValidationError } from "@/utils/validation";
import * as XLSX from "xlsx";
import { DeleteOutlined, PlusOutlined, DownloadOutlined } from "@ant-design/icons";

interface DataGridProps {
  data: any[];
  errors: ValidationError[];
  onDataChange: (newData: any[]) => void;
  onRemoveRow: (index: number) => void;
  onAddRow: () => void;
}

export const DataGrid: React.FC<DataGridProps> = ({
  data,
  errors,
  onDataChange,
  onRemoveRow,
  onAddRow,
}) => {
  const [localData, setLocalData] = useState<any[]>(data);
  const isEditing = useRef(false);

  useEffect(() => {
    // 只在非编辑状态下才从父组件同步数据
    if (!isEditing.current) {
      setLocalData(data);
    }
  }, [data]);

  const handleCellChange = (index: number, field: string, value: string) => {
    isEditing.current = true;
    const newData = [...localData];
    newData[index] = { ...newData[index], [field]: value };
    setLocalData(newData);
  };

  const handleBlur = () => {
    // 先通知父组件更新数据，然后解除编辑锁
    onDataChange(localData);
    // 延迟重置编辑状态，等父组件的 setState 完成
    setTimeout(() => {
      isEditing.current = false;
    }, 100);
  };

  const exportExcel = () => {
    const exportData = localData.map(row => {
      const obj: any = {};
      standardFields.forEach(f => {
        obj[f.label] = row[f.key] || "";
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "导出数据.xlsx");
  };

  const getCellError = (rowNum: number, fieldKey: string) => {
    return errors.find(e => e.row === rowNum && e.field === fieldKey);
  };

  const getRowErrors = (rowNum: number) => {
    return errors.filter(e => e.row === rowNum);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInputId = `cell-${rowIndex + 1}-${colIndex}`;
      const nextInput = document.getElementById(nextInputId);
      if (nextInput) {
        nextInput.focus();
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const nextColIndex = e.shiftKey ? colIndex - 1 : colIndex + 1;
      const nextInputId = `cell-${rowIndex}-${nextColIndex}`;
      const nextInput = document.getElementById(nextInputId);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const columns = [
    {
      title: "操作",
      key: "action",
      width: 60,
      fixed: "left" as const,
      align: "center" as const,
      render: (_: any, __: any, index: number) => (
        <Button 
          danger 
          type="text" 
          size="small"
          icon={<DeleteOutlined />} 
          onClick={() => onRemoveRow(index)} 
        />
      ),
    },
    {
      title: "序号",
      key: "index",
      width: 60,
      fixed: "left" as const,
      align: "center" as const,
      render: (_: any, __: any, index: number) => {
        const hasError = getRowErrors(index + 1).length > 0;
        return (
          <span style={{ 
            color: hasError ? '#ff4d4f' : '#666',
            fontWeight: hasError ? 'bold' : 'normal'
          }}>
            {index + 1}
          </span>
        );
      },
    },
    ...standardFields.map((field, colIndex) => ({
      title: (
        <span>
          {field.label}
          {field.required && <span style={{ color: '#ff4d4f', marginLeft: 2 }}>*</span>}
        </span>
      ),
      dataIndex: field.key,
      key: field.key,
      width: field.key === 'externalCode' ? 180 : 
             field.key === 'senderAddress' || field.key === 'receiverAddress' ? 200 :
             field.key === 'remark' ? 140 : 130,
      render: (text: string, row: any, index: number) => {
        const error = getCellError(index + 1, field.key);
        return (
          <div>
            <Input
              id={`cell-${index}-${colIndex}`}
              value={text ?? ''}
              onChange={(e) => handleCellChange(index, field.key, e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => handleKeyDown(e, index, colIndex)}
              status={error ? "error" : ""}
              variant="borderless"
              size="small"
              style={{
                width: '100%',
                backgroundColor: error ? '#fff2f0' : 'transparent',
                borderRadius: 2,
                padding: '2px 6px',
              }}
            />
            {error && (
              <div style={{ 
                color: '#ff4d4f', 
                fontSize: '12px', 
                lineHeight: '18px',
                paddingLeft: '6px',
              }}>
                {error.message}
              </div>
            )}
          </div>
        );
      }
    })),
    {
      title: "状态",
      key: "status",
      width: 80,
      fixed: "right" as const,
      align: "center" as const,
      render: (_: any, __: any, index: number) => {
        const rowErrors = getRowErrors(index + 1);
        if (rowErrors.length > 0) {
          return <Tag color="error" style={{ margin: 0 }}>{rowErrors.length}处错误</Tag>;
        }
        return <Tag color="success" style={{ margin: 0 }}>通过</Tag>;
      }
    }
  ];

  const errorRows = new Set(errors.map(e => e.row));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 600 }}>数据预览</span>
          <span style={{ color: '#999', marginLeft: 8 }}>共 {localData.length} 条</span>
          {errorRows.size > 0 && (
            <Tag color="error" style={{ marginLeft: 8 }}>{errorRows.size} 行有错误</Tag>
          )}
          {errorRows.size === 0 && localData.length > 0 && (
            <Tag color="success" style={{ marginLeft: 8 }}>全部校验通过</Tag>
          )}
        </div>
        <Space size="small">
          <Button size="small" icon={<PlusOutlined />} onClick={onAddRow}>
            新增空行
          </Button>
          <Button size="small" icon={<DownloadOutlined />} onClick={exportExcel}>
            导出 Excel
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={localData.map((d, i) => ({ ...d, key: i }))}
        pagination={false}
        scroll={{ x: 1600, y: 400 }}
        size="small"
        bordered
        rowClassName={(_, index) => {
          return getRowErrors(index + 1).length > 0 ? 'ant-table-row-error' : '';
        }}
      />

      <style jsx global>{`
        .ant-table-row-error td {
          background-color: #fff2f0 !important;
        }
        .ant-table-row-error:hover td {
          background-color: #ffe8e6 !important;
        }
      `}</style>
    </div>
  );
};
