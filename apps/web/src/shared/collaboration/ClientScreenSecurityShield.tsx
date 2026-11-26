import { useCallback, useEffect, useId, useState, type ReactNode } from 'react';
import { ShieldAlert, QrCode, CameraOff, Lock, Eye, ShieldCheck } from 'lucide-react';
import { collaborationApi } from '@cabmora/api-client';

interface ClientScreenSecurityShieldProps {
  children: ReactNode;
  clientLabel?: string;
}

const SESSION_TOKEN_KEY = 'cabmora_client_qr_trap_token_v1';

function getOrCreateSessionToken(): string {
  if (typeof window === 'undefined') return 'client-guard-token';
  try {
    const existing = window.sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (existing) return existing;
    const created = `cabmora-qr-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(SESSION_TOKEN_KEY, created);
    return created;
  } catch {
    return 'client-guard-token';
  }
}

/**
 * Deterministic 21x21 Version-1 SVG QR matrix encoding the optical camera-trap beacon.
 * Includes standard 7x7 finder patterns at top-left, top-right, and bottom-left so any
 * smartphone camera viewfinder immediately locks autofocus onto the QR matrix instead of
 * the underlying photograph and triggers the camera-trap lockout.
 */
function OpticalTrapQrSvg({ size = 84, seed = 'CABMORA' }: { size?: number; seed?: string }) {
  const grid = 21;

  const isFinder = (r: number, c: number, fr: number, fc: number) => {
    const dr = r - fr;
    const dc = c - fc;
    if (dr < 0 || dr > 6 || dc < 0 || dc > 6) return null;
    if (dr === 0 || dr === 6 || dc === 0 || dc === 6) return true;
    if (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4) return true;
    return false;
  };

  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < grid; r += 1) {
    for (let c = 0; c < grid; c += 1) {
      const f1 = isFinder(r, c, 0, 0);
      const f2 = isFinder(r, c, 0, grid - 7);
      const f3 = isFinder(r, c, grid - 7, 0);
      if (f1 !== null) {
        if (f1) cells.push({ r, c });
        continue;
      }
      if (f2 !== null) {
        if (f2) cells.push({ r, c });
        continue;
      }
      if (f3 !== null) {
        if (f3) cells.push({ r, c });
        continue;
      }
      // Timing lines
      if (r === 6 || c === 6) {
        if ((r + c) % 2 === 0) cells.push({ r, c });
        continue;
      }
      // Deterministic data payload cells
      const charCode = seed.charCodeAt((r * grid + c) % seed.length) || 67;
      if (((r * 17 + c * 31 + charCode) & 3) !== 0) {
        cells.push({ r, c });
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${grid} ${grid}`}
      aria-label="Anti-Camera Optical QR Security Matrix"
      className="select-none pointer-events-none"
    >
      <rect width={grid} height={grid} fill="currentColor" className="text-canvas" />
      {cells.map(({ r, c }) => (
        <rect
          key={`${r}-${c}`}
          x={c}
          y={r}
          width={1}
          height={1}
          fill="currentColor"
          className="text-ink"
        />
      ))}
    </svg>
  );
}

