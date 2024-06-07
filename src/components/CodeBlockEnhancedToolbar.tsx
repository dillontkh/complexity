import {
  Fragment,
  ReactNode,
} from 'react';
import ReactDOM from 'react-dom';

import $ from 'jquery';
import {
  Check,
  Copy,
  ListOrdered,
  Maximize2,
  Minimize2,
  Text,
  WrapText,
} from 'lucide-react';
import { useImmer } from 'use-immer';

import { ui } from '@/utils/ui';
import { whereAmI } from '@/utils/utils';

import useElementObserver from './hooks/useElementObserver';
import TooltipWrapper from './TooltipWrapper';

export default function CodeBlockEnhancedToolbar() {
  const [containers, setContainers] = useImmer<
    {
      element: Element;
      lang: string;
      lineCount: number;
    }[]
  >([]);

  const idleCopyButtonText = <Copy className="tw-w-4 tw-h-4" />;
  const [buttonTextStates, setButtonTextStates] = useImmer<ReactNode[]>([]);
  const [blockState, setBlockStates] = useImmer<
    {
      isCollapsed: boolean;
      isCopied: boolean;
      isWrapped: boolean;
      isShownLineNumbers: boolean;
    }[]
  >([]);

  useElementObserver({
    selector: () =>
      ui
        .getMessageBlocks()
        .map((el) => el.$answer.find('pre').toArray())
        .flat(),
    callback: ({ element }) => {
      if (whereAmI() !== 'thread') return null;

      const $parent = $(element).parent();

      const lang = $(element).find('.absolute').text();

      $parent.addClass(
        'tw-my-4 tw-relative tw-bg-[#1d1f21] tw-rounded-md tw-border tw-border-border'
      );

      $(element).addClass('!tw-m-0 tw-rounded-none tw-rounded-b-md');

      $(element).find('.absolute').hide();

      $(element)
        .find('div:nth-child(2)')[0]
        .style.setProperty('padding-top', '0', 'important');
      $(element)
        .find('div:nth-child(2)')
        .addClass('tw-rounded-none tw-rounded-b-md');
      $(element).find('code:first').addClass('!tw-pt-0');

      const $container = $('<div>')
        .addClass(
          'tw-sticky tw-top-[3.3rem] tw-bottom-[4rem] tw-w-full tw-z-[1] tw-rounded-t-md tw-overflow-hidden tw-mb-2'
        )
        .on('click', () => {
          $parent.find('button').trigger('click');
        });

      $parent.prepend($container);

      requestIdleCallback(() => {
        const code = $parent.find('code').html();

        const lineCount = code.split('\n').length;

        const wrappedCode = code
          .replace(/^(.*)$/gm, '<code>$1</code>')
          .replace(/<code><\/code>$/g, '');

        $parent.find('code').html(wrappedCode);

        setContainers((prev) => [
          ...prev,
          {
            element: $container[0],
            lang,
            lineCount,
          },
        ]);
      });

      setButtonTextStates((draft) => {
        draft.push(idleCopyButtonText);
      });

      setBlockStates((draft) => {
        draft.push({
          isCollapsed: false,
          isCopied: false,
          isWrapped: false,
          isShownLineNumbers: false,
        });
      });
    },
    observedIdentifier: 'code-block-sticky-copy-button',
  });

  return (
    <>
      {containers.map((container, index) => {
        return (
          <Fragment key={index}>
            {ReactDOM.createPortal(
              <div className="tw-border-b tw-border-border tw-p-2 tw-px-3 tw-flex tw-items-center tw-bg-[#1d1f21] tw-font-sans">
                <div className="tw-text-background dark:tw-text-foreground">
                  {container.lang || 'plain-text'} ({container.lineCount - 1}{' '}
                  lines)
                </div>
                <div className="tw-ml-auto tw-flex tw-gap-3">
                  <TooltipWrapper content="Toggle line numbers">
                    <div
                      className="tw-cursor-pointer tw-text-muted-foreground hover:tw-text-background dark:hover:tw-text-foreground tw-transition-all active:tw-scale-95"
                      onClick={() => {
                        const isShownLineNumbers =
                          blockState[index]?.isShownLineNumbers;
                        $(container.element)
                          .parent()
                          .find('code>code')
                          .toggleClass('line', !isShownLineNumbers);
                        setBlockStates((draft) => {
                          draft[index].isShownLineNumbers = !isShownLineNumbers;
                        });
                      }}
                    >
                      <ListOrdered className="tw-w-4 tw-h-4" />
                    </div>
                  </TooltipWrapper>
                  <TooltipWrapper
                    content={blockState[index]?.isWrapped ? 'Unwrap' : 'Wrap'}
                  >
                    <div
                      className="tw-cursor-pointer tw-text-muted-foreground hover:tw-text-background dark:hover:tw-text-foreground tw-transition-all active:tw-scale-95"
                      onClick={() => {
                        const isWrapped = blockState[index]?.isWrapped;
                        $(container.element)
                          .parent()
                          .find('pre code:first')
                          .toggleClass(
                            'tw-whitespace-pre-wrap tw-break-words',
                            !isWrapped
                          );
                        setBlockStates((draft) => {
                          draft[index].isWrapped = !isWrapped;
                        });
                      }}
                    >
                      {blockState[index]?.isWrapped ? (
                        <Text className="tw-w-4 tw-h-4" />
                      ) : (
                        <WrapText className="tw-w-4 tw-h-4" />
                      )}
                    </div>
                  </TooltipWrapper>
                  <TooltipWrapper
                    content={
                      blockState[index]?.isCollapsed ? 'Expand' : 'Collapse'
                    }
                  >
                    <div
                      className="tw-cursor-pointer tw-text-muted-foreground hover:tw-text-background dark:hover:tw-text-foreground tw-transition-all active:tw-scale-95"
                      onClick={() => {
                        const isCollapsed = blockState[index]?.isCollapsed;
                        $(container.element)
                          .parent()
                          .find('pre')
                          .toggleClass(
                            'tw-max-h-[300px] tw-overflow-auto',
                            !isCollapsed
                          );
                        setBlockStates((draft) => {
                          draft[index].isCollapsed = !isCollapsed;
                        });
                      }}
                    >
                      {blockState[index]?.isCollapsed ? (
                        <Maximize2 className="tw-w-4 tw-h-4" />
                      ) : (
                        <Minimize2 className="tw-w-4 tw-h-4" />
                      )}
                    </div>
                  </TooltipWrapper>
                  <div
                    className="tw-cursor-pointer tw-text-muted-foreground hover:tw-text-background dark:hover:tw-text-foreground tw-transition-all active:tw-scale-95"
                    onClick={() => {
                      setButtonTextStates((draft) => {
                        draft[index] = <Check className="tw-w-4 tw-h-4" />;
                      });
                      setTimeout(() => {
                        setButtonTextStates((draft) => {
                          draft[index] = idleCopyButtonText;
                        });
                      }, 2000);
                    }}
                  >
                    {buttonTextStates[index]}
                  </div>
                </div>
              </div>,
              container.element
            )}
          </Fragment>
        );
      })}
    </>
  );
}
