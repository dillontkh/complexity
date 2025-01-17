import $ from "jquery";
import type { MermaidConfig } from "mermaid";

import { webpageMessenger } from "@/content-script/main-world/webpage-messenger";
import { extensionOnly, mainWorldExec } from "@/utils/hof";
import UiUtils from "@/utils/UiUtils";
import { injectMainWorldScriptBlock, sleep } from "@/utils/utils";

class MermaidCanvas {
  private static instance: MermaidCanvas | null = null;
  private importPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance() {
    if (!MermaidCanvas.instance) {
      MermaidCanvas.instance = new MermaidCanvas();
    }
    return MermaidCanvas.instance;
  }

  initialize() {
    this.setupContentScriptRequestListeners();
    this.importMermaid();
  }

  private async importMermaid(): Promise<void> {
    if (window.mermaid && window.svgPanZoom) return;

    if (!this.importPromise) {
      const isDarkTheme = UiUtils.isDarkTheme();

      const background = getComputedStyle(
        document.documentElement,
      ).getPropertyValue("--accent");

      const uiFont =
        getComputedStyle(document.body).getPropertyValue("--ui-font") ||
        getComputedStyle(document.documentElement).getPropertyValue(
          "--ui-font",
        );

      const config: MermaidConfig = {
        startOnLoad: false,
        theme: isDarkTheme ? "dark" : "base",
        themeVariables: {
          edgeLabelBackground: background,
        },
        gitGraph: {
          useMaxWidth: true,
        },
        fontFamily: uiFont,
      };

      const scriptContent = `
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        import 'https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/dist/svg-pan-zoom.min.js';

        window.mermaid = mermaid;

        window.mermaid.initialize(${JSON.stringify(config)});
      `;

      this.importPromise = injectMainWorldScriptBlock({
        scriptContent,
        waitForExecution: true,
      }).catch((error) => {
        console.error("Failed to import Mermaid:", error);
        throw error;
      });
    }

    return this.importPromise;
  }

  private setupContentScriptRequestListeners() {
    webpageMessenger.onMessage(
      "isMermaidInitialized",
      async () => !!window.mermaid && !!window.svgPanZoom,
    );

    webpageMessenger.onMessage("mermaidCanvasAction", async (messageData) => {
      if (!window.mermaid || !window.svgPanZoom) {
        await this.importMermaid();
      }

      const { action } = messageData.payload;

      switch (action) {
        case "render":
          return await this.handleRenderRequest(messageData.payload.payload);
        case "resetZoomPan":
          $(messageData.payload.payload)
            .trigger("resetZoom")
            .trigger("resetPan");
          return true;
        default:
          console.warn("Unknown Mermaid canvas action:", action);
          break;
      }

      return false;
    });
  }

  private async handleRenderRequest(querySelector: string) {
    const $target = $(querySelector);

    if ($target.length === 0) {
      console.warn("No elements found for rendering Mermaid canvas");
      return false;
    }

    try {
      await this.importMermaid();

      await window.mermaid!.run({
        nodes: [$target[0]],
      });

      const $svg = $target.find("svg");

      $svg.addClass("!tw-size-full").css({
        "max-width": "100%",
      });

      const svgPanZoomInstance = window.svgPanZoom!($svg[0], {
        center: true,
        fit: true,
        contain: true,
        dblClickZoomEnabled: true,
      });

      $target.on("resetZoom", () => {
        svgPanZoomInstance.resetZoom();
      });

      $target.on("resetPan", () => {
        svgPanZoomInstance.resetPan();
      });

      return true;
    } catch (error) {
      console.error("Error rendering Mermaid canvas:", error);
      return false;
    }
  }
}

const waitForInitialization = () => {
  let initializationPromise: Promise<void>;

  return extensionOnly((): Promise<void> => {
    if (initializationPromise != null) return initializationPromise;

    const checkForInitialization = async (): Promise<void> => {
      const isInitialized = await webpageMessenger.sendMessage({
        event: "isMermaidInitialized",
        timeout: 1000,
      });

      if (!isInitialized) {
        await sleep(100);
        return checkForInitialization();
      }
    };

    initializationPromise = checkForInitialization();
    return initializationPromise;
  })();
};

mainWorldExec(() =>
  $(() => {
    MermaidCanvas.getInstance().initialize();
  }),
)();

export const mermaidContentScript = {
  waitForInitialization,
};
