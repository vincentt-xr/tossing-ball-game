import { Suspense, useEffect } from "react";

import { FallingImage } from "./FallingImage";
import { TossingPhysics } from "./physics";
import { RuntimeDiagnostics } from "./RuntimeDiagnostics";

export const TossingGame = () => {
  useEffect(() => {
    console.info("[tossing-ball] TossingGame mounted");
    return () => console.info("[tossing-ball] TossingGame unmounted");
  }, []);

  return (
    <RuntimeDiagnostics>
      <Suspense fallback={null}>
        <TossingPhysics>
          <FallingImage />
        </TossingPhysics>
      </Suspense>
    </RuntimeDiagnostics>
  );
};
