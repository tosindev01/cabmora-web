/*
 * NOT ROUTED. Deliberately unreachable as of 2026-11-04.
 *
 * Every control on this page wrote to React state and nothing else —
 * `AdminStore.updateSettings` is `setSettings`, so a save survived until the
 * next reload and no further. A settings screen that forgets what it was told
 * is worse than no settings screen: somebody sets a storage quota, watches it
 * take, and believes it.
 *
 * It was also redundant by the time it was noticed. All three tabs describe
 * things now configured by environment variable and read at boot — Stripe
 * keys, R2 credentials, Mailtrap — so even a working version of this page
 * would have been a second place to set what Railway already decides.
 *
 * Kept rather than deleted because the layout is the designer's and is worth
 * having when platform settings become real rows in a table. Nothing imports
 * it; the route, the sidebar entry, the dashboard link and the permissions
 * listing were all removed together. Delete it outright if that day does not
 * come.
 */
import React, { useState } from 'react';

import { Select } from '@cabmora/ui';
import { CreditCard, HardDrive, Mail, Save, CheckCircle2 } from 'lucide-react';
import { useAdmin } from '@/shared/store';

export default function AdminPlatformSettingsPage() {
  const { settings, updateSettings } = useAdmin();

  const [activeTab, setActiveTab] = useState<'gateways' | 'storage' | 'email'>('gateways');

  const [formState, setFormState] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <>
      <div className="max-w-[1320px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <div>
            <h1 className="text-[30px] font-sans font-medium text-ink">Platform Settings</h1>
            <p className="text-ink/60 text-[15.5px]">
              Configure payment gateways, storage quotas and email notifications.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="bg-ink text-white px-6 py-2.5 rounded-full text-[13.5px] font-bold tracking-[0.05em] uppercase hover:bg-gold hover:text-ink transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Save size={16} />
            Save Platform Settings
          </button>
        </div>

        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-[14.5px] font-semibold rounded-xl flex items-center gap-3">
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
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-lg text-[13.5px] font-bold uppercase tracking-[0.05em] transition-all whitespace-nowrap cursor-pointer ${
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
                <h3 className="font-sans text-[21.5px] font-medium text-ink mb-1">
                  Payment Gateways & Currency
                </h3>
                <p className="text-[13.5px] text-ink/50 mb-6">
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
                    className="w-full bg-white border border-ink/15 px-3.5 py-2 text-[13.5px] font-mono outline-none focus:border-gold rounded-lg"
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
                  <label className="text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                    Platform Base Currency
                  </label>
                  <Select
                    value={formState.currency}
                    onChange={(e) => setFormState({ ...formState, currency: e.target.value })}
                    className="w-full bg-canvas border border-ink/15 pl-3.5 pr-9 py-2.5 text-[14.5px] outline-none focus:border-gold rounded-lg font-semibold"
                  >
                    <option value="USD ($)">USD ($) - US Dollar</option>
                    <option value="EUR (€)">EUR (€) - Euro</option>
                    <option value="GBP (£)">GBP (£) - British Pound</option>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STORAGE */}
          {activeTab === 'storage' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="font-sans text-[21.5px] font-medium text-ink mb-1">
                  Storage Vault & Quota Configuration
                </h3>
                <p className="text-[13.5px] text-ink/50 mb-6">
                  Set default creator storage allocations and cloud vault backend provider.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                    Default Storage Allocation per Creator (GB)
                  </label>
                  <input
                    type="number"
                    value={formState.defaultStorageLimitGB}
                    onChange={(e) =>
                      setFormState({ ...formState, defaultStorageLimitGB: Number(e.target.value) })
                    }
                    className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[14.5px] outline-none focus:border-gold rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                    Cloud Infrastructure Provider
                  </label>
                  <input
                    type="text"
                    value={formState.storageProvider}
                    onChange={(e) =>
                      setFormState({ ...formState, storageProvider: e.target.value })
                    }
                    className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[14.5px] outline-none focus:border-gold rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EMAIL */}
          {activeTab === 'email' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="font-sans text-[21.5px] font-medium text-ink mb-1">
                  SMTP Host & Notification Settings
                </h3>
                <p className="text-[13.5px] text-ink/50 mb-6">
                  Set up automated email sending credentials and admin notification dispatch
                  address.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                    SMTP Server Host
                  </label>
                  <input
                    type="text"
                    value={formState.smtpHost}
                    onChange={(e) => setFormState({ ...formState, smtpHost: e.target.value })}
                    className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[14.5px] outline-none focus:border-gold rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                    Sender Email Address
                  </label>
                  <input
                    type="email"
                    value={formState.senderEmail}
                    onChange={(e) => setFormState({ ...formState, senderEmail: e.target.value })}
                    className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[14.5px] outline-none focus:border-gold rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-ink/10 flex justify-end">
            <button
              type="submit"
              className="bg-ink text-white px-8 py-3 rounded-lg text-[13.5px] font-bold uppercase tracking-[0.08em] hover:bg-gold hover:text-ink transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Save size={16} />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
