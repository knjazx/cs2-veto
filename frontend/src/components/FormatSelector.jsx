/**
 * FormatSelector — Team A picks BO1 / BO3 / BO5 before veto starts.
 */
const FORMATS = [
  {
    id: "BO1",
    label: "Best of 1",
    description: "6 банов → 1 карта (Decider)",
  },
  {
    id: "BO3",
    label: "Best of 3",
    description: "Ban-Ban → Pick-Pick → Ban-Ban → Decider",
  },
  {
    id: "BO5",
    label: "Best of 5",
    description: "Ban-Ban → Pick-Pick-Pick-Pick → Decider",
  },
];

export default function FormatSelector({ onSelect }) {
  return (
    <div className="w-full space-y-3">
      <p className="text-xs text-muted tracking-widest uppercase">
        Выберите формат матча
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {FORMATS.map((fmt) => (
          <button
            key={fmt.id}
            onClick={() => onSelect(fmt.id)}
            className="border border-border hover:border-fg group
                       transition-colors duration-150 p-5 text-left"
          >
            <span className="block text-lg font-bold tracking-widest uppercase group-hover:text-fg">
              {fmt.id}
            </span>
            <span className="block text-xs text-muted mt-1 group-hover:text-fg/70 transition-colors">
              {fmt.label}
            </span>
            <span className="block text-xs text-muted/60 mt-2 leading-relaxed">
              {fmt.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
