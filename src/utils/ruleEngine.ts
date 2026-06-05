import * as XLSX from "xlsx";
import { standardFields } from "./excel";

export interface FieldMapping {
  field: string;
  column?: string;
  columnIndex?: number;
  defaultValue?: string;
  isGuess?: boolean;
}

export interface RuleConfig {
  id?: string;
  templateName?: string;
  fileType: "excel" | "pdf" | "word";
  excel?: {
    sheets?: string[];
    headerRow?: number;
    dataStartRow?: number;
    dataEndRowOffset?: number;
    skipRowsWith?: string[];
    footerExtraction?: {
      enabled: boolean;
      fields: {
        field: string;
        type: "cell" | "keyword-offset";
        cell?: { row: number; col: number };
        keyword?: string;
        offset?: { row: number; col: number };
      }[];
    };
    rowAggregation?: {
      enabled: boolean;
      groupByField: string;
    };
    matrixPivot?: {
      enabled: boolean;
      pivotHeaderRow: number;
      pivotColumnsStart: number;
      skuFields: { field: string; column: string }[];
      targetField: string;
      valueField: string;
    };
    compositeSplit?: {
      enabled: boolean;
      field: string;
      splitPattern: string;
      regexExtract: string;
      skuNameGroup: number;
      qtyGroup: number;
    };
    cardLayout?: {
      enabled: boolean;
      cardStartRegex: string;
      fields: { field: string; relativeCell: { row: number; col: number } }[];
      tableStartRowOffset: number;
      tableEndRegex?: string;
    };
  };
  text?: {
    splitPattern?: string;
    fields: { field: string; regexPattern: string }[];
    tableRowRegex?: string;
    tableFields?: string[];
  };
  mappings: FieldMapping[];
}

/**
 * 根据 standardFields 别名自动建立表头→字段的映射
 * 这是最核心的改进：不再依赖 AI 规则中 mapping 的 column 名必须精确匹配
 */
function buildAutoMapping(headers: string[]): Record<number, string> {
  const mapping: Record<number, string> = {};
  const usedFields = new Set<string>();
  const usedCols = new Set<number>();
  
  // 第一轮：精确相等匹配（优先级最高）
  headers.forEach((header, colIdx) => {
    if (!header) return;
    const h = header.trim();
    if (!h || h.length < 2) return;
    
    for (const sf of standardFields) {
      if (usedFields.has(sf.key)) continue;
      if (sf.aliases.some(alias => h === alias)) {
        mapping[colIdx] = sf.key;
        usedFields.add(sf.key);
        usedCols.add(colIdx);
        break;
      }
    }
  });
  
  // 第二轮：包含匹配（填充未匹配的字段）
  headers.forEach((header, colIdx) => {
    if (usedCols.has(colIdx)) return;
    if (!header) return;
    const h = header.trim();
    if (!h || h.length < 2) return;
    
    for (const sf of standardFields) {
      if (usedFields.has(sf.key)) continue;
      // 表头包含别名（如"发货数量*"包含"发货数量"）
      if (sf.aliases.some(alias => h.includes(alias) && alias.length >= 2)) {
        mapping[colIdx] = sf.key;
        usedFields.add(sf.key);
        usedCols.add(colIdx);
        break;
      }
    }
  });
  
  return mapping;
}

/**
 * 从尾部行中扫描提取收货人信息（通用关键字扫描）
 */
