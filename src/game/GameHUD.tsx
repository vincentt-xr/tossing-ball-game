import { useEffect, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { ScreenSpaceUI, ScreenText } from "@vincentt-xr/sdk";

type Props = {
  score: number;
  tosses: number;
  combo: number;
  timeLeft: number;
  countdown: number | null;
  status: "ready" | "playing" | "paused" | "game-over";
  onStart: () => void;
  onPause: () => void;
};

const COUNTDOWN_FADE_MS = 800;

/** Fades from 0 to 1 over 800 ms each time `step` changes; React state only while fading. */
const useFadeIn = (step: number | null) => {
  const [opacity, setOpacity] = useState(1);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (step === null) return;
    startedAt.current = performance.now();
    setOpacity(0);
  }, [step]);

  useFrame(() => {
    if (startedAt.current === null) return;
    const progress = (performance.now() - startedAt.current) / COUNTDOWN_FADE_MS;
    if (progress >= 1) {
      startedAt.current = null;
      setOpacity(1);
      return;
    }
    setOpacity(1 - (1 - progress) ** 2);
  });

  return opacity;
};

/**
 * The prompts and countdown are `ScreenText`s with literal `text`, so the console's
 * visual editor can retype, recolour and move each one. Keep them written out: a
 * `text` built from a variable can only be changed in code. The live score, tosses,
 * timer and combo stay in the DOM overlay, since their numbers change every toss.
 */
export const GameHUD = ({
  score,
  tosses,
  combo,
  timeLeft,
  countdown,
  status,
  onStart,
  onPause,
}: Props) => {
  const countdownOpacity = useFadeIn(countdown);
  const waiting = (status === "ready" || status === "game-over") && countdown === null;

  return (
    <>
      <ScreenSpaceUI>
        <ScreenText
          name="Start prompt"
          text="SHOW ✌️ TO START"
          screenTransform={{ position: { x: 0, y: 390 }, size: { width: 640, height: 60 }, rotation: 0, renderOrder: 2000 }}
          textAlign="center"
          verticalAlign="center"
          fontFamily='"Arial Narrow", "Roboto Condensed", system-ui, sans-serif'
          fontWeight={900}
          fontSize={24}
          letterSpacing={0.12}
          color="rgba(238, 250, 255, 0.9)"
          shadowColor="rgba(125, 211, 252, 0.9)"
          shadowBlur={12}
          bgColor="transparent"
          visible={waiting && status === "ready"}
        />
        <ScreenText
          name="Reset prompt"
          text="SHOW ✌️ TO RESET"
          screenTransform={{ position: { x: 0, y: 390 }, size: { width: 640, height: 60 }, rotation: 0, renderOrder: 2000 }}
          textAlign="center"
          verticalAlign="center"
          fontFamily='"Arial Narrow", "Roboto Condensed", system-ui, sans-serif'
          fontWeight={900}
          fontSize={24}
          letterSpacing={0.12}
          color="rgba(238, 250, 255, 0.9)"
          shadowColor="rgba(125, 211, 252, 0.9)"
          shadowBlur={12}
          bgColor="transparent"
          visible={waiting && status === "game-over"}
        />
        <ScreenText
          name="Countdown 3"
          text="3"
          screenTransform={{ position: { x: 0, y: 102 }, size: { width: 480, height: 220 }, rotation: 0, renderOrder: 2001 }}
          textAlign="center"
          verticalAlign="center"
          fontFamily='"Arial Narrow", "Roboto Condensed", system-ui, sans-serif'
          fontWeight={900}
          fontSize={150}
          letterSpacing={0.02}
          color="#fef08a"
          shadowLayers={[
            { color: "#655d17", blur: 0, offsetY: 6 },
            { color: "#fef08a", blur: 28 },
          ]}
          bgColor="transparent"
          opacity={countdownOpacity}
          visible={countdown === 3}
        />
        <ScreenText
          name="Countdown 2"
          text="2"
          screenTransform={{ position: { x: 0, y: 102 }, size: { width: 480, height: 220 }, rotation: 0, renderOrder: 2001 }}
          textAlign="center"
          verticalAlign="center"
          fontFamily='"Arial Narrow", "Roboto Condensed", system-ui, sans-serif'
          fontWeight={900}
          fontSize={150}
          letterSpacing={0.02}
          color="#fef08a"
          shadowLayers={[
            { color: "#655d17", blur: 0, offsetY: 6 },
            { color: "#fef08a", blur: 28 },
          ]}
          bgColor="transparent"
          opacity={countdownOpacity}
          visible={countdown === 2}
        />
        <ScreenText
          name="Countdown 1"
          text="1"
          screenTransform={{ position: { x: 0, y: 102 }, size: { width: 480, height: 220 }, rotation: 0, renderOrder: 2001 }}
          textAlign="center"
          verticalAlign="center"
          fontFamily='"Arial Narrow", "Roboto Condensed", system-ui, sans-serif'
          fontWeight={900}
          fontSize={150}
          letterSpacing={0.02}
          color="#fef08a"
          shadowLayers={[
            { color: "#655d17", blur: 0, offsetY: 6 },
            { color: "#fef08a", blur: 28 },
          ]}
          bgColor="transparent"
          opacity={countdownOpacity}
          visible={countdown === 1}
        />
        <ScreenText
          name="Countdown go"
          text="GO!"
          screenTransform={{ position: { x: 0, y: 102 }, size: { width: 480, height: 220 }, rotation: 0, renderOrder: 2001 }}
          textAlign="center"
          verticalAlign="center"
          fontFamily='"Arial Narrow", "Roboto Condensed", system-ui, sans-serif'
          fontWeight={900}
          fontSize={150}
          letterSpacing={0.02}
          color="#fef08a"
          shadowLayers={[
            { color: "#655d17", blur: 0, offsetY: 6 },
            { color: "#fef08a", blur: 28 },
          ]}
          bgColor="transparent"
          opacity={countdownOpacity}
          visible={countdown === 0}
        />
      </ScreenSpaceUI>
      <Html fullscreen style={{ pointerEvents: "none" }}>
        <div className="arcade-hud" aria-live="polite">
          <div className="arcade-hud__corner arcade-hud__corner--score">
            <span className="arcade-hud__eyebrow">SCORE // LIVE</span>
            <strong key={score} className="arcade-hud__score">
              {score.toString().padStart(4, "0")}
            </strong>
            <span className="arcade-hud__sub">TOSSES {tosses.toString().padStart(2, "0")}</span>
          </div>
          <div className="arcade-hud__corner arcade-hud__corner--time">
            <span className="arcade-hud__eyebrow">SESSION</span>
            <strong
              className={
                timeLeft <= 10
                  ? "arcade-hud__timer arcade-hud__timer--urgent"
                  : "arcade-hud__timer"
              }
            >
              00:{timeLeft.toString().padStart(2, "0")}
            </strong>
          </div>
          {combo > 1 && (
            <div key={combo} className="arcade-hud__combo">
              COMBO <b>x{combo}</b>
            </div>
          )}

          <div className="arcade-hud__controls">
            {status === "playing" && (
              <button type="button" onClick={onPause}>
                PAUSE
              </button>
            )}
            {status === "paused" && (
              <button type="button" onClick={onStart}>
                RESUME
              </button>
            )}
          </div>
        </div>
      </Html>
    </>
  );
};
