import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';
type ModalTone = 'light' | 'dark';
type ModalLayout = 'center' | 'drawer' | 'fullscreen';
/**
 * How much of the dialog's furniture Modal supplies:
 *  full    — title row, padded scroll area, optional footer (the default)
 *  minimal — panel surface only, with a floating close button; content owns its padding
 *  none    — panel surface only; the content brings its own header AND close control
 */
type ModalChrome = 'full' | 'minimal' | 'none';

const SIZE: Record<ModalSize, string> = {
  sm: 'max-w-[420px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[760px]',
  xl: 'max-w-[1040px]',
};

const TONE: Record<ModalTone, string> = {
  light: 'bg-canvas text-ink border-ink/10',
  dark: 'bg-panel-900 text-canvas border-canvas/10',
};

const LAYOUT: Record<ModalLayout, string> = {
  center:
    'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] rounded-2xl border shadow-2xl cab-pop-in',
  drawer: 'right-0 inset-y-0 w-full h-full border-l shadow-2xl cab-slide-in',
  fullscreen: 'inset-0 w-full h-full cab-fade-in',
};

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Required even when hidden: it is what a screen reader announces on open.
   * Radix warns loudly if a dialog has no accessible name, and rightly so.
   */
  title: ReactNode;
  description?: ReactNode;
  /** Keep the title announced but off-screen — for lightboxes and drawers. */
  hideTitle?: boolean;
  size?: ModalSize;
  tone?: ModalTone;
  layout?: ModalLayout;
  chrome?: ModalChrome;
  /** Darkness of the scrim. Lightboxes want it near-opaque. */
  overlay?: 'default' | 'heavy';
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * The one modal in the product.
 *
 * Every overlay used to be a hand-rolled `fixed inset-0` div — fourteen of them
 * in apps/web alone, none with `role="dialog"`, none trapping focus, none
 * closing on Escape, none restoring focus to whatever opened them, and none
 * locking the background scroll. Radix Dialog supplies all of that; this
 * wrapper supplies the Cabmora skin so pages never touch the primitive.
 *
 * Only Dialog is wrapped for now. Dropdowns, tabs and popovers stay hand-rolled
 * until a screen actually needs the same treatment — one primitive adopted
 * properly beats six adopted halfway.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  hideTitle,
  size = 'md',
  tone = 'light',
  layout = 'center',
  chrome = 'full',
  overlay = 'default',
  footer,
  children,
}: ModalProps) {
  const sized = layout === 'fullscreen' ? '' : SIZE[size];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={`fixed inset-0 z-50 backdrop-blur-sm cab-fade-in ${
            overlay === 'heavy' ? 'bg-black/90' : 'bg-black/50'
          }`}
        />
        <Dialog.Content
          className={`fixed z-50 flex flex-col ${LAYOUT[layout]} ${sized} ${
            // chrome 'none' means the content owns its own surface — giving it
            // one here would paint a panel behind a lightbox.
            chrome === 'none' ? '' : `overflow-hidden ${TONE[tone]}`
          }`}
        >
          {chrome === 'full' ? (
            <>
              <div className="flex items-start justify-between gap-6 px-7 pt-6 pb-4 shrink-0">
                <div className={hideTitle ? 'sr-only' : ''}>
                  <Dialog.Title className="font-serif text-[20px] leading-tight">
                    {title}
                  </Dialog.Title>
                  {description && (
                    <Dialog.Description className="mt-1 text-[13px] opacity-60">
                      {description}
                    </Dialog.Description>
                  )}
                </div>
                <CloseButton />
              </div>

              <div className="overflow-y-auto px-7 pb-6 flex-1">{children}</div>

              {footer && (
                <div
                  className={`flex items-center justify-end gap-3 px-7 py-4 shrink-0 border-t ${
                    tone === 'dark' ? 'border-canvas/10' : 'border-ink/10'
                  }`}
                >
                  {footer}
                </div>
              )}
            </>
          ) : (
            <>
              <Dialog.Title className="sr-only">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="sr-only">{description}</Dialog.Description>
              )}
              {chrome === 'minimal' && (
                <div className="absolute top-4 right-4 z-10">
                  <CloseButton />
                </div>
              )}
              {children}
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CloseButton() {
  return (
    <Dialog.Close
      aria-label="Close"
      className="shrink-0 rounded-lg p-1.5 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <X size={20} />
    </Dialog.Close>
  );
}

/** Opt-in trigger, for the common case where the opener sits beside the modal. */
export const ModalTrigger = Dialog.Trigger;
