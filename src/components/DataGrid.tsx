import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Table, Input, Button, Space, Tag } from "antd";
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

// 可编辑单元格组件 — 点击后才变成 Input
const EditableCell = React.memo(({
  value,
  error,
  fieldKey,
  rowIndex,
  colIndex,
  onChange,
}: {
  value: string;
  error?: ValidationError;
  fieldKey: string;
  rowIndex: number;
  colIndex: number;
  onChange: (val: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [localVal, setLocalVal] = useState(value);
  const inputRef = useRef<any>(null);

  // 仅在非编辑状态下从外部同步
  useEffect(() => {
    if (!editing) setLocalVal(value);
  }, [value, editing]);

  const startEdit = () => {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const finishEdit = () => {
    setEditing(false);
    if (localVal !== value) {
      onChange(localVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      finishEdit();
      setTimeout(() => {
        const next = document.querySelector(`[data-cell="${rowIndex + 1}-${colIndex}"]`) as HTMLElement;
        next?.click();
      }, 50);
    } else if (e.key === "Tab") {
      e.preventDefault();
      finishEdit();
      const nextCol = e.shiftKey ? colIndex - 1 : colIndex + 1;
      setTimeout(() => {
        const next = document.querySelector(`[data-cell="${rowIndex}-${nextCol}"]`) as HTMLElement;
        next?.click();
      }, 50);
    } else if (e.key === "Escape") {
      setLocalVal(value);
      setEditing(false);
    }
  };


  if (editing) {
    return (
      <div>
        <Input
          ref={inputRef}
          value={localVal}
          onChange={(e) => setLocalVal(e.target.value)}
          onBlur={finishEdit}
          onKeyDown={handleKeyDown}
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
          <div style={{ color: '#ff4d4f', fontSize: 11, lineHeight: '16px', paddingLeft: 6 }}>
            {error.message}
          </div>
        )}
      </div>
    );
  }

  // 展示模式 — 纯文本
  return (
    <div
      data-cell={`${rowIndex}-${colIndex}`}
      onClick={startEdit}
      style={{
        width: '100%',
        minHeight: 22,
        padding: '2px 6px',
        cursor: 'text',
        backgroundColor: error ? '#fff2f0' : 'transparent',
        borderRadius: 2,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {localVal || <span style={{ color: '#ccc' }}>点击编辑</span>}
      {error && (
        <div style={{ color: '#ff4d4f', fontSize: 11, lineHeight: '16px' }}>
          {error.message}
        </div>
      )}
    </div>
  );
});

EditableCell.displayName = "EditableCell";

export const DataGrid: React.FC<DataGridProps> = ({
  data,
  errors,
  onDataChange,
  onRemoveRow,
  onAddRow,
}) => {
  // ★ 关键：用 localData 做编辑的唯一数据源，避免父组件校验后覆盖编辑值
  const [localData, setLocalData] = useState<any[]>(data);
  const dataVersionRef = useRef(0);

  // 仅在数据量变化（新上传/增删行）或首次加载时同步 props → localData
  useEffect(() => {
    // 检测是否是结构性变化（行数变了 = 新文件上传/增删行）
    if (data.length !== localData.length) {
      setLocalData(data);
      dataVersionRef.current++;
    }
  }, [data.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // 首次挂载同步
  useEffect(() => {
    setLocalData(data);
    dataVersionRef.current++;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 预计算错误 Map
  const errorMap = useMemo(() => {
    const map: Record<number, Record<string, ValidationError>> = {};
    for (const e of errors) {
      if (!map[e.row]) map[e.row] = {};
      map[e.row][e.field] = e;
    }
    return map;
  }, [errors]);

  const errorRowSet = useMemo(() => new Set(errors.map(e => e.row)), [errors]);

  // ★ 核心修复：编辑时更新 localData，然后通知父组件校验
  const handleCellChange = useCallback((index: number, field: string, value: string) => {
    setLocalData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      // 通知父组件做校验（不影响 localData 的控制权）
      // 用 setTimeout 让 setState 先完成
      setTimeout(() => onDataChange(newData), 0);
      return newData;
    });
  }, [onDataChange]);

  const exportExcel = useCallback(() => {
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
  }, [localData]);

  const columns = useMemo(() => [
    {
      title: "操作",
      key: "action",
      width: 50,
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
      width: 55,
      fixed: "left" as const,
      align: "center" as const,
      render: (_: any, __: any, index: number) => {
        const hasError = errorRowSet.has(index + 1);
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
      width: field.key === 'externalCode' ? 160 :
             field.key === 'senderAddress' || field.key === 'receiverAddress' ? 180 :
             field.key === 'remark' ? 130 : 120,
      render: (text: string, _row: any, index: number) => {
        const error = errorMap[index + 1]?.[field.key];
        return (
          <EditableCell
            value={text ?? ''}
            error={error}
            fieldKey={field.key}
            rowIndex={index}
            colIndex={colIndex}
            onChange={(val) => handleCellChange(index, field.key, val)}
          />
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
        const rowErrs = errorMap[index + 1];
        if (rowErrs) {
          const count = Object.keys(rowErrs).length;
          return <Tag color="error" style={{ margin: 0 }}>{count}处错误</Tag>;
        }
        return <Tag color="success" style={{ margin: 0 }}>通过</Tag>;
      }
    }
  ], [errorMap, errorRowSet, handleCellChange, onRemoveRow]);

  // 大数据集分页
  const pagination = localData.length > 100 ? {
    pageSize: 100,
    showTotal: (total: number) => `共 ${total} 条`,
    showSizeChanger: true,
    pageSizeOptions: ['50', '100', '200', '500'],
    size: 'small' as const,
  } : false;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 600 }}>数据预览</span>
          <span style={{ color: '#999', marginLeft: 8 }}>共 {localData.length} 条</span>
          {errorRowSet.size > 0 && (
            <Tag color="error" style={{ marginLeft: 8 }}>{errorRowSet.size} 行有错误</Tag>
          )}
          {errorRowSet.size === 0 && localData.length > 0 && (
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
        pagination={pagination}
        scroll={{ x: 1600, y: 500 }}
        size="small"
        bordered
        virtual
        rowClassName={(_, index) => {
          return errorRowSet.has(index + 1) ? 'ant-table-row-error' : '';
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
