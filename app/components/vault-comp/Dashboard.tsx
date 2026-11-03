"use client";

// ============================================================
//  components/vault/Dashboard.tsx
// ------------------------------------------------------------
//  The unlocked vault UI. Self-contained: the add/edit modal and
//  the password generator live in this file.
//  Refactored for Material 3 Expressive, borderless design.
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

// Material 3 Expressive Spring Physics
const m3SpatialSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.9,
};

const m3FastSpring = {
  type: "spring" as const,
  stiffness: 550,
  damping: 35,
};

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All Cred" },
  { key: "favorites", label: "Favorites" },
  { key: "login", label: "Logins Cred" },
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

// Utilitarian, borderless CSS classes matching the Header theme
const inputClass =
  "w-full px-4 py-3.5 bg-[#EFF0F6] dark:bg-[#191B22] text-[15px] text-black dark:text-white placeholder-gray-500 dark:placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-[#D8E2FF] dark:focus:ring-[#1E3A5F] rounded-2xl transition-all duration-200 border-none";
const labelClass =
  "block text-[14px] font-semibold text-black dark:text-white mb-1.5 ml-1";
const primaryBtn =
  "w-full flex items-center justify-center gap-2 py-3.5 px-4 font-semibold text-[15px] tracking-tight bg-[#D8E2FF] dark:bg-[#1E3A5F] hover:bg-[#C2D3FF] dark:hover:bg-[#274975] text-[#001A41] dark:text-[#D8E2FF] rounded-[24px] active:rounded-[16px] transition-[border-radius,background-color,transform] duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-none";

