import { Composition } from "remotion";
import { SaberHacer } from "./SaberHacer";
import { EscanerPotencial } from "./EscanerPotencial";
import { QuizReto } from "./QuizReto";
import { DURATION, FPS } from "./tokens";

export const Root = () => (
  <>
    <Composition id="SaberHacer" component={SaberHacer} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
    <Composition id="SaberHacerFeed" component={SaberHacer} durationInFrames={DURATION} fps={FPS} width={1080} height={1350} />
    <Composition id="EscanerPotencial" component={EscanerPotencial} durationInFrames={DURATION} fps={FPS} width={1080} height={1350} />
    <Composition id="EscanerPotencialStory" component={EscanerPotencial} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
    <Composition id="QuizReto" component={QuizReto} durationInFrames={DURATION} fps={FPS} width={1080} height={1350} />
    <Composition id="QuizRetoStory" component={QuizReto} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
  </>
);
