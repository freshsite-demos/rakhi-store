import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, X } from 'lucide-react';
import type { Society } from '../types';

interface SocietyPickerProps {
  societies: Society[];
  selectedSociety: Society | null;
  onSelect: (society: Society) => void;
  onClear: () => void;
  showModal: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
}

export const SocietyPicker: React.FC<SocietyPickerProps> = ({
  societies,
  selectedSociety,
  onSelect,
  onClear,
  showModal,
  onOpenModal,
  onCloseModal,
}) => {
  const [selected, setSelected] = useState(selectedSociety?._id || '');
  const prevShowModal = useRef(showModal);

  // Only reset local selection to the confirmed value when the modal OPENS
  // (not when it closes — that would overwrite a freshly confirmed pick)
  useEffect(() => {
    const wasHidden = !prevShowModal.current;
    const nowVisible = showModal;
    if (wasHidden && nowVisible) {
      // Modal just opened — sync to current confirmed society
      setSelected(selectedSociety?._id || '');
    }
    prevShowModal.current = showModal;
  }, [showModal, selectedSociety]);

  const handleConfirm = () => {
    const found = societies.find((s) => s._id === selected);
    if (found) {
      onSelect(found);
      onCloseModal();
    }
  };

  return (
    <>
      {/* Sticky region banner */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2.5 flex items-center gap-3">
        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        {selectedSociety ? (
          <span className="text-xs font-bold text-zinc-700 flex-grow">
            Showing products for{' '}
            <span className="text-amber-700 font-black">{selectedSociety.name}</span>
          </span>
        ) : (
          <span className="text-xs font-bold text-zinc-500 flex-grow">
            Select your society to see available products
          </span>
        )}
        <button
          onClick={onOpenModal}
          className="text-[10px] font-black text-amber-700 uppercase tracking-widest border border-amber-200 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
        >
          <ChevronDown className="w-3 h-3" />
          {selectedSociety ? 'Change' : 'Select'}
        </button>
        {selectedSociety && (
          <button
            onClick={onClear}
            title="Show all products"
            className="text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Modal overlay */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={onCloseModal}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 flex flex-col gap-5 animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-display font-extrabold text-zinc-950 text-lg">
                  Select Your Society
                </h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                  We'll show you products available in your area
                </p>
              </div>
              <button
                onClick={onCloseModal}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4 text-zinc-600" />
              </button>
            </div>

            {/* Society List */}
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {societies.map((s) => (
                <button
                  key={s._id}
                  onClick={() => setSelected(s._id)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                    selected === s._id
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-zinc-50 border-zinc-100 hover:border-zinc-300 text-zinc-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      selected === s._id ? 'border-amber-500 bg-amber-500' : 'border-zinc-300 bg-white'
                    }`}
                  >
                    {selected === s._id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold">{s.name}</p>
                    {s.isLocality ? (
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Locality Area</p>
                    ) : (
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                        {s.blocks?.length || 0} blocks
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Confirm Button */}
            <button
              disabled={!selected}
              onClick={handleConfirm}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-sm py-3.5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 uppercase tracking-widest shadow-md"
            >
              Confirm Location
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SocietyPicker;
