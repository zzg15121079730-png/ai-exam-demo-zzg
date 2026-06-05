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
    accept: ".xlsx, .xls, .docx, .pdf",
    beforeUpload: (file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const allowed = ["xlsx", "xls", "docx", "pdf"];
      if (!ext || !allowed.includes(ext)) {
        alert("请上传 Excel (.xlsx/.xls)、Word (.docx) 或 PDF 文件");
        return Upload.LIST_IGNORE;
      }
      onFileSelect(file);
      return false; // Prevent default upload behavior
    },
  };

  return (
    <Dragger {...props} style={{ padding: '40px 0', backgroundColor: '#fafafa', borderRadius: 8 }}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined style={{ color: '#0fc6c2' }} />
      </p>
      <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>
        点击或将文件拖拽到这里上传
      </p>
      <p className="ant-upload-hint">
        支持 Excel (.xlsx / .xls)、Word (.docx) 以及 PDF 格式
      </p>
    </Dragger>
  );
};
