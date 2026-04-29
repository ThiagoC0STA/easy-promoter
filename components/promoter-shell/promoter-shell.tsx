"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  LogOut,
  Plus,
  Search,
  Settings,
  Shield,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { FocusMode } from "@/components/promoter-shell/focus-mode";
import { touchContactByIdAction } from "@/lib/contacts/actions";
import type { EnrichedContact } from "@/lib/contacts/queue";

type Props = {
  email: string;
  displayName: string;
  initials: string;
  role: "promoter" | "super_admin" | null;
  queueCount: number;
  birthdaysCount: number;
  rescueCount: number;
  contactsCount: number;
  focusQueue: EnrichedContact[];
  focusBirthdays: EnrichedContact[];
  focusRescue: EnrichedContact[];
  focusAll: EnrichedContact[];
  children: React.ReactNode;
};

type FocusPreset = "all" | "vip-cold" | "birthdays" | "rescue";

type CmdItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  kbd?: string;
  group: "Navegar" | "Ações";
  href?: string;
  event?: string;
};

export function PromoterShell({
  email,
  displayName,
  initials,
  role,
  queueCount,
  contactsCount,
  focusQueue,
  focusBirthdays,
  focusRescue,
  focusAll,
  children,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const openNewContact = React.useCallback(() => {
    router.push("/app/contacts?novo=1", { scroll: false });
  }, [router]);

  const [focusOpen, setFocusOpen] = React.useState(false);
  const [focusPreset, setFocusPreset] = React.useState<FocusPreset>("all");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const focusContacts = React.useMemo<EnrichedContact[]>(() => {
    if (focusPreset === "vip-cold") {
      return focusAll.filter(
        (c) =>
          c.segments?.includes("gasta_bem") &&
          c.daysSince !== null &&
          c.daysSince >= 14,
      );
    }
    if (focusPreset === "birthdays") return focusBirthdays;
    if (focusPreset === "rescue") return focusRescue;
    return focusQueue.length > 0 ? focusQueue : focusBirthdays;
  }, [focusPreset, focusQueue, focusBirthdays, focusRescue, focusAll]);

  React.useEffect(() => {
    const onOpenFocus = (e: Event) => {
      const ce = e as CustomEvent<{ preset?: FocusPreset }>;
      setFocusPreset(ce.detail?.preset ?? "all");
      setFocusOpen(true);
    };
    window.addEventListener("ep:open-focus", onOpenFocus as EventListener);
    return () =>
      window.removeEventListener("ep:open-focus", onOpenFocus as EventListener);
  }, []);

  React.useEffect(() => {
    const onOpenNew = () => openNewContact();
    window.addEventListener("ep:open-new-contact", onOpenNew as EventListener);
    return () =>
      window.removeEventListener(
        "ep:open-new-contact",
        onOpenNew as EventListener,
      );
  }, [openNewContact]);

  async function markDone(c: EnrichedContact) {
    if (busyId) return;
    setBusyId(c.id);
    try {
      const res = await touchContactByIdAction(c.id);
      if (!res.ok) {
        alert(res.message);
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  const isActive = React.useCallback(
    (path: string, exact = false) => {
      if (exact) return pathname === path;
      return pathname === path || pathname.startsWith(path + "/");
    },
    [pathname],
  );

  const [cmdOpen, setCmdOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement | null;
      const inField = !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (isMeta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      } else if (e.key === "Escape" && cmdOpen) {
        setCmdOpen(false);
      } else if (!inField && !isMeta && e.key.toLowerCase() === "f") {
        window.dispatchEvent(new CustomEvent("ep:open-focus"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cmdOpen]);

  React.useEffect(() => {
    const onOpen = () => setCmdOpen(true);
    window.addEventListener("ep:open-cmdk", onOpen as EventListener);
    return () =>
      window.removeEventListener("ep:open-cmdk", onOpen as EventListener);
  }, []);

  const items: CmdItem[] = React.useMemo(
    () => [
      {
        id: "go-app",
        label: "Ir para Hoje",
        icon: <Zap size={14} />,
        kbd: "G H",
        group: "Navegar",
        href: "/app",
      },
      {
        id: "go-contacts",
        label: "Ir para Contatos",
        icon: <Users size={14} />,
        kbd: "G C",
        group: "Navegar",
        href: "/app/contacts",
      },
      {
        id: "go-perfil",
        label: "Meu perfil",
        icon: <Settings size={14} />,
        kbd: "G P",
        group: "Navegar",
        href: "/app/perfil",
      },
      ...(role === "super_admin"
        ? [
            {
              id: "go-admin",
              label: "Ir para Operação (admin)",
              icon: <Shield size={14} />,
              kbd: "G A",
              group: "Navegar" as const,
              href: "/admin",
            },
          ]
        : []),
      {
        id: "focus",
        label: "Entrar em modo foco",
        icon: <Target size={14} />,
        kbd: "F",
        group: "Ações",
        event: "ep:open-focus",
      },
      {
        id: "new-contact",
        label: "Novo contato",
        icon: <Plus size={14} />,
        kbd: "C",
        group: "Ações",
        event: "ep:open-new-contact",
      },
    ],
    [role],
  );

  const [q, setQ] = React.useState("");
  const filtered = React.useMemo(
    () =>
      items.filter(
        (it) => !q || it.label.toLowerCase().includes(q.toLowerCase()),
      ),
    [items, q],
  );
  const groups = React.useMemo(() => {
    const map = new Map<CmdItem["group"], CmdItem[]>();
    for (const it of filtered) {
      const arr = map.get(it.group) ?? [];
      arr.push(it);
      map.set(it.group, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const runItem = (it: CmdItem) => {
    setCmdOpen(false);
    setQ("");
    if (it.href) router.push(it.href);
    else if (it.event) window.dispatchEvent(new CustomEvent(it.event));
  };

  return (
    <div className="dark promoter-shell">
      <div className="ps-app">
        <aside className="ps-sidebar">
          <div className="ps-sb-top">
            <div className="ps-sb-logo">EP</div>
            <div className="ps-sb-name">Easy Promoter</div>
          </div>

          <button
            type="button"
            className="ps-sb-search"
            onClick={() => setCmdOpen(true)}
          >
            <Search size={13} strokeWidth={1.75} />
            <span>Buscar e ações…</span>
            <span className="ps-kbd">⌘K</span>
          </button>

          <div className="ps-sb-section">Promoter</div>
          <Link
            href="/app"
            className={`ps-nav-item ${isActive("/app", true) ? "active" : ""}`}
          >
            <Zap className="ps-nav-icon" size={15} strokeWidth={1.6} />
            <span>Hoje</span>
            {queueCount > 0 ? (
              <span className="ps-nav-count mono">{queueCount}</span>
            ) : null}
          </Link>
          <Link
            href="/app/contacts"
            className={`ps-nav-item ${
              isActive("/app/contacts") ? "active" : ""
            }`}
          >
            <Users className="ps-nav-icon" size={15} strokeWidth={1.6} />
            <span>Contatos</span>
            <span className="ps-nav-count mono">{contactsCount}</span>
          </Link>
          <button
            type="button"
            className="ps-nav-item"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("ep:open-focus"))
            }
          >
            <Target className="ps-nav-icon" size={15} strokeWidth={1.6} />
            <span>Modo foco</span>
            <span className="ps-kbd" style={{ marginLeft: "auto" }}>F</span>
          </button>

          {role === "super_admin" && (
            <>
              <div className="ps-sb-section">Admin</div>
              <Link
                href="/admin"
                className={`ps-nav-item ${isActive("/admin") ? "active" : ""}`}
              >
                <Shield className="ps-nav-icon" size={15} strokeWidth={1.6} />
                <span>Operação</span>
              </Link>
            </>
          )}

          <div className="ps-sb-section">Conta</div>
          <Link
            href="/app/perfil"
            className={`ps-nav-item ${isActive("/app/perfil") ? "active" : ""}`}
          >
            <Settings className="ps-nav-icon" size={15} strokeWidth={1.6} />
            <span>Meu perfil</span>
          </Link>

          <div className="ps-sb-foot">
            <Link href="/app/perfil" className="ps-sb-user" title={email}>
              <div className="ps-avatar">{initials || "??"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="name">{displayName || email}</div>
                <div className="role">
                  {role === "super_admin" ? "Super admin" : "Promoter"}
                </div>
              </div>
              <ChevronRight size={14} style={{ color: "var(--ps-ink-3)" }} />
            </Link>
            <form
              action="/api/auth/signout"
              method="post"
              style={{ marginTop: 4 }}
            >
              <button
                type="submit"
                className="ps-nav-item"
                style={{ color: "var(--ps-ink-3)" }}
                title="Sair"
              >
                <LogOut className="ps-nav-icon" size={15} strokeWidth={1.6} />
                <span>Sair</span>
              </button>
            </form>
          </div>
        </aside>

        <div className="ps-main">
          <div className="ps-topbar">
            <Crumb pathname={pathname} />
            <div style={{ flex: 1 }} />
            <button
              type="button"
              className="ps-tb-btn new"
              onClick={openNewContact}
            >
              <Plus size={13} strokeWidth={2} />
              Novo contato
            </button>
          </div>

          <main style={{ flex: 1, overflowY: "auto" }}>{children}</main>
        </div>
      </div>

      {cmdOpen && (
        <div
          className="ps-cmd-overlay"
          onClick={() => setCmdOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="ps-cmd" onClick={(e) => e.stopPropagation()}>
            <div className="ps-cmd-input">
              <Search size={15} strokeWidth={1.75} />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar ações, navegar…"
              />
              <span className="ps-kbd">esc</span>
            </div>
            <div className="ps-cmd-list">
              {groups.length === 0 && (
                <div
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "var(--ps-ink-3)",
                  }}
                >
                  Nada encontrado.
                </div>
              )}
              {groups.map(([group, list]) => (
                <div key={group}>
                  <div className="ps-cmd-group">{group}</div>
                  {list.map((it) => (
                    <button
                      key={it.id}
                      className="ps-cmd-item"
                      onClick={() => runItem(it)}
                      type="button"
                    >
                      <span
                        style={{
                          color: "var(--ps-ink-3)",
                          display: "grid",
                          placeItems: "center",
                          width: 18,
                        }}
                      >
                        {it.icon}
                      </span>
                      <span>{it.label}</span>
                      {it.kbd && (
                        <span
                          className="ps-kbd"
                          style={{ marginLeft: "auto" }}
                        >
                          {it.kbd}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="ps-cmd-foot">
              <span>
                <span className="ps-kbd">↑↓</span> navegar
              </span>
              <span>
                <span className="ps-kbd">↵</span> abrir
              </span>
              <span style={{ marginLeft: "auto" }}>
                <span className="ps-kbd">⌘K</span> alternar
              </span>
            </div>
          </div>
        </div>
      )}

      {focusOpen && (
        <FocusMode
          contacts={focusContacts}
          onExit={() => setFocusOpen(false)}
          onMark={markDone}
          busyId={busyId}
        />
      )}
    </div>
  );
}

function Crumb({ pathname }: { pathname: string }) {
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((s, i, arr) => {
      const path = "/" + arr.slice(0, i + 1).join("/");
      return { label: humanize(s), path };
    });
  if (segments.length === 0) {
    return (
      <div className="ps-crumb">
        <span className="here">Hoje</span>
      </div>
    );
  }
  return (
    <div className="ps-crumb">
      {segments.map((s, i) => (
        <React.Fragment key={s.path}>
          {i > 0 && <span className="sep">/</span>}
          {i === segments.length - 1 ? (
            <span className="here">{s.label}</span>
          ) : (
            <Link
              href={s.path}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {s.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function humanize(s: string): string {
  if (s === "app") return "Hoje";
  if (s === "contacts") return "Contatos";
  if (s === "perfil") return "Perfil";
  if (s === "admin") return "Admin";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
