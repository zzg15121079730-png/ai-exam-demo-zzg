const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { RuleEngine } = require('../src/utils/ruleEngine');

// 针对 demos 下的各种出库单定义解析规则 (由 AI 推理得到的通用配置结构)
const rules = {
  // 1. 黎明屯配送发货单 (12.25海口龙湖天街...)
  "12.25海口龙湖天街-配送发货单PS2512220005001(1).xlsx": {
    fileType: "excel",
    templateName: "黎明屯配送发货单模板",
    excel: {
      sheets: ["*"],
      headerRow: 4,
      dataStartRow: 5,
      dataEndRowOffset: 4, // 倒数4行属于尾部元信息和干扰行
      skipRowsWith: ["合计"],
      footerExtraction: {
        enabled: true,
        fields: [
          { field: "receiverStore", type: "cell", cell: { row: -3, col: 2 } }, // 倒数第3行第2列：收货门店
          { field: "receiverName", type: "cell", cell: { row: -2, col: 2 } },  // 倒数第2行第2列：收货人
          { field: "receiverPhone", type: "cell", cell: { row: -2, col: 4 } }, // 倒数第2行第4列：收货电话
          { field: "receiverAddress", type: "cell", cell: { row: -1, col: 2 } } // 倒数第1行第2列：收货地址
        ]
      }
    },
    mappings: [
      { field: "externalCode", column: "发货单号" },
      { field: "skuCode", column: "商品编码" },
      { field: "skuName", column: "商品名称" },
      { field: "quantity", column: "发货件数" },
      { field: "skuSpec", column: "规格" },
      { field: "weight", column: "重量(KG)" },
      { field: "tempZone", defaultValue: "常温" },
      { field: "senderName", defaultValue: "黎明屯总仓" },
      { field: "senderPhone", defaultValue: "13800000000" },
      { field: "senderAddress", defaultValue: "广州市荔湾区黎明屯物流仓" }
    ]
  },

  // 2. 湖南仓发货明细
  "湖南仓.xlsx": {
    fileType: "excel",
    templateName: "湖南仓发货明细模板",
    excel: {
      sheets: ["*"],
      headerRow: 2,
      dataStartRow: 3,
      rowAggregation: {
        enabled: true,
        groupByField: "externalCode" // 按配送单号分组聚合共享收件人
      }
    },
    mappings: [
      { field: "externalCode", column: "配送单号" },
      { field: "receiverStore", column: "收货店名" },
      { field: "receiverName", column: "收件人" },
      { field: "receiverPhone", column: "收货人电话" },
      { field: "receiverAddress", column: "收货地址" },
      { field: "skuCode", column: "商品编码" },
      { field: "skuName", column: "商品名称" },
      { field: "quantity", column: "发货件数" },
      { field: "skuSpec", column: "规格" },
      { field: "tempZone", defaultValue: "常温" },
      { field: "senderName", defaultValue: "湖南仓" },
      { field: "senderPhone", defaultValue: "13900000000" },
      { field: "senderAddress", defaultValue: "长沙市开福区湖南仓" }
    ]
  },

  // 3. 欢乐牧场模板 (矩阵转置)
  "欢乐牧场模板0430.xlsx": {
    fileType: "excel",
    templateName: "欢乐牧场矩阵模板",
    excel: {
      sheets: ["*"],
      headerRow: 2,
      dataStartRow: 3,
      matrixPivot: {
        enabled: true,
        pivotHeaderRow: 2,
        pivotColumnsStart: 3, // 从第3列起为各个门店的名称
        skuFields: [
          { field: "skuCode", column: "SKU物品编码" },
          { field: "skuName", column: "SKU物品名称" }
        ],
        targetField: "receiverStore", // 列头门店名写入到收货门店
        valueField: "quantity" // 数量写入发货数量
      }
    },
    mappings: [
      { field: "skuCode", column: "SKU物品编码" },
      { field: "skuName", column: "SKU物品名称" },
      { field: "tempZone", defaultValue: "常温" },
      { field: "senderName", defaultValue: "欢乐牧场中心仓" },
      { field: "senderPhone", defaultValue: "13511112222" },
      { field: "senderAddress", defaultValue: "北京市朝阳区欢乐牧场中心仓" }
    ]
  },

  // 4. 多门店分Sheet出库单
  "多门店分Sheet出库单.xlsx": {
    fileType: "excel",
    templateName: "多门店分Sheet出库单模板",
    excel: {
      sheets: ["*"], // 解析所有 sheet
      headerRow: 3,
      dataStartRow: 4,
      dataEndRowOffset: 3,
      footerExtraction: {
        enabled: true,
        fields: [
          { field: "receiverStore", type: "cell", cell: { row: 1, col: 2 } }, // 第1行第2列：收货门店
          { field: "receiverName", type: "cell", cell: { row: -2, col: 2 } },  // 倒数第2行第2列
          { field: "receiverPhone", type: "cell", cell: { row: -2, col: 4 } }, // 倒数第2行第4列
          { field: "receiverAddress", type: "cell", cell: { row: -1, col: 2 } } // 倒数第1行第2列
        ]
      }
    },
    mappings: [
      { field: "externalCode", column: "出库单号" },
      { field: "skuCode", column: "物品编码" },
      { field: "skuName", column: "物品名称" },
      { field: "quantity", column: "出库件数" },
      { field: "skuSpec", column: "规格" },
      { field: "tempZone", defaultValue: "常温" },
      { field: "senderName", defaultValue: "多门店配送中心" },
      { field: "senderPhone", defaultValue: "13600000000" },
      { field: "senderAddress", defaultValue: "上海市闵行区配送中心" }
    ]
  },

  // 5. 门店调拨单-卡片式
  "门店调拨单-卡片式.xlsx": {
    fileType: "excel",
    templateName: "门店调拨单卡片式模板",
    excel: {
      sheets: ["*"],
      cardLayout: {
        enabled: true,
        cardStartRegex: "▶ 调拨记录",
        fields: [
          { field: "externalCode", relativeCell: { row: 1, col: 2 } }, // 调拨单号相对位置
          { field: "receiverStore", relativeCell: { row: 2, col: 2 } }, // 调拨门店相对位置
          { field: "receiverAddress", relativeCell: { row: 2, col: 4 } } // 调拨地址相对位置
        ],
        tableStartRowOffset: 4
      }
    },
    mappings: [
      { field: "skuCode", column: "物品编码" },
      { field: "skuName", column: "物品名称" },
      { field: "quantity", column: "调拨数量" },
      { field: "skuSpec", column: "规格型号" },
      { field: "tempZone", defaultValue: "常温" },
      { field: "senderName", defaultValue: "调拨出发仓" },
      { field: "senderPhone", defaultValue: "13700000000" },
      { field: "senderAddress", defaultValue: "调拨总库" }
    ]
  },

  // 6. 黔寨寨贵州烙锅 (PDF)
  "黔寨寨贵州烙锅（鞍山店）常温.pdf": {
    fileType: "pdf",
    templateName: "黔寨寨PDF配送单模板",
    text: {
      splitPattern: "--- PAGE_BREAK ---",
      fields: [
        { field: "receiverStore", regexPattern: "收货店名[：: ]*(\\S+)" },
        { field: "receiverName", regexPattern: "收货人[：: ]*(\\S+?)(?=收货电话|联系电话|\\s|$)" },
        { field: "receiverPhone", regexPattern: "(?:收货电话|联系电话|电话)[：: ]*(\\d{11})" },
        { field: "receiverAddress", regexPattern: "收货地址[：: ]*(\\S+)" },
        { field: "externalCode", regexPattern: "单据编号[：: ]*([^单\\s]+)" }
      ],
      tableRowRegex: "(\\d+)(?:[\\u4e00-\\u9fa5]+)?(ZBWP\\d+)(.+?)(?:件|桶|包|盒|个)(\\d+)",
      tableFields: ["_index", "skuCode", "skuName", "quantity"]
    },
    mappings: [
      { field: "tempZone", defaultValue: "常温" },
      { field: "senderName", defaultValue: "黔寨寨总仓" },
      { field: "senderPhone", defaultValue: "13100000000" },
      { field: "senderAddress", defaultValue: "贵阳市黔寨寨仓" }
    ]
  }
};

