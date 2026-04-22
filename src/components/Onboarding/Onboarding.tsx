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
import {
  ONBOARDING_IMAGES,
  INFO_IMAGES,
  FINAL_IMAGES,
} from "../../config/preloadAssets";
import { preloadImageSrcs } from "../../utils/preload";



function Onboarding() {
  const navigate = useNavigate();

  useEffect(() => {
    preloadImageSrcs(ONBOARDING_IMAGES).then((results) => {
      const failed = results.filter((r) => !r.ok).map((r) => r.src);
      if (failed.length) console.warn("[preload] failed:", failed);
    });
    preloadImageSrcs(INFO_IMAGES).then((results) => {
      const failed = results.filter((r) => !r.ok).map((r) => r.src);
      if (failed.length) console.warn("[preload] failed:", failed);
    });
    preloadImageSrcs(FINAL_IMAGES).then((results) => {
      const failed = results.filter((r) => !r.ok).map((r) => r.src);
      if (failed.length) console.warn("[preload] failed:", failed);
    });
  });

  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <div className="Onboarding">
      <img src={bg} alt="" className="Onboarding__background bg" />
      <img src={bgDots} alt="" className="Onboarding__background dots" />
      <img src={blur} alt="" className="Onboarding__blur" />
      <img src={girl} alt="" className="Onboarding__girl" />
      <img src={girlCut} alt="" className="Onboarding__girlCut" />
      <img src={logo} alt="" className="Onboarding__logo" />
      <div className="Onboarding__content">
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
            <Button variant="primary" onClick={() => openModal()}>
              Начать
            </Button>
            <Button variant="secondary">Подключить тариф риил</Button>
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
