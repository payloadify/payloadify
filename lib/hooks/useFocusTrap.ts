import { RefObject, useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Traps Tab focus inside `containerRef` while `active`, closes on Escape, and restores focus to
 *  whatever was focused before activation on deactivate/unmount — the accessibility contract a
 *  modal dialog needs, without pulling in a focus-trap dependency. */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active: boolean, onClose: () => void) {
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const focusables = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusables[0] ?? container).focus();

    function handleEscape(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onCloseRef.current();
    }

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab" || !container) return;

      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    // Escape is bound on `document` (not the container) so it still closes the dialog even if
    // focus has moved outside it — Tab-trapping stays container-scoped since it only makes sense
    // relative to focus already inside.
    document.addEventListener("keydown", handleEscape);
    container.addEventListener("keydown", handleTab);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      container.removeEventListener("keydown", handleTab);
      previouslyFocused.current?.focus();
    };
  }, [active, containerRef]);
}
