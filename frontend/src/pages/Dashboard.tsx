// 仪表盘占位页（中文注释）：展示当前用户的登录状态与角色
function getRoleFromToken(token: string | null): string {
  if (!token) return 'guest'
  try {
    const [, payload] = token.split('.')
    const json = JSON.parse(atob(payload))
    return json.role || 'tenant'
  } catch {
    return 'tenant'
  }
}

export default function Dashboard() {
  const role = getRoleFromToken(localStorage.getItem('token'))
  return (
    <div className="container">
      <div className="card" style={{textAlign:'center'}}>
        <h1 className="title">Dashboard</h1>
        <p className="subtitle">Role: {role}</p>
      </div>
    </div>
  )
}