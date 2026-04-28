// 本地开发用的 Express 服务器（模拟 Vercel Serverless Functions）
import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 3001

// 初始化 SQLite 数据库
const db = new Database(join(__dirname, 'prisma', 'dev.db'))
db.pragma('journal_mode = WAL')

// 创建表（如果不存在）
db.exec(`
  CREATE TABLE IF NOT EXISTS Todo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  )
`)

app.use(cors())
app.use(express.json())

// ============ 待办事项 CRUD ============

// 获取所有待办
app.get('/api/todos', (req, res) => {
  const todos = db.prepare('SELECT * FROM Todo ORDER BY createdAt DESC').all()
  res.json(todos.map(t => ({ ...t, completed: !!t.completed })))
})

// 新增待办
app.post('/api/todos', (req, res) => {
  const { title } = req.body
  if (!title || !title.trim()) return res.status(400).json({ error: '标题不能为空' })

  const stmt = db.prepare('INSERT INTO Todo (title) VALUES (?)')
  const result = stmt.run(title.trim())
  const todo = db.prepare('SELECT * FROM Todo WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json({ ...todo, completed: !!todo.completed })
})

// 更新待办
app.put('/api/todos', (req, res) => {
  const { id, completed, title } = req.body
  if (!id) return res.status(400).json({ error: '缺少 id' })

  const updates = []
  const values = []

  if (typeof completed === 'boolean') {
    updates.push('completed = ?')
    values.push(completed ? 1 : 0)
  }
  if (typeof title === 'string') {
    updates.push('title = ?')
    values.push(title.trim())
  }
  updates.push("updatedAt = datetime('now')")
  values.push(id)

  db.prepare(`UPDATE Todo SET ${updates.join(', ')} WHERE id = ?`).run(...values)
  const todo = db.prepare('SELECT * FROM Todo WHERE id = ?').get(id)
  res.json({ ...todo, completed: !!todo.completed })
})

// 删除待办
app.delete('/api/todos', (req, res) => {
  const { id } = req.body
  if (!id) return res.status(400).json({ error: '缺少 id' })
  db.prepare('DELETE FROM Todo WHERE id = ?').run(id)
  res.json({ success: true })
})

app.listen(PORT, () => {
  console.log(`✅ 本地 API 服务器已启动: http://localhost:${PORT}`)
  console.log(`📋 数据库: ${join(__dirname, 'prisma', 'dev.db')}`)
})
