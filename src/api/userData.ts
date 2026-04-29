import { useAppStore } from "../store/appStore";

const API_ORIGIN = "https://work.brandservicebot.ru";

  const tg = (window as any)?.Telegram?.WebApp;


export const fetchAndHydrateUserData = async (
  userId: number | string,
): Promise<void> => {
  const url = new URL(`${API_ORIGIN}/api/get_user_data/`);
  url.searchParams.set("user_id", String(userId));
 
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: tg?.initData,
    },
  });

  if (!response.ok) {
    throw new Error(`GET ${url} → HTTP ${response.status}`);
  }

  const raw = await response.json();

  useAppStore.getState().hydrateFromServer(raw);
};