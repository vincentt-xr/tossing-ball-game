// Scene.tsx — the agent's surface.
// Add SDK components and R3F primitives here.
// See GROUNDING.md for the API reference and pattern catalog.
//
// react/no-unknown-property is disabled for this file in .eslintrc.json, not by
// a directive here: R3F props (position, rotation, args) are unknown to the rule
// and every one of them errors, but this file is EMPTY of primitives until an
// agent adds some — so an in-file directive sits unused, and the lint script
// runs --report-unused-disable-directives, which makes the unused directive
// itself the error. Disabling at the config keeps the suppression true in both
// states.
/* eslint-disable react/no-unknown-property */
import { Suspense, useEffect, useMemo, useState } from "react";
import { GestureTracker } from "@vincentt-xr/sdk/tracking";

import { FallingImage } from "./game/FallingImage";
import { FaceHitter } from "./game/FaceHitter";
import { GameHUD } from "./game/GameHUD";
import { RuntimeDiagnostics } from "./game/RuntimeDiagnostics";
import { TossingPhysics } from "./game/physics";
import { GAME_CONFIG } from "./game/config";
import { playGameSound } from "./game/sound";
import { useGestureHold } from "./gesture";

export const Scene = () => {
  const [status, setStatus] = useState<"ready" | "playing" | "paused" | "game-over">("ready");
  const [score, setScore] = useState(0);
  const [tosses, setTosses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_CONFIG.sessionDuration);
  const [countdown, setCountdown] = useState<number | null>(null);
  const gravity = useMemo<[number, number, number]>(() => [0, -(Math.abs(GAME_CONFIG.gravity[1]) + Math.min(combo, GAME_CONFIG.maxLevel) * GAME_CONFIG.gravityPerLevel), 0], [combo]);

  const beginRun = () => {
    setScore(0);
    setTosses(0);
    setCombo(0);
    setTimeLeft(GAME_CONFIG.sessionDuration);
    setStatus("ready");
    setCountdown(3);
  };

  useGestureHold({
    gesture: "victory",
    holdMs: 450,
    enabled: countdown === null && (status === "ready" || status === "game-over"),
    onTrigger: beginRun,
  });

  useEffect(() => {
    if (countdown === null) return undefined;
    const timer = window.setTimeout(() => {
      if (countdown === 0) {
        setStatus("playing");
        setCountdown(null);
      } else {
        setCountdown((value) => (value ?? 1) - 1);
      }
    }, countdown === 0 ? 700 : 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (status !== "playing") return undefined;
    const timer = window.setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          setStatus("game-over");
          return 0;
        }
        return time - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  return (
    <RuntimeDiagnostics>
      <GestureTracker />
      <GameHUD score={score} tosses={tosses} combo={combo} timeLeft={timeLeft} status={status} countdown={countdown} onStart={() => setStatus("playing")} onPause={() => setStatus("paused")} />
      <Suspense fallback={null}>
        <TossingPhysics gravity={gravity} paused={status !== "playing"}>
          <FaceHitter active={status === "playing"} />
          <FallingImage
            active={status === "playing"}
            onSuccessfulToss={({ points }) => {
              playGameSound(points > 1 ? "combo" : "hit");
              setTosses((count) => count + 1);
              setCombo((value) => value + 1);
              setScore((value) => value + points * (combo + GAME_CONFIG.comboScoreMultiplier));
            }}
            onMiss={() => {
              setCombo(0);
              playGameSound("bounce");
            }}
          />
        </TossingPhysics>
      </Suspense>
    </RuntimeDiagnostics>
  );
};
