import "./Promocode.scss";
import copyImg from "../../assets/icons/copy.svg";

type PromocodeProps = {
  text: string;
};

function Promocode({ text }: PromocodeProps) {
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
    } catch (error) {
      console.error("Ошибка копирования:", error);
    }
  };

  return (
    <div className="PromocodeWrapper">
      <button
        type="button"
        className="Promocode"
        onClick={handleCopy}
        aria-label="Скопировать промокод"
      >
        <span className="Promocode__text">{text}</span>
        <img src={copyImg} alt="" className="Promocode__img" />
      </button>
    </div>
  );
}

export default Promocode;