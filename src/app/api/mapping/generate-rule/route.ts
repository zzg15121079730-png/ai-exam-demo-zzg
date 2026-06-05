import { NextResponse } from "next/server";

// Vercel Serverless 函数最大执行时间（秒）
export const maxDuration = 60;

export async function POST(request: Request) {
  let fileType = "excel";
  let fileName = "unknown";
  let excelSample: any = null;
  let sampleTextText = "";

  try {
    const body = await request.json();
    fileType = body.fileType || fileType;
    fileName = body.fileName || fileName;
    excelSample = body.excelSample || excelSample;
    sampleTextText = body.sampleTextText || body.textSample || sampleTextText;

    const finalApiKey = process.env.DEEPSEEK_API_KEY || "";
    let finalBaseUrl = process.env.DEEPSEEK_API_BASE || "https://api.deepseek.com/v1";
    const finalModel = process.env.DEEPSEEK_MODEL || "deepseek-chat";

    if (finalBaseUrl) {
      finalBaseUrl = finalBaseUrl.trim();
      if (!finalBaseUrl.endsWith("/v1") && !finalBaseUrl.endsWith("/v1/")) {
        finalBaseUrl = finalBaseUrl.replace(/\/+$/, "") + "/v1";
      }
    }

    if (!finalApiKey) {
      // 无 API Key，用启发式降级
      const mockRule = generateHeuristicRule(fileType, excelSample, sampleTextText);
      return NextResponse.json({ 
        rule: mockRule, 
        warning: "未配置 API Key，已使用启发式算法自动生成规则，请检查并确认。"
      });
    }

    // 构建给 AI 的 system prompt — 只关注考试要求的 10 个字段
    const systemPrompt = `你是物流系统的规则解析专家。根据文件样本，生成一套解析规则 JSON (RuleConfig)。

### 标准字段（只有这 10 个，不要添加其他字段）：
- externalCode: 外部编码/订单号/配送单号
- receiverStore: 收货门店/机构名称
- receiverName: 收件人姓名
- receiverPhone: 收件人电话
- receiverAddress: 收件人地址
- skuCode: SKU物品编码
- skuName: SKU物品名称
- quantity: SKU发货数量（必须为正数）
- skuSpec: SKU规格型号
- remark: 备注

### RuleConfig JSON 结构：
\`\`\`json
{
  "fileType": "excel|pdf|word",
  "templateName": "模板名称",
  "excel": {
    "sheets": ["*"],        // ["*"]表示所有sheet
    "headerRow": 4,          // 表头行号(从1开始)
    "dataStartRow": 5,       // 数据开始行
    "dataEndRowOffset": 0,   // 底部跳过行数
    "skipRowsWith": ["合计","总计"],
    "footerExtraction": {    // 尾部信息提取(收货人散落在表尾时)
      "enabled": true,
      "fields": [
        {"field":"receiverStore","type":"keyword-offset","keyword":"收货门店","offset":{"row":0,"col":1}},
        {"field":"receiverName","type":"keyword-offset","keyword":"联系人","offset":{"row":0,"col":1}},
        {"field":"receiverPhone","type":"keyword-offset","keyword":"联系电话","offset":{"row":0,"col":1}},
        {"field":"receiverAddress","type":"keyword-offset","keyword":"收货地址","offset":{"row":0,"col":1}}
      ]
    },
    "rowAggregation": {      // 跨行聚合(同单号多行共享收货人)
      "enabled": false,
      "groupByField": "externalCode"
    },
    "matrixPivot": {         // 矩阵转置(门店名作列头)
      "enabled": false,
      "pivotHeaderRow": 2,
      "pivotColumnsStart": 5,
      "skuFields": [{"field":"skuCode","column":"SKU编码"}],
      "targetField": "receiverStore",
      "valueField": "quantity"
    },
    "cardLayout": {          // 卡片式(▶标记分隔)
      "enabled": false,
      "cardStartRegex": "^▶",
      "fields": [
        {"field":"receiverStore","relativeCell":{"row":1,"col":1}},
        {"field":"receiverName","relativeCell":{"row":1,"col":3}},
        {"field":"receiverPhone","relativeCell":{"row":1,"col":5}},
        {"field":"receiverAddress","relativeCell":{"row":2,"col":1}}
      ],
      "tableStartRowOffset": 3
    }
  },
  "text": {                  // PDF/Word文本解析
    "splitPattern": "---PAGE_BREAK---|━━━",
    "fields": [
      {"field":"receiverName","regexPattern":"收货人[：:]\\\\s*(\\\\S+)"},
      {"field":"receiverPhone","regexPattern":"电话[：:]\\\\s*(\\\\d{11})"}
    ],
    "tableRowRegex": "...",
    "tableFields": ["skuCode","skuName","quantity"]
  },
  "mappings": [              // 字段映射
    {"field":"skuCode","column":"物品编码"},
    {"field":"skuName","column":"物品名称"},
    {"field":"quantity","column":"出库数量"},
    {"field":"skuSpec","column":"规格型号"},
    {"field":"receiverStore","column":"收货门店"}
  ]
}
\`\`\`

### 重要规则：
1. 回答必须只有JSON，包在 \`\`\`json ... \`\`\` 中
2. 仔细分析样本前10行，找出真正的表头行(headerRow)
3. 只用以上10个字段，mappings中的column必须与实际表头完全一致
4. 根据文件特征启用对应的特殊处理(footerExtraction/rowAggregation/matrixPivot/cardLayout)
5. 每Sheet底部如有横向排列的收货人信息(如"联系人"、"联系电话"、"收货地址"等)，必须用footerExtraction提取
6. mappings中isGuess为true表示AI推测的映射

### 调拨单特殊模式(极其常见，务必识别)：
- 调拨单的收件人/电话/地址/门店通常不在数据表头中，而是在表格下方或上方以"关键字: 值"的格式单独出现
- 常见关键词举例："收货门店"、"调入门店"、"联系人"、"联系电话"、"收货地址"、"收件人"、"收件电话"
- 这种情况必须启用 footerExtraction（或 headerExtraction），用 keyword-offset 方式提取
- 如果表头中完全没有收件人/电话相关列，一定要在样本的尾部行中搜索这些关键字`;

    // 裁剪样本 — 前15行(表头+数据) + 后10行(尾部收货信息) 确保AI能看到全貌
    let trimmedSample = excelSample;
    if (fileType === "excel" && excelSample?.sheets) {
      trimmedSample = {
        ...excelSample,
        sheets: excelSample.sheets.map((s: any) => {
          const aoa = s.aoa || [];
          const head = aoa.slice(0, 15);
          const tail = aoa.slice(Math.max(15, aoa.length - 10));
          const combined = head.length + tail.length < aoa.length
            ? [...head, ["... 中间数据省略 ..."], ...tail]
            : aoa.slice(0, 30);
          return { ...s, aoa: combined, totalRows: aoa.length };
        })
      };
    }

    const userPrompt = `文件名: ${fileName}
文件类型: ${fileType}
样本数据:
${fileType === "excel" ? JSON.stringify(trimmedSample, null, 2) : sampleTextText}

请为这个文件生成解析规则 JSON。注意：mappings 中的 column 值必须与样本中的实际表头列名完全一致。`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);
    const cleanBaseUrl = finalBaseUrl.replace(/\/+$/, "");
    
    const response = await fetch(`${cleanBaseUrl}/chat/completions`, {
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
        temperature: 0.1,
        max_tokens: 4096
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LLM 接口返回失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("未能从模型返回中解析出规则 JSON");
    }
    
    const ruleJson = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    return NextResponse.json({ rule: ruleJson });

  } catch (error: any) {
    console.warn("AI 规则生成失败，降级到启发式算法:", error);
    const mockRule = generateHeuristicRule(fileType, excelSample, sampleTextText);
    return NextResponse.json({ 
      rule: mockRule, 
      warning: `AI 模型暂时不可用(${error.message || '未知错误'})，已自动启用启发式算法生成规则。`
    });
  }
}

