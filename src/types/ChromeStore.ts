import { WebAccessFocus } from './ModelSelector';
import { Nullable } from './Utils';

export type ChromeSessionStoreKey = keyof ChromeSessionStore;

export type ChromeStoreKey = keyof ChromeStore;

export type ChromeStore = {
  latestVersion: string;
  defaultFocus: Nullable<WebAccessFocus['code']>;
  defaultCollectionUUID?: Nullable<string>;
  defaultWebAccess: boolean;
  secretMode: boolean;
  popupSettings: {
    queryBoxSelectors: {
      focus: boolean;
      languageModel: boolean;
      imageGenModel: boolean;
      collection: boolean;
    };
    qolTweaks: {
      threadTOC: boolean;
      quickQueryCommander: boolean;
      threadMessageStickyToolbar: boolean;
      codeBlockEnhancedToolbar: boolean;
    };
    visualTweaks: {
      collapseEmptyThreadVisualColumns: boolean;
    };
  };
  customTheme: {
    slogan?: string;
    uiFont?: string;
    monoFont?: string;
    accentColor?: string;
    customCSS?: string;
  };
} & {
  [key: `sessionStore-${number}`]: ChromeSessionStore;
};

export type ChromeSessionStore = object;

type NestedKeys<T> = {
  [K in keyof T]: T[K] extends object ? keyof T[K] : never;
}[keyof T];

export type PopupSettingKeys = NestedKeys<ChromeStore['popupSettings']>;
