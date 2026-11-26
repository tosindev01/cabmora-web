import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Image as ImageIcon,
  HardDrive,
  UploadCloud,
  File,
  Film,
  Music,
  CheckCircle2,
  X,
  Pause,
  Play,
  RotateCcw,
  Plus,
  ArrowRight,
  FolderPlus,
} from 'lucide-react';
import { PortalAvatar, PortalBell, PortalShell, PortalTopbar } from '@/shared/portal';
import { EXISTING_ALBUMS, UploadItem } from '@/features/media/data';

export default function MediaUploadPage() {
  const [selectedAlbum, setSelectedAlbum] = useState(EXISTING_ALBUMS[0]);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [showNewAlbumInput, setShowNewAlbumInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([
    {
      id: '1',
      name: 'Tuscany_Ceremony_RAW_0042.CR3',
      size: 48500000,
      type: 'raw',
      progress: 100,
      status: 'completed',
      folder: 'Ceremony RAWs',
      speed: '12.4 MB/s',
    },
    {
      id: '2',
      name: 'Tuscany_Bridal_Prep_4K_ProRes.mov',
      size: 1420000000,
      type: 'video',
      progress: 68,
      status: 'uploading',
      folder: '4K Footage',
      speed: '18.2 MB/s',
    },
    {
      id: '3',
      name: 'Reception_Dance_Floor_0189.JPG',
      size: 12400000,
      type: 'photo',
      progress: 45,
      status: 'uploading',
      folder: 'Reception Photos',
      speed: '9.5 MB/s',
    },
    {
      id: '4',
      name: 'Speech_Audio_Track_Mic1.wav',
      size: 89000000,
      type: 'audio',
      progress: 20,
      status: 'paused',
      folder: 'Audio Sync',
      speed: '0 MB/s',
    },
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Simulate ongoing uploads progress tick
  useEffect(() => {
    const interval = setInterval(() => {
      setUploadQueue((prevQueue) =>
        prevQueue.map((item) => {
          if (item.status === 'uploading' && item.progress < 100) {
            const nextProgress = Math.min(item.progress + Math.floor(Math.random() * 8) + 3, 100);
            return {
              ...item,
              progress: nextProgress,
              status: nextProgress === 100 ? 'completed' : 'uploading',
              speed:
                nextProgress === 100 ? 'Completed' : `${(Math.random() * 8 + 12).toFixed(1)} MB/s`,
            };
          }
          return item;
        }),
      );
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: UploadItem[] = Array.from(files).map((file, idx) => {
      let fileType: 'photo' | 'video' | 'raw' | 'audio' = 'photo';
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (['cr2', 'cr3', 'nef', 'arw', 'dng', 'raw'].includes(ext)) {
        fileType = 'raw';
      } else if (['mp4', 'mov', 'm4v', 'prores', 'avi'].includes(ext)) {
        fileType = 'video';
      } else if (['wav', 'mp3', 'aac', 'm4a'].includes(ext)) {
        fileType = 'audio';
      }

      return {
        id: `upload-${Date.now()}-${idx}`,
        name: file.name,
        size: file.size,
        type: fileType,
        progress: 0,
        status: 'uploading',
        folder: selectedAlbum,
        speed: '14.2 MB/s',
      };
    });

    setUploadQueue((prev) => [...newItems, ...prev]);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const togglePauseResume = (id: string) => {
    setUploadQueue((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.status === 'uploading') {
            return { ...item, status: 'paused', speed: 'Paused' };
          } else if (item.status === 'paused') {
            return { ...item, status: 'uploading', speed: '12.0 MB/s' };
          }
        }
        return item;
      }),
    );
  };

  const retryUpload = (id: string) => {
    setUploadQueue((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, progress: 5, status: 'uploading', speed: '11.5 MB/s' };
        }
        return item;
      }),
    );
  };

  const removeUpload = (id: string) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const pauseAll = () => {
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.status === 'uploading' ? { ...item, status: 'paused', speed: 'Paused' } : item,
      ),
    );
  };

  const resumeAll = () => {
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.status === 'paused' ? { ...item, status: 'uploading', speed: '14.0 MB/s' } : item,
      ),
    );
  };

  const createAlbum = () => {
    if (!newAlbumName.trim()) return;
    EXISTING_ALBUMS.push(newAlbumName.trim());
    setSelectedAlbum(newAlbumName.trim());
    setNewAlbumName('');
    setShowNewAlbumInput(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const totalFiles = uploadQueue.length;
  const completedFiles = uploadQueue.filter((i) => i.status === 'completed').length;
  const overallBytesTotal = uploadQueue.reduce((acc, curr) => acc + curr.size, 0);
  const overallBytesUploaded = uploadQueue.reduce(
    (acc, curr) => acc + curr.size * (curr.progress / 100),
    0,
  );
  const overallPercent =
    overallBytesTotal > 0 ? Math.round((overallBytesUploaded / overallBytesTotal) * 100) : 0;

  return (
    <PortalShell>
      {({ toggleSidebar }) => (
        <>
          <PortalTopbar
            title="Media Bulk Uploader"
            subtitle="Upload RAW photography, 4K ProRes videos, and audio stems directly to client galleries."
            onToggleSidebar={toggleSidebar}
          >
            <PortalBell />

            <PortalAvatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" />
          </PortalTopbar>

          {/* Dashboard Content */}
          <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
            <div className="max-w-[1200px] mx-auto space-y-8">
              {/* Target Album Selection Bar */}
              <div className="bg-white border border-ink/5 p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <label className="text-[11px] tracking-[0.15em] uppercase text-ink/50 font-medium block mb-2">
                    Target Album / Gallery
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedAlbum}
                      onChange={(e) => setSelectedAlbum(e.target.value)}
                      className="bg-canvas border border-ink/10 px-4 py-2.5 text-[13px] font-medium outline-none focus:border-gold rounded-lg min-w-[260px]"
                    >
                      {EXISTING_ALBUMS.map((album) => (
                        <option key={album} value={album}>
                          {album}
                        </option>
                      ))}
                    </select>

                    {!showNewAlbumInput ? (
                      <button
                        onClick={() => setShowNewAlbumInput(true)}
                        className="flex items-center gap-1.5 text-[12px] text-gold font-medium hover:underline"
                      >
                        <Plus size={14} />
                        New Album
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Album name..."
                          value={newAlbumName}
                          onChange={(e) => setNewAlbumName(e.target.value)}
                          className="bg-canvas border border-ink/10 px-3 py-2 text-[12px] outline-none focus:border-gold rounded-md"
                        />
                        <button
                          onClick={createAlbum}
                          className="bg-ink text-white px-3 py-2 text-[11px] uppercase tracking-[0.05em] font-medium rounded-md hover:bg-gold transition-colors"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setShowNewAlbumInput(false)}
                          className="text-ink/40 hover:text-ink"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-[12px] text-ink/60 border-t md:border-t-0 pt-4 md:pt-0 border-ink/5 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <HardDrive size={18} className="text-gold" />
                    <div>
                      <span className="font-semibold text-ink">450 GB</span> / 2 TB Used
                    </div>
                  </div>
                  <Link
                    to="/ai"
                    className="text-[12px] text-ink font-medium tracking-[0.05em] hover:text-gold transition-colors underline"
                  >
                    AI Assistants
                  </Link>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-10 lg:p-14 text-center transition-all duration-300 relative ${
                  isDragging
                    ? 'border-gold bg-gold/5 scale-[0.99]'
                    : 'border-ink/15 bg-white hover:border-gold/60'
                }`}
              >
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <input
                  type="file"
                  multiple
                  // @ts-ignore
                  webkitdirectory=""
                  directory=""
                  ref={folderInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-canvas border border-ink/10 flex items-center justify-center mx-auto text-gold">
                    <UploadCloud size={32} />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-serif text-[20px]">
                      Drag & Drop media files or folders here
                    </h3>
                    <p className="text-[13px] text-ink/50">
                      Supports RAW photos (CR3, NEF, ARW), 4K ProRes videos (MOV, MP4), high-res
                      JPEGs, and WAV audio stems up to 10 GB per file.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-ink text-white px-6 py-3 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-gold transition-colors shadow-sm"
                    >
                      Select Files
                    </button>
                    <button
                      onClick={() => folderInputRef.current?.click()}
                      className="bg-white border border-ink/15 text-ink px-6 py-3 rounded-full text-[12px] font-medium tracking-[0.05em] hover:border-gold transition-colors shadow-sm flex items-center gap-2"
                    >
                      <FolderPlus size={16} />
                      Select Folder
                    </button>
                  </div>
                </div>
              </div>

              {/* Overall Queue Summary & Resumable Controls */}
              {uploadQueue.length > 0 && (
                <div className="space-y-6">
                  <div className="bg-white border border-ink/5 p-6 rounded-xl shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-[20px]">Upload Progress</h3>
                        <p className="text-[12px] text-ink/60">
                          {completedFiles} of {totalFiles} files uploaded (
                          {formatSize(overallBytesUploaded)} of {formatSize(overallBytesTotal)})
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={pauseAll}
                          className="px-4 py-2 border border-ink/10 rounded-lg text-[11px] font-medium uppercase tracking-[0.05em] hover:bg-canvas transition-colors flex items-center gap-1.5"
                        >
                          <Pause size={14} />
                          Pause All
                        </button>
                        <button
                          onClick={resumeAll}
                          className="px-4 py-2 bg-ink text-white rounded-lg text-[11px] font-medium uppercase tracking-[0.05em] hover:bg-gold transition-colors flex items-center gap-1.5"
                        >
                          <Play size={14} />
                          Resume All
                        </button>
                      </div>
                    </div>

                    {/* Overall Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-medium text-ink/60">
                        <span>Batch Progress</span>
                        <span>{overallPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-canvas rounded-full overflow-hidden border border-ink/5">
                        <div
                          className="h-full bg-gold transition-all duration-300"
                          style={{ width: `${overallPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Upload Queue Items List */}
                  <div className="bg-white border border-ink/5 rounded-xl overflow-hidden shadow-sm divide-y divide-ink/5">
                    {uploadQueue.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 lg:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-canvas/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-canvas border border-ink/10 flex items-center justify-center flex-shrink-0 text-ink/70">
                            {item.type === 'raw' && <File size={18} className="text-gold" />}
                            {item.type === 'photo' && (
                              <ImageIcon size={18} className="text-blue-600" />
                            )}
                            {item.type === 'video' && (
                              <Film size={18} className="text-purple-600" />
                            )}
                            {item.type === 'audio' && (
                              <Music size={18} className="text-emerald-600" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[14px] truncate">{item.name}</span>
                              <span className="text-[10px] uppercase font-bold tracking-[0.05em] px-2 py-0.5 rounded bg-ink/5 text-ink/60">
                                {item.type}
                              </span>
                              {item.folder && (
                                <span className="text-[11px] text-ink/40 hidden lg:inline">
                                  in {item.folder}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-[11px] text-ink/50 mt-1">
                              <span>{formatSize(item.size)}</span>
                              <span>•</span>
                              <span
                                className={
                                  item.status === 'completed'
                                    ? 'text-emerald-600 font-medium'
                                    : item.status === 'paused'
                                      ? 'text-amber-600'
                                      : 'text-ink/70'
                                }
                              >
                                {item.status === 'completed'
                                  ? 'Completed'
                                  : item.status === 'paused'
                                    ? 'Paused'
                                    : item.speed}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* File Progress Bar and Controls */}
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                          <div className="w-36 lg:w-48 space-y-1">
                            <div className="flex justify-between text-[10px] text-ink/60">
                              <span>{item.status}</span>
                              <span>{item.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-canvas rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  item.status === 'completed'
                                    ? 'bg-emerald-500'
                                    : item.status === 'paused'
                                      ? 'bg-amber-500'
                                      : 'bg-gold'
                                }`}
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            {item.status !== 'completed' && (
                              <button
                                onClick={() => togglePauseResume(item.id)}
                                className="p-1.5 text-ink/60 hover:text-ink hover:bg-ink/5 rounded transition-colors"
                                title={item.status === 'uploading' ? 'Pause' : 'Resume'}
                              >
                                {item.status === 'uploading' ? (
                                  <Pause size={16} />
                                ) : (
                                  <Play size={16} />
                                )}
                              </button>
                            )}

                            {item.status === 'paused' && (
                              <button
                                onClick={() => retryUpload(item.id)}
                                className="p-1.5 text-ink/60 hover:text-ink hover:bg-ink/5 rounded transition-colors"
                                title="Retry Upload"
                              >
                                <RotateCcw size={16} />
                              </button>
                            )}

                            {item.status === 'completed' ? (
                              <CheckCircle2 size={18} className="text-emerald-500" />
                            ) : (
                              <button
                                onClick={() => removeUpload(item.id)}
                                className="p-1.5 text-ink/40 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Cancel upload"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {completedFiles > 0 && (
                    <div className="flex justify-end pt-2">
                      <Link
                        to="/galleries"
                        className="bg-ink text-white px-6 py-3 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-gold transition-colors shadow-sm inline-flex items-center gap-2"
                      >
                        <span>Organize in Media Library</span>
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </>
      )}
    </PortalShell>
  );
}
