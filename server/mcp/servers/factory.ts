import { createUserMcpServer } from './user'
import { createPublicMcpServer } from './public'
import { createAdminMcpServer } from './admin'

export function getMcpServer(type: 'user' | 'public' | 'admin') {
  if (type === 'user') return createUserMcpServer()
  if (type === 'public') return createPublicMcpServer()
  return createAdminMcpServer()
}
