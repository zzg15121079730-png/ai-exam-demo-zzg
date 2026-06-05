import * as XLSX from "xlsx";

export interface FieldMapping {
  field: string;        // 标准字段 (如 externalCode, receiverName, skuCode, skuName, quantity, tempZone 等)
  column?: string;       // 映射的列头名称
  columnIndex?: number;  // 映射的列索引 (0-based)
  defaultValue?: string; // 默认值/静态值
  isGuess?: boolean;     // 是否是 AI 猜测的
}

export interface RuleConfig {
  id?: string;
  templateName?: string;
  fileType: "excel" | "pdf" | "word";
  
  // Excel 专属规则
  excel?: {
    sheets?: string[];      // 哪些 sheet 需要解析，如 ["Sheet1"] 或 ["*"] 表示所有
    headerRow?: number;     // 表头所在行（从1开始，如果无表头为0）
    dataStartRow?: number;  // 数据开始行（从1开始）
    dataEndRowOffset?: number; // 底部跳过几行
    skipRowsWith?: string[]; // 跳过包含这些字符的行，如 ["合计", "总计"]
    
    // 尾部/头部元数据提取
    footerExtraction?: {
      enabled: boolean;
      fields: {
        field: string;      // 目标字段名
        type: "cell" | "keyword-offset";
        cell?: { row: number; col: number }; // 绝对位置（从1开始，负数表示从末尾倒数，如 row: -1 表示倒数第一行）
        keyword?: string;   // 查找的关键字，如 "收货门店："
        offset?: { row: number; col: number }; // 关键字单元格的相对偏移（如 row: 0, col: 1 表示同行右侧一格）
      }[];
    };
    
    // 跨行聚合 (同一单号多行合并)
    rowAggregation?: {
      enabled: boolean;
      groupByField: string; // 根据什么字段分组合并，如 "externalCode"
    };

    // 矩阵转置 (SKU x 门店展开)
    matrixPivot?: {
      enabled: boolean;
      pivotHeaderRow: number;    // 列头维度所在的行，如第2行
      pivotColumnsStart: number; // 矩阵列从第几列开始（从1开始）
      skuFields: { field: string; column: string }[]; // 左侧 SKU 字段及其列名
      targetField: string;       // 列名填充到哪个字段（如 receiverName）
      valueField: string;        // 单元格的值填充到哪个字段（如 quantity）
    };

    // 复合单元格拆分 (如一个单元格内含 "苹果x5\n香蕉x10")
    compositeSplit?: {
      enabled: boolean;
      field: string;          // 目标拆分字段
      splitPattern: string;   // 拆分正则，如 "\\n"
      regexExtract: string;   // 提取 SKU 字段和数量的正则，如 "(.+?)x(\\d+)"
      skuNameGroup: number;   // SKU名称捕获组索引
      qtyGroup: number;       // 数量捕获组索引
    };

    // 卡片式堆叠 (每条记录是一个独立的卡片区域)
    cardLayout?: {
      enabled: boolean;
      cardStartRegex: string; // 标志卡片开始的正则，如 "▶ 调拨记录"
      fields: {
        field: string;
        relativeCell: { row: number; col: number }; // 相对于卡片起始行的偏移 (1-based)
      }[];
      tableStartRowOffset: number; // 表格相对于卡片起始行的偏移
      tableEndRegex?: string;      // 表格结束的文本标志
    };
  };

  // PDF & Word 专属规则 (纯文本解析)
  text?: {
    splitPattern?: string; // 运单拆分标志，例如 "━━━" 或者是 "--- PAGE_BREAK ---"
    fields: {
      field: string;
      regexPattern: string; // 提取字段的正则表达式，如 "电话：\\s*(\\d{11})"
    }[];
    tableRowRegex?: string; // 提取明细表的行正则，如 "(\\w+)\\s*\\|\\s*(.+?)\\s*\\|\\s*(\\d+)"
    tableFields?: string[];  // 明细行对应的属性列表，如 ["skuCode", "skuName", "quantity"]
  };

  // 映射关系
  mappings: FieldMapping[];
}

/**
 * 规则执行引擎
 */
