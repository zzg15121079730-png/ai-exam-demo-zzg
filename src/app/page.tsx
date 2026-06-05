"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Layout, Card, Row, Col, Button, Select, Progress, Typography, Table, 
  Space, Tag, Modal, message, Divider, Input, Empty, Spin, DatePicker,
  Collapse, Form, Tooltip
} from "antd";
import type { Dayjs } from 'dayjs';
import {
  UploadOutlined, FileTextOutlined, CheckCircleOutlined,
  SyncOutlined, SearchOutlined, ReloadOutlined, ExportOutlined,
  SettingOutlined, RobotOutlined, ThunderboltOutlined, EyeOutlined,
  DeleteOutlined, CopyOutlined, EditOutlined, CloseCircleOutlined
} from "@ant-design/icons";
import { UploadZone } from "@/components/UploadZone";
import { DataGrid } from "@/components/DataGrid";
import { MappingModal } from "@/components/MappingModal";
import { RuleConfig, RuleEngine } from "@/utils/ruleEngine";
import { standardFields, guessMapping } from "@/utils/excel";
import { validateData, validateStandardData, ValidationError } from "@/utils/validation";
import * as XLSX from "xlsx";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function Home() {
  // ========= 状态管理 =========
  const [step, setStep] = useState<"idle" | "parsing" | "preview" | "submitting" | "done" | "failed">("idle");
  const [progress, setProgress] = useState({ percent: 0, current: 0, total: 0, label: "" });
  const [submitting, setSubmitting] = useState(false);
  const [parseError, setParseError] = useState("");
  
  // 规则相关
  const [rulesList, setRulesList] = useState<any[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string>("ai-detect");
  const [rulesLoading, setRulesLoading] = useState(false);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [aiRule, setAiRule] = useState<RuleConfig | null>(null);
  const [fileColumns, setFileColumns] = useState<string[]>([]);

  // AI 配置相关
  const [aiConfig, setAiConfig] = useState({
    apiKey: "",
    apiBaseUrl: "https://api.deepseek.com/v1",
    modelName: "deepseek-chat"
  });

  // 数据相关
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
  const [submitResult, setSubmitResult] = useState<{ success: number; skipped: number; total: number } | null>(null);
  const [searchDateRange, setSearchDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  // ========= 加载 localStorage 配置 =========
  useEffect(() => {
    const savedApiKey = localStorage.getItem("ai_api_key");
    const savedBaseUrl = localStorage.getItem("ai_base_url");
    const savedModel = localStorage.getItem("ai_model_name");
    // 从 localStorage 恢复配置（API Key 主要由后端 env 提供，前端可选覆盖）
    const finalModel = savedModel || "deepseek-chat";
    const finalUrl = savedBaseUrl || "https://api.deepseek.com/v1";
    const finalKey = savedApiKey || "";
    setAiConfig({
      apiKey: finalKey,
      apiBaseUrl: finalUrl,
      modelName: finalModel
    });
    fetchRules();
    fetchHistory();
  }, []);

  const saveAiConfig = (key: string, val: string) => {
    setAiConfig(prev => {
      const next = { ...prev, [key]: val };
      localStorage.setItem(`ai_${key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)}`, val);
      return next;
    });
    message.success("AI 大模型配置保存成功");
  };

  // ========= 获取解析规则列表 =========
  const fetchRules = async () => {
    setRulesLoading(true);
    try {
      const res = await fetch("/api/mapping");
      const data = await res.json();
      if (res.ok) {
        setRulesList(data.rules || []);
      }
    } catch (e) {
      console.error("加载解析规则失败:", e);
    } finally {
      setRulesLoading(false);
    }
  };

  // ========= 历史列表 =========
  const fetchHistory = async (page = 1, searchOverride?: string, dateOverride?: [Dayjs | null, Dayjs | null] | null | 'clear') => {
    setHistoryLoading(true);
    try {
      const searchVal = searchOverride !== undefined ? searchOverride : (searchCode || searchName);
      const dates = dateOverride === 'clear' ? null : (dateOverride !== undefined ? dateOverride : searchDateRange);
      const params = new URLSearchParams({ page: String(page), search: searchVal || '' });
      if (dates && dates[0]) params.set('startDate', dates[0].startOf('day').toISOString());
      if (dates && dates[1]) params.set('endDate', dates[1].endOf('day').toISOString());
      const res = await fetch(`/api/waybills?${params.toString()}`);
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

  // ========= 进度条动画模拟 =========
  const simulateProgress = (total: number, label: string, onComplete: () => void) => {
    let currentStep = 0;
    const totalSteps = 20;
    const timer = setInterval(() => {
      currentStep++;
      const percent = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      const current = Math.min(total, Math.round((percent / 100) * total));
      
      if (currentStep >= totalSteps) {
        clearInterval(timer);
        setProgress({ percent: 100, current: total, total, label: "解析完成" });
        setTimeout(onComplete, 200);
      } else {
        setProgress({ percent, current, total, label });
      }
    }, 20);
  };

  // ========= 上传文件并处理 =========
  const handleFileSelect = async (file: File) => {
    setCurrentFile(file);
    setFileName(file.name);
    setStep("parsing");
    
    // 如果用户选择新建解析规则（大模型 AI 辅助）
    if (selectedRuleId === "ai-detect") {
      setProgress({ percent: 10, current: 0, total: 100, label: "正在上传并分析文件物理特征..." });
      
      try {
        // 1. 调用后端接口分析文件特征，生成样本数据
        const analyzeFormData = new FormData();
        analyzeFormData.append("file", file);
        const analyzeRes = await fetch("/api/mapping/analyze-file", {
          method: "POST",
          body: analyzeFormData
        });
        
        if (!analyzeRes.ok) {
          const err = await analyzeRes.json();
          throw new Error(err.error || "文件特征分析失败");
        }
        
        const analyzeData = await analyzeRes.json();

        // 提取 Excel 原始表头列名，供 MappingModal 下拉选择
        if (analyzeData.excelSample?.sheets?.[0]?.aoa) {
          const aoa = analyzeData.excelSample.sheets[0].aoa;
          // 找到第一个非空行作为表头（通常是第2行，第1行可能是说明文字）
          let headerRow = aoa[0] || [];
          for (let i = 0; i < Math.min(aoa.length, 5); i++) {
            const row = aoa[i] || [];
            const nonEmpty = row.filter((c: any) => c !== "" && c != null).length;
            if (nonEmpty >= 3) { headerRow = row; break; }
          }
          setFileColumns(headerRow.filter((c: any) => c !== "" && c != null).map(String));
        } else {
          setFileColumns([]);
        }
        
        // 2. 调用大模型（或启发式回退）生成推荐规则
        setProgress({ percent: 50, current: 0, total: 100, label: "大模型正在智能推理匹配规则..." });
        const generateRes = await fetch("/api/mapping/generate-rule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileType: analyzeData.fileType,
            fileName: file.name,
            excelSample: analyzeData.excelSample,
            sampleTextText: analyzeData.sampleTextText || analyzeData.textSample || "",
            apiKey: aiConfig.apiKey,
            apiBaseUrl: aiConfig.apiBaseUrl,
            modelName: aiConfig.modelName
          })
        });

        let generateData: any;
        try {
          generateData = await generateRes.json();
        } catch {
          throw new Error("大模型接口返回了无效响应，请检查 API Key 和 Base URL 配置");
        }

        if (!generateRes.ok && !generateData?.rule) {
          throw new Error(generateData?.error || "大模型规则推理失败");
        }
        
        if (generateData.warning) {
          message.warning(generateData.warning, 5);
        }
        
        // 3. 开启规则确认弹窗
        setAiRule(generateData.rule);
        setRuleModalOpen(true);
        setStep("idle"); // 规则模态框开启，主页返回就绪
      } catch (err: any) {
        message.error("大模型分析文件失败: " + err.message);
        setParseError(err.message || "大模型分析文件特征失败");
        setStep("failed");
      }
    } else {
      // 如果用户选择了已有的规则，直接执行解析
      const chosenRule = rulesList.find(r => r.id === selectedRuleId);
      if (!chosenRule) {
        message.error("未找到所选解析规则，请检查");
        setStep("idle");
        return;
      }
      
      const ruleConfig: RuleConfig = JSON.parse(chosenRule.mappings);
      await executeParse(file, ruleConfig);
    }
  };

  // 执行最终解析
  const executeParse = async (file: File, rule: RuleConfig) => {
    setStep("parsing");
    setProgress({ percent: 10, current: 0, total: 100, label: "正在执行规则解析引擎..." });

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      
      // 对于 Excel，为了极高效率和防卡顿，如果行数合理，我们直接在前台用 RuleEngine 跑
      if (rule.fileType === "excel" && (ext === "xlsx" || ext === "xls")) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            let parsedRows = RuleEngine.parseExcel(workbook, rule);
            
            // 如果 AI 规则未解析出数据，自动降级到 guessMapping 标准匹配
            if (parsedRows.length === 0) {
              console.warn("AI 规则未解析出数据，自动降级到标准表头匹配模式");
              const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
              const aoaData: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });
              
              // 智能找表头行
              let bestHdrIdx = 0;
              let bestCount = 0;
              for (let r = 0; r < Math.min(10, aoaData.length); r++) {
                const row = aoaData[r] || [];
                const cnt = row.filter((c: any) => {
                  const s = String(c).trim();
                  return s && standardFields.some(f => f.aliases.some(a => s.includes(a)));
                }).length;
                if (cnt > bestCount) { bestCount = cnt; bestHdrIdx = r; }
              }
              
              const hdrs = (aoaData[bestHdrIdx] || []).map((h: any) => String(h || '').trim());
              const autoMapping = guessMapping(hdrs);
              
              // 用标准映射解析所有 sheet
              workbook.SheetNames.forEach(sName => {
                const ws = workbook.Sheets[sName];
                const sAoa: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
                
                // 重新找该 sheet 的表头
                let sheetHdrIdx = 0;
                let sheetBestCount = 0;
                for (let r = 0; r < Math.min(10, sAoa.length); r++) {
                  const row = sAoa[r] || [];
                  const cnt = row.filter((c: any) => {
                    const s = String(c).trim();
                    return s && standardFields.some(f => f.aliases.some(a => s.includes(a)));
                  }).length;
                  if (cnt > sheetBestCount) { sheetBestCount = cnt; sheetHdrIdx = r; }
                }
                
                const sheetHdrs = (sAoa[sheetHdrIdx] || []).map((h: any) => String(h || '').trim());
                const sheetMapping = guessMapping(sheetHdrs);
                
                for (let i = sheetHdrIdx + 1; i < sAoa.length; i++) {
                  const rowData = sAoa[i];
                  if (!rowData || rowData.every((c: any) => c === "")) continue;
                  if (rowData.some((c: any) => String(c).includes("合计") || String(c).includes("总计"))) continue;
                  
                  const item: Record<string, any> = {};
                  Object.entries(sheetMapping).forEach(([header, fieldKey]) => {
                    if (fieldKey) {
                      const ci = sheetHdrs.indexOf(header);
                      if (ci !== -1 && ci < rowData.length) {
                        item[fieldKey] = String(rowData[ci] || '').trim();
                      }
                    }
                  });
                  
                  // 过滤掉完全空的行
                  if (Object.values(item).some(v => v !== "")) {
                    parsedRows.push(item);
                  }
                }
              });
              
              if (parsedRows.length > 0) {
                message.info(`AI 规则模式未匹配，已自动切换到标准表头匹配模式，成功解析 ${parsedRows.length} 条`);
              }
            }
            
            if (parsedRows.length === 0) {
              message.error("未能解析出任何有效记录，请检查文件格式");
              setStep("idle");
              return;
            }

            simulateProgress(parsedRows.length, `正在对 ${parsedRows.length} 条数据进行物理约束校验...`, () => {
              // 自动将规则定义的静态默认值或映射字段填充，并执行标准校验
              // 为 mappings 里的 defaultValue 补全数据
              const completedRows = parsedRows.map(row => {
                const completed = { ...row };
                rule.mappings.forEach(m => {
                  if (m.defaultValue !== undefined && m.defaultValue !== "" && (completed[m.field] === undefined || completed[m.field] === "")) {
                    completed[m.field] = m.defaultValue;
                  }
                });
                return completed;
              });

              const { validData: vData, errors: eData } = validateStandardData(completedRows);
              setValidData(vData);
              setErrors(eData);
              setStep("preview");
              message.success(`解析完成，共解析出 ${vData.length} 条数据`);
              checkDbDuplicates(vData, eData);
            });

          } catch (err: any) {
            message.error("执行前端解析引擎出错: " + err.message);
            setStep("idle");
          }
        };
        reader.readAsBinaryString(file);
      } else {
        // PDF、Word 或者大文件，直接调后端接口解析
        const formData = new FormData();
        formData.append("file", file);
        formData.append("rule", JSON.stringify(rule));
        formData.append("apiKey", aiConfig.apiKey);
        formData.append("apiBaseUrl", aiConfig.apiBaseUrl);
        formData.append("modelName", aiConfig.modelName);

        const res = await fetch("/api/mapping/parse-file", {
          method: "POST",
          body: formData
        });
        const parseData = await res.json();
        
        if (!res.ok) {
          throw new Error(parseData.error || "后端解析失败");
        }

        simulateProgress(parseData.count, "正在对解析到的数据进行物理约束校验...", () => {
          const completedRows = (parseData.data || []).map((row: any) => {
            const completed = { ...row };
            rule.mappings.forEach(m => {
              if (m.defaultValue !== undefined && m.defaultValue !== "" && (completed[m.field] === undefined || completed[m.field] === "")) {
                completed[m.field] = m.defaultValue;
              }
            });
            return completed;
          });

          const { validData: vData, errors: eData } = validateStandardData(completedRows);
          setValidData(vData);
          setErrors(eData);
          setStep("preview");
          message.success(`解析完成，共解析出 ${vData.length} 条数据`);
          checkDbDuplicates(vData, eData);
        });
      }
    } catch (err: any) {
      message.error("解析文件失败: " + err.message);
      setParseError(err.message || "解析文件引擎执行失败");
      setStep("failed");
    }
  };



  // ========= 手动配置规则入口 =========
  const handleManualConfigure = () => {
    const initialRule: RuleConfig = {
      templateName: "手动配置解析规则",
      fileType: currentFile?.name.split('.').pop()?.toLowerCase() === "pdf" ? "pdf" : 
                currentFile?.name.split('.').pop()?.toLowerCase() === "docx" ? "word" : "excel",
      startRowRegex: "",
      endRowRegex: "",
      tableRowRegex: "",
      mappings: standardFields.map(f => ({
        field: f.key,
        columnName: "",
        defaultValue: "",
        regex: ""
      }))
    };
    setAiRule(initialRule);
    setRuleModalOpen(true);
  };

  // ========= 模态框规则确认并保存 =========
  const handleRuleModalConfirm = async (confirmedRule: RuleConfig, parsedData?: any[]) => {
    setRuleModalOpen(false);
    setStep("parsing");
    setProgress({ percent: 30, current: 0, total: 100, label: "正在保存规则..." });

    try {
      // 后台保存规则（不阻塞主流程）
      fetch("/api/mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fingerprint: `custom-${confirmedRule.templateName}-${Date.now()}`,
          mappings: confirmedRule,
          templateName: confirmedRule.templateName
        })
      }).then(async (saveRes) => {
        if (saveRes.ok) {
          const saved = await saveRes.json();
          fetchRules();
          if (saved.rule?.id) setSelectedRuleId(saved.rule.id);
        }
      }).catch(() => {});

      // 直接使用 MappingModal 中用户已编辑确认的数据
      if (parsedData && parsedData.length > 0) {
        setProgress({ percent: 60, current: 0, total: parsedData.length, label: "正在校验数据..." });
        const { validData: vData, errors: eData } = validateStandardData(parsedData);
        setValidData(vData);
        setErrors(eData);
        setStep("preview");
        message.success(`共 ${vData.length} 条数据已就绪`);
        checkDuplicatesAsync(vData);
      } else if (currentFile) {
        await executeParse(currentFile, confirmedRule);
      } else {
        setStep("idle");
      }
    } catch (e: any) {
      message.error("处理失败: " + e.message);
      setStep("idle");
    }
  };

  // ========= 数据库重复检查（防抖） =========
  const dbCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const checkDbDuplicates = useCallback((currentData: any[], _currentErrors: ValidationError[]) => {
    const codesToCheck = currentData.map(r => r.externalCode).filter(Boolean);
    if (codesToCheck.length === 0) return;
    
    // 防抖 500ms
    if (dbCheckTimer.current) clearTimeout(dbCheckTimer.current);
    dbCheckTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/waybills/check-duplicates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codes: codesToCheck })
        });
        const dbData = await res.json();
        if (dbData.duplicates?.length > 0) {
          const dbErrors: ValidationError[] = [];
          currentData.forEach((row, i) => {
            if (row.externalCode && dbData.duplicates.includes(row.externalCode)) {
              dbErrors.push({
                row: i + 1,
                field: "externalCode",
                fieldLabel: "外部编码",
                message: "与数据库已存在数据重复",
              });
            }
          });
          setErrors(prev => [...prev.filter(e => e.message !== "与数据库已存在数据重复"), ...dbErrors]);
        } else {
          setErrors(prev => prev.filter(e => e.message !== "与数据库已存在数据重复"));
        }
      } catch (e) {}
    }, 500);
  }, []);

  // ========= 数据编辑回调 =========
  const handleDataChange = useCallback((newData: any[]) => {
    const { validData: vData, errors: eData } = validateStandardData(newData);
    setValidData(vData);
    setErrors(eData);
    checkDbDuplicates(vData, eData);
  }, [checkDbDuplicates]);

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

  const handleSubmit = async () => {
    const realErrors = errors.filter(e => !e.isWarning);
    if (realErrors.length > 0) {
      message.error(`还有 ${realErrors.length} 处数据错误，请先修正后再提交`);
      return;
    }
    if (validData.length === 0) return;

    setSubmitting(true);
    setStep("submitting");
    setSubmitResult(null);
    setProgress({ percent: 0, current: 0, total: validData.length, label: "正在提交数据..." });
    
    let currentStep = 0;
    const totalSteps = 20;
    const timer = setInterval(() => {
      currentStep++;
      const percent = Math.min(95, Math.round((currentStep / totalSteps) * 95));
      const current = Math.min(validData.length, Math.round((percent / 100) * validData.length));
      setProgress({ percent, current, total: validData.length, label: "数据批量入库中..." });
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
        const resData = await res.json();
        const skipped = resData.skippedDuplicates || 0;
        const successCount = resData.count || 0;
        setSubmitResult({ success: successCount, skipped, total: validData.length });
        message.success(`成功提交 ${successCount} 条运单数据！`);
        setStep("done");
      } else {
        const errData = await res.json().catch(() => ({}));
        message.error(errData.error || "提交失败，请稍后重试");
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

  // 错误汇总两列分流 (仅针对非 Warning 的严重错误)
  const realErrors = errors.filter(e => !e.isWarning);
  const col1Errors = realErrors.slice(0, Math.ceil(realErrors.length / 2));
  const col2Errors = realErrors.slice(Math.ceil(realErrors.length / 2));

  // 已导入运单列表列定义
  const historyColumns = [
    { title: '外部编码', dataIndex: 'externalCode', width: 140 },
    { title: '收货门店', dataIndex: 'receiverStore', width: 150, 
      render: (text: string) => text ? <Tag color="cyan">{text}</Tag> : '-' 
    },
    { title: '收件人姓名', dataIndex: 'receiverName', width: 100 },
    { title: '收件人电话', dataIndex: 'receiverPhone', width: 120 },
    { title: '收件人地址', dataIndex: 'receiverAddress', width: 220, ellipsis: true },
    { title: 'SKU编码', dataIndex: 'skuCode', width: 120 },
    { title: 'SKU名称', dataIndex: 'skuName', width: 140, ellipsis: true },
    { title: '数量', dataIndex: 'quantity', width: 70, align: 'center' as const },
    { title: '导入时间', dataIndex: 'createdAt', width: 160,
      render: (text: string) => text ? new Date(text).toLocaleString('zh-CN') : '-'
    },
    { title: '状态', key: 'status', width: 80, align: 'center' as const,
      render: () => <Tag color="success">已入库</Tag>
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f9f9' }}>
      <Content style={{ padding: '24px 32px', maxWidth: 1500, margin: '0 auto', width: '100%' }}>
        
        {/* ===== 页面标题与鲸天主题风格对齐 ===== */}
        <div style={{ 
          marginBottom: 24, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'linear-gradient(90deg, #0fc6c2 0%, #08979c 100%)',
          padding: '16px 24px',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(15, 198, 194, 0.15)'
        }}>
          <div>
            <Title level={3} style={{ margin: 0, color: '#fff' }}>🌊 鲸天万能智能文件导入系统 V2</Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>大模型解析规则推理 · 全格式通用引擎驱动 · 极端性能优化校验</Text>
          </div>
          <Space>
            <Tag color="white" style={{ color: '#0fc6c2', fontWeight: 'bold' }}>Next.js App Router</Tag>
            <Tag color="white" style={{ color: '#0fc6c2', fontWeight: 'bold' }}>Prisma ORM</Tag>
            <Tag color="white" style={{ color: '#08979c', fontWeight: 'bold' }}>DeepSeek AI</Tag>
          </Space>
        </div>

        {/* ===== AI 大模型配置面板 (直接平铺展示) ===== */}
        <div style={{ marginBottom: 20 }}>
          <Card 
            size="small"
            variant="borderless" 
            style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            title={
              <span style={{ fontWeight: 500, color: '#4e5969' }}>
                <RobotOutlined style={{ color: '#0fc6c2', marginRight: 8 }} />
                智能大模型接口配置 (当前已默认配置 VBCode.io 考试专用密钥)
              </span>
            }
          >
            <Form layout="inline" size="middle" style={{ gap: 12 }}>
              <Form.Item label="API Key">
                <Input.Password 
                  placeholder="DEEPSEEK_API_KEY" 
                  value={aiConfig.apiKey} 
                  onChange={e => saveAiConfig("apiKey", e.target.value)}
                  style={{ width: 320 }}
                />
              </Form.Item>
              <Form.Item label="Base URL">
                <Input 
                  placeholder="https://www.vbcode.io/v1" 
                  value={aiConfig.apiBaseUrl} 
                  onChange={e => saveAiConfig("apiBaseUrl", e.target.value)}
                  style={{ width: 240 }}
                />
              </Form.Item>
              <Form.Item label="Model Name">
                <Input 
                  placeholder="deepseek-chat" 
                  value={aiConfig.modelName} 
                  onChange={e => saveAiConfig("modelName", e.target.value)}
                  style={{ width: 160 }}
                />
              </Form.Item>
            </Form>
          </Card>
        </div>

        <Row gutter={24}>
          {/* ===== 左侧：导入区域 ===== */}
          <Col xs={24} lg={16}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontWeight: 'bold' }}>📤 模块一 & 二：解析规则选择与文件上传</span>
                  {rulesLoading && <Spin size="small" />}
                </div>
              }
              variant="borderless"
              style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}
            >
              <div style={{ marginBottom: 20 }}>
                <span style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#4e5969' }}>
                  请先选择匹配该文件的解析规则模板：
                </span>
                <Select
                  style={{ width: '100%', height: 40 }}
                  value={selectedRuleId}
                  onChange={setSelectedRuleId}
                  options={[
                    { label: "✨ 新建解析规则 (通过大模型 AI 预处理分析)", value: "ai-detect" },
                    ...rulesList.map(r => ({ label: `📋 [已存模板] ${r.templateName || r.fingerprint}`, value: r.id }))
                  ]}
                />
                {/* 规则管理操作按钮 */}
                {selectedRuleId && selectedRuleId !== "ai-detect" && (
                  <Space style={{ marginTop: 8 }}>
                    <Button 
                      size="small" type="link" danger
                      icon={<DeleteOutlined />}
                      onClick={async () => {
                        const rule = rulesList.find(r => r.id === selectedRuleId);
                        if (!rule) return;
                        Modal.confirm({
                          title: "确认删除该解析规则？",
                          content: `规则名称：${rule.templateName || rule.fingerprint}`,
                          okText: "删除",
                          okButtonProps: { danger: true },
                          onOk: async () => {
                            try {
                              await fetch(`/api/mapping?id=${rule.id}`, { method: "DELETE" });
                              message.success("规则已删除");
                              setSelectedRuleId("ai-detect");
                              fetchRules();
                            } catch { message.error("删除失败"); }
                          }
                        });
                      }}
                    >删除规则</Button>
                    <Button 
                      size="small" type="link"
                      icon={<CopyOutlined />}
                      onClick={async () => {
                        const rule = rulesList.find(r => r.id === selectedRuleId);
                        if (!rule) return;
                        try {
                          const mappings = typeof rule.mappings === 'string' ? JSON.parse(rule.mappings) : rule.mappings;
                          await fetch("/api/mapping", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              fingerprint: `${rule.fingerprint}-copy-${Date.now()}`,
                              mappings,
                              templateName: `${rule.templateName || "规则"} (副本)`
                            })
                          });
                          message.success("规则已复制");
                          fetchRules();
                        } catch { message.error("复制失败"); }
                      }}
                    >复制规则</Button>
                    <Button 
                      size="small" type="link"
                      icon={<EditOutlined />}
                      onClick={() => {
                        const rule = rulesList.find(r => r.id === selectedRuleId);
                        if (!rule) return;
                        try {
                          const parsed = typeof rule.mappings === 'string' ? JSON.parse(rule.mappings) : rule.mappings;
                          setAiRule(parsed);
                          setRuleModalOpen(true);
                        } catch { message.error("规则格式解析失败"); }
                      }}
                    >编辑规则</Button>
                  </Space>
                )}
              </div>

              {step !== "parsing" && step !== "failed" && !validData.length && (
                <UploadZone onFileSelect={handleFileSelect} />
              )}
              
              {/* 解析实时进度条 */}
              {step === "parsing" && (
                <div style={{ marginTop: 24, padding: '16px 20px', backgroundColor: '#fafafa', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text strong style={{ color: '#0fc6c2' }}>{progress.label}</Text>
                    <Text type="secondary">{progress.percent}%</Text>
                  </div>
                  <Progress 
                    percent={progress.percent} 
                    showInfo={false} 
                    size={['100%', 10]} 
                    status="active"
                    strokeColor={{ from: '#0fc6c2', to: '#13c2c2' }}
                  />
                </div>
              )}

              {/* 解析失败状态展示 */}
              {step === "failed" && currentFile && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ 
                    padding: '20px 24px', 
                    backgroundColor: '#fff1f0', 
                    border: '1px solid #ffccc7', 
                    borderRadius: 12,
                    marginBottom: 20
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 24, marginTop: 2 }} />
                      <div>
                        <h4 style={{ margin: 0, color: '#cf1322', fontSize: 16, fontWeight: 'bold' }}>解析文件失败</h4>
                        <p style={{ margin: '8px 0 0 0', color: '#ff4d4f', fontSize: 14 }}>
                          错误详情：{parseError || "系统解析引擎未匹配到任何订单行或大模型调用失败，请检查模型配置、文件规范或规则模板。"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 原始文件信息 */}
                  <Card 
                    size="small"
                    title={<span style={{ fontWeight: 'bold' }}>📄 原始上传文件物理特征</span>}
                    style={{ marginBottom: 20, borderRadius: 8 }}
                  >
                    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '8px 0', color: '#86909c', width: '20%' }}>文件名</td>
                          <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#1d2129' }}>{currentFile.name}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '8px 0', color: '#86909c' }}>文件大小</td>
                          <td style={{ padding: '8px 0' }}>{(currentFile.size / 1024).toFixed(2)} KB</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 0', color: '#86909c' }}>文件类型</td>
                          <td style={{ padding: '8px 0' }}><Tag color="blue">{currentFile.name.split('.').pop()?.toUpperCase()}</Tag></td>
                        </tr>
                      </tbody>
                    </table>
                  </Card>

                  {/* 手动处理引导与操作 */}
                  <Space size="middle" wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button 
                      onClick={() => {
                        setStep("idle");
                        setCurrentFile(null);
                        setFileName("");
                        setParseError("");
                        setValidData([]);
                        setErrors([]);
                      }}
                    >
                      放弃并重新上传
                    </Button>
                    
                    <Button 
                      type="primary" 
                      onClick={handleManualConfigure}
                      style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
                    >
                      ⚙️ 手动配置规则模板
                    </Button>

                    <Button 
                      type="primary"
                      style={{ backgroundColor: '#0fc6c2', borderColor: '#0fc6c2' }}
                      onClick={async () => {
                        const chosenRule = rulesList.find(r => r.id === selectedRuleId);
                        if (chosenRule) {
                          const ruleConfig = JSON.parse(chosenRule.mappings);
                          await executeParse(currentFile, ruleConfig);
                        } else if (selectedRuleId === "ai-detect") {
                          await handleFileSelect(currentFile);
                        } else {
                          message.error("请选择一个可用的解析规则");
                        }
                      }}
                    >
                      🔄 换用选中规则重新解析
                    </Button>
                  </Space>
                </div>
              )}

              {/* 上传成功状态展示 */}
              {step !== "idle" && step !== "parsing" && step !== "failed" && fileName && validData.length > 0 && (
                <div style={{ 
                  marginTop: 20, padding: '12px 20px', 
                  backgroundColor: '#e6fffb', border: '1px solid #87e8de', borderRadius: 8,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span>
                    <CheckCircleOutlined style={{ color: '#0fc6c2', marginRight: 8, fontSize: 16 }} />
                    已成功解析文件: <Text strong style={{ color: '#006d75' }}>{fileName}</Text>，共 <Text strong style={{ color: '#0fc6c2', fontSize: 16 }}>{validData.length}</Text> 条出库单 SKU 明细
                  </span>
                  <Button type="primary" size="small" onClick={() => setStep("preview")} style={{ backgroundColor: '#0fc6c2', borderColor: '#0fc6c2' }}>
                    打开预览网格
                  </Button>
                </div>
              )}
            </Card>

            {/* ===== 架构优势卡片 ===== */}
            <Card
              title={<span>🚀 万能智能解析核心能力</span>}
              variant="borderless"
              style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}
            >
              <Row gutter={16} style={{ color: '#4e5969', lineHeight: '28px' }}>
                <Col span={12}>
                  <p>• <strong>无硬编码适配</strong>：基于高度通用规则引擎配置，杜绝针对单文件的if-else逻辑</p>
                  <p>• <strong>AI 辅助规则分析</strong>：支持大模型极速提取表头、定位尾部数据并生成推荐规则</p>
                  <p>• <strong>试解析测试验证</strong>：内置数据流试运行检测，支持预览无误后再确认入库</p>
                </Col>
                <Col span={12}>
                  <p>• <strong>多样物理提取</strong>：支持表尾散落定位、跨行继承合并、矩阵门店行列转置</p>
                  <p>• <strong>高性能处理</strong>：纯前端秒级处理数千行 Excel 解析与校验，大列表毫秒级响应不卡死</p>
                  <p>• <strong>全格式兼容</strong>：支持常规 Excel，以及 PDF、Word 纯文本提取及字段正则捕捉</p>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* ===== 右侧：快捷工具 + 字段提示 ===== */}
          <Col xs={24} lg={8}>
            <Card 
              title="⚡ 快捷操作" 
              variant="borderless" 
              style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}
              size="small"
            >
              <div style={{ padding: 12 }}>
                <Button 
                  type="primary" block size="large"
                  style={{ marginBottom: 12, height: 45, backgroundColor: '#0fc6c2', borderColor: '#0fc6c2' }}
                  disabled={validData.length === 0}
                  onClick={() => setStep("preview")}
                  icon={<EyeOutlined />}
                >
                  打开预览数据纠错弹窗
                </Button>
                <Button 
                  block 
                  icon={<ExportOutlined />}
                  size="large"
                  style={{ marginBottom: 12, height: 45 }}
                  disabled={validData.length === 0}
                  onClick={exportExcel}
                >
                  导出 Excel
                </Button>
                <Button 
                  block 
                  icon={<ReloadOutlined />}
                  size="large"
                  style={{ height: 45 }}
                  onClick={() => fetchHistory()}
                >
                  刷新运单列表
                </Button>
              </div>
            </Card>

            <Card 
              title="📑 下单字段定义与规范" 
              variant="borderless" 
              style={{ borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}
              size="small"
            >
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <th style={{ padding: '8px 0', textAlign: 'left', color: '#86909c' }}>字段名</th>
                    <th style={{ padding: '8px 0', textAlign: 'center', color: '#86909c', width: 50 }}>必填</th>
                    <th style={{ padding: '8px 0', textAlign: 'left', color: '#86909c' }}>业务说明</th>
                  </tr>
                </thead>
                <tbody>
                  {standardFields.map(f => (
                    <tr key={f.key} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{f.label}</td>
                      <td style={{ padding: '6px 0', textAlign: 'center' }}>
                        {f.required ? 
                          <Tag color="red" style={{ margin: 0, fontSize: 10 }}>是</Tag> : 
                          <Tag style={{ margin: 0, fontSize: 10 }}>否</Tag>}
                      </td>
                      <td style={{ padding: '6px 0', color: '#86909c', fontSize: 12 }}>
                        {f.key === 'externalCode' && '订单唯一编号，用于去重聚合'}
                        {f.key === 'receiverStore' && '收货门店名称'}
                        {f.key === 'receiverName' && '收件人姓名'}
                        {f.key === 'receiverPhone' && '收货联系人手机/座机电话'}
                        {f.key === 'receiverAddress' && '收货人完整详细地址'}
                        {f.key === 'skuCode' && 'SKU 编码，用于区分出库商品'}
                        {f.key === 'skuName' && 'SKU 名称，出库商品明细'}
                        {f.key === 'quantity' && '发货件数，必须为正整数'}
                        {f.key === 'skuSpec' && '物品规格型号描述'}
                        {f.key === 'remark' && '其他附言备注信息'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </Col>
        </Row>

        {/* ============================================ */}
        {/* ===== 预览网格与纠错 Modal (核心交互) ===== */}
        {/* ============================================ */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18, fontWeight: 'bold' }}>
                {step === "submitting" ? "⏳ 批量运单正在保存入库..." : 
                 step === "done" ? "✅ 出库单提交成功" : "📊 出库运单导入预览与行内实时纠错"}
              </span>
              {step === "preview" && fileName && (
                <Tag color="processing">{fileName}</Tag>
              )}
            </div>
          }
          open={step === "preview" || step === "submitting" || step === "done"}
          onCancel={() => {
            if (step === "submitting") return;
            setStep("idle");
          }}
          width={1400}
          mask={{ closable: false }}
          keyboard={step !== "submitting"}
          destroyOnHidden={false}
          styles={{ body: { maxHeight: '72vh', overflow: 'auto' } }}
          footer={
            step === "done" ? (
              <Button 
                type="primary" 
                onClick={() => { setStep("idle"); setValidData([]); setErrors([]); setFileName(""); setSubmitResult(null); fetchHistory(); }}
                style={{ backgroundColor: '#0fc6c2', borderColor: '#0fc6c2' }}
              >
                关闭预览并返回首页
              </Button>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {realErrors.length > 0 && (
                    <Text type="danger" style={{ fontWeight: 'bold' }}>⚠ 当前仍有 {realErrors.length} 处物理校验错误，请根据表格内高亮提示修正后再提交下单</Text>
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
                    disabled={realErrors.length > 0 || validData.length === 0}
                    size="large"
                    style={{ backgroundColor: '#0fc6c2', borderColor: '#0fc6c2' }}
                  >
                    {realErrors.length > 0 ? `修正 ${realErrors.length} 处错误后提交` : "✅ 确认提交下单"}
                  </Button>
                </Space>
              </div>
            )
          }
        >
          {/* 提交进度 */}
          {step === "submitting" && (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <Progress type="circle" percent={progress.percent} size={120} strokeColor="#0fc6c2" />
              <h3 style={{ marginTop: 20, color: '#333' }}>{progress.label}</h3>
              <Text type="secondary">
                总体导入进度: {progress.percent}% · 已解析完成 {progress.current}/{progress.total} 行运单 SKU
              </Text>
            </div>
          )}
          
          {/* 提交成功汇总 */}
          {step === "done" && (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 72, color: '#0fc6c2' }} />
              <h2 style={{ marginTop: 20, color: '#333' }}>批量出库运单提交入库成功！</h2>
              <div style={{
                margin: '20px auto', padding: '16px 32px',
                backgroundColor: '#e6fffb', border: '1px solid #87e8de',
                borderRadius: 8, display: 'inline-block', textAlign: 'left',
              }}>
                <p style={{ margin: '4px 0', fontSize: 15 }}>
                  ✅ 成功写入数据库：<Text strong style={{ fontSize: 18, color: '#0fc6c2' }}>{submitResult?.success ?? 0}</Text> 条记录
                </p>
                {(submitResult?.skipped ?? 0) > 0 && (
                  <p style={{ margin: '4px 0', fontSize: 15 }}>
                    ⚠️ 跳过数据库已存在外部编码：<Text strong style={{ fontSize: 18, color: '#faad14' }}>{submitResult?.skipped}</Text> 条
                  </p>
                )}
                <p style={{ margin: '4px 0', fontSize: 15 }}>
                  📦 同批次总明细：<Text strong>{submitResult?.total ?? 0}</Text> 条
                </p>
              </div>
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">运单已持久化至 Neon 云端 PostgreSQL 数据库关系表中。</Text>
              </div>
            </div>
          )}

          {/* 预览表格 */}
          {step === "preview" && validData.length > 0 && (
            <>
              <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Tag color="cyan">当前共 {validData.length} 行</Tag>
                  {realErrors.length > 0 && (
                    <Tag color="error">含有错误的行数: {new Set(realErrors.map(e => e.row)).size} 行</Tag>
                  )}
                </Space>
                {realErrors.length > 0 && (
                  <Button 
                    type="primary" 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      const errorRowIndexes = new Set(realErrors.map(e => e.row - 1));
                      const cleanedData = validData.filter((_, idx) => !errorRowIndexes.has(idx));
                      handleDataChange(cleanedData);
                      message.success(`已删除所有含有物理校验错误的行数据`);
                    }}
                  >
                    一键删除所有不合规行
                  </Button>
                )}
              </div>
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
              {realErrors.length > 0 && (
                <div style={{ 
                  marginTop: 16, 
                  backgroundColor: '#fff2f0', 
                  border: '1px solid #ffccc7', 
                  borderRadius: 8, 
                  padding: '16px 20px' 
                }}>
                  <div style={{ color: '#cf1322', fontWeight: 'bold', fontSize: 14, marginBottom: 8 }}>
                    ❌ 行内异常与物理约束报错汇总 ({realErrors.length} 处)
                  </div>
                  <Row gutter={16}>
                    <Col span={12}>
                      {col1Errors.map((e, i) => (
                        <div key={i} style={{ color: '#cf1322', lineHeight: '24px', fontSize: 13 }}>
                          • 第 {e.row} 行，[{e.fieldLabel}]：{e.message}
                        </div>
                      ))}
                    </Col>
                    <Col span={12}>
                      {col2Errors.map((e, i) => (
                        <div key={i} style={{ color: '#cf1322', lineHeight: '24px', fontSize: 13 }}>
                          • 第 {e.row} 行，[{e.fieldLabel}]：{e.message}
                        </div>
                      ))}
                    </Col>
                  </Row>
                </div>
              )}
            </>
          )}
        </Modal>

        {/* ===== 模块五：已导入运单列表 (历史数据) ===== */}
        <Card
          title={<span>📦 模块五：已导入历史出库运单列表</span>}
          variant="borderless"
          style={{ borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}
          extra={
            <Space wrap>
              <Input
                placeholder="搜索外部编码"
                prefix={<SearchOutlined />}
                size="small"
                style={{ width: 140 }}
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                onPressEnter={() => fetchHistory(1)}
              />
              <Input
                placeholder="搜索收件人"
                prefix={<SearchOutlined />}
                size="small"
                style={{ width: 140 }}
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                onPressEnter={() => fetchHistory(1)}
              />
              <DatePicker.RangePicker
                size="small"
                style={{ width: 240 }}
                value={searchDateRange as any}
                onChange={(dates) => setSearchDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                placeholder={['开始日期', '结束日期']}
                allowClear
              />
              <Button size="small" type="primary" onClick={() => fetchHistory(1)} style={{ backgroundColor: '#0fc6c2', borderColor: '#0fc6c2' }}>
                搜索
              </Button>
              <Button size="small" icon={<ReloadOutlined />} onClick={() => { 
                setSearchCode(""); 
                setSearchName(""); 
                setSearchDateRange(null);
                fetchHistory(1, "", 'clear'); 
              }}>
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
              onChange: (p: number) => fetchHistory(p),
              showTotal: (total) => `共 ${total} 条记录`,
              showSizeChanger: false,
            }}
            size="middle"
            scroll={{ x: 1400 }}
            columns={historyColumns}
            locale={{ emptyText: <Empty description="暂无导入记录，请在上方上传出库单文件" /> }}
          />
        </Card>
      </Content>

      {/* ===== 规则微调与试解析弹框 ===== */}
      {ruleModalOpen && (
        <MappingModal
          isOpen={ruleModalOpen}
          file={currentFile}
          initialRule={aiRule}
          sourceColumns={fileColumns}
          onConfirm={handleRuleModalConfirm}
          onCancel={() => {
            setRuleModalOpen(false);
            setStep("idle");
          }}
        />
      )}
    </Layout>
  );
}
