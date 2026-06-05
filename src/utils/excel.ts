import * as XLSX from "xlsx";

export type ExcelRow = Record<string, any>;

export interface ParsedExcel {
  filename: string;
  sheets: {
    name: string;
    data: ExcelRow[];
    headers: string[];
  }[];
}

export const parseExcelFile = async (file: File): Promise<ParsedExcel> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        const sheets = workbook.SheetNames.map((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          // Determine the actual header row by finding the first row with enough data, 
          // or we just read all as array and then process
          // To handle complex headers (like row 2 or 3), we first get AoA (Array of Arrays)
          const aoa: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
          
          let headerRowIndex = 0;
          let maxCols = 0;
          
          // Find the row with the most string columns to guess the header
          for (let i = 0; i < Math.min(10, aoa.length); i++) {
            const row = aoa[i];
            if (!row) continue;
            const validCols = row.filter((c) => typeof c === "string" && c.trim() !== "").length;
            if (validCols > maxCols) {
              maxCols = validCols;
              headerRowIndex = i;
            }
          }

          const rawHeaders = aoa[headerRowIndex] || [];
          const headers = rawHeaders.map(h => h ? String(h).trim() : "");

          // Now parse data starting from the row after the header
          const rawData = aoa.slice(headerRowIndex + 1);
          const formattedData: ExcelRow[] = [];
          
          for (const row of rawData) {
            // Skip completely empty rows
            if (row.every((cell) => cell === "" || cell === null || cell === undefined)) {
              continue;
            }
            
            const rowObj: ExcelRow = {};
            for (let i = 0; i < headers.length; i++) {
              // Only assign if the header is not empty
              if (headers[i]) {
                rowObj[headers[i]] = row[i] !== undefined ? row[i] : "";
              }
            }
            formattedData.push(rowObj);
          }

          return {
            name: sheetName,
            data: formattedData,
            headers,
          };
        });

        resolve({
          filename: file.name,
          sheets: sheets.filter(s => s.data.length > 0),
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const standardFields = [
  { key: "externalCode", label: "外部编码", aliases: ["客户单号", "订单号", "外部订单号", "外部单号", "外部编号", "订单编号", "单号", "配送单号", "配送汇总单号", "配送汇总单号*", "配送单号*"], required: false },
  { key: "receiverStore", label: "收货门店", aliases: ["收货门店", "收货门店名称", "门店名称", "门店名", "收货门店/机构名称", "调拨门店", "收货机构", "调入门店", "目标门店"], required: false },
  { key: "receiverName", label: "收件人姓名", aliases: ["收货人", "收件人", "收货人姓名", "收件人姓名", "收货联系人", "联系人"], required: true },
  { key: "receiverPhone", label: "收件人电话", aliases: ["收货电话", "收件电话", "收件人联系方式", "收货人电话", "收件人电话", "联系电话"], required: true },
  { key: "receiverAddress", label: "收件人地址", aliases: ["收货地址", "收件地址", "收货人地址", "收件人地址", "配送地址"], required: true },
  { key: "skuCode", label: "SKU物品编码", aliases: ["物品编码", "物品编码*", "SKU物品编码", "SKU编码", "商品编码", "物品代码", "SKU条码", "外部商品编码", "商品货号"], required: true },
  { key: "skuName", label: "SKU物品名称", aliases: ["物品名称", "物品名称*", "SKU物品名称", "SKU名称", "商品名称", "品名"], required: true },
  { key: "quantity", label: "SKU发货数量", aliases: ["发货数量", "发货数量*", "出库数量", "数量", "件数", "实发数量", "发件数", "发货件数"], required: true },
  { key: "weight", label: "重量", aliases: ["重量", "毛重", "净重", "单重", "重量(kg)", "重量（kg）"], required: true },
  { key: "tempArea", label: "温层", aliases: ["温层", "温度", "储存条件", "配送温层", "保存条件", "温区"], required: true },
  { key: "skuSpec", label: "SKU规格型号", aliases: ["规格型号", "规格", "型号", "商品规格", "物品规格"], required: false },
  { key: "remark", label: "备注", aliases: ["备注", "备注信息", "附言", "说明", "附加说明"], required: false },
];

// 归一化字符串：去空格、统一中英文括号、转小写
const normalize = (s: string) =>
  s.trim().toLowerCase()
    .replace(/\s+/g, '')
    .replace(/（/g, '(').replace(/）/g, ')')
    .replace(/[【】\[\]]/g, '');

export const guessMapping = (headers: string[]): Record<string, string> => {
  const mapping: Record<string, string> = {};
  
  // 第一轮：精确匹配 label（优先级最高）
  for (const header of headers) {
    if (!header || !header.trim()) continue;
    const normalizedHeader = normalize(header);
    
    const match = standardFields.find(field => {
      if (Object.values(mapping).includes(field.key)) return false;
      return normalize(field.label) === normalizedHeader;
    });
    
    if (match) {
      mapping[header] = match.key;
    }
  }
  
  // 第二轮：对未匹配的表头尝试别名模糊匹配
  for (const header of headers) {
    if (!header || !header.trim() || mapping[header]) continue;
    const normalizedHeader = normalize(header);
    
    const match = standardFields.find(field => {
      // 已被映射的字段跳过
      if (Object.values(mapping).includes(field.key)) return false;
      
      // 别名匹配（要求别名长度 >= 3 才做 includes，否则只做精确匹配）
      return field.aliases.some(alias => {
        const na = normalize(alias);
        if (na.length <= 2) {
          return normalizedHeader === na;
        }
        return normalizedHeader.includes(na) || na.includes(normalizedHeader);
      });
    });
    
    if (match) {
      mapping[header] = match.key;
    }
  }
  
  return mapping;
};

// Generate a fingerprint for a set of headers
export const generateFingerprint = (headers: string[]): string => {
  return headers.map(h => h.trim().toLowerCase()).sort().join("|");
};
