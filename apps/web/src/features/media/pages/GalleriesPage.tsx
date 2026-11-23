import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Image as ImageIcon,
  Maximize2,
  Download,
  Share2,
  UploadCloud,
  Edit2,
  Trash2,
  FolderInput,
  CheckSquare,
  Square,
  Info,
  RotateCcw,
  FolderPlus,
  ShieldCheck,
  ShieldX,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Users,
  Copy,
  Check,
} from 'lucide-react';
import { PortalAvatar, PortalBell, PortalShell, PortalTopbar } from '@/shared/portal';
import { Modal } from '@cabmora/ui';
import { ClientAccess, INITIAL_ALBUMS, INITIAL_ASSETS, MediaAsset } from '@/features/media/data';

export default function GalleriesPage() {
  const [albums, setAlbums] = useState(INITIAL_ALBUMS);
  const [assets, setAssets] = useState<MediaAsset[]>(INITIAL_ASSETS);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'photo' | 'video' | 'raw'>('All');
  const [accessFilter, setAccessFilter] = useState<'All' | 'Shared' | 'Locked'>('All');

  // Selection & Modal States
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  // Modals
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveTargetAlbum, setMoveTargetAlbum] = useState(albums[0].name);

  const [isNewAlbumModalOpen, setIsNewAlbumModalOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumType, setNewAlbumType] = useState('Wedding');

  const [showTrash, setShowTrash] = useState(false);

  // Client Access Modal States
  const [accessModalTargetAssets, setAccessModalTargetAssets] = useState<MediaAsset[] | null>(null);
  const [accessActiveTab, setAccessActiveTab] = useState<'grant' | 'manage'>('grant');

  // Grant Access Form
  const [grantClientName, setGrantClientName] = useState('');
  const [grantClientEmail, setGrantClientEmail] = useState('');
  const [grantAccessLevel, setGrantAccessLevel] = useState<'view' | 'download' | 'full'>('full');
  const [grantPinCode, setGrantPinCode] = useState('');
  const [grantLockToggle, setGrantLockToggle] = useState(false);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const activeAssets = assets.filter((a) => (showTrash ? a.deleted : !a.deleted));

  const filteredAssets = activeAssets.filter((asset) => {
    const matchesAlbum = selectedAlbum === 'All' || asset.album === selectedAlbum;
    const matchesType = typeFilter === 'All' || asset.type === typeFilter;
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.album.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.exif.camera.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesAccess = true;
    if (accessFilter === 'Shared') {
      matchesAccess = (asset.clientAccess || []).some((ca) => ca.status === 'active');
    } else if (accessFilter === 'Locked') {
      matchesAccess = !!asset.isLocked;
    }

    return matchesAlbum && matchesType && matchesSearch && matchesAccess;
  });

  // Client Access Helper Logic
  const handleOpenAccessModal = (targetAssets: MediaAsset[]) => {
    if (!targetAssets || targetAssets.length === 0) return;
    setAccessModalTargetAssets(targetAssets);
    setAccessActiveTab('grant');

    const activeAccesses = targetAssets
      .flatMap((a) => a.clientAccess || [])
      .filter((ca) => ca.status === 'active');
    if (activeAccesses.length > 0) {
      setGrantClientName(activeAccesses[0].clientName);
      setGrantClientEmail(activeAccesses[0].clientEmail);
    } else {
      setGrantClientName('');
      setGrantClientEmail('');
    }
    setGrantPinCode('');
    setGrantLockToggle(targetAssets.some((a) => a.isLocked));
  };

  const handleGrantSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!accessModalTargetAssets || accessModalTargetAssets.length === 0) return;
    if (!grantClientEmail.trim()) return;

    const targetIds = accessModalTargetAssets.map((a) => a.id);
    const newAccessItem: ClientAccess = {
      id: `ca-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      clientName: grantClientName.trim() || grantClientEmail.split('@')[0],
      clientEmail: grantClientEmail.trim().toLowerCase(),
      accessLevel: grantAccessLevel,
      grantedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      pinCode: grantPinCode.trim() || undefined,
      status: 'active',
    };

    setAssets((prev) =>
      prev.map((a) => {
        if (!targetIds.includes(a.id)) return a;
        const currentAccessList = a.clientAccess || [];
        const filtered = currentAccessList.filter(
          (ca) => ca.clientEmail !== newAccessItem.clientEmail,
        );
        return {
          ...a,
          clientAccess: [newAccessItem, ...filtered],
          isLocked: grantLockToggle,
          accessPin: grantPinCode.trim() || a.accessPin,
        };
      }),
    );

    showToast(
      `Secure access granted to ${newAccessItem.clientName} for ${targetIds.length} media item(s)!`,
    );
    setAccessActiveTab('manage');
  };

  const handleRevokeSingleAccess = (clientEmail: string) => {
    if (!accessModalTargetAssets) return;
    const targetIds = accessModalTargetAssets.map((a) => a.id);

    setAssets((prev) =>
      prev.map((a) => {
        if (!targetIds.includes(a.id)) return a;
        const updatedList = (a.clientAccess || []).map((ca) =>
          ca.clientEmail === clientEmail ? { ...ca, status: 'revoked' as const } : ca,
        );
        return { ...a, clientAccess: updatedList };
      }),
    );

    showToast(`Access revoked for ${clientEmail}`);
  };

  const handleRestoreSingleAccess = (clientEmail: string) => {
    if (!accessModalTargetAssets) return;
    const targetIds = accessModalTargetAssets.map((a) => a.id);

    setAssets((prev) =>
      prev.map((a) => {
        if (!targetIds.includes(a.id)) return a;
        const updatedList = (a.clientAccess || []).map((ca) =>
          ca.clientEmail === clientEmail ? { ...ca, status: 'active' as const } : ca,
        );
        return { ...a, clientAccess: updatedList };
      }),
    );

    showToast(`Access restored for ${clientEmail}`);
  };

  const handleRevokeAllAccess = () => {
    if (!accessModalTargetAssets) return;
    const targetIds = accessModalTargetAssets.map((a) => a.id);

    setAssets((prev) =>
      prev.map((a) => {
        if (!targetIds.includes(a.id)) return a;
        const updatedList = (a.clientAccess || []).map((ca) => ({
          ...ca,
          status: 'revoked' as const,
        }));
        return { ...a, clientAccess: updatedList, isLocked: true };
      }),
    );

    showToast(`All client access revoked & media locked for ${targetIds.length} item(s)`);
  };

  const handleToggleLockMedia = () => {
    if (!accessModalTargetAssets) return;
    const targetIds = accessModalTargetAssets.map((a) => a.id);
    const currentlyLocked = accessModalTargetAssets.some((a) => a.isLocked);

    setAssets((prev) =>
      prev.map((a) => {
        if (!targetIds.includes(a.id)) return a;
        return { ...a, isLocked: !currentlyLocked };
      }),
    );

    showToast(currentlyLocked ? 'Media unlocked for authorized clients' : 'Media locked down');
  };

  const handleCopyAccessLink = (clientEmail: string) => {
    const accessUrl = `${window.location.origin}/client/dashboard?accessKey=SEC-${Math.floor(100000 + Math.random() * 900000)}&email=${encodeURIComponent(clientEmail)}`;
    navigator.clipboard.writeText(accessUrl);
    setCopiedEmail(clientEmail);
    showToast('Secure client access link copied to clipboard!');
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  // Checkbox Selection
  const toggleSelectAsset = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const selectAllFiltered = () => {
    if (selectedAssetIds.length === filteredAssets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(filteredAssets.map((a) => a.id));
    }
  };

  // Asset Rename
  const handleStartRename = (asset: MediaAsset) => {
    setEditingAsset(asset);
    setRenameValue(asset.name);
  };

  const handleSaveRename = (e: FormEvent) => {
    e.preventDefault();
    if (!editingAsset || !renameValue.trim()) return;
    setAssets((prev) =>
      prev.map((a) => (a.id === editingAsset.id ? { ...a, name: renameValue.trim() } : a)),
    );
    setEditingAsset(null);
  };

  // Move Media
  const handleExecuteMove = () => {
    if (selectedAssetIds.length === 0) return;
    setAssets((prev) =>
      prev.map((a) => (selectedAssetIds.includes(a.id) ? { ...a, album: moveTargetAlbum } : a)),
    );
    setSelectedAssetIds([]);
    setIsMoveModalOpen(false);
  };

  // Soft Delete Assets
  const handleDeleteAssets = (ids: string[]) => {
    setAssets((prev) => prev.map((a) => (ids.includes(a.id) ? { ...a, deleted: true } : a)));
    setSelectedAssetIds([]);
  };

  const handleRestoreAssets = (ids: string[]) => {
    setAssets((prev) => prev.map((a) => (ids.includes(a.id) ? { ...a, deleted: false } : a)));
    setSelectedAssetIds([]);
  };

  const handlePermanentDelete = (ids: string[]) => {
    setAssets((prev) => prev.filter((a) => !ids.includes(a.id)));
    setSelectedAssetIds([]);
  };

  // Create Album
  const handleCreateAlbum = (e: FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;

    const newAlbum = {
      id: `a-${Date.now()}`,
      name: newAlbumName.trim(),
      type: newAlbumType,
      itemCount: 0,
      cover: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
    };

    setAlbums((prev) => [newAlbum, ...prev]);
    setSelectedAlbum(newAlbum.name);
    setIsNewAlbumModalOpen(false);
    setNewAlbumName('');
  };

  return (
    <PortalShell>
      {({ toggleSidebar }) => (
        <>
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-5 right-5 z-50 bg-forest text-canvas border border-gold/40 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
              <ShieldCheck className="text-gold w-5 h-5 flex-shrink-0" />
              <span className="text-[12px] font-medium">{toastMessage}</span>
            </div>
          )}

          <PortalTopbar title="Media Library & Album Organizer" onToggleSidebar={toggleSidebar}>
            <PortalBell />

            <PortalAvatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" />
          </PortalTopbar>

          {/* Dashboard Content */}
          <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
            <div className="max-w-[1200px] mx-auto space-y-8">
              {/* Header Controls & Search */}
              <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  <div className="relative w-full lg:w-80">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40"
                    />
                    <input
                      type="text"
                      placeholder="Search media by filename, camera, album..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-ink/10 pl-11 pr-4 py-3 text-[13px] outline-none focus:border-gold transition-colors rounded-full shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                  <button
                    onClick={() => setShowTrash(!showTrash)}
                    className={`px-4 py-2.5 rounded-full text-[12px] font-medium tracking-[0.05em] transition-colors flex items-center gap-2 border ${
                      showTrash
                        ? 'bg-red-50 border-red-200 text-red-700 font-semibold'
                        : 'bg-white border-ink/10 text-ink/70 hover:border-red-300'
                    }`}
                  >
                    <Trash2 size={16} />
                    {showTrash ? 'Back to Active Library' : 'Trash Bin'}
                  </button>

                  <button
                    onClick={() => setIsNewAlbumModalOpen(true)}
                    className="flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-gold transition-colors shadow-sm ml-auto lg:ml-0"
                  >
                    <FolderPlus size={16} />
                    New Album
                  </button>

                  <Link
                    to="/upload"
                    className="flex items-center gap-2 bg-gold text-white px-5 py-2.5 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-ink transition-colors shadow-sm"
                  >
                    <UploadCloud size={16} />
                    Upload Media
                  </Link>
                </div>
              </div>

              {/* Album Selector Tabs Horizontal Carousel */}
              {!showTrash && (
                <div className="space-y-2">
                  <div className="text-[11px] uppercase tracking-[0.15em] font-semibold text-ink/50">
                    Filter By Album
                  </div>
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    <button
                      onClick={() => setSelectedAlbum('All')}
                      className={`px-4 py-2 rounded-xl text-[12px] font-medium tracking-[0.05em] whitespace-nowrap transition-all border ${
                        selectedAlbum === 'All'
                          ? 'bg-ink text-white border-ink shadow-sm'
                          : 'bg-white text-ink/70 border-ink/10 hover:border-gold'
                      }`}
                    >
                      All Media ({assets.filter((a) => !a.deleted).length})
                    </button>

                    {albums.map((album) => (
                      <button
                        key={album.id}
                        onClick={() => setSelectedAlbum(album.name)}
                        className={`px-4 py-2 rounded-xl text-[12px] font-medium tracking-[0.05em] whitespace-nowrap transition-all border ${
                          selectedAlbum === album.name
                            ? 'bg-ink text-white border-ink shadow-sm'
                            : 'bg-white text-ink/70 border-ink/10 hover:border-gold'
                        }`}
                      >
                        {album.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Type & Access Filters */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-ink/5 shadow-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-ink/50 font-medium">Format:</span>
                    {(['All', 'photo', 'video', 'raw'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${
                          typeFilter === t
                            ? 'bg-gold text-ink font-semibold'
                            : 'text-ink/60 hover:text-ink hover:bg-canvas'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 border-l border-ink/10 pl-4">
                    <span className="text-[12px] text-ink/50 font-medium flex items-center gap-1">
                      <ShieldCheck size={13} className="text-forest" /> Client Access:
                    </span>
                    {(['All', 'Shared', 'Locked'] as const).map((accFilter) => (
                      <button
                        key={accFilter}
                        onClick={() => setAccessFilter(accFilter)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${
                          accessFilter === accFilter
                            ? 'bg-forest text-canvas font-semibold'
                            : 'text-ink/60 hover:text-ink hover:bg-canvas'
                        }`}
                      >
                        {accFilter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Batch Action Toolbar */}
                {selectedAssetIds.length > 0 && (
                  <div className="flex items-center gap-3 bg-canvas px-4 py-1.5 rounded-lg border border-ink/10 text-[12px]">
                    <span className="font-semibold text-ink">
                      {selectedAssetIds.length} Selected
                    </span>

                    {!showTrash ? (
                      <>
                        <button
                          onClick={() =>
                            handleOpenAccessModal(
                              assets.filter((a) => selectedAssetIds.includes(a.id)),
                            )
                          }
                          className="text-forest font-semibold hover:underline flex items-center gap-1 bg-gold/20 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <ShieldCheck size={14} className="text-forest" /> Manage Access
                        </button>
                        <button
                          onClick={() => setIsMoveModalOpen(true)}
                          className="text-gold font-medium hover:underline flex items-center gap-1"
                        >
                          <FolderInput size={14} /> Move Media
                        </button>
                        <button
                          onClick={() => handleDeleteAssets(selectedAssetIds)}
                          className="text-red-600 font-medium hover:underline flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Move to Trash
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleRestoreAssets(selectedAssetIds)}
                          className="text-emerald-700 font-medium hover:underline flex items-center gap-1"
                        >
                          <RotateCcw size={14} /> Restore Assets
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(selectedAssetIds)}
                          className="text-red-700 font-medium hover:underline flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Delete Permanently
                        </button>
                      </>
                    )}
                  </div>
                )}

                <button
                  onClick={selectAllFiltered}
                  className="text-[12px] text-ink/60 hover:text-ink font-medium flex items-center gap-1.5 ml-auto"
                >
                  {selectedAssetIds.length === filteredAssets.length &&
                  filteredAssets.length > 0 ? (
                    <CheckSquare size={16} className="text-gold" />
                  ) : (
                    <Square size={16} />
                  )}
                  <span>Select All ({filteredAssets.length})</span>
                </button>
              </div>

              {/* Media Assets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedAssetIds.includes(asset.id);
                  const activeAccesses = (asset.clientAccess || []).filter(
                    (ca) => ca.status === 'active',
                  );

                  return (
                    <div
                      key={asset.id}
                      className={`group bg-white border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col relative ${
                        isSelected ? 'border-gold ring-2 ring-gold/20' : 'border-ink/10'
                      }`}
                    >
                      {/* Checkbox Overlay */}
                      <div className="absolute top-3 left-3 z-10">
                        <button
                          onClick={() => toggleSelectAsset(asset.id)}
                          className="w-6 h-6 rounded bg-white/90 backdrop-blur-sm flex items-center justify-center text-ink shadow-xs hover:bg-ink hover:text-white transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-gold" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </div>

                      {/* Access Security Badge */}
                      <div className="absolute top-3 left-11 z-10">
                        {asset.isLocked ? (
                          <span className="bg-amber-100/90 backdrop-blur-xs text-amber-900 border border-amber-300 px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-md flex items-center gap-1 shadow-xs">
                            <Lock size={10} /> Locked
                          </span>
                        ) : activeAccesses.length > 0 ? (
                          <span className="bg-emerald-100/90 backdrop-blur-xs text-emerald-900 border border-emerald-300 px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-md flex items-center gap-1 shadow-xs">
                            <ShieldCheck size={10} className="text-emerald-700" />{' '}
                            {activeAccesses.length} Client Access
                          </span>
                        ) : null}
                      </div>

                      {/* Format Badge */}
                      <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[9px] uppercase font-bold tracking-[0.1em] rounded-md text-ink">
                        {asset.type}
                      </div>

                      {/* Image Preview Thumbnail */}
                      <div
                        className="h-44 overflow-hidden relative cursor-pointer bg-canvas"
                        onClick={() => setPreviewAsset(asset)}
                      >
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                          <Maximize2 className="text-white w-6 h-6" />
                        </div>
                      </div>

                      {/* Card Information & Action Menu */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4
                            className="font-serif text-[14px] text-ink truncate"
                            title={asset.name}
                          >
                            {asset.name}
                          </h4>
                          <span className="text-[11px] text-ink/50 block truncate">
                            Album: {asset.album}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-ink/5 text-[11px] text-ink/50">
                          <span>{asset.size}</span>

                          <div className="flex items-center gap-1">
                            {!showTrash ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenAccessModal([asset]);
                                  }}
                                  className="p-1 text-ink/60 hover:text-forest transition-colors"
                                  title="Manage Secure Client Access"
                                >
                                  <ShieldCheck
                                    size={14}
                                    className={
                                      activeAccesses.length > 0
                                        ? 'text-emerald-600'
                                        : asset.isLocked
                                          ? 'text-amber-600'
                                          : ''
                                    }
                                  />
                                </button>
                                <button
                                  onClick={() => handleStartRename(asset)}
                                  className="p-1 text-ink/40 hover:text-ink"
                                  title="Rename File"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteAssets([asset.id])}
                                  className="p-1 text-ink/40 hover:text-red-600"
                                  title="Delete Asset"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleRestoreAssets([asset.id])}
                                className="p-1 text-emerald-600 hover:underline text-[10px] font-semibold"
                              >
                                Restore
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredAssets.length === 0 && (
                <div className="bg-white border border-dashed border-ink/15 rounded-2xl p-12 text-center space-y-3">
                  <ImageIcon size={36} className="mx-auto text-ink/30" />
                  <h3 className="font-serif text-[18px]">No media assets found</h3>
                  <p className="text-[13px] text-ink/50 max-w-sm mx-auto">
                    No media matched your search query or filter criteria. Upload new media or clear
                    filters.
                  </p>
                  <Link
                    to="/upload"
                    className="inline-block bg-ink text-white px-5 py-2.5 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-gold transition-colors"
                  >
                    Upload Media
                  </Link>
                </div>
              )}
            </div>
          </main>

          {/* MEDIA PREVIEW LIGHTBOX & EXIF DETAILS MODAL */}
          {previewAsset && (
            <Modal
              open
              onOpenChange={(next) => {
                if (!next) setPreviewAsset(null);
              }}
              layout="fullscreen"
              chrome="minimal"
              overlay="heavy"
              title={previewAsset.name}
            >
              <div className="flex h-full w-full flex-col items-center justify-between gap-8 overflow-y-auto p-6 lg:flex-row lg:p-10">
                {/* High Res Image View */}
                <div className="flex-1 w-full max-h-[80vh] flex items-center justify-center">
                  <img
                    src={previewAsset.url}
                    alt={previewAsset.name}
                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                  />
                </div>

                {/* EXIF Metadata Sidebar */}
                <div className="bg-ink text-white w-full lg:w-96 rounded-2xl p-6 lg:p-8 space-y-6 flex-shrink-0 border border-white/10">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-[0.12em] text-gold">
                      {previewAsset.type}
                    </span>
                    <h3 className="font-serif text-[20px] leading-snug">{previewAsset.name}</h3>
                    <p className="text-[12px] text-white/60">Album: {previewAsset.album}</p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h4 className="text-[11px] uppercase tracking-[0.15em] text-gold font-semibold flex items-center gap-2">
                      <Info size={14} /> EXIF & File Specs
                    </h4>

                    <div className="space-y-2 text-[12px] text-white/80">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-white/40">Camera Model:</span>
                        <span className="font-medium">{previewAsset.exif.camera}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-white/40">Lens:</span>
                        <span className="font-medium">{previewAsset.exif.lens}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-white/40">Aperture / ISO:</span>
                        <span className="font-medium">
                          {previewAsset.exif.aperture} • {previewAsset.exif.iso}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-white/40">Shutter Speed:</span>
                        <span className="font-medium">{previewAsset.exif.shutter}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-white/40">Dimensions:</span>
                        <span className="font-medium">{previewAsset.dimensions}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-white/40">File Size:</span>
                        <span className="font-medium">{previewAsset.size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <button
                      onClick={() => handleOpenAccessModal([previewAsset])}
                      className="w-full bg-canvas/10 text-white border border-white/20 py-2.5 rounded-xl text-[12px] font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShieldCheck size={16} className="text-gold" />
                      Manage Secure Client Access
                    </button>

                    <div className="flex items-center gap-3">
                      <button className="flex-1 bg-gold text-ink py-3 rounded-full text-[12px] font-semibold hover:bg-gold-dark transition-colors flex items-center justify-center gap-2">
                        <Download size={16} />
                        Download High-Res
                      </button>
                      <Link
                        to="/client/dashboard"
                        className="p-3 border border-white/20 rounded-full hover:bg-white/10 transition-colors"
                        title="View in Client Portal"
                      >
                        <Share2 size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>
          )}

          {/* SECURE CLIENT ACCESS MANAGEMENT MODAL */}
          {accessModalTargetAssets && (
            <Modal
              open
              onOpenChange={(next) => {
                if (!next) setAccessModalTargetAssets(null);
              }}
              size="md"
              title={
                <span className="flex items-center gap-2">
                  <ShieldCheck className="text-gold w-6 h-6" /> Secure Client Access Control
                </span>
              }
              description={
                accessModalTargetAssets.length === 1
                  ? `Configuring access for "${accessModalTargetAssets[0].name}"`
                  : `Configuring access for ${accessModalTargetAssets.length} selected media items`
              }
            >
              {/* Modal Tabs */}
              <div className="flex border-b border-ink/10 gap-6">
                <button
                  onClick={() => setAccessActiveTab('grant')}
                  className={`pb-3 text-[13px] font-medium tracking-[0.02em] transition-colors relative flex items-center gap-2 ${
                    accessActiveTab === 'grant'
                      ? 'text-forest font-semibold'
                      : 'text-ink/50 hover:text-ink'
                  }`}
                >
                  <UserCheck size={16} />
                  Grant New Client Access
                  {accessActiveTab === 'grant' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setAccessActiveTab('manage')}
                  className={`pb-3 text-[13px] font-medium tracking-[0.02em] transition-colors relative flex items-center gap-2 ${
                    accessActiveTab === 'manage'
                      ? 'text-forest font-semibold'
                      : 'text-ink/50 hover:text-ink'
                  }`}
                >
                  <Users size={16} />
                  Manage Permissions
                  {accessActiveTab === 'manage' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full" />
                  )}
                </button>
              </div>

              {/* Tab 1: Grant Access Form */}
              {accessActiveTab === 'grant' && (
                <form
                  onSubmit={handleGrantSubmit}
                  className="space-y-4 text-[13px] overflow-y-auto pr-1"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.1em] text-ink/60 font-semibold mb-1">
                        Client Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Robert Smith"
                        value={grantClientName}
                        onChange={(e) => setGrantClientName(e.target.value)}
                        className="w-full bg-canvas border border-ink/10 p-3 rounded-lg outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.1em] text-ink/60 font-semibold mb-1">
                        Client Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="client@domain.com"
                        value={grantClientEmail}
                        onChange={(e) => setGrantClientEmail(e.target.value)}
                        className="w-full bg-canvas border border-ink/10 p-3 rounded-lg outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.1em] text-ink/60 font-semibold mb-1">
                      Access Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { level: 'view', label: 'View Only', desc: 'Web preview only' },
                        { level: 'download', label: 'Download', desc: 'High-Res downloads' },
                        { level: 'full', label: 'Full Control', desc: 'Approvals & downloads' },
                      ].map((opt) => (
                        <button
                          key={opt.level}
                          type="button"
                          onClick={() => setGrantAccessLevel(opt.level as any)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            grantAccessLevel === opt.level
                              ? 'border-forest bg-forest text-white shadow-sm'
                              : 'border-ink/10 bg-canvas text-ink hover:border-gold'
                          }`}
                        >
                          <div className="font-semibold text-[12px]">{opt.label}</div>
                          <div
                            className={`text-[10px] mt-0.5 ${grantAccessLevel === opt.level ? 'text-white/70' : 'text-ink/50'}`}
                          >
                            {opt.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-ink/5">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.1em] text-ink/60 font-semibold mb-1">
                        Optional PIN Code Protection
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 4921"
                        value={grantPinCode}
                        onChange={(e) => setGrantPinCode(e.target.value)}
                        className="w-full bg-canvas border border-ink/10 p-3 rounded-lg outline-none focus:border-gold tracking-widest font-mono text-[13px]"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-canvas border border-ink/10 rounded-xl mt-6">
                      <div>
                        <span className="block font-semibold text-[12px]">Lock Media</span>
                        <span className="text-[10px] text-ink/50">Requires PIN or auth</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGrantLockToggle(!grantLockToggle)}
                        className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${grantLockToggle ? 'bg-amber-600' : 'bg-gray-300'}`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform shadow-xs ${grantLockToggle ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-ink/10">
                    <button
                      type="button"
                      onClick={() => setAccessModalTargetAssets(null)}
                      className="px-4 py-2 text-[12px] text-ink/60 hover:text-ink"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-forest text-white px-6 py-2.5 rounded-full text-[12px] font-semibold hover:bg-gold hover:text-ink transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <ShieldCheck size={16} />
                      Grant Secure Access
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 2: Manage Active Permissions & Revoke */}
              {accessActiveTab === 'manage' && (
                <div className="space-y-4 text-[13px] overflow-y-auto pr-1 flex-1">
                  {(() => {
                    const allAccesses = accessModalTargetAssets.flatMap(
                      (a) => a.clientAccess || [],
                    );
                    const uniqueClientEmails = Array.from(
                      new Set<string>(allAccesses.map((ca) => ca.clientEmail)),
                    );

                    if (uniqueClientEmails.length === 0) {
                      return (
                        <div className="p-8 text-center bg-canvas border border-dashed border-ink/10 rounded-xl space-y-2">
                          <Users size={32} className="mx-auto text-ink/30" />
                          <h4 className="font-serif text-[16px]">No Client Access Granted Yet</h4>
                          <p className="text-[12px] text-ink/50 max-w-xs mx-auto">
                            Use the "Grant New Client Access" tab above to issue secure view or
                            download access to your clients.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[11px] text-ink/50 uppercase tracking-[0.1em] font-semibold">
                          <span>Authorized Clients ({uniqueClientEmails.length})</span>
                          <button
                            onClick={handleRevokeAllAccess}
                            className="text-red-600 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <UserX size={12} /> Revoke All Access
                          </button>
                        </div>

                        {uniqueClientEmails.map((email: string) => {
                          const clientRecords = allAccesses.filter(
                            (ca) => ca.clientEmail === email,
                          );
                          const isRevoked = clientRecords.every((ca) => ca.status === 'revoked');
                          const activeRecord =
                            clientRecords.find((ca) => ca.status === 'active') || clientRecords[0];

                          return (
                            <div
                              key={email}
                              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                                isRevoked
                                  ? 'bg-red-50/50 border-red-200 opacity-75'
                                  : 'bg-white border-ink/10 hover:border-gold'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-ink">
                                    {activeRecord.clientName}
                                  </span>
                                  {isRevoked ? (
                                    <span className="bg-red-100 text-red-800 text-[9px] uppercase font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                      <ShieldX size={10} /> Access Revoked
                                    </span>
                                  ) : (
                                    <span className="bg-emerald-100 text-emerald-800 text-[9px] uppercase font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                      <UserCheck size={10} /> Active ({activeRecord.accessLevel})
                                    </span>
                                  )}
                                </div>
                                <div className="text-[12px] text-ink/60 font-mono">{email}</div>
                                <div className="text-[10px] text-ink/40">
                                  Granted on {activeRecord.grantedAt}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <button
                                  onClick={() => handleCopyAccessLink(email)}
                                  className="px-3 py-1.5 rounded-lg border border-ink/15 text-[11px] font-medium hover:bg-canvas transition-colors flex items-center gap-1 text-ink"
                                  title="Copy Client Link"
                                >
                                  {copiedEmail === email ? (
                                    <Check size={12} className="text-emerald-600" />
                                  ) : (
                                    <Copy size={12} />
                                  )}
                                  {copiedEmail === email ? 'Copied' : 'Copy Link'}
                                </button>

                                {isRevoked ? (
                                  <button
                                    onClick={() => handleRestoreSingleAccess(email)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-[11px] font-semibold hover:bg-emerald-800 transition-colors flex items-center gap-1"
                                  >
                                    <ShieldCheck size={12} /> Re-Grant
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleRevokeSingleAccess(email)}
                                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[11px] font-semibold hover:bg-red-700 transition-colors flex items-center gap-1"
                                  >
                                    <UserX size={12} /> Revoke
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Lock / Unlock Toggle Banner */}
                        <div className="p-4 bg-canvas border border-ink/10 rounded-xl flex items-center justify-between pt-3 mt-4">
                          <div className="flex items-center gap-3">
                            {accessModalTargetAssets.some((a) => a.isLocked) ? (
                              <Lock className="text-amber-600 w-5 h-5" />
                            ) : (
                              <Unlock className="text-emerald-600 w-5 h-5" />
                            )}
                            <div>
                              <span className="block font-semibold text-[13px]">
                                {accessModalTargetAssets.some((a) => a.isLocked)
                                  ? 'Media Currently Locked'
                                  : 'Media Unlocked'}
                              </span>
                              <span className="text-[11px] text-ink/50">
                                {accessModalTargetAssets.some((a) => a.isLocked)
                                  ? 'Requires PIN or Creator approval'
                                  : 'Accessible to all authorized client links'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={handleToggleLockMedia}
                            className="px-4 py-2 rounded-xl text-[12px] font-semibold border border-ink/15 bg-white hover:bg-ink hover:text-white transition-colors"
                          >
                            {accessModalTargetAssets.some((a) => a.isLocked)
                              ? 'Unlock Media'
                              : 'Lock Media'}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </Modal>
          )}

          {/* RENAME FILE MODAL */}
          {editingAsset && (
            <Modal
              open
              onOpenChange={(next) => {
                if (!next) setEditingAsset(null);
              }}
              size="sm"
              title="Rename Asset"
            >
              <form onSubmit={handleSaveRename} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-ink/60 font-semibold mb-1">
                    Filename
                  </label>
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="w-full bg-canvas border border-ink/10 p-3 rounded-lg text-[13px] outline-none focus:border-gold"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingAsset(null)}
                    className="px-4 py-2 text-[12px] text-ink/60 hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-ink text-white px-5 py-2 rounded-full text-[12px] font-medium hover:bg-gold transition-colors"
                  >
                    Save Name
                  </button>
                </div>
              </form>
            </Modal>
          )}

          {/* MOVE MEDIA MODAL */}
          {isMoveModalOpen && (
            <Modal
              open
              onOpenChange={(next) => {
                if (!next) setIsMoveModalOpen(false);
              }}
              size="sm"
              title={`Move ${selectedAssetIds.length} Assets to Album`}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-ink/60 font-semibold mb-1">
                    Target Album
                  </label>
                  <select
                    value={moveTargetAlbum}
                    onChange={(e) => setMoveTargetAlbum(e.target.value)}
                    className="w-full bg-canvas border border-ink/10 p-3 rounded-lg text-[13px] outline-none focus:border-gold"
                  >
                    {albums.map((a) => (
                      <option key={a.id} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsMoveModalOpen(false)}
                    className="px-4 py-2 text-[12px] text-ink/60 hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteMove}
                    className="bg-ink text-white px-5 py-2 rounded-full text-[12px] font-medium hover:bg-gold transition-colors"
                  >
                    Confirm Move
                  </button>
                </div>
              </div>
            </Modal>
          )}

          {/* NEW ALBUM MODAL */}
          {isNewAlbumModalOpen && (
            <Modal
              open
              onOpenChange={(next) => {
                if (!next) setIsNewAlbumModalOpen(false);
              }}
              size="sm"
              title="Create New Album"
            >
              <form onSubmit={handleCreateAlbum} className="space-y-4 text-[13px]">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-ink/60 font-semibold mb-1">
                    Album Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smith Wedding - RAWs"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    className="w-full bg-canvas border border-ink/10 p-3 rounded-lg outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-ink/60 font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={newAlbumType}
                    onChange={(e) => setNewAlbumType(e.target.value)}
                    className="w-full bg-canvas border border-ink/10 p-3 rounded-lg outline-none focus:border-gold"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Editorial">Editorial</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Portrait">Portrait</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewAlbumModalOpen(false)}
                    className="px-4 py-2 text-[12px] text-ink/60 hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-ink text-white px-5 py-2 rounded-full text-[12px] font-medium hover:bg-gold transition-colors"
                  >
                    Create Album
                  </button>
                </div>
              </form>
            </Modal>
          )}
        </>
      )}
    </PortalShell>
  );
}
