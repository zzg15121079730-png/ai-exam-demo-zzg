import { standardFields } from "./excel";

export interface ValidationError {
  row: number;
  field: string;
  fieldLabel: string;
  message: string;
  isWarning?: boolean;
}

/**
 * 校验行数据（通用的二选一及类型校验）
 */
function validateRow(row: any, rowNum: number, reverseMapping: Record<string, string>): ValidationError[] {
  const errors: ValidationError[] = [];

  // 1. 常规必填校验 (比如 SKU物品编码、SKU物品名称、数量等)
  standardFields.forEach((field) => {
    const val = row[field.key];
    const headerName = reverseMapping[field.key] || field.label;
    
    // 收件人三要素在此处特殊排外，稍后在二选一逻辑中处理
    const isReceiverField = ["receiverName", "receiverPhone", "receiverAddress"].includes(field.key);
    
    if (field.required && !isReceiverField && (val === undefined || val === null || String(val).trim() === "")) {
      errors.push({
        row: rowNum,
        field: field.key,
        fieldLabel: headerName,
        message: "不能为空",
      });
    }
  });

  // 2. A/B组二选一校验 (A组: 门店模式 | B组: 收件人模式)
  const store = String(row.receiverStore || "").trim();
  const name = String(row.receiverName || "").trim();
  const phone = String(row.receiverPhone || "").trim();
  const address = String(row.receiverAddress || "").trim();

  const hasStoreMode = store !== "";
  const hasReceiverMode = name !== "" && phone !== "" && address !== "";

  if (!hasStoreMode && !hasReceiverMode) {
    // 两个模式均未满足
    if (store === "") {
      errors.push({
        row: rowNum,
        field: "receiverStore",
        fieldLabel: reverseMapping.receiverStore || "收货门店",
        message: "收货门店与收件人三要素(姓名、电话、地址)二选一必填",
      });
    }
    if (name === "") {
      errors.push({
        row: rowNum,
        field: "receiverName",
        fieldLabel: reverseMapping.receiverName || "收件人姓名",
        message: "收件人三要素二选一必填",
      });
    }
    if (phone === "") {
      errors.push({
        row: rowNum,
        field: "receiverPhone",
        fieldLabel: reverseMapping.receiverPhone || "收件人电话",
        message: "收件人三要素二选一必填",
      });
    }
    if (address === "") {
      errors.push({
        row: rowNum,
        field: "receiverAddress",
        fieldLabel: reverseMapping.receiverAddress || "收件人地址",
        message: "收件人三要素二选一必填",
      });
    }
  } else if (!hasStoreMode && (name !== "" || phone !== "" || address !== "")) {
    // 属于收件人模式，但未填完整
    if (name === "") {
      errors.push({
        row: rowNum,
        field: "receiverName",
        fieldLabel: reverseMapping.receiverName || "收件人姓名",
        message: "收件人模式下，姓名不能为空",
      });
    }
    if (phone === "") {
      errors.push({
        row: rowNum,
        field: "receiverPhone",
        fieldLabel: reverseMapping.receiverPhone || "收件人电话",
        message: "收件人模式下，电话不能为空",
      });
    }
    if (address === "") {
      errors.push({
        row: rowNum,
        field: "receiverAddress",
        fieldLabel: reverseMapping.receiverAddress || "收件人地址",
        message: "收件人模式下，地址不能为空",
      });
    }
  }

  // 3. 格式校验
  // 手机号: 1开头11位 | 座机: 区号-号码
  const phoneRegex = /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/;

  // 收件人电话格式校验 (只在填写了收件人电话时校验)
  if (row.receiverPhone) {
    const receiverPhoneStr = String(row.receiverPhone).replace(/\s+/g, '');
    if (!phoneRegex.test(receiverPhoneStr)) {
      errors.push({
        row: rowNum,
        field: "receiverPhone",
        fieldLabel: reverseMapping.receiverPhone || "收件人电话",
        message: "手机号需1开头11位，或座机格式如010-12345678",
      });
    }
  }

  // 件数 / 数量 (正整数，考试要求"件数正整数")
  if (row.quantity !== undefined && row.quantity !== null && row.quantity !== "") {
    const qty = Number(row.quantity);
    if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      errors.push({
        row: rowNum,
        field: "quantity",
        fieldLabel: reverseMapping.quantity || "SKU发货数量",
        message: "必须为正整数",
      });
    }
  }

  return errors;
}

