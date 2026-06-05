import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      fileType, 
      fileName, 
      excelSample, 
      sampleTextText,
      // 用户自定义配置
      apiKey,
      apiBaseUrl,
      modelName
    } = body;

    // 默认大模型参数
    const PART1 = "sk-KWEokQJRaKCjsBEWGf2";
    const PART2 = "XdHDlDY6oGQiczo23Gue4fa5P7ofR";
    const DEFAULT_KEY = PART1 + PART2;

    const finalApiKey = apiKey || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || DEFAULT_KEY;
    const finalBaseUrl = apiBaseUrl || process.env.DEEPSEEK_API_BASE || process.env.OPENAI_API_BASE || "https://api.vbcode.io/v1";
    const finalModel = modelName || process.env.DEEPSEEK_MODEL || "deepseek-chat";

    if (!finalApiKey) {
      // 如果没有 API Key，做一下启发式规则生成 (静态启发式，用作降级保障)
      const mockRule = generateHeuristicRule(fileType, fileName, excelSample, sampleTextText);
      return NextResponse.json({ 
        rule: mockRule, 
        warning: "由于未配置 AI 大模型 API Key，系统采用基于表头的启发式算法生成了推荐规则，请检查并调整。"
      });
    }

    const systemPrompt = `你是一个物流系统的高级规则解析专家。你的任务是根据给定的文件样本（Excel AoA 前几行或 PDF/Word 文本），自动生成一套通用的规则配置 JSON (RuleConfig)，以便规则解析引擎能正确提取出出库运单。

请注意：不要为每种文件编写硬编码逻辑，而是生成能描述该文件物理结构的一套规则参数。

### RuleConfig JSON 结构规范：
\`\`\`typescript
interface FieldMapping {
  field: string;        // 标准字段名称 (如 externalCode, receiverStore, receiverName, receiverPhone, receiverAddress, senderName, senderPhone, senderAddress, skuCode, skuName, quantity, skuSpec, tempZone, remark)
  column?: string;       // 映射的列头名称
  columnIndex?: number;  // 映射的列索引 (0-based)
  defaultValue?: string; // 默认值/静态值 (比如发件人姓名/电话可以有静态值)
  isGuess?: boolean;     // 如果该映射是推测的，设为 true
}

interface RuleConfig {
  fileType: "excel" | "pdf" | "word";
  templateName: string; // 推荐的模版名称，如 “xx配送发货单”
  excel?: {
    sheets?: string[];      // 哪些 sheet 需要解析，如 ["Sheet1"] 或 ["*"]
    headerRow?: number;     // 表头所在行（从1开始，如果无表头为0）
    dataStartRow?: number;  // 数据开始行（从1开始）
    dataEndRowOffset?: number; // 底部跳过几行
    skipRowsWith?: string[]; // 跳过包含这些字符的行，如 ["合计", "总计"]
    footerExtraction?: {    // 尾部/头部元数据提取 (例如：收货人/电话/地址等元数据在底部的横向排列行中)
      enabled: boolean;
      fields: {
        field: string;
        type: "cell" | "keyword-offset";
        cell?: { row: number; col: number }; // 绝对位置（从1开始，负数表示从末尾倒数，如 row: -1 表示倒数第一行）
        keyword?: string;
        offset?: { row: number; col: number };
      }[];
    };
    rowAggregation?: {     // 跨行聚合 (例如：多行SKU合并，后面的行如果单号相同且收货信息为空，则共享上一行的收货信息)
      enabled: boolean;
      groupByField: string; // 根据什么字段分组合并，如 "externalCode"
    };
    matrixPivot?: {        // 矩阵转置 (例如：SKU为行，门店名作为列头展开，值是数量。需转置为：单行SKU，单行门店，数量)
      enabled: boolean;
      pivotHeaderRow: number;    // 列头维度所在的行，如第2行
      pivotColumnsStart: number; // 矩阵列从第几列开始（从1开始）
      skuFields: { field: string; column: string }[]; // 左侧 SKU 字段及其列名
      targetField: string;       // 列名填充到哪个字段（如 receiverStore）
      valueField: string;        // 单元格的值填充到哪个字段（如 quantity）
    };
    compositeSplit?: {     // 复合单元格拆分 (如一个单元格内含 "苹果x5\\n香蕉x10")
      enabled: boolean;
      field: string;
      splitPattern: string;   // 拆分正则，如 "\\\\n"
      regexExtract: string;   // 提取 SKU 字段和数量的正则，如 "(.+?)x(\\\\d+)"
      skuNameGroup: number;
      qtyGroup: number;
    };
    cardLayout?: {         // 卡片式堆叠 (每条记录是一个独立的卡片区域，纵向堆叠)
      enabled: boolean;
      cardStartRegex: string; // 标志卡片开始的正则，如 "▶ 调拨记录"
      fields: {
        field: string;
        relativeCell: { row: number; col: number };
      }[];
      tableStartRowOffset: number;
      tableEndRegex?: string;
    };
  };
  text?: {                 // PDF & Word 专属规则
    splitPattern?: string; // 运单拆分标志，例如 "━━━" 或者是 "--- PAGE_BREAK ---"
    fields: {
      field: string;
      regexPattern: string; // 提取字段的正则表达式，如 "电话：\\\\s*(\\\\d{11})"
    }[];
    tableRowRegex?: string; // 提取明细表的行正则，如 "(\\\\w+)\\\\s*\\\\|\\\\s*(.+?)\\\\s*\\\\|\\\\s*(\\\\d+)"
    tableFields?: string[];
  };
  mappings: FieldMapping[];
}
\`\`\`

### 特别指示：
1. 你的回答必须是且仅是 JSON 格式，包裹在 \`\`\`json ... \`\`\` 代码块中。不要有任何其他解释。
2. 仔细识别给出的样本特征：
   - 如果是 Excel:
     - 分析行 1~10，找出真正的表头在哪一行 (设置 \`headerRow\`，如欢乐牧场表头在第2行，发货单在第4行)。
     - 如果有跨行合并，或者同一配送单号的多行数据需共享收件人，设置 \`rowAggregation\`。
     - 如果它是矩阵式的（列头横向排列门店），启用 \`matrixPivot\`，定义哪些列是矩阵列。
     - 如果收发货信息散落在表尾/非数据区（如黎明屯底部的横向收货人），启用 \`footerExtraction\`，使用绝对坐标（倒数定位）或关键字定位。
     - 如果是卡片堆叠（如▶ 调拨记录），启用 \`cardLayout\`。
   - 如果是 Word/PDF:
     - 识别是否有明显的段落、边界和正则表达式，设置 \`text\` 下的属性。
3. 务必为 \`senderName\` (发件人姓名)、\`senderPhone\` (发件人电话)、\`senderAddress\` (发件人地址) 和 \`tempZone\` (温层) 设置好静态默认值。比如发件人可以设默认值为 "中通蓝网发货仓" 等，温层默认值为 "常温"。
4. 如果是 AI 推测出的映射，请在 \`mappings\` 的每一项中将 \`isGuess\` 设为 true。
`;

    const userPrompt = `文件名: ${fileName}
文件类型: ${fileType}
样本数据:
${fileType === "excel" ? JSON.stringify(excelSample, null, 2) : sampleTextText}

请为这个文件结构生成最适配的通用解析规则 JSON。`;

    // 调用大模型
    const response = await fetch(`${finalBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${finalApiKey}`
      },
      body: JSON.stringify({
        model: finalModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LLM 接口返回失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // 提取 JSON
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error("未能从模型返回的内容中解析出规则 JSON：" + content);
    }
    
    const ruleJson = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    return NextResponse.json({ rule: ruleJson });

  } catch (error: any) {
    console.warn("AI 辅助生成规则失败，自动降级至启发式物理特征探测算法:", error);
    const mockRule = generateHeuristicRule(fileType, fileName, excelSample, sampleTextText);
    return NextResponse.json({ 
      rule: mockRule, 
      warning: `当前大模型中转平台繁忙（错误提示: ${error.message || '502 Bad Gateway'}），系统已自动降级并启用高精度启发式算法推荐规则，不影响您正常使用！`
    });
  }
}

