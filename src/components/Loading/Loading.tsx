import "./Loading.scss";
import bg from "../../assets/images/backgrounds/loader-back.jpg";
import bgDots from "../../assets/images/backgrounds/loader-dots.png";
import bgSticks from "../../assets/images/backgrounds/loader-sticks.png";
import Loader from "../Loader/Loader";
import {  useEffect } from "react";
import appRoutes from "../../routes/routes";
import { useNavigate } from "react-router-dom";
import { ONBOARDING_IMAGES } from "../../config/preloadAssets";
import { preloadImageSrcs } from "../../utils/preload";
import { useAppStore } from "../../store/appStore";

function Loading() {
  const navigate = useNavigate();
  const pickNextRoute = () => appRoutes.ONBOARDING;

    // const tg = (window as any)?.Telegram?.WebApp;


  useEffect(() => {
    let navigated = false;

    // console.log(tg.initData);
    // console.log(tg.id)

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
    // const effectiveUserId = 5789474743;
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
        const url = new URL(
          "https://work.brandservicebot.ru/api/get_user_data/",
        );
        url.searchParams.set("user_id", String(effectiveUserId));

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Authorization: tg?.initData,
            // Authorization: String(initData),
          },
        });

        if (!response.ok)
          throw new Error(`GET ${url} → HTTP ${response.status}`);

        const raw = await response.json();

        useAppStore.getState().hydrateFromServer(raw);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();

    // const asset = (p: string) =>
    //   new URL(
    //     `${import.meta.env.BASE_URL.replace(/\/$/, "")}${
    //       p.startsWith("/") ? p : `/${p}`
    //     }`,
    //     window.location.href,
    //   ).toString();
    // const images = Array.from(new Set([])).map(asset);

    // const preload = () => {
    //   const promises = images.map(
    //     (src) =>
    //       new Promise<{ src: string; ok: boolean }>((resolve) => {
    //         const img = new Image();
    //         img.decoding = "async";
    //         img.loading = "eager";

    //         img.onload = () => resolve({ src, ok: true });
    //         img.onerror = () => resolve({ src, ok: false });

    //         img.src = src;
    //       }),
    //   );

    //   Promise.all(promises).then((results) => {
    //     const failed = results.filter((r) => !r.ok).map((r) => r.src);
    //     if (failed.length) {
    //       console.warn("[preload] assets failed to load:", failed);
    //     }
    //   });
    // };
    // preload();

    const HARD_TIMEOUT_MS = 3000;
    const hard = window.setTimeout(() => go(pickNextRoute()), HARD_TIMEOUT_MS);

    return () => {
      window.clearTimeout(hard);
    };
  // }, [navigate, tg]);
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