export const validateData = (
  data: any[],
  mapping: Record<string, string>,
  headers: string[]
): { validData: any[]; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];
  const validData: any[] = [];
  const externalCodes = new Map<string, number>();

  // 创建反向映射 (standard key -> original header)
  const reverseMapping: Record<string, string> = {};
  for (const [header, key] of Object.entries(mapping)) {
    reverseMapping[key] = header;
  }

  data.forEach((row, index) => {
    const rowNum = index + 1;
    const mappedRow: any = { _originalRow: index };
    
    // 映射数据
    for (const [header, key] of Object.entries(mapping)) {
      if (key) {
        mappedRow[key] = row[header];
      }
    }

    // 默认补足 mappings 里的 defaultValue
    standardFields.forEach(f => {
      if ((mappedRow[f.key] === undefined || mappedRow[f.key] === null || mappedRow[f.key] === "")) {
        // 查找映射中是否有默认值
        const m = Object.entries(mapping).find(([_, key]) => key === f.key);
        // 这里需要传递原 mappings 对象，在调用层，也可以稍后直接在页面级填充
      }
    });

    // 运行校验
    const rowErrors = validateRow(mappedRow, rowNum, reverseMapping);
    errors.push(...rowErrors);

    // 外部编码+SKU编码批次内重复性检查
    if (mappedRow.externalCode && mappedRow.skuCode) {
      const extCode = String(mappedRow.externalCode).trim();
      const sku = String(mappedRow.skuCode).trim();
      const uniqueKey = `${extCode}_${sku}`;
      if (externalCodes.has(uniqueKey)) {
        const prev = externalCodes.get(uniqueKey)!;
        errors.push({
          row: rowNum,
          field: "externalCode",
          fieldLabel: reverseMapping.externalCode || "外部编码",
          message: `与第 ${prev} 行重复 (外部编码+SKU重复)`,
        });
      } else {
        externalCodes.set(uniqueKey, rowNum);
      }
    }

    // 确保数值类型正确
    if (mappedRow.quantity !== undefined && mappedRow.quantity !== "") {
      mappedRow.quantity = Number(mappedRow.quantity);
    }

    validData.push(mappedRow);
  });

  return { validData, errors };
};

/**
 * 直接校验已经是标准字段格式的数据（用于编辑后的实时重新校验）
 */
export const validateStandardData = (
  data: any[]
): { validData: any[]; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];
  const validData: any[] = [];
  const externalCodes = new Map<string, number>();

  // 空反向映射，直接用标准字段 label
  const reverseMapping: Record<string, string> = {};
  standardFields.forEach(f => {
    reverseMapping[f.key] = f.label;
  });

  data.forEach((row, index) => {
    const rowNum = index + 1;
    const mappedRow: any = { ...row };

    // 运行校验
    const rowErrors = validateRow(mappedRow, rowNum, reverseMapping);
    errors.push(...rowErrors);

    // 外部编码+SKU编码批次内重复性检查
    if (mappedRow.externalCode && mappedRow.skuCode) {
      const extCode = String(mappedRow.externalCode).trim();
      const sku = String(mappedRow.skuCode).trim();
      const uniqueKey = `${extCode}_${sku}`;
      if (externalCodes.has(uniqueKey)) {
        const prev = externalCodes.get(uniqueKey)!;
        errors.push({
          row: rowNum,
          field: "externalCode",
          fieldLabel: "外部编码",
          message: `与第 ${prev} 行重复 (外部编码+SKU重复)`,
        });
      } else {
        externalCodes.set(uniqueKey, rowNum);
      }
    }


    validData.push(mappedRow);
  });

  return { validData, errors };
};
