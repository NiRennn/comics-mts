import "./Loading.scss";
import bg from "../../assets/images/backgrounds/loader-back.jpg";
import bgDots from "../../assets/images/backgrounds/loader-dots.png";
import bgSticks from "../../assets/images/backgrounds/loader-sticks.png";
import Loader from "../Loader/Loader";
import { useEffect } from "react";
import appRoutes from "../../routes/routes";
import { useNavigate } from "react-router-dom";
import {
  ONBOARDING_IMAGES,
  INFO_IMAGES,
  FINAL_IMAGES,
} from "../../config/preloadAssets";
import { preloadImageSrcs } from "../../utils/preload";
import { fetchAndHydrateUserData } from "../../api/userData";

function Loading() {
  const navigate = useNavigate();
  const pickNextRoute = () => appRoutes.ONBOARDING;

  // const tg = (window as any)?.Telegram?.WebApp;

  useEffect(() => {
    let navigated = false;



    const go = (to: string) => {
      if (navigated) return;
      navigated = true;
      navigate(to, { replace: true });
    };

    const tg = (window as any)?.Telegram?.WebApp;
    tg?.ready?.();

    const getEffectiveUserId = (): number | null => {
      try {
        const idFromUnsafe =
          tg?.initDataUnsafe?.user?.id != null
            ? Number(tg.initDataUnsafe.user.id)
            : NaN;
        if (Number.isFinite(idFromUnsafe)) return idFromUnsafe;

        const p = new URLSearchParams(window.location.search).get("user_id");
        const idFromQuery = p ? Number(p) : NaN;
        if (Number.isFinite(idFromQuery)) return idFromQuery;

        return null;
      } catch {
        return null;
      }
    };

    const effectiveUserId = getEffectiveUserId();
    // const effectiveUserId = 783751626;
    (window as any).__uid = effectiveUserId ?? null;

    preloadImageSrcs(ONBOARDING_IMAGES).then((results) => {
      const failed = results.filter((r) => !r.ok).map((r) => r.src);
      if (failed.length) console.warn("[preload] failed:", failed);
    });

    if (!effectiveUserId) {
      console.error("effectiveUserId not found");
      return;
    }

    try {
      const platform: string | undefined = tg?.platform;
      if (
        platform === "android" ||
        platform === "ios" ||
        platform === "android_x" ||
        platform === "unigram"
      ) {
        tg?.requestFullscreen?.();
        tg?.lockOrientation();
      } else if (
        platform === "tdesktop" ||
        platform === "weba" ||
        platform === "webk" ||
        platform === "unknown"
      ) {
        tg?.exitFullscreen?.();
        tg?.setMinimumHeight?.(700);
      }
      tg?.expand?.();
    } catch {
      tg?.expand?.();
    }
    try {
      tg?.disableVerticalSwipes?.();
    } catch {}

    tg?.setHeaderColor?.("#f3f9ff");
    tg?.setBackgroundColor?.("#f3f9ff");
    tg?.setBottomBarColor?.("#f3f9ff");

    const fetchUserData = async () => {
      try {
        await fetchAndHydrateUserData(effectiveUserId);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    const init = async () => {
      const minDelay = new Promise((resolve) => setTimeout(resolve, 3000));
      const hardTimeout = new Promise((resolve) => setTimeout(resolve, 3500));

      fetchUserData();

      const preloadCritical = preloadImageSrcs(ONBOARDING_IMAGES);
      const preloadSecondary = Promise.allSettled([
        preloadImageSrcs(INFO_IMAGES),
        preloadImageSrcs(FINAL_IMAGES),
      ]);

      try {
        await Promise.race([
          Promise.all([preloadCritical, minDelay]),
          hardTimeout,
        ]);
      } catch (e) {
        console.warn("[loading] preload race failed:", e);
      }

      preloadSecondary.catch(() => {});
      go(pickNextRoute());
    };

    init();

    return () => {};
  }, [navigate]);

  return (
    <div className="Loading">
      <img src={bg} alt="" className="Loading__background bg" />
      <img src={bgDots} alt="" className="Loading__background bgDots" />
      <img src={bgSticks} alt="" className="Loading__background bgSticks" />
      <Loader />
    </div>
  );
}

export default Loading;
