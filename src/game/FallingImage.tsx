import { RigidBody, CuboidCollider } from "@react-three/rapier";
import type { CollisionEnterPayload, RapierRigidBody } from "@react-three/rapier";
import { useTexture } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useRef, useState } from "react";
import { useEffect } from "react";

import { DEFAULT_IMAGE_URL, GAME_CONFIG } from "./config";

type TossResult = { points: number; hitOffset: number; hitPoint: [number, number, number] };

export const FallingImage = ({
  active = true,
  onSuccessfulToss,
  onMiss,
}: {
  active?: boolean;
  onSuccessfulToss?: (result: TossResult) => void;
  onMiss?: () => void;
}) => {
  const bodyRef = useRef<RapierRigidBody>(null);
  const texture = useTexture(DEFAULT_IMAGE_URL);
  const [impact, setImpact] = useState<[number, number, number] | null>(null);
  const lastFaceHitAt = useRef(0);

  useEffect(() => {
    console.info("[tossing-ball] falling image mounted", {
      start: GAME_CONFIG.imageStart,
      imageUrl: DEFAULT_IMAGE_URL,
    });
    return () => console.info("[tossing-ball] falling image unmounted");
  }, []);

  useEffect(() => {
    if (!impact) return undefined;
    const timeout = window.setTimeout(() => setImpact(null), GAME_CONFIG.impactDurationMs);
    return () => window.clearTimeout(timeout);
  }, [impact]);

  const toss = (hitX: number, source: "mouse" | "face" = "mouse") => {
    const body = bodyRef.current;
    if (!body) {
      console.warn("[tossing-ball] toss ignored: rigid body is not ready");
      return;
    }
    if (!active) return;
    if (source === "face") {
      const now = performance.now();
      if (now - lastFaceHitAt.current < GAME_CONFIG.faceHitCooldownMs) return;
      lastFaceHitAt.current = now;
    }

    const velocity = body.linvel();
    const centerX = body.translation().x;
    const halfWidth = GAME_CONFIG.imageSize / 2;
    const hitOffset = Math.max(-1, Math.min(1, (hitX - centerX) / halfWidth));
    const horizontalImpulse = hitOffset * GAME_CONFIG.hitHorizontalImpulse;

    console.info("[tossing-ball] toss", {
      velocityBefore: velocity,
      hitOffset,
      horizontalImpulse,
    });

    const impulseScale = source === "face" ? GAME_CONFIG.faceHitImpulseScale : 1;
    const torqueScale = source === "face" ? GAME_CONFIG.faceHitTorqueScale : 1;
    body.applyImpulse(
      { x: horizontalImpulse * impulseScale, y: GAME_CONFIG.tossImpulse * impulseScale, z: 0 },
      true,
    );
    body.applyTorqueImpulse(
      { x: 0, y: 0, z: hitOffset * GAME_CONFIG.hitTorqueImpulse * torqueScale },
      true,
    );
    body.setLinvel(
      {
        x: Math.max(
          -GAME_CONFIG.maxHorizontalVelocity,
          Math.min(
            velocity.x + horizontalImpulse * impulseScale,
            GAME_CONFIG.maxHorizontalVelocity,
          ),
        ),
        y: Math.min(
          velocity.y + GAME_CONFIG.tossImpulse * impulseScale,
          GAME_CONFIG.maxUpwardVelocity,
        ),
        z: 0,
      },
      true,
    );

    const angularVelocity = body.angvel();
    body.setAngvel(
      {
        x: angularVelocity.x,
        y: angularVelocity.y,
        z: Math.max(
          -GAME_CONFIG.maxAngularVelocity,
          Math.min(
            angularVelocity.z + hitOffset * GAME_CONFIG.hitTorqueImpulse * torqueScale,
            GAME_CONFIG.maxAngularVelocity,
          ),
        ),
      },
      true,
    );
    const points = Math.abs(hitOffset) <= GAME_CONFIG.targetRadius
      ? GAME_CONFIG.targetBonus
      : GAME_CONFIG.basePoints;
    setImpact([hitOffset * halfWidth, 0, 0.04]);
    onSuccessfulToss?.({ points, hitOffset, hitPoint: [hitX, body.translation().y, 0.04] });
  };

  const handleCollision = (payload: CollisionEnterPayload) => {
    if (payload.other.rigidBodyObject?.name !== "faceHitter") return;
    const body = bodyRef.current;
    if (body) toss(body.translation().x, "face");
  };

  useFrame(() => {
    const body = bodyRef.current;
    if (body && body.translation().y < GAME_CONFIG.resetY) {
      body.setTranslation(
        { x: GAME_CONFIG.imageStart[0], y: GAME_CONFIG.imageStart[1], z: 0 },
        true,
      );
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      if (active) onMiss?.();
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={GAME_CONFIG.imageStart}
      colliders={false}
      restitution={GAME_CONFIG.bounce}
      friction={GAME_CONFIG.friction}
      linearDamping={GAME_CONFIG.linearDamping}
      angularDamping={GAME_CONFIG.angularDamping}
      enabledTranslations={[true, true, false]}
      enabledRotations={[false, false, true]}
      onCollisionEnter={handleCollision}
    >
      <CuboidCollider
        args={[GAME_CONFIG.imageSize / 2, GAME_CONFIG.imageSize / 2, 0.05]}
      />
      <mesh
        scale={[GAME_CONFIG.imageSize, GAME_CONFIG.imageSize, 1]}
        onPointerDown={(event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          toss(event.point.x);
        }}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>
      {impact && (
        <mesh position={impact} rotation={[0, 0, 0]}>
          <ringGeometry args={[GAME_CONFIG.targetRadius * 0.38, GAME_CONFIG.targetRadius * 0.5, 32]} />
          <meshBasicMaterial color={GAME_CONFIG.impactColor} transparent opacity={GAME_CONFIG.impactOpacity} />
        </mesh>
      )}
    </RigidBody>
  );
};
