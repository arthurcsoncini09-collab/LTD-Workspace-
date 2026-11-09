'use client';

import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { BrandMark } from './brand-logo';
import { Button } from './ui/button';

// Registra o service worker e mostra, no celular, um convite para instalar o app.

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

const DISMISS_KEY = 'netlearn:pwa:dispensado';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function PwaSupport() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Sem service worker o site continua funcionando normalmente.
      });
    }

    let dismissed = false;
    try {
      dismissed = Boolean(window.localStorage.getItem(DISMISS_KEY));
    } catch {
      // Sem armazenamento: mostra o convite normalmente.
    }
    if (dismissed || isStandalone() || window.innerWidth >= 1280) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // iPhone/iPad não têm o evento de instalação: mostramos como fazer pelo Safari.
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    let timer: number | undefined;
    if (ios) timer = window.setTimeout(() => {
      setShowIosHint(true);
      setVisible(true);
    }, 2500);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignora
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Instalar o app NetLearn"
      className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 rounded-xl border border-border bg-card/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl xl:hidden"
    >
      <div className="flex items-start gap-3">
        <BrandMark size={40} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-white">Instale o NetLearn</div>
          {showIosHint ? (
            <p className="mt-1 text-sm text-muted-foreground">
              No Safari, toque em <Share className="inline h-4 w-4 align-text-bottom text-blue-400" aria-label="Compartilhar" /> e depois em{' '}
              <strong className="text-slate-200">Adicionar à Tela de Início</strong>.
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">Abra direto da tela inicial, em tela cheia, e estude mesmo sem internet nas páginas já vistas.</p>
          )}
          {installEvent ? (
            <Button
              size="md"
              className="mt-3"
              onClick={async () => {
                await installEvent.prompt();
                await installEvent.userChoice;
                setInstallEvent(null);
                dismiss();
              }}
            >
              <Download />
              Instalar app
            </Button>
          ) : null}
        </div>
        <button type="button" onClick={dismiss} aria-label="Fechar" className="-m-1 rounded-md p-2 text-slate-400 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
