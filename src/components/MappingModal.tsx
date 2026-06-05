"use client";

import React, { useState, useEffect } from "react";
import { 
  Modal, Form, Input, Select, Switch, Row, Col, Table, 
  Button, Space, Tag, Divider, Card, message, Alert, Tabs
} from "antd";
import { 
  PlayCircleOutlined, SaveOutlined, WarningOutlined,
  SettingOutlined, FieldStringOutlined
} from "@ant-design/icons";
import { RuleConfig, FieldMapping } from "@/utils/ruleEngine";
import { standardFields } from "@/utils/excel";

interface MappingModalProps {
  isOpen: boolean;
  file: File | null;
  initialRule: RuleConfig | null;
  onConfirm: (rule: RuleConfig) => void;
  onCancel: () => void;
}

export const MappingModal: React.FC<MappingModalProps> = ({
  isOpen,
  file,
  initialRule,
  onConfirm,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [rule, setRule] = useState<RuleConfig | null>(null);
  const [testResult, setTestResult] = useState<any[]>([]);
  const [testLoading, setTestLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

  // 初始化 rule
  useEffect(() => {
    if (initialRule) {
      const safeRule = {
        ...initialRule,
        mappings: initialRule.mappings || []
      };
      setRule(safeRule);
      form.setFieldsValue({
        templateName: safeRule.templateName || "",
        fileType: safeRule.fileType || "excel",
        // Excel 配置项
        headerRow: safeRule.excel?.headerRow || 1,
        dataStartRow: safeRule.excel?.dataStartRow || 2,
        dataEndRowOffset: safeRule.excel?.dataEndRowOffset || 0,
        skipRowsWith: safeRule.excel?.skipRowsWith?.join(",") || "",
        // 跨行合并开关
        rowAggregationEnabled: safeRule.excel?.rowAggregation?.enabled || false,
        groupByField: safeRule.excel?.rowAggregation?.groupByField || "externalCode",
        // 矩阵转置开关
        matrixPivotEnabled: safeRule.excel?.matrixPivot?.enabled || false,
        pivotHeaderRow: safeRule.excel?.matrixPivot?.pivotHeaderRow || 2,
        pivotColumnsStart: safeRule.excel?.matrixPivot?.pivotColumnsStart || 3,
        skuFieldsStr: JSON.stringify(safeRule.excel?.matrixPivot?.skuFields || [
          { field: "skuCode", column: "SKU物品编码" },
          { field: "skuName", column: "SKU物品名称" }
        ], null, 2),
        // 尾部提取开关
        footerExtractionEnabled: safeRule.excel?.footerExtraction?.enabled || false,
        footerFieldsStr: JSON.stringify(safeRule.excel?.footerExtraction?.fields || [], null, 2),
        // 卡片开关
        cardLayoutEnabled: safeRule.excel?.cardLayout?.enabled || false,
        cardStartRegex: safeRule.excel?.cardLayout?.cardStartRegex || "▶",
        cardFieldsStr: JSON.stringify(safeRule.excel?.cardLayout?.fields || [], null, 2),
        tableStartRowOffset: safeRule.excel?.cardLayout?.tableStartRowOffset || 4,
        // PDF/Word 解析开关
        splitPattern: safeRule.text?.splitPattern || "",
        textFieldsStr: JSON.stringify(safeRule.text?.fields || [], null, 2),
        tableRowRegex: safeRule.text?.tableRowRegex || "",
        tableFieldsStr: JSON.stringify(safeRule.text?.tableFields || [], null, 2),
      });
      setTestResult([]);
    }
  }, [initialRule, isOpen, form]);

  if (!isOpen || !rule) return null;

  // 根据表单值组合 RuleConfig
  const getRuleFromForm = (): RuleConfig => {
    const values = form.getFieldsValue();
    
    // 构造 Excel 配置
    const excel: any = {};
    if (values.fileType === "excel") {
      excel.sheets = ["*"];
      excel.headerRow = Number(values.headerRow);
      excel.dataStartRow = Number(values.dataStartRow);
      excel.dataEndRowOffset = Number(values.dataEndRowOffset);
      excel.skipRowsWith = values.skipRowsWith ? values.skipRowsWith.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
      
      if (values.rowAggregationEnabled) {
        excel.rowAggregation = {
          enabled: true,
          groupByField: values.groupByField
        };
      }
      
      if (values.matrixPivotEnabled) {
        try {
          excel.matrixPivot = {
            enabled: true,
            pivotHeaderRow: Number(values.pivotHeaderRow),
            pivotColumnsStart: Number(values.pivotColumnsStart),
            skuFields: JSON.parse(values.skuFieldsStr),
            targetField: "receiverStore",
            valueField: "quantity"
          };
        } catch(e) {
          message.error("矩阵转置 SKU 列配置格式错误，必须为 JSON 数组");
        }
      }
      
      if (values.footerExtractionEnabled) {
        try {
          excel.footerExtraction = {
            enabled: true,
            fields: JSON.parse(values.footerFieldsStr)
          };
        } catch(e) {
          message.error("尾部信息提取字段配置格式错误，必须为 JSON 数组");
        }
      }

      if (values.cardLayoutEnabled) {
        try {
          excel.cardLayout = {
            enabled: true,
            cardStartRegex: values.cardStartRegex,
            fields: JSON.parse(values.cardFieldsStr),
            tableStartRowOffset: Number(values.tableStartRowOffset)
          };
        } catch(e) {
          message.error("卡片式字段配置格式错误，必须为 JSON 数组");
        }
      }
    }

    // 构造 Text 配置
    const text: any = {};
    if (values.fileType !== "excel") {
      text.splitPattern = values.splitPattern || undefined;
      try {
        text.fields = values.textFieldsStr ? JSON.parse(values.textFieldsStr) : [];
      } catch(e) {
        message.error("纯文本全局字段提取配置格式错误，必须为 JSON 数组");
      }
      
      if (values.tableRowRegex) {
        text.tableRowRegex = values.tableRowRegex;
        try {
          text.tableFields = values.tableFieldsStr ? JSON.parse(values.tableFieldsStr) : [];
        } catch(e) {
          message.error("明细表匹配字段格式错误，必须为 JSON 数组");
        }
      }
    }

    return {
      templateName: values.templateName,
      fileType: values.fileType,
      excel: values.fileType === "excel" ? excel : undefined,
      text: values.fileType !== "excel" ? text : undefined,
      mappings: rule.mappings
    };
  };

  // 测试试解析
  const handleTestParse = async () => {
    if (!file) return;
    setTestLoading(true);
    try {
      const currentRule = getRuleFromForm();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("rule", JSON.stringify(currentRule));

      const res = await fetch("/api/mapping/parse-file", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult(data.data || []);
        message.success(`试解析测试完成，共提取出 ${data.count} 条记录`);
        setActiveTab("2"); // 自动跳转到测试预览页
      } else {
        message.error(data.error || "试解析执行失败");
      }
    } catch (e: any) {
      message.error("网络错误: " + e.message);
    } finally {
      setTestLoading(false);
    }
  };

  const handleSaveAndConfirm = () => {
    form.validateFields().then(() => {
      const currentRule = getRuleFromForm();
      onConfirm(currentRule);
    });
  };

  // 更新某一个字段的映射绑定
  const handleMappingChange = (fieldKey: string, key: "column" | "defaultValue", value: any) => {
    if (!rule) return;
    const updatedMappings = (rule.mappings || []).map(m => {
      if (m.field === fieldKey) {
        const updated = { ...m, [key]: value };
        // 既然用户已经手动修改，就不是 AI 推测了
        delete updated.isGuess;
        return updated;
      }
      return m;
    });
    // 如果没有，就新增一个
    if (!(rule.mappings || []).find(m => m.field === fieldKey)) {
      updatedMappings.push({
        field: fieldKey,
        [key]: value
      });
    }
    setRule({ ...rule, mappings: updatedMappings });
  };

  const getMappingForField = (fieldKey: string) => {
    if (!rule) return { field: fieldKey };
    return (rule.mappings || []).find(m => m.field === fieldKey) || { field: fieldKey };
  };

  // 渲染表头映射列表
  const renderMappingEditor = () => {
    return (
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e8e8e8' }}>
              <th style={{ padding: '10px 8px', textAlign: 'left' }}>标准字段</th>
              <th style={{ padding: '10px 8px', textAlign: 'left' }}>映射目标列 (从上传文件映射)</th>
              <th style={{ padding: '10px 8px', textAlign: 'left' }}>默认值/静态值 (可选)</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', width: 100 }}>来源</th>
            </tr>
          </thead>
          <tbody>
            {standardFields.map(field => {
              const mapping = getMappingForField(field.key);
              const isGuess = mapping.isGuess;
              const isRequired = field.required;

              return (
                <tr key={field.key} style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: isGuess ? '#e6fffb' : 'transparent' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>
                    {field.label} {isRequired && <span style={{ color: '#ff4d4f' }}>*</span>}
                    <div style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 'normal' }}>{field.key}</div>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <Input 
                      placeholder="例如: 订单号 / 物品编码" 
                      value={mapping.column || ""} 
                      onChange={e => handleMappingChange(field.key, "column", e.target.value)}
                      style={{ borderColor: isGuess ? '#87e8de' : undefined }}
                    />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <Input 
                      placeholder="例: 中通发货仓 (无列时生效)" 
                      value={mapping.defaultValue || ""} 
                      onChange={e => handleMappingChange(field.key, "defaultValue", e.target.value)}
                    />
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    {isGuess ? (
                      <Tag color="cyan" style={{ borderStyle: 'dashed' }}>AI 推测</Tag>
                    ) : mapping.column || mapping.defaultValue ? (
                      <Tag color="blue">用户确认</Tag>
                    ) : (
                      <Tag color="default">未映射</Tag>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const previewColumns = standardFields.map(f => ({
    title: f.label,
    dataIndex: f.key,
    key: f.key,
    width: 120,
    ellipsis: true
  }));

  const fileTypeVal = Form.useWatch("fileType", form);
  const rowAggregationEnabledVal = Form.useWatch("rowAggregationEnabled", form);
  const matrixPivotEnabledVal = Form.useWatch("matrixPivotEnabled", form);
  const footerExtractionEnabledVal = Form.useWatch("footerExtractionEnabled", form);
  const cardLayoutEnabledVal = Form.useWatch("cardLayoutEnabled", form);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SettingOutlined style={{ color: '#0fc6c2', fontSize: 20 }} />
          <span style={{ fontSize: 18, fontWeight: 'bold' }}>AI 生成的通用解析规则微调与确认</span>
        </div>
      }
      open={isOpen}
      onCancel={onCancel}
      width={1000}
      maskClosable={false}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button 
            type="dashed" 
            onClick={handleTestParse} 
            loading={testLoading} 
            icon={<PlayCircleOutlined />}
            disabled={!file}
          >
            试解析测试
          </Button>
          <Button 
            type="primary" 
            onClick={handleSaveAndConfirm} 
            icon={<SaveOutlined />}
            style={{ backgroundColor: '#0fc6c2', borderColor: '#0fc6c2' }}
          >
            保存规则并解析文件
          </Button>
        </Space>
      }
    >
      {(rule.mappings || []).some(m => m.isGuess) && (
        <Alert
          message="AI 大模型已完成规则预处理"
          description={
            <span>
              已根据文件格式生成如下推荐解析参数。
              <strong style={{ color: '#0b7e7e' }}>青绿色背景行为 AI 推测映射字段</strong>
              ，请在下方各个面板内确认或微调，并可点击“试解析测试”验证解析结果后再行保存。
            </span>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="templateName" 
              label="规则模板名称" 
              rules={[{ required: true, message: "请输入规则模板名称" }]}
            >
              <Input placeholder="例如: 黎明屯发货单模板 / 欢乐牧场模板 V1" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="fileType" label="解析文件类型">
              <Select disabled>
                <Select.Option value="excel">Excel 文件 (.xlsx/.xls)</Select.Option>
                <Select.Option value="word">Word 文件 (.docx)</Select.Option>
                <Select.Option value="pdf">PDF 电子发票/确认单 (.pdf)</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: "1",
              label: "1. 字段与列映射 (Mappings)",
              children: renderMappingEditor()
            },
            {
              key: "3",
              label: "2. 结构提取规则 (Rules)",
              children: (
                <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
                  {fileTypeVal === "excel" && (
                    <>
                      <Card title="Excel 物理行列定位" size="small" style={{ marginBottom: 12 }}>
                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item name="headerRow" label="表头行索引 (从1开始)">
                              <Input type="number" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name="dataStartRow" label="数据起始行 (从1开始)">
                              <Input type="number" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name="dataEndRowOffset" label="尾部干扰行数 (跳过最后几行)">
                              <Input type="number" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item name="skipRowsWith" label="跳过数据区包含以下关键字的行 (英文逗号分隔)">
                          <Input placeholder="合计,总计,制单人" />
                        </Form.Item>
                      </Card>

                      <Card 
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>🔄 矩阵转置 (针对 SKU × 门店/日期 展开)</span>
                            <Form.Item name="matrixPivotEnabled" valuePropName="checked" style={{ margin: 0 }}>
                              <Switch />
                            </Form.Item>
                          </div>
                        } 
                        size="small" 
                        style={{ marginBottom: 12 }}
                      >
                        {matrixPivotEnabledVal && (
                          <Row gutter={16}>
                            <Col span={8}>
                              <Form.Item name="pivotHeaderRow" label="门店所在的列头行号">
                                <Input type="number" />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item name="pivotColumnsStart" label="矩阵起始列索引 (从1开始)">
                                <Input type="number" />
                              </Form.Item>
                            </Col>
                            <Col span={24}>
                              <Form.Item 
                                name="skuFieldsStr" 
                                label="左侧固定 SKU 属性与对应列头配置 (JSON 数组)" 
                                extra='例如: [{"field": "skuCode", "column": "SKU物品编码"}]'
                              >
                                <Input.TextArea rows={3} />
                              </Form.Item>
                            </Col>
                          </Row>
                        )}
                      </Card>

                      <Card 
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>📥 尾部/非标准区域元数据提取 (例如提取底部的收货门店/收件人)</span>
                            <Form.Item name="footerExtractionEnabled" valuePropName="checked" style={{ margin: 0 }}>
                              <Switch />
                            </Form.Item>
                          </div>
                        } 
                        size="small" 
                        style={{ marginBottom: 12 }}
                      >
                        {footerExtractionEnabledVal && (
                          <Form.Item 
                            name="footerFieldsStr" 
                            label="独立字段单元格坐标/关键字提取配置 (JSON 数组)"
                            extra='例: [{"field": "receiverStore", "type": "keyword-offset", "keyword": "收货门店", "offset": {"row":0,"col":0}}, {"field": "receiverName", "type": "cell", "cell": {"row": -2, "col": 2}}]'
                          >
                            <Input.TextArea rows={4} />
                          </Form.Item>
                        )}
                      </Card>

                      <Card 
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>🔗 跨行合并/数据聚合 (针对同一配送单号的多行SKU合并)</span>
                            <Form.Item name="rowAggregationEnabled" valuePropName="checked" style={{ margin: 0 }}>
                              <Switch />
                            </Form.Item>
                          </div>
                        } 
                        size="small" 
                        style={{ marginBottom: 12 }}
                      >
                        {rowAggregationEnabledVal && (
                          <Form.Item name="groupByField" label="分组聚合标准字段 (如 externalCode)">
                            <Input />
                          </Form.Item>
                        )}
                      </Card>

                      <Card 
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>🎴 卡片式多区域堆叠 (非标准表格，每个卡片是一个记录)</span>
                            <Form.Item name="cardLayoutEnabled" valuePropName="checked" style={{ margin: 0 }}>
                              <Switch />
                            </Form.Item>
                          </div>
                        } 
                        size="small"
                      >
                        {cardLayoutEnabledVal && (
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item name="cardStartRegex" label="卡片起始行匹配正则 (第一列)">
                                <Input placeholder="▶" />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="tableStartRowOffset" label="明细小表格起始行偏移">
                                <Input type="number" />
                              </Form.Item>
                            </Col>
                            <Col span={24}>
                              <Form.Item 
                                name="cardFieldsStr" 
                                label="卡片内元数据提取配置 (相对偏移 JSON 数组)"
                                extra='例: [{"field": "externalCode", "relativeCell": {"row": 1, "col": 2}}]'
                              >
                                <Input.TextArea rows={3} />
                              </Form.Item>
                            </Col>
                          </Row>
                        )}
                      </Card>
                    </>
                  )}

                  {fileTypeVal !== "excel" && (
                    <>
                      <Card title="纯文本分隔与字段正则提取 (PDF & Word)" size="small">
                        <Form.Item name="splitPattern" label="运单分隔正则 (若一个文档含多个出库单)">
                          <Input placeholder="例: ━━━ 或 --- PAGE_BREAK ---" />
                        </Form.Item>
                        <Form.Item 
                          name="textFieldsStr" 
                          label="运单级字段正则提取配置 (JSON 数组)"
                          extra='例: [{"field": "receiverName", "regexPattern": "收件人[：: ]*(\\\\S+)"}]'
                        >
                          <Input.TextArea rows={4} />
                        </Form.Item>
                        <Divider />
                        <Form.Item name="tableRowRegex" label="明细表格行提取匹配正则">
                          <Input placeholder="例: (\\\\S+)\\\\s*\\\\|\\\\s*(\\\\S+)\\\\s*\\\\|\\\\s*(\\\\d+)" />
                        </Form.Item>
                        <Form.Item 
                          name="tableFieldsStr" 
                          label="明细行捕获组对应的标准字段映射列表 (JSON 数组)"
                          extra='例: ["skuCode", "skuName", "quantity"]'
                        >
                          <Input.TextArea rows={2} />
                        </Form.Item>
                      </Card>
                    </>
                  )}
                </div>
              )
            },
            {
              key: "2",
              label: `3. 试解析测试预览 (${testResult.length} 条数据)`,
              disabled: testResult.length === 0,
              children: (
                <div>
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>试解析成功！以下为使用当前配置试解析出的<strong>前 10 条</strong>测试运单数据：</span>
                    <Tag color="success">解析器正确驱动</Tag>
                  </div>
                  <Table 
                    dataSource={testResult.slice(0, 10).map((r, i) => ({ ...r, key: i }))} 
                    columns={previewColumns}
                    size="small"
                    pagination={false}
                    scroll={{ x: 1200 }}
                  />
                </div>
              )
            }
          ]}
        />
      </Form>
    </Modal>
  );
};
