import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getSocieties, createSociety, updateSociety, deleteSociety } from '../../services/society.service';
import type { Society, Block } from '../../types';
import { useToast } from '../../components/Toast';
import { MapPin, Plus, Trash2, ShieldAlert, X, Building, Layers, Edit2 } from 'lucide-react';

export const Societies: React.FC = () => {
  const { showToast } = useToast();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [societyName, setSocietyName] = useState('');
  const [isLocality, setIsLocality] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  
  // Temporary Block Input State
  const [blockName, setBlockName] = useState('');
  const [floorsInput, setFloorsInput] = useState(''); // e.g. "1,2,3,4,5,6,7,8,9,10"
  
  const [saving, setSaving] = useState(false);

  const loadSocieties = async () => {
    setLoading(true);
    try {
      const res = await getSocieties();
      if (res.success) {
        setSocieties(res.data);
      }
    } catch (err) {
      console.error('Failed to load societies', err);
      showToast('Failed to retrieve societies list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSocieties();
  }, []);

  const handleAddBlock = () => {
    if (!blockName.trim()) {
      showToast('Please enter a block name', 'error');
      return;
    }
    if (!floorsInput.trim()) {
      showToast('Please specify floor numbers', 'error');
      return;
    }

    // Parse floors from comma-separated input
    const floors = floorsInput
      .split(',')
      .map((f) => parseInt(f.trim(), 10))
      .filter((f) => !isNaN(f));

    if (floors.length === 0) {
      showToast('Please enter valid floor numbers (e.g. 1,2,3)', 'error');
      return;
    }

    // Check duplicate block name
    if (blocks.some((b) => b.name.toLowerCase() === blockName.trim().toLowerCase())) {
      showToast('Block name already added', 'error');
      return;
    }

    setBlocks((prev) => [...prev, { name: blockName.trim(), floors }]);
    setBlockName('');
    setFloorsInput('');
    showToast(`Added block ${blockName} with ${floors.length} floors`, 'info');
  };

  const handleRemoveBlock = (idx: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateSociety = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!societyName.trim()) {
      showToast('Please enter a name', 'error');
      return;
    }

    if (!isLocality && blocks.length === 0) {
      showToast('Please add at least one block/tower for society', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Society> = {
        name: societyName.trim(),
        blocks: isLocality ? [] : blocks,
        isLocality,
      };

      if (editingId) {
        // Edit Mode
        const res = await updateSociety(editingId, payload);
        if (res.success && res.data) {
          showToast('Updated successfully!', 'success');
          setSocieties((prev) => prev.map((s) => (s._id === editingId ? res.data : s)));
          setShowAddForm(false);
          setSocietyName('');
          setBlocks([]);
          setIsLocality(false);
          setEditingId(null);
        } else {
          showToast(res.message || 'Failed to update', 'error');
        }
      } else {
        // Create Mode
        const res = await createSociety({ ...payload, isActive: true });
        if (res.success && res.data) {
          showToast('Configured successfully!', 'success');
          setSocieties((prev) => [res.data, ...prev]);
          setShowAddForm(false);
          setSocietyName('');
          setBlocks([]);
          setIsLocality(false);
        } else {
          showToast(res.message || 'Failed to create', 'error');
        }
      }
    } catch (err: any) {
      console.error('Failed to save society', err);
      showToast(err.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await updateSociety(id, { isActive: !currentStatus });
      if (res.success && res.data) {
        showToast(`Status updated successfully`, 'success');
        setSocieties((prev) => prev.map((s) => (s._id === id ? res.data : s)));
      }
    } catch (err) {
      console.error('Society update failed', err);
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const res = await deleteSociety(id);
      if (res.success) {
        showToast('Deleted successfully', 'success');
        setSocieties((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      console.error('Delete failed', err);
      showToast('Failed to delete', 'error');
    }
  };

  const handleStartEdit = (society: Society) => {
    setEditingId(society._id);
    setSocietyName(society.name);
    setBlocks(society.blocks || []);
    setIsLocality(!!society.isLocality);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setSocietyName('');
    setBlocks([]);
    setIsLocality(false);
    setShowAddForm(false);
  };

  return (
    <AdminLayout title="Societies & Localities Management">
      <div className="flex flex-col gap-6">
        {/* Toolbar */}
        <div className="flex justify-between items-center bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm">
          <div>
            <h3 className="font-extrabold text-zinc-950 text-sm">Delivery Locations</h3>
            <p className="text-zinc-500 text-xs font-semibold mt-0.5">
              {societies.length} locations configured
            </p>
          </div>
          <button
            onClick={() => {
              if (showAddForm) {
                handleCancelEdit();
              } else {
                setShowAddForm(true);
              }
            }}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAddForm ? 'Close Form' : 'Add Location'}
          </button>
        </div>

        {/* Add Form Container */}
        {showAddForm && (
          <form
            onSubmit={handleCreateSociety}
            className="bg-white border border-zinc-100 p-5 rounded-3xl shadow-md flex flex-col gap-5 animate-slide-in"
          >
            <h4 className="font-extrabold text-zinc-900 text-sm border-b border-zinc-50 pb-2 mb-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-600" />
              {editingId ? `Edit Location: ${societyName}` : 'Configure Delivery Location'}
            </h4>

            {/* Society Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                Location / Area Name
              </label>
              <input
                type="text"
                placeholder="e.g. Smart World Gems or Sector 45"
                required
                value={societyName}
                onChange={(e) => setSocietyName(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:bg-white focus:border-zinc-900"
              />
            </div>

            {/* Locality Checkbox Toggle */}
            <div className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200/60 p-4.5 rounded-2xl">
              <input
                type="checkbox"
                id="isLocality"
                checked={isLocality}
                onChange={(e) => {
                  setIsLocality(e.target.checked);
                  if (e.target.checked) setBlocks([]); // clear blocks if it is a locality
                }}
                className="w-4 h-4 text-amber-600 border-zinc-300 rounded focus:ring-amber-500"
              />
              <label htmlFor="isLocality" className="flex flex-col cursor-pointer select-none">
                <span className="text-xs font-extrabold text-zinc-800">This is a General Locality / Sector / City</span>
                <span className="text-[10px] text-zinc-400 font-bold mt-0.5">
                  Check this if you deliver to a whole sector, area or city directly without requiring block and floor selection fields.
                </span>
              </label>
            </div>

            {/* Block builder sub-form */}
            {!isLocality && (
              <div className="border border-zinc-100 bg-zinc-50/40 p-4 rounded-2xl flex flex-col gap-4">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">
                  Configure Blocks / Towers & Floors
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Block Name */}
                  <div className="flex flex-col gap-1 bg-white p-3 rounded-xl border border-zinc-100">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-zinc-400" />
                      Block / Tower Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tower J"
                      value={blockName}
                      onChange={(e) => setBlockName(e.target.value)}
                      className="bg-zinc-50 border border-zinc-100 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:bg-white"
                    />
                  </div>

                  {/* Floors commas input */}
                  <div className="flex flex-col gap-1 bg-white p-3 rounded-xl border border-zinc-100">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-zinc-400" />
                      Floor Numbers (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1,2,3,4,5,6,7,8,9,10"
                      value={floorsInput}
                      onChange={(e) => setFloorsInput(e.target.value)}
                      className="bg-zinc-50 border border-zinc-100 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddBlock}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-[10px] py-2.5 px-4 rounded-xl transition-all shadow self-end uppercase tracking-wider flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Block
                </button>

                {/* Added blocks list */}
                {blocks.length > 0 && (
                  <div className="bg-white border border-zinc-100 p-3 rounded-xl flex flex-col gap-2">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Added Blocks List ({blocks.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {blocks.map((b, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 border border-zinc-100 bg-zinc-50 pl-2.5 pr-1.5 py-1 rounded-xl text-xs font-semibold text-zinc-800"
                        >
                          <span>
                            {b.name} ({b.floors.length} floors)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBlock(idx)}
                            className="p-0.5 rounded text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions for Form */}
            <div className="flex gap-2.5 justify-end mt-1">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="border border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-extrabold text-xs py-2.5 px-5 rounded-xl transition-all active:scale-95 uppercase tracking-wider"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:active:scale-100 px-6 uppercase tracking-wider"
              >
                {saving ? 'Saving...' : editingId ? 'Update Location' : 'Save Location'}
              </button>
            </div>
          </form>
        )}

        {/* Societies Configuration list grid */}
        {loading ? (
          <div className="bg-white border border-zinc-100 p-8 rounded-3xl flex justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-zinc-200 border-t-amber-600 animate-spin" />
          </div>
        ) : societies.length === 0 ? (
          <div className="bg-white border border-zinc-100 p-12 rounded-3xl text-center text-zinc-400 text-sm font-semibold flex flex-col items-center gap-2">
            <ShieldAlert className="w-10 h-10 text-zinc-300" />
            <span>No delivery locations configured. Please add one above.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {societies.map((society) => (
              <div
                key={society._id}
                className="bg-white border border-zinc-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-5"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-50 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-zinc-950 text-sm md:text-base">
                        {society.name}
                      </span>
                      {society.isLocality && (
                        <span className="bg-rose-50 text-rose-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-rose-100/50">
                          Locality
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleStatus(society._id, society.isActive)}
                      className={`border text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider transition-colors ${
                        society.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100'
                          : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {society.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  {/* Blocks listing info */}
                  {!society.isLocality ? (
                    <div className="flex flex-col gap-2.5">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Blocks / Towers Configured ({society.blocks.length})
                      </span>
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                        {society.blocks.map((block) => (
                          <div
                            key={block.name}
                            className="bg-zinc-50 border border-zinc-100 px-2.5 py-1.5 rounded-xl text-xs text-zinc-700 font-semibold"
                            title={`Floors: ${block.floors.join(', ')}`}
                          >
                            <span className="font-bold text-zinc-900 block">{block.name}</span>
                            <span className="text-[10px] text-zinc-400 block mt-0.5">
                              {block.floors.length} floors (L{block.floors[0]}-L
                              {block.floors[block.floors.length - 1]})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-zinc-400 text-xs py-3 font-semibold flex items-center gap-1.5 bg-zinc-50/50 px-3.5 rounded-xl border border-zinc-100/50 border-dashed">
                      <Layers className="w-4 h-4 text-zinc-300" />
                      <span>Whole area delivery (No blocks/floors required at checkout).</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-zinc-50 pt-3 flex items-center justify-between gap-4">
                  <button
                    onClick={() => handleStartEdit(society)}
                    className="flex items-center gap-1 text-zinc-600 hover:text-zinc-900 font-bold text-xs uppercase"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                    Edit Details
                  </button>
                  <button
                    onClick={() => handleDelete(society._id, society.name)}
                    className="flex items-center gap-1 text-rose-500 hover:text-rose-600 font-bold text-xs uppercase"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Location
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
export default Societies;