const demosDir = 'C:\\Users\\Administrator\\Desktop\\demos';

async function runTests() {
  console.log("==================================================================");
  console.log("🌊 正在运行鲸天万能智能规则解析引擎自动化单元集成测试...");
  console.log("==================================================================");

  const files = fs.readdirSync(demosDir);

  for (const filename of files) {
    if (filename === 'package.json' || filename.startsWith('.')) continue;

    const rule = rules[filename];
    if (!rule) {
      console.log(`⚠️ 忽略文件: ${filename} (无匹配测试规则)`);
      continue;
    }

    const filepath = path.join(demosDir, filename);
    console.log(`\n📄 正在解析文件: [${filename}]`);
    console.log(`🛠️ 应用规则模板: "${rule.templateName}"`);

    const startTime = Date.now();
    let resultCount = 0;
    let records = [];

    try {
      if (rule.fileType === "excel") {
        const workbook = XLSX.readFile(filepath);
        records = RuleEngine.parseExcel(workbook, rule);
      } else if (rule.fileType === "pdf") {
        const buffer = fs.readFileSync(filepath);
        const pdfData = await pdf(buffer);
        records = RuleEngine.parseText(pdfData.text, rule);
      }

      // 补充默认值
      records = records.map(r => {
        const completed = { ...r };
        rule.mappings.forEach(m => {
          if (m.defaultValue !== undefined && m.defaultValue !== "" && (completed[m.field] === undefined || completed[m.field] === "")) {
            completed[m.field] = m.defaultValue;
          }
        });
        return completed;
      });

      const endTime = Date.now();
      resultCount = records.length;

      console.log(`✅ 解析成功！耗时: ${endTime - startTime} ms, 提取记录数: ${resultCount}`);
      if (resultCount > 0) {
        console.log(`🔍 样本运单记录预览 (第1条):`);
        console.log(JSON.stringify(records[0], null, 2));
      } else {
        console.log(`❌ 未能提取到任何记录`);
      }
    } catch (err) {
      console.error(`❌ 解析失败: ${err.message}`, err);
    }
  }

  console.log("\n==================================================================");
  console.log("🎉 所有复杂出库单的规则引擎集成测试执行完毕！");
  console.log("==================================================================");
}

runTests();
