"use client";

import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { Bot, Headset, LoaderCircle, MessagesSquare, ScanEye, UserRound } from 'lucide-react';

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

  return [...map.values()].sort((left, right) => new Date(left.createdAt || 0) - new Date(right.createdAt || 0));
}

function sortUsersByLatest(left, right) {
  return new Date(right.lastMessageAt || 0) - new Date(left.lastMessageAt || 0);
}

export default function AdminChatbotsPage() {
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [connectionState, setConnectionState] = useState('Connecting');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let socket;

    async function load() {
      try {
        const initialUsers = await apiFetch('/api/chat/admin/users', { tokenStorageKey: ADMIN_TOKEN_KEY });
        if (!active) {
          return;
        }

        const normalizedUsers = Array.isArray(initialUsers) ? initialUsers : [];
        setChatUsers(normalizedUsers);
        setSelectedUserId((current) => current || normalizedUsers[0]?._id || '');
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

          const payloadUser = payload?.user;

          if (payloadUser?._id) {
            setChatUsers((current) => {
              const nextUsers = [...current];
              const existingIndex = nextUsers.findIndex((item) => item._id === payloadUser._id || item.user?._id === payloadUser._id);
              const nextSummary = {
                _id: payloadUser._id,
                user: payloadUser,
                messageCount: (existingIndex >= 0 ? Number(nextUsers[existingIndex].messageCount || 0) : 0) + payload.messages.length,
                lastMessageAt: payload.messages[payload.messages.length - 1]?.createdAt || new Date().toISOString(),
                lastMessagePreview: payload.messages[payload.messages.length - 1]?.content || '',
                escalationRequested: payload.messages.some((message) => message.escalationRequested) || (existingIndex >= 0 && nextUsers[existingIndex].escalationRequested),
                liveSupportOffered: payload.messages.some((message) => message.liveSupportOffered) || (existingIndex >= 0 && nextUsers[existingIndex].liveSupportOffered),
              };

              if (existingIndex >= 0) {
                nextUsers.splice(existingIndex, 1, nextSummary);
              } else {
                nextUsers.push(nextSummary);
              }

              return nextUsers.sort(sortUsersByLatest);
            });

            if (selectedUserId === payloadUser._id) {
              setSelectedMessages((current) => mergeMessages(current, payload.messages));
            }
          }
        });
      } catch (requestError) {
        if (active) {
          setError(requestError.message || 'Unable to load chat logs.');
        }
      } finally {
        if (active) {
          setLoadingUsers(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
      socket?.disconnect();
    };
  }, [selectedUserId]);

  useEffect(() => {
    let active = true;

    async function loadMessages() {
      if (!selectedUserId) {
        setSelectedMessages([]);
        setLoadingMessages(false);
        return;
      }

      setLoadingMessages(true);
      try {
        const messages = await apiFetch(`/api/chat/admin/users/${selectedUserId}/messages`, { tokenStorageKey: ADMIN_TOKEN_KEY });
        if (!active) {
          return;
        }

        setSelectedMessages(Array.isArray(messages) ? messages : []);
      } catch (requestError) {
        if (active) {
          setError(requestError.message || 'Unable to load conversation.');
        }
      } finally {
        if (active) {
          setLoadingMessages(false);
        }
      }
    }

    void loadMessages();

    return () => {
      active = false;
    };
  }, [selectedUserId]);

  const summary = useMemo(() => ({
    total: chatUsers.reduce((sum, user) => sum + Number(user.messageCount || 0), 0),
    escalations: chatUsers.filter((user) => user.liveSupportOffered || user.escalationRequested).length,
    screenshots: selectedMessages.filter((message) => Array.isArray(message.attachments) && message.attachments.length > 0).length,
  }), [chatUsers, selectedMessages]);

  const selectedUser = chatUsers.find((item) => item._id === selectedUserId || item.user?._id === selectedUserId) || null;

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

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.45fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Users with chatbot activity</h2>
              <p className="mt-1 text-sm text-slate-500">Only investors who have interacted with the chatbot appear here.</p>
            </div>
            <div className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">{chatUsers.length} users</div>
          </div>

          {loadingUsers ? (
            <div className="flex items-center justify-center rounded-2xl bg-slate-50 px-4 py-10 text-sm text-slate-500">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Loading chatbot users...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-700">{error}</div>
          ) : chatUsers.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">No chatbot logs yet.</div>
          ) : (
            <div className="space-y-3">
              {chatUsers.map((chatUser) => {
                const isActive = (chatUser._id || chatUser.user?._id) === selectedUserId;

                return (
                  <button
                    key={chatUser._id || chatUser.user?._id}
                    type="button"
                    onClick={() => setSelectedUserId(chatUser._id || chatUser.user?._id || '')}
                    className={`w-full rounded-[1.5rem] border p-4 text-left transition ${isActive ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-100 bg-slate-50/80 text-slate-900 hover:border-slate-200 hover:bg-white'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{chatUser.user?.fullName || 'Investor'}</div>
                        <div className={`mt-1 text-sm ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>{chatUser.user?.email || 'No email'}</div>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-xs font-medium ${isActive ? 'bg-white/10 text-white' : 'bg-white text-slate-600'}`}>{chatUser.messageCount || 0} msgs</div>
                    </div>
                    <div className={`mt-3 text-sm ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>{chatUser.lastMessagePreview || 'No preview yet'}</div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em]">
                      <span className={`rounded-full px-2.5 py-1 ${isActive ? 'bg-white/10 text-white' : 'bg-white text-slate-500'}`}>{formatDateTime(chatUser.lastMessageAt)}</span>
                      {chatUser.liveSupportOffered ? <span className={`rounded-full px-2.5 py-1 ${isActive ? 'bg-amber-400/20 text-amber-100' : 'bg-amber-50 text-amber-700'}`}>Live agent</span> : null}
                      {chatUser.escalationRequested ? <span className={`rounded-full px-2.5 py-1 ${isActive ? 'bg-rose-400/20 text-rose-100' : 'bg-rose-50 text-rose-700'}`}>Escalation</span> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Conversation log</h2>
              <p className="mt-1 text-sm text-slate-500">Select a user to inspect their full chatbot conversation.</p>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${connectionState === 'Live' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              <MessagesSquare className="h-4 w-4" />
              {connectionState}
            </div>
          </div>

          {selectedUser ? (
            <div className="mb-5 rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-semibold text-slate-900">{selectedUser.user?.fullName || 'Investor'}</div>
                  <div className="text-sm text-slate-500">{selectedUser.user?.email || 'No email'}</div>
                </div>
              </div>
            </div>
          ) : null}

          {!selectedUserId ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">Choose a chatbot user from the left panel.</div>
          ) : loadingMessages ? (
          <div className="flex items-center justify-center rounded-2xl bg-slate-50 px-4 py-10 text-sm text-slate-500">
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Loading conversation...
          </div>
          ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-700">{error}</div>
          ) : selectedMessages.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">This user has no stored messages yet.</div>
          ) : (
            <div className="space-y-4">
            {selectedMessages.map((message) => (
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
        </div>
      </section>
    </div>
  );
}