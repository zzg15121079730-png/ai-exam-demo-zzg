"use client";

import React, { useState, useEffect } from "react";
import { 
  Modal, Form, Input, Select, InputNumber,
  Button, Space, Tag, message, Alert, Divider, Switch
} from "antd";
import { 
  SaveOutlined, SettingOutlined
} from "@ant-design/icons";
import { RuleConfig, FieldMapping } from "@/utils/ruleEngine";
import { standardFields } from "@/utils/excel";

interface MappingModalProps {
  isOpen: boolean;
  file: File | null;
  initialRule: RuleConfig | null;
  sourceColumns?: string[];
  onConfirm: (rule: RuleConfig) => void;
  onCancel: () => void;
}

export const MappingModal: React.FC<MappingModalProps> = ({
  isOpen,
  file,
  initialRule,
  sourceColumns = [],
  onConfirm,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [rule, setRule] = useState<RuleConfig | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (initialRule) {
      const safeRule = { ...initialRule, mappings: initialRule.mappings || [] };
      setRule(safeRule);
      form.setFieldsValue({
        templateName: safeRule.templateName || "",
        description: safeRule.description || "",
        fileType: safeRule.fileType || "excel",
        headerRow: safeRule.excel?.headerRow || 1,
        dataStartRow: safeRule.excel?.dataStartRow || 2,
      });
      setShowAdvanced(false);
    }
  }, [initialRule, isOpen]);

  const safeRule = rule || { fileType: "excel", templateName: "", mappings: [] } as RuleConfig;
  const safeMappings = safeRule.mappings || [];

  const handleSaveAndConfirm = () => {
    form.validateFields().then(() => {
      const values = form.getFieldsValue();
      const currentRule: RuleConfig = {
        ...safeRule,
        templateName: values.templateName,
        description: values.description || "",
        excel: {
          ...safeRule.excel,
          headerRow: values.headerRow,
          dataStartRow: values.dataStartRow,
        }
      };
      onConfirm(currentRule);
    });
  };

  const handleMappingChange = (fieldKey: string, key: "column" | "defaultValue", value: any) => {
    const updatedMappings = safeMappings.map(m => {
      if (m.field === fieldKey) {
        const updated = { ...m, [key]: value };
        delete updated.isGuess;
        return updated;
      }
      return m;
    });
    if (!safeMappings.find(m => m.field === fieldKey)) {
      updatedMappings.push({ field: fieldKey, [key]: value });
    }
    setRule({ ...safeRule, mappings: updatedMappings });
  };

  const getMappingForField = (fieldKey: string) => {
    return safeMappings.find(m => m.field === fieldKey) || { field: fieldKey };
  };

  // 统计已映射字段数
  const mappedCount = safeMappings.filter(m => m.column || m.defaultValue).length;
  const requiredFields = standardFields.filter(f => f.required);
  const requiredMapped = requiredFields.filter(f => {
    const m = getMappingForField(f.key);
    return m.column || m.defaultValue;
  });

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SettingOutlined style={{ color: '#0fc6c2', fontSize: 20 }} />
          <span style={{ fontSize: 18, fontWeight: 'bold' }}>解析规则配置</span>
          {initialRule?.mappings?.some(m => m.isGuess) && (
            <Tag color="cyan" style={{ marginLeft: 8 }}>AI 推荐</Tag>
          )}
        </div>
      }
      open={isOpen && !!rule}
      onCancel={onCancel}
      width={800}
      styles={{ body: { maxHeight: '72vh', overflowY: 'auto' } }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#999' }}>
            已映射 {mappedCount}/{standardFields.length} 个字段
            {requiredMapped.length < requiredFields.length && (
              <span style={{ color: '#ff4d4f', marginLeft: 8 }}>
                ⚠ 必填字段未全部映射 ({requiredMapped.length}/{requiredFields.length})
              </span>
            )}
          </span>
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button 
              type="primary" 
              onClick={handleSaveAndConfirm} 
              icon={<SaveOutlined />}
              style={{ backgroundColor: '#0fc6c2', borderColor: '#0fc6c2' }}
            >
              确认规则并解析
            </Button>
          </Space>
        </div>
      }
    >
      <Alert
        message={
          <span>
            配置字段映射关系：将文件中的列名映射到系统标准字段。
            <strong style={{ color: '#0b7e7e' }}>确认后将使用此规则解析文件数据</strong>。
          </span>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* ===== 基础信息 ===== */}
      <Form form={form} layout="vertical" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 0 }}>
          <Form.Item 
            name="templateName" 
            label="规则名称" 
            rules={[{ required: true, message: "请输入规则名称" }]}
            style={{ flex: 1, marginBottom: 12 }}
          >
            <Input placeholder="例如: 多门店出库单模板" />
          </Form.Item>
          <Form.Item name="fileType" label="文件类型" style={{ marginBottom: 12 }}>
            <Select disabled style={{ width: 90 }}>
              <Select.Option value="excel">Excel</Select.Option>
              <Select.Option value="word">Word</Select.Option>
              <Select.Option value="pdf">PDF</Select.Option>
            </Select>
          </Form.Item>
        </div>
        <Form.Item 
          name="description" 
          label="规则描述"
          style={{ marginBottom: 0 }}
        >
          <Input.TextArea 
            placeholder="描述文件格式特征，如：Excel 头部包含门店名称和配送日期；PDF 每页有收货人信息表头，后接商品明细表格..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            style={{ resize: 'none' }}
          />
        </Form.Item>
      </Form>

      {/* ===== 字段映射表（核心） ===== */}
      <div style={{ 
        border: '1px solid #e8e8e8', 
        borderRadius: 10, 
        overflow: 'hidden',
        marginBottom: 16 
      }}>
        <div style={{ 
          padding: '10px 16px', 
          backgroundColor: '#f0fffe', 
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 600, color: '#0fc6c2', fontSize: 14 }}>
            📋 字段映射配置
          </span>
          {sourceColumns.length > 0 && (
            <Tag color="blue">检测到 {sourceColumns.length} 个列</Tag>
          )}
        </div>
        <div style={{ maxHeight: 380, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa', position: 'sticky', top: 0, zIndex: 1 }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', width: '25%', borderBottom: '1px solid #f0f0f0' }}>系统字段</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', width: '40%', borderBottom: '1px solid #f0f0f0' }}>对应文件列名</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', width: '25%', borderBottom: '1px solid #f0f0f0' }}>默认值</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', width: '10%', borderBottom: '1px solid #f0f0f0' }}>来源</th>
              </tr>
            </thead>
            <tbody>
              {standardFields.map(field => {
                const mapping = getMappingForField(field.key);
                const isMapped = !!(mapping.column || mapping.defaultValue);
                return (
                  <tr 
                    key={field.key} 
                    style={{ 
                      borderBottom: '1px solid #f5f5f5', 
                      backgroundColor: mapping.isGuess ? '#f0fffe' : isMapped ? '#f9fff9' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <td style={{ padding: '8px 14px' }}>
                      <span style={{ fontWeight: field.required ? 600 : 400 }}>
                        {field.label}
                      </span>
                      {field.required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}
                    </td>
                    <td style={{ padding: '6px 14px' }}>
                      <Select
                        placeholder="请选择对应列"
                        value={mapping.column || undefined}
                        onChange={(val) => handleMappingChange(field.key, "column", val || "")}
                        options={sourceColumns.map(c => ({ value: c, label: c }))}
                        style={{ width: '100%' }}
                        size="middle"
                        showSearch
                        allowClear
                        filterOption={(iv, o) => (o?.label as string)?.toLowerCase().includes(iv.toLowerCase()) ?? false}
                        notFoundContent={sourceColumns.length === 0 ? "请先上传文件" : "无匹配列"}
                      />
                    </td>
                    <td style={{ padding: '6px 14px' }}>
                      <Input 
                        placeholder="无列时使用" 
                        value={mapping.defaultValue || ""} 
                        onChange={e => handleMappingChange(field.key, "defaultValue", e.target.value)}
                        size="middle"
                      />
                    </td>
                    <td style={{ padding: '6px 14px', textAlign: 'center' }}>
                      {mapping.isGuess ? <Tag color="cyan" style={{ fontSize: 10, margin: 0 }}>AI</Tag>
                        : mapping.column ? <Tag color="green" style={{ fontSize: 10, margin: 0 }}>✓</Tag>
                        : mapping.defaultValue ? <Tag color="orange" style={{ fontSize: 10, margin: 0 }}>默认</Tag>
                        : <span style={{ color: '#d9d9d9' }}>-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== 高级配置（可折叠） ===== */}
      {safeRule.fileType === "excel" && (
        <div style={{ 
          border: '1px solid #e8e8e8', 
          borderRadius: 10, 
          overflow: 'hidden' 
        }}>
          <div 
            style={{ 
              padding: '10px 16px', 
              backgroundColor: '#fafafa', 
              borderBottom: showAdvanced ? '1px solid #e8e8e8' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span style={{ fontWeight: 500, color: '#666', fontSize: 13 }}>
              ⚙️ Excel 高级参数
            </span>
            <span style={{ color: '#999', fontSize: 12 }}>
              {showAdvanced ? '收起 ▲' : '展开 ▼'}
            </span>
          </div>
          {showAdvanced && (
            <div style={{ padding: 16 }}>
              <Form form={form} layout="inline">
                <Form.Item name="headerRow" label="表头行号">
                  <InputNumber min={1} max={20} style={{ width: 80 }} />
                </Form.Item>
                <Form.Item name="dataStartRow" label="数据起始行">
                  <InputNumber min={1} max={100} style={{ width: 80 }} />
                </Form.Item>
              </Form>
              {safeRule.excel?.skipRowsWith && safeRule.excel.skipRowsWith.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: '#666', marginRight: 8 }}>跳过包含以下关键词的行：</span>
                  {safeRule.excel.skipRowsWith.map((w, i) => (
                    <Tag key={i} color="default" style={{ marginBottom: 4 }}>{w}</Tag>
                  ))}
                </div>
              )}
              {safeRule.excel?.footerExtraction?.enabled && (
                <div style={{ marginTop: 8 }}>
                  <Tag color="cyan">已启用尾部信息提取</Tag>
                </div>
              )}
              {safeRule.excel?.cardLayout?.enabled && (
                <div style={{ marginTop: 8 }}>
                  <Tag color="purple">卡片式布局解析</Tag>
                </div>
              )}
              {safeRule.excel?.matrixPivot?.enabled && (
                <div style={{ marginTop: 8 }}>
                  <Tag color="volcano">矩阵转置模式</Tag>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
