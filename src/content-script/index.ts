import "@/assets/index.tw.css";
import "@/assets/overrides.css";
import "@/assets/components.css";
import "@/assets/canvas.css";

import $ from "jquery";

import { webpageMessenger } from "@/content-script/main-world/webpage-messenger";
import WebpageMessageInterceptor from "@/content-script/main-world/WebpageMessageInterceptors";
import WebpageMessageListeners from "@/content-script/main-world/WebpageMessageListeners";
import ReactRoot from "@/content-script/ReactRoot";
import CplxUserSettings from "@/lib/CplxUserSettings";
import DomObserver from "@/utils/DomObserver/DomObserver";
import UiTweaks from "@/utils/UiTweaks";
import {
  getPplxBuildId,
  injectMainWorldScript,
  waitForNextjsHydration,
  whereAmI,
} from "@/utils/utils";
import UxTweaks from "@/utils/UxTweaks";
import packageData from "@@/package.json";

import htmlCanvas from "@/content-script/main-world/canvas/html?script&module";
import mermaidCanvas from "@/content-script/main-world/canvas/mermaid?script&module";
import preBlockAttrs from "@/content-script/main-world/pre-block-attrs?script&module";
import shiki from "@/content-script/main-world/shiki?script&module";

$(async function main() {
  initConsoleMessage();

  await initCplxUserSettings();

  initUiUxTweaks();

  await waitForNextjsHydration();

  await initMainWorldDeps();

  initTrafficInterceptors();

  ReactRoot();

  if (import.meta.env.DEV) {
    $(document).on("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "Q") {
        DomObserver.destroyAll();
        alert("All observers destroyed!");
      }
    });
  }
});

async function initCplxUserSettings() {
  await CplxUserSettings.init();
}

async function initUiUxTweaks() {
  UiTweaks.correctColorScheme();
  UiTweaks.injectCustomStyles();

  UxTweaks.restoreLogoContextMenu();

  const observe = async (url: string) => {
    const location = whereAmI(url);

    UiTweaks.applySelectableAttrs(location);
    UiTweaks.applySettingsAsHTMLAttrs(location);

    UxTweaks.dropFileWithinThread(location);
  };

  observe(window.location.href);

  webpageMessenger.onMessage(
    "routeChange",
    async ({ payload: { url, trigger } }) => {
      if (trigger !== "routeChangeComplete") return;
      observe(url);
    },
  );
}

async function initMainWorldDeps() {
  const settings = CplxUserSettings.get().popupSettings;

  await Promise.all([
    injectMainWorldScript({
      url: chrome.runtime.getURL(preBlockAttrs),
    }),
    injectMainWorldScript({
      url: chrome.runtime.getURL(shiki),
      inject: settings.qolTweaks.alternateMarkdownBlock,
    }),
    injectMainWorldScript({
      url: chrome.runtime.getURL(mermaidCanvas),
      inject:
        settings.qolTweaks.alternateMarkdownBlock &&
        settings.qolTweaks.canvas.enabled,
    }),
    injectMainWorldScript({
      url: chrome.runtime.getURL(htmlCanvas),
      inject:
        settings.qolTweaks.alternateMarkdownBlock &&
        settings.qolTweaks.canvas.enabled,
    }),
  ]);
}

function initTrafficInterceptors() {
  WebpageMessageListeners.onWebSocketCaptured();

  WebpageMessageInterceptor.updateQueryLimits();
  WebpageMessageInterceptor.alterQueries();
  WebpageMessageInterceptor.blockTelemetry();
  WebpageMessageInterceptor.removeComplexityIdentifier();
}

async function initConsoleMessage() {
  const pplxBuildId = await getPplxBuildId();

  console.log(
    "%cCOMPLEXITY v" +
      packageData.version +
      "%c\n\n" +
      "Suggest new features/report issues by joining the Discord community:\n" +
      "%chttps://discord.gg/fxzqdkwmWx%c\n\n" +
      "PPLX_BUILD_ID: " +
      pplxBuildId,
    "color: #72aefd; background-color: #191a1a; padding: 0.25rem 1rem; border-radius: 0.375rem; font-family: monospace; font-weight: bold; font-size: 16px; text-shadow: 1px 1px 0 #000;",
    "color: #ff9900; font-style: italic; font-size: 14px;",
    "font-size: 14px;",
    "font-weight: bold; font-size: 14px;",
  );
}