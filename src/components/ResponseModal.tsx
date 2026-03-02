import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, Info, CheckCircle2, PlayCircle, Clock, UserCheck } from 'lucide-react';
import { Ticket, RESPONSIBLE_OPTIONS } from '../types';
import { formatTicketDate } from '../utils/dateUtils';

interface ResponseModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Ticket>) => void;
  readOnly?: boolean;
}

export default function ResponseModal({ ticket, onClose, onUpdate, readOnly }: ResponseModalProps) {
  const [adminResponse, setAdminResponse] = useState('');
  const [responsibleName, setResponsibleName] = useState('');

  useEffect(() => {
    if (ticket) {
      setAdminResponse(ticket.adminResponse || '');
      setResponsibleName(ticket.responsibleName || '');
    }
  }, [ticket]);

  if (!ticket) return null;

  const handleUpdateStatus = (newStatus: Ticket['status']) => {
    onUpdate(ticket.id, { 
      status: newStatus,
      adminResponse,
      responsibleName,
      resolvedAt: newStatus === 'Concluído' ? new Date().toISOString() : undefined
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {ticket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden border border-zinc-200 ${readOnly ? 'max-w-2xl' : 'max-w-4xl'}`}
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900">
                    {readOnly ? 'Detalhes do Chamado' : 'Atendimento do Chamado'}
                  </h2>
                  <p className="text-xs text-zinc-500 font-mono">#{ticket.id}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              {/* Ticket Info */}
              <div className={`${readOnly ? 'space-y-6' : 'bg-zinc-50/50 rounded-2xl p-6 border border-zinc-200 space-y-6'}`}>
                {!readOnly && (
                  <div className="flex items-center gap-2 text-zinc-900 font-bold border-b border-zinc-200 pb-4">
                    <Info className="w-4 h-4 text-indigo-600" />
                    Informações do Chamado
                  </div>
                )}
                
                <div className={`flex flex-wrap gap-x-8 gap-y-4 text-sm ${readOnly ? 'bg-zinc-50/50 p-4 rounded-xl border border-zinc-100' : ''}`}>
                  {ticket.problem && (
                    <div className="min-w-[120px]">
                      <p className="text-zinc-400 uppercase text-[9px] font-bold tracking-wider mb-0.5">Problema</p>
                      <p className="font-medium text-zinc-900">{ticket.problem}</p>
                    </div>
                  )}
                  <div className="min-w-[120px]">
                    <p className="text-zinc-400 uppercase text-[9px] font-bold tracking-wider mb-0.5">Colaborador</p>
                    <p className="font-medium text-zinc-900">{ticket.collaboratorName}</p>
                  </div>
                  <div className="min-w-[120px]">
                    <p className="text-zinc-400 uppercase text-[9px] font-bold tracking-wider mb-0.5">Tela</p>
                    <p className="font-medium text-zinc-900">{ticket.screen} {ticket.subScreen && `(${ticket.subScreen})`}</p>
                  </div>
                  {ticket.referenceCode && (
                    <div className="min-w-[120px]">
                      <p className="text-zinc-400 uppercase text-[9px] font-bold tracking-wider mb-0.5">Referência</p>
                      <p className="font-medium text-red-600">{ticket.referenceCode}</p>
                    </div>
                  )}
                  {ticket.collection && (
                    <div className="min-w-[120px]">
                      <p className="text-zinc-400 uppercase text-[9px] font-bold tracking-wider mb-0.5">Coleção</p>
                      <p className="font-medium text-zinc-900">{ticket.collection}</p>
                    </div>
                  )}
                  <div className="min-w-[120px]">
                    <p className="text-zinc-400 uppercase text-[9px] font-bold tracking-wider mb-0.5">Criado em</p>
                    <p className="font-medium text-zinc-900">{formatTicketDate(ticket.createdAt)}</p>
                  </div>
                  {ticket.responsibleName && (
                    <div className="min-w-[120px]">
                      <p className="text-zinc-400 uppercase text-[9px] font-bold tracking-wider mb-0.5">Responsável</p>
                      <p className="font-medium text-indigo-600">{ticket.responsibleName}</p>
                    </div>
                  )}
                  {ticket.resolvedAt && (
                    <div className="min-w-[120px]">
                      <p className="text-zinc-400 uppercase text-[9px] font-bold tracking-wider text-emerald-600 mb-0.5">Resolvido em</p>
                      <p className="font-medium text-emerald-700">{formatTicketDate(ticket.resolvedAt)}</p>
                    </div>
                  )}
                </div>

                <div className={readOnly ? '' : 'pt-4 border-t border-zinc-200'}>
                  <p className="text-zinc-400 uppercase text-[9px] font-bold tracking-wider mb-2">Descrição do Usuário</p>
                  <div className={`text-zinc-700 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm italic leading-relaxed ${readOnly ? 'text-sm' : ''}`}>
                    "{ticket.description}"
                  </div>
                </div>
              </div>

              {/* Response Form */}
              {!readOnly && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      Responsável pela Resolução
                    </label>
                    <select
                      value={responsibleName}
                      onChange={(e) => setResponsibleName(e.target.value)}
                      className="w-full p-4 rounded-2xl border border-zinc-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                    >
                      <option value="">Selecione o responsável...</option>
                      {RESPONSIBLE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.label}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {ticket.status !== 'Aberto' && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                        Resposta Detalhada
                      </label>
                      <textarea
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        placeholder="Escreva sua resposta ou observações adicionais..."
                        className="w-full p-4 rounded-2xl border border-zinc-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[250px] resize-none shadow-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {!readOnly && (
              <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex flex-wrap gap-3">
                {ticket.status === 'Aberto' && (
                  <button
                    onClick={() => handleUpdateStatus('Em Andamento')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Iniciar Atendimento (Em Andamento)
                  </button>
                )}
                
                {ticket.status !== 'Aberto' && ticket.status !== 'Concluído' && (
                  <button
                    onClick={() => handleUpdateStatus('Concluído')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Resolver Chamado
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
