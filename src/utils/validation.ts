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

  // 1. 常规必填校验 (比如 SKU物品编码、SKU物品名称、SKU发货数量、发件人等)
  standardFields.forEach((field) => {
    const val = row[field.key];
    const headerName = reverseMapping[field.key] || field.label;
    
    if (field.required && (val === undefined || val === null || String(val).trim() === "")) {
      errors.push({
        row: rowNum,
        field: field.key,
        fieldLabel: headerName,
        message: "不能为空",
      });
    }
  });

  // 2. A组门店模式与B组收件人模式二选一校验（根据用户要求已移除，仅依靠 excel 解析出来的 required 必填限制）

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

  // 件数 / 数量 (正数，考试要求"必须为正数")
  if (row.quantity !== undefined && row.quantity !== null && row.quantity !== "") {
    const qty = Number(row.quantity);
    if (isNaN(qty) || qty <= 0) {
      errors.push({
        row: rowNum,
        field: "quantity",
        fieldLabel: reverseMapping.quantity || "SKU发货数量",
        message: "必须为正数",
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

    // 外部编码重复性检查
    if (mappedRow.externalCode) {
      const codeStr = String(mappedRow.externalCode).trim();
      mappedRow.externalCode = codeStr;
      
      const storeStr = String(mappedRow.receiverStore || "").trim();
      const nameStr = String(mappedRow.receiverName || "").trim();
      const phoneStr = String(mappedRow.receiverPhone || "").trim();
      const addressStr = String(mappedRow.receiverAddress || "").trim();
      
      if (externalCodes.has(codeStr)) {
        const prev = externalCodes.get(codeStr)!;
        const isSameReceiver = 
          storeStr === prev.receiverStore &&
          nameStr === prev.receiverName &&
          phoneStr === prev.receiverPhone &&
          addressStr === prev.receiverAddress;
          
        if (isSameReceiver) {
          errors.push({
            row: rowNum,
            field: "externalCode",
            fieldLabel: reverseMapping.externalCode || "外部编码",
            message: `与第 ${prev.rowNum} 行重复 (同订单多明细商品)`,
            isWarning: true
          });
        } else {
          errors.push({
            row: rowNum,
            field: "externalCode",
            fieldLabel: reverseMapping.externalCode || "外部编码",
            message: `与第 ${prev.rowNum} 行重复 (但收货信息不一致)`,
          });
        }
      } else {
        externalCodes.set(codeStr, {
          rowNum,
          receiverStore: storeStr,
          receiverName: nameStr,
          receiverPhone: phoneStr,
          receiverAddress: addressStr
        });
      }
    }

    // 确保数值类型正确
    if (mappedRow.weight !== undefined && mappedRow.weight !== "") {
      mappedRow.weight = Number(mappedRow.weight);
    }
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

    // 外部编码重复性检查
    if (mappedRow.externalCode) {
      const codeStr = String(mappedRow.externalCode).trim();
      const storeStr = String(mappedRow.receiverStore || "").trim();
      const nameStr = String(mappedRow.receiverName || "").trim();
      const phoneStr = String(mappedRow.receiverPhone || "").trim();
      const addressStr = String(mappedRow.receiverAddress || "").trim();
      
      if (externalCodes.has(codeStr)) {
        const prev = externalCodes.get(codeStr)!;
        const isSameReceiver = 
          storeStr === prev.receiverStore &&
          nameStr === prev.receiverName &&
          phoneStr === prev.receiverPhone &&
          addressStr === prev.receiverAddress;
          
        if (isSameReceiver) {
          errors.push({
            row: rowNum,
            field: "externalCode",
            fieldLabel: "外部编码",
            message: `与第 ${prev.rowNum} 行重复 (同订单多明细商品)`,
            isWarning: true
          });
        } else {
          errors.push({
            row: rowNum,
            field: "externalCode",
            fieldLabel: "外部编码",
            message: `与第 ${prev.rowNum} 行重复 (但收货信息不一致)`,
          });
        }
      } else {
        externalCodes.set(codeStr, {
          rowNum,
          receiverStore: storeStr,
          receiverName: nameStr,
          receiverPhone: phoneStr,
          receiverAddress: addressStr
        });
      }
    }

    validData.push(mappedRow);
  });

  return { validData, errors };
};
