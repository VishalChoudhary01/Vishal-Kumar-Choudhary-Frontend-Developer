"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { GrGoogle } from "react-icons/gr";
import { Check, CircleAlert, LoaderCircle, Link2, LockKeyhole, Mail, ShieldCheck, Unlink } from "lucide-react";

import { authClient } from "@/app/lib/auth/client";

const PROVIDERS = {
  google: { label: "Google", Icon: GrGoogle, action: "Connect Google" },
  github: { label: "GitHub", Icon: FaGithub, action: "Connect GitHub" },
};

function getProviderLabel(providerId) {
  if (providerId === "credential") return "Email and password";
  return PROVIDERS[providerId]?.label || providerId;
}

export default function LabsAccountSecurity({
  email,
  googleEnabled = false,
  githubEnabled = false,
  initialNotice = "",
  linkedProvider = "",
}) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingProvider, setPendingProvider] = useState("");
  const [pendingAccount, setPendingAccount] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(initialNotice);
  const linkResultCheckedRef = useRef(false);

  const refreshAccounts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await authClient.listAccounts();
      if (result?.error) {
        throw new Error(result.error.message || "Unable to load sign-in methods.");
      }
      const nextAccounts = Array.isArray(result?.data) ? result.data : [];
      setAccounts(nextAccounts);

      if (linkedProvider && !linkResultCheckedRef.current) {
        linkResultCheckedRef.current = true;
        const linked = nextAccounts.some((account) => account.providerId === linkedProvider);
        if (linked) {
          setNotice(`${getProviderLabel(linkedProvider)} is connected to this Labs account.`);
        } else {
          setError("The provider returned, but the sign-in method was not connected. Please try again.");
        }
      }
    } catch {
      setError("We couldn't load your sign-in methods. Refresh the page and try again.");
    } finally {
      setLoading(false);
    }
  }, [linkedProvider]);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  const connectedProviders = useMemo(
    () => new Set(accounts.map((account) => account.providerId)),
    [accounts],
  );

  const connectProvider = async (provider) => {
    if (pendingProvider || loading || connectedProviders.has(provider)) return;

    setPendingProvider(provider);
    setError("");
    setNotice("");

    try {
      const result = await authClient.linkSocial({
        provider,
        callbackURL: `/labs/account/security?linked=${provider}`,
        errorCallbackURL: "/labs/account/security?linkError=1",
      });

      if (result?.error) {
        throw new Error(result.error.message || "Unable to connect this provider.");
      }
    } catch {
      setError(
        "We couldn't connect this account. Make sure the provider uses the same verified email as your Labs account, then try again.",
      );
      setPendingProvider("");
    }
  };

  const disconnectProvider = async (account) => {
    if (pendingAccount || accounts.length <= 1) return;

    setPendingAccount(account.id);
    setError("");
    setNotice("");

    try {
      const result = await authClient.unlinkAccount({ accountId: account.id });
      if (result?.error) {
        throw new Error(result.error.message || "Unable to disconnect this provider.");
      }
      setNotice(`${getProviderLabel(account.providerId)} was disconnected.`);
      await refreshAccounts();
    } catch {
      setError("We couldn't disconnect this provider. Your existing sign-in methods are unchanged.");
    } finally {
      setPendingAccount("");
    }
  };

  return (
    <main className="mx-auto w-full max-w-[900px] px-4 pb-16 pt-24 text-text-primary sm:px-6 sm:pt-28">
      <div className="mb-8 max-w-[680px]">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">Labs account</p>
        <h1 className="font-display text-3xl tracking-[-0.035em] sm:text-4xl">Account settings</h1>
        <p className="mt-3 max-w-[560px] text-sm leading-6 text-text-secondary">
          Manage the ways you sign in. Connect Google or GitHub to use more than one method with this same Labs account.
        </p>
      </div>

      {notice ? (
        <div role="status" className="mb-5 flex items-start gap-2 rounded-sm border border-success/35 bg-success-soft/60 px-3 py-2.5 text-sm text-text-primary">
          <Check size={16} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
          <span>{notice}</span>
        </div>
      ) : null}
      {error ? (
        <div role="alert" className="mb-5 flex items-start gap-2 rounded-sm border border-error/35 bg-error-soft/60 px-3 py-2.5 text-sm text-text-primary">
          <CircleAlert size={16} className="mt-0.5 shrink-0 text-error" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-md border border-border bg-surface-elevated">
        <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
          <span className="grid size-9 shrink-0 place-items-center rounded-sm border border-border bg-surface-2 text-text-secondary">
            <ShieldCheck size={17} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">Your Labs identity</h2>
            <p className="mt-1 text-xs leading-5 text-text-secondary">All connected methods open this account and its existing Labs data.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Mail size={14} className="text-text-tertiary" aria-hidden="true" />
              <span className="break-all text-sm">{email}</span>
              <span className="inline-flex items-center gap-1 rounded-sm border border-success/30 bg-success-soft/50 px-1.5 py-0.5 text-[10px] font-medium text-success">
                <Check size={11} aria-hidden="true" /> Verified
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Sign-in methods</h2>
              <p className="mt-1 text-xs text-text-secondary">Connect a provider using the same verified email address.</p>
            </div>
            <span className="shrink-0 rounded-sm border border-border bg-surface-2 px-2 py-1 text-[10px] tabular-nums text-text-secondary">
              {loading ? "…" : `${accounts.length} connected`}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-5 text-sm text-text-secondary">
              <LoaderCircle size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
              Loading sign-in methods…
            </div>
          ) : (
            <div className="divide-y divide-border">
              {accounts.map((account) => {
                const provider = PROVIDERS[account.providerId];
                const Icon = provider?.Icon || LockKeyhole;
                const isSocial = account.providerId === "google" || account.providerId === "github";
                const canDisconnect = isSocial && accounts.length > 1;

                return (
                  <div key={account.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-1 last:pb-1">
                    <span className="grid size-9 shrink-0 place-items-center rounded-sm border border-border bg-surface-2 text-text-secondary">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{getProviderLabel(account.providerId)}</p>
                      <p className="mt-0.5 text-xs text-text-tertiary">
                        {account.providerId === "credential" ? "Password-based sign-in" : "Connected to this Labs account"}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                      <Check size={13} aria-hidden="true" /> Connected
                    </span>
                    {canDisconnect ? (
                      <button
                        type="button"
                        onClick={() => disconnectProvider(account)}
                        disabled={Boolean(pendingAccount)}
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-sm border border-border px-2.5 text-xs text-text-secondary transition-colors hover:border-error/35 hover:bg-error-soft/40 hover:text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50"
                      >
                        {pendingAccount === account.id ? (
                          <LoaderCircle size={13} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                        ) : (
                          <Unlink size={13} aria-hidden="true" />
                        )}
                        Disconnect
                      </button>
                    ) : null}
                  </div>
                );
              })}
              {accounts.length === 0 ? (
                <p className="py-4 text-sm text-text-secondary">No sign-in methods were returned for this account.</p>
              ) : null}
            </div>
          )}

          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-3 text-xs font-semibold text-text-primary">Add another sign-in method</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {["google", "github"].map((providerId) => {
                const provider = PROVIDERS[providerId];
                const enabled = providerId === "google" ? googleEnabled : githubEnabled;
                const connected = connectedProviders.has(providerId);
                const Icon = provider.Icon;

                return (
                  <button
                    key={providerId}
                    type="button"
                    onClick={() => connectProvider(providerId)}
                    disabled={!enabled || connected || loading || Boolean(pendingProvider)}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-sm border border-border px-3 text-left text-sm font-medium transition-[border-color,background-color,color] hover:border-brand/45 hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <Icon size={16} aria-hidden="true" />
                      {provider.action}
                    </span>
                    {pendingProvider === providerId ? (
                      <LoaderCircle size={15} className="shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    ) : connected ? (
                      <Check size={15} className="shrink-0 text-success" aria-hidden="true" />
                    ) : enabled ? (
                      <Link2 size={15} className="shrink-0 text-text-tertiary" aria-hidden="true" />
                    ) : (
                      <span className="text-[10px] text-text-tertiary">Unavailable</span>
                    )}
                  </button>
                );
              })}
            </div>
            {accounts.length <= 1 ? (
              <p className="mt-3 text-[11px] leading-5 text-text-tertiary">
                Keep at least one sign-in method connected. You cannot disconnect your only method.
              </p>
            ) : (
              <p className="mt-3 text-[11px] leading-5 text-text-tertiary">
                Disconnecting a provider will not delete your Labs account or its data.
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-text-tertiary">
        <LockKeyhole size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>For security, connect providers only while signed in. The provider email must match your verified Labs email.</p>
      </div>
    </main>
  );
}
