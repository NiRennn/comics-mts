import "./Info.scss";
import photo from "../../assets/images/info/i-photo.png";
import photo3 from "../../assets/images/info/i-photo-3.png";
import photo2 from "../../assets/images/info/i-photo-2.png";
import promo from "../../assets/images/info/i-promo.svg";
import dots from "../../assets/images/onboarding/ob-bg-dot.png";
import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";
import appRoutes from "../../routes/routes";
import Modal from "../Modal/Modal";
import { useAppStore } from "../../store/appStore";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";

function Info() {
  const navigate = useNavigate();
  const tg = useMemo(() => (window as any)?.Telegram?.WebApp, []);

  const rulesAccepted = useAppStore((state) => state.user?.rules === true);

  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const carousel = carouselRef.current;
      if (!carousel) return;

      isDraggingRef.current = true;
      startXRef.current = event.pageX - carousel.offsetLeft;
      scrollLeftRef.current = carousel.scrollLeft;

      carousel.classList.add("is-dragging");
    },
    [],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const carousel = carouselRef.current;
      if (!carousel || !isDraggingRef.current) return;

      event.preventDefault();

      const x = event.pageX - carousel.offsetLeft;
      const walk = x - startXRef.current;

      carousel.scrollLeft = scrollLeftRef.current - walk;
    },
    [],
  );

  const stopDragging = useCallback(() => {
    const carousel = carouselRef.current;

    isDraggingRef.current = false;
    carousel?.classList.remove("is-dragging");
  }, []);

  const handleStartTest = useCallback(() => {
    if (rulesAccepted) {
      navigate(appRoutes.TEST);
      return;
    }

    setIsOpen(true);
  }, [rulesAccepted, navigate]);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const handleBack = useCallback(() => {
    if (isOpen) {
      closeModal();
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(appRoutes.ONBOARDING, { replace: true });
  }, [closeModal, isOpen, navigate]);

  useEffect(() => {
    const backButton = tg?.BackButton;

    if (!backButton) return;

    backButton.show();
    backButton.onClick(handleBack);

    return () => {
      backButton.offClick(handleBack);
      backButton.hide();
    };
  }, [handleBack, tg]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={`Info ${isVisible ? "is-visible" : ""}`}>
      <div className="Info__veil" />

      <img src={dots} alt="" className="Info__dots Info__fade dotsLayer" />

      <div className="Info__content">
        <h1 className="Info__content_title Info__fade titleLayer">
          О&nbsp;партнере
          <br /> и&nbsp;призах
        </h1>

        <div className="Info__content_panel Info__fade panelLayer">
          <div className="Info__content_panel_content">
            <h1 className="Info__content_title Info__fade panelTitleLayer">
              Призы
            </h1>

            <p className="Info__content_subtitle m5 Info__fade panelTextLayer">
              Каждого участника ждёт промокод от&nbsp;современного сервиса
              аренды жилья Colife&nbsp;&mdash; чтобы начать самостоятельную
              жизнь было легче.
            </p>

            <img
              src={promo}
              alt=""
              className="Info__content_promo m25 Info__fade promoLayer"
            />

            <p className="Info__content_subtitle sbold m25 Info__fade panelStrongLayer">
              Участники, которые дадут больше всего правильных ответов, смогут
              побороться за&nbsp;главный приз&nbsp;&mdash; годовую аренду
              комнаты в&nbsp;Colife.
            </p>

            <Button
              variant="primary"
              className="m25 Info__fade buttonLayer"
              onClick={handleStartTest}
            >
              Начать тест
            </Button>
          </div>
        </div>

        <h1 className="Info__content_title tbold Info__fade bottomTitleLayer">
          Colife&nbsp;&mdash; это никакого &laquo;бабушкиного&raquo; ремонта:
          только стильные пространства, пинтерест-дизайн и&nbsp;комфортный вайб
          для жизни.
        </h1>

        <div className="Info__content_carousel Info__fade carouselLayer">
          <div
            ref={carouselRef}
            className="Info__content_carousel_track"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
          >
            {" "}
            <div className="Info__content_slide">
              <img
                src={photo}
                alt="Интерьер Colife 1"
                className="Info__content_slide_img"
              />
            </div>
            <div className="Info__content_slide">
              <img
                src={photo2}
                alt="Интерьер Colife 2"
                className="Info__content_slide_img"
              />
            </div>
            <div className="Info__content_slide">
              <img
                src={photo3}
                alt="Интерьер Colife 3"
                className="Info__content_slide_img"
              />
            </div>
          </div>
        </div>
      </div>

      <Modal open={isOpen} onClose={closeModal} />
    </div>
  );
}

export default Info;
