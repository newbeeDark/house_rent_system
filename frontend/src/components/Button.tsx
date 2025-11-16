import React from 'react'

// 按钮组件（中文注释）：主按钮与描边按钮两种样式
export default function Button({ children, variant = 'solid', type = 'button', onClick, className, disabled, style }: { children: React.ReactNode, variant?: 'solid'|'outline', type?: 'button'|'submit', onClick?: () => void, className?: string, disabled?: boolean, style?: React.CSSProperties }) {
  const cls = variant === 'solid' ? 'btn' : 'btn btn-outline'
  return <button className={`${cls} ${className || ''}`} type={type} onClick={onClick} disabled={disabled} style={style}>{children}</button>
}