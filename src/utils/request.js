/**
 * 通用请求工具封装 (基于 fetch)
 */
const BASE_URL = '' // 根据需要配置，当前使用相对路径

async function request(url, options = {}) {
  const { method = 'GET', headers = {}, body, ...rest } = options

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, config)
    
    // 处理 CSV 导出等非 JSON 响应
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('text/csv')) {
      return response // 直接返回 response 让调用者处理下载
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `请求失败: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}

export default request
