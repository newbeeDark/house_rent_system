// 输入框（中文注释）：带标签与错误提示的通用输入组件
export default function Input({ label, type = 'text', value, onChange, placeholder, error, required }: { label: string, type?: string, value: string, onChange: (v: string) => void, placeholder?: string, error?: string, required?: boolean }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <input className="input" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-invalid={!!error} aria-describedby={error ? `${label}-error` : undefined} required={required} />
      {error && <div id={`${label}-error`} className="subtitle" style={{color:'tomato'}}>{error}</div>}
    </div>
  )
}