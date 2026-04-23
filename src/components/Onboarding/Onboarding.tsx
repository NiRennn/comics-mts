import "./Onboarding.scss";
import bg from "../../assets/images/onboarding/ob-bg.jpg";
import bgDots from "../../assets/images/onboarding/ob-bg-dot.png";
import blur from "../../assets/images/onboarding/ob-blur.png";
import girl from "../../assets/images/onboarding/ob-girl.jpg";
import girlCut from "../../assets/images/onboarding/ob-girl-cut.png";
import logo from "../../assets/images/onboarding/ob-logo.png";
import Button from "../Button/Button";
import Modal from "../Modal/Modal";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import appRoutes from "../../routes/routes";
import { INFO_IMAGES, FINAL_IMAGES } from "../../config/preloadAssets";
import { preloadImageSrcs } from "../../utils/preload";

const TARIFF_URL = "https://ya.ru";

function Onboarding() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    preloadImageSrcs(INFO_IMAGES).catch(() => {});
    preloadImageSrcs(FINAL_IMAGES).catch(() => {});

    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={`Onboarding ${isVisible ? "is-visible" : ""}`}>
      <img
        src={bg}
        alt=""
        className="Onboarding__background bg Onboarding__fade bgLayer"
      />
      <img
        src={bgDots}
        alt=""
        className="Onboarding__background dots Onboarding__fade dotsLayer"
      />
      <img
        src={blur}
        alt=""
        className="Onboarding__blur Onboarding__fade blurLayer"
      />
      <img
        src={girl}
        alt=""
        className="Onboarding__girl Onboarding__fade girlLayer"
      />
      <img
        src={girlCut}
        alt=""
        className="Onboarding__girlCut Onboarding__fade girlCutLayer"
      />
      <img
        src={logo}
        alt=""
        className="Onboarding__logo Onboarding__fade logoLayer"
      />

      <div className="Onboarding__content contentLayer">
        <div className="Onboarding__content_content">
          <div className="Onboarding__content_textBlock">
            <h1 className="Onboarding__content_textBlock_title">
              Готов&nbsp;ли ты&nbsp;к&nbsp;взрослой жизни?
            </h1>
            <p className="Onboarding__content_textBlock_subtitle">
              Сможешь не&nbsp;погрязнуть в&nbsp;бытовухе? Разбираешься&nbsp;ли
              со&nbsp;счётчиками и&nbsp;оплатой коммуналки? Отличишь стиральную
              машину от&nbsp;кофемашины? Пройди тест, узнай свои шансы
              на&nbsp;самостоятельную жизнь и&nbsp;выиграй годовую аренду
              квартиры от&nbsp;РИИЛ x&nbsp;Colife. Для&nbsp;участия
              в&nbsp;розыгрыше у&nbsp;тебя должен быть подключён тариф&nbsp;РИИЛ
            </p>
          </div>

          <div className="Onboarding__content_buttonBlock">
            <Button variant="primary" onClick={openModal}>
              Начать
            </Button>

            <Button
              variant="secondary"
              onClick={() =>
                window.open(TARIFF_URL, "_blank", "noopener,noreferrer")
              }
            >
              Подключить тариф риил
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(appRoutes.INFO)}
            >
              о партнерах и призах
            </Button>
          </div>
        </div>
      </div>

      <Modal open={isOpen} onClose={closeModal} />
    </div>
  );
}

export default Onboarding;
