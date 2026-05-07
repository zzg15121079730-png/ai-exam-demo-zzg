<script setup>
import { ref, onMounted, reactive, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Refresh, Download, Upload } from '@element-plus/icons-vue'
// 引入 API 模块
import * as todoApi from './api/todo'

// --- 数据定义 ---
const tableData = ref([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)

// 详情弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({
  id: null,
  title: '',
  completed: false
})

// 导入相关
const fileInputRef = ref(null)
const importing = ref(false)

// 获取数据
async function fetchList() {
  loading.value = true
  try {
    const data = await todoApi.getTodoList({
      page: currentPage.value,
      pageSize: pageSize.value
    })
    tableData.value = data.list || []
    total.value = data.total || 0
  } catch (error) {
    ElMessage.error(error.message || '获取列表失败')
  } finally {
    loading.value = false
  }
}

// 保存（新增或编辑）
async function handleSave() {
  if (!form.title.trim()) {
    return ElMessage.warning('请输入标题')
  }

  try {
    const payload = isEdit.value 
      ? { id: form.id, title: form.title, completed: form.completed } 
      : { title: form.title }
    
    if (isEdit.value) {
      await todoApi.updateTodo(payload)
    } else {
      await todoApi.addTodo(payload)
    }

    ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
    dialogVisible.value = false
    fetchList()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 删除
async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定要删除这项内容吗？', '确认删除', { type: 'warning' })
    await todoApi.deleteTodo(id)
    ElMessage.success('删除成功')
    fetchList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除操作失败')
    }
  }
}

// --- 事件处理 ---
function openAdd() {
  isEdit.value = false
  form.id = null
  form.title = ''
  form.completed = false
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  form.id = row.id
  form.title = row.title
  form.completed = row.completed
  dialogVisible.value = true
}

function handlePageChange(page) {
  currentPage.value = page
  fetchList()
}

// --- 导出 ---
function handleExport() {
  // 直接触发浏览器下载
  const link = document.createElement('a')
  link.href = todoApi.EXPORT_URL
  link.download = 'todos_export.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('导出成功，文件已开始下载')
}

// --- 导入 ---
function triggerImport() {
  fileInputRef.value?.click()
}

async function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // 校验文件类型
  if (!file.name.endsWith('.csv')) {
    ElMessage.error('仅支持 .csv 文件')
    event.target.value = ''
    return
  }

  importing.value = true
  try {
    const text = await file.text()
    const items = parseCsv(text)

    if (items.length === 0) {
      ElMessage.warning('CSV 文件中没有有效数据')
      return
    }

    const data = await todoApi.importTodos(items)
    ElMessage.success(`导入成功，共导入 ${data.imported} 条任务`)
    fetchList()
  } catch (error) {
    ElMessage.error(error.message || '导入过程出错')
  } finally {
    importing.value = false
    event.target.value = '' // 重置以便重复上传同一文件
  }
}

// CSV 解析
function parseCsv(text) {
  // 移除可能的 BOM
  const cleaned = text.replace(/^\uFEFF/, '')
  const lines = cleaned.split(/\r?\n/).filter(line => line.trim())
  if (lines.length < 2) return []

  // 跳过表头
  const header = lines[0].toLowerCase()
  const hasHeader = header.includes('标题') || header.includes('title') || header.includes('id')
  const dataLines = hasHeader ? lines.slice(1) : lines

  return dataLines.map(line => {
    // 简单 CSV 解析（支持引号包裹字段）
    const fields = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === ',' && !inQuotes) {
        fields.push(current)
        current = ''
      } else {
        current += ch
      }
    }
    fields.push(current)

    // 兼容: CSV 可能包含 ID, 标题, 状态... 或只有标题
    if (fields.length >= 3) {
      return { title: fields[1].trim(), completed: fields[2].trim() }
    } else if (fields.length >= 1) {
      return { title: fields[0].trim(), completed: false }
    }
    return null
  }).filter(Boolean).filter(item => item.title)
}

// --- 虚拟表格配置 ---
const columns = [
  { key: 'id', dataKey: 'id', title: 'ID', width: 80 },
  { key: 'title', dataKey: 'title', title: '任务标题', width: 250, flexGrow: 1 },
  {
    key: 'completed',
    dataKey: 'completed',
    title: '状态',
    width: 100,
    cellRenderer: ({ cellData }) => h(
      'span',
      { style: { color: cellData ? '#67C23A' : '#E6A23C' } },
      cellData ? '✅ 已完成' : '🕒 待处理'
    )
  },
  {
    key: 'createdAt',
    dataKey: 'createdAt',
    title: '创建时间',
    width: 180,
    cellRenderer: ({ cellData }) => new Date(cellData).toLocaleString()
  },
  {
    key: 'actions',
    title: '操作',
    width: 150,
    fixed: 'right',
    cellRenderer: ({ rowData }) => h('div', [
      h(
        'button',
        {
          class: 'el-button el-button--primary el-button--small',
          onClick: () => openEdit(rowData)
        },
        '修改'
      ),
      h(
        'button',
        {
          class: 'el-button el-button--danger el-button--small',
          style: { marginLeft: '8px' },
          onClick: () => handleDelete(rowData.id)
        },
        '删除'
      )
    ])
  }
]

onMounted(fetchList)
</script>

