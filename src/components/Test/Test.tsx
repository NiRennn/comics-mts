import "./Test.scss";
import bg from "../../assets/images/backgrounds/loader-back.jpg";
import bgDots from "../../assets/images/backgrounds/loader-dots.png";
import scrubSprite from "../../assets/images/transitions/scrub.png";
import Variants from "../Variants/Variants";
import {
  type AnimationEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAppStore } from "../../store/appStore";
import { useNavigate } from "react-router-dom";
import appRoutes from "../../routes/routes";

const API_ORIGIN = "https://work.brandservicebot.ru";
const PRELOAD_TIMEOUT_MS = 250;

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

type PendingTransition = {
  nextIndex: number | null;
  isLastQuestion: boolean;
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

  const rafRef = useRef<number | null>(null);
  const isMountedRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const pendingTransitionRef = useRef<PendingTransition | null>(null);
  const shouldShowVariantsAfterIndexChangeRef = useRef(false);

  const totalQuestions = questions.length;

  useEffect(() => {
    if (currentIndex > totalQuestions - 1) {
      setCurrentIndex(0);
    }
  }, [currentIndex, totalQuestions]);

  useEffect(() => {
    isMountedRef.current = true;

    rafRef.current = window.requestAnimationFrame(() => {
      setIsScreenVisible(true);

      rafRef.current = window.requestAnimationFrame(() => {
        setIsQuestionVisible(true);
        rafRef.current = null;
      });
    });

    return () => {
      isMountedRef.current = false;

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!shouldShowVariantsAfterIndexChangeRef.current) return;

    shouldShowVariantsAfterIndexChangeRef.current = false;

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = window.requestAnimationFrame(() => {
      if (!isMountedRef.current) return;

      setIsQuestionVisible(true);
      isTransitioningRef.current = false;
      rafRef.current = null;
    });
  }, [currentIndex]);

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
    if (!currentQuestion || isTransitioningRef.current) return;

    isTransitioningRef.current = true;

    setAnswer(currentQuestion.id, answerId);

    // Важно: сначала прячем старые варианты.
    // currentIndex пока НЕ меняем, поэтому fade-out идет со старым текстом.
    setIsQuestionVisible(false);

    const nextIndex = currentIndex + 1;
    const nextQuestion = !isLastQuestion ? questions[nextIndex] : null;

    const nextQuestionImages = [
      toAbsoluteImageUrl(nextQuestion?.picture),
      toAbsoluteImageUrl(nextQuestion?.picture_overlay),
    ].filter(Boolean);

    await Promise.race([
      Promise.all(nextQuestionImages.map(preloadSingleImage)).then(
        () => undefined,
      ),
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, PRELOAD_TIMEOUT_MS);
      }),
    ]);

    if (!isMountedRef.current) return;

    pendingTransitionRef.current = {
      nextIndex: isLastQuestion ? null : nextIndex,
      isLastQuestion,
    };

    // Scrub запускается после начала fade-out вариантов.
    setIsScrubActive(true);
  };

  const handleScrubAnimationEnd = (
    event: AnimationEvent<HTMLDivElement>,
  ) => {
    if (event.animationName !== "test-scrub") return;

    const pendingTransition = pendingTransitionRef.current;
    if (!pendingTransition) return;

    pendingTransitionRef.current = null;

    // На последнем вопросе уходим на финал только после окончания scrub.
    if (pendingTransition.isLastQuestion) {
      navigate(appRoutes.FINAL, { replace: true });
      return;
    }

    // Важно: картинку и варианты меняем только после полного окончания scrub.
    shouldShowVariantsAfterIndexChangeRef.current = true;
    setCurrentIndex(pendingTransition.nextIndex ?? 0);
    setIsScrubActive(false);
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
        <div className="Test__questionCard">
          <div
            className={`Test__scrub ${isScrubActive ? "is-active" : ""}`}
            style={{ backgroundImage: `url(${scrubSprite})` }}
            aria-hidden="true"
            onAnimationEnd={handleScrubAnimationEnd}
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

        <div className="Test__panel">
          <div
            className={`Test__content_variants ${
              isQuestionVisible ? "is-visible" : ""
            }`}
          >
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