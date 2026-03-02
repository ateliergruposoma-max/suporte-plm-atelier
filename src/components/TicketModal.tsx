import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, Loader2, Search } from 'lucide-react';
import { Ticket, SCREEN_OPTIONS, INDICATOR_OPTIONS } from '../types';

interface Collaborator {
  nome: string;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticket: Omit<Ticket, 'id' | 'status' | 'createdAt'>) => void;
}

export default function TicketModal({ isOpen, onClose, onSubmit }: TicketModalProps) {
  const [screen, setScreen] = useState('');
  const [subScreen, setSubScreen] = useState('');
  const [collaboratorName, setCollaboratorName] = useState('');
  const [description, setDescription] = useState('');
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [allCollaborators, setAllCollaborators] = useState<string[]>([]);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all collaborators once on mount
  useEffect(() => {
    const fetchCollaborators = async () => {
      setIsLoadingCollaborators(true);
      try {
        const response = await fetch('https://n8n.somalabs.com.br/webhook/nomes');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const names = data.map((item: any) => typeof item === 'string' ? item : item.Nome).filter(Boolean);
            setAllCollaborators(names);
            setCollaborators(names);
          }
        }
      } catch (error) {
        console.error('Error fetching collaborators:', error);
      } finally {
        setIsLoadingCollaborators(false);
      }
    };

    fetchCollaborators();
  }, []);

  // Filter collaborators locally based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = allCollaborators.filter(name => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setCollaborators(filtered);
    } else {
      setCollaborators(allCollaborators);
    }
  }, [searchTerm, allCollaborators]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedScreen = SCREEN_OPTIONS.find(opt => opt.value === screen);
    const selectedSubScreen = INDICATOR_OPTIONS.find(opt => opt.value === subScreen);

    onSubmit({
      screen: selectedScreen?.label || screen,
      subScreen: screen === 'indicadores' ? (selectedSubScreen?.label || subScreen) : undefined,
      collaboratorName: collaboratorName,
      description,
      isUrgent: false,
    });
    // Reset form
    setScreen('');
    setSubScreen('');
    setCollaboratorName('');
    setDescription('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200"
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-600" />
                Novo Chamado
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Nome do colaborador</label>
                <div className="relative" ref={dropdownRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={collaboratorName || searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCollaboratorName('');
                      }}
                      onFocus={() => {
                        setIsDropdownOpen(true);
                      }}
                      placeholder="Digite para buscar..."
                      className="w-full pl-9 pr-10 py-3 bg-white border border-zinc-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                    {isLoadingCollaborators && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                      >
                        {collaborators.length > 0 ? (
                          collaborators.map((name, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setCollaboratorName(name);
                                setSearchTerm(name);
                                setIsDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-b border-zinc-100 last:border-0"
                            >
                              {name}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-zinc-500 text-center">
                            Nenhum colaborador encontrado
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Qual tela do PLM está ocorrendo o problema?</label>
                <select
                  required
                  value={screen}
                  onChange={(e) => {
                    setScreen(e.target.value);
                    if (e.target.value !== 'indicadores') setSubScreen('');
                  }}
                  className="w-full p-3 rounded-xl border border-zinc-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
                >
                  <option value="">Selecione a tela</option>
                  {SCREEN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <AnimatePresence mode="wait">
                {screen === 'indicadores' && (
                  <motion.div
                    key="sub-screen-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="text-sm font-medium text-zinc-700">Qual indicador?</label>
                    <select
                      required
                      value={subScreen}
                      onChange={(e) => setSubScreen(e.target.value)}
                      className="w-full p-3 rounded-xl border border-zinc-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
                    >
                      <option value="">Selecione o indicador</option>
                      {INDICATOR_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Explicação do problema</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva detalhadamente o que está acontecendo..."
                  className="w-full p-3 rounded-xl border border-zinc-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[220px] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-zinc-300 text-zinc-700 font-medium hover:bg-zinc-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  Criar Chamado
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
