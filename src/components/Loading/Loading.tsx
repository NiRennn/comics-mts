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

    const tg = (window as any)?.Telegram?.WebApp;
    tg?.ready?.();

    const go = (to: string) => {
      if (navigated) return;
      navigated = true;
      navigate(to, { replace: true });
    };

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
    const initData = tg?.initData ?? "";

    // const initData = "user=%7B%22id%22%3A783751626%2C%22first_name%22%3A%22%D0%9A%D0%BE%D1%81%D1%82%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22Deadly_Harlequine%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2Fl0kw4w0I95ZbMH8JAdPx3NfQwh1NpMo80TLCuNUWD38.svg%22%7D&chat_instance=4660196123306434724&chat_type=private&auth_date=1777474452&signature=xH96cotNslDGi72I0-4AIFLoK5mLBgL4JUfpSHeLtZRo5eIDTK1Lkz5fGnawURrvVEFsIx1rbzevNBEefrFCBg&hash=0bc116406f7a72a0b1db92f068bbb9bed777f1a0e45a31cc8cd743f398b9bbe7";
    // const effectiveUserId = 783751626;
    (window as any).__uid = effectiveUserId ?? null;

    // console.log(initData)

    preloadImageSrcs(ONBOARDING_IMAGES).then((results) => {
      const failed = results.filter((r) => !r.ok).map((r) => r.src);
      if (failed.length) console.warn("[preload] failed:", failed);
    });

    if (!effectiveUserId) {
      console.error("effectiveUserId not found");
      return;
    }
    if (!initData) {
      console.error("Telegram initData is empty");
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
        await fetchAndHydrateUserData(effectiveUserId, initData);
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
