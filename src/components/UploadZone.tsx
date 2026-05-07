"use client";

import React from "react";
import { Upload, Typography } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";

const { Dragger } = Upload;
const { Text } = Typography;

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect }) => {
  const props: UploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    accept: ".xlsx, .xls",
    beforeUpload: (file) => {
      const isExcel = file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.type === "application/vnd.ms-excel" || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      if (!isExcel) {
        alert("请上传 Excel 文件 (.xlsx 或 .xls)");
        return Upload.LIST_IGNORE;
      }
      onFileSelect(file);
      return false; // Prevent default upload behavior
    },
  };

  return (
    <Dragger {...props} style={{ padding: '40px 0', backgroundColor: '#fafafa' }}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined style={{ color: '#1677ff' }} />
      </p>
      <p className="ant-upload-text">支持拖拽或点击上传 Excel (.xlsx / .xls) 文件</p>
      <p className="ant-upload-hint">
        支持 .xlsx 或 .xls 格式。系统将自动识别模板列名并完成映射。
      </p>
    </Dragger>
  );
};