<template>
  <div class="fullstack-container">
    <header class="page-header">
      <div class="logo">
        🚀 AI Full-Stack Demo
        <span class="author-tag">👤 开发者: 张志国</span>
        <a class="vercel-link" href="https://vercel.com" target="_blank">部署于 Vercel ▲</a>
      </div>
      <div class="actions">
        <el-button type="success" :icon="Download" @click="handleExport">导出</el-button>
        <el-button type="warning" :icon="Upload" @click="triggerImport" :loading="importing">导入</el-button>
        <el-button type="primary" :icon="Plus" @click="openAdd">新增任务</el-button>
        <el-button :icon="Refresh" @click="fetchList" circle />
      </div>
      <!-- 隐藏的文件上传 input -->
      <input
        ref="fileInputRef"
        type="file"
        accept=".csv"
        style="display: none"
        @change="handleFileChange"
      />
    </header>

    <main class="table-section" v-loading="loading">
      <!-- 虚拟表格 -->
      <div style="height: 500px; width: 100%">
        <el-auto-resizer>
          <template #default="{ height, width }">
            <el-table-v2 :columns="columns" :data="tableData" :width="width" :height="height" fixed />
          </template>
        </el-auto-resizer>
      </div>

      <!-- 分页栏 -->
      <div class="pagination-footer">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
          layout="total, prev, pager, next, jumper" @current-change="handlePageChange" background />
      </div>
    </main>

    <!-- 技术架构说明卡片 -->
    <section class="explanation-card">
      <h3>🏗️ 项目技术架构总览</h3>
      <p class="card-subtitle">本系统采用现代化前后端分离架构，以下为各层核心技术介绍：</p>
      <div class="tech-grid">
        <div class="tech-item">
          <span class="tech-label">🖥️ 前端技术</span>
          <span class="tech-name">Vue 3 + Element Plus</span>
          <span class="tech-desc">使用最新的 Vue 3 框架，配合 Element Plus 深度定制 UI，提供极致流畅的交互体验与标准化的企业级界面。</span>
        </div>
        <div class="tech-item">
          <span class="tech-label">⚡ 高效构建</span>
          <span class="tech-name">Vite 8 + ESM</span>
          <span class="tech-desc">基于原生 ESM 的极速开发环境，确保秒级热更新，大幅度缩短从代码编写到原型预览的周期。</span>
        </div>
        <div class="tech-item">
          <span class="tech-label">🔧 全栈能力</span>
          <span class="tech-name">Node.js + Express 5</span>
          <span class="tech-desc">利用 Serverless 架构实现后端逻辑，具备自动扩容、高性能响应能力，完美闭合前后端数据链路。</span>
        </div>
        <div class="tech-item">
          <span class="tech-label">🗄️ 核心数据库</span>
          <span class="tech-name">PostgreSQL (云原生)</span>
          <span class="tech-desc">采用高性能关系型数据库，存储于 Vercel 云端，确保数据持久化安全与毫秒级查询响应。</span>
        </div>
        <div class="tech-item">
          <span class="tech-label">🔗 现代 ORM</span>
          <span class="tech-name">Prisma 6</span>
          <span class="tech-desc">通过强类型定义的 ORM 方案，极大提升后端开发效率与数据库维护的安全性。</span>
        </div>
        <div class="tech-item">
          <span class="tech-label">☁️ 弹性部署</span>
          <span class="tech-name">Vercel Global CDN</span>
          <span class="tech-desc">项目全程托管于 Vercel，支持全球边缘加速与 CI/CD 自动部署，确保随时随地稳定访问。</span>
        </div>
      </div>
    </section>

    <!-- 编辑/新增 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑任务' : '新增任务'" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="请输入任务内容" />
        </el-form-item>
        <el-form-item label="状态" v-if="isEdit">
          <el-switch v-model="form.completed" active-text="已完成" inactive-text="待处理" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style>
/* 全局基础样式（Element Plus 虚拟表格依赖部分弹性布局） */
body {
  margin: 0;
  background-color: #f5f7fa;
  font-family: 'Inter', system-ui, sans-serif;
}

.fullstack-container {
  max-width: 1000px;
  margin: 40px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #ebeef5;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: bold;
  color: #409eff;
}

.author-tag {
  font-size: 0.85rem;
  font-weight: normal;
  color: #909399;
  background-color: #f4f4f5;
  padding: 4px 10px;
  border-radius: 12px;
  margin-left: 12px;
  border: 1px solid #e9e9eb;
}

.vercel-link {
  font-size: 0.85rem;
  font-weight: normal;
  color: #000;
  background-color: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  margin-left: 10px;
  text-decoration: none;
  border: 1px solid #eaeaea;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.vercel-link:hover {
  background-color: #000;
  color: #fff;
}

.table-section {
  padding: 24px;
}

.pagination-footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.explanation-card {
  margin: 0 24px 24px;
  padding: 24px;
  background: #f8fbff;
  border-left: 6px solid #409eff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.explanation-card h3 {
  margin: 0 0 8px;
  color: #000;
  font-size: 1.2rem;
  font-weight: 800;
}

.card-subtitle {
  margin: 0 0 20px !important;
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.tech-item {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 10px;
  padding: 16px 20px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
}

.tech-item:hover {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.12);
  transform: translateY(-2px);
}

.tech-label {
  font-size: 0.75rem;
  color: #555;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
}

.tech-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: #000;
  margin-bottom: 8px;
}

.tech-desc {
  font-size: 0.85rem;
  color: #222;
  line-height: 1.6;
  font-weight: 400;
}

/* 适配 el-table-v2 的按钮样式 */
.el-button--small {
  padding: 5px 11px;
  font-size: 12px;
  border-radius: 3px;
}
</style>
