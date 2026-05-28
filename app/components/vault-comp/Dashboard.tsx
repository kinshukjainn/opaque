"use client";

// ============================================================
//  components/vault/Dashboard.tsx
// ------------------------------------------------------------
//  The unlocked vault UI. Self-contained: the add/edit modal and
//  the password generator live in this file.
// ============================================================

import { useState, useMemo, useRef, useCallback } from "react";
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

// Material You / Pixel Styled Inputs
const inputClass =
  "w-full px-4 py-3.5 bg-[#1E1F20] border-none text-[16px] text-[#E2E2E2] placeholder-[#8E918F] focus:bg-[#282A2C] focus:ring-2 focus:ring-[#A8C7FA] focus:outline-none rounded-3xl transition-all";
const labelClass = "block text-[14px] font-medium text-[#C4C7C5] mb-2 pl-2";

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
  const color = SERVICE_MAP[service]?.color ?? "#444746";
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-[18px] font-bold text-white flex-shrink-0 shadow-sm"
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

  // Toast State using useRef to satisfy ESLint purity and unused-var rules
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastIdRef = useRef<number>(0);

  // Modal
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

  // Pixel-style Toast Trigger
  const showToast = useCallback((message: string) => {
    toastIdRef.current += 1;
    const currentId = toastIdRef.current;
    setToastMessage(message);

    setTimeout(() => {
      // Only clear if a newer toast hasn't been triggered
      if (toastIdRef.current === currentId) {
        setToastMessage(null);
      }
    }, 2500);
  }, []);

  const copy = async (text: string, key: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    showToast(`${label} copied`);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
  };

  const toggleFav = (item: DecryptedItem) => {
    updateItem(item.id, item.secret, { favorite: !item.favorite });
    showToast(item.favorite ? "Removed from favorites" : "Added to favorites");
  };

  const remove = async (id: string) => {
    await deleteItem(id);
    setConfirmDel(null);
    showToast("Item deleted");
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

      const isEdit = !!form.id;
      if (form.id) {
        await updateItem(form.id, secret, { favorite: form.favorite });
      } else {
        await addItem(secret, form.type);
      }

      closeModal();
      showToast(isEdit ? "Changes saved" : "Saved to vault");
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen  bg-[#000000] pt-20 text-[#E2E2E2] selection:bg-[#A8C7FA] selection:text-[#041E49] pb-24 md:pb-6 font-sans overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#000000]/80 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-3 flex flex-col gap-4">
          {/* Top Bar */}
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center justify-center w-11 h-11 bg-[#1E1F20] rounded-full text-[#A8C7FA] flex-shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>

            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8E918F]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search vault…"
                className="w-full pl-11 pr-4 py-3 bg-[#1E1F20] text-[16px] text-[#E2E2E2] placeholder-[#8E918F] focus:bg-[#282A2C] focus:ring-2 focus:ring-[#A8C7FA] focus:outline-none rounded-full transition-all"
              />
            </div>

            <button
              onClick={lock}
              title="Lock vault"
              className="p-3.5 bg-[#1E1F20] hover:bg-[#282A2C] text-[#C4C7C5] rounded-full transition-all flex-shrink-0 active:scale-95"
            >
              <Lock className="w-5 h-5" />
            </button>
          </div>

          {/* Filters (Horizontal Scroll) */}
          <div
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <AnimatePresence mode="popLayout">
              {FILTERS.map((f) => (
                <motion.button
                  layout
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-5 py-2 text-[14px] font-medium rounded-full whitespace-nowrap transition-all flex-shrink-0 ${
                    filter === f.key
                      ? "bg-[#A8C7FA] text-[#041E49]"
                      : "bg-[#1E1F20] text-[#C4C7C5] hover:bg-[#282A2C] hover:text-[#E2E2E2]"
                  }`}
                >
                  {f.label}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Floating Action Button (Mobile & Desktop) */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-3 h-16 px-6 bg-[#A8C7FA] text-[#041E49] hover:bg-[#b9d3fc] shadow-[0_4px_14px_0_rgba(168,199,250,0.3)] rounded-[20px] transition-all transform hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-6 h-6" />
          <span className="font-semibold text-[15px] hidden sm:block">
            Add Item
          </span>
        </button>
      </div>

      {/* List */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <AnimatePresence mode="wait">
          {visible.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-20 h-20 mb-6 rounded-full bg-[#1E1F20] flex items-center justify-center text-[#A8C7FA]">
                <KeyRound className="w-8 h-8" />
              </div>
              <p className="text-[#E2E2E2] text-xl font-medium">
                {items.length === 0
                  ? "Your vault is empty"
                  : "No matching items"}
              </p>
              <p className="text-[15px] text-[#8E918F] mt-2">
                {items.length === 0
                  ? "Tap the + button to store a new password."
                  : "Try a different search or filter."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <AnimatePresence>
                {visible.map((item) => {
                  const name = displayName(item);
                  const isRevealed = !!revealed[item.id];
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                      key={item.id}
                      className="group flex items-start gap-4 p-5 bg-[#131314] hover:bg-[#1E1F20] border border-transparent hover:border-[#282A2C] rounded-[28px] transition-all overflow-hidden"
                    >
                      <ServiceChip service={item.secret.service} label={name} />

                      <div className="min-w-0 flex-1 mt-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[17px] font-medium text-[#E2E2E2] truncate">
                            {name}
                          </span>
                          {item.favorite && (
                            <Star className="w-4 h-4 text-[#F9BC05] fill-[#F9BC05] flex-shrink-0" />
                          )}
                        </div>
                        {item.secret.username && (
                          <span className="text-[14px] text-[#A8C7FA] truncate block mt-0.5">
                            {item.secret.username}
                          </span>
                        )}

                        <AnimatePresence>
                          {isRevealed && item.secret.password && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{
                                opacity: 1,
                                height: "auto",
                                marginTop: 10,
                              }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              className="p-3 bg-[#1E1F20] rounded-2xl overflow-hidden"
                            >
                              <span className="text-[12px] text-[#8E918F] uppercase tracking-wider font-semibold block mb-1">
                                Password
                              </span>
                              <span className="text-[15px] font-mono text-[#E2E2E2] break-all block">
                                {item.secret.password}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Action Bar inside item */}
                        <div className="flex items-center gap-1.5 mt-4 overflow-x-auto scrollbar-hide -ml-2">
                          {item.secret.username && (
                            <IconBtn
                              title="Copy User"
                              onClick={() =>
                                copy(
                                  item.secret.username!,
                                  `${item.id}:u`,
                                  "Username",
                                )
                              }
                            >
                              {copied === `${item.id}:u` ? (
                                <Check className="w-4 h-4 text-[#34A853]" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </IconBtn>
                          )}
                          {item.secret.password && (
                            <>
                              <IconBtn
                                title={isRevealed ? "Hide" : "Show"}
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
                                title="Copy Pass"
                                onClick={() =>
                                  copy(
                                    item.secret.password!,
                                    `${item.id}:p`,
                                    "Password",
                                  )
                                }
                              >
                                {copied === `${item.id}:p` ? (
                                  <Check className="w-4 h-4 text-[#34A853]" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </IconBtn>
                            </>
                          )}
                          <IconBtn
                            title="Favorite"
                            onClick={() => toggleFav(item)}
                          >
                            <Star
                              className={`w-4 h-4 ${item.favorite ? "text-[#F9BC05] fill-[#F9BC05]" : ""}`}
                            />
                          </IconBtn>
                          <IconBtn title="Edit" onClick={() => openEdit(item)}>
                            <Pencil className="w-4 h-4" />
                          </IconBtn>

                          {confirmDel === item.id ? (
                            <motion.div
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-1.5 ml-auto"
                            >
                              <button
                                onClick={() => remove(item.id)}
                                className="text-[13px] font-medium px-4 py-1.5 rounded-full bg-[#F2B8B5] text-[#601410] active:scale-95 transition-transform"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDel(null)}
                                className="text-[13px] font-medium px-4 py-1.5 rounded-full bg-[#282A2C] text-[#E2E2E2] active:scale-95 transition-transform"
                              >
                                Cancel
                              </button>
                            </motion.div>
                          ) : (
                            <div className="ml-auto">
                              <IconBtn
                                title="Delete"
                                onClick={() => setConfirmDel(item.id)}
                              >
                                <Trash2 className="w-4 h-4 hover:text-[#F2B8B5]" />
                              </IconBtn>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add / Edit modal (Bottom Sheet on Mobile, Centered on Desktop) */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[500px] pt-10 bg-[#131314] rounded-t-[32px] md:rounded-[32px] p-6 pb-10 md:pb-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-[#444746] rounded-full mx-auto mb-6 md:hidden" />

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#E2E2E2]">
                  {form.id ? "Edit item" : "New item"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 bg-[#1E1F20] hover:bg-[#282A2C] rounded-full text-[#C4C7C5] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <AnimatePresence>
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 bg-[#601410] rounded-2xl text-[14px] text-[#F2B8B5]"
                  >
                    {formError}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Type</label>
                    <div className="relative">
                      <select
                        value={form.type}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            type: e.target.value as VaultItemType,
                          }))
                        }
                        className={`${inputClass} appearance-none pr-10`}
                      >
                        <option value="login">Login</option>
                        <option value="note">Secure Note</option>
                        <option value="card">Card</option>
                        <option value="identity">Identity</option>
                      </select>
                    </div>
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
                      className={`${inputClass} appearance-none pr-10`}
                    >
                      {POPULAR_SERVICES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <AnimatePresence>
                  {form.service === "other" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className={labelClass}>Custom Service Name</label>
                      <input
                        value={form.customName}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, customName: e.target.value }))
                        }
                        className={inputClass}
                        placeholder="e.g. Local Library"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className={labelClass}>Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="e.g. Personal Email"
                  />
                </div>

                <AnimatePresence>
                  {form.type === "login" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-5"
                    >
                      <div>
                        <label className={labelClass}>Username / Email</label>
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
                              className={`${inputClass} pr-12 font-mono tracking-widest`}
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={() => setShowFormPw((s) => !s)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E918F] hover:text-[#E2E2E2] p-1"
                            >
                              {showFormPw ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
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
                            title="Generate robust password"
                            className="px-4 flex items-center justify-center bg-[#1E1F20] hover:bg-[#282A2C] rounded-3xl text-[#A8C7FA] transition-colors active:scale-95"
                          >
                            <RefreshCw className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Website URL</label>
                        <input
                          value={form.url}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, url: e.target.value }))
                          }
                          className={inputClass}
                          placeholder="https://example.com"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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

                <div className="pt-4 pb-2">
                  <button
                    onClick={save}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-4 font-medium text-[16px] bg-[#A8C7FA] hover:bg-[#b9d3fc] text-[#041E49] rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    {saving ? (
                      <FaSpinner className="animate-spin w-5 h-5" />
                    ) : form.id ? (
                      "Save Changes"
                    ) : (
                      "Save to Vault"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Toast Notification System */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-[#282A2C] text-[#E2E2E2] px-5 py-3 rounded-full text-[14px] font-medium shadow-[0_4px_14px_0_rgba(0,0,0,0.3)] border border-[#333537]">
              {toastMessage}
            </div>
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
      className="p-2.5 rounded-full text-[#C4C7C5] hover:text-[#E2E2E2] hover:bg-[#282A2C] transition-colors flex items-center justify-center active:scale-90"
    >
      {children}
    </button>
  );
}
