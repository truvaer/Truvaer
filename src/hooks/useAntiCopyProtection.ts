import { useEffect } from 'react';

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toUpperCase();
  if (tag === 'TEXTAREA') {
    return !(target as HTMLTextAreaElement).readOnly && !(target as HTMLTextAreaElement).disabled;
  }
  if (tag === 'INPUT') {
    const input = target as HTMLInputElement;
    if (input.readOnly || input.disabled) return false;
    const nonTextTypes = new Set([
      'button',
      'checkbox',
      'color',
      'file',
      'hidden',
      'image',
      'radio',
      'range',
      'reset',
      'submit',
    ]);
    return !nonTextTypes.has((input.type || 'text').toLowerCase());
  }
  return target.isContentEditable;
}

/**
 * Enforces strict site-wide View-Only / Anti-Copy protection.
 * Prevents copying, cutting, text selection, right-click context menu,
 * drag-extracting, printing, and clipboard API writes across the application.
 */
export function useAntiCopyProtection(onBlockedAttempt?: (message: string) => void) {
  useEffect(() => {
    const notify = (msg: string) => {
      if (onBlockedAttempt) onBlockedAttempt(msg);
    };

    const clearSelection = () => {
      try {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          sel.removeAllRanges();
        }
      } catch {
        // ignore selection clearing errors
      }
    };

    const handleCopyOrCut = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
      try {
        e.clipboardData?.clearData();
        e.clipboardData?.setData('text/plain', '');
      } catch {
        // ignore clipboardData restriction
      }
      clearSelection();
      notify('View-only mode: Copying data from this website is restricted.');
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      notify('View-only mode: Context menu and copy options are disabled.');
    };

    const handleSelectStart = (e: Event) => {
      if (isEditableElement(e.target)) return;
      e.preventDefault();
      clearSelection();
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = (e.key || '').toLowerCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      // Block F12 DevTools
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        notify('View-only mode: Inspection shortcuts are disabled.');
        return;
      }

      if (!ctrlOrMeta) return;

      // Block DevTools inspection shortcuts (Ctrl/Cmd + Shift + I / J / C)
      if (e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) {
        e.preventDefault();
        e.stopPropagation();
        notify('View-only mode: Inspection shortcuts are disabled.');
        return;
      }

      // Block Copy (Ctrl/Cmd + C) and Cut (Ctrl/Cmd + X) everywhere
      if (key === 'c' || key === 'x') {
        e.preventDefault();
        e.stopPropagation();
        clearSelection();
        notify('View-only mode: Copying content is restricted.');
        return;
      }

      // Block Select All (Ctrl/Cmd + A) outside active editable form fields
      if (key === 'a' && !isEditableElement(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        clearSelection();
        notify('View-only mode: Selecting page content is disabled.');
        return;
      }

      // Block Save (Ctrl/Cmd + S), Print (Ctrl/Cmd + P), and View Source (Ctrl/Cmd + U)
      if (key === 's' || key === 'p' || key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        notify('View-only mode: Saving, printing, and exporting page content are disabled.');
      }
    };

    const handleBeforePrint = (e: Event) => {
      e.preventDefault();
      clearSelection();
      notify('View-only mode: Printing page content is disabled.');
    };

    // Guard programmatic Clipboard API writes (e.g., navigator.clipboard.writeText)
    const createBlockedError = () => {
      const err = new Error('View-only mode: Clipboard copy is disabled.');
      err.name = 'AntiCopyRestrictedError';
      return err;
    };

    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      if (e.reason && (e.reason as Error).name === 'AntiCopyRestrictedError') {
        e.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    let restoreClipboard: (() => void) | null = null;
    try {
      const clip = navigator.clipboard;
      if (clip && typeof clip.writeText === 'function') {
        const origWriteText = clip.writeText.bind(clip);
        const origWrite = typeof clip.write === 'function' ? clip.write.bind(clip) : undefined;
        try {
          Object.defineProperty(clip, 'writeText', {
            configurable: true,
            value: async () => {
              notify('View-only mode: Copying data to clipboard is disabled.');
              return Promise.reject(createBlockedError());
            },
          });
          if (origWrite) {
            Object.defineProperty(clip, 'write', {
              configurable: true,
              value: async () => {
                notify('View-only mode: Copying data to clipboard is disabled.');
                return Promise.reject(createBlockedError());
              },
            });
          }
          restoreClipboard = () => {
            try {
              Object.defineProperty(clip, 'writeText', { configurable: true, value: origWriteText });
              if (origWrite) {
                Object.defineProperty(clip, 'write', { configurable: true, value: origWrite });
              }
            } catch {
              // ignore restore failure
            }
          };
        } catch {
          // Some browsers lock navigator.clipboard properties
        }
      }
    } catch {
      // ignore if navigator.clipboard is unavailable
    }

    // Guard legacy document.execCommand('copy' | 'cut')
    const origExecCommand = typeof document.execCommand === 'function' ? document.execCommand.bind(document) : null;
    let restoreExecCommand: (() => void) | null = null;
    if (origExecCommand) {
      try {
        document.execCommand = ((commandId: string, showUI?: boolean, value?: string) => {
          const cmd = (commandId || '').toLowerCase();
          if (cmd === 'copy' || cmd === 'cut') {
            notify('View-only mode: Copying content is disabled.');
            return false;
          }
          return origExecCommand(commandId, showUI, value);
        }) as typeof document.execCommand;
        restoreExecCommand = () => {
          document.execCommand = origExecCommand;
        };
      } catch {
        // ignore if execCommand is read-only
      }
    }

    document.addEventListener('copy', handleCopyOrCut, true);
    document.addEventListener('cut', handleCopyOrCut, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('selectstart', handleSelectStart, true);
    document.addEventListener('dragstart', handleDragStart, true);
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('beforeprint', handleBeforePrint, true);

    return () => {
      document.removeEventListener('copy', handleCopyOrCut, true);
      document.removeEventListener('cut', handleCopyOrCut, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('beforeprint', handleBeforePrint, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      restoreClipboard?.();
      restoreExecCommand?.();
    };
  }, [onBlockedAttempt]);
}
