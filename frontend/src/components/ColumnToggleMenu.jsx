export default function ColumnToggleMenu({ columns, toggleColumn }) {
  return (
    <div className="flex gap-2 flex-wrap mb-2">
      {columns.map((col) => (
        <label key={col.key} className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={col.visible}
            onChange={() => toggleColumn(col.key)}
          />
          {col.label}
        </label>
      ))}
    </div>
  );
}
