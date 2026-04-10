"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowUpRight,
  Headset,
  ImagePlus,
  LoaderCircle,
  MessageCircleMore,
  SendHorizontal,
  Sparkles,
  WalletCards,
  X,
} from 'lucide-react';

import { apiFetch } from '@/lib/apiClient';
import { openTawkSupport } from '@/lib/tawk';

const INVESTOR_TOKEN_KEY = 'investor_token';
const CHAT_SESSION_KEY = 'investair-chat-session-id';
const CHAT_POSITION_KEY = 'investair-chat-position';
const DRAG_VIEWPORT_MARGIN = 16;
const DEFAULT_FAQS = [
  'How do I sign up?',
  'How do I fund my account?',
  'Which properties are the best investment options right now?',
  'Can I send a screenshot for help?',
  'How do withdrawals work?',
];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function truncateAddress(address) {
  if (!address) {
    return 'Address pending';
  }

  if (address.length <= 18) {
    return address;
  }

  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function getOrCreateSessionId() {
  if (typeof window === 'undefined') {
    return '';
  }

  const existing = window.sessionStorage.getItem(CHAT_SESSION_KEY);
  if (existing) {
    return existing;
  }

  const nextId = window.crypto?.randomUUID?.() || `chat-${Date.now()}`;
  window.sessionStorage.setItem(CHAT_SESSION_KEY, nextId);
  return nextId;
}

function buildGuestMessage() {
  return {
    id: 'guest-intro',
    role: 'assistant',
    content: 'Sign up or log in as an investor to use the chat assistant. Once you are signed in, I can guide you through deposits, screenshots, investing, and withdrawals.',
    actions: [
      { label: 'Sign Up', url: '/investor/signup' },
      { label: 'Log In', url: '/investor/login' },
    ],
    faqSuggestions: DEFAULT_FAQS,
    recommendedProperties: [],
  };
}

function buildInvestorMessage(user, wallets) {
  const totalAvailable = wallets.reduce((sum, wallet) => sum + Number(wallet.availableBalance || 0), 0);

  return {
    id: 'investor-intro',
    role: 'assistant',
    content: totalAvailable > 0
      ? `${user?.fullName || 'Investor'}, you currently have ${formatCurrency(totalAvailable)} available and can invest immediately. I can also review screenshots and point you to the best available properties with at least 90% occupancy.`
      : `${user?.fullName || 'Investor'}, your account is ready. Fund your wallet first, then I can guide you into the best available properties with at least 90% occupancy.`,
    actions: totalAvailable > 0
      ? [
        { label: 'Invest Now', url: '/invest' },
        { label: 'View Wallet', url: '/investor/dashboard#wallets' },
        { label: 'Withdraw', url: '/investor/withdrawals' },
      ]
      : [
        { label: 'Deposit Funds', url: '/investor/dashboard#fund-account' },
        { label: 'View Wallet', url: '/investor/dashboard#wallets' },
        { label: 'Invest Now', url: '/invest' },
      ],
    faqSuggestions: DEFAULT_FAQS,
    recommendedProperties: [],
  };
}

function clamp(value, min, max) {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}

function readStoredPosition() {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0 };
  }

  try {
    const stored = window.localStorage.getItem(CHAT_POSITION_KEY);
    if (!stored) {
      return { x: 0, y: 0 };
    }

    const parsed = JSON.parse(stored);
    if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
      return parsed;
    }
  } catch {
    return { x: 0, y: 0 };
  }

  return { x: 0, y: 0 };
}

