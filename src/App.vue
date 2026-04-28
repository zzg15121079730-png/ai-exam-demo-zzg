<script setup>
import { ref, onMounted, computed } from 'vue'

const todos = ref([])
const newTitle = ref('')
const loading = ref(false)
const filter = ref('all') // all | active | completed

// API 基础路径 - 本地开发走 vite proxy，生产走 /api
const API_BASE = '/api/todos'

// 过滤后的列表
const filteredTodos = computed(() => {
  if (filter.value === 'active') return todos.value.filter(t => !t.completed)
  if (filter.value === 'completed') return todos.value.filter(t => t.completed)
  return todos.value
})

// 统计
const activeCount = computed(() => todos.value.filter(t => !t.completed).length)
const completedCount = computed(() => todos.value.filter(t => t.completed).length)

// 获取所有待办
async function fetchTodos() {
  loading.value = true
  try {
    const res = await fetch(API_BASE)
    todos.value = await res.json()
  } catch (e) {
    console.error('获取失败:', e)
  } finally {
    loading.value = false
  }
}

// 新增
async function addTodo() {
  if (!newTitle.value.trim()) return
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.value })
    })
    const todo = await res.json()
    todos.value.unshift(todo)
    newTitle.value = ''
  } catch (e) {
    console.error('新增失败:', e)
  }
}

// 切换状态
async function toggleTodo(todo) {
  try {
    const res = await fetch(API_BASE, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: todo.id, completed: !todo.completed })
    })
    const updated = await res.json()
    const idx = todos.value.findIndex(t => t.id === todo.id)
    if (idx !== -1) todos.value[idx] = updated
  } catch (e) {
    console.error('更新失败:', e)
  }
}

// 删除
async function deleteTodo(id) {
  try {
    await fetch(API_BASE, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    todos.value = todos.value.filter(t => t.id !== id)
  } catch (e) {
    console.error('删除失败:', e)
  }
}

// 格式化时间
function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  })
}

onMounted(fetchTodos)
</script>

<template>
  <div class="app">
    <!-- 头部 -->
    <header class="header">
      <div class="header-glow"></div>
      <h1>📋 AI 待办助手</h1>
      <p class="subtitle">Vue 3 + Vercel Serverless + Prisma 全栈 Demo</p>
    </header>

    <!-- 输入区 -->
    <div class="input-area">
      <div class="input-wrapper">
        <input
          v-model="newTitle"
          @keyup.enter="addTodo"
          placeholder="输入待办事项，按回车添加..."
          class="todo-input"
          id="todo-input"
        />
        <button @click="addTodo" class="add-btn" id="add-btn">
          <span>+</span>
        </button>
      </div>
    </div>

    <!-- 过滤器 & 统计 -->
    <div class="toolbar">
      <div class="filters">
        <button
          v-for="f in ['all', 'active', 'completed']"
          :key="f"
          :class="['filter-btn', { active: filter === f }]"
          @click="filter = f"
        >
          {{ f === 'all' ? '全部' : f === 'active' ? '待完成' : '已完成' }}
        </button>
      </div>
      <div class="stats">
        <span class="stat active-stat">🔵 {{ activeCount }} 待完成</span>
        <span class="stat completed-stat">✅ {{ completedCount }} 已完成</span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- 列表 -->
    <ul class="todo-list" v-else>
      <li
        v-for="todo in filteredTodos"
        :key="todo.id"
        :class="['todo-item', { completed: todo.completed }]"
      >
        <button
          class="check-btn"
          @click="toggleTodo(todo)"
          :id="'toggle-' + todo.id"
        >
          <span v-if="todo.completed">✅</span>
          <span v-else>⭕</span>
        </button>
        <div class="todo-content">
          <span class="todo-title">{{ todo.title }}</span>
          <span class="todo-date">{{ formatDate(todo.createdAt) }}</span>
        </div>
        <button
          class="delete-btn"
          @click="deleteTodo(todo.id)"
          :id="'delete-' + todo.id"
        >
          🗑️
        </button>
      </li>

      <!-- 空状态 -->
      <li v-if="filteredTodos.length === 0" class="empty-state">
        <span class="empty-icon">📝</span>
        <p>{{ filter === 'all' ? '还没有待办事项，添加一个吧！' : '没有符合条件的待办事项' }}</p>
      </li>
    </ul>

    <!-- 底部技术栈说明 -->
    <footer class="footer">
      <p>🚀 技术栈：Vue 3 · Vite · Vercel Serverless Functions · Prisma ORM · SQLite/PostgreSQL</p>
    </footer>
  </div>
</template>

<style scoped>
/* ===== 变量 ===== */
:root {
  --primary: #6366f1;
  --primary-light: #818cf8;
  --primary-dark: #4f46e5;
  --bg: #0f172a;
  --card: #1e293b;
  --card-hover: #334155;
  --text: #e2e8f0;
  --text-dim: #94a3b8;
  --danger: #ef4444;
  --success: #22c55e;
  --border: #334155;
  --radius: 12px;
}

.app {
  max-width: 640px;
  margin: 0 auto;
  padding: 20px 16px 40px;
  min-height: 100vh;
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
}

/* ===== 头部 ===== */
.header {
  text-align: center;
  padding: 40px 0 24px;
  position: relative;
}

.header-glow {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 200px;
  background: radial-gradient(ellipse, rgba(99, 102, 241, 0.15), transparent 70%);
  pointer-events: none;
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #818cf8, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.subtitle {
  color: var(--text-dim);
  margin-top: 8px;
  font-size: 0.875rem;
}

/* ===== 输入区 ===== */
.input-area {
  margin-bottom: 20px;
}

.input-wrapper {
  display: flex;
  gap: 10px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 6px;
  transition: border-color 0.2s;
}

.input-wrapper:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.todo-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 1rem;
  padding: 10px 12px;
}

.todo-input::placeholder {
  color: var(--text-dim);
}

.add-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s;
}

.add-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.add-btn:active {
  transform: scale(0.95);
}

/* ===== 工具栏 ===== */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.filters {
  display: flex;
  gap: 4px;
  background: var(--card);
  border-radius: 10px;
  padding: 3px;
}

.filter-btn {
  border: none;
  background: transparent;
  color: var(--text-dim);
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.filter-btn.active {
  background: var(--primary);
  color: white;
}

.filter-btn:hover:not(.active) {
  color: var(--text);
}

.stats {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
}

.stat {
  color: var(--text-dim);
}

/* ===== 加载 ===== */
.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== 列表 ===== */
.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  transition: all 0.2s;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.todo-item:hover {
  background: var(--card-hover);
  border-color: rgba(99, 102, 241, 0.3);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-title {
  text-decoration: line-through;
  color: var(--text-dim);
}

.check-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  line-height: 1;
  transition: transform 0.2s;
}

.check-btn:hover {
  transform: scale(1.2);
}

.todo-content {
  flex: 1;
  min-width: 0;
}

.todo-title {
  display: block;
  color: var(--text);
  font-size: 0.95rem;
  word-break: break-word;
}

.todo-date {
  display: block;
  color: var(--text-dim);
  font-size: 0.75rem;
  margin-top: 4px;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  padding: 4px;
}

.todo-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  transform: scale(1.2);
}

/* ===== 空状态 ===== */
.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--text-dim);
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

/* ===== 底部 ===== */
.footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.footer p {
  color: var(--text-dim);
  font-size: 0.75rem;
  margin: 0;
}
</style>
