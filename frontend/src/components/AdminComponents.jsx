import {
  ShieldCheck,
  UserCog,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  Power,
  PenLine,
  RotateCcw,
  Trash2,
  Plus,
} from "lucide-react";

export const ROLE_CONFIG = {
  High: {
    color: "bg-purple-100 text-purple-700 border-purple-200",
    label: "عالي",
    icon: ShieldCheck,
  },
  Mid: {
    color: "bg-blue-100 text-blue-700 border-blue-200",
    label: "متوسط",
    icon: UserCog,
  },
  Low: {
    color: "bg-slate-100 text-slate-600 border-slate-200",
    label: "منخفض",
    icon: Users,
  },
};

export function StyledButton({
  children,
  onClick,
  disabled = false,
  variant = "default",
  icon: Icon,
  className = "",
}) {
  const variants = {
    default:
      "text-gray-600 hover:text-white bg-white hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-600 border border-gray-300 hover:border-gray-500",
    primary:
      "text-cyan-700 hover:text-white bg-white hover:bg-gradient-to-r hover:from-cyan-500 hover:to-cyan-600 border border-cyan-300 hover:border-cyan-500",
    danger:
      "text-red-600 hover:text-white bg-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 border border-red-300 hover:border-red-500",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none ${variants[variant]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function IconButton({
  onClick,
  disabled = false,
  variant = "default",
  title,
  icon: Icon,
  isLoading = false,
}) {
  const variants = {
    default:
      "text-slate-500 hover:text-white bg-white hover:bg-gradient-to-r hover:from-cyan-500 hover:to-cyan-600 border border-slate-200 hover:border-cyan-500",
    danger:
      "text-slate-500 hover:text-white bg-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 border border-slate-200 hover:border-red-500",
    success:
      "text-slate-500 hover:text-white bg-white hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 border border-slate-200 hover:border-green-500",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      title={title}
      className={`cursor-pointer inline-flex items-center justify-center p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${variants[variant]}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
    </button>
  );
}

export function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-3">
      <div className={`${color} p-2.5 rounded-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

export function AccountRow({
  account: a,
  isSlot,
  isRenaming,
  isLoading,
  renameValue,
  onRenameStart,
  onRenameSubmit,
  onRenameCancel,
  onRenameChange,
  onResetPassword,
  onChangeRole,
  onToggle,
  onDelete,
}) {
  const cfg = ROLE_CONFIG[a.role] || ROLE_CONFIG.Low;
  const Icon = cfg.icon;

  return (
    <div
      className={`group flex items-center gap-3 p-3 hover:bg-slate-50/80 transition-colors ${!a.enabled ? "opacity-60 bg-slate-50/50" : ""}`}
    >
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${a.enabled ? "bg-green-500" : "bg-red-400"}`}
      />
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={renameValue}
              onChange={(e) => onRenameChange(e.target.value)}
              className="flex-1 min-w-0 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") onRenameSubmit();
                if (e.key === "Escape") onRenameCancel();
              }}
            />
            <IconButton
              onClick={onRenameSubmit}
              variant="success"
              icon={CheckCircle2}
              isLoading={isLoading === "rename"}
            />
            <IconButton
              onClick={onRenameCancel}
              variant="danger"
              icon={XCircle}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm truncate">
              {a.username}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${cfg.color}`}
            >
              <Icon size={12} />
              {cfg.label}
            </span>
            {!a.enabled && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                <Power size={12} /> معطل
              </span>
            )}
          </div>
        )}
        {a.lastAccess && !isRenaming && (
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <span>آخر دخول:</span>
            <span dir="ltr" className="font-mono">
              {new Date(a.lastAccess)
                .toLocaleString("en-CA", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                .replace(/-/g, "/")}
            </span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <select
          value={a.role}
          onChange={(e) => onChangeRole(e.target.value)}
          disabled={isLoading === "role"}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white disabled:opacity-50 cursor-pointer hover:border-slate-300 transition-colors"
        >
          {(isSlot ? ["Mid", "Low"] : ["High", "Mid", "Low"]).map((r) => (
            <option key={r} value={r}>
              {ROLE_CONFIG[r].label}
            </option>
          ))}
        </select>

        {isSlot && !isRenaming && (
          <IconButton
            onClick={onRenameStart}
            icon={PenLine}
            title="تغيير الاسم"
          />
        )}
        {isSlot && (
          <IconButton
            onClick={onResetPassword}
            icon={RotateCcw}
            title="إعادة تعيين كلمة المرور"
            isLoading={isLoading === "reset"}
            variant="danger"
          />
        )}

        <button
          onClick={onToggle}
          disabled={isLoading === "toggle"}
          title={a.enabled ? "تعطيل الحساب" : "تفعيل الحساب"}
          className={`cursor-pointer inline-flex items-center justify-center p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${a.enabled ? "text-slate-500 hover:text-white bg-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 border border-slate-200 hover:border-red-500" : "text-slate-500 hover:text-white bg-white hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 border border-slate-200 hover:border-green-500"}`}
        >
          {isLoading === "toggle" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Power className="w-4 h-4" />
          )}
        </button>

        {isSlot && onDelete && (
          <IconButton
            onClick={onDelete}
            icon={Trash2}
            title="حذف الحساب"
            isLoading={isLoading === "delete"}
            variant="danger"
          />
        )}
      </div>
    </div>
  );
}

export function AccountSection({
  title,
  subtitle,
  accounts,
  isSlot,
  renamingId,
  renameValue,
  actionLoading,
  onRenameStart,
  onRenameSubmit,
  onRenameCancel,
  onRenameChange,
  onResetPassword,
  onChangeRole,
  onToggle,
  onDelete,
  onCreateClick,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-slate-50/80 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            {isSlot ? (
              <UserCog size={18} className="text-cyan-600" />
            ) : (
              <ShieldCheck size={18} className="text-purple-600" />
            )}
            {title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        {isSlot && (
          <StyledButton
            variant="primary"
            onClick={onCreateClick}
            icon={Plus}
            className="px-3 py-1.5 text-xs"
          >
            إنشاء حساب
          </StyledButton>
        )}
      </div>

      {accounts.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm font-medium">لا توجد حسابات</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {accounts.map((a) => (
            <AccountRow
              key={a.id}
              account={a}
              isSlot={isSlot}
              isRenaming={renamingId === a.id}
              isLoading={actionLoading[a.id]}
              renameValue={renameValue}
              onRenameStart={() => onRenameStart(a.id, a.username)}
              onRenameSubmit={() => onRenameSubmit(a.id)}
              onRenameCancel={onRenameCancel}
              onRenameChange={onRenameChange}
              onResetPassword={() => onResetPassword(a.id, a.username)}
              onChangeRole={(r) => onChangeRole(a.id, r, a.slot)}
              onToggle={() => onToggle(a.id, a.username, a.enabled)}
              onDelete={onDelete ? () => onDelete(a.id, a.username) : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