/**
 * 启发式规则生成 — 纯结构探测，无文件名硬编码
 */
function generateHeuristicRule(fileType: string, excelSample: any, _sampleText: string): any {
  const rule: any = {
    fileType,
    templateName: "自动识别模板",
    mappings: []
  };

  // 10个标准字段的别名库
  const fields = [
    { key: "externalCode", aliases: ["订单号", "单号", "编号", "外部编码", "配送单号", "配送汇总单号", "客户单号"] },
    { key: "receiverStore", aliases: ["门店", "收货门店", "机构", "门店名称", "收货单位", "调入门店", "目标门店", "收货机构", "调拨门店", "到货门店", "收货方"] },
    { key: "receiverName", aliases: ["收货人", "收件人", "姓名", "收货联系人", "联系人", "收货方联系人", "到货联系人", "提货人"] },
    { key: "receiverPhone", aliases: ["电话", "手机", "联系方式", "联系电话", "收货电话", "收件电话", "收货方电话", "到货电话"] },
    { key: "receiverAddress", aliases: ["地址", "收货地址", "收件地址", "配送地址", "到货地址", "收货方地址"] },
    { key: "skuCode", aliases: ["物品编码", "商品编码", "编码", "SKU", "SKU编码", "商品货号", "SKU条码", "外部商品编码"] },
    { key: "skuName", aliases: ["物品名称", "商品名称", "名称", "品名", "SKU名称"] },
    { key: "quantity", aliases: ["数量", "发货数量", "件数", "出库数量", "实发数量", "发件数"] },
    { key: "skuSpec", aliases: ["规格", "型号", "规格型号"] },
    { key: "remark", aliases: ["备注", "说明"] }
  ];

  const isField = (text: string) => {
    if (!text) return false;
    return fields.some(f => f.aliases.some(a => text.includes(a)));
  };

  if (fileType === "excel" && excelSample?.sheets?.length > 0) {
    const sheet = excelSample.sheets[0];
    const aoa: any[][] = sheet.aoa || [];
    if (aoa.length === 0) return rule;

    // Step 1: 找表头行
    let headerRowIdx = 0;
    let maxMatches = 0;
    let bestHeaders: string[] = [];

    for (let r = 0; r < Math.min(10, aoa.length); r++) {
      const row = aoa[r] || [];
      const rowStr = row.map((c: any) => String(c || '').trim());
      const matches = rowStr.filter((s: string) => isField(s)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        headerRowIdx = r;
        bestHeaders = rowStr;
      }
    }

    rule.excel = {
      sheets: ["*"],
      headerRow: headerRowIdx + 1,
      dataStartRow: headerRowIdx + 2,
      skipRowsWith: ["合计", "总计"]
    };

    // Step 2: 卡片式检测
    const cardPattern = /^[▶►▸⯈]/;
    const cardIndices: number[] = [];
    aoa.forEach((row, idx) => {
      if (cardPattern.test(String(row[0] || '').trim())) cardIndices.push(idx);
    });

    if (cardIndices.length >= 2) {
      const firstCard = cardIndices[0];
      rule.excel.cardLayout = {
        enabled: true,
        cardStartRegex: cardPattern.source,
        fields: [] as any[],
        tableStartRowOffset: 3
      };
      // 扫描卡片内的字段
      for (let r = firstCard + 1; r < Math.min(firstCard + 3, cardIndices[1] || aoa.length); r++) {
        const row = aoa[r] || [];
        for (let c = 0; c < row.length; c++) {
          const s = String(row[c] || '').trim();
          if (/调入门店|收货门店|门店/.test(s) && !/地址/.test(s)) {
            rule.excel.cardLayout.fields.push({ field: "receiverStore", relativeCell: { row: r - firstCard + 1, col: c + 2 } });
          } else if (/收货人|联系人/.test(s) && !/电话|地址/.test(s)) {
            rule.excel.cardLayout.fields.push({ field: "receiverName", relativeCell: { row: r - firstCard + 1, col: c + 2 } });
          } else if (/电话|手机/.test(s)) {
            rule.excel.cardLayout.fields.push({ field: "receiverPhone", relativeCell: { row: r - firstCard + 1, col: c + 2 } });
          } else if (/地址/.test(s)) {
            rule.excel.cardLayout.fields.push({ field: "receiverAddress", relativeCell: { row: r - firstCard + 1, col: c + 2 } });
          }
        }
      }
      // 获取卡片内小表的表头
      const tblIdx = firstCard + rule.excel.cardLayout.tableStartRowOffset;
      if (tblIdx < aoa.length) {
        (aoa[tblIdx] || []).forEach((h: any) => {
          const hs = String(h || '').trim();
          if (!hs) return;
          const mf = fields.find(f => f.aliases.some(a => hs.includes(a)));
          if (mf) rule.mappings.push({ field: mf.key, column: hs, isGuess: true });
        });
      }
      return rule;
    }

    // Step 3: 矩阵转置检测
    const nonEmpty = bestHeaders.filter(h => h !== "");
    const matched = nonEmpty.filter(h => isField(h));
    if (nonEmpty.length > 5 && matched.length < nonEmpty.length * 0.5) {
      let pivotStart = -1;
      for (let i = 0; i < bestHeaders.length; i++) {
        if (bestHeaders[i] && !isField(bestHeaders[i]) && pivotStart === -1) { pivotStart = i; break; }
      }
      if (pivotStart > 0) {
        const skuFields: any[] = [];
        for (let i = 0; i < pivotStart; i++) {
          if (!bestHeaders[i]) continue;
          const mf = fields.find(f => f.aliases.some(a => bestHeaders[i].includes(a)));
          if (mf) skuFields.push({ field: mf.key, column: bestHeaders[i] });
        }
        rule.excel.matrixPivot = {
          enabled: true,
          pivotHeaderRow: headerRowIdx + 1,
          pivotColumnsStart: pivotStart + 1,
          skuFields: skuFields.length > 0 ? skuFields : [{ field: "skuCode", column: bestHeaders[0] }],
          targetField: "receiverStore",
          valueField: "quantity"
        };
        skuFields.forEach(sf => rule.mappings.push({ field: sf.field, column: sf.column, isGuess: true }));
        return rule;
      }
    }

    // Step 4: 标准表格 — 映射表头
    bestHeaders.forEach((header) => {
      if (!header) return;
      const mf = fields.find(f => f.aliases.some(a => header.includes(a)));
      if (mf) {
        rule.mappings.push({ field: mf.key, column: header, isGuess: true });
      }
    });

    // Step 5: 尾部收货人信息探测
    const tailRows = aoa.slice(Math.max(0, aoa.length - 6));
    const footerFields: any[] = [];
    tailRows.forEach((row: any[]) => {
      (row || []).forEach((cell: any, colIdx: number) => {
        const s = String(cell || '').trim();
        if (/收货门店|收货单位/.test(s)) {
          footerFields.push({ field: "receiverStore", type: "keyword-offset", keyword: s, offset: { row: 0, col: 1 } });
        } else if (/联系人|收货人/.test(s) && !/电话|地址/.test(s)) {
          footerFields.push({ field: "receiverName", type: "keyword-offset", keyword: s, offset: { row: 0, col: 1 } });
        } else if (/联系电话|收货电话/.test(s)) {
          footerFields.push({ field: "receiverPhone", type: "keyword-offset", keyword: s, offset: { row: 0, col: 1 } });
        } else if (/收货地址|配送地址/.test(s)) {
          footerFields.push({ field: "receiverAddress", type: "keyword-offset", keyword: s, offset: { row: 0, col: 1 } });
        }
      });
    });
    if (footerFields.length > 0) {
      rule.excel.footerExtraction = { enabled: true, fields: footerFields };
    }

    // Step 6: 跨行聚合检测
    const extCode = rule.mappings.find((m: any) => m.field === "externalCode");
    if (extCode?.column) {
      const ci = bestHeaders.indexOf(extCode.column);
      if (ci !== -1) {
        const dStart = (rule.excel.dataStartRow || 2) - 1;
        const sample = aoa.slice(dStart, Math.min(dStart + 30, aoa.length));
        const vals = sample.map((r: any[]) => String(r[ci] || '').trim()).filter(Boolean);
        const uniq = new Set(vals);
        if (vals.length > 5 && uniq.size < vals.length * 0.7) {
          rule.excel.rowAggregation = { enabled: true, groupByField: "externalCode" };
        }
      }
    }

  } else if (fileType === "pdf" || fileType === "word") {
    rule.text = {
      splitPattern: "--- PAGE_BREAK ---|━━━",
      fields: [
        { field: "receiverStore", regexPattern: "收货店名[：:]\\s*(\\S+)" },
        { field: "receiverName", regexPattern: "收货人[：:]\\s*(\\S+?)(?=收货电话|联系电话|\\s|$)" },
        { field: "receiverPhone", regexPattern: "(?:收货电话|联系电话|电话)[：:]\\s*(\\d{11})" },
        { field: "receiverAddress", regexPattern: "收货地址[：:]\\s*(\\S+)" },
        { field: "externalCode", regexPattern: "单据编号[：:]\\s*([^单\\s]+)" }
      ],
      tableRowRegex: "(\\d+)\\s+(\\w+)\\s+(.+?)\\s+(\\d+)",
      tableFields: ["_index", "skuCode", "skuName", "quantity"]
    };
  }

  return rule;
}
