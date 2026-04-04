"use client";

import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { Bot, Headset, LoaderCircle, MessagesSquare, ScanEye } from 'lucide-react';

import { apiFetch, getBackendUrl } from '@/lib/apiClient';
import { formatDateTime } from '@/lib/dashboardFormatting';

const ADMIN_TOKEN_KEY = 'admin_token';

function mergeMessages(currentMessages, nextMessages) {
  const map = new Map(currentMessages.map((message) => [message._id, message]));

  nextMessages.forEach((message) => {
    if (message?._id) {
      map.set(message._id, message);
    }
  });

  return [...map.values()].sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));
}

export default function AdminChatbotsPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionState, setConnectionState] = useState('Connecting');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let socket;

    async function load() {
      try {
        const initialMessages = await apiFetch('/api/chat/admin/messages', { tokenStorageKey: ADMIN_TOKEN_KEY });
        if (!active) {
          return;
        }

        setMessages(Array.isArray(initialMessages) ? initialMessages : []);
        const backendUrl = await getBackendUrl();
        const token = typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : '';

        socket = io(backendUrl, {
          transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
          setConnectionState('Live');
          socket.emit('join_admin_room', token);
        });

        socket.on('disconnect', () => {
          setConnectionState('Offline');
        });

        socket.on('socket_error', (payload) => {
          setError(payload?.message || 'Socket connection error.');
        });

        socket.on('chat_messages_created', (payload) => {
          if (!active || !Array.isArray(payload?.messages)) {
            return;
          }

          setMessages((current) => mergeMessages(current, payload.messages));
        });
      } catch (requestError) {
        if (active) {
          setError(requestError.message || 'Unable to load chat logs.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
      socket?.disconnect();
    };
  }, []);

  const summary = useMemo(() => ({
    total: messages.length,
    escalations: messages.filter((message) => message.liveSupportOffered).length,
    screenshots: messages.filter((message) => Array.isArray(message.attachments) && message.attachments.length > 0).length,
  }), [messages]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,247,251,0.9))] p-6 shadow-[0_20px_80px_rgba(15,23,42,0.07)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-pink-600">Chatbot oversight</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Watch investor chatbot activity and live-agent escalations in real time.</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">This feed persists every chatbot exchange and streams new messages live over Socket.IO so admins can monitor investor conversations as they happen.</p>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${connectionState === 'Live' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            <MessagesSquare className="h-4 w-4" />
            {connectionState}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Stored messages', value: String(summary.total), icon: Bot },
          { label: 'Live-agent offers', value: String(summary.escalations), icon: Headset },
          { label: 'Screenshot uploads', value: String(summary.screenshots), icon: ScanEye },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">{card.label}</div>
                  <div className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</div>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl bg-slate-50 px-4 py-10 text-sm text-slate-500">
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Loading chatbot logs...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-700">{error}</div>
        ) : messages.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">No chatbot logs yet.</div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <article key={message._id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4">
                <div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">{message.user?.fullName || 'Investor'}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${message.role === 'assistant' ? 'bg-rose-500 text-white' : 'bg-slate-900 text-white'}`}>
                        {message.role}
                      </span>
                      {message.liveSupportOffered ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">Live agent offered</span> : null}
                      {message.escalationRequested ? <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-700">Escalation requested</span> : null}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{message.user?.email || 'No email'} · Session {message.sessionId || 'n/a'} · {formatDateTime(message.createdAt)}</div>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{message.content}</p>

                  {message.attachments?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.attachments.map((attachment, index) => (
                        <span key={`${message._id}-attachment-${index}`} className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs text-rose-700">
                          {attachment.fileName || attachment.mimeType || 'Screenshot'}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {message.actions?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.actions.map((action, index) => (
                        <span key={`${message._id}-action-${index}`} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                          {action.label}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {message.recommendedProperties?.length ? (
                    <div className="mt-3 space-y-2">
                      {message.recommendedProperties.map((property, index) => (
                        <div key={`${message._id}-property-${index}`} className="rounded-2xl border border-rose-100 bg-rose-50/70 p-3 text-sm text-slate-700">
                          <div className="font-semibold text-slate-900">{property.name || 'Recommended property'}</div>
                          <div className="mt-1 text-xs text-slate-500">{property.location || 'Location pending'} · Occupancy {property.occupancyScore || 0}% · Units {property.availableUnits || 0}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}