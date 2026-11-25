/**
 * Cider 2.5+ (@ciderapp/pluginkit) Configuration Entry
 */
import { definePluginContext } from "@ciderapp/pluginkit";
import pluginContext from "./index.js";

export default definePluginContext({
  name: "Cider 3D IDE Lyric Visualizer",
  identifier: "sh.cider.ide-lyric-visualizer",
  description: "Transforms Cider's lyric visualizer into a 3D tilted IDE code stage with audio-reactive gravity waves and dynamic album-art syntax themes.",
  version: "2.3.0",
  author: "Mehdito-2005",
  repo: "https://github.com/Mehdito-2005/cider-ide-lyrics",
  setup(context) {
    return pluginContext.setup(context);
  }
});
