import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../services/api";
import { toast } from "react-toastify";
import {
  ArrowRightIcon,
  Plus,
  ShieldCheck,
  Users,
  UserCog,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import PasswordRevealModal from "../components/PasswordRevealModal";
import {
  ROLE_CONFIG,
  StyledButton,
  StatCard,
  AccountSection,
} from "../components/AdminComponents";

const notify = {
  success: (m) =>
    toast.success(m, {
      position: "top-left",
      autoClose: 1500,
      theme: "colored",
      pauseOnHover: false,
      closeButton: false,
    }),
  error: (m) =>
    toast.error(m, {
      position: "top-left",
      autoClose: 2000,
      theme: "colored",
      pauseOnHover: false,
      closeButton: false,
    }),
  warn: (m) =>
    toast.warn(m, {
      position: "top-left",
      autoClose: 2000,
      theme: "colored",
      pauseOnHover: false,
      closeButton: false,
    }),
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passwordModal, setPasswordModal] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const [showCreate, setShowCreate] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newRole, setNewRole] = useState("Mid");
  const [creating, setCreating] = useState(false);

  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await adminAPI.getAccounts();
      setAccounts(data || []);
    } catch {
      notify.error("فشل تحميل الحسابات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const slotAccounts = accounts.filter((a) => a.slot);
  const fixedAccounts = accounts.filter((a) => !a.slot);

  const withLoading = async (id, type, fn) => {
    setActionLoading((p) => ({ ...p, [id]: type }));
    try {
      return await fn();
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }));
    }
  };

  const handleCreate = async () => {
    if (!newUsername.trim()) return notify.warn("يرجى إدخال اسم المستخدم");
    setCreating(true);
    try {
      const data = await adminAPI.createSlotAccount(
        newUsername.trim(),
        newRole,
      );
      notify.success(data.Message || "تم إنشاء الحساب بنجاح");
      setPasswordModal({ username: data.username, password: data.password });
      setNewUsername("");
      setNewRole("Mid");
      setShowCreate(false);
      await fetchAccounts();
    } catch (e) {
      notify.error(e.response?.data?.Message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (id) => {
    if (!renameValue.trim()) return;
    await withLoading(id, "rename", async () => {
      await adminAPI.renameAccount(id, renameValue.trim());
      notify.success("تم تغيير الاسم بنجاح");
      setRenamingId(null);
      setRenameValue("");
      await fetchAccounts();
    });
  };

  const handleResetPassword = async (id) => {
    await withLoading(id, "reset", async () => {
      const data = await adminAPI.resetPassword(id);
      notify.success(data.Message || "تم إعادة تعيين كلمة المرور");
      setPasswordModal({ username: data.username, password: data.password });
    });
  };

  const handleChangeRole = async (id, role, isSlot) => {
    if (isSlot && role === "High")
      return notify.warn("لا يمكن تعيين صلاحية High لحساب متغير");
    await withLoading(id, "role", async () => {
      await adminAPI.changeRole(id, role);
      notify.success("تم تحديث الصلاحية بنجاح");
      await fetchAccounts();
    });
  };

  const handleToggle = async (id, enabled) => {
    const action = enabled ? "تعطيل" : "تفعيل";
    await withLoading(id, "toggle", async () => {
      await adminAPI.toggleAccount(id);
      notify.success(`تم ${action} الحساب بنجاح`);
      await fetchAccounts();
    });
  };

  const handleDelete = async (id) => {
    await withLoading(id, "delete", async () => {
      await adminAPI.deleteAccount(id);
      notify.success("تم حذف الحساب بنجاح");
      await fetchAccounts();
    });
  };

  const confirm = (message, onConfirm) => {
    toast.info(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3 w-full" dir="rtl">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle size={20} />
            <span className="font-semibold text-sm">تأكيد الإجراء</span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
          <div className="flex gap-2 mt-1">
            <StyledButton
              variant="danger"
              onClick={() => {
                onConfirm();
                closeToast();
              }}
              className="flex-1 py-2 text-xs"
            >
              نعم
            </StyledButton>
            <StyledButton
              variant="default"
              onClick={closeToast}
              className="flex-1 py-2 text-xs"
            >
              لا
            </StyledButton>
          </div>
        </div>
      ),
      {
        autoClose: false,
        position: "bottom-center",
        closeButton: false,
        className: "w-80",
        bodyClassName: "p-0",
      },
    );
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-800 mx-auto mb-4" />
          <p className="text-slate-600">جاري تحميل الحسابات...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                إدارة الحسابات
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                إدارة صلاحيات المستخدمين والحسابات
              </p>
            </div>
          </div>
          <StyledButton onClick={() => navigate("/")} icon={ArrowRightIcon}>
            العودة للرئيسية
          </StyledButton>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="إجمالي الحسابات"
            value={accounts.length}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            label="الحسابات الثابتة"
            value={fixedAccounts.length}
            icon={ShieldCheck}
            color="bg-purple-500"
          />
          <StatCard
            label="الحسابات المتغيرة"
            value={slotAccounts.length}
            icon={UserCog}
            color="bg-cyan-500"
          />
          <StatCard
            label="الحسابات النشطة"
            value={accounts.filter((a) => a.enabled).length}
            icon={CheckCircle2}
            color="bg-green-500"
          />
        </div>

        <AccountSection
          title="الحسابات الثابتة"
          subtitle="حسابات النظام الأساسية"
          accounts={fixedAccounts}
          isSlot={false}
          renamingId={renamingId}
          renameValue={renameValue}
          actionLoading={actionLoading}
          onRenameStart={(id, u) => {
            setRenamingId(id);
            setRenameValue(u);
          }}
          onRenameSubmit={handleRename}
          onRenameCancel={() => {
            setRenamingId(null);
            setRenameValue("");
          }}
          onRenameChange={setRenameValue}
          onResetPassword={(id, u) =>
            confirm(`هل أنت متأكد من إعادة تعيين كلمة مرور "${u}"؟`, () =>
              handleResetPassword(id),
            )
          }
          onChangeRole={handleChangeRole}
          onToggle={(id, u, e) =>
            confirm(
              `هل أنت متأكد من ${e ? "تعطيل" : "تفعيل"} حساب "${u}"؟`,
              () => handleToggle(id, e),
            )
          }
        />

        <AccountSection
          title="الحسابات المتغيرة"
          subtitle="حسابات مؤقتة يمكن إنشاؤها وتعديلها وحذفها"
          accounts={slotAccounts}
          isSlot={true}
          renamingId={renamingId}
          renameValue={renameValue}
          actionLoading={actionLoading}
          onRenameStart={(id, u) => {
            setRenamingId(id);
            setRenameValue(u);
          }}
          onRenameSubmit={handleRename}
          onRenameCancel={() => {
            setRenamingId(null);
            setRenameValue("");
          }}
          onRenameChange={setRenameValue}
          onResetPassword={(id, u) =>
            confirm(`هل أنت متأكد من إعادة تعيين كلمة مرور "${u}"؟`, () =>
              handleResetPassword(id),
            )
          }
          onChangeRole={handleChangeRole}
          onToggle={(id, u, e) =>
            confirm(
              `هل أنت متأكد من ${e ? "تعطيل" : "تفعيل"} حساب "${u}"؟`,
              () => handleToggle(id, e),
            )
          }
          onDelete={(id, u) =>
            confirm(
              `هل أنت متأكد من حذف حساب "${u}"؟ لا يمكن التراجع عن هذا الإجراء.`,
              () => handleDelete(id),
            )
          }
          onCreateClick={() => setShowCreate(true)}
        />
      </div>

      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5" /> إنشاء حساب متغير
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">
                  اسم المستخدم <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">
                  الصلاحية
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Mid", "Low"].map((r) => {
                    const cfg = ROLE_CONFIG[r],
                      Icon = cfg.icon;
                    return (
                      <button
                        key={r}
                        onClick={() => setNewRole(r)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${newRole === r ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-200 hover:border-slate-300 text-slate-600"}`}
                      >
                        <Icon size={18} />
                        <span className="text-sm font-medium">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 pt-0">
              <StyledButton
                variant="default"
                onClick={() => setShowCreate(false)}
                className="flex-1"
              >
                إلغاء
              </StyledButton>
              <StyledButton
                variant="primary"
                onClick={handleCreate}
                disabled={creating || !newUsername.trim()}
                className="flex-1"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> إنشاء
                  </>
                )}
              </StyledButton>
            </div>
          </div>
        </div>
      )}

      {passwordModal && (
        <PasswordRevealModal
          {...passwordModal}
          onClose={() => setPasswordModal(null)}
        />
      )}
    </div>
  );
}
