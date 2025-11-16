import React from 'react'

// 卡片容器（中文注释）：统一页面卡片结构与阴影
export default function Card({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) {
  return <div className="card" style={style}>{children}</div>
}