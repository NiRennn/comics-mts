import "./Final.scss";
import dots from "../../assets/images/onboarding/ob-bg-dot.png";
import Promocode from "../Promocode/Promocode";
import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";
import appRoutes from "../../routes/routes";
import { useAppStore, type FinalResponseDto } from "../../store/appStore";
import { useEffect, useMemo, useState } from "react";
import { fetchAndHydrateUserData } from "../../api/userData";
const API_ORIGIN = "https://work.brandservicebot.ru";
const FINAL_RESULT_ENDPOINT = `${API_ORIGIN}/api/save_user_data/`;

type ApiPromoCodeDto = {
  code: string;
  used_dt: string;
};

type ApiFinalResponseDto = {
  success: boolean;
  correct_answers: number;
  total_questions: number;
  result: {
    id: number;
    picture: string;
    text: string;
    promocode_text: string;
    promocode_ended_text: string;
  };
  promo_code?: ApiPromoCodeDto | null;
};

const toAbsoluteImageUrl = (src?: string) => {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  return `${API_ORIGIN}${src.startsWith("/") ? src : `/${src}`}`;
};

const preloadSingleImage = (src?: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }

    const img = new Image();
    img.decoding = "async";

    img.onload = async () => {
      try {
        if ("decode" in img) {
          await img.decode();
        }
      } catch {
        // ignore
      }
      resolve();
    };

    img.onerror = () => resolve();
    img.src = src;
  });
};

function Final() {
  const navigate = useNavigate();

  const user = useAppStore((state) => state.user);
  const questions = useAppStore((state) => state.questions);
  const selectedAnswersByQuestion = useAppStore(
    (state) => state.selectedAnswersByQuestion,
  );
  const finalResponse = useAppStore((state) => state.finalResponse);
  const setFinalResponse = useAppStore((state) => state.setFinalResponse);
  const resetTestProgress = useAppStore((state) => state.resetTestProgress);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isScreenVisible, setIsScreenVisible] = useState(false);
  const [isResultVisible, setIsResultVisible] = useState(false);

  const answersPayload = useMemo(() => {
    return questions
      .map((question) => selectedAnswersByQuestion[question.id])
      .filter((answerId): answerId is number => typeof answerId === "number");
  }, [questions, selectedAnswersByQuestion]);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      setIsScreenVisible(true);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchFinalResult = async () => {
      if (!user?.user_id) {
        setError("Не найден user_id");
        return;
      }

      if (!questions.length) {
        setError("Нет вопросов для отправки");
        return;
      }

      if (answersPayload.length !== questions.length) {
        setError("Не все ответы выбраны");
        return;
      }

      if (finalResponse) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(FINAL_RESULT_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.user_id,
            answers: answersPayload,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Ошибка запроса: ${response.status}`);
        }

        const data: ApiFinalResponseDto = await response.json();

        if (!data?.success || !data?.result) {
          throw new Error("Бэкенд вернул некорректный ответ");
        }

        const normalizedData: FinalResponseDto = {
          success: data.success,
          correct_answers: data.correct_answers,
          total_questions: data.total_questions,
          result: {
            ...data.result,
            promocode: data.promo_code?.code ?? null,
          },
        };

        setFinalResponse(normalizedData);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Ошибка получения финального результата:", err);
        setError("Не удалось загрузить результат");
      } finally {
        setLoading(false);
      }
    };

    fetchFinalResult();

    return () => controller.abort();
  }, [user, questions, answersPayload, finalResponse, setFinalResponse]);

  const result = finalResponse?.result ?? null;
  const resultImage = toAbsoluteImageUrl(result?.picture);

  useEffect(() => {
    let cancelled = false;
    let rafId: number | null = null;

    const revealResult = async () => {
      if (loading) {
        setIsResultVisible(false);
        return;
      }

      if (!error && !result) {
        setIsResultVisible(false);
        return;
      }

      if (resultImage) {
        await Promise.race([
          preloadSingleImage(resultImage),
          new Promise((resolve) => window.setTimeout(resolve, 250)),
        ]);
      }

      if (cancelled) return;

      rafId = window.requestAnimationFrame(() => {
        setIsResultVisible(true);
      });
    };

    revealResult();

    return () => {
      cancelled = true;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [loading, error, result, resultImage]);

  const refreshUserDataBeforeNavigate = async () => {
    const userId = user?.user_id ?? (window as any).__uid;

    if (!userId) {
      console.error("user_id not found before navigation");
      return;
    }

    try {
      await fetchAndHydrateUserData(userId);
    } catch (error) {
      console.error("Error refreshing user data before navigation:", error);
    }
  };

  const handleRetry = async () => {
    await refreshUserDataBeforeNavigate();

    resetTestProgress();
    navigate(appRoutes.TEST);
  };

  const handleGoToMenu = async () => {
    await refreshUserDataBeforeNavigate();

    resetTestProgress();
    navigate(appRoutes.ONBOARDING);
  };

  return (
    <div className={`Final ${isScreenVisible ? "is-visible" : ""}`}>
      <img src={dots} alt="" className="Final__dots Final__screenFade" />

      <div className="Final__content Final__screenFade Final__screenFade--delay">
        {resultImage && (
          <img
            src={resultImage}
            alt="Результат теста"
            className={`Final__img Final__resultFade ${
              isResultVisible ? "is-visible" : ""
            }`}
          />
        )}
        <div></div>

        <div className="scroll">
          <div className="Final__content_textPromo">
            {loading ? (
              <p className="Final__content_text">Загружаем результат...</p>
            ) : error ? (
              <p
                className={`Final__content_text Final__resultFade ${
                  isResultVisible ? "is-visible" : ""
                }`}
              >
                {error}
              </p>
            ) : (
              <>
                <p
                  className={`Final__content_text Final__resultFade ${
                    isResultVisible ? "is-visible" : ""
                  }`}
                >
                  {result?.text ?? ""}
                </p>

                {result?.promocode && (
                  <p
                    className={`Final__content_text fbold Final__resultFade Final__resultFade--delay1 ${
                      isResultVisible ? "is-visible" : ""
                    }`}
                  >
                    {result.promocode_text}
                  </p>
                )}

                {result?.promocode == null && (
                  <p
                    className={`Final__content_text fbold Final__resultFade Final__resultFade--delay1 ${
                      isResultVisible ? "is-visible" : ""
                    }`}
                  >
                    {result?.promocode_ended_text}
                  </p>
                )}

                {result?.promocode && (
                  <div
                    className={`Final__resultFade Final__resultFade--delay2 ${
                      isResultVisible ? "is-visible" : ""
                    }`}
                  >
                    <Promocode text={result.promocode} />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="Final__content_btnBlock">
            <Button variant="primary" onClick={handleRetry}>
              Пройти еще раз
            </Button>

            <Button variant="secondary2" onClick={handleGoToMenu}>
              В меню
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Final;
