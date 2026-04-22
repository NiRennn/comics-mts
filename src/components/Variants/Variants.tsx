import "./Variants.scss";
import { useEffect, useRef, useState } from "react";
import type { AnswerDto } from "../../store/appStore";

type VariantsProps = {
  items: AnswerDto[];
  selectedId: number | null;
  onSelect: (answerId: number) => void;
};

const getLetter = (index: number) =>
  String.fromCharCode("А".charCodeAt(0) + index);

function Variants({ items, selectedId, onSelect }: VariantsProps) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [maxHeight, setMaxHeight] = useState<number>(0);

  useEffect(() => {
    const measure = () => {
      const heights = itemRefs.current.map((el) => el?.offsetHeight ?? 0);
      setMaxHeight(Math.max(...heights, 0));
    };

    measure();
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
    };
  }, [items]);

  return (
    <div className="Variants"> 
      {items.map((item, index) => {
        const isSelected = selectedId === item.id;

        return (
          <button
            key={item.id}
            type="button"
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className={`Variant ${isSelected ? "isSelected" : ""}`}
            style={maxHeight ? { minHeight: `${maxHeight}px` } : undefined}
            onClick={() => onSelect(item.id)}
          >
            <div className="Variants__letter">{getLetter(index)}</div>
            <p className="Variants__text">{item.text}</p>
          </button>
        );
      })}
    </div>
  );
}

export default Variants;