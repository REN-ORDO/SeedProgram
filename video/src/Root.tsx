import { Composition } from "remotion";
import { SaberHacer } from "./SaberHacer";
import { DURATION, FPS } from "./tokens";

export const Root = () => (
  <>
    <Composition id="SaberHacer" component={SaberHacer} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
    <Composition id="SaberHacerFeed" component={SaberHacer} durationInFrames={DURATION} fps={FPS} width={1080} height={1350} />
  </>
);
