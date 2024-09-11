import { useToggle } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { LuCpu as Cpu } from "react-icons/lu";
import { PiGlobeX, PiMouseRightClickFill } from "react-icons/pi";

import {
  webAccessFocusIcons,
  type WebAccessFocus,
} from "@/content-script/components/QueryBox/";
import { webAccessFocus } from "@/content-script/components/QueryBox/consts";
import { useQueryBoxStore } from "@/content-script/session-store/query-box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/components/Select";
import Tooltip from "@/shared/components/Tooltip";
import { isReactNode } from "@/types/utils.types";
import { cn } from "@/utils/cn";
import UiUtils from "@/utils/UiUtils";

export default function FocusSelector() {
  const [open, toggleOpen] = useToggle(false);

  const { focus, setFocus, allowWebAccess, toggleWebAccess } = useQueryBoxStore(
    (state) => state.webAccess,
  );

  const [highlightedValue, setHighlightedValue] = useState<
    WebAccessFocus["code"] | null
  >();

  useEffect(() => {
    if (allowWebAccess && !focus) {
      setFocus("internet");
    }

    UiUtils.getActiveQueryBoxTextarea({}).trigger("focus");
  }, [allowWebAccess, focus, setFocus]);

  useEffect(() => {
    setHighlightedValue(focus);
  }, [open, focus]);

  return (
    <Select
      items={webAccessFocus.map((model) => model.code)}
      value={[(focus || "internet") as WebAccessFocus["code"]]}
      open={open}
      highlightedValue={highlightedValue}
      onHighlightChange={(details) =>
        setHighlightedValue(details.highlightedValue as WebAccessFocus["code"])
      }
      onValueChange={(details) => {
        setFocus(details.value[0] as WebAccessFocus["code"]);
        toggleWebAccess(true);
        toggleOpen();

        UiUtils.getActiveQueryBoxTextarea({}).trigger("focus");
      }}
      onPointerDownOutside={() => toggleOpen(false)}
    >
      <SelectTrigger
        variant="ghost"
        className={cn(
          "gap-1 tw-flex tw-h-full tw-min-h-8 !tw-w-fit tw-max-w-[150px] tw-select-none tw-items-center tw-justify-center !tw-px-2 !tw-py-0 tw-font-medium tw-transition-all tw-duration-300 tw-animate-in tw-fade-in active:!tw-scale-95 [&_span]:tw-max-w-[100px]",
          {
            "!tw-bg-accent": allowWebAccess,
          },
        )}
        onContextMenu={(e) => {
          e.preventDefault();
          toggleOpen();
        }}
        onClick={() => {
          toggleWebAccess();
        }}
      >
        <Tooltip
          content={
            <div className="tw-flex tw-items-center">
              Web access: {allowWebAccess ? "ON" : "OFF"}
              {allowWebAccess && focus && (
                <>
                  {" | "}Focus{" "}
                  <PiMouseRightClickFill className="tw-mb-0.5 tw-inline-block tw-align-middle" />
                  {": "}
                  {webAccessFocus.find((model) => model.code === focus)?.label}
                </>
              )}
            </div>
          }
          positioning={{
            gutter: 15,
          }}
        >
          <div
            className={cn({
              "tw-text-accent-foreground": allowWebAccess,
            })}
          >
            {allowWebAccess && focus ? (
              <div className="relative">{webAccessFocusIcons[focus]}</div>
            ) : (
              <PiGlobeX className="tw-text-[1rem]" />
            )}
          </div>
        </Tooltip>
      </SelectTrigger>
      <SelectContent className="tw-max-h-[500px] tw-min-w-[130px] tw-max-w-[200px] tw-items-center tw-font-sans">
        {webAccessFocus.map((item) => (
          <SelectItem key={item.code} item={item.code}>
            <div className="tw-flex tw-max-w-full tw-items-center tw-justify-around tw-gap-2">
              {isReactNode(webAccessFocusIcons[item.code]) ? (
                <div>{webAccessFocusIcons[item.code]}</div>
              ) : (
                <Cpu className="tw-size-4" />
              )}
              <span className="tw-truncate">{item.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
