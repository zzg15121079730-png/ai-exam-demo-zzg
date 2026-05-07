"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Layout, Card, Row, Col, Button, Select, Progress, Typography, Table, 
  Space, Tag, Modal, message, Divider, Input, Empty, Spin
} from "antd";
import {
  UploadOutlined, FileTextOutlined, CheckCircleOutlined,
  SyncOutlined, SearchOutlined, ReloadOutlined, ExportOutlined
} from "@ant-design/icons";
import { UploadZone } from "@/components/UploadZone";
import { DataGrid } from "@/components/DataGrid";
import { parseExcelFile, guessMapping, generateFingerprint, standardFields } from "@/utils/excel";
import { validateData, validateStandardData, ValidationError } from "@/utils/validation";
import * as XLSX from "xlsx";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function Home() {
  // ========= 状态管理 =========
  const [step, setStep] = useState<"idle" | "parsing" | "preview" | "submitting" | "done">("idle");
  const [progress, setProgress] = useState({ percent: 0, current: 0, total: 0, label: "" });
  const [submitting, setSubmitting] = useState(false);
  
  // 数据相关
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [validData, setValidData] = useState<any[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [fileName, setFileName] = useState("");
  
  // 历史列表
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [searchName, setSearchName] = useState("");

  // ========= 历史列表 =========
  const fetchHistory = async (page = 1) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/waybills?page=${page}&search=${searchCode || searchName}`);
      const data = await res.json();
      if (res.ok) {
        setHistoryItems(data.items || []);
        setHistoryTotal(data.total || 0);
        setHistoryPage(data.page || 1);
      }
    } catch (e) { 
      console.error(e);
    } finally { 
      setHistoryLoading(false); 
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  // ========= 进度模拟 =========
  const simulateProgress = (total: number, label: string, onComplete: () => void) => {
    let currentStep = 0;
    const totalSteps = 50;
    const timer = setInterval(() => {
      currentStep++;
      const percent = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      const current = Math.min(total, Math.round((percent / 100) * total));
      
      if (currentStep >= totalSteps) {
        clearInterval(timer);
        setProgress({ percent: 100, current: total, total, label: "解析完成" });
        setTimeout(onComplete, 300);
      } else {
        setProgress({ percent, current, total, label });
      }
    }, 30);
  };

  // ========= 文件上传处理 =========
  const handleFileSelect = async (file: File) => {
    setFileName(file.name);
    setStep("parsing");
    setProgress({ percent: 0, current: 0, total: 0, label: "正在读取文件..." });
    
    try {
      const parsed = await parseExcelFile(file);
      
      if (parsed.sheets.length === 0 || parsed.sheets[0].data.length === 0) {
        message.error("文件为空或无有效数据 Sheet，请检查后重试");
        setStep("idle");
        return;
      }
      
      // 选择最佳 sheet
      let bestSheet = parsed.sheets[0];
      let maxMatches = -1;
      for (const sheet of parsed.sheets) {
        const mapped = guessMapping(sheet.headers);
        const matchCount = Object.keys(mapped).length;
        if (matchCount > maxMatches) { maxMatches = matchCount; bestSheet = sheet; }
      }
      
      const headers = bestSheet.headers;
      const data = bestSheet.data;
      setRawHeaders(headers);
      
      const guessed = guessMapping(headers);
      setMapping(guessed);
      
      if (Object.keys(guessed).length === 0) {
        message.warning("未能自动识别列映射，请检查 Excel 表头是否包含标准字段名");
        setStep("idle");
        return;
      }
      
      // 模拟进度条
      setProgress({ percent: 0, current: 0, total: data.length, label: `正在解析 ${file.name}...` });
      simulateProgress(data.length, `正在校验数据 (${data.length} 条)`, () => {
        const { validData: vData, errors: eData } = validateData(data, guessed, headers);
        setValidData(vData);
        setErrors(eData);
        setStep("preview"); // 自动弹出预览弹框
        
        message.info(`已解析 ${vData.length} 条数据，${eData.length > 0 ? `发现 ${eData.length} 处错误` : '全部校验通过'}`);
        
        // 异步检查数据库重复
        const codesToCheck = vData.map(r => r.externalCode).filter(Boolean);
        if (codesToCheck.length > 0) {
          fetch("/api/waybills/check-duplicates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ codes: codesToCheck })
          })
          .then(res => res.json())
          .then(dbData => {
            if (dbData.duplicates?.length > 0) {
              setErrors(prev => {
                const dbErrors: ValidationError[] = [];
                vData.forEach((row, i) => {
                  if (row.externalCode && dbData.duplicates.includes(row.externalCode)) {
                    if (!prev.find(e => e.row === i + 1 && e.field === "externalCode")) {
                      dbErrors.push({ 
                        row: i + 1, field: "externalCode", 
                        fieldLabel: "外部编码", 
                        message: "与数据库已存在数据重复" 
                      });
                    }
                  }
                });
                if (dbErrors.length > 0) {
                  message.warning(`检测到 ${dbErrors.length} 条外部编码与数据库重复`);
                }
                return [...prev, ...dbErrors];
              });
            }
          })
          .catch(() => {});
        }
      });
    } catch (err) {
      message.error("文件解析失败，请确认文件格式正确（支持 .xlsx / .xls）");
      setStep("idle");
    }
  };

  // ========= 数据编辑回调 =========
  const handleDataChange = (newData: any[]) => {
    // 直接校验标准格式数据，不再来回转换（避免数据丢失）
    const { validData: vData, errors: eData } = validateStandardData(newData);
    setValidData(vData);
    setErrors(eData);
  };

  // ========= 导出 Excel =========
  const exportExcel = () => {
    const exportData = validData.map(row => {
      const obj: any = {};
      standardFields.forEach(f => { obj[f.label] = row[f.key] || ""; });
      return obj;
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "导出数据.xlsx");
  };

  // ========= 提交下单 =========
  const handleSubmit = async () => {
    if (errors.length > 0) {
      message.error(`还有 ${errors.length} 处错误未修复，请先修正后再提交`);
      return;
    }
    if (validData.length === 0) return;
    
    setSubmitting(true);
    setStep("submitting");
    setProgress({ percent: 0, current: 0, total: validData.length, label: "正在提交数据..." });
    
    // 提交进度模拟
    let currentStep = 0;
    const totalSteps = 20;
    const timer = setInterval(() => {
      currentStep++;
      const percent = Math.min(95, Math.round((currentStep / totalSteps) * 95));
      const current = Math.min(validData.length, Math.round((percent / 100) * validData.length));
      setProgress({ percent, current, total: validData.length, label: "提交中..." });
      if (currentStep >= totalSteps) clearInterval(timer);
    }, 80);

    try {
      const res = await fetch("/api/waybills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: validData })
      });
      
      clearInterval(timer);
      setProgress({ percent: 100, current: validData.length, total: validData.length, label: "提交完成" });
      
      if (res.ok) {
        message.success(`成功提交 ${validData.length} 条运单数据！`);
        setStep("done");
        setTimeout(() => {
          setStep("idle");
          setValidData([]);
          setErrors([]);
          setFileName("");
          setProgress({ percent: 0, current: 0, total: 0, label: "" });
          fetchHistory();
        }, 2500);
      } else {
        message.error("提交失败，请稍后重试");
        setStep("preview");
      }
    } catch (e) {
      clearInterval(timer);
      message.error("网络错误，提交失败");
      setStep("preview");
    } finally {
      setSubmitting(false);
    }
  };

  // ========= 错误汇总(分两列) =========
  const col1Errors = errors.slice(0, Math.ceil(errors.length / 2));
  const col2Errors = errors.slice(Math.ceil(errors.length / 2));

  // ========= 历史表格列定义 =========
  const historyColumns = [
    { title: '外部编码', dataIndex: 'externalCode', width: 160 },
    { title: '发件人姓名', dataIndex: 'senderName', width: 100 },
    { title: '发件人电话', dataIndex: 'senderPhone', width: 120 },
    { title: '收件人姓名', dataIndex: 'receiverName', width: 100 },
    { title: '收件人电话', dataIndex: 'receiverPhone', width: 120 },
    { title: '重量(kg)', dataIndex: 'weight', width: 80, align: 'center' as const },
    { title: '件数', dataIndex: 'quantity', width: 60, align: 'center' as const },
    { title: '温层', dataIndex: 'tempZone', width: 70, align: 'center' as const,
      render: (text: string) => {
        const colorMap: Record<string, string> = { '常温': 'default', '冷藏': 'blue', '冷冻': 'cyan' };
        return <Tag color={colorMap[text] || 'default'}>{text}</Tag>;
      }
    },
    { title: '导入时间', dataIndex: 'createdAt', width: 160,
      render: (text: string) => text ? new Date(text).toLocaleString('zh-CN') : '-'
    },
    { title: '状态', key: 'status', width: 80, align: 'center' as const,
      render: () => <Tag color="success">已入库</Tag>
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Content style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        
        {/* ===== 页面标题 ===== */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>📦 物流运单智能导入系统</Title>
            <Text type="secondary">支持多模板自动识别 · Excel 在线编辑 · 一键批量下单</Text>
          </div>
          <Space>
            <Tag color="blue">Next.js + Ant Design</Tag>
            <Tag color="green">TypeScript</Tag>
            <Tag color="purple">PostgreSQL</Tag>
          </Space>
        </div>

        <Row gutter={24}>
          {/* ===== 左侧：导入区 ===== */}
          <Col xs={24} lg={16}>
            <Card 
              title={<span>📤 模块一：模板管理与文件导入</span>}
              bordered={false}
              style={{ marginBottom: 24, borderRadius: 8 }}
            >
              <UploadZone onFileSelect={handleFileSelect} />
              
              {/* 导入进度条 */}
              {step === "parsing" && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text strong>{progress.label}</Text>
                    <Text type="secondary">{progress.percent}% ({progress.current}/{progress.total})</Text>
                  </div>
                  <Progress 
                    percent={progress.percent} 
                    showInfo={false} 
                    strokeWidth={12} 
                    status="active"
                    strokeColor={{ from: '#1677ff', to: '#52c41a' }}
                  />
                </div>
              )}

              {/* 上传成功提示 */}
              {step !== "idle" && step !== "parsing" && fileName && (
                <div style={{ 
                  marginTop: 16, padding: '8px 16px', 
                  backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    已加载: <Text strong>{fileName}</Text>，共 {validData.length} 条数据
                  </span>
                  <Button type="link" size="small" onClick={() => setStep("preview")}>
                    重新查看预览
                  </Button>
                </div>
              )}
            </Card>

            {/* ===== 功能描述卡片 ===== */}
            <Card
              title={<span>📋 模块二 & 三：数据预览与提交下单</span>}
              bordered={false}
              style={{ marginBottom: 24, borderRadius: 8 }}
            >
              <div style={{ color: '#666', lineHeight: '28px' }}>
                <p>• 上传 Excel 后自动弹出<Text strong>预览弹框</Text>，以类 Excel 表格展示所有数据</p>
                <p>• 支持<Text strong>单元格点击编辑</Text>，Tab/Enter 切换，修改后即时重新校验</p>
                <p>• 错误单元格<Text type="danger" strong>红色高亮 + 行内文字提示</Text>，一次性展示全部错误</p>
                <p>• 支持<Text strong>删除行、新增空行、导出 Excel</Text></p>
                <p>• 全部校验通过后，点击「确认提交」将数据持久化到数据库</p>
              </div>
            </Card>
          </Col>

          {/* ===== 右侧：字段说明 + 快捷操作 ===== */}
          <Col xs={24} lg={8}>
            <Card 
              title="📑 标准字段说明" 
              bordered={false} 
              style={{ marginBottom: 24, borderRadius: 8 }}
              size="small"
            >
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <th style={{ padding: '6px 0', textAlign: 'left', color: '#666' }}>字段名</th>
                    <th style={{ padding: '6px 0', textAlign: 'center', color: '#666', width: 40 }}>必填</th>
                    <th style={{ padding: '6px 0', textAlign: 'left', color: '#666' }}>说明</th>
                  </tr>
                </thead>
                <tbody>
                  {standardFields.map(f => (
                    <tr key={f.key} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '5px 0', fontWeight: 500 }}>{f.label}</td>
                      <td style={{ padding: '5px 0', textAlign: 'center' }}>
                        {f.required ? <Tag color="red" style={{ margin: 0, fontSize: 11 }}>是</Tag> : 
                          <Tag style={{ margin: 0, fontSize: 11 }}>否</Tag>}
                      </td>
                      <td style={{ padding: '5px 0', color: '#999', fontSize: 12 }}>
                        {f.key === 'externalCode' && '唯一编号，用于去重'}
                        {f.key === 'senderName' && '寄件人姓名'}
                        {f.key === 'senderPhone' && '寄件人联系方式'}
                        {f.key === 'senderAddress' && '寄件人完整地址'}
                        {f.key === 'receiverName' && '收货人姓名'}
                        {f.key === 'receiverPhone' && '收货人联系方式'}
                        {f.key === 'receiverAddress' && '收货人完整地址'}
                        {f.key === 'weight' && '货物重量，必须>0'}
                        {f.key === 'quantity' && '包裹数，正整数'}
                        {f.key === 'tempZone' && '常温/冷藏/冷冻'}
                        {f.key === 'remark' && '附加说明信息'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card 
              title="⚡ 快捷操作" 
              bordered={false} 
              style={{ borderRadius: 8 }}
              size="small"
            >
              <Button 
                type="primary" block size="large"
                style={{ marginBottom: 12 }}
                disabled={validData.length === 0}
                onClick={() => setStep("preview")}
              >
                打开预览弹框
              </Button>
              <Button 
                block 
                icon={<ExportOutlined />}
                style={{ marginBottom: 12 }}
                disabled={validData.length === 0}
                onClick={exportExcel}
              >
                导出为 Excel 文件
              </Button>
              <Button 
                block 
                icon={<ReloadOutlined />}
                onClick={() => fetchHistory()}
              >
                刷新运单列表
              </Button>
            </Card>
          </Col>
        </Row>

        {/* ============================================ */}
        {/* ===== 预览弹框 Modal (核心交互) ===== */}
        {/* ============================================ */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18, fontWeight: 'bold' }}>
                {step === "submitting" ? "⏳ 正在提交..." : 
                 step === "done" ? "✅ 提交成功" : "📊 导入数据预览与纠错"}
              </span>
              {step === "preview" && fileName && (
                <Tag color="processing">{fileName}</Tag>
              )}
            </div>
          }
          open={step === "preview" || step === "submitting" || step === "done"}
          onCancel={() => {
            if (step === "submitting") return; // 提交中不允许关闭
            setStep("idle");
          }}
          width={1300}
          maskClosable={false}
          keyboard={step !== "submitting"}
          destroyOnClose={false}
          styles={{ body: { maxHeight: '70vh', overflow: 'auto' } }}
          footer={
            step === "done" ? (
              <Button type="primary" onClick={() => { setStep("idle"); setValidData([]); setErrors([]); setFileName(""); fetchHistory(); }}>
                关闭
              </Button>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {errors.length > 0 && (
                    <Text type="danger">⚠ 共 {errors.length} 处错误，请修复后再提交</Text>
                  )}
                </div>
                <Space>
                  <Button onClick={() => setStep("idle")} disabled={step === "submitting"}>
                    取消
                  </Button>
                  <Button onClick={exportExcel} disabled={step === "submitting"}>
                    导出 Excel
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={handleSubmit} 
                    loading={step === "submitting"}
                    disabled={errors.length > 0 || validData.length === 0}
                    size="large"
                  >
                    {errors.length > 0 ? `修复 ${errors.length} 处错误后提交` : "✅ 确认提交下单"}
                  </Button>
                </Space>
              </div>
            )
          }
        >
          {/* 提交进度 */}
          {step === "submitting" && (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <Progress type="circle" percent={progress.percent} strokeWidth={8} size={120} />
              <h3 style={{ marginTop: 20, color: '#333' }}>{progress.label}</h3>
              <Text type="secondary">
                进度: {progress.percent}% · 已处理 {progress.current}/{progress.total} 条
              </Text>
            </div>
          )}
          
          {/* 提交成功 */}
          {step === "done" && (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a' }} />
              <h2 style={{ marginTop: 20, color: '#333' }}>提交成功！</h2>
              <p style={{ color: '#666' }}>成功导入 <Text strong style={{ fontSize: 18, color: '#52c41a' }}>{validData.length}</Text> 条运单数据到数据库</p>
            </div>
          )}

          {/* 预览表格 */}
          {step === "preview" && validData.length > 0 && (
            <>
              <DataGrid 
                data={validData} 
                errors={errors}
                onDataChange={handleDataChange}
                onRemoveRow={(idx) => { 
                  const n = [...validData]; 
                  n.splice(idx, 1); 
                  handleDataChange(n); 
                }}
                onAddRow={() => { 
                  const emptyRow: any = {};
                  standardFields.forEach(f => { emptyRow[f.key] = ""; });
                  handleDataChange([...validData, emptyRow]); 
                }}
              />
              
              {/* 错误汇总面板 */}
              {errors.length > 0 && (
                <div style={{ 
                  marginTop: 16, 
                  backgroundColor: '#fff2f0', 
                  border: '1px solid #ffccc7', 
                  borderRadius: 6, 
                  padding: '12px 20px' 
                }}>
                  <div style={{ color: '#cf1322', fontWeight: 'bold', fontSize: 14, marginBottom: 8 }}>
                    ❌ 错误汇总 ({errors.length} 处)
                  </div>
                  <Row>
                    <Col span={12}>
                      {col1Errors.map((e, i) => (
                        <div key={i} style={{ color: '#cf1322', lineHeight: '22px', fontSize: 13 }}>
                          • 第 {e.row} 行，{e.fieldLabel}：{e.message}
                        </div>
                      ))}
                    </Col>
                    <Col span={12}>
                      {col2Errors.map((e, i) => (
                        <div key={i} style={{ color: '#cf1322', lineHeight: '22px', fontSize: 13 }}>
                          • 第 {e.row} 行，{e.fieldLabel}：{e.message}
                        </div>
                      ))}
                    </Col>
                  </Row>
                </div>
              )}
            </>
          )}
        </Modal>

        {/* ===== 模块四：已导入运单列表 ===== */}
        <Card
          title={<span>📦 模块四：已导入运单列表</span>}
          bordered={false}
          style={{ borderRadius: 8 }}
          extra={
            <Space>
              <Input
                placeholder="搜索外部编码"
                prefix={<SearchOutlined />}
                size="small"
                style={{ width: 150 }}
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                onPressEnter={() => fetchHistory(1)}
              />
              <Input
                placeholder="搜索收件人"
                prefix={<SearchOutlined />}
                size="small"
                style={{ width: 150 }}
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                onPressEnter={() => fetchHistory(1)}
              />
              <Button size="small" type="primary" onClick={() => fetchHistory(1)}>
                搜索
              </Button>
              <Button size="small" icon={<ReloadOutlined />} onClick={() => { setSearchCode(""); setSearchName(""); fetchHistory(1); }}>
                重置
              </Button>
            </Space>
          }
        >
          <Table
            dataSource={historyItems.map(item => ({ ...item, key: item.id }))}
            loading={historyLoading}
            pagination={{ 
              current: historyPage, 
              total: historyTotal, 
              pageSize: 20, 
              onChange: fetchHistory,
              showTotal: (total) => `共 ${total} 条记录`,
              showSizeChanger: false,
            }}
            size="middle"
            scroll={{ x: 1200 }}
            columns={historyColumns}
            locale={{ emptyText: <Empty description="暂无导入记录，请先上传 Excel 文件" /> }}
          />
        </Card>
      </Content>
    </Layout>
  );
}
