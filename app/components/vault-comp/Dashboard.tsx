"use client";

// ============================================================
//  components/vault/Dashboard.tsx
// ------------------------------------------------------------
//  The unlocked vault UI. Self-contained: the add/edit modal and
//  the password generator live in this file.
//  Refactored for minimal, flat, utilitarian design.
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

// Utilitarian, flat CSS classes
const inputClass =
  "w-full px-3 py-2 bg-[#1C1B22] border-2 border-[#444444] text-[14px] text-[#FBFBFE] placeholder-[#737373] focus:outline-none rounded-xl transition-colors";
const labelClass = "block text-[15px] font-medium text-white mb-1.5";
const primaryBtn =
  "w-full flex items-center justify-center gap-2 py-2 px-4 font-medium text-[14px] bg-blue-800 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

// Ultra-fast transition settings
const fastFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
};

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
  const color = SERVICE_MAP[service]?.color ?? "white";
  return (
    <div
      className="w-10 h-10 rounded-2xl flex items-center justify-center text-[16px] font-bold text-black flex-shrink-0"
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

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastIdRef = useRef<number>(0);

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

  const showToast = useCallback((message: string) => {
    toastIdRef.current += 1;
    const currentId = toastIdRef.current;
    setToastMessage(message);
    setTimeout(() => {
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

      if (form.id) {
        await updateItem(form.id, secret, { favorite: form.favorite });
      } else {
        await addItem(secret, form.type);
      }

      closeModal();
      showToast(form.id ? "Changes saved" : "Saved to vault");
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#161923] pt-10 text-[#FBFBFE] selection:bg-[#0060DF] selection:text-white pb-20 overflow-x-hidden">
      {/* Structural Header */}
      <header className="sticky top-0 z-20 pt-10 bg-[#161923] border-b border-[#2B2A33]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto md:flex-1">
            <div className="flex items-center justify-center w-12 h-12 bg-green-700 rounded-2xl border border-[#2B2A33] text-white flex-shrink-0 hidden sm:flex">
              <KeyRound className="w-7 h-7" />
            </div>

            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 border-2 border-[#444444] text-[17px] text-white placeholder-gray-600  focus:outline-none rounded-2xl transition-colors"
              />
            </div>

            <button
              onClick={lock}
              title="Lock vault"
              className="px-2 py-2 bg-red-500 cursor-pointer text-white rounded-xl transition-colors flex-shrink-0"
            >
              <Lock className="w-6 h-6" />
            </button>

            <button
              onClick={openAdd}
              className="px-3 py-3 bg-[#0060DF] cursor-pointer text-white rounded-xl transition-colors flex-shrink-0 flex md:hidden items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div
              className="flex gap-2 overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 text-[15px] font-medium rounded-xl whitespace-nowrap transition-colors  cursor-pointer flex-shrink-0 border ${
                    filter === f.key
                      ? "bg-green-500/20 text-white border-green-400"
                      : "bg-transparent text-[#AEADC8] border-transparent hover:text-white "
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Desktop Add Button */}
            <button
              onClick={openAdd}
              className="hidden md:flex items-center gap-2 px-3 py-2 bg-[#0060DF] cursor-pointer text-white text-[15px] font-medium rounded-xl transition-colors flex-shrink-0"
            >
              <Plus className="w-5 h-5" />
              Add Credentials
            </button>
          </div>
        </div>
      </header>

      {/* Main Content List */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-green-500">
            <KeyRound className="w-13 h-13 mb-4 opacity-50" />
            <p className="text-[17px] font-medium text-white">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((item) => {
              const name = displayName(item);
              const isRevealed = !!revealed[item.id];
              return (
                <div
                  key={item.id}
                  className="flex flex-col p-4 bg-gray-900 border border-[#444444]  rounded-2xl transition-colors"
                >
                  <div className="flex items-start gap-3 w-full">
                    <ServiceChip service={item.secret.service} label={name} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 justify-between">
                        <span className="text-[15px] font-medium text-white truncate block">
                          {name}
                        </span>
                        {item.favorite && (
                          <Star className="w-3.5 h-3.5 text-[#FFE900] fill-[#FFE900] flex-shrink-0" />
                        )}
                      </div>

                      {item.secret.username && (
                        <span className="text-[13px] text-[#AEADC8] truncate block mt-0.5">
                          {item.secret.username}
                        </span>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isRevealed && item.secret.password && (
                      <motion.div
                        {...fastFade}
                        className="mt-3 px-4 py-2  w-max border-2 border-[#444444] rounded-xl"
                      >
                        <span
                          className="text-[14px]  text-
                        [#FBFBFE] break-all block"
                        >
                          {item.secret.password}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-1 mt-4 pt-3 border-t border-[#2B2A33]">
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
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </IconBtn>
                    )}
                    {item.secret.password && (
                      <>
                        <IconBtn
                          title={isRevealed ? "Hide Pass" : "Show Pass"}
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
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </IconBtn>
                      </>
                    )}

                    <div className="flex-1" />

                    <IconBtn title="Favorite" onClick={() => toggleFav(item)}>
                      <Star
                        className={`w-4 h-4 ${item.favorite ? "text-[#FFE900] fill-[#FFE900]" : ""}`}
                      />
                    </IconBtn>
                    <IconBtn title="Edit" onClick={() => openEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </IconBtn>

                    {confirmDel === item.id ? (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => remove(item.id)}
                          className="text-[12px] font-medium cursor-pointer px-2 py-1 rounded-full bg-red-500 text-white"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDel(null)}
                          className="text-[12px] font-medium px-2 py-1 cursor-pointer rounded-full bg-[#2B2A33] text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <IconBtn
                        title="Delete"
                        onClick={() => setConfirmDel(item.id)}
                      >
                        <Trash2 className="w-4 h-4 hover:text-[#E22850]" />
                      </IconBtn>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Utilitarian Form Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-40 pt-20 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/70"
              onClick={closeModal}
            />

            <motion.div
              {...fastFade}
              className="relative w-full max-w-[480px] bg-[#1C1B22] border border-[#2B2A33] rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 rounded-xl border-b border-[#2B2A33]">
                <h2 className="text-[16px] font-medium text-[#FBFBFE]">
                  {form.id ? "Edit Item" : "New Item"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-[#2B2A33] rounded text-[#AEADC8] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-4">
                {formError && (
                  <div className="p-3 bg-[#E22850]/10 border border-[#E22850]/50 rounded text-[13px] text-[#FFB3B3]">
                    {formError}
                  </div>
                )}

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
                      <option value="note">Secure Note</option>
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
                    <label className={labelClass}>Custom Service Name</label>
                    <input
                      value={form.customName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, customName: e.target.value }))
                      }
                      className={inputClass}
                      placeholder="e.g. Local Library"
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
                    placeholder="e.g. Personal Email"
                  />
                </div>

                {form.type === "login" && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Username / Email</label>
                      <input
                        value={form.username}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, username: e.target.value }))
                        }
                        className={inputClass}
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
                            className={`${inputClass} pr-8 `}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowFormPw((s) => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#737373] hover:text-white"
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
                          title="Generate Password"
                          className="px-3 bg-blue-800  rounded-xl text-white flex items-center justify-center transition-colors"
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
                        placeholder="https://"
                      />
                    </div>
                  </div>
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
                  />
                </div>
              </div>

              <div className="p-4 border-t border-[#2B2A33] bg-[#1C1B22] rounded-b-md">
                <button onClick={save} disabled={saving} className={primaryBtn}>
                  {saving ? (
                    <FaSpinner className="animate-spin w-4 h-4" />
                  ) : form.id ? (
                    "Save Changes"
                  ) : (
                    "Save Item"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Utilitarian Global Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            // 1. Smooth, "Heavy" Spring Animation
            initial={{ opacity: 0, y: 50, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 25,
              mass: 1.2, // Adds a slight feeling of "weight"
            }}
            // 2. Robust Centering Wrapper (Prevents transform conflicts)
            className="fixed bottom-6 left-0 right-0 z-50 mx-auto flex justify-center pointer-events-none px-4 sm:px-6"
          >
            {/* 3. Responsive Toast Container */}
            <div className="bg-[#1C1B22] text-[#FBFBFE] px-5 py-3 sm:px-6 sm:py-3.5 flex items-center gap-3 rounded-full border border-[#2B2A33] shadow-2xl text-[15px] sm:text-[16px] font-medium w-full sm:w-auto max-w-[420px]">
              <Check
                className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0"
                strokeWidth={2.5}
              />
              <span className="truncate">{toastMessage}</span>
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
      className="p-1.5 rounded-lg cursor-pointer text-green-500  hover:bg-[#2B2A33] transition-colors flex items-center justify-center"
    >
      {children}
    </button>
  );
}
