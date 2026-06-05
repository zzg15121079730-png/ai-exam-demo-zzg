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

// Auto-mapping logic
export const standardFields = [
  // ====== 考试要求的 10 个标准字段（严格对应"三、下单字段定义"）======
  { key: "externalCode", label: "外部编码", aliases: ["客户单号", "订单号", "外部订单号", "Ref Code", "外部单号", "外部编号", "订单编号", "单号", "配送单号", "配送汇总单号"], required: false },
  { key: "receiverStore", label: "收货门店", aliases: ["收货门店", "门店", "门店名称", "门店名", "收货门店/机构名称", "调拨门店", "分店", "分店名", "收货机构"], required: false },
  { key: "receiverName", label: "收件人姓名", aliases: ["收货人", "收件人", "收货人姓名", "Receiver Name", "收件人姓名", "收货联系人"], required: false },
  { key: "receiverPhone", label: "收件人电话", aliases: ["收货电话", "收件电话", "Receiver Tel", "收件人联系方式", "收货人电话", "Receiver Phone", "收件人电话", "联系电话"], required: false },
  { key: "receiverAddress", label: "收件人地址", aliases: ["收货地址", "收件地址", "Receiver Address", "收货人地址", "收件人地址", "配送地址"], required: false },
  { key: "skuCode", label: "SKU物品编码", aliases: ["物品编码", "SKU物品编码", "SKU编码", "编码", "商品编码", "物品代码", "SKU", "物品编码*"], required: true },
  { key: "skuName", label: "SKU物品名称", aliases: ["物品名称", "SKU物品名称", "商品名称", "名称", "品名", "物品名称*"], required: true },
  { key: "quantity", label: "SKU发货数量", aliases: ["发货数量", "数量", "SKU数量", "件数", "量", "发件数", "Qty", "实发数量", "发货数量*"], required: true },
  { key: "skuSpec", label: "SKU规格型号", aliases: ["规格", "型号", "规格型号", "商品规格", "物品规格"], required: false },
  { key: "remark", label: "备注", aliases: ["附言", "Note", "说明", "附加说明", "Remark", "备注信息"], required: false },
  // ====== 以下为辅助扩展字段（非考试强制要求，但 V1 兼容保留，均为可选）======
  { key: "senderName", label: "发件人姓名", aliases: ["发货人", "发件人", "Sender", "寄件人", "发货人姓名"], required: false },
  { key: "senderPhone", label: "发件人电话", aliases: ["发货电话", "发件电话", "Sender Tel", "发货人电话"], required: false },
  { key: "senderAddress", label: "发件人地址", aliases: ["发货地址", "发件地址", "Sender Address", "发货人地址"], required: false },
  { key: "weight", label: "重量 (kg)", aliases: ["重量", "重量(kg)", "Weight"], required: false },
  { key: "tempZone", label: "温层", aliases: ["温度要求", "Temp Zone", "温控"], required: false },
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
