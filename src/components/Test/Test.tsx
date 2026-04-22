import "./Test.scss";
import bg from "../../assets/images/backgrounds/loader-back.jpg";
import bgDots from "../../assets/images/backgrounds/loader-dots.png";
import Variants from "../Variants/Variants";
import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "../../store/appStore";
import { useNavigate } from "react-router-dom";
import appRoutes from "../../routes/routes";

const API_ORIGIN = "https://work.brandservicebot.ru";

const toAbsoluteImageUrl = (src?: string) => {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  return `${API_ORIGIN}${src.startsWith("/") ? src : `/${src}`}`;
};

function Test() {
  const navigate = useNavigate();

  const questions = useAppStore((state) => state.questions);
  const selectedAnswersByQuestion = useAppStore(
    (state) => state.selectedAnswersByQuestion,
  );
  const setAnswer = useAppStore((state) => state.setAnswer);

  const [currentIndex, setCurrentIndex] = useState(0);

  const totalQuestions = questions.length;

  useEffect(() => {
    if (currentIndex > totalQuestions - 1) {
      setCurrentIndex(0);
    }
  }, [currentIndex, totalQuestions]);

  const currentQuestion = useMemo(
    () => questions[currentIndex] ?? null,
    [questions, currentIndex],
  );

  const currentSelectedAnswerId = currentQuestion
    ? (selectedAnswersByQuestion[currentQuestion.id] ?? null)
    : null;

  // const progressPercent =
  //   totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const isLastQuestion =
    totalQuestions > 0 && currentIndex === totalQuestions - 1;

  const handleSelectAnswer = (answerId: number) => {
    if (!currentQuestion) return;

    setAnswer(currentQuestion.id, answerId);

    if (isLastQuestion) {
      navigate(appRoutes.FINAL, { replace: true });
      return;
    }

    window.setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 120);
  };

  if (!currentQuestion) {
    return (
      <div className="Test">
        <img src={bg} alt="" className="Test__background bg" />
        <img src={bgDots} alt="" className="Test__background bgDots" />
      </div>
    );
  }

  return (
    <div className="Test">
      <img src={bg} alt="" className="Test__background bg" />
      <img src={bgDots} alt="" className="Test__background bgDots" />

      <div className="Test__content">
        <div className="Test__questionCard">
          <img
            src={toAbsoluteImageUrl(currentQuestion.picture)}
            alt={`Вопрос ${currentIndex + 1}`}
            className="Test__questionImage"
          />
        </div>

        <div className="Test__panel">
          <div className="Test__content_variants">
            <Variants
              items={currentQuestion.answers}
              selectedId={currentSelectedAnswerId}
              onSelect={handleSelectAnswer}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Test;
