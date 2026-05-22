"use client";

// ============================================================
//  components/vault/Dashboard.tsx
// ------------------------------------------------------------
//  The unlocked vault UI. Self-contained: the add/edit modal and
//  the password generator live in this file, so there are no extra
//  component imports to wire up. Talks only to useVault().
//
//  Search runs client-side over DECRYPTED items (Fuse.js) — the
//  server never sees plaintext, so search can only happen here.
// ============================================================

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSpinner } from "react-icons/fa";
import Fuse from "fuse.js";
import {
  Lock,
  Plus,
  Search,
  Star,
  Copy,
  Check,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  KeyRound,
} from "lucide-react";
import { useVault } from "./VaultProvider";
import { POPULAR_SERVICES, SERVICE_MAP } from "@/lib/services";
import type { ServiceId } from "@/lib/services";
import type { DecryptedItem, VaultItemType, VaultSecret } from "@/lib/types";

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "favorites", label: "Favorites" },
  { key: "login", label: "Logins" },
  { key: "note", label: "Notes" },
  { key: "card", label: "Cards" },
  { key: "identity", label: "Identities" },
];

interface FormState {
  id: string | null;
  type: VaultItemType;
  service: ServiceId;
  customName: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  favorite: boolean;
}

const BLANK: FormState = {
  id: null,
  type: "login",
  service: "other",
  customName: "",
  title: "",
  username: "",
  password: "",
  url: "",
  notes: "",
  favorite: false,
};

const inputClass =
  "w-full px-3.5 py-2 bg-[#111111] border border-[#333333] text-[15px] text-gray-100 placeholder-gray-500 focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] focus:outline-none rounded-md transition-all";
const labelClass = "block text-[13px] font-medium text-gray-300 mb-1.5";

function displayName(item: DecryptedItem): string {
  if (item.secret.service === "other") {
    return item.secret.customName || item.secret.title;
  }
  return item.secret.title;
}

function ServiceChip({
  service,
  label,
}: {
  service: ServiceId;
  label: string;
}) {
  const color = SERVICE_MAP[service]?.color ?? "#6B7280";
  return (
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center text-[14px] font-bold text-white flex-shrink-0"
      style={{ background: color }}
    >
      {(label || "?").charAt(0).toUpperCase()}
    </div>
  );
}

