"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Modal, Form, Input, Select, Table, 
  Button, Space, Tag, message, Alert, AutoComplete
} from "antd";
import { 
  PlayCircleOutlined, SaveOutlined, SettingOutlined,
  EditOutlined, DeleteOutlined, PlusOutlined
} from "@ant-design/icons";
import { RuleConfig, FieldMapping } from "@/utils/ruleEngine";
import { standardFields } from "@/utils/excel";

interface MappingModalProps {
  isOpen: boolean;
  file: File | null;
  initialRule: RuleConfig | null;
  sourceColumns?: string[];
  onConfirm: (rule: RuleConfig, parsedData: any[]) => void;
  onCancel: () => void;
}

// 可编辑单元格组件
const EditableCell: React.FC<{
  value: any;
  onChange: (val: string) => void;
}> = ({ value, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [tempVal, setTempVal] = useState(String(value || ""));
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  if (editing) {
    return (
      <Input
        ref={inputRef}
        size="small"
        value={tempVal}
        onChange={e => setTempVal(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (tempVal !== String(value || "")) onChange(tempVal);
        }}
        onPressEnter={() => {
          setEditing(false);
          if (tempVal !== String(value || "")) onChange(tempVal);
        }}
        style={{ padding: '0 4px', fontSize: 12 }}
      />
    );
  }

  return (
    <div
      onClick={() => { setEditing(true); setTempVal(String(value || "")); }}
      style={{ 
        cursor: 'pointer', 
        minHeight: 22, 
        padding: '2px 4px',
        borderRadius: 3,
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#e6fffb')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      title="点击编辑"
    >
      {value || <span style={{ color: '#d9d9d9' }}>-</span>}
    </div>
  );
};

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
  const [testResult, setTestResult] = useState<any[]>([]);
  const [testLoading, setTestLoading] = useState(false);
  const [showMapping, setShowMapping] = useState(false);

  useEffect(() => {
    if (initialRule) {
      const safeRule = { ...initialRule, mappings: initialRule.mappings || [] };
      setRule(safeRule);
      form.setFieldsValue({
        templateName: safeRule.templateName || "",
        fileType: safeRule.fileType || "excel",
      });
      setTestResult([]);
      setShowMapping(false);
      if (file) {
        setTimeout(() => autoTestParse(safeRule), 300);
      }
    }
  }, [initialRule, isOpen]);

  const safeRule = rule || { fileType: "excel", templateName: "", mappings: [] } as RuleConfig;
  const safeMappings = safeRule.mappings || [];

  const autoTestParse = async (ruleToTest: RuleConfig) => {
    if (!file) return;
    setTestLoading(true);
    try {
      const savedApiKey = localStorage.getItem("ai_api_key") || "";
      const savedBaseUrl = localStorage.getItem("ai_base_url") || "https://api.deepseek.com/v1";
      const savedModel = localStorage.getItem("ai_model_name") || "deepseek-chat";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("rule", JSON.stringify(ruleToTest));
      formData.append("apiKey", savedApiKey);
      formData.append("apiBaseUrl", savedBaseUrl);
      formData.append("modelName", savedModel);

      const res = await fetch("/api/mapping/parse-file", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setTestResult(data.data || []);
        message.success(`解析完成，共提取出 ${data.count} 条记录`);
      } else {
        message.error(data.error || "试解析执行失败");
      }
    } catch (e: any) {
      message.error("网络错误: " + e.message);
    } finally {
      setTestLoading(false);
    }
  };

  const handleTestParse = () => autoTestParse(safeRule);

  // 编辑单元格
  const handleCellEdit = (rowIndex: number, fieldKey: string, newValue: string) => {
    setTestResult(prev => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [fieldKey]: newValue };
      return updated;
    });
  };

  // 删除行
  const handleDeleteRow = (rowIndex: number) => {
    setTestResult(prev => prev.filter((_, i) => i !== rowIndex));
  };

  // 新增空行
  const handleAddRow = () => {
    setTestResult(prev => [...prev, {}]);
  };

  const handleSaveAndConfirm = () => {
    form.validateFields().then(() => {
      const values = form.getFieldsValue();
      const currentRule = { ...safeRule, templateName: values.templateName };
      // 传出规则 + 已编辑的解析数据
      onConfirm(currentRule, testResult);
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

  // 可编辑预览列
  const previewColumns = [
    ...standardFields.map(f => ({
      title: <span style={{ fontSize: 12 }}>{f.label}</span>,
      dataIndex: f.key,
      key: f.key,
      width: f.key === "receiverAddress" ? 180 : f.key === "skuName" ? 160 : 110,
      ellipsis: true,
      render: (text: any, _record: any, index: number) => (
        <EditableCell
          value={text}
          onChange={(val) => handleCellEdit(index, f.key, val)}
        />
      )
    })),
    {
      title: <span style={{ fontSize: 12 }}>操作</span>,
      key: "action",
      width: 50,
      fixed: "right" as const,
      render: (_: any, _record: any, index: number) => (
        <Button 
          type="text" 
          size="small" 
          danger
          icon={<DeleteOutlined />} 
          onClick={() => handleDeleteRow(index)}
          style={{ padding: 0 }}
        />
      )
    }
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SettingOutlined style={{ color: '#0fc6c2', fontSize: 20 }} />
          <span style={{ fontSize: 18, fontWeight: 'bold' }}>AI 智能解析结果</span>
        </div>
      }
      open={isOpen && !!rule}
      onCancel={onCancel}
      width={1200}
      styles={{ body: { maxHeight: '72vh', overflowY: 'auto' } }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#999' }}>
            <EditOutlined /> 点击单元格可直接编辑数据
          </span>
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button onClick={() => setShowMapping(!showMapping)}>
              {showMapping ? "收起映射" : "映射配置"}
            </Button>
            <Button 
              type="dashed" 
              onClick={handleTestParse} 
              loading={testLoading} 
              icon={<PlayCircleOutlined />}
              disabled={!file}
            >
              重新解析
            </Button>
            <Button 
              type="primary" 
              onClick={handleSaveAndConfirm} 
              icon={<SaveOutlined />}
              style={{ backgroundColor: '#0fc6c2', borderColor: '#0fc6c2' }}
              disabled={testResult.length === 0}
            >
              确认提交 ({testResult.length} 条)
            </Button>
          </Space>
        </div>
      }
    >
      <Alert
        message={
          <span>
            AI 已分析文件结构并自动解析数据。
            <strong style={{ color: '#0b7e7e' }}>点击单元格可直接编辑修正</strong>，
            确认无误后点击「确认提交」入库。
          </span>
        }
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
      />

      <Form form={form} layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item 
          name="templateName" 
          label="规则名称" 
          rules={[{ required: true, message: "请输入" }]}
          style={{ flex: 1 }}
        >
          <Input placeholder="例如: 多门店出库单模板" size="small" />
        </Form.Item>
        <Form.Item name="fileType" label="类型">
          <Select disabled size="small" style={{ width: 90 }}>
            <Select.Option value="excel">Excel</Select.Option>
            <Select.Option value="word">Word</Select.Option>
            <Select.Option value="pdf">PDF</Select.Option>
          </Select>
        </Form.Item>
      </Form>

      {/* 可折叠映射配置 */}
      {showMapping && (
        <div style={{ marginBottom: 12, border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#0fc6c2', fontSize: 13 }}>字段映射配置（高级）</div>
          <div style={{ maxHeight: 250, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: '#fafafa' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>字段</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>映射列名</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>默认值</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center', width: 60 }}>来源</th>
                </tr>
              </thead>
              <tbody>
                {standardFields.map(field => {
                  const mapping = getMappingForField(field.key);
                  return (
                    <tr key={field.key} style={{ borderBottom: '1px solid #f5f5f5', backgroundColor: mapping.isGuess ? '#f0fffe' : 'transparent' }}>
                      <td style={{ padding: '4px 8px' }}>
                        {field.label} {field.required && <span style={{ color: '#ff4d4f' }}>*</span>}
                      </td>
                      <td style={{ padding: '4px 8px' }}>
                        <AutoComplete
                          placeholder="源列" 
                          value={mapping.column || ""} 
                          onChange={(val) => handleMappingChange(field.key, "column", val)}
                          options={sourceColumns.map(c => ({ value: c, label: c }))}
                          style={{ width: '100%' }}
                          size="small"
                          filterOption={(iv, o) => (o?.label as string)?.toLowerCase().includes(iv.toLowerCase()) ?? false}
                        />
                      </td>
                      <td style={{ padding: '4px 8px' }}>
                        <Input 
                          placeholder="无列时用" 
                          value={mapping.defaultValue || ""} 
                          onChange={e => handleMappingChange(field.key, "defaultValue", e.target.value)}
                          size="small"
                        />
                      </td>
                      <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                        {mapping.isGuess ? <Tag color="cyan" style={{ fontSize: 10, margin: 0 }}>AI</Tag>
                          : mapping.column ? <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>✓</Tag>
                          : <span style={{ color: '#d9d9d9' }}>-</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 可编辑数据表格 */}
      <div>
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13 }}>
            {testLoading ? "正在解析中..." : testResult.length > 0 
              ? <>共 <strong style={{ color: '#0fc6c2', fontSize: 16 }}>{testResult.length}</strong> 条数据</>
              : "等待解析..."}
          </span>
          <Space size="small">
            {testResult.length > 0 && <Tag color="success">解析成功</Tag>}
            <Button size="small" icon={<PlusOutlined />} onClick={handleAddRow}>新增行</Button>
          </Space>
        </div>
        <Table 
          dataSource={testResult.map((r, i) => ({ ...r, key: i }))} 
          columns={previewColumns}
          size="small"
          loading={testLoading}
          pagination={testResult.length > 50 ? { pageSize: 50, showTotal: (t) => `共 ${t} 条`, showSizeChanger: true, pageSizeOptions: ['20', '50', '100'] } : false}
          scroll={{ x: 1500, y: 400 }}
          locale={{ emptyText: "正在自动解析..." }}
        />
      </div>
    </Modal>
  );
};
