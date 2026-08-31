import { useId, useRef, useState } from "react";
import { MdCheck, MdExpandMore } from "react-icons/md";

export type SelectOption = { value: string; label: string };

type CustomSelectProps = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
};

export default function CustomSelect({ value, options, onChange, placeholder = "انتخاب کنید", disabled, className = "", ariaLabel }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, options.findIndex((option) => option.value === value)));
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  const toggle = () => {
    if (!open) {
      setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)));
    }
    setOpen((current) => !current);
  };

  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setActiveIndex(index);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === "Escape") { setOpen(false); return; }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => {
        if (event.key === "Home") return 0;
        if (event.key === "End") return options.length - 1;
        return event.key === "ArrowDown" ? (current + 1) % options.length : (current - 1 + options.length) % options.length;
      });
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      choose(activeIndex);
    }
  };

  return <div className={`custom-select ${open ? "open" : ""} ${className}`} ref={rootRef} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button type="button" className="custom-select-trigger" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} disabled={disabled} onClick={toggle} onKeyDown={handleKeyDown}>
      <span className={selected ? "" : "placeholder"}>{selected?.label ?? placeholder}</span><MdExpandMore aria-hidden="true" />
    </button>
    {open && <div className="custom-select-menu" id={listId} role="listbox" aria-label={ariaLabel}>
      {options.map((option, index) => <button type="button" role="option" aria-selected={option.value === value} className={`custom-select-option${index === activeIndex ? " highlighted" : ""}`} key={option.value} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(index)}>
        <span>{option.label}</span>{option.value === value && <MdCheck aria-hidden="true" />}
      </button>)}
    </div>}
  </div>;
}
