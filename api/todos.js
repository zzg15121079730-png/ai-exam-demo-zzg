import prisma from './lib/prisma.js'

export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    switch (req.method) {
      // 获取所有待办
      case 'GET': {
        const todos = await prisma.todo.findMany({
          orderBy: { createdAt: 'desc' }
        })
        return res.status(200).json(todos)
      }

      // 新增待办
      case 'POST': {
        const { title } = req.body
        if (!title || !title.trim()) {
          return res.status(400).json({ error: '标题不能为空' })
        }
        const todo = await prisma.todo.create({
          data: { title: title.trim() }
        })
        return res.status(201).json(todo)
      }

      // 更新待办（切换完成状态）
      case 'PUT': {
        const { id, completed, title } = req.body
        if (!id) {
          return res.status(400).json({ error: '缺少 id' })
        }
        const updateData = {}
        if (typeof completed === 'boolean') updateData.completed = completed
        if (typeof title === 'string') updateData.title = title.trim()

        const todo = await prisma.todo.update({
          where: { id: Number(id) },
          data: updateData
        })
        return res.status(200).json(todo)
      }

      // 删除待办
      case 'DELETE': {
        const { id: deleteId } = req.body
        if (!deleteId) {
          return res.status(400).json({ error: '缺少 id' })
        }
        await prisma.todo.delete({
          where: { id: Number(deleteId) }
        })
        return res.status(200).json({ success: true })
      }

      default:
        return res.status(405).json({ error: '不支持的请求方法' })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: '服务器内部错误' })
  }
}
