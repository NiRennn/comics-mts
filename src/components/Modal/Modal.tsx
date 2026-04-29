import appRoutes from "../../routes/routes";
import Button from "../Button/Button";
import "./Modal.scss";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import closeImg from "../../assets/icons/close.svg";

type ModalProps = {
  open: boolean;
  onClose?: () => void;
};

function Modal({ open, onClose }: ModalProps) {
  const navigate = useNavigate();

  const [shouldRender, setShouldRender] = useState(open);
  const [isClosing, setIsClosing] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setIsClosing(false);
      return;
    }

    if (shouldRender) {
      setIsClosing(true);
    }
  }, [open, shouldRender]);

  const handleClose = () => {
    if (!open) return;
    onClose?.();
  };

  const handleContentAnimationEnd = () => {
    if (isClosing) {
      setShouldRender(false);
      setIsClosing(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`Modal ${isClosing ? "Modal--closing" : "Modal--opening"}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-title"
      onClick={handleClose}
    >
      <div
        className={`Modal__content ${
          isClosing ? "Modal__content--closing" : "Modal__content--opening"
        }`}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleContentAnimationEnd}
      >
        <button
          className="closeBtn"
          onClick={() => {
            onClose?.();
          }}
        >
          <img src={closeImg} alt="" className="closeImg" />
        </button>
        <div className="Modal__content_textBlock">
          <h1 id="rules-title" className="Modal__content_header">
            Правила
          </h1>

          <p className="Modal__content_text">
            Тебе нужно ответить на&nbsp;10&nbsp;ситуативных вопросов
            о&nbsp;самостоятельной жизни, выбрав один из&nbsp;трех вариантов
            ответа. В&nbsp;конце ждет сюрприз!
          </p>
        </div>

        <div className="Modal__content_checkboxWrapper">
          <label className="RulesCheckbox">
            <input
              className="RulesCheckbox__input"
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />

            <span className="RulesCheckbox__box">
              <svg
                className="RulesCheckbox__icon"
                width="25"
                height="20"
                viewBox="0 0 25 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 9.5L9.2 16.5L23 2"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <span className="RulesCheckbox__text">
              Я ознакомился и соглашаюсь <br />с{" "}
              <a
                href="https://ya.ru/"
                target="_blank"
                rel="noopener noreferrer"
                className="RulesCheckbox__link"
                onClick={(e) => e.stopPropagation()}
              >
                Правилами конкурса
              </a>
            </span>
          </label>
        </div>

        <Button
          variant="modal"
          disabled={!checked}
          onClick={() => {
            if (!checked) return;

            onClose?.();
            navigate(appRoutes.TEST);
          }}
        >
          Начать
        </Button>
      </div>
    </div>
  );
}

export default Modal;
