import React, { useState } from 'react';
import { CreditCard, HardDrive, Mail, ShieldCheck, Save, CheckCircle2 } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import AdminLayout from '@/components/AdminLayout';

export default function AdminPlatformSettingsPage() {
  const { settings, updateSettings } = useAdmin();

  const [activeTab, setActiveTab] = useState<'gateways' | 'storage' | 'email' | 'security'>(
    'gateways',
  );

  const [formState, setFormState] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <AdminLayout>
      <div className="max-w-[1320px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <div>
            <h1 className="text-[30px] font-sans font-medium text-ink">Platform Settings</h1>
            <p className="text-ink/60 text-[14px]">
              Configure payment gateways, storage quotas, email notifications, and security rules.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="bg-ink text-white px-6 py-2.5 rounded-full text-[12px] font-bold tracking-[0.05em] uppercase hover:bg-gold hover:text-ink transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Save size={16} />
            Save Platform Settings
          </button>
        </div>

        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-[13px] font-semibold rounded-xl flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-600" />
            Platform settings updated successfully! Changes applied across all management modules.
          </div>
        )}

        {/* Settings Tab Navigation */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-ink/10 overflow-x-auto no-scrollbar shadow-xs">
          {[
            { id: 'gateways', label: 'Payment Gateways', icon: CreditCard },
            { id: 'storage', label: 'Storage & Vault', icon: HardDrive },
            { id: 'email', label: 'Email Settings', icon: Mail },
            { id: 'security', label: 'Security & Access', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-lg text-[12px] font-bold uppercase tracking-[0.05em] transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-ink text-gold shadow-xs'
                    : 'text-ink/60 hover:text-ink hover:bg-canvas'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Box */}
        <form
          onSubmit={handleSave}
          className="bg-white border border-ink/10 p-6 lg:p-8 rounded-xl shadow-xs space-y-6"
        >
          {/* TAB 1: PAYMENT GATEWAYS */}
          {activeTab === 'gateways' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="font-sans text-[20px] font-medium text-ink mb-1">
                  Payment Gateways & Currency
                </h3>
                <p className="text-[12px] text-ink/50 mb-6">
                  Configure active payment processing providers and checkout currencies.
                </p>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-canvas border border-ink/10 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">Stripe Payment Gateway</span>
                    <input
                      type="checkbox"
                      checked={formState.stripeEnabled}
                      onChange={(e) =>
                        setFormState({ ...formState, stripeEnabled: e.target.checked })
                      }
                      className="w-5 h-5 accent-gold cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={formState.stripePublicKey}
                    onChange={(e) =>
                      setFormState({ ...formState, stripePublicKey: e.target.value })
                    }
                    placeholder="pk_live_..."
                    className="w-full bg-white border border-ink/15 px-3.5 py-2 text-[12px] font-mono outline-none focus:border-gold rounded-lg"
                  />
                </div>

                <div className="p-4 bg-canvas border border-ink/10 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">PayPal Checkout Integration</span>
                    <input
                      type="checkbox"
                      checked={formState.paypalEnabled}
                      onChange={(e) =>
                        setFormState({ ...formState, paypalEnabled: e.target.checked })
                      }
                      className="w-5 h-5 accent-gold cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                    Platform Base Currency
                  </label>
                  <select
                    value={formState.currency}
                    onChange={(e) => setFormState({ ...formState, currency: e.target.value })}
                    className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg font-semibold"
                  >
                    <option value="USD ($)">USD ($) - US Dollar</option>
                    <option value="EUR (€)">EUR (€) - Euro</option>
                    <option value="GBP (£)">GBP (£) - British Pound</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STORAGE */}
          {activeTab === 'storage' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="font-sans text-[20px] font-medium text-ink mb-1">
                  Storage Vault & Quota Configuration
                </h3>
                <p className="text-[12px] text-ink/50 mb-6">
                  Set default creator storage allocations and cloud vault backend provider.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                    Default Storage Allocation per Creator (GB)
                  </label>
                  <input
                    type="number"
                    value={formState.defaultStorageLimitGB}
                    onChange={(e) =>
                      setFormState({ ...formState, defaultStorageLimitGB: Number(e.target.value) })
                    }
                    className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                    Cloud Infrastructure Provider
                  </label>
                  <input
                    type="text"
                    value={formState.storageProvider}
                    onChange={(e) =>
                      setFormState({ ...formState, storageProvider: e.target.value })
                    }
                    className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EMAIL */}
          {activeTab === 'email' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="font-sans text-[20px] font-medium text-ink mb-1">
                  SMTP Host & Notification Settings
                </h3>
                <p className="text-[12px] text-ink/50 mb-6">
                  Set up automated email sending credentials and admin notification dispatch
                  address.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                    SMTP Server Host
                  </label>
                  <input
                    type="text"
                    value={formState.smtpHost}
                    onChange={(e) => setFormState({ ...formState, smtpHost: e.target.value })}
                    className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                    Sender Email Address
                  </label>
                  <input
                    type="email"
                    value={formState.senderEmail}
                    onChange={(e) => setFormState({ ...formState, senderEmail: e.target.value })}
                    className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="font-sans text-[20px] font-medium text-ink mb-1">
                  Security Preferences & Access Policy
                </h3>
                <p className="text-[12px] text-ink/50 mb-6">
                  Enforce two-factor authentication for administrators, set idle timeout limits, and
                  password policies.
                </p>
              </div>

              <div className="space-y-5">
                <div className="p-4 bg-canvas border border-ink/10 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-ink block">
                      Mandatory 2FA for Administrators
                    </span>
                    <span className="text-[11px] text-ink/50">
                      Require authenticator code on admin sign in
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formState.requireAdmin2FA}
                    onChange={(e) =>
                      setFormState({ ...formState, requireAdmin2FA: e.target.checked })
                    }
                    className="w-5 h-5 accent-gold cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                    Admin Session Timeout (Minutes)
                  </label>
                  <input
                    type="number"
                    value={formState.sessionTimeoutMinutes}
                    onChange={(e) =>
                      setFormState({ ...formState, sessionTimeoutMinutes: Number(e.target.value) })
                    }
                    className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                    Password Complexity Enforcement
                  </label>
                  <input
                    type="text"
                    value={formState.passwordPolicy}
                    onChange={(e) => setFormState({ ...formState, passwordPolicy: e.target.value })}
                    className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg font-mono text-[12px]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-ink/10 flex justify-end">
            <button
              type="submit"
              className="bg-ink text-white px-8 py-3 rounded-lg text-[12px] font-bold uppercase tracking-[0.08em] hover:bg-gold hover:text-ink transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Save size={16} />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