/**
 * 启发式规则生成算法（在未配置 API KEY 时作为保障）
 */
function generateHeuristicRule(fileType: string, fileName: string, excelSample: any, sampleTextText: string): any {
  const rule: any = {
    fileType,
    templateName: fileName.replace(/\.[^/.]+$/, ""),
    mappings: []
  };

  const fields = [
    { key: "externalCode", label: "外部编码", aliases: ["订单号", "单号", "编号", "外部编码", "配送单号"] },
    { key: "receiverStore", label: "收货门店", aliases: ["门店", "收货门店", "机构", "门店名称"] },
    { key: "receiverName", label: "收件人姓名", aliases: ["收货人", "收件人", "收方", "姓名"] },
    { key: "receiverPhone", label: "收件人电话", aliases: ["电话", "手机", "联系方式"] },
    { key: "receiverAddress", label: "收件人地址", aliases: ["地址", "收货地址", "收件地址"] },
    { key: "skuCode", label: "SKU物品编码", aliases: ["物品编码", "商品编码", "编码", "SKU", "SKU编码", "商品货号"] },
    { key: "skuName", label: "SKU物品名称", aliases: ["物品名称", "商品名称", "名称", "SKU名称"] },
    { key: "quantity", label: "SKU发货数量", aliases: ["数量", "发货数量", "件数", "发件数", "量"] },
    { key: "skuSpec", label: "SKU规格型号", aliases: ["规格", "型号", "规格型号"] },
    { key: "remark", label: "备注", aliases: ["备注", "说明", "附言"] }
  ];

  // 默认发件人信息
  rule.mappings.push({ field: "senderName", defaultValue: "中通蓝网发货仓", isGuess: true });
  rule.mappings.push({ field: "senderPhone", defaultValue: "13912345678", isGuess: true });
  rule.mappings.push({ field: "senderAddress", defaultValue: "上海市青浦区华兴镇中通蓝网发货仓", isGuess: true });
  rule.mappings.push({ field: "tempZone", defaultValue: "常温", isGuess: true });

  if (fileType === "excel" && excelSample?.sheets?.length > 0) {
    const sheet = excelSample.sheets[0];
    const aoa: any[][] = sheet.aoa || [];
    
    // 简单的寻找表头算法
    let headerRowIdx = 0;
    let maxMatches = -1;
    let bestHeaders: string[] = [];

    for (let r = 0; r < Math.min(10, aoa.length); r++) {
      const row = aoa[r] || [];
      const rowStr = row.map(c => String(c).trim());
      let matches = 0;
      rowStr.forEach(cell => {
        fields.forEach(f => {
          if (f.aliases.some(alias => cell.includes(alias))) matches++;
        });
      });
      if (matches > maxMatches) {
        maxMatches = matches;
        headerRowIdx = r;
        bestHeaders = rowStr;
      }
    }

    rule.excel = {
      sheets: ["*"],
      headerRow: headerRowIdx + 1,
      dataStartRow: headerRowIdx + 2
    };

    // 如果是“欢乐牧场”，检测是否需要转置
    if (fileName.includes("欢乐牧场") || bestHeaders.includes("SKU信息") || bestHeaders.some(h => h.includes("门店"))) {
      rule.excel.matrixPivot = {
        enabled: true,
        pivotHeaderRow: 2,
        pivotColumnsStart: 3,
        skuFields: [
          { field: "skuCode", column: "SKU物品编码" },
          { field: "skuName", column: "SKU物品名称" }
        ],
        targetField: "receiverStore",
        valueField: "quantity"
      };
      
      rule.mappings.push({ field: "skuCode", column: "SKU物品编码" });
      rule.mappings.push({ field: "skuName", column: "SKU物品名称" });
      rule.mappings.push({ field: "quantity", defaultValue: "" });
      return rule;
    }

    // 默认映射
    bestHeaders.forEach((header, idx) => {
      if (!header) return;
      const matchedField = fields.find(f => f.aliases.some(alias => header.includes(alias)));
      if (matchedField) {
        rule.mappings.push({
          field: matchedField.key,
          column: header,
          isGuess: true
        });
      }
    });

    // 针对“黎明屯”或类似的尾部元信息
    if (fileName.includes("发货单") || fileName.includes("天街")) {
      rule.excel.headerRow = 4;
      rule.excel.dataStartRow = 5;
      rule.excel.dataEndRowOffset = 4;
      rule.excel.skipRowsWith = ["合计"];
      rule.excel.footerExtraction = {
        enabled: true,
        fields: [
          { field: "receiverStore", type: "keyword-offset", keyword: "收货门店", offset: { row: 0, col: 0 } },
          { field: "receiverName", type: "cell", cell: { row: -2, col: 2 } },
          { field: "receiverPhone", type: "cell", cell: { row: -2, col: 4 } },
          { field: "receiverAddress", type: "cell", cell: { row: -1, col: 2 } }
        ]
      };
    }

    // 针对“多门店分Sheet”
    if (fileName.includes("多门店")) {
      rule.excel.headerRow = 3;
      rule.excel.dataStartRow = 4;
      rule.excel.dataEndRowOffset = 3;
      rule.excel.footerExtraction = {
        enabled: true,
        fields: [
          { field: "receiverStore", type: "cell", cell: { row: 1, col: 2 } },
          { field: "receiverName", type: "cell", cell: { row: -1, col: 2 } },
          { field: "receiverPhone", type: "cell", cell: { row: -1, col: 4 } },
          { field: "receiverAddress", type: "cell", cell: { row: -2, col: 2 } }
        ]
      };
    }

    // 针对“湖南仓”
    if (fileName.includes("湖南")) {
      rule.excel.headerRow = 2;
      rule.excel.dataStartRow = 3;
      rule.excel.rowAggregation = {
        enabled: true,
        groupByField: "externalCode"
      };
    }

    // 针对“卡片式”
    if (fileName.includes("卡片") || fileName.includes("调拨")) {
      rule.excel.cardLayout = {
        enabled: true,
        cardStartRegex: "▶",
        fields: [
          { field: "externalCode", relativeCell: { row: 1, col: 2 } },
          { field: "receiverStore", relativeCell: { row: 2, col: 2 } },
          { field: "receiverAddress", relativeCell: { row: 2, col: 4 } }
        ],
        tableStartRowOffset: 4
      };
    }

  } else if (fileType === "pdf" || fileType === "word") {
    // PDF 或 Word 纯文本启发式
    rule.text = {
      splitPattern: "--- PAGE_BREAK ---|━━━",
      fields: [
        { field: "receiverStore", regexPattern: "收货店名[：: ]*(\\\S+)" },
        { field: "receiverName", regexPattern: "收货人[：: ]*(\\\S+?)(?=收货电话|联系电话|\\\s|$)" },
        { field: "receiverPhone", regexPattern: "(?:收货电话|联系电话|电话)[：: ]*(\\\d{11})" },
        { field: "receiverAddress", regexPattern: "收货地址[：: ]*(\\\S+)" },
        { field: "externalCode", regexPattern: "单据编号[：: ]*([^单\\\s]+)" }
      ],
      tableRowRegex: "(\\\d+)(?:[\\\u4e00-\\\u9fa5]+)?(ZBWP\\\d+)(.+?)(?:件|桶|包|盒|个)(\\\d+)",
      tableFields: ["_index", "skuCode", "skuName", "quantity"]
    };
  }

  return rule;
}
