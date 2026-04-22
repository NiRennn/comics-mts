import "./Info.scss";
import photo from "../../assets/images/info/i-photo.png";
import photo2 from "../../assets/images/info/i-photo-2.png";
import promo from "../../assets/images/info/i-promo.svg";
import dots from "../../assets/images/onboarding/ob-bg-dot.png";
import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";
import appRoutes from "../../routes/routes";
import { useState, useCallback, useEffect, useMemo } from "react";
import Modal from "../Modal/Modal";

function Info() {
  const navigate = useNavigate();
  const tg = useMemo(() => (window as any)?.Telegram?.WebApp, []);

  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
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

  return (
    <div className="Info">
      <img src={dots} alt="" className="Info__dots" />

      <div className="Info__content">
        <h1 className="Info__content_title">
          О&nbsp;партнере
          <br /> и&nbsp;призах
        </h1>

        <div className="Info__content_panel">
          <div className="Info__content_panel_content">
            <h1 className="Info__content_title">Призы</h1>

            <p className="Info__content_subtitle m5">
              Каждого участника ждёт промокод от&nbsp;современного сервиса
              аренды жилья Colife&nbsp;&mdash; чтобы начать самостоятельную
              жизнь было легче.
            </p>

            <img src={promo} alt="" className="Info__content_promo m25" />

            <p className="Info__content_subtitle sbold m25">
              Участники, которые дадут больше всего правильных ответов, смогут
              побороться за&nbsp;главный приз&nbsp;&mdash; годовую аренду комнаты
              в&nbsp;Colife.
            </p>

            <Button
              variant="primary"
              className="m25"
              onClick={openModal}
            >
              Начать тест
            </Button>
          </div>
        </div>

        <h1 className="Info__content_title tbold">
          Colife&nbsp;&mdash; это никакого &laquo;бабушкиного&raquo; ремонта:
          только стильные пространства, пинтерест-дизайн и&nbsp;комфортный вайб
          для жизни.
        </h1>

        <div className="Info__content_carousel">
          <div className="Info__content_carousel_track">
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
                src={photo}
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