// Simple dropdown for forms
export default function Dropdown({ value, onChange, options, placeholder, name }) {
  return (
    <select
      name={name}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="input-field w-full"
    >
      <option value="">{placeholder || 'Select...'}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