const fastFade = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: m3FastSpring,
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
      className="w-11 h-11 rounded-[16px] flex items-center justify-center text-[17px] font-bold text-white flex-shrink-0 border-none shadow-sm"
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
    <div className="min-h-screen bg-white dark:bg-black pt-10 text-black dark:text-[#FBFBFE] selection:bg-[#0060DF] selection:text-white pb-20 overflow-x-hidden ">
      {/* Structural Header (Borderless) */}
      <header className="sticky top-0 z-20 pt-10 bg-white/80 dark:bg-black/80 backdrop-blur-xl transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto md:flex-1">
            <div className="relative flex-1 md:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search vault..."
                className="w-full pl-12 pr-4 py-3 bg-[#EFF0F6] dark:bg-[#191B22] text-[16px] text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D8E2FF] dark:focus:ring-[#1E3A5F] rounded-[24px] transition-all duration-200 border-none"
              />
            </div>

            <button
              onClick={lock}
              title="Lock vault"
              className="p-3 bg-[#EFF0F6] dark:bg-[#191B22] cursor-pointer text-black dark:text-white hover:bg-[#E2E4EC] dark:hover:bg-[#232630] rounded-[20px] active:rounded-[14px] transition-[border-radius,background-color,transform] duration-200 active:scale-[0.95] flex-shrink-0 border-none"
            >
              <Lock className="w-6 h-6 dark:fill-white fill-black" />
            </button>

            <button
              onClick={openAdd}
              className="px-3 py-3 bg-black dark:bg-white cursor-pointer text-white dark:text-black rounded-[20px] active:rounded-[14px] transition-[border-radius,background-color,transform] duration-200 active:scale-[0.95] flex-shrink-0 flex md:hidden items-center justify-center border-none"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide p-1 bg-[#EFF0F6] dark:bg-[#191B22] rounded-full">
              {FILTERS.map((f) => {
                const isActive = filter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`relative px-4 py-2 text-[14px] font-semibold tracking-tight rounded-full whitespace-nowrap transition-colors duration-150 cursor-pointer flex-shrink-0 select-none z-10 ${
                      isActive
                        ? "text-[#001A41] dark:text-[#D8E2FF]"
                        : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="dashboard-active-filter"
                        className="absolute inset-0 rounded-full bg-[#D8E2FF] dark:bg-[#1E3A5F] -z-10"
                        transition={m3SpatialSpring}
                      />
                    )}
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Desktop Add Button */}
            <button
              onClick={openAdd}
              className="hidden md:flex items-center gap-2 px-5 py-3 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 cursor-pointer text-white dark:text-black text-[14.5px] font-bold tracking-tight rounded-[24px] active:rounded-[16px] transition-[border-radius,background-color,transform] duration-200 active:scale-[0.97] flex-shrink-0 border-none"
            >
              <Plus className="w-5 h-5" />
              Add Credentials
            </button>
          </div>
        </div>
      </header>

      {/* Main Content List */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 bg-[#EFF0F6] dark:bg-[#191B22] rounded-full mb-6">
              <KeyRound className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-[22px] font-bold text-black dark:text-white tracking-tight">
              No items found
            </p>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or add a new credential.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((item) => {
              const name = displayName(item);
              const isRevealed = !!revealed[item.id];
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={m3SpatialSpring}
                  className="flex flex-col p-5 bg-[#EFF0F6] dark:bg-[#16181F] rounded-[28px] transition-colors border-none group"
                >
                  <div className="flex items-start gap-4 w-full">
                    <ServiceChip service={item.secret.service} label={name} />

                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex items-center gap-2 justify-between">
                        <span className="text-[16px] font-bold text-black dark:text-white truncate block tracking-tight">
                          {name}
                        </span>
                        {item.favorite && (
                          <Star className="w-4 h-4 text-[#D8E2FF] dark:text-[#1E3A5F] fill-[#D8E2FF] dark:fill-[#1E3A5F] flex-shrink-0" />
                        )}
                      </div>

                      {item.secret.username && (
                        <span className="text-[13.5px] font-medium text-gray-600 dark:text-gray-400 truncate block mt-1">
                          {item.secret.username}
                        </span>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isRevealed && item.secret.password && (
                      <motion.div
                        {...fastFade}
                        className="mt-4 px-4 py-3 bg-white/60 dark:bg-black/40 rounded-[20px] border-none"
                      >
                        <span className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                          Password
                        </span>
                        <span className="text-[15px]  text-black dark:text-[#D8E2FF] font-semibold break-all block">
                          {item.secret.password}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-1 mt-5 pt-4 mt-auto">
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
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
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
                            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </IconBtn>
                      </>
                    )}

                    <div className="flex-1" />

                    <IconBtn title="Favorite" onClick={() => toggleFav(item)}>
                      <Star
                        className={`w-4 h-4 transition-colors ${item.favorite ? "text-blue-500 fill-blue-500" : ""}`}
                      />
                    </IconBtn>
                    <IconBtn title="Edit" onClick={() => openEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </IconBtn>

                    {confirmDel === item.id ? (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => remove(item.id)}
                          className="text-[12px] font-bold cursor-pointer px-3 py-1.5 rounded-[12px] bg-red-500 text-white hover:bg-red-600 transition-colors border-none"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDel(null)}
                          className="text-[12px] font-bold px-3 py-1.5 cursor-pointer rounded-[12px] bg-gray-300 dark:bg-[#333] text-black dark:text-white hover:bg-gray-400 dark:hover:bg-[#444] transition-colors border-none"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <IconBtn
                        title="Delete"
                        onClick={() => setConfirmDel(item.id)}
                      >
                        <Trash2 className="w-4 h-4 hover:text-red-500 transition-colors" />
                      </IconBtn>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Borderless Form Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-40 pt-10 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            />

            <motion.div
              {...fastFade}
              className="relative w-full max-w-[500px] bg-white dark:bg-[#141414] rounded-[32px] shadow-2xl flex flex-col max-h-[85vh] border-none overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 pb-4">
                <h2 className="text-[20px] font-extrabold tracking-tight text-black dark:text-white">
                  {form.id ? "Edit Credentials" : "New Credentials"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 bg-[#EFF0F6] dark:bg-[#191B22] hover:bg-[#E2E4EC] dark:hover:bg-[#232630] rounded-full cursor-pointer text-black dark:text-white transition-colors border-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 pt-2 overflow-y-auto space-y-4">
                {formError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-[16px] text-[14px] font-medium border-none">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
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
                      <option value="login">Login/Signup</option>
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
                            className={`${inputClass} pr-10`}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowFormPw((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
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
                          className="px-4 bg-[#D8E2FF] dark:bg-[#1E3A5F] text-[#001A41] dark:text-[#D8E2FF] rounded-[20px] active:rounded-[14px] transition-[border-radius,background-color,transform] duration-200 active:scale-[0.95] flex items-center justify-center border-none"
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

              <div className="p-6 pt-2 bg-white dark:bg-[#141414]">
                <button onClick={save} disabled={saving} className={primaryBtn}>
                  {saving ? (
                    <FaSpinner className="animate-spin w-5 h-5" />
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

      {/* Utilitarian Global Toast (Borderless) */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={m3SpatialSpring}
            className="fixed bottom-6 left-0 right-0 z-50 mx-auto flex justify-center pointer-events-none px-4 sm:px-6"
          >
            <div className="bg-black dark:bg-white text-white dark:text-black px-6 py-3.5 flex items-center gap-3 rounded-full shadow-2xl text-[15px] font-semibold tracking-tight w-full sm:w-auto max-w-[420px] border-none">
              <Check className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
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
      className="p-2 rounded-full cursor-pointer text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-[#E2E4EC] dark:hover:bg-[#232630] active:scale-90 transition-all duration-200 flex items-center justify-center border-none"
    >
      {children}
    </button>
  );
}
