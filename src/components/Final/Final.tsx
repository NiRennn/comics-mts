import "./Final.scss";
import dots from "../../assets/images/onboarding/ob-bg-dot.png";
import Promocode from "../Promocode/Promocode";
import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";
import appRoutes from "../../routes/routes";
import { useAppStore } from "../../store/appStore";
import { useEffect, useMemo, useState } from "react";

const API_ORIGIN = "https://work.brandservicebot.ru";
const FINAL_RESULT_ENDPOINT = `${API_ORIGIN}/api/save_user_data/`; 
const toAbsoluteImageUrl = (src?: string) => {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  return `${API_ORIGIN}${src.startsWith("/") ? src : `/${src}`}`;
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

  const answersPayload = useMemo(() => {
    return questions
      .map((question) => selectedAnswersByQuestion[question.id])
      .filter((answerId): answerId is number => typeof answerId === "number");
  }, [questions, selectedAnswersByQuestion]);

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

        const data = await response.json();

        if (!data?.success || !data?.result) {
          throw new Error("Бэкенд вернул некорректный ответ");
        }

        setFinalResponse(data);
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
  }, [
    user,
    questions,
    answersPayload,
    finalResponse,
    setFinalResponse,
  ]);

  const result = finalResponse?.result ?? null;
  const resultImage = toAbsoluteImageUrl(result?.picture);

  const handleRetry = () => {
    resetTestProgress();
    navigate(appRoutes.TEST);
  };

  const handleGoToMenu = () => {
    resetTestProgress();
    navigate(appRoutes.ONBOARDING);
  };

  return (
    <div className="Final">
      <img src={dots} alt="" className="Final__dots" />

      {resultImage && (
        <img src={resultImage} alt="Результат теста" className="Final__img" />
      )}

      <div className="Final__content">
        <div></div>
        <div className="Final__content_textPromo">
          <p className="Final__content_text">
            {loading
              ? "Загружаем результат..."
              : error
                ? error
                : result?.text ?? ""}
          </p>

          {!loading && !error && result?.promocode_text && ( 
            <p className="Final__content_text fbold">
              {result.promocode_text}
            </p>
          )}

          {!loading && !error && result?.promocode && (
            <Promocode text={result.promocode} />
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
  );
}

export default Final;