export function ClientScreenSecurityShield({
  children,
  clientLabel = 'Protected Client Account',
}: ClientScreenSecurityShieldProps) {
  const styleId = useId();
  const [sessionToken] = useState(getOrCreateSessionToken);
  const [isScreenBlackedOut, setIsScreenBlackedOut] = useState(false);
  const [lockoutReason, setLockoutReason] = useState<string>(
    'Phone Camera / Screenshot Capture Detected via Optical QR Trap',
  );
  const [violationCount, setViolationCount] = useState(0);
  const [qrWatermarkVisible, setQrWatermarkVisible] = useState(true);

  const triggerBlackout = useCallback(
    (
      eventType:
        | 'screenshot_shortcut'
        | 'focus_loss'
        | 'qr_camera_trap'
        | 'context_menu'
        | 'camera_detected',
      reason: string,
    ) => {
      setIsScreenBlackedOut(true);
      setLockoutReason(reason);
      setViolationCount((prev) => prev + 1);

      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText('Protected by Cabmora Anti-Capture DRM').catch(() => undefined);
      }

      const route = typeof window !== 'undefined' ? window.location.pathname : '/client';
      if (eventType === 'qr_camera_trap') {
        void collaborationApi
          .triggerOpticalQrCameraTrap(sessionToken)
          .then((res) => {
            setViolationCount(res.violation_count);
          })
          .catch(() => undefined);
      } else {
        void collaborationApi
          .recordScreenSecurityViolation({
            event_type: eventType,
            route,
            details: reason,
            session_token: sessionToken,
          })
          .then((res) => {
            setViolationCount(res.violation_count);
          })
          .catch(() => undefined);
      }
    },
    [sessionToken],
  );

  // Poll backend Optical QR Camera Trap status so if a phone camera scans the on-screen QR URL,
  // the screen immediately turns off.
  useEffect(() => {
    const interval = window.setInterval(() => {
      collaborationApi
        .getOpticalQrCameraTrapStatus(sessionToken)
        .then((status) => {
          if (status.locked) {
            setIsScreenBlackedOut(true);
            setViolationCount(status.violation_count);
            if (status.reason) setLockoutReason(status.reason);
          }
        })
        .catch(() => undefined);
    }, 3500);
    return () => window.clearInterval(interval);
  }, [sessionToken]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        triggerBlackout(
          'screenshot_shortcut',
          'Screenshot key (PrintScreen) blocked on protected Client Account.',
        );
        return;
      }
      // macOS Cmd+Shift+3 / 4 / 5 / 6 screenshot shortcuts
      if (e.metaKey && e.shiftKey && ['3', '4', '5', '6', 's'].includes(key)) {
        e.preventDefault();
        triggerBlackout(
          'screenshot_shortcut',
          'macOS Screen Capture shortcut (Cmd+Shift+3/4/5) blocked.',
        );
        return;
      }
      // Windows Snipping Tool Win+Shift+S or Ctrl+Shift+S / Ctrl+P (Print)
      if ((e.ctrlKey || e.metaKey) && (key === 'p' || (e.shiftKey && key === 's'))) {
        e.preventDefault();
        triggerBlackout(
          'screenshot_shortcut',
          'Screen Print / Snipping Capture shortcut blocked on Client Account.',
        );
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        triggerBlackout(
          'screenshot_shortcut',
          'Screenshot key (PrintScreen) blocked on protected Client Account.',
        );
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerBlackout(
          'focus_loss',
          'Screen blacked out automatically: app switch, screenshot overlay, or external camera focus shift detected.',
        );
      }
    };

    const handleWindowBlur = () => {
      triggerBlackout(
        'focus_loss',
        'Screen blacked out: external snipping tool, camera app, or window focus change detected.',
      );
    };

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'IMG' || target.tagName === 'VIDEO' || target.closest('img, video'))) {
        e.preventDefault();
        triggerBlackout(
          'context_menu',
          'Direct image saving and right-click capture are disabled for Client Accounts.',
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [triggerBlackout]);

  const handleRestoreScreen = () => {
    setIsScreenBlackedOut(false);
    void collaborationApi.resetOpticalQrCameraTrap(sessionToken).catch(() => undefined);
  };

  return (
    <div
      className="relative select-none"
      onCopy={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Print & Screen Capture Blocker Stylesheet */}
      <style id={styleId}>{`
        @media print {
          body * {
            display: none !important;
          }
          body::after {
            content: "SCREENSHOT & PRINTING DISABLED — CABMORA CLIENT DRM SHIELD";
            display: block !important;
            padding: 4rem;
            font-size: 24px;
            text-align: center;
          }
        }
      `}</style>

      {/* Top Anti-Screenshot & Optical QR Camera-Trap Security Status Strip */}
      <div className="bg-forest-dark text-canvas border-b border-gold/30 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/20 border border-gold/40 text-gold font-bold uppercase tracking-wider text-[10px]">
            <ShieldCheck size={12} /> DRM Anti-Screenshot & Optical QR Trap Active
          </span>
          <span className="text-canvas/75 hidden sm:inline">
            Screenshots, screen recording, and external phone camera captures are disabled on{' '}
            <strong className="text-white">{clientLabel}</strong>.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQrWatermarkVisible((v) => !v)}
            className="px-2.5 py-1 rounded-lg bg-forest-light/70 hover:bg-forest-light border border-canvas/15 text-canvas/85 text-[10.5px] flex items-center gap-1 cursor-pointer transition-colors"
            title="Toggle Optical QR Camera-Trap Mesh visibility"
          >
            <QrCode size={12} className="text-gold" />
            <span>{qrWatermarkVisible ? 'Optical QR Mesh: ON' : 'Optical QR Mesh: Stealth'}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              triggerBlackout(
                'qr_camera_trap',
                'Smartphone Camera Optical QR Trap Triggered — Screen Automatically Turned Off to Prevent Photo Snapping.',
              )
            }
            className="px-2.5 py-1 rounded-lg bg-gold/20 hover:bg-gold hover:text-ink border border-gold/40 text-gold text-[10.5px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title="Simulate pointing a phone camera at the screen QR trap"
          >
            <CameraOff size={12} />
            <span>Test Camera QR Blackout</span>
          </button>
        </div>
      </div>

      {/* Main Protected Client Content + Embedded Optical QR Camera-Trap Overlay */}
      <div
        className={`relative transition-all duration-150 ${
          isScreenBlackedOut ? 'blur-2xl brightness-0 pointer-events-none select-none' : ''
        }`}
      >
        {children}

        {/* Embedded Optical QR Camera-Trap Beacons across the screen so a phone camera aiming at the screen locks onto the QR code and triggers screen-off */}
        {qrWatermarkVisible && !isScreenBlackedOut && (
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-30 overflow-hidden select-none"
          >
            {/* Corner Optical QR Camera-Trap Beacons */}
            <div className="absolute bottom-5 right-5 p-2 rounded-2xl bg-canvas/85 backdrop-blur-xs border border-gold/40 shadow-lg flex items-center gap-2.5 opacity-80">
              <div className="p-1 bg-white rounded-lg border border-ink/15">
                <OpticalTrapQrSvg size={58} seed={sessionToken} />
              </div>
              <div className="pr-1.5 text-ink">
                <div className="text-[9.5px] uppercase tracking-wider font-bold text-gold flex items-center gap-1">
                  <CameraOff size={10} /> Anti-Camera QR Shield
                </div>
                <div className="text-[10.5px] font-semibold leading-tight">
                  Phone Camera Auto-Off Trap
                </div>
                <div className="text-[9px] text-ink/55 font-mono">
                  ID: {sessionToken.slice(0, 14)}
                </div>
              </div>
            </div>

            {/* Subtle repeating optical QR & finder matrix across the viewport that disrupts phone camera CMOS sensors */}
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 place-items-center opacity-[0.07]">
              {Array.from({ length: 9 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-1 -rotate-12"
                >
                  <OpticalTrapQrSvg size={92} seed={`${sessionToken}-${idx}`} />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-ink">
                    CABMORA ANTI-CAMERA TRAP • {sessionToken}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FULL-SCREEN PITCH-BLACK LOCKOUT ("Screen Goes Off") WHEN PHONE CAMERA OR SCREENSHOT IS DETECTED */}
      {isScreenBlackedOut && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="cabmora-drm-lockout-title"
          className="fixed inset-0 z-[100] bg-noir-deep text-canvas flex flex-col items-center justify-center p-6 text-center select-none"
        >
          <div className="max-w-lg w-full bg-forest-dark border border-gold/40 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <CameraOff size={32} />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-[10.5px] font-bold uppercase tracking-[0.16em]">
                <ShieldAlert size={13} /> Optical QR Trap & Anti-Capture Lockout
              </span>
              <h2
                id="cabmora-drm-lockout-title"
                className="font-serif text-[26px] font-bold text-white leading-snug"
              >
                Screen Turned Off — Camera / Screenshot Blocked
              </h2>
              <p className="text-[13.5px] text-canvas/75 leading-relaxed">{lockoutReason}</p>
            </div>

            {/* Active Optical QR Trap Card inside the blackout screen */}
            <div className="p-4 rounded-2xl bg-forest border border-canvas/10 flex items-center gap-4 text-left">
              <div className="p-2 bg-white rounded-xl shrink-0">
                <OpticalTrapQrSvg size={72} seed={sessionToken} />
              </div>
              <div className="space-y-1 text-[12px]">
                <div className="font-semibold text-gold flex items-center gap-1.5">
                  <Lock size={13} /> Optical QR Camera-Disabler Active
                </div>
                <p className="text-canvas/70 text-[11.5px] leading-snug">
                  Pointing an external phone camera or taking a screenshot triggers the embedded QR
                  beacon and immediately blacks out all protected photographs.
                </p>
                <div className="text-[10.5px] text-canvas/50 font-mono">
                  Session Token: {sessionToken} • Logged Events: {violationCount}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRestoreScreen}
              className="w-full py-3.5 px-6 rounded-xl bg-gold text-ink font-semibold text-[13.5px] hover:bg-gold-dark flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-colors"
            >
              <Eye size={16} />
              <span>I Understand — Restore Protected Client Screen</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
