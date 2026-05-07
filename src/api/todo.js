import request from '../utils/request'

/**
 * 获取待办事项列表
 * @param {Object} params { page, pageSize }
 */
export function getTodoList(params) {
  const queryString = new URLSearchParams(params).toString()
  return request(`/api/todo/list?${queryString}`)
}

/**
 * 添加待办事项
 * @param {Object} data { title }
 */
export function addTodo(data) {
  return request('/api/todo/add', {
    method: 'POST',
    body: data
  })
}

/**
 * 更新待办事项
 * @param {Object} data { id, title, completed }
 */
export function updateTodo(data) {
  return request('/api/todo/update', {
    method: 'POST',
    body: data
  })
}

/**
 * 删除待办事项
 * @param {number} id
 */
export function deleteTodo(id) {
  return request('/api/todo/delete', {
    method: 'POST',
    body: { id }
  })
}

/**
 * 导入待办事项
 * @param {Array} items
 */
export function importTodos(items) {
  return request('/api/todo/import', {
    method: 'POST',
    body: { items }
  })
}

/**
 * 导出接口地址 (供浏览器直接下载使用)
 */
export const EXPORT_URL = '/api/todo/export'
