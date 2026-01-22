import React, { useEffect, useState } from "react";

interface FadeDismissQuizProps {
  children: (triggerFade: () => void) => React.ReactNode;
  onFadeOut: () => void;
  duration?: number; // ms
}

export const FadeDismissQuiz: React.FC<FadeDismissQuizProps> = ({ children, onFadeOut, duration = 600 }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (fading) {
      const timer = setTimeout(() => {
        onFadeOut();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [fading, duration, onFadeOut]);

  return (
    <div
      className={`transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}
      onAnimationEnd={() => fading && onFadeOut()}
    >
      {children(() => setFading(true))}
    </div>
  );
};