function extractFooterInfo(aoa: any[][], startRow: number): Record<string, string> {
  const meta: Record<string, string> = {};
  
  // 扩充的正则匹配库
  const storeKeywords = "调入门店|调拨门店|收货门店|目标门店|收货店|收货单位|收货机构|收货方|收货店名|收货门店名称|到货门店|分店|调入仓库";
  const nameKeywords = "联系人|收货人|收件人|提货人|到货联系人|收货方联系人|联系人姓名|收货人姓名";
  const phoneKeywords = "联系电话|收货电话|收件电话|收货人电话|电话|手机|联系手机|收货手机|收件人电话";
  const addressKeywords = "收货地址|收件地址|配送地址|到货地址|收货方地址|收件人地址|送货地址|调入地址";

  const allKeywords = [storeKeywords, nameKeywords, phoneKeywords, addressKeywords].join("|");

  for (let r = startRow; r < aoa.length; r++) {
    const row = aoa[r] || [];
    for (let c = 0; c < row.length; c++) {
      const cellStr = String(row[c] || '').trim();
      if (!cellStr) continue;
      
      // 1. 检测 "关键字：值" 在同一个格子里
      const kvRegex = new RegExp(`^(${allKeywords})[：:]\\s*(.+)`, "i");
      const kvMatch = cellStr.match(kvRegex);
      if (kvMatch) {
        const key = kvMatch[1];
        const val = kvMatch[2].trim();
        
        // 如果提取的值是类似 "▶ 调拨记录" 的指示符或者包含大量特殊符号，不作为最终值
        if (val && !val.startsWith("▶")) {
          if (new RegExp(storeKeywords, "i").test(key) && !meta.receiverStore) meta.receiverStore = val;
          else if (new RegExp(nameKeywords, "i").test(key) && !meta.receiverName) meta.receiverName = val;
          else if (new RegExp(phoneKeywords, "i").test(key) && !meta.receiverPhone) meta.receiverPhone = val;
          else if (new RegExp(addressKeywords, "i").test(key) && !meta.receiverAddress) meta.receiverAddress = val;
        }
        continue;
      }
      
      // 2. 检测 "关键字：" 或 "关键字" 在一个格子，值在后面临近几个格子（最多往右找 3 格，防止跨越太远）
      const labelRegex = new RegExp(`^(${allKeywords})[：:]?\\s*$`, "i");
      const labelMatch = cellStr.match(labelRegex);
      if (labelMatch) {
        const key = labelMatch[1];
        let foundVal = "";
        
        for (let offset = 1; offset <= 3; offset++) {
          if (c + offset < row.length) {
            const tempVal = String(row[c + offset] || '').trim();
            if (tempVal && !new RegExp(`^(${allKeywords})`).test(tempVal)) {
              foundVal = tempVal;
              break;
            }
          }
        }
        
        if (foundVal && !foundVal.startsWith("▶")) {
          if (new RegExp(storeKeywords, "i").test(key) && !meta.receiverStore) meta.receiverStore = foundVal;
          else if (new RegExp(nameKeywords, "i").test(key) && !meta.receiverName) meta.receiverName = foundVal;
          else if (new RegExp(phoneKeywords, "i").test(key) && !meta.receiverPhone) meta.receiverPhone = foundVal;
          else if (new RegExp(addressKeywords, "i").test(key) && !meta.receiverAddress) meta.receiverAddress = foundVal;
        }
      }
    }
  }
  
  return meta;
}

/**
 * 从标题行中提取门店名称
 * 如 "尹三顺自助烤肉（银泰店）出库单" → "尹三顺自助烤肉（银泰店）"
 */
function extractStoreFromTitle(aoa: any[][], headerRowIdx: number): string {
  for (let r = 0; r < headerRowIdx; r++) {
    const row = aoa[r] || [];
    const firstCell = String(row[0] || '').trim();
    if (!firstCell) continue;
    // 如果标题包含"出库单"/"发货单"/"配送单"等，提取门店名
    const match = firstCell.match(/^(.+?)(?:出库单|发货单|配送单|调拨单)/);
    if (match) return match[1].trim();
  }
  return "";
}

