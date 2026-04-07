"use client";

import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, QrCode, Smartphone, WalletCards } from 'lucide-react';
import InstallAppButton from '@/components/Public/InstallAppButton';
import { absoluteUrl } from '@/lib/site';
import useAppInstallPrompt from '@/lib/useAppInstallPrompt';

export default function MobileAppInstallSection() {
  const installPrompt = useAppInstallPrompt();
  const installUrl = absoluteUrl('/?source=mobile-install');

  return (
    <section className="bg-white px-4 pb-12 text-slate-900 sm:px-6 md:px-10 md:pb-16">
      <div className="mx-auto max-w-7xl rounded-[2.4rem] border border-slate-100 bg-[linear-gradient(135deg,#fff7fb_0%,#ffffff_52%,#f8fbff_100%)] p-6 shadow-[0_30px_120px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-rose-100 bg-rose-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">
              Install mobile app
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Add InvestAir to your phone for faster wallet access, funding instructions, and property tracking.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Open InvestAir on your mobile device, install it to your home screen, and keep your funding wallet details and opportunity flow close by whenever you are ready to deposit or review a property.
            </p>

            <div className="mt-6">
              <InstallAppButton
                promptState={installPrompt}
                label="Install mobile app"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-rose-800"
                helperClassName="flex items-center gap-2 text-sm text-slate-500"
              />
            </div>

            <div className="mt-6 grid gap-3 text-sm leading-7 text-slate-600">
              <div className="flex gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                <Smartphone className="mt-1 h-5 w-5 shrink-0 text-rose-500" />
                <span>{installPrompt.instructions.action}</span>
              </div>
              <div className="flex gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                <WalletCards className="mt-1 h-5 w-5 shrink-0 text-rose-500" />
                <span>Use the app to reach your wallet addresses, scan funding QR codes, and continue into the investor dashboard faster on mobile.</span>
              </div>
         
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-[0.86fr_1.14fr]">
            <div className="rounded-[2rem] border border-slate-100 bg-rose-950 p-6 text-white shadow-[0_30px_100px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-rose-200">
                <QrCode className="h-4 w-4" />
                Scan on your phone
              </div>
              <div className="mt-5 flex items-center justify-center rounded-[1.75rem] bg-white p-4 shadow-sm">
                {installUrl ? (
                  <QRCodeSVG value={installUrl} size={170} bgColor="transparent" fgColor="#0f172a" />
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Scan this QR code from desktop to open InvestAir on your phone, then use the install flow available on your device.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">What mobile access gives you</div>
              <div className="mt-4 space-y-4">
                {[
                  'One-tap entry into the investor dashboard after you sign up or log in.',
                  'Quick access to the wallet address and QR funding flow for BTC, USDT, or ETH.',
                  'Faster transitions from property browsing to checkout when you are ready to reserve a rental period.',
                ].map((item, index) => (
                  <div key={item} className="flex gap-4 rounded-[1.6rem] bg-rose-50 px-4 py-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-900 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}