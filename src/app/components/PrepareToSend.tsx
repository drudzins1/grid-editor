import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Clock,
  Users,
  Mail,
  MapPin,
  Settings,
  Check,
  Plus,
  ChevronDown,
  CalendarDays,
} from "lucide-react";

interface PrepareToSendProps {
  onClose: () => void;
}

type SendMode = "now" | "later";

interface RecipientList {
  id: string;
  label: string;
  count: number;
  checked: boolean;
}

export function PrepareToSend({ onClose }: PrepareToSendProps) {
  const [sendMode, setSendMode] = useState<SendMode>("now");
  const [closing, setClosing] = useState(false);
  const [lists, setLists] = useState<RecipientList[]>([
    { id: "all", label: "All Contacts", count: 812, checked: true },
    { id: "my", label: "My lists", count: 240, checked: true },
    { id: "vip", label: "VIP Customers", count: 56, checked: false },
  ]);
  const [emailVerified, setEmailVerified] = useState(false);
  const [addressAdded, setAddressAdded] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [showContactInput, setShowContactInput] = useState(false);
  const [contactEmails, setContactEmails] = useState<string[]>([]);
  const [contactInputValue, setContactInputValue] = useState("");
  const contactInputRef = useRef<HTMLInputElement>(null);

  // Physical address editing
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressStreet, setAddressStreet] = useState("123 Main Street");
  const [addressCityStateZip, setAddressCityStateZip] = useState("San Francisco, CA 94102");

  // Email settings editing
  const [editingEmailSettings, setEditingEmailSettings] = useState(false);
  const [fromName, setFromName] = useState("Your Company");
  const [fromEmail, setFromEmail] = useState("hello@company.com");
  const [subjectLine, setSubjectLine] = useState("Check out our latest update!");

  const toggleList = (id: string) => {
    setLists((prev) =>
      prev.map((l) => (l.id === id ? { ...l, checked: !l.checked } : l))
    );
  };

  const totalRecipients = lists
    .filter((l) => l.checked)
    .reduce((sum, l) => sum + l.count, 0);

  const hasRecipients = totalRecipients > 0 || contactEmails.length > 0;
  const allComplete = emailVerified && addressAdded && hasRecipients;

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 200);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-end pr-4 pt-[70px] pointer-events-none" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Transparent click-catcher to close */}
      <div className="absolute inset-0 pointer-events-auto" onClick={handleClose} />
      {/* Panel */}
      <div className={`w-[420px] max-h-[calc(100vh-90px)] bg-white rounded-2xl border border-black/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.10),0_1px_3px_rgba(0,0,0,0.06)] overflow-y-auto flex flex-col ${closing ? 'animate-slide-out' : 'animate-slide-in'} pointer-events-auto relative`}>
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-[15px] text-gray-900">Prepare to send</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Complete the steps below to send your campaign
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-black/[0.04] transition-colors cursor-pointer"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex-1 px-6 py-5 flex flex-col gap-4">
          {/* ─── When to send ─── */}
          <Section icon={<Clock size={14} strokeWidth={1.8} />} title="When to send">
            <div className="flex gap-1 p-0.5 bg-black/[0.04] rounded-lg">
              <TabButton active={sendMode === "now"} onClick={() => setSendMode("now")}>
                Send now
              </TabButton>
              <TabButton active={sendMode === "later"} onClick={() => setSendMode("later")}>
                Schedule
              </TabButton>
            </div>
            {sendMode === "later" && (
              <div className="flex gap-2 mt-3">
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="flex-1 text-[12px] text-gray-700 bg-white border border-black/[0.08] rounded-lg px-3 py-2 outline-none focus:border-gray-300 transition-colors"
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-[110px] text-[12px] text-gray-700 bg-white border border-black/[0.08] rounded-lg px-3 py-2 outline-none focus:border-gray-300 transition-colors"
                />
              </div>
            )}
          </Section>

          {/* ─── Recipients ─── */}
          <Section icon={<Users size={14} strokeWidth={1.8} />} title="Recipients" badge={totalRecipients > 0 ? `${totalRecipients.toLocaleString()}` : undefined}>
            <div className="bg-white border border-black/[0.06] rounded-lg divide-y divide-black/[0.04]">
              {lists.map((list) => (
                <label
                  key={list.id}
                  className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer hover:bg-black/[0.02] transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                      list.checked
                        ? "bg-gray-900 text-white"
                        : "border border-gray-300 bg-white"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleList(list.id);
                    }}
                  >
                    {list.checked && <Check size={10} strokeWidth={3} />}
                  </div>
                  <span className="text-[13px] text-gray-700 flex-1">
                    {list.label}
                  </span>
                  <span className="text-[11px] text-gray-400 tabular-nums">
                    {list.count.toLocaleString()}
                  </span>
                </label>
              ))}
            </div>
            {showContactInput ? (
              <ContactEmailInput
                emails={contactEmails}
                inputValue={contactInputValue}
                inputRef={contactInputRef}
                onInputChange={setContactInputValue}
                onAddEmails={(newEmails) => {
                  setContactEmails((prev) => {
                    const unique = newEmails.filter((e) => !prev.includes(e));
                    return [...prev, ...unique];
                  });
                  setContactInputValue("");
                }}
                onRemoveEmail={(email) =>
                  setContactEmails((prev) => prev.filter((e) => e !== email))
                }
                onClose={() => {
                  if (contactEmails.length === 0) setShowContactInput(false);
                }}
              />
            ) : (
              <button
                onClick={() => {
                  setShowContactInput(true);
                  setTimeout(() => contactInputRef.current?.focus(), 0);
                }}
                className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 mt-2 transition-colors cursor-pointer"
              >
                <Plus size={13} strokeWidth={2} />
                Add contacts
              </button>
            )}
          </Section>

          {/* ─── Verify email ─── */}
          <Section
            icon={<Mail size={14} strokeWidth={1.8} />}
            title="Verify your email"
            complete={emailVerified}
          >
            <p className="text-[12px] text-gray-400 leading-relaxed">
              Check your inbox (<span className="text-gray-600">myemail@gmail.com</span>) for an
              email from Constant Contact.
            </p>
            {!emailVerified ? (
              <button
                onClick={() => setEmailVerified(true)}
                className="mt-2.5 text-[12px] text-gray-500 border border-black/[0.08] hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer hover:bg-white"
              >
                Send link
              </button>
            ) : (
              <div className="mt-2.5 flex items-center gap-1.5 text-[12px] text-green-600">
                <Check size={13} strokeWidth={2.5} />
                Verified
              </div>
            )}
          </Section>

          {/* ─── Physical address ─── */}
          <Section
            icon={<MapPin size={14} strokeWidth={1.8} />}
            title="Physical address"
            complete={addressAdded}
          >
            <p className="text-[12px] text-gray-400 leading-relaxed">
              Legally required to display in the footer of your email.
            </p>
            {!addressAdded ? (
              <button
                onClick={() => {
                  setAddressAdded(true);
                  setEditingAddress(true);
                }}
                className="mt-2.5 text-[12px] text-gray-500 border border-black/[0.08] hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer hover:bg-white"
              >
                Add address
              </button>
            ) : editingAddress ? (
              <div className="mt-2.5 space-y-2">
                <InlineInput label="Street" value={addressStreet} onChange={setAddressStreet} />
                <InlineInput label="City, State ZIP" value={addressCityStateZip} onChange={setAddressCityStateZip} />
                <button
                  onClick={() => setEditingAddress(false)}
                  className="mt-1 text-[12px] text-white bg-[#186DED] hover:bg-[#1560D4] active:bg-[#1254BB] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="mt-2.5 text-[12px] text-gray-500 leading-relaxed">
                <p>{addressStreet}</p>
                <p>{addressCityStateZip}</p>
                <button
                  onClick={() => setEditingAddress(true)}
                  className="mt-2.5 text-[12px] text-gray-500 border border-black/[0.08] hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer hover:bg-white"
                >
                  Edit
                </button>
              </div>
            )}
          </Section>

          {/* ─── Email settings ─── */}
          <Section
            icon={<Settings size={14} strokeWidth={1.8} />}
            title="Email settings"
            complete
          >
            {editingEmailSettings ? (
              <div className="space-y-2">
                <InlineInput label="From name" value={fromName} onChange={setFromName} />
                <InlineInput label="From email" value={fromEmail} onChange={setFromEmail} />
                <InlineInput label="Subject line" value={subjectLine} onChange={setSubjectLine} />
                <button
                  onClick={() => setEditingEmailSettings(false)}
                  className="mt-1 text-[12px] text-white bg-[#186DED] hover:bg-[#1560D4] active:bg-[#1254BB] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5 text-[12px] text-gray-400">
                  <div className="flex justify-between">
                    <span>From name</span>
                    <span className="text-gray-600">{fromName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>From email</span>
                    <span className="text-gray-600">{fromEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subject line</span>
                    <span className="text-gray-600 truncate ml-4 max-w-[200px]">{subjectLine}</span>
                  </div>
                </div>
                <button
                  onClick={() => setEditingEmailSettings(true)}
                  className="mt-2.5 text-[12px] text-gray-500 border border-black/[0.08] hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer hover:bg-white"
                >
                  Edit
                </button>
              </>
            )}
          </Section>
        </div>

        {/* Footer: Send button */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-black/[0.06] px-6 py-4 rounded-b-2xl">
          <button
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] tracking-wide transition-all cursor-pointer ${
              allComplete
                ? "bg-[#186DED] hover:bg-[#1560D4] active:bg-[#1254BB] text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!allComplete}
          >
            <Send size={14} strokeWidth={1.8} />
            {sendMode === "now" ? "Send now" : "Schedule send"}
          </button>
          <button className="w-full text-center text-[11px] text-gray-400 hover:text-gray-600 mt-2.5 transition-colors cursor-pointer">
            Send a test email
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(20px); opacity: 0; }
        }
        .animate-slide-in {
          animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-slide-out {
          animation: slideOut 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}

/* ─── Sub-components ─── */

function Section({
  icon,
  title,
  badge,
  complete,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  complete?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-black/[0.06] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-400">{icon}</span>
        <span className="text-[13px] text-gray-800 flex-1">{title}</span>
        {badge && (
          <span className="text-[10px] text-gray-400 bg-black/[0.04] px-2 py-0.5 rounded-full tabular-nums">
            {badge}
          </span>
        )}
        {complete && (
          <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
            <Check size={11} strokeWidth={2.5} className="text-green-500" />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-[12px] py-1.5 rounded-md transition-all cursor-pointer ${
        active
          ? "bg-white text-gray-800 shadow-sm"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}

function InlineInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-gray-400 w-[90px] shrink-0">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 text-[12px] text-gray-700 bg-white border border-black/[0.08] rounded-lg px-2.5 py-1.5 outline-none focus:border-gray-300 transition-colors"
      />
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ContactEmailInput({
  emails,
  inputValue,
  inputRef,
  onInputChange,
  onAddEmails,
  onRemoveEmail,
  onClose,
}: {
  emails: string[];
  inputValue: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onInputChange: (val: string) => void;
  onAddEmails: (emails: string[]) => void;
  onRemoveEmail: (email: string) => void;
  onClose: () => void;
}) {
  const parseAndAdd = (raw: string) => {
    const parsed = raw
      .split(/[,;\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => EMAIL_RE.test(s));
    if (parsed.length > 0) onAddEmails(parsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      parseAndAdd(inputValue);
    }
    if (e.key === "Backspace" && inputValue === "" && emails.length > 0) {
      onRemoveEmail(emails[emails.length - 1]);
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    parseAndAdd(pasted);
  };

  const handleBlur = () => {
    if (inputValue.trim()) parseAndAdd(inputValue);
  };

  return (
    <div className="mt-2">
      <div
        className="flex flex-wrap items-center gap-1.5 bg-white border border-black/[0.08] rounded-lg px-2.5 py-2 min-h-[36px] cursor-text focus-within:border-gray-300 transition-colors"
        onClick={() => inputRef.current?.focus()}
      >
        {emails.map((email) => (
          <span
            key={email}
            className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-[11px] pl-2 pr-1 py-0.5 rounded-md"
          >
            {email}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveEmail(email);
              }}
              className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={10} strokeWidth={2.5} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          placeholder={emails.length === 0 ? "name@example.com, ..." : ""}
          className="flex-1 min-w-[120px] text-[12px] text-gray-700 bg-transparent outline-none placeholder:text-gray-300"
        />
      </div>
      <p className="text-[10px] text-gray-300 mt-1.5 ml-0.5">
        Separate multiple emails with commas
      </p>
    </div>
  );
}