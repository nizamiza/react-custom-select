import {
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./Select.module.css";

export type Option<T> = {
  label: ReactNode;
  value: T;
};

export type SelectProps<T> = {
  defaultOption?: T;
  options: Option<T>[];
  onChange?: (value: T) => void;
};

function Select<T>({ defaultOption, options, onChange }: SelectProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedOptionValue, setSelectedOptionValue] = useState<T>(
    defaultOption ?? options[0].value
  );

  const [orientation, setOrientation] = useState<"top" | "bottom">("bottom");

  const selectedOptionIndex = useMemo(
    () => options.findIndex((option) => option.value === selectedOptionValue),
    [options, selectedOptionValue]
  );

  const orderedOptionIndexes = useMemo(() => {
    const indexes = [selectedOptionIndex];

    options.forEach((_, index) => {
      if (index !== selectedOptionIndex) {
        indexes.push(index);
      }
    });

    return indexes;
  }, [options, selectedOptionIndex]);

  const [focusedOptionIndex, setFocusedOptionIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const id = useId();

  const getOptionId = useCallback(
    (index: number) => `${id}-option-${index}`,
    [id]
  );

  const getOptionIndexById = (id: string): number => {
    return Number(id.split("-option-").pop());
  };

  const closeSelect = useCallback(() => {
    setExpanded(false);
    setFocusedOptionIndex(0);
  }, []);

  const handleChange: MouseEventHandler<HTMLDivElement> = (event) => {
    const target = event.target as HTMLElement | null;

    if (!target?.id || target.role !== "option") {
      return;
    }

    const option = options[getOptionIndexById(target.id)];
    const selected = target.getAttribute("aria-selected") === "true";

    if (selected) {
      setExpanded(!expanded);

      if (containerRef.current) {
        const { bottom, height } = containerRef.current.getBoundingClientRect();

        const isBelowViewPort =
          window.innerHeight - bottom <= height * options.length;

        setOrientation(isBelowViewPort ? "top" : "bottom");
      }

      return;
    }

    setSelectedOptionValue(option.value);
    onChange?.(option.value);
    closeSelect();
  };

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (!expanded || !["ArrowDown", "ArrowUp"].includes(event.key)) {
      return;
    }

    let nextIndex: number;

    if (event.key === "ArrowDown") {
      nextIndex = (focusedOptionIndex + 1) % options.length;
    } else {
      nextIndex =
        focusedOptionIndex === 0 ? options.length - 1 : focusedOptionIndex - 1;
    }

    setFocusedOptionIndex(nextIndex);
    document
      .getElementById(getOptionId(orderedOptionIndexes[nextIndex]))
      ?.focus();

    event.preventDefault();
  };

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target) {
        return;
      }

      if (!target.id.startsWith(id)) {
        closeSelect();
      }
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  return (
    <div
      className={styles["select"]}
      id={id}
      role="listbox"
      data-expanded={expanded}
      aria-activedescendant={getOptionId(selectedOptionIndex)}
      tabIndex={expanded ? 0 : -1}
      onKeyDown={handleKeyDown}
      onClick={handleChange}
      ref={containerRef}
    >
      <button
        className={styles["select-option"]}
        role="option"
        id={getOptionId(selectedOptionIndex)}
        aria-selected="true"
        tabIndex={orderedOptionIndexes.indexOf(0)}
        aria-controls={id}
        aria-expanded={expanded}
      >
        {options[selectedOptionIndex].label}
      </button>
      <div className={styles["select-options"]} data-orientation={orientation}>
        {options.map((option, index) => {
          const selected = selectedOptionValue === option.value;

          if (selected) return null;

          return (
            <button
              className={styles["select-option"]}
              key={index}
              role="option"
              id={getOptionId(index)}
              aria-selected={selected}
              tabIndex={orderedOptionIndexes.indexOf(index)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Select;
