"use client";

import { useState } from 'react';
import { CheckCircle2, Download, Sparkles } from 'lucide-react';
import useAppInstallPrompt from '@/lib/useAppInstallPrompt';

function InstallAppButtonContent({
  className = '',
  helperClassName = '',
  label = 'Install mobile app',
  promptState,
  showHelperText = true,
}) {
  const { canInstall, install, instructions, isInstalled, platform } = promptState;
  const [message, setMessage] = useState('');

  async function handleInstallClick() {
    if (isInstalled) {
      setMessage('InvestAir is already installed on this device.');
      return;
    }

    const accepted = await install();

    if (accepted) {
      setMessage('Install prompt opened. Follow your browser prompts to finish setup.');
      return;
    }

    setMessage(instructions.action);
  }

  const buttonLabel = isInstalled
    ? 'App installed'
    : canInstall
      ? label
      : platform === 'ios'
        ? 'Install on iPhone'
        : label;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleInstallClick}
        className={className || 'inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800'}
      >
        {isInstalled ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        {buttonLabel}
      </button>

      {showHelperText ? (
        <p className={helperClassName || 'flex items-center gap-2 text-sm text-slate-500'}>
          <Sparkles className="h-4 w-4 text-rose-500" />
          {message || instructions.hint}
        </p>
      ) : null}
    </div>
  );
}

function InstallAppButtonWithPrompt(props) {
  const promptState = useAppInstallPrompt();
  return <InstallAppButtonContent {...props} promptState={promptState} />;
}

export default function InstallAppButton({
  className = '',
  helperClassName = '',
  label = 'Install mobile app',
  promptState = null,
  showHelperText = true,
}) {
  if (promptState) {
    return (
      <InstallAppButtonContent
        className={className}
        helperClassName={helperClassName}
        label={label}
        promptState={promptState}
        showHelperText={showHelperText}
      />
    );
  }

  return (
    <InstallAppButtonWithPrompt
      className={className}
      helperClassName={helperClassName}
      label={label}
      showHelperText={showHelperText}
    />
  );
}