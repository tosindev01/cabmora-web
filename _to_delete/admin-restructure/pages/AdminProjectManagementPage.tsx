import React, { useState } from 'react';
import { Search, UserCheck, Edit2, Trash2 } from 'lucide-react';
import { useAdmin, Project, ProjectStage } from '@/context/AdminContext';
import AdminLayout from '@/components/AdminLayout';
import { Modal } from '@cabmora/ui';

export default function AdminProjectManagementPage() {
  const { projects, users, addProject, updateProject, deleteProject } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form for New Project
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientEmail: '',
    assignedCreatorId: '',
    stage: 'Planning' as ProjectStage,
    progress: 10,
    budget: '$5,000',
    deadline: 'Dec 31, 2026',
    deliverablesCount: 200,
    description: '',
  });

  const creatorsList = users.filter((u) => u.role === 'Creator');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.assignedCreatorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = stageFilter === 'All' || p.stage === stageFilter;

    return matchesSearch && matchesStage;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.clientName) return;

    const assignedCreator = creatorsList.find((c) => c.id === formData.assignedCreatorId);

    addProject({
      title: formData.title,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      assignedCreatorId: formData.assignedCreatorId,
      assignedCreatorName: assignedCreator ? assignedCreator.name : 'Unassigned',
      stage: formData.stage,
      progress: formData.progress,
      budget: formData.budget,
      deadline: formData.deadline,
      thumbnail:
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
      deliverablesCount: formData.deliverablesCount,
      description: formData.description,
    });

    setIsAddModalOpen(false);
    setFormData({
      title: '',
      clientName: '',
      clientEmail: '',
      assignedCreatorId: '',
      stage: 'Planning',
      progress: 10,
      budget: '$5,000',
      deadline: 'Dec 31, 2026',
      deliverablesCount: 200,
      description: '',
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const assignedCreator = creatorsList.find((c) => c.id === editingProject.assignedCreatorId);

    updateProject(editingProject.id, {
      title: editingProject.title,
      clientName: editingProject.clientName,
      clientEmail: editingProject.clientEmail,
      assignedCreatorId: editingProject.assignedCreatorId,
      assignedCreatorName: assignedCreator
        ? assignedCreator.name
        : editingProject.assignedCreatorName,
      stage: editingProject.stage,
      progress: editingProject.progress,
      budget: editingProject.budget,
      deadline: editingProject.deadline,
      description: editingProject.description,
    });

    setIsEditModalOpen(false);
    setEditingProject(null);
  };

  const handleCreatorChange = (projectId: string, newCreatorId: string) => {
    const creator = creatorsList.find((c) => c.id === newCreatorId);
    if (creator) {
      updateProject(projectId, {
        assignedCreatorId: creator.id,
        assignedCreatorName: creator.name,
      });
    }
  };

  const handleStageChange = (projectId: string, newStage: ProjectStage) => {
    let defaultProgress = 20;
    if (newStage === 'Shooting') defaultProgress = 40;
    if (newStage === 'Editing') defaultProgress = 65;
    if (newStage === 'Client Review') defaultProgress = 90;
    if (newStage === 'Completed') defaultProgress = 100;

    updateProject(projectId, {
      stage: newStage,
      progress: defaultProgress,
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-[1320px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <div>
            <h1 className="text-[30px] font-sans font-medium text-ink">
              Project & Workflow Management
            </h1>
            <p className="text-ink/60 text-[14px]">
              Assign creators to projects, track progress milestones, edit project specifications,
              and control client workflows.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white border border-ink/10 p-5 rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by project title, client, or assigned creator..."
              className="w-full bg-canvas border border-ink/15 pl-10 pr-4 py-2.5 text-[13px] outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all rounded-lg"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/50">
              Stage:
            </span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-canvas border border-ink/15 px-3 py-2 text-[12px] font-medium outline-none focus:border-gold rounded-lg"
            >
              <option value="All">All Stages ({projects.length})</option>
              <option value="Planning">Planning</option>
              <option value="Shooting">Shooting</option>
              <option value="Editing">Editing</option>
              <option value="Client Review">Client Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Projects Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-ink/10 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-ink/80 backdrop-blur-xs text-gold px-3 py-1 text-[10px] uppercase font-bold tracking-[0.1em] rounded-full border border-gold/40">
                    {project.stage}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-sans text-[18px] font-semibold text-ink mb-1">
                      {project.title}
                    </h3>
                    <p className="text-[12px] text-ink/60 line-clamp-2">{project.description}</p>
                  </div>

                  {/* Creator Assignment Box */}
                  <div className="p-3 bg-canvas border border-ink/10 rounded-lg space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-ink/50 flex items-center gap-1">
                      <UserCheck size={12} className="text-gold" /> Assigned Creator:
                    </label>
                    <select
                      value={project.assignedCreatorId}
                      onChange={(e) => handleCreatorChange(project.id, e.target.value)}
                      className="w-full bg-white border border-ink/15 px-2.5 py-1.5 text-[12px] font-semibold text-ink rounded outline-none focus:border-gold"
                    >
                      <option value="">Unassigned</option>
                      {creatorsList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.specialization || 'Creator'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Workflow Stage Controller */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-ink/60">Workflow Stage:</span>
                      <select
                        value={project.stage}
                        onChange={(e) =>
                          handleStageChange(project.id, e.target.value as ProjectStage)
                        }
                        className="bg-canvas border border-ink/10 px-2 py-0.5 text-[11px] font-bold text-ink rounded"
                      >
                        <option value="Planning">Planning</option>
                        <option value="Shooting">Shooting</option>
                        <option value="Editing">Editing</option>
                        <option value="Client Review">Client Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-ink/50">
                        <span>Progress</span>
                        <span className="font-bold text-ink">{project.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-canvas rounded-full overflow-hidden border border-ink/5">
                        <div
                          className="h-full bg-gold transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-ink/60 pt-2 border-t border-ink/5">
                    <div>
                      <span className="block text-[9px] uppercase tracking-[0.1em] font-bold text-ink/40">
                        Client
                      </span>
                      <span className="font-medium text-ink">{project.clientName}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-[0.1em] font-bold text-ink/40">
                        Budget
                      </span>
                      <span className="font-bold text-emerald-700">{project.budget}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 bg-canvas border-t border-ink/10 flex items-center justify-between">
                <button
                  onClick={() => {
                    setEditingProject(project);
                    setIsEditModalOpen(true);
                  }}
                  className="text-[12px] font-semibold text-ink hover:text-gold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 size={14} /> Edit Details
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete project ${project.title}?`)) {
                      deleteProject(project.id);
                    }
                  }}
                  className="text-[12px] font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE PROJECT MODAL */}
      {isAddModalOpen && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) (() => setIsAddModalOpen(false))();
          }}
          size="md"
          title="Create New Platform Project"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                Project Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Vogue Autumn Fashion Campaign"
                className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                  Client Email
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                Assign Creator
              </label>
              <select
                value={formData.assignedCreatorId}
                onChange={(e) => setFormData({ ...formData, assignedCreatorId: e.target.value })}
                className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
              >
                <option value="">-- Select Creator --</option>
                {creatorsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.specialization || 'Creator'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                  Total Budget
                </label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                  Stage
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) =>
                    setFormData({ ...formData, stage: e.target.value as ProjectStage })
                  }
                  className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                >
                  <option value="Planning">Planning</option>
                  <option value="Shooting">Shooting</option>
                  <option value="Editing">Editing</option>
                  <option value="Client Review">Client Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                Project Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Summary of scope, deliverables, and production requirements..."
                className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink/10">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-[12px] font-semibold text-ink/60 hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-ink text-white px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-[0.05em] hover:bg-gold hover:text-ink transition-colors"
              >
                Create Project
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT PROJECT MODAL */}
      {isEditModalOpen && editingProject && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) (() => setIsEditModalOpen(false))();
          }}
          size="md"
          title="Edit Project Details"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                Project Title
              </label>
              <input
                type="text"
                value={editingProject.title}
                onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={editingProject.clientName}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, clientName: e.target.value })
                  }
                  className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                  Budget
                </label>
                <input
                  type="text"
                  value={editingProject.budget}
                  onChange={(e) => setEditingProject({ ...editingProject, budget: e.target.value })}
                  className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                Project Description
              </label>
              <textarea
                rows={3}
                value={editingProject.description}
                onChange={(e) =>
                  setEditingProject({ ...editingProject, description: e.target.value })
                }
                className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink/10">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-[12px] font-semibold text-ink/60 hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-ink text-white px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-[0.05em] hover:bg-gold hover:text-ink transition-colors"
              >
                Update Project
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
}
