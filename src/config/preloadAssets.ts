import obBg from "../assets/images/onboarding/ob-bg.jpg";
import obBgDot from "../assets/images/onboarding/ob-bg-dot.png";
import obBlur from "../assets/images/onboarding/ob-blur.png";
import obGirl from "../assets/images/onboarding/ob-girl.jpg";
import obGirlCut from "../assets/images/onboarding/ob-girl-cut.png";
import obLogo from "../assets/images/onboarding/ob-logo.png";
import obPanel from "../assets/images/onboarding/ob-panel.png";

import infoBg from "../assets/images/info/i-bg.jpg";
import infoPanel from "../assets/images/info/i-panel.png";
import infoPhoto from "../assets/images/info/i-photo.png";
import infoPhoto2 from "../assets/images/info/i-photo-2.png";
import infoPromo from "../assets/images/info/i-promo.svg";

import finalImg from "../assets/images/final/f-img.png";
import finalPanel from "../assets/images/final/f-panel.png";

export const ONBOARDING_IMAGES = [
  obBgDot,
  obBg,
  obBlur,
  obGirlCut,
  obGirl,
  obLogo,
  obPanel,
] as const;

export const INFO_IMAGES = [
  infoBg,
  infoPanel,
  infoPhoto2,
  infoPhoto,
  infoPromo,
] as const;

export const FINAL_IMAGES = [
  finalImg,
  finalPanel,
] as const;