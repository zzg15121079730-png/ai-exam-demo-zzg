import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { RuleEngine, RuleConfig } from "@/utils/ruleEngine";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const ruleStr = formData.get("rule") as string;

    if (!file || !ruleStr) {
      return NextResponse.json({ error: "文件或解析规则缺失" }, { status: 400 });
    }

    const rule: RuleConfig = JSON.parse(ruleStr);
    const filename = file.name;
    const buffer = Buffer.from(await file.arrayBuffer());

    // 读取大模型配置参数（前端可传覆盖，或降级到 env 环境变量）
    const apiKey = (formData.get("apiKey") as string) || process.env.DEEPSEEK_API_KEY || "";
    let apiBaseUrl = (formData.get("apiBaseUrl") as string) || process.env.DEEPSEEK_API_BASE || "https://api.deepseek.com/v1";
    const modelName = (formData.get("modelName") as string) || process.env.DEEPSEEK_MODEL || "deepseek-chat";

    if (apiBaseUrl) {
      apiBaseUrl = apiBaseUrl.trim();
      if (!apiBaseUrl.endsWith("/v1") && !apiBaseUrl.endsWith("/v1/")) {
        apiBaseUrl = apiBaseUrl.replace(/\/+$/, "") + "/v1";
      }
    }

    let parsedData: any[] = [];

    if (rule.fileType === "excel") {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      parsedData = RuleEngine.parseExcel(workbook, rule);
    } else if (rule.fileType === "pdf" || rule.fileType === "word") {
      let textToParse = "";
      if (rule.fileType === "pdf") {
        const pdfData = await pdf(buffer);
        textToParse = pdfData.text;
      } else {
        const docxData = await mammoth.extractRawText({ buffer });
        textToParse = docxData.value;
      }

      let parsedViaLLM = false;

      // 如果有 API Key，首选使用大模型（DeepSeek）提取，以防正则匹配漏掉表格行或无法匹配
      if (apiKey) {
        try {
          console.log("🌊 [API-Parse] 开始调用大模型嵌套提取。apiBaseUrl:", apiBaseUrl, "modelName:", modelName, "apiKey 长度:", apiKey.length);
          const systemPrompt = `你是一个物流系统的高级数据提取专家。
请将下面提供的 PDF 或 Word 的纯文本内容提取为结构化的运单数据。

为节省空间并加快响应速度，请将同一配送单的数据分组提取。如果文本中包含多个不同的配送单，请输出为配送单数组。

### 提取规则特别说明：
1. 剥离物品名称与规格：如果物品名称、规格、单位和数量混在一起（例如“茶语柠听紫苏风味糖浆750ml*6瓶/件件2”或“唐吉柠檬果酱1.5L*12瓶/件件1”或“帽子（通用）均码件50”），请将纯商品名称（如“茶语柠听紫苏风味糖浆”、“唐吉柠檬果酱”、“帽子（通用）”）提取为 skuName。
2. 提取规格：请将它的规格型号（如“750ml*6瓶/件”、“1.5L*12瓶/件”、“2.5kg*6包/件”、“均码”、“XL码”等）提取为 skuSpec。如果没有明确规格，则为空。
3. 过滤订货单位：请勿将单独的订货单位（如“件”、“瓶”、“桶”、“包”、“个”等）填入 skuSpec 中。
4. 提取数量：请将最后表示发货数量的数字（如“2”、“1”、“50”）提取为 quantity，必须是纯数字/整数。

### 输出的 JSON 格式要求：
必须只返回标准的 JSON 数据数组，其结构如下：
\`\`\`json
[
  {
    "orderInfo": {
      "externalCode": "外部编码/订单号/配送单号（如果文本里有则提取，没有则留空。注意如果是“配送单号：PS2604210007”或“单据编号: PS2604210007”，则外部编码是“PS2604210007”）",
      "receiverStore": "收货门店/机构名称（如果文本包含“收货门店”、“收货机构”或“收货店名”，提取其对应的值，例如“黔寨寨贵州烙锅（鞍山店）”）",
      "receiverName": "收件人姓名（如有则提取）",
      "receiverPhone": "收件人电话（如有则提取）",
      "receiverAddress": "收件人地址（如有则提取）"
    },
    "items": [
      {
        "skuCode": "SKU物品编码（必须提取）",
        "skuName": "SKU物品名称（必须提取）",
        "quantity": SKU发货数量（必须是数字/整数，表示发货数量，必须提取）,
        "skuSpec": "SKU规格型号（如有则提取）",
        "remark": "备注（如有则提取）"
      }
    ]
  }
]
\`\`\`

### 输出格式：
必须只返回标准的 JSON 数据，包裹在 \`\`\`json ... \`\`\` 代码块中，不能有任何其他解释文字。`;

          const userPrompt = `文件名: ${filename}
文本内容:
${textToParse}`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 55000);

          const response = await fetch(`${apiBaseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: modelName,
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

          if (response.ok) {
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || "";
            console.log("🌊 [API-Parse] 大模型响应成功，内容长度:", content.length);
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const rawData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
              
              // 获取规则模板中的默认值映射，实现默认值补足
              const defaultValueMap: Record<string, string> = {};
              if (rule && Array.isArray(rule.mappings)) {
                rule.mappings.forEach(m => {
                  if (m.field && m.defaultValue) {
                    defaultValueMap[m.field] = m.defaultValue;
                  }
                });
              }

              const getValWithDefault = (val: any, fieldKey: string) => {
                const cleanVal = String(val || "").trim();
                return cleanVal || defaultValueMap[fieldKey] || "";
              };

              // 扁平化数据为 10 个标准字段的行
              const flatRows: any[] = [];
              const orders = Array.isArray(rawData) ? rawData : [rawData];
              
              for (const order of orders) {
                const info = order.orderInfo || {};
                const items = order.items || [];
                for (const item of items) {
                  flatRows.push({
                    externalCode: getValWithDefault(info.externalCode, "externalCode"),
                    receiverStore: getValWithDefault(info.receiverStore, "receiverStore"),
                    receiverName: getValWithDefault(info.receiverName, "receiverName"),
                    receiverPhone: getValWithDefault(info.receiverPhone, "receiverPhone"),
                    receiverAddress: getValWithDefault(info.receiverAddress, "receiverAddress"),
                    skuCode: getValWithDefault(item.skuCode, "skuCode"),
                    skuName: getValWithDefault(item.skuName, "skuName"),
                    quantity: parseInt(getValWithDefault(item.quantity, "quantity") || "0", 10) || 0,
                    skuSpec: getValWithDefault(item.skuSpec, "skuSpec"),
                    remark: getValWithDefault(item.remark, "remark")
                  });
                }
              }
              
              parsedData = flatRows;
              console.log("🌊 [API-Parse] 成功解析并扁平化出商品总行数:", parsedData.length);
              parsedViaLLM = true;
            } else {
              console.warn("🌊 [API-Parse] 未能在响应中匹配到 JSON 数组");
            }
          } else {
            const errorText = await response.text();
            console.error("🌊 [API-Parse] 大模型 API 返回错误:", response.status, errorText);
          }
        } catch (err: any) {
          console.warn("🌊 [API-Parse] DeepSeek 提取 PDF/Word 文本失败，将降级到正则解析:", err.message);
        }
      } else {
        console.warn("🌊 [API-Parse] 未检测到 API Key，跳过大模型提取");
      }

      // 降级方案：如果未配置 API Key 或大模型解析失败，使用本地正则表达式规则引擎解析
      if (!parsedViaLLM) {
        console.info("🌊 [API-Parse] 使用本地正则规则引擎解析文本...");
        parsedData = RuleEngine.parseText(textToParse, rule);
      }

    } else {
      return NextResponse.json({ error: "不支持的解析规则类型: " + rule.fileType }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      count: parsedData.length,
      data: parsedData
    });

  } catch (error: any) {
    console.error("解析文件失败:", error);
    return NextResponse.json({ error: "文件解析执行失败: " + error.message }, { status: 500 });
  }
}