export default function Dashboard() {
  const { items, addItem, updateItem, deleteItem, generate, lock } = useVault();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [copied, setCopied] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(BLANK);
  const [showFormPw, setShowFormPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: [
          "secret.title",
          "secret.username",
          "secret.url",
          "secret.customName",
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [items],
  );

  const visible = useMemo(() => {
    const base = query.trim()
      ? fuse.search(query.trim()).map((r) => r.item)
      : items;
    return base.filter((it) =>
      filter === "all"
        ? true
        : filter === "favorites"
          ? it.favorite
          : it.type === filter,
    );
  }, [query, fuse, items, filter]);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
  };

  const toggleFav = (item: DecryptedItem) =>
    updateItem(item.id, item.secret, { favorite: !item.favorite });

  const remove = async (id: string) => {
    await deleteItem(id);
    setConfirmDel(null);
  };

  const openAdd = () => {
    setForm(BLANK);
    setFormError(null);
    setShowFormPw(false);
    setModalOpen(true);
  };

  const openEdit = (item: DecryptedItem) => {
    setForm({
      id: item.id,
      type: item.type,
      service: item.secret.service,
      customName: item.secret.customName ?? "",
      title: item.secret.title,
      username: item.secret.username ?? "",
      password: item.secret.password ?? "",
      url: item.secret.url ?? "",
      notes: item.secret.notes ?? "",
      favorite: item.favorite,
    });
    setFormError(null);
    setShowFormPw(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(BLANK);
  };

  const save = async () => {
    setFormError(null);
    if (!form.title.trim()) return setFormError("Title is required.");
    setSaving(true);
    try {
      const secret: VaultSecret = {
        service: form.service,
        title: form.title.trim(),
        ...(form.service === "other" && form.customName.trim()
          ? { customName: form.customName.trim() }
          : {}),
        ...(form.username.trim() ? { username: form.username.trim() } : {}),
        ...(form.password ? { password: form.password } : {}),
        ...(form.url.trim() ? { url: form.url.trim() } : {}),
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      };
      if (form.id)
        await updateItem(form.id, secret, { favorite: form.favorite });
      else await addItem(secret, form.type);
      closeModal();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-20 text-gray-100 selection:bg-[#0078D4] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#050505]/90 backdrop-blur border-b border-[#1f1f1f]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <KeyRound className="w-5 h-5 text-[#0078D4]" />
            <span className="hidden sm:inline">Vault</span>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vault…"
              className={`${inputClass} pl-9`}
            />
          </div>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 py-2 px-4 text-[14px] font-semibold bg-[#0078D4] hover:bg-[#006abc] text-white rounded-full transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>

          <button
            onClick={lock}
            title="Lock vault"
            className="p-2 text-gray-400 hover:text-white border border-[#333] rounded-full transition-all"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="max-w-5xl mx-auto px-6 pb-3 flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 text-[13px] rounded-full whitespace-nowrap transition-all border ${
                filter === f.key
                  ? "bg-[#0078D4]/15 border-[#0078D4]/50 text-[#4aa3e0]"
                  : "border-[#222] text-gray-400 hover:text-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {/* List */}
      <main className="max-w-5xl mx-auto px-6 py-6">
        {visible.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#111] border border-[#222] flex items-center justify-center text-gray-500">
              <KeyRound className="w-6 h-6" />
            </div>
            <p className="text-gray-300 font-medium">
              {items.length === 0 ? "Your vault is empty" : "No matching items"}
            </p>
            <p className="text-[13px] text-gray-500 mt-1">
              {items.length === 0
                ? "Add your first password to get started."
                : "Try a different search or filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {visible.map((item) => {
              const name = displayName(item);
              const isRevealed = !!revealed[item.id];
              return (
                <div
                  key={item.id}
                  className="group flex items-center gap-3 p-3.5 bg-[#0c0c0c] border border-[#1f1f1f] hover:border-[#333] rounded-xl transition-all"
                >
                  <ServiceChip service={item.secret.service} label={name} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-medium text-gray-100 truncate">
                        {name}
                      </span>
                      {item.favorite && (
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                      )}
                    </div>
                    {item.secret.username && (
                      <span className="text-[13px] text-gray-500 truncate block">
                        {item.secret.username}
                      </span>
                    )}
                    {isRevealed && item.secret.password && (
                      <span className="text-[13px] font-mono text-[#4aa3e0] break-all block mt-0.5">
                        {item.secret.password}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {item.secret.username && (
                      <IconBtn
                        title="Copy username"
                        onClick={() =>
                          copy(item.secret.username!, `${item.id}:u`)
                        }
                      >
                        {copied === `${item.id}:u` ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </IconBtn>
                    )}
                    {item.secret.password && (
                      <>
                        <IconBtn
                          title={isRevealed ? "Hide password" : "Show password"}
                          onClick={() =>
                            setRevealed((r) => ({
                              ...r,
                              [item.id]: !r[item.id],
                            }))
                          }
                        >
                          {isRevealed ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </IconBtn>
                        <IconBtn
                          title="Copy password"
                          onClick={() =>
                            copy(item.secret.password!, `${item.id}:p`)
                          }
                        >
                          {copied === `${item.id}:p` ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </IconBtn>
                      </>
                    )}
                    <IconBtn title="Favorite" onClick={() => toggleFav(item)}>
                      <Star
                        className={`w-4 h-4 ${
                          item.favorite ? "text-amber-400 fill-amber-400" : ""
                        }`}
                      />
                    </IconBtn>
                    <IconBtn title="Edit" onClick={() => openEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </IconBtn>

                    {confirmDel === item.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => remove(item.id)}
                          className="text-[12px] px-2 py-1 rounded-md bg-red-600 hover:bg-red-500 text-white"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDel(null)}
                          className="text-[12px] px-2 py-1 rounded-md border border-[#333] text-gray-300"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <IconBtn
                        title="Delete"
                        onClick={() => setConfirmDel(item.id)}
                      >
                        <Trash2 className="w-4 h-4 hover:text-red-400" />
                      </IconBtn>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add / Edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[480px] bg-[#0a0a0a] border border-[#222] rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">
                  {form.id ? "Edit item" : "Add item"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-[13px] text-red-200">
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Type</label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          type: e.target.value as VaultItemType,
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="login">Login</option>
                      <option value="note">Secure note</option>
                      <option value="card">Card</option>
                      <option value="identity">Identity</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Service</label>
                    <select
                      value={form.service}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          service: e.target.value as ServiceId,
                        }))
                      }
                      className={inputClass}
                    >
                      {POPULAR_SERVICES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {form.service === "other" && (
                  <div>
                    <label className={labelClass}>Service name</label>
                    <input
                      value={form.customName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, customName: e.target.value }))
                      }
                      className={inputClass}
                      placeholder="e.g. My Local Bank"
                    />
                  </div>
                )}

                <div>
                  <label className={labelClass}>Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="e.g. Personal Gmail"
                  />
                </div>

                {form.type === "login" && (
                  <>
                    <div>
                      <label className={labelClass}>Username / email</label>
                      <input
                        value={form.username}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, username: e.target.value }))
                        }
                        className={inputClass}
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Password</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showFormPw ? "text" : "password"}
                            value={form.password}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                password: e.target.value,
                              }))
                            }
                            className={`${inputClass} pr-10 font-mono`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowFormPw((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-200"
                          >
                            {showFormPw ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              password: generate({ length: 20 }),
                            }))
                          }
                          title="Generate strong password"
                          className="px-3 flex items-center gap-1.5 text-[13px] bg-[#111] border border-[#333] hover:bg-[#1a1a1a] rounded-md text-gray-200"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Website</label>
                      <input
                        value={form.url}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, url: e.target.value }))
                        }
                        className={inputClass}
                        placeholder="https://example.com"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className={labelClass}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    rows={3}
                    className={`${inputClass} resize-none`}
                    placeholder="Anything else to remember…"
                  />
                </div>

                <button
                  onClick={save}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-2.5 font-semibold text-[14px] bg-[#0078D4] hover:bg-[#006abc] text-white rounded-full transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <FaSpinner className="animate-spin w-5 h-5" />
                  ) : form.id ? (
                    "Save changes"
                  ) : (
                    "Add to vault"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IconBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition-all"
    >
      {children}
    </button>
  );
}
