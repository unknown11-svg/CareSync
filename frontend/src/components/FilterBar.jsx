// Simple filter/search bar for tables
export default function FilterBar({ value, onChange, placeholder }) {
  return (
    <div className="mb-4">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Search...'}
        className="input-field w-full"
      />
    </div>
  );
}
