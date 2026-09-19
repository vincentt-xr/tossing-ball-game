/* eslint-disable react/no-unknown-property */
import { Html } from "@react-three/drei";
import { RigidBody, CuboidCollider, useRapier } from "@react-three/rapier";
import type { RapierRigidBody, RapierCollider } from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { FaceTracker, useFaceInfo } from "@vincentt-xr/sdk/tracking";

import { GAME_CONFIG } from "./config";

const FaceHitterBody = ({ active }: { active: boolean }) => {
  const face = useFaceInfo({ active, targetFps: GAME_CONFIG.faceTrackingFps });
  const { viewport } = useThree();
  const bodyRef = useRef<RapierRigidBody>(null);
  const colliderRef = useRef<RapierCollider>(null);
  const { rapier } = useRapier();

  useFrame(() => {
    const body = bodyRef.current;
    const collider = colliderRef.current;
    if (!body || !collider) return;

    if (!active || !face) {
      collider.setEnabled(false);
      return;
    }

    const { bounds } = face;
    const padding = GAME_CONFIG.faceBoxPadding;
    const width = (bounds.width + padding * 2) * viewport.width;
    const height = (bounds.height + padding * 2) * viewport.height;
    const x = (bounds.centerX - 0.5) * viewport.width;
    const y = (0.5 - bounds.centerY) * viewport.height;

    collider.setEnabled(true);
    collider.setHalfExtents(new rapier.Vector3(width / 2, height / 2, 0.08));
    body.setNextKinematicTranslation({ x, y, z: 0.05 });
  });

  const left = face ? Math.max(0, (face.bounds.minX - GAME_CONFIG.faceBoxPadding) * 100) : 0;
  const top = face ? Math.max(0, (face.bounds.minY - GAME_CONFIG.faceBoxPadding) * 100) : 0;
  const width = face ? Math.min(100 - left, (face.bounds.width + GAME_CONFIG.faceBoxPadding * 2) * 100) : 0;
  const height = face ? Math.min(100 - top, (face.bounds.height + GAME_CONFIG.faceBoxPadding * 2) * 100) : 0;

  return (
    <>
      <RigidBody ref={bodyRef} name="faceHitter" type="kinematicPosition" colliders={false}>
        <CuboidCollider ref={colliderRef} args={[0.2, 0.2, 0.08]} sensor={false} />
      </RigidBody>
      {face && active && (
        <Html fullscreen style={{ pointerEvents: "none" }}>
          <div className="face-bounding-box" style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%`, borderColor: GAME_CONFIG.faceBoxColor, borderWidth: GAME_CONFIG.faceBoxBorderWidth, opacity: GAME_CONFIG.faceBoxOpacity }} />
        </Html>
      )}
    </>
  );
};

export const FaceHitter = ({ active }: { active: boolean }) => (
  <FaceTracker active={active} targetFps={GAME_CONFIG.faceTrackingFps}>
    <FaceHitterBody active={active} />
  </FaceTracker>
);
