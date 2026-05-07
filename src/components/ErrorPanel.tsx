import React from "react";
import { Alert } from "antd";
import { ValidationError } from "@/utils/validation";

interface ErrorPanelProps {
  errors: ValidationError[];
}

export const ErrorPanel: React.FC<ErrorPanelProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  const errorMessages = (
    <ul className="list-disc list-inside space-y-1 text-sm mt-2">
      {errors.map((error, idx) => (
        <li key={idx}>
          <span className="font-medium">第 {error.row} 行</span>，
          {error.fieldLabel}：{error.message}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="mb-4">
      <Alert
        message={`发现 ${errors.length} 处错误，请修复后再提交`}
        description={errorMessages}
        type="error"
        showIcon
        style={{ maxHeight: '250px', overflowY: 'auto' }}
      />
    </div>
  );
};