export default function InvestAirChatWidget() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const widgetRef = useRef(null);
  const dragStateRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [messages, setMessages] = useState([buildGuestMessage()]);
  const [chatSessionId, setChatSessionId] = useState('');
  const [draft, setDraft] = useState('');
  const [pendingScreenshots, setPendingScreenshots] = useState([]);
  const [error, setError] = useState('');
  const [faqIndex, setFaqIndex] = useState(0);

  const redirectTarget = useMemo(() => {
    const query = searchParams?.toString();
    return `${pathname || '/'}${query ? `?${query}` : ''}`;
  }, [pathname, searchParams]);

  const quickActions = useMemo(() => {
    if (!user) {
      return [
        { label: 'Sign Up', url: `/investor/signup?redirectTo=${encodeURIComponent(redirectTarget)}` },
        { label: 'Log In', url: `/investor/login?redirectTo=${encodeURIComponent(redirectTarget)}` },
      ];
    }

    const totalAvailable = wallets.reduce((sum, wallet) => sum + Number(wallet.availableBalance || 0), 0);
    return [
      totalAvailable > 0
        ? { label: 'Invest Now', url: '/invest' }
        : { label: 'Deposit Funds', url: '/investor/dashboard#fund-account' },
      { label: 'View Wallet', url: '/investor/dashboard#wallets' },
      { label: 'Withdraw', url: '/investor/withdrawals' },
    ];
  }, [redirectTarget, user, wallets]);

  useEffect(() => {
    setChatSessionId(getOrCreateSessionId());
    setDragOffset(readStoredPosition());

    function syncViewport() {
      setIsMobile(window.innerWidth < 768);
    }

    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFaqIndex((current) => (current + 1) % DEFAULT_FAQS.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      setSessionLoading(true);
      setError('');

      const token = typeof window !== 'undefined' ? localStorage.getItem(INVESTOR_TOKEN_KEY) : '';

      if (!token) {
        if (!active) {
          return;
        }

        setUser(null);
        setWallets([]);
        setMessages([buildGuestMessage()]);
        setSessionLoading(false);
        return;
      }

      try {
        const [profile, walletData] = await Promise.all([
          apiFetch('/api/users/me', { tokenStorageKey: INVESTOR_TOKEN_KEY }),
          apiFetch('/api/wallets', { tokenStorageKey: INVESTOR_TOKEN_KEY }).catch(() => []),
        ]);

        if (!active) {
          return;
        }

        const nextWallets = Array.isArray(walletData) ? walletData : [];
        setUser(profile || null);
        setWallets(nextWallets);
        setMessages((current) => (current.length > 1 ? current : [buildInvestorMessage(profile || null, nextWallets)]));
      } catch {
        if (!active) {
          return;
        }

        localStorage.removeItem(INVESTOR_TOKEN_KEY);
        setUser(null);
        setWallets([]);
        setMessages([buildGuestMessage()]);
      } finally {
        if (active) {
          setSessionLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (!isOpen || !user) {
      return;
    }

    void loadHistory();
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (typeof window === 'undefined' || isMobile) {
      return;
    }

    window.localStorage.setItem(CHAT_POSITION_KEY, JSON.stringify(dragOffset));
  }, [dragOffset, isMobile]);

  useEffect(() => {
    if (isMobile || !widgetRef.current) {
      return;
    }

    const rect = widgetRef.current.getBoundingClientRect();
    const minOffsetX = dragOffset.x + DRAG_VIEWPORT_MARGIN - rect.left;
    const maxOffsetX = dragOffset.x + window.innerWidth - DRAG_VIEWPORT_MARGIN - rect.right;
    const minOffsetY = dragOffset.y + DRAG_VIEWPORT_MARGIN - rect.top;
    const maxOffsetY = dragOffset.y + window.innerHeight - DRAG_VIEWPORT_MARGIN - rect.bottom;

    const nextOffset = {
      x: clamp(dragOffset.x, minOffsetX, maxOffsetX),
      y: clamp(dragOffset.y, minOffsetY, maxOffsetY),
    };

    if (nextOffset.x !== dragOffset.x || nextOffset.y !== dragOffset.y) {
      setDragOffset(nextOffset);
    }
  }, [dragOffset, isMobile, isOpen]);

  useEffect(() => {
    if (isMobile) {
      return undefined;
    }

    function syncDragBounds() {
      if (!widgetRef.current) {
        return;
      }

      const rect = widgetRef.current.getBoundingClientRect();
      setDragOffset((current) => {
        const minOffsetX = current.x + DRAG_VIEWPORT_MARGIN - rect.left;
        const maxOffsetX = current.x + window.innerWidth - DRAG_VIEWPORT_MARGIN - rect.right;
        const minOffsetY = current.y + DRAG_VIEWPORT_MARGIN - rect.top;
        const maxOffsetY = current.y + window.innerHeight - DRAG_VIEWPORT_MARGIN - rect.bottom;

        const nextOffset = {
          x: clamp(current.x, minOffsetX, maxOffsetX),
          y: clamp(current.y, minOffsetY, maxOffsetY),
        };

        if (nextOffset.x === current.x && nextOffset.y === current.y) {
          return current;
        }

        return nextOffset;
      });
    }

    window.addEventListener('resize', syncDragBounds);
    return () => window.removeEventListener('resize', syncDragBounds);
  }, [isMobile]);

  async function loadHistory() {
    setHistoryLoading(true);

    try {
      const history = await apiFetch('/api/chat/messages', { tokenStorageKey: INVESTOR_TOKEN_KEY });
      const normalizedHistory = Array.isArray(history)
        ? history.slice().reverse().map((message) => ({
          id: message._id,
          role: message.role,
          content: message.content,
          actions: Array.isArray(message.actions) ? message.actions : [],
          faqSuggestions: Array.isArray(message.faqSuggestions) ? message.faqSuggestions : [],
          recommendedProperties: Array.isArray(message.recommendedProperties) ? message.recommendedProperties : [],
        }))
        : [];

      if (normalizedHistory.length > 0) {
        setMessages(normalizedHistory);
      }
    } catch {
      setError('Unable to load chat history right now.');
    } finally {
      setHistoryLoading(false);
    }
  }

  function handleRoute(url) {
    setIsOpen(false);
    router.push(url);
  }

  function handleDragStart(event) {
    if (isMobile || !widgetRef.current) {
      return;
    }

    event.preventDefault();

    const rect = widgetRef.current.getBoundingClientRect();
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      initialOffset: dragOffset,
      minOffsetX: dragOffset.x + DRAG_VIEWPORT_MARGIN - rect.left,
      maxOffsetX: dragOffset.x + window.innerWidth - DRAG_VIEWPORT_MARGIN - rect.right,
      minOffsetY: dragOffset.y + DRAG_VIEWPORT_MARGIN - rect.top,
      maxOffsetY: dragOffset.y + window.innerHeight - DRAG_VIEWPORT_MARGIN - rect.bottom,
    };

    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handleDragMove(event) {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    setDragOffset({
      x: clamp(dragState.initialOffset.x + deltaX, dragState.minOffsetX, dragState.maxOffsetX),
      y: clamp(dragState.initialOffset.y + deltaY, dragState.minOffsetY, dragState.maxOffsetY),
    });
  }

  function handleDragEnd(event) {
    if (dragStateRef.current?.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  async function handleLiveAgentRequest() {
    if (!user) {
      setIsOpen(true);
      return;
    }

    try {
      await openTawkSupport({ user, wallets, sessionId: chatSessionId || getOrCreateSessionId() });
    } catch (requestError) {
      setError(requestError.message || 'Unable to open live support right now.');
    }
  }

  function handleAction(action) {
    if (action?.type === 'live-agent') {
      void handleLiveAgentRequest();
      return;
    }

    if (action?.url) {
      handleRoute(action.url);
    }
  }

  function handlePrompt(prompt) {
    if (!user) {
      setIsOpen(true);
      return;
    }

    setDraft(prompt);
    setIsOpen(true);
  }

  function handleFileSelection(event) {
    const nextFiles = Array.from(event.target.files || []).slice(0, 3);
    setPendingScreenshots(nextFiles);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!user || submitting) {
      return;
    }

    const trimmed = draft.trim();
    if (!trimmed && pendingScreenshots.length === 0) {
      return;
    }

    setSubmitting(true);
    setError('');

    const optimisticUserMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed || 'Attached screenshot for guidance.',
      actions: [],
      faqSuggestions: [],
      recommendedProperties: [],
    };
    setMessages((current) => [...current, optimisticUserMessage]);

    try {
      const formData = new FormData();
      formData.append('message', trimmed || 'Please guide me using the attached screenshot.');
      formData.append('sessionId', chatSessionId || getOrCreateSessionId());
      pendingScreenshots.forEach((file) => formData.append('screenshots', file));

      const response = await apiFetch('/api/chat/messages', {
        method: 'POST',
        tokenStorageKey: INVESTOR_TOKEN_KEY,
        body: formData,
      });

      if (response?.context?.wallets) {
        setWallets(response.context.wallets);
      }

      setMessages((current) => [
        ...current,
        {
          id: response?.id || `assistant-${Date.now()}`,
          role: 'assistant',
          content: response?.message || 'I was unable to process that request.',
          actions: Array.isArray(response?.actions) ? response.actions : [],
          faqSuggestions: Array.isArray(response?.faqSuggestions) ? response.faqSuggestions : [],
          recommendedProperties: Array.isArray(response?.recommendedProperties) ? response.recommendedProperties : [],
        },
      ]);

      if (response?.liveAgent?.autoOpen) {
        void handleLiveAgentRequest();
      }

      setDraft('');
      setPendingScreenshots([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to send your message right now.');
    } finally {
      setSubmitting(false);
    }
  }

  const widgetWidthClass = isMobile ? 'inset-0 rounded-none' : 'bottom-24 right-4 w-[24rem] rounded-[2rem] sm:right-6 sm:w-[26rem]';
  const desktopDragStyle = isMobile ? undefined : { transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)` };
  const totalAvailable = wallets.reduce((sum, wallet) => sum + Number(wallet.availableBalance || 0), 0);
  const featuredPrompt = DEFAULT_FAQS[faqIndex];

  return (
    <>
      {!isOpen ? (
        <div ref={widgetRef} className="fixed bottom-24 right-4 z-40 sm:right-6" style={desktopDragStyle}>
          {!isMobile ? (
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onPointerDown={handleDragStart}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
                onPointerCancel={handleDragEnd}
                className={`inline-flex cursor-grab items-center rounded-full border border-rose-100 bg-white/95 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400 shadow-sm touch-none ${dragging ? 'cursor-grabbing' : ''}`}
                aria-label="Drag chat launcher"
              >
                Move chat
              </button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 rounded-full border border-rose-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-[0_18px_50px_rgba(244,63,94,0.18)] transition hover:border-rose-300 hover:shadow-[0_20px_60px_rgba(244,63,94,0.25)]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm transition group-hover:bg-rose-600">
              <MessageCircleMore className="h-5 w-5" />
            </span>
            <span className="hidden max-w-44 text-left sm:block">
              <span className="block text-[11px] uppercase tracking-[0.22em] text-rose-500">Investair AI</span>
              <span className="block truncate">{user ? featuredPrompt : 'Sign up to unlock investor chat'}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => handlePrompt(featuredPrompt)}
            className="mt-3 hidden rounded-full border border-rose-100 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-700 shadow-sm transition hover:bg-rose-100 sm:block"
          >
            {featuredPrompt}
          </button>
        </div>
      ) : null}

      {isOpen ? (
        <div
          className={isMobile ? 'fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm' : 'pointer-events-none fixed inset-0 z-50'}
          onClick={isMobile ? () => setIsOpen(false) : undefined}
        >
          <section
            ref={widgetRef}
            className={`fixed ${widgetWidthClass} ${isMobile ? '' : 'pointer-events-auto'} flex max-h-dvh flex-col border border-white/70 bg-[linear-gradient(180deg,#fff7fb_0%,#ffffff_32%,#fff1f2_100%)] shadow-[0_40px_120px_rgba(15,23,42,0.18)] ${isMobile ? '' : 'max-h-[80vh]'}`}
            style={desktopDragStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 border-b border-rose-100 px-5 py-4">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-rose-600">
                  <Sparkles className="h-3.5 w-3.5" />
                  InvestAir AI
                </div>
                <h2 className="mt-3 text-lg font-semibold text-slate-950">Investor chat assistant</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {user
                    ? `${user.fullName || 'Investor'} · ${formatCurrency(totalAvailable)} available`
                    : 'Investor sign-up or login is required before you can chat.'}
                </p>
                {!isMobile ? (
                  <button
                    type="button"
                    onPointerDown={handleDragStart}
                    onPointerMove={handleDragMove}
                    onPointerUp={handleDragEnd}
                    onPointerCancel={handleDragEnd}
                    className={`mt-3 inline-flex cursor-grab items-center rounded-full border border-rose-100 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400 shadow-sm touch-none ${dragging ? 'cursor-grabbing' : ''}`}
                    aria-label="Drag chat window"
                  >
                    Drag window
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-100 bg-white text-slate-600 transition hover:bg-rose-50"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {user ? (
              <div className="border-b border-rose-100 px-5 py-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <WalletCards className="h-3.5 w-3.5" />
                  Wallet snapshot
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {wallets.map((wallet) => (
                    <div key={wallet.currency} className="rounded-full border border-rose-100 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm">
                      <span className="font-semibold text-rose-600">{wallet.currency}</span> {truncateAddress(wallet.address)}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="border-b border-rose-100 px-5 py-3">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => handleRoute(action.url)}
                    className="rounded-full border border-rose-100 bg-white px-3 py-2 text-xs font-medium text-rose-700 transition hover:border-rose-200 hover:bg-rose-50"
                  >
                    {action.label}
                  </button>
                ))}
                {user ? (
                  <button
                    type="button"
                    onClick={() => void handleLiveAgentRequest()}
                    className="rounded-full border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:border-rose-200 hover:bg-rose-100"
                  >
                    Talk to Live Agent
                  </button>
                ) : null}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {sessionLoading || historyLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Loading chat...
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <article key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[88%] rounded-[1.5rem] px-4 py-3 text-sm shadow-sm ${message.role === 'user' ? 'bg-slate-900 text-white' : 'border border-rose-100 bg-white text-slate-800'}`}>
                        <p className="whitespace-pre-wrap leading-6">{message.content}</p>

                        {message.actions?.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.actions.map((action) => (
                              <button
                                key={`${message.id}-${action.label}`}
                                type="button"
                                onClick={() => handleAction(action)}
                                className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-rose-600"
                              >
                                {action.label}
                                {action?.type === 'live-agent' ? <Headset className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                              </button>
                            ))}
                          </div>
                        ) : null}

                        {message.recommendedProperties?.length ? (
                          <div className="mt-3 space-y-2">
                            {message.recommendedProperties.map((property, index) => (
                              <div key={`${message.id}-property-${index}`} className="rounded-2xl border border-rose-100 bg-rose-50/60 p-3 text-slate-800">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <div className="font-semibold">{property.name || 'Recommended property'}</div>
                                    <div className="text-xs text-slate-500">{property.location || 'Location pending'}</div>
                                  </div>
                                  {property.bestInvestmentOption ? (
                                    <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                                      Best Investment Option
                                    </span>
                                  ) : null}
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                                  <span className="rounded-full bg-white px-2.5 py-1">Occupancy {property.occupancyScore}%</span>
                                  <span className="rounded-full bg-white px-2.5 py-1">Units {property.availableUnits}</span>
                                  {property.recommendedDurationMonths ? <span className="rounded-full bg-white px-2.5 py-1">{property.recommendedDurationMonths} mo</span> : null}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRoute('/invest')}
                                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-rose-700 transition hover:text-rose-800"
                                >
                                  Invest now
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="border-t border-rose-100 px-5 py-4">
              <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-white px-3 py-2 text-sm text-slate-600">
                <button type="button" onClick={() => handlePrompt(featuredPrompt)} className="truncate text-left font-medium text-rose-700 transition hover:text-rose-800">
                  {featuredPrompt}
                </button>
                <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">FAQ</span>
              </div>

              {pendingScreenshots.length > 0 ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {pendingScreenshots.map((file) => (
                    <span key={`${file.name}-${file.size}`} className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs text-rose-700">
                      {file.name}
                    </span>
                  ))}
                </div>
              ) : null}

              {error ? <div className="mb-3 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div> : null}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-end gap-3">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    disabled={!user || submitting}
                    placeholder={user ? 'Ask about deposits, screenshots, or the best available properties...' : 'Sign up or log in to start chatting'}
                    className="min-h-24 flex-1 rounded-[1.5rem] border border-rose-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-300 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!user || submitting}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-100 bg-white text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-300"
                      aria-label="Attach screenshot"
                    >
                      <ImagePlus className="h-5 w-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={!user || submitting || (!draft.trim() && pendingScreenshots.length === 0)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500 text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-200"
                      aria-label="Send message"
                    >
                      {submitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <SendHorizontal className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleFileSelection}
                />
              </form>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}