import appRoutes from "../../routes/routes";
import Button from "../Button/Button";
import "./Modal.scss";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

type ModalProps = {
  open: boolean;
  onClose?: () => void;
};

function Modal({ open, onClose }: ModalProps) {
  const navigate = useNavigate();

  const [shouldRender, setShouldRender] = useState(open);
  const [isClosing, setIsClosing] = useState(false);

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

        <Button
          variant="modal"
          onClick={() => {
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