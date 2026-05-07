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
  { key: "externalCode", label: "外部编码", aliases: ["客户单号", "订单号", "外部订单号", "Ref Code", "外部单号"] },
  { key: "senderName", label: "发件人姓名", aliases: ["发货人", "发件人", "Sender", "寄件人"], required: true },
  { key: "senderPhone", label: "发件人电话", aliases: ["发货电话", "发件电话", "Sender Tel", "联系方式"], required: true },
  { key: "senderAddress", label: "发件人地址", aliases: ["发货地址", "发件地址", "Sender Address", "地址"], required: true },
  { key: "receiverName", label: "收件人姓名", aliases: ["收货人", "收方", "Receiver", "收件人"], required: true },
  { key: "receiverPhone", label: "收件人电话", aliases: ["收货电话", "收件电话", "Receiver Tel", "收件人联系方式"], required: true },
  { key: "receiverAddress", label: "收件人地址", aliases: ["收货地址", "收件地址", "Receiver Address", "收件人地址"], required: true },
  { key: "weight", label: "重量 (kg)", aliases: ["重量", "重量(kg)", "重量(KG)", "Weight(kg)"], required: true },
  { key: "quantity", label: "件数", aliases: ["数量", "Qty", "包裹数"], required: true },
  { key: "tempZone", label: "温层", aliases: ["温度要求", "Temp Zone", "温控"], required: true },
  { key: "remark", label: "备注", aliases: ["附言", "Note", "说明"] },
];

export const guessMapping = (headers: string[]): Record<string, string> => {
  const mapping: Record<string, string> = {};
  
  for (const header of headers) {
    const cleanHeader = header.trim().toLowerCase();
    
    // Find matching standard field
    const match = standardFields.find(field => 
      field.label.toLowerCase() === cleanHeader || 
      field.aliases.some(alias => cleanHeader.includes(alias.toLowerCase()))
    );
    
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