export class RuleEngine {
  /**
   * 执行 Excel 规则解析 — 核心改进：自动别名匹配 + 多Sheet门店提取 + 健壮尾部扫描
   */
  static parseExcel(workbook: XLSX.WorkBook, rule: RuleConfig): any[] {
    const results: any[] = [];
    const sheetNames = workbook.SheetNames;
    
    let sheetsToParse = sheetNames;
    if (rule.excel?.sheets && rule.excel.sheets.length > 0 && !rule.excel.sheets.includes("*")) {
      sheetsToParse = sheetNames.filter(name => rule.excel?.sheets?.includes(name));
    }

    sheetsToParse.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const aoa: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      if (aoa.length === 0) return;

      const excelRule = rule.excel;

      // ===================== 卡片式布局 =====================
      if (excelRule?.cardLayout?.enabled) {
        const cardRules = excelRule.cardLayout;
        const startRegex = new RegExp(cardRules.cardStartRegex);
        
        const cardIndices: number[] = [];
        aoa.forEach((row, idx) => {
          if (startRegex.test(String(row[0] || ''))) cardIndices.push(idx);
        });

        cardIndices.forEach((startIdx, listIdx) => {
          const endIdx = listIdx < cardIndices.length - 1 ? cardIndices[listIdx + 1] : aoa.length;
          
          // 提取卡片级字段（收货人等）
          const cardMeta: Record<string, any> = {};
          
          // 通用扫描卡片区域内所有的收货信息（做回补）
          const scannedMeta = extractFooterInfo(aoa.slice(startIdx, endIdx), 0);

          cardRules.fields.forEach(f => {
            const relRow = f.relativeCell.row - 1;
            const relCol = f.relativeCell.col - 1;
            const tr = startIdx + relRow;
            if (tr < aoa.length && relCol < (aoa[tr]?.length || 0)) {
              let val = String(aoa[tr][relCol] || '').trim();
              
              // 自动剥离冒号：
              if (val.includes("：") || val.includes(":")) {
                const parts = val.split(/[：:]/);
                val = parts.slice(1).join("：").trim();
              }
              
              // 脏数据识别：如果取到的值是分隔符、字段名或标签，则视为空
              const isLabel = /^(调入门店|调拨门店|收货门店|目标门店|收货店|收货单位|收货机构|收货方|联系人|收货人|收件人|提货人|联系电话|收货电话|收件电话|电话|手机|收货地址|收件地址|配送地址|地址)[：:]?$/i.test(val);
              const isStartMarker = val.startsWith("▶") || val.startsWith("►");
              
              if (val && !isLabel && !isStartMarker) {
                cardMeta[f.field] = val;
              }
            }
          });

          // 用通用扫描提取出来的高精度信息，进行安全回补与覆盖
          const fieldsToBackfill: Array<keyof typeof cardMeta> = ["receiverStore", "receiverName", "receiverPhone", "receiverAddress"];
          fieldsToBackfill.forEach(key => {
            if (scannedMeta[key] && (!cardMeta[key] || cardMeta[key] === "")) {
              cardMeta[key] = scannedMeta[key];
            }
          });

          // 解析卡片内小表
          const tableStartIdx = startIdx + (cardRules.tableStartRowOffset || 3);
          const tableHeaders = (aoa[tableStartIdx] || []).map((h: any) => String(h || '').trim());
          const autoMap = buildAutoMapping(tableHeaders);
          
          for (let i = tableStartIdx + 1; i < endIdx; i++) {
            const rowData = aoa[i];
            if (!rowData || rowData.every((c: any) => c === "")) break;
            if (cardRules.tableEndRegex && new RegExp(cardRules.tableEndRegex).test(String(rowData[0] || ''))) break;
            if (excelRule.skipRowsWith?.some(w => rowData.some((c: any) => String(c).includes(w)))) continue;

            const item: Record<string, any> = { ...cardMeta };
            // 用自动映射填充
            Object.entries(autoMap).forEach(([colStr, fieldKey]) => {
              const ci = Number(colStr);
              if (ci < rowData.length) {
                item[fieldKey] = String(rowData[ci] || '').trim();
              }
            });
            // 也用 rule.mappings 补充
            rule.mappings.forEach(m => {
              if (m.defaultValue !== undefined && m.defaultValue !== "") {
                if (!item[m.field]) item[m.field] = m.defaultValue;
              }
            });

            if (Object.values(item).some(v => v !== "" && v !== undefined)) {
              results.push(item);
            }
          }
        });
        return;
      }

      // ===================== 矩阵转置 =====================
      if (excelRule?.matrixPivot?.enabled) {
        const pivotRule = excelRule.matrixPivot;
        const pivotHeaderIdx = pivotRule.pivotHeaderRow - 1;
        const headerRow = aoa[pivotHeaderIdx] || [];
        
        const dataStartIdx = (excelRule.dataStartRow || 3) - 1;
        const dataEndIdx = aoa.length - (excelRule.dataEndRowOffset || 0);

        const skuColumns = pivotRule.skuFields;

        for (let i = dataStartIdx; i < dataEndIdx; i++) {
          const rowData = aoa[i];
          if (!rowData || rowData.every((c: any) => c === "")) continue;
          if (excelRule.skipRowsWith?.some(w => rowData.some((c: any) => String(c).includes(w)))) continue;

          const skuValues: Record<string, any> = {};
          skuColumns.forEach(sc => {
            const colIdx = headerRow.findIndex((h: any) => String(h).trim() === sc.column || String(h).trim().includes(sc.column));
            if (colIdx !== -1) skuValues[sc.field] = String(rowData[colIdx] || '').trim();
          });

          const colStartIdx = pivotRule.pivotColumnsStart - 1;
          for (let j = colStartIdx; j < rowData.length; j++) {
            const qtyStr = String(rowData[j] || '').trim();
            if (!qtyStr || qtyStr === "0") continue;
            const qty = Number(qtyStr);
            if (isNaN(qty) || qty <= 0) continue;

            const storeName = String(headerRow[j] || '').trim();
            if (!storeName) continue;

            const record: Record<string, any> = {
              ...skuValues,
              [pivotRule.targetField]: storeName,
              [pivotRule.valueField]: qty
            };
            rule.mappings.forEach(m => {
              if (m.defaultValue && !record[m.field]) record[m.field] = m.defaultValue;
            });
            results.push(record);
          }
        }
        return;
      }

      // ===================== 标准表格 =====================
      
      // 智能寻找表头行：优先使用规则中的 headerRow，否则自动探测
      let headerRowIdx = (excelRule?.headerRow || 1) - 1;
      
      // 如果规则没指定或指定的行不像表头，自动探测
      const specifiedHeaders = (aoa[headerRowIdx] || []).map((h: any) => String(h || '').trim());
      const specifiedMatchCount = specifiedHeaders.filter((h: string) => 
        h && standardFields.some(f => f.aliases.some(a => h.includes(a)))
      ).length;
      
      if (specifiedMatchCount < 2) {
        // 自动找匹配最多的行作为表头
        let bestCount = specifiedMatchCount;
        for (let r = 0; r < Math.min(10, aoa.length); r++) {
          const row = aoa[r] || [];
          const rowStr = row.map((c: any) => String(c || '').trim());
          const cnt = rowStr.filter((s: string) => s && standardFields.some(f => f.aliases.some(a => s.includes(a)))).length;
          if (cnt > bestCount) {
            bestCount = cnt;
            headerRowIdx = r;
          }
        }
      }
      
      const headers = (aoa[headerRowIdx] || []).map((h: any) => String(h || '').trim());
      const dataStartIdx = (excelRule?.dataStartRow || headerRowIdx + 2) - 1;
      const dataEndOffset = excelRule?.dataEndRowOffset || 0;
      
      // 智能计算数据结束行：找到"合计"/"总计"行或空行密集区
      let dataEndIdx = aoa.length - dataEndOffset;
      for (let i = dataStartIdx; i < aoa.length; i++) {
        const row = aoa[i] || [];
        const firstCell = String(row[0] || '').trim();
        if (/^合计|^总计/.test(firstCell)) {
          dataEndIdx = i;
          break;
        }
      }

      // 建立自动映射（核心改进！）
      const autoMap = buildAutoMapping(headers);
      
      // 也建立规则 mapping 中 column 的精确/模糊映射
      const ruleMappingIdx: Record<string, number> = {};
      rule.mappings.forEach(m => {
        if (m.column) {
          let ci = headers.indexOf(m.column);
          if (ci === -1) ci = headers.findIndex(h => h && (h.includes(m.column!) || m.column!.includes(h)));
          if (ci !== -1) ruleMappingIdx[m.field] = ci;
        } else if (m.columnIndex !== undefined) {
          ruleMappingIdx[m.field] = m.columnIndex;
        }
      });

      // 提取尾部/头部元数据
      const globalMeta: Record<string, any> = {};
      
      // 方法1：使用规则中的 footerExtraction
      if (excelRule?.footerExtraction?.enabled) {
        excelRule.footerExtraction.fields.forEach(f => {
          if (f.type === "cell" && f.cell) {
            let tr = f.cell.row < 0 ? aoa.length + f.cell.row : f.cell.row - 1;
            const tc = f.cell.col - 1;
            if (tr >= 0 && tr < aoa.length && tc >= 0 && tc < (aoa[tr]?.length || 0)) {
              globalMeta[f.field] = String(aoa[tr][tc] || '').trim();
            }
          } else if (f.type === "keyword-offset" && f.keyword && f.offset) {
            for (let r = 0; r < aoa.length; r++) {
              for (let c = 0; c < (aoa[r]?.length || 0); c++) {
                const val = String(aoa[r][c] || '');
                if (val.includes(f.keyword)) {
                  const tr = r + f.offset.row;
                  const tc = c + f.offset.col;
                  if (tr >= 0 && tr < aoa.length && tc >= 0 && tc < (aoa[tr]?.length || 0)) {
                    let text = String(aoa[tr][tc] || '').trim();
                    // 如果关键字和值在同一格子里（如"收货门店：某某店"），提取冒号后面的部分
                    if (f.offset.row === 0 && f.offset.col === 0 && /[:：]/.test(val)) {
                      const parts = val.split(/[:：]/);
                      if (parts.length > 1) text = parts.slice(1).join(":").trim();
                    }
                    if (text) globalMeta[f.field] = text;
                  }
                  return; // 只取第一个匹配
                }
              }
            }
          }
        });
      }
      
      // 方法2：通用尾部扫描（自动补充未提取到的收货信息）
      if (!globalMeta.receiverName && !globalMeta.receiverStore) {
        const footerMeta = extractFooterInfo(aoa, dataEndIdx);
        Object.entries(footerMeta).forEach(([k, v]) => {
          if (!globalMeta[k]) globalMeta[k] = v;
        });
      }
      
      // 方法3：从标题行提取门店名（如"尹三顺自助烤肉（银泰店）出库单"）
      if (!globalMeta.receiverStore) {
        const titleStore = extractStoreFromTitle(aoa, headerRowIdx);
        if (titleStore) globalMeta.receiverStore = titleStore;
      }

      // 遍历解析数据行
      const parsedRows: any[] = [];
      for (let i = Math.max(headerRowIdx + 1, dataStartIdx); i < dataEndIdx; i++) {
        const rowData = aoa[i];
        if (!rowData || rowData.every((c: any) => c === "")) continue;
        if (excelRule?.skipRowsWith?.some(w => rowData.some((c: any) => String(c).includes(w)))) continue;

        const item: Record<string, any> = { ...globalMeta };

        // 优先使用自动映射（别名匹配）
        Object.entries(autoMap).forEach(([colStr, fieldKey]) => {
          const ci = Number(colStr);
          if (ci < rowData.length) {
            const val = String(rowData[ci] || '').trim();
            if (val) item[fieldKey] = val;
          }
        });
        
        // 再用规则 mapping 补充（包含 defaultValue）
        Object.entries(ruleMappingIdx).forEach(([fieldKey, ci]) => {
          if (!item[fieldKey] && ci < rowData.length) {
            const val = String(rowData[ci] || '').trim();
            if (val) item[fieldKey] = val;
          }
        });
        
        rule.mappings.forEach(m => {
          if (m.defaultValue !== undefined && m.defaultValue !== "") {
            if (!item[m.field]) item[m.field] = m.defaultValue;
          }
        });

        // 复合单元格拆分
        if (excelRule?.compositeSplit?.enabled && excelRule.compositeSplit.field) {
          const splitRule = excelRule.compositeSplit;
          const targetValue = String(item[splitRule.field] || '');
          if (targetValue) {
            const subItems = targetValue.split(new RegExp(splitRule.splitPattern));
            subItems.forEach(sub => {
              const clean = sub.trim();
              if (!clean) return;
              const match = clean.match(new RegExp(splitRule.regexExtract));
              if (match) {
                const subItem = { ...item };
                subItem["skuName"] = match[splitRule.skuNameGroup]?.trim();
                subItem["quantity"] = Number(match[splitRule.qtyGroup]);
                parsedRows.push(subItem);
              }
            });
            continue;
          }
        }

        // 过滤掉没有任何实质数据的行
        const hasData = ["skuCode", "skuName", "quantity", "receiverStore", "receiverName"].some(
          k => item[k] && String(item[k]).trim() !== ""
        );
        if (hasData) {
          parsedRows.push(item);
        }
      }

      // 跨行聚合
      if (excelRule?.rowAggregation?.enabled && excelRule.rowAggregation.groupByField) {
        const groupField = excelRule.rowAggregation.groupByField;
        let lastValid: any = null;
        parsedRows.forEach(row => {
          if (lastValid && row[groupField] && row[groupField] === lastValid[groupField]) {
            ["receiverName", "receiverPhone", "receiverAddress", "receiverStore"].forEach(f => {
              if (!row[f] && lastValid[f]) row[f] = lastValid[f];
            });
          }
          if (row.receiverName || row.receiverStore) lastValid = row;
        });
      }

      results.push(...parsedRows);
    });

    return results;
  }

  /**
   * PDF/Word 纯文本解析
   */
  static parseText(text: string, rule: RuleConfig): any[] {
    const results: any[] = [];
    const textRule = rule.text;
    if (!textRule) return results;

    let records = [text];
    if (textRule.splitPattern) {
      records = text.split(new RegExp(textRule.splitPattern)).map(r => r.trim()).filter(Boolean);
    }

    records.forEach(recordText => {
      const recordData: Record<string, any> = {};

      textRule.fields.forEach(f => {
        try {
          const regex = new RegExp(f.regexPattern);
          const match = recordText.match(regex);
          if (match && match[1]) recordData[f.field] = match[1].trim();
        } catch (e) {
          // 正则无效时跳过
        }
      });

      rule.mappings.forEach(m => {
        if (m.defaultValue && !recordData[m.field]) recordData[m.field] = m.defaultValue;
      });

      if (textRule.tableRowRegex && textRule.tableFields) {
        const rowRegex = new RegExp(textRule.tableRowRegex, 'g');
        const lines = recordText.split("\n");
        let hasItems = false;

        lines.forEach(line => {
          rowRegex.lastIndex = 0;
          const match = rowRegex.exec(line);
          if (match) {
            const item = { ...recordData };
            textRule.tableFields!.forEach((fk, idx) => {
              const mv = match[idx + 1];
              if (mv !== undefined) {
                if (fk === "quantity" || fk === "weight") {
                  item[fk] = Number(mv.trim());
                } else if (fk !== "_index") {
                  item[fk] = mv.trim();
                }
              }
            });
            results.push(item);
            hasItems = true;
          }
        });

        if (!hasItems && Object.keys(recordData).length > 0) {
          results.push(recordData);
        }
      } else {
        if (Object.keys(recordData).length > 0) results.push(recordData);
      }
    });

    return results;
  }
}
