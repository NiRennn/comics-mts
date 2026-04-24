import "./Test.scss";
import bg from "../../assets/images/backgrounds/loader-back.jpg";
import bgDots from "../../assets/images/backgrounds/loader-dots.png";
import scrubSprite from "../../assets/images/transitions/scrub.png";
import Variants from "../Variants/Variants";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "../../store/appStore";
import { useNavigate } from "react-router-dom";
import appRoutes from "../../routes/routes";

const API_ORIGIN = "https://work.brandservicebot.ru";
const SCRUB_DURATION_MS = 800;
const SCRUB_SWAP_MS = 420;

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

function Test() {
  const navigate = useNavigate();

  const questions = useAppStore((state) => state.questions);
  const selectedAnswersByQuestion = useAppStore(
    (state) => state.selectedAnswersByQuestion,
  );
  const setAnswer = useAppStore((state) => state.setAnswer);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrubActive, setIsScrubActive] = useState(false);
  const [isScreenVisible, setIsScreenVisible] = useState(false);
  const [isQuestionVisible, setIsQuestionVisible] = useState(false);

  const timersRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);

  const totalQuestions = questions.length;

  useEffect(() => {
    if (currentIndex > totalQuestions - 1) {
      setCurrentIndex(0);
    }
  }, [currentIndex, totalQuestions]);

  useEffect(() => {
    rafRef.current = window.requestAnimationFrame(() => {
      setIsScreenVisible(true);

      rafRef.current = window.requestAnimationFrame(() => {
        setIsQuestionVisible(true);
      });
    });

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const currentQuestion = useMemo(
    () => questions[currentIndex] ?? null,
    [questions, currentIndex],
  );

  const currentSelectedAnswerId = currentQuestion
    ? (selectedAnswersByQuestion[currentQuestion.id] ?? null)
    : null;

  const isLastQuestion =
    totalQuestions > 0 && currentIndex === totalQuestions - 1;

  const handleSelectAnswer = async (answerId: number) => {
    if (!currentQuestion || isScrubActive) return;

    setAnswer(currentQuestion.id, answerId);

    const nextQuestion = !isLastQuestion ? questions[currentIndex + 1] : null;
    const nextQuestionImage = toAbsoluteImageUrl(nextQuestion?.picture);

    await Promise.race([
      preloadSingleImage(nextQuestionImage),
      new Promise((resolve) => window.setTimeout(resolve, 250)),
    ]);

    setIsScrubActive(true);

    const swapTimer = window.setTimeout(() => {
      if (isLastQuestion) {
        navigate(appRoutes.FINAL, { replace: true });
        return;
      }

      setIsQuestionVisible(false);
      setCurrentIndex((prev) => prev + 1);
    }, SCRUB_SWAP_MS);

    const finishTimer = window.setTimeout(() => {
      setIsScrubActive(false);

      if (!isLastQuestion) {
        rafRef.current = window.requestAnimationFrame(() => {
          setIsQuestionVisible(true);
        });
      }
    }, SCRUB_DURATION_MS);

    timersRef.current.push(swapTimer, finishTimer);
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
    <div
      className={`Test ${isScreenVisible ? "is-visible" : ""} ${
        isScrubActive ? "is-locked" : ""
      }`}
    >
      <div className="Test__veil" />
 
      <img src={bg} alt="" className="Test__background bg Test__fade bgLayer" />
      <img
        src={bgDots}
        alt=""
        className="Test__background bgDots Test__fade dotsLayer"
      />

      <div className="Test__content Test__fade contentLayer">
        <div
          className={`Test__questionCard ${
            isQuestionVisible ? "is-visible" : ""
          }`}
        >
          <div
            className={`Test__scrub ${isScrubActive ? "is-active" : ""}`}
            style={{ backgroundImage: `url(${scrubSprite})` }}
            aria-hidden="true"
          />
          <img
            src={toAbsoluteImageUrl(currentQuestion.picture)}
            alt={`Вопрос ${currentIndex + 1}`}
            className="Test__questionImage"
          />
          <div className="Test__questionTest_wrapper">
            <img
              src={toAbsoluteImageUrl(currentQuestion.picture_overlay)}
              alt={`Вопрос ${currentIndex + 1}`}
              className="Test__questionTest"
            />
          </div>
        </div>

        <div className={`Test__panel ${isQuestionVisible ? "is-visible" : ""}`}>
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
