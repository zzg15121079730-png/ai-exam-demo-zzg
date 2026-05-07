import { standardFields } from "./excel";

export interface ValidationError {
  row: number;
  field: string;
  fieldLabel: string;
  message: string;
}

export const validateData = (
  data: any[],
  mapping: Record<string, string>,
  headers: string[]
): { validData: any[]; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];
  const validData: any[] = [];
  const externalCodes = new Map<string, number>();

  // Create reverse mapping (standard key -> original header)
  const reverseMapping: Record<string, string> = {};
  for (const [header, key] of Object.entries(mapping)) {
    reverseMapping[key] = header;
  }

  data.forEach((row, index) => {
    const rowNum = index + 1;
    const mappedRow: any = { _originalRow: index };
    
    // Map data
    for (const [header, key] of Object.entries(mapping)) {
      if (key) {
        mappedRow[key] = row[header];
      }
    }

    // Validation
    let hasError = false;

    // 1. Required fields
    standardFields.forEach((field) => {
      const val = mappedRow[field.key];
      const headerName = reverseMapping[field.key] || field.label;
      
      if (field.required && (val === undefined || val === null || val === "")) {
        errors.push({
          row: rowNum,
          field: field.key,
          fieldLabel: headerName,
          message: "不能为空",
        });
        hasError = true;
      }
    });

    // 2. Format validation
    
    // Phone numbers (simple regex for Chinese phones or landlines)
    const phoneRegex = /^[0-9-+\s]+$/;
    if (mappedRow.senderPhone && !phoneRegex.test(String(mappedRow.senderPhone))) {
      errors.push({
        row: rowNum,
        field: "senderPhone",
        fieldLabel: reverseMapping.senderPhone || "发件人电话",
        message: "格式错误",
      });
      hasError = true;
    }
    if (mappedRow.receiverPhone && !phoneRegex.test(String(mappedRow.receiverPhone))) {
      errors.push({
        row: rowNum,
        field: "receiverPhone",
        fieldLabel: reverseMapping.receiverPhone || "收件人电话",
        message: "格式错误",
      });
      hasError = true;
    }

    // Weight (>0)
    if (mappedRow.weight !== undefined && mappedRow.weight !== "") {
      const weight = Number(mappedRow.weight);
      if (isNaN(weight) || weight <= 0) {
        errors.push({
          row: rowNum,
          field: "weight",
          fieldLabel: reverseMapping.weight || "重量",
          message: "必须为正数",
        });
        hasError = true;
      }
      mappedRow.weight = weight;
    }

    // Quantity (positive integer)
    if (mappedRow.quantity !== undefined && mappedRow.quantity !== "") {
      const qty = Number(mappedRow.quantity);
      if (isNaN(qty) || !Number.isInteger(qty) || qty <= 0) {
        errors.push({
          row: rowNum,
          field: "quantity",
          fieldLabel: reverseMapping.quantity || "件数",
          message: "必须为正整数",
        });
        hasError = true;
      }
      mappedRow.quantity = qty;
    }

    // Temp Zone
    const validTempZones = ["常温", "冷藏", "冷冻"];
    if (mappedRow.tempZone && !validTempZones.includes(String(mappedRow.tempZone).trim())) {
      errors.push({
        row: rowNum,
        field: "tempZone",
        fieldLabel: reverseMapping.tempZone || "温层",
        message: "不在可选范围内(常温/冷藏/冷冻)",
      });
      hasError = true;
    }

    // External Code uniqueness check
    if (mappedRow.externalCode) {
      const codeStr = String(mappedRow.externalCode).trim();
      mappedRow.externalCode = codeStr;
      
      if (externalCodes.has(codeStr)) {
        const dupRow = externalCodes.get(codeStr);
        errors.push({
          row: rowNum,
          field: "externalCode",
          fieldLabel: reverseMapping.externalCode || "外部编码",
          message: `与第 ${dupRow} 行重复`,
        });
        hasError = true;
      } else {
        externalCodes.set(codeStr, rowNum);
      }
    }

    validData.push(mappedRow);
  });

  return { validData, errors };
};

/**
 * 直接校验已经是标准字段格式的数据（用于编辑后的实时重新校验）
 * 不需要 mapping/headers，直接按 standardFields 的 key 校验
 */
export const validateStandardData = (
  data: any[]
): { validData: any[]; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];
  const validData: any[] = [];
  const externalCodes = new Map<string, number>();

  data.forEach((row, index) => {
    const rowNum = index + 1;
    // 保留原始数据，不做转换
    const mappedRow: any = { ...row };

    // 1. Required fields
    standardFields.forEach((field) => {
      const val = mappedRow[field.key];
      if (field.required && (val === undefined || val === null || String(val).trim() === "")) {
        errors.push({
          row: rowNum,
          field: field.key,
          fieldLabel: field.label,
          message: "不能为空",
        });
      }
    });

    // 2. Format validation
    const phoneRegex = /^[0-9\-+\s]+$/;
    if (mappedRow.senderPhone && !phoneRegex.test(String(mappedRow.senderPhone))) {
      errors.push({
        row: rowNum,
        field: "senderPhone",
        fieldLabel: "发件人电话",
        message: "电话格式错误",
      });
    }
    if (mappedRow.receiverPhone && !phoneRegex.test(String(mappedRow.receiverPhone))) {
      errors.push({
        row: rowNum,
        field: "receiverPhone",
        fieldLabel: "收件人电话",
        message: "电话格式错误",
      });
    }

    // Weight (>0)
    if (mappedRow.weight !== undefined && mappedRow.weight !== "" && mappedRow.weight !== null) {
      const weight = Number(mappedRow.weight);
      if (isNaN(weight) || weight <= 0) {
        errors.push({
          row: rowNum,
          field: "weight",
          fieldLabel: "重量 (kg)",
          message: "必须为正数",
        });
      }
    }

    // Quantity (positive integer)
    if (mappedRow.quantity !== undefined && mappedRow.quantity !== "" && mappedRow.quantity !== null) {
      const qty = Number(mappedRow.quantity);
      if (isNaN(qty) || !Number.isInteger(qty) || qty <= 0) {
        errors.push({
          row: rowNum,
          field: "quantity",
          fieldLabel: "件数",
          message: "必须为正整数",
        });
      }
    }

    // Temp Zone
    const validTempZones = ["常温", "冷藏", "冷冻"];
    if (mappedRow.tempZone && !validTempZones.includes(String(mappedRow.tempZone).trim())) {
      errors.push({
        row: rowNum,
        field: "tempZone",
        fieldLabel: "温层",
        message: "不在可选范围(常温/冷藏/冷冻)",
      });
    }

    // External Code uniqueness
    if (mappedRow.externalCode) {
      const codeStr = String(mappedRow.externalCode).trim();
      if (externalCodes.has(codeStr)) {
        const dupRow = externalCodes.get(codeStr);
        errors.push({
          row: rowNum,
          field: "externalCode",
          fieldLabel: "外部编码",
          message: `与第 ${dupRow} 行重复`,
        });
      } else {
        externalCodes.set(codeStr, rowNum);
      }
    }

    validData.push(mappedRow);
  });

  return { validData, errors };
};
