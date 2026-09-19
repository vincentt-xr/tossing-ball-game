import { Html } from "@react-three/drei";

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

export const GameHUD = ({
  score,
  tosses,
  combo,
  timeLeft,
  countdown,
  status,
  onStart,
  onPause,
}: Props) => (
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

      {countdown !== null && (
        <div className="arcade-hud__countdown" aria-live="assertive">
          {countdown === 0 ? "GO!" : countdown}
        </div>
      )}

      {(status === "ready" || status === "game-over") && countdown === null && (
        <div className="arcade-hud__instruction">
          SHOW ✌️ TO {status === "game-over" ? "RESET" : "START"}
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
);