export class RuleEngine {
  /**
   * 执行 Excel 规则解析
   */
  static parseExcel(workbook: XLSX.WorkBook, rule: RuleConfig): any[] {
    const results: any[] = [];
    const sheetNames = workbook.SheetNames;
    
    // 确定要解析的 sheets
    let sheetsToParse = sheetNames;
    if (rule.excel?.sheets && rule.excel.sheets.length > 0 && !rule.excel.sheets.includes("*")) {
      sheetsToParse = sheetNames.filter(name => rule.excel?.sheets?.includes(name));
    }

    sheetsToParse.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      // 转换为二维数组 AoA，方便灵活定位
      const aoa: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      if (aoa.length === 0) return;

      const excelRule = rule.excel;

      // 1. 是否是卡片式布局
      if (excelRule?.cardLayout?.enabled) {
        const cardRules = excelRule.cardLayout;
        const startRegex = new RegExp(cardRules.cardStartRegex);
        
        // 查找所有卡片的起始行索引
        const cardIndices: number[] = [];
        aoa.forEach((row, idx) => {
          const firstCellStr = String(row[0] || '');
          if (startRegex.test(firstCellStr)) {
            cardIndices.push(idx);
          }
        });

        cardIndices.forEach((startIdx, listIdx) => {
          const endIdx = listIdx < cardIndices.length - 1 ? cardIndices[listIdx + 1] : aoa.length;
          
          // 提取卡片级全局字段
          const cardMeta: Record<string, any> = {};
          cardRules.fields.forEach(f => {
            const relRow = f.relativeCell.row - 1; // 转为 0-based
            const relCol = f.relativeCell.col - 1;
            const targetRowIdx = startIdx + relRow;
            if (targetRowIdx < aoa.length && relCol < aoa[targetRowIdx].length) {
              cardMeta[f.field] = String(aoa[targetRowIdx][relCol] || '').trim();
            }
          });

          // 解析卡片内的明细表
          const tableStartIdx = startIdx + cardRules.tableStartRowOffset - 1;
          
          // 获取明细表头
          const tableHeaders = (aoa[tableStartIdx] || []).map(h => String(h || '').trim());
          
          // 读取表格数据行
          for (let i = tableStartIdx + 1; i < endIdx; i++) {
            const rowData = aoa[i];
            if (!rowData || rowData.every(c => c === "")) break; // 遇空行结束明细表
            
            if (cardRules.tableEndRegex && new RegExp(cardRules.tableEndRegex).test(String(rowData[0] || ''))) {
              break;
            }

            // 根据映射转换
            const item: Record<string, any> = { ...cardMeta };
            
            // 填充映射字段
            rule.mappings.forEach(m => {
              if (m.defaultValue !== undefined && m.defaultValue !== "") {
                item[m.field] = m.defaultValue;
              } else if (m.column) {
                const colIdx = tableHeaders.indexOf(m.column);
                if (colIdx !== -1 && colIdx < rowData.length) {
                  item[m.field] = String(rowData[colIdx] || '').trim();
                }
              } else if (m.columnIndex !== undefined && m.columnIndex < rowData.length) {
                item[m.field] = String(rowData[m.columnIndex] || '').trim();
              }
            });

            results.push(item);
          }
        });
        
        return;
      }

      // 2. 是否是矩阵转置布局
      if (excelRule?.matrixPivot?.enabled) {
        const pivotRule = excelRule.matrixPivot;
        const pivotHeaderIdx = pivotRule.pivotHeaderRow - 1;
        const headerRow = aoa[pivotHeaderIdx] || [];
        
        // 数据行起始
        const dataStartIdx = (excelRule.dataStartRow || 3) - 1;
        const dataEndOffset = excelRule.dataEndRowOffset || 0;
        const dataEndIdx = aoa.length - dataEndOffset;

        // 获取 SKU 字段的映射列头
        const skuColumns = pivotRule.skuFields; // [{field, column}]

        // 遍历行
        for (let i = dataStartIdx; i < dataEndIdx; i++) {
          const rowData = aoa[i];
          if (!rowData || rowData.every(c => c === "")) continue;
          
          // 检查跳过关键字
          if (excelRule.skipRowsWith?.some(word => rowData.some(c => String(c).includes(word)))) {
            continue;
          }

          // 提取 SKU 字段值
          const skuValues: Record<string, any> = {};
          skuColumns.forEach(sc => {
            // 在表头行中匹配列名
            const colIdx = headerRow.findIndex(h => String(h).trim() === sc.column);
            if (colIdx !== -1) {
              skuValues[sc.field] = String(rowData[colIdx] || '').trim();
            }
          });

          // 针对矩阵列进行转置
          // 矩阵列从 pivotColumnsStart (1-based) 开始，到行末尾
          const colStartIdx = pivotRule.pivotColumnsStart - 1;
          for (let j = colStartIdx; j < rowData.length; j++) {
            const qtyStr = String(rowData[j] || '').trim();
            if (!qtyStr || qtyStr === "0") continue;
            
            const qty = Number(qtyStr);
            if (isNaN(qty) || qty <= 0) continue; // 只提取有效正数发货数量

            const storeName = String(headerRow[j] || '').trim();
            if (!storeName) continue;

            const record: Record<string, any> = {
              ...skuValues,
              [pivotRule.targetField]: storeName,
              [pivotRule.valueField]: qty
            };

            // 填充其他带默认值或静态值的映射
            rule.mappings.forEach(m => {
              if (m.defaultValue !== undefined && m.defaultValue !== "") {
                record[m.field] = m.defaultValue;
              }
            });

            results.push(record);
          }
        }
        return;
      }

      // 3. 标准表格（可能含干扰头、尾部提取、复合拆分、跨行聚合）
      const headerRowIdx = (excelRule?.headerRow || 1) - 1;
      const headers = (aoa[headerRowIdx] || []).map(h => String(h || '').trim());
      
      const dataStartIdx = (excelRule?.dataStartRow || 2) - 1;
      const dataEndOffset = excelRule?.dataEndRowOffset || 0;
      const dataEndIdx = aoa.length - dataEndOffset;

      // 3.1 提取尾部/头部元数据
      const globalMeta: Record<string, any> = {};
      if (excelRule?.footerExtraction?.enabled) {
        excelRule.footerExtraction.fields.forEach(f => {
          if (f.type === "cell" && f.cell) {
            let targetRowIdx = f.cell.row - 1;
            if (f.cell.row < 0) {
              targetRowIdx = aoa.length + f.cell.row; // 支持倒数
            }
            const colIdx = f.cell.col - 1;
            if (targetRowIdx >= 0 && targetRowIdx < aoa.length && colIdx >= 0 && colIdx < aoa[targetRowIdx].length) {
              globalMeta[f.field] = String(aoa[targetRowIdx][colIdx] || '').trim();
            }
          } else if (f.type === "keyword-offset" && f.keyword && f.offset) {
            // 搜索关键字所在位置
            let found = false;
            for (let r = 0; r < aoa.length; r++) {
              for (let c = 0; c < aoa[r].length; c++) {
                const valStr = String(aoa[r][c] || '');
                if (valStr.includes(f.keyword)) {
                  // 找到关键字，根据偏移定位
                  const targetRowIdx = r + f.offset.row;
                  const targetColIdx = c + f.offset.col;
                  if (targetRowIdx >= 0 && targetRowIdx < aoa.length && targetColIdx >= 0 && targetColIdx < aoa[targetRowIdx].length) {
                    // 还可以用正则从单元格文本里提取，例如 “收货门店：中通蓝网” 提取出 “中通蓝网”
                    let textVal = String(aoa[targetRowIdx][targetColIdx] || '').trim();
                    if (valStr.includes("：") || valStr.includes(":")) {
                      // 如果关键字就在同一个格子里，且包含冒号
                      const parts = valStr.split(/[:：]/);
                      if (parts.length > 1 && f.offset.row === 0 && f.offset.col === 0) {
                        textVal = parts[1].trim();
                      }
                    }
                    globalMeta[f.field] = textVal;
                    found = true;
                    break;
                  }
                }
              }
              if (found) break;
            }
          }
        });
      }

      // 3.2 遍历解析数据行
      const parsedRows: any[] = [];
      for (let i = dataStartIdx; i < dataEndIdx; i++) {
        const rowData = aoa[i];
        if (!rowData || rowData.every(c => c === "")) continue;

        // 检查跳过关键字
        if (excelRule?.skipRowsWith?.some(word => rowData.some(c => String(c).includes(word)))) {
          continue;
        }

        const item: Record<string, any> = { ...globalMeta };

        // 映射常规字段
        rule.mappings.forEach(m => {
          if (m.defaultValue !== undefined && m.defaultValue !== "") {
            item[m.field] = m.defaultValue;
          } else if (m.column) {
            const colIdx = headers.indexOf(m.column);
            if (colIdx !== -1 && colIdx < rowData.length) {
              item[m.field] = String(rowData[colIdx] || '').trim();
            }
          } else if (m.columnIndex !== undefined && m.columnIndex < rowData.length) {
            item[m.field] = String(rowData[m.columnIndex] || '').trim();
          }
        });

        // 3.3 复合单元格拆分
        if (excelRule?.compositeSplit?.enabled && excelRule.compositeSplit.field) {
          const splitRule = excelRule.compositeSplit;
          const targetValue = String(item[splitRule.field] || '');
          
          if (targetValue) {
            // 按拆分字符拆成多个子条目
            const subItems = targetValue.split(new RegExp(splitRule.splitPattern));
            subItems.forEach(subText => {
              const cleanSubText = subText.trim();
              if (!cleanSubText) return;

              const match = cleanSubText.match(new RegExp(splitRule.regexExtract));
              if (match) {
                const subItem = { ...item };
                // 替换对应的字段值
                const skuName = match[splitRule.skuNameGroup];
                const qtyVal = match[splitRule.qtyGroup];

                subItem["skuName"] = skuName.trim();
                subItem["quantity"] = Number(qtyVal);

                parsedRows.push(subItem);
              }
            });
            continue; // 原行数据已经拆分，不直接加入 parsedRows
          }
        }

        parsedRows.push(item);
      }

      // 3.4 跨行聚合 (湖南仓数据：聚合收货人)
      if (excelRule?.rowAggregation?.enabled && excelRule.rowAggregation.groupByField) {
        const groupField = excelRule.rowAggregation.groupByField;
        let lastValidRow: any = null;

        parsedRows.forEach((row) => {
          if (lastValidRow && row[groupField] && row[groupField] === lastValidRow[groupField]) {
            // 同一单号。如果当前行某些收货信息缺失，则自动继承上一次的收货信息
            const shareFields = ["receiverName", "receiverPhone", "receiverAddress", "receiverStore", "senderName", "senderPhone", "senderAddress"];
            shareFields.forEach(f => {
              if ((row[f] === undefined || row[f] === null || row[f] === "") && lastValidRow[f]) {
                row[f] = lastValidRow[f];
              }
            });
          }
          // 只要当前行有收件人等字段，就更新 lastValidRow
          if (row.receiverName || row.receiverStore) {
            lastValidRow = row;
          }
        });
      }

      results.push(...parsedRows);
    });

    return results;
  }

  /**
   * 执行 PDF/Word 纯文本规则解析
   */
  static parseText(text: string, rule: RuleConfig): any[] {
    const results: any[] = [];
    const textRule = rule.text;
    if (!textRule) return results;

    // 1. 拆分记录 (如果有多单)
    let records = [text];
    if (textRule.splitPattern) {
      records = text.split(new RegExp(textRule.splitPattern)).map(r => r.trim()).filter(Boolean);
    }

    records.forEach(recordText => {
      const recordData: Record<string, any> = {};

      // 2. 提取规则字段 (头部/尾部元信息)
      textRule.fields.forEach(f => {
        const regex = new RegExp(f.regexPattern);
        const match = recordText.match(regex);
        if (match && match[1]) {
          recordData[f.field] = match[1].trim();
        }
      });

      // 填充默认值
      rule.mappings.forEach(m => {
        if (m.defaultValue !== undefined && m.defaultValue !== "") {
          recordData[m.field] = m.defaultValue;
        }
      });

      // 3. 提取明细表 (多行物品)
      if (textRule.tableRowRegex && textRule.tableFields) {
        const rowRegex = new RegExp(textRule.tableRowRegex, 'g');
        const lines = recordText.split("\n");
        let hasItems = false;

        lines.forEach(line => {
          // 重置正则的 lastIndex (针对带 'g' 标签的正则)
          rowRegex.lastIndex = 0;
          const match = rowRegex.exec(line);
          if (match) {
            const item = { ...recordData };
            textRule.tableFields!.forEach((fieldKey, idx) => {
              // match[0] 是整行，捕获组从 1 开始
              const matchVal = match[idx + 1];
              if (matchVal !== undefined) {
                // 如果是数值，转换成数值类型
                if (fieldKey === "quantity" || fieldKey === "weight") {
                  item[fieldKey] = Number(matchVal.trim());
                } else {
                  item[fieldKey] = matchVal.trim();
                }
              }
            });
            results.push(item);
            hasItems = true;
          }
        });

        // 如果没有提取到物品明细，但提取到了元信息，则作为单行加入 (防空)
        if (!hasItems && Object.keys(recordData).length > 0) {
          results.push(recordData);
        }
      } else {
        // 如果没有明细表定义，直接存这一整单元信息
        if (Object.keys(recordData).length > 0) {
          results.push(recordData);
        }
      }
    });

    return results;
  }
}
