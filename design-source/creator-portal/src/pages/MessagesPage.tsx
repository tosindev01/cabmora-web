import { Link } from "react-router-dom";
import { Search, Bell, Settings as SettingsIcon, LogOut, Briefcase, Image as ImageIcon, MessageSquare, CreditCard, HardDrive, Filter } from "lucide-react";
import LogoWhite from "../assets/cabmora_white_logo.svg";

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-[#0E0C0A] text-[#FAF9F6] flex font-sans">
      
      {/* Sidebar */}
      <aside className="w-[280px] bg-[#141210] border-r border-[#FAF9F6]/5 flex flex-col hidden md:flex">
        <div className="h-20 px-8 flex items-center border-b border-[#FAF9F6]/5">
          <img src={LogoWhite} alt="Cabmora Logo" className="h-7 w-auto object-contain" />
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span className="text-[13px] font-medium tracking-[0.05em]">Overview</span>
          </Link>
          <Link to="/projects" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <Briefcase size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Projects</span>
          </Link>
          <Link to="/galleries" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <ImageIcon size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Galleries</span>
          </Link>
          <Link to="/messages" className="flex items-center gap-4 px-4 py-3 rounded-lg bg-[#C9A86A]/10 text-[#C9A86A] transition-colors">
            <MessageSquare size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Messages</span>
          </Link>
          <Link to="/billing" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <CreditCard size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Billing</span>
          </Link>
          <Link to="/storage" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <HardDrive size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Storage Vault</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-[#FAF9F6]/5 space-y-2">
          <Link to="/client/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors mt-auto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            <span className="text-[13px] font-medium tracking-[0.05em]">View as Client</span>
          </Link>
          <Link to="/settings" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <SettingsIcon size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Settings</span>
          </Link>
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-red-400/80 hover:bg-red-400/10 hover:text-red-400 transition-colors">
            <LogOut size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 px-8 flex items-center justify-between border-b border-[#FAF9F6]/5 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-[24px]">Messages</h1>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-[#FAF9F6]/60 hover:text-[#FAF9F6] transition-colors">
              <Bell size={20} />
            </button>
            <div className="w-9 h-9 rounded-full bg-[#FAF9F6]/10 flex items-center justify-center text-[12px] font-medium">
              SC
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
            <div className="text-center">
                <MessageSquare size={48} className="mx-auto text-[#FAF9F6]/20 mb-4" />
                <h2 className="font-serif text-[24px] mb-2">No active conversations</h2>
                <p className="text-[#FAF9F6]/60 text-[14px]">When clients message you about their projects, they will appear here.</p>
            </div>
        </div>
      </main>
    </div>
  );
}
