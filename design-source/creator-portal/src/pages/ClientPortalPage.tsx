import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Bell, 
  Settings, 
  LogOut, 
  Folder, 
  Image as ImageIcon, 
  MessageSquare, 
  CreditCard,
  CheckCircle2,
  Circle,
  FileText,
  Download,
  Send,
  Share2,
  Lock,
  Star,
  ExternalLink,
  ChevronRight,
  Maximize2,
  X,
  CreditCard as CardIcon,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  Filter,
  Grid,
  Paperclip,
  AlertTriangle,
  Play,
  Pause,
  Check,
  AlertCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Link as LinkIcon,
  Film
} from "lucide-react";
import LogoWhite from "../assets/cabmora_white_logo.svg";

// Mock data for the client
const CLIENT_PROJECT = {
  id: "1",
  name: "Smith & Wesson Wedding",
  type: "Wedding",
  date: "Oct 12, 2025",
  location: "Tuscany, Italy",
  status: "Review",
  progress: 85,
  image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&h=600&fit=crop",
  photographer: "Sarah Cabmora",
  payment: {
    total: 8500,
    paid: 4250,
    due: 4250,
    status: "Partially Paid",
    nextDue: "Oct 01, 2025"
  },
  timeline: [
    { id: 1, title: "Initial Consultation", date: "Jan 15, 2025", status: "completed" },
    { id: 2, title: "Contract Signed & Deposit", date: "Jan 20, 2025", status: "completed" },
    { id: 3, title: "Wedding Day", date: "Oct 12, 2025", status: "completed" },
    { id: 4, title: "Gallery Review", date: "Nov 15, 2025", status: "in-progress" },
    { id: 5, title: "Final Delivery & Album", date: "Dec 01, 2025", status: "pending" }
  ],
  gallery: [
    { id: 1, type: "image", album: "Ceremony", url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop", comments: 0 },
    { id: 2, type: "image", album: "Reception", url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop", comments: 2 },
    { id: 3, type: "image", album: "Ceremony", url: "https://images.unsplash.com/photo-1606216794074-735e91ce2c92?w=800&h=600&fit=crop", comments: 0 },
    { id: 4, type: "image", album: "Reception", url: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&h=600&fit=crop", comments: 1 },
    { id: 5, type: "image", album: "Preparation", url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&h=600&fit=crop", comments: 0 },
    { id: 6, type: "video", album: "Highlights", url: "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?w=800&h=600&fit=crop", comments: 0 }, // Using image as placeholder for video thumbnail
  ]
};

const NOTIFICATIONS = [
  { id: 1, type: "upload", title: "New Gallery Uploaded", time: "2 hours ago", unread: true },
  { id: 2, type: "comment", title: "Sarah replied to your comment", time: "5 hours ago", unread: true },
  { id: 3, type: "payment", title: "Final Payment Reminder", time: "1 day ago", unread: false },
  { id: 4, type: "system", title: "System Maintenance Scheduled", time: "2 days ago", unread: false },
];

const REVISIONS = [
  { id: "REV-01", title: "Color Grade Adjustment", priority: "High", status: "In Progress", date: "Oct 15, 2025" },
  { id: "REV-02", title: "Remove background person", priority: "Medium", status: "Pending", date: "Oct 16, 2025" },
];

const SHARE_LINKS = [
  { id: "LNK-01", name: "Family Viewing", url: "cabmora.com/g/share/fam25", permission: "View Only", expires: "Never" },
  { id: "LNK-02", name: "Parents", url: "cabmora.com/g/share/prnt", permission: "View & Comment", expires: "Never" },
];

export default function ClientPortalPage() {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState("All");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [itemStatuses, setItemStatuses] = useState<Record<number, 'approved' | 'rejected' | 'pending'>>({});

  const handleStatusChange = (id: number, status: 'approved' | 'rejected' | 'pending') => {
    setItemStatuses(prev => ({ ...prev, [id]: status }));
  };

  const albums = ["All", ...Array.from(new Set(CLIENT_PROJECT.gallery.map(item => item.album)))];
  const filteredGallery = selectedAlbum === "All" ? CLIENT_PROJECT.gallery : CLIENT_PROJECT.gallery.filter(item => item.album === selectedAlbum);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111] flex flex-col font-sans">
      
      {/* Top Navigation */}
      <header className="h-20 bg-[#001F1F] text-[#FAF9F6] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <img src={LogoWhite} alt="Cabmora Logo" className="h-7 w-auto object-contain" />
          <div className="hidden md:flex items-center gap-6 text-[13px] font-medium tracking-[0.05em] opacity-80">
            Client Portal
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="text-white/60 hover:text-white transition-colors relative"
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#C9A86A] rounded-full border-2 border-[#001F1F]" />
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-4 w-[320px] bg-white rounded-xl shadow-2xl border border-[#111]/10 overflow-hidden text-[#111] z-50">
                <div className="p-4 border-b border-[#111]/10 flex items-center justify-between">
                  <h4 className="font-serif text-[16px]">Notifications</h4>
                  <button className="text-[11px] font-medium text-[#C9A86A] uppercase tracking-wider">Mark all read</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {NOTIFICATIONS.map((notif) => (
                    <div key={notif.id} className={`p-4 border-b border-[#111]/5 hover:bg-[#FAF9F6] transition-colors ${notif.unread ? 'bg-blue-50/30' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          notif.type === 'upload' ? 'bg-blue-100 text-blue-600' :
                          notif.type === 'comment' ? 'bg-green-100 text-green-600' :
                          notif.type === 'payment' ? 'bg-[#C9A86A]/20 text-[#C9A86A]' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {notif.type === 'upload' && <ImageIcon size={14} />}
                          {notif.type === 'comment' && <MessageSquare size={14} />}
                          {notif.type === 'payment' && <CardIcon size={14} />}
                          {notif.type === 'system' && <AlertCircle size={14} />}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-[#111] mb-0.5">{notif.title}</p>
                          <p className="text-[11px] text-[#111]/50">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button 
            className="hidden md:flex items-center gap-2 bg-[#C9A86A] text-[#111] px-4 py-2 rounded-full text-[12px] font-medium hover:bg-[#B8965C] transition-colors"
          >
            <CardIcon size={14} />
            Pay Balance (${CLIENT_PROJECT.payment.due.toLocaleString()})
          </button>
          <div className="text-right hidden sm:block ml-2">
            <div className="text-[13px] font-medium text-white">Jane Smith</div>
            <div className="text-[11px] text-white/50">{CLIENT_PROJECT.name}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 border border-white/20">
            JS
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 max-w-[1440px] mx-auto w-full">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-serif text-[28px] mb-1">{CLIENT_PROJECT.name} - Gallery</h2>
              <p className="text-[14px] text-[#111]/60">View, comment, approve, and share your deliverables.</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 bg-[#111] text-white px-5 py-2.5 rounded-full text-[13px] font-medium hover:bg-[#C9A86A] transition-colors shadow-sm mr-2"
              >
                <Share2 size={16} />
                Share Collection
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-white border border-[#111]/10 rounded-full text-[#111]/60 hover:text-[#111] hover:border-[#111]/30 transition-colors shadow-sm">
                <Grid size={16} />
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-white border border-[#111]/10 rounded-full text-[#111]/60 hover:text-[#111] hover:border-[#111]/30 transition-colors shadow-sm">
                <Filter size={16} />
              </button>
            </div>
          </div>

          {/* Albums Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {albums.map((album) => (
              <button
                key={album}
                onClick={() => setSelectedAlbum(album)}
                className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${
                  selectedAlbum === album 
                    ? 'bg-[#111] text-white' 
                    : 'bg-white border border-[#111]/10 text-[#111]/70 hover:bg-[#FAF9F6]'
                }`}
              >
                {album}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {filteredGallery.map((media, idx) => (
              <div 
                key={media.id} 
                className="group relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors"
                style={{ borderColor: itemStatuses[media.id] === 'approved' ? '#22c55e' : itemStatuses[media.id] === 'rejected' ? '#ef4444' : 'transparent' }}
                onClick={() => setSelectedImageIndex(CLIENT_PROJECT.gallery.findIndex(g => g.id === media.id))}
              >
                <img src={media.url} alt={`Gallery item ${media.id}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                
                {media.type === 'video' && (
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm p-1.5 rounded-full text-white shadow-sm z-10">
                    <Film size={14} />
                  </div>
                )}

                {/* Inline Status Actions */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleStatusChange(media.id, 'approved'); }}
                    className="w-8 h-8 rounded-full bg-white/90 text-[#111] flex items-center justify-center hover:bg-green-50 hover:text-green-600 transition-colors shadow-sm"
                    title="Approve"
                  >
                    <Check size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleStatusChange(media.id, 'rejected'); }}
                    className="w-8 h-8 rounded-full bg-white/90 text-[#111] flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                    title="Reject"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Status Badges */}
                {itemStatuses[media.id] === 'approved' && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white p-1 rounded-full shadow-sm z-10">
                    <Check size={14} />
                  </div>
                )}
                {itemStatuses[media.id] === 'rejected' && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white p-1 rounded-full shadow-sm z-10">
                    <X size={14} />
                  </div>
                )}

                {/* Overlay for actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Maximize2 className="text-white w-8 h-8" />
                </div>
                
                {/* Comment Badge */}
                {media.comments > 0 && (
                  <div className={`absolute top-3 ${itemStatuses[media.id] ? 'right-10' : 'right-3'} bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 shadow-sm z-10 transition-all`}>
                    <MessageSquare size={12} className="text-[#C9A86A]" />
                    {media.comments}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Final Acceptance Banner */}
          <div className="mt-8 p-6 bg-[#FAF9F6] border border-[#C9A86A]/30 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-serif text-[18px] mb-1">Ready to accept?</h4>
              <p className="text-[13px] text-[#111]/70">Once you approve the previews, high-resolution downloads will be unlocked.</p>
            </div>
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="shrink-0 bg-[#C9A86A] text-white px-8 py-3 rounded-full text-[13px] uppercase tracking-[0.1em] font-medium hover:bg-[#B8965C] transition-colors"
            >
              Accept & Review
            </button>
          </div>
        </div>
      </main>

      {/* --- MODALS --- */}

      {/* Secure Media Viewer & Comment Modal */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col md:flex-row overflow-hidden">
          {/* Top Controls Overlay */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/80 to-transparent z-20 flex items-center justify-between px-6 pointer-events-none">
            <div className="text-white/80 text-[13px] font-medium pointer-events-auto">
              {selectedImageIndex + 1} / {CLIENT_PROJECT.gallery.length}
            </div>
            <div className="flex items-center gap-4 pointer-events-auto">
              <button 
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}
                className="text-white/60 hover:text-white transition-colors p-2"
                title="Zoom In"
              >
                <ZoomIn size={20} />
              </button>
              <button 
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 1))}
                className="text-white/60 hover:text-white transition-colors p-2"
                title="Zoom Out"
              >
                <ZoomOut size={20} />
              </button>
              <button 
                className="text-white/60 hover:text-white transition-colors p-2 md:hidden"
                onClick={() => { setSelectedImageIndex(null); setZoomLevel(1); setIsPlaying(false); }}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Navigation Controls */}
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm z-20 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex(prev => prev !== null && prev > 0 ? prev - 1 : CLIENT_PROJECT.gallery.length - 1);
              setZoomLevel(1);
              setIsPlaying(false);
            }}
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            className="absolute right-4 md:right-[420px] top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm z-20 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex(prev => prev !== null && prev < CLIENT_PROJECT.gallery.length - 1 ? prev + 1 : 0);
              setZoomLevel(1);
              setIsPlaying(false);
            }}
          >
            <ChevronRight size={24} />
          </button>

          {/* Media Area */}
          <div className="flex-1 relative flex items-center justify-center p-4 lg:p-12 overflow-hidden bg-[#0A0A0A]" onClick={() => { setSelectedImageIndex(null); setZoomLevel(1); setIsPlaying(false); }}>
            <div 
              className="relative transition-transform duration-300 ease-out"
              style={{ transform: `scale(${zoomLevel})` }}
              onClick={(e) => e.stopPropagation()}
            >
              {CLIENT_PROJECT.gallery[selectedImageIndex].type === 'video' ? (
                <div className="relative group">
                  <img 
                    src={CLIENT_PROJECT.gallery[selectedImageIndex].url} 
                    alt="Preview" 
                    className="max-w-full max-h-[80vh] object-contain rounded shadow-2xl"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-16 h-16 bg-[#C9A86A] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                    </button>
                  </div>
                </div>
              ) : (
                <img 
                  src={CLIENT_PROJECT.gallery[selectedImageIndex].url} 
                  alt="Preview" 
                  className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl transition-all"
                />
              )}
              
              {/* Dynamic Watermark Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-wrap items-center justify-center opacity-[0.07] rotate-[-20deg] select-none">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="text-[40px] font-bold text-white uppercase tracking-widest whitespace-nowrap p-8">
                    Sarah Cabmora
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Comments Sidebar */}
          <div className="w-full md:w-[400px] bg-white h-[50vh] md:h-full flex flex-col rounded-t-2xl md:rounded-none overflow-hidden z-30 shrink-0">
            <div className="h-16 border-b border-[#111]/10 flex items-center justify-between px-6 shrink-0 bg-[#FAF9F6]">
              <h3 className="font-medium text-[15px] flex items-center gap-2">
                <MessageSquare size={16} className="text-[#C9A86A]" />
                Feedback
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleStatusChange(CLIENT_PROJECT.gallery[selectedImageIndex].id, 'approved')}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors border ${
                    itemStatuses[CLIENT_PROJECT.gallery[selectedImageIndex].id] === 'approved' 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-white text-[#111]/60 border-[#111]/10 hover:bg-gray-50'
                  }`}
                >
                  <ThumbsUp size={14} className="inline mr-1" />
                  Approve
                </button>
                <button 
                  onClick={() => handleStatusChange(CLIENT_PROJECT.gallery[selectedImageIndex].id, 'rejected')}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors border ${
                    itemStatuses[CLIENT_PROJECT.gallery[selectedImageIndex].id] === 'rejected' 
                      ? 'bg-red-100 text-red-700 border-red-200' 
                      : 'bg-white text-[#111]/60 border-[#111]/10 hover:bg-gray-50'
                  }`}
                >
                  <ThumbsDown size={14} className="inline mr-1" />
                  Reject
                </button>
                <button 
                  className="hidden md:block text-[#111]/50 hover:text-[#111] transition-colors p-2 ml-2"
                  onClick={() => { setSelectedImageIndex(null); setZoomLevel(1); setIsPlaying(false); }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {CLIENT_PROJECT.gallery[selectedImageIndex].comments > 0 ? (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#111] text-white flex items-center justify-center text-[10px] shrink-0 font-medium">
                    JS
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-medium text-[13px]">Jane Smith</span>
                      <span className="text-[10px] text-[#111]/40">Oct 16, 2025</span>
                    </div>
                    <div className="bg-[#FAF9F6] p-3 rounded-tr-lg rounded-b-lg text-[13px] text-[#111]/80 leading-relaxed border border-[#111]/5">
                      Could we maybe make the colors a little warmer in this specific shot? The composition is beautiful!
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#111]/40 px-4">
                  <MessageSquare size={32} className="mb-4 text-[#111]/20" />
                  <p className="text-[13px] mb-1">No feedback yet</p>
                  <p className="text-[11px]">Leave a comment below to request an edit or highlight what you love.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-[#111]/10 bg-white shrink-0">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Add a comment or revision request..." 
                  className="w-full bg-[#FAF9F6] border border-[#111]/10 rounded-full pl-4 pr-20 py-3 text-[13px] outline-none focus:border-[#C9A86A] transition-colors"
                />
                <button className="absolute right-10 top-1/2 -translate-y-1/2 text-[#111]/40 hover:text-[#111] p-1.5 transition-colors">
                  <Paperclip size={16} />
                </button>
                <button 
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-[#111] text-white hover:bg-[#C9A86A] transition-colors"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Link Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <button 
              className="absolute top-4 right-4 text-[#111]/40 hover:text-[#111] transition-colors p-2"
              onClick={() => setIsShareModalOpen(false)}
            >
              <X size={20} />
            </button>
            <div className="p-8">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-600">
                <Share2 size={24} />
              </div>
              <h3 className="font-serif text-[24px] mb-2">Share Gallery</h3>
              <p className="text-[14px] text-[#111]/60 leading-relaxed mb-6">
                Share this link with friends and family. This is a protected viewing link—guests cannot download high-resolution files.
              </p>
              
              <div className="bg-[#FAF9F6] border border-[#111]/10 p-3 rounded-lg flex items-center gap-3 mb-4">
                <Lock size={16} className="text-[#111]/40 shrink-0" />
                <input 
                  type="text" 
                  readOnly 
                  value="https://cabmora.com/g/share/x8k92m" 
                  className="bg-transparent text-[13px] font-medium w-full outline-none text-[#111]/80"
                />
                <button className="shrink-0 bg-[#111] text-white px-4 py-1.5 rounded text-[11px] font-medium hover:bg-[#C9A86A] transition-colors">
                  Copy
                </button>
              </div>
              
              <div className="flex items-start gap-2 text-[12px] text-blue-800 bg-blue-50/50 p-3 rounded-lg">
                <CheckCircle2 size={14} className="mt-0.5 text-blue-600 shrink-0" />
                <span>Guests do not need an account to view the gallery via this secure link.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept & Rate Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <button 
              className="absolute top-4 right-4 text-[#111]/40 hover:text-[#111] transition-colors p-2"
              onClick={() => setIsReviewModalOpen(false)}
            >
              <X size={20} />
            </button>
            <div className="p-8">
              <div className="w-12 h-12 bg-[#C9A86A]/10 rounded-full flex items-center justify-center mb-6 text-[#C9A86A]">
                <Star size={24} className="fill-current" />
              </div>
              <h3 className="font-serif text-[24px] mb-2">Accept Work & Rate</h3>
              <p className="text-[14px] text-[#111]/60 leading-relaxed mb-8">
                By accepting, you confirm that you are satisfied with the deliverables. High-resolution downloads will be unlocked instantly.
              </p>
              
              <div className="mb-8">
                <div className="text-[12px] uppercase tracking-[0.1em] font-medium text-[#111]/50 mb-3 text-center">
                  How was your experience?
                </div>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      className="p-1 transition-transform hover:scale-110"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star 
                        size={32} 
                        className={`transition-colors ${(hoverRating || rating) >= star ? 'text-[#C9A86A] fill-[#C9A86A]' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {rating > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-6 space-y-4">
                  <textarea 
                    placeholder="Write a few words about your experience with Sarah..."
                    className="w-full h-24 bg-[#FAF9F6] border border-[#111]/10 rounded-lg p-4 text-[13px] outline-none focus:border-[#C9A86A] transition-colors resize-none"
                  />
                  
                  <label className="flex items-start gap-3 p-4 border border-[#111]/10 rounded-lg cursor-pointer hover:bg-[#FAF9F6] transition-colors">
                    <input type="checkbox" defaultChecked className="mt-1 accent-[#C9A86A]" />
                    <div>
                      <div className="text-[13px] font-medium flex items-center gap-2 mb-1">
                        Post automatically to Google Reviews
                        <ExternalLink size={12} className="text-[#111]/40" />
                      </div>
                      <div className="text-[11px] text-[#111]/50">
                        Help your creator reach more clients by syndicating your public review.
                      </div>
                    </div>
                  </label>
                </div>
              )}

              <button 
                disabled={rating === 0}
                className="w-full bg-[#111] disabled:bg-[#111]/10 disabled:text-[#111]/30 text-white py-4 rounded-full text-[13px] uppercase tracking-[0.1em] font-medium hover:bg-[#C9A86A] transition-colors shadow-md"
                onClick={() => {
                  alert("Work Accepted & Review Submitted!");
                  setIsReviewModalOpen(false);
                }}
              >
                Submit & Unlock Downloads
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ShieldIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}
