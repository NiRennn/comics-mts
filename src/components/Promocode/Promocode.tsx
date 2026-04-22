import "./Promocode.scss";
import copyImg from "../../assets/icons/copy.svg";
import { useEffect, useRef, useState } from "react";

type PromocodeProps = {
  text: string;
};

function Promocode({ text }: PromocodeProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const resetStatusLater = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setStatus("idle");
    }, 1800);
  };

  const fallbackCopy = (value: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";

    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, value.length);

    const success = document.execCommand("copy");
    document.body.removeChild(textarea);

    return success;
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const success = fallbackCopy(text);

        if (!success) {
          throw new Error("Fallback copy failed");
        }
      }

      setStatus("success");
      resetStatusLater();
    } catch (error) {
      console.error("Ошибка копирования:", error);
      setStatus("error");
      resetStatusLater();
    }
  };

  return (
    <div className="PromocodeWrapper">
      <button
        type="button"
        className={`Promocode ${
          status === "success" ? "is-copied" : ""
        } ${status === "error" ? "is-error" : ""}`}
        onClick={handleCopy}
        aria-label="Скопировать промокод"
      >
        <span className="Promocode__text">{text}</span>
        <img src={copyImg} alt="" className="Promocode__img" />
      </button>

      <span
        className={`Promocode__message ${
          status === "success"
            ? "show success"
            : status === "error"
            ? "show error"
            : ""
        }`}
      >
        {status === "success" && "Промокод скопирован"}
        {status === "error" && "Не удалось скопировать"}
      </span>
    </div>
  );
}

export default Promocode;