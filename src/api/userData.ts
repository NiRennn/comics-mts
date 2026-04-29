import { useAppStore } from "../store/appStore";

const API_ORIGIN = "https://work.brandservicebot.ru";

export const fetchAndHydrateUserData = async (
  userId: number | string,
  initData: string,
): Promise<void> => {
  if (!initData) {
    throw new Error("Telegram initData is empty");
  }

  const url = new URL(`${API_ORIGIN}/api/get_user_data/`);
  url.searchParams.set("user_id", String(userId));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: initData as string,
    },
  });

  if (!response.ok) {
    throw new Error(`GET ${url} → HTTP ${response.status}`);
  }

  const raw = await response.json();

  useAppStore.getState().hydrateFromServer(raw);
};