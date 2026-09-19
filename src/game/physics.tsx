/* eslint-disable react/no-unknown-property */
import { Physics, CuboidCollider } from "@react-three/rapier";
import { useRapier } from "@react-three/rapier";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { GAME_CONFIG } from "./config";

const PhysicsReady = () => {
  const { rapier } = useRapier();

  useEffect(() => {
    console.info("[tossing-ball] Rapier world ready", {
      version: rapier?.version?.()?.toString?.() ?? "unknown",
      gravity: GAME_CONFIG.gravity,
    });
  }, [rapier]);

  return null;
};

export const TossingPhysics = ({ children, gravity = GAME_CONFIG.gravity, paused = false }: { children: ReactNode; gravity?: [number, number, number]; paused?: boolean }) => (
  <Physics gravity={gravity} paused={paused} updatePriority={0}>
    <PhysicsReady />
    {children}
    <mesh position={[0, GAME_CONFIG.floorY, 0]}>
      <boxGeometry args={[GAME_CONFIG.wallX * 2, GAME_CONFIG.boundaryThickness, 0.03]} />
      <meshBasicMaterial
        color={GAME_CONFIG.boundaryColor}
        transparent
        opacity={GAME_CONFIG.boundaryOpacity}
      />
    </mesh>
    <mesh position={[0, GAME_CONFIG.ceilingY, 0]}>
      <boxGeometry args={[GAME_CONFIG.wallX * 2, GAME_CONFIG.boundaryThickness, 0.03]} />
      <meshBasicMaterial
        color={GAME_CONFIG.boundaryColor}
        transparent
        opacity={GAME_CONFIG.boundaryOpacity}
      />
    </mesh>
    <mesh position={[-GAME_CONFIG.wallX, GAME_CONFIG.wallCenterY, 0]}>
      <boxGeometry args={[GAME_CONFIG.boundaryThickness, GAME_CONFIG.wallHeight, 0.03]} />
      <meshBasicMaterial
        color={GAME_CONFIG.boundaryColor}
        transparent
        opacity={GAME_CONFIG.boundaryOpacity}
      />
    </mesh>
    <mesh position={[GAME_CONFIG.wallX, GAME_CONFIG.wallCenterY, 0]}>
      <boxGeometry args={[GAME_CONFIG.boundaryThickness, GAME_CONFIG.wallHeight, 0.03]} />
      <meshBasicMaterial
        color={GAME_CONFIG.boundaryColor}
        transparent
        opacity={GAME_CONFIG.boundaryOpacity}
      />
    </mesh>
    <CuboidCollider
      args={[GAME_CONFIG.wallX, GAME_CONFIG.boundaryThickness / 2, 0.1]}
      position={[0, GAME_CONFIG.floorY, 0]}
      restitution={GAME_CONFIG.bounce}
      friction={GAME_CONFIG.friction}
    />
    <CuboidCollider
      args={[GAME_CONFIG.wallX, GAME_CONFIG.boundaryThickness / 2, 0.1]}
      position={[0, GAME_CONFIG.ceilingY, 0]}
      restitution={GAME_CONFIG.bounce}
      friction={GAME_CONFIG.friction}
    />
    <CuboidCollider
      args={[GAME_CONFIG.boundaryThickness / 2, GAME_CONFIG.wallHeight / 2, 0.1]}
      position={[-GAME_CONFIG.wallX, GAME_CONFIG.wallCenterY, 0]}
      restitution={GAME_CONFIG.bounce}
      friction={GAME_CONFIG.friction}
    />
    <CuboidCollider
      args={[GAME_CONFIG.boundaryThickness / 2, GAME_CONFIG.wallHeight / 2, 0.1]}
      position={[GAME_CONFIG.wallX, GAME_CONFIG.wallCenterY, 0]}
      restitution={GAME_CONFIG.bounce}
      friction={GAME_CONFIG.friction}
    />
  </Physics>
);
