import { useState, useMemo } from 'react';
import { Plus, Ticket as TicketIcon, Clock, CheckCircle2, AlertCircle, LayoutDashboard, MessageSquare, Bell, Settings, User as UserIcon, Search, X as CloseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket } from './types';
import TicketModal from './components/TicketModal';
import ResponseModal from './components/ResponseModal';
import { formatTicketDate } from './utils/dateUtils';

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [view, setView] = useState<'user' | 'admin'>('user');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'urgent' | 'info' }[]>([]);

  const addNotification = (message: string, type: 'urgent' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ id, message, type }, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const hasUrgentTickets = tickets.some(t => t.isUrgent && t.status !== 'Concluído');

  const handleCreateTicket = (data: Omit<Ticket, 'id' | 'status' | 'createdAt'>) => {
    const newTicket: Ticket = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      status: 'Aberto',
      createdAt: new Date().toISOString(),
    };
    setTickets([newTicket, ...tickets]);
    if (newTicket.isUrgent) {
      addNotification('Novo chamado URGENTE criado!', 'urgent');
    }
  };

  const handleUrgentSystemDown = () => {
    const newTicket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      status: 'Aberto',
      createdAt: new Date().toISOString(),
      problem: 'SISTEMA FORA DO AR',
      screen: 'Geral',
      description: 'O sistema PLM está fora do ar ou inacessível para todos os usuários.',
      collaboratorName: 'Sistema (Alerta)',
      isUrgent: true
    };
    setTickets([newTicket, ...tickets]);
    addNotification('ALERTA: PLM FORA DO AR!', 'urgent');
  };

  const handleNormalizeSystem = () => {
    const resolvedAt = new Date().toISOString();
    const systemDownTickets = tickets.filter(t => t.problem === 'SISTEMA FORA DO AR' && t.status !== 'Concluído');
    
    if (systemDownTickets.length === 0) {
      addNotification('Nenhum chamado de sistema fora do ar encontrado.', 'info');
      return;
    }

    setTickets(tickets.map(t => 
      t.problem === 'SISTEMA FORA DO AR' && t.status !== 'Concluído'
        ? { ...t, status: 'Concluído', resolvedAt, adminResponse: 'Sistema normalizado pela equipe técnica.' } 
        : t
    ));
    addNotification('Sistema normalizado! Chamados encerrados.', 'info');
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    // Primeiro por urgência (se não estiver concluído)
    const aUrgent = a.isUrgent && a.status !== 'Concluído';
    const bUrgent = b.isUrgent && b.status !== 'Concluído';
    
    if (aUrgent && !bUrgent) return -1;
    if (!aUrgent && bUrgent) return 1;
    
    // Depois por status (Aberto > Em Andamento > Concluído)
    const statusOrder = { 'Aberto': 0, 'Em Andamento': 1, 'Concluído': 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    
    return 0; // Mantém a ordem de criação (que já é decrescente por causa do setTickets([new, ...old]))
  });

  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return sortedTickets;
    
    const query = searchQuery.toLowerCase();
    return sortedTickets.filter(ticket => 
      ticket.collaboratorName.toLowerCase().includes(query) ||
      ticket.screen.toLowerCase().includes(query) ||
      (ticket.subScreen && ticket.subScreen.toLowerCase().includes(query)) ||
      ticket.description.toLowerCase().includes(query) ||
      (ticket.problem && ticket.problem.toLowerCase().includes(query)) ||
      ticket.status.toLowerCase().includes(query) ||
      (ticket.responsibleName && ticket.responsibleName.toLowerCase().includes(query))
    );
  }, [sortedTickets, searchQuery]);

  const handleUpdateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleBulkResolve = () => {
    if (selectedIds.length === 0) return;
    
    const resolvedAt = new Date().toISOString();
    setTickets(tickets.map(t => 
      selectedIds.includes(t.id) 
        ? { ...t, status: 'Concluído', resolvedAt } 
        : t
    ));
    setSelectedIds([]);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Em Andamento': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Concluído': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-zinc-600 bg-zinc-50 border-zinc-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aberto': return <AlertCircle className="w-4 h-4" />;
      case 'Em Andamento': return <Clock className="w-4 h-4" />;
      case 'Concluído': return <CheckCircle2 className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <TicketIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">PLM Support</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
              <button
                onClick={() => setView('user')}
                title="Visão do Usuário"
                className={`flex items-center justify-center p-2 rounded-lg transition-all ${
                  view === 'user' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <UserIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('admin')}
                title="Painel de Resolução"
                className={`flex items-center justify-center p-2 rounded-lg transition-all ${
                  view === 'admin' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {view === 'user' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUrgentSystemDown}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-red-100 active:scale-95 animate-pulse"
                >
                  <AlertCircle className="w-4 h-4" />
                  PLM caiu
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-indigo-100 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Novo Chamado
                </button>
              </div>
            )}

            {view === 'admin' && (
              <div className="flex items-center gap-3">
                {selectedIds.length === 0 ? (
                  <>
                    <div className="relative hidden lg:block">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Buscar chamados..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-zinc-100 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all w-48 xl:w-64"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                          <CloseIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleNormalizeSystem}
                      className="hidden sm:flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-bold transition-all border border-indigo-200 active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden md:inline">PLM Normalizado</span>
                    </button>
                  </>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 bg-indigo-50 p-1.5 rounded-xl border border-indigo-100"
                  >
                    <span className="text-sm font-bold text-indigo-700 px-2 md:px-3 whitespace-nowrap">
                      {selectedIds.length} <span className="hidden sm:inline">selecionados</span>
                    </span>
                    <button
                      onClick={handleBulkResolve}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 md:px-4 py-1.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 whitespace-nowrap"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Concluir</span>
                    </button>
                    <button
                      onClick={() => setSelectedIds([])}
                      className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                      title="Limpar seleção"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
                
                <div className="relative p-2 text-zinc-400">
                  <Bell className={`w-6 h-6 transition-colors ${hasUrgentTickets ? 'text-red-500' : 'text-zinc-400'}`} />
                {hasUrgentTickets && (
                  <>
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
                    />
                    <motion.span 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full"
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {view === 'user' ? (
            <motion.div
              key="user-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900">Seus Chamados</h2>
                  <p className="text-zinc-500">Acompanhe o status das suas solicitações.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4 min-w-[140px] flex-1 sm:flex-none">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Abertos</p>
                      <p className="text-xl font-bold">{tickets.filter(t => t.status === 'Aberto').length}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4 min-w-[140px] flex-1 sm:flex-none">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Resolvidos</p>
                      <p className="text-xl font-bold">{tickets.filter(t => t.status === 'Concluído').length}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {sortedTickets.filter(t => t.status !== 'Concluído').length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-zinc-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="bg-zinc-100 p-4 rounded-full mb-4">
                      <TicketIcon className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900">Nenhum chamado pendente</h3>
                    <p className="text-zinc-500 max-w-xs mt-2">
                      Você não possui chamados em aberto no momento.
                    </p>
                  </div>
                ) : (
                  sortedTickets
                    .filter(t => t.status !== 'Concluído')
                    .map((ticket) => (
                    <motion.div
                      key={ticket.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group cursor-pointer active:scale-[0.99] ${
                        ticket.isUrgent 
                          ? 'bg-red-50 border-red-200 hover:border-red-300' 
                          : 'bg-white border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(ticket.status)}`}>
                              {getStatusIcon(ticket.status)}
                              {ticket.status}
                            </span>
                            <span className="text-xs text-zinc-400 font-mono">#{ticket.id}</span>
                          </div>
                          <h3 className="text-lg font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                            {ticket.problem || ticket.screen}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <p className="text-sm font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded inline-block">
                              Colaborador: {ticket.collaboratorName}
                            </p>
                            {ticket.screen && (
                              <p className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                                Tela: {ticket.screen}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-medium text-zinc-400 flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            {formatTicketDate(ticket.createdAt)}
                          </p>
                          {ticket.resolvedAt && (
                            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end mt-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {formatTicketDate(ticket.resolvedAt)}
                            </p>
                          )}
                          <button className="mt-2 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            Ver Detalhes →
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Stats / Dashboard Header */}
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900">Painel de Resolução</h2>
                  <p className="text-zinc-500">Acompanhe e resolva os chamados pendentes.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4 min-w-[140px] flex-1 sm:flex-none">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Abertos</p>
                      <p className="text-xl font-bold">{tickets.filter(t => t.status === 'Aberto').length}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4 min-w-[140px] flex-1 sm:flex-none">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Em Andamento</p>
                      <p className="text-xl font-bold">{tickets.filter(t => t.status === 'Em Andamento').length}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4 min-w-[140px] flex-1 sm:flex-none">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Resolvidos</p>
                      <p className="text-xl font-bold">{tickets.filter(t => t.status === 'Concluído').length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tickets Grid/List */}
              <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                  {tickets.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border-2 border-dashed border-zinc-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center"
                    >
                      <div className="bg-zinc-100 p-4 rounded-full mb-4">
                        <LayoutDashboard className="w-8 h-8 text-zinc-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-zinc-900">Nenhum chamado aberto</h3>
                      <p className="text-zinc-500 max-w-xs mt-2">
                        Não há chamados pendentes no momento.
                      </p>
                    </motion.div>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <motion.div
                        key={ticket.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group cursor-pointer active:scale-[0.99] relative ${
                          selectedIds.includes(ticket.id) ? 'ring-2 ring-indigo-500 border-indigo-200 bg-indigo-50/30' : 
                          ticket.isUrgent 
                            ? 'bg-red-50 border-red-200 hover:border-red-300' 
                            : 'bg-white border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(ticket.status)}`}>
                                {getStatusIcon(ticket.status)}
                                {ticket.status}
                              </span>
                              {ticket.isUrgent && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider">
                                  Urgente
                                </span>
                              )}
                              <span className="text-xs text-zinc-400 font-mono">#{ticket.id}</span>
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                              {ticket.problem || ticket.screen}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <p className="text-sm font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded inline-block">
                                Colaborador: {ticket.collaboratorName}
                              </p>
                              {ticket.screen && (
                                <p className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                                  Tela: {ticket.screen} {ticket.subScreen && `(${ticket.subScreen})`}
                                </p>
                              )}
                              {ticket.referenceCode && (
                                <p className="text-sm font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded inline-block border border-red-100">
                                  Ref: {ticket.referenceCode}
                                </p>
                              )}
                              {ticket.collection && (
                                <p className="text-sm font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded inline-block">
                                  Coleção: {ticket.collection}
                                </p>
                              )}
                              {ticket.responsibleName && (
                                <p className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block border border-indigo-100">
                                  Responsável: {ticket.responsibleName}
                                </p>
                              )}
                            </div>
                            <p className="text-zinc-600 text-sm line-clamp-2 mt-1">
                              {ticket.description}
                            </p>
                            
                            {(ticket.solution || ticket.adminResponse) && (
                              <div className="mt-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex items-start gap-3">
                                <MessageSquare className="w-4 h-4 text-zinc-400 mt-1" />
                                <div>
                                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Última Resposta</p>
                                  <p className="text-sm text-zinc-700 italic">
                                    {ticket.solution || ticket.adminResponse}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0 flex flex-col justify-between items-end h-full min-h-[100px]">
                            <div className="flex items-start gap-3">
                              <div className="space-y-1">
                                <p className="text-[10px] font-medium text-zinc-400 flex items-center gap-1 justify-end">
                                  <Clock className="w-3 h-3" />
                                  Criado: {formatTicketDate(ticket.createdAt)}
                                </p>
                                {ticket.resolvedAt && (
                                  <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 justify-end">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Resolvido: {formatTicketDate(ticket.resolvedAt)}
                                  </p>
                                )}
                              </div>
                              <div 
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSelection(ticket.id);
                                }}
                              >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  selectedIds.includes(ticket.id) 
                                    ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' 
                                    : 'bg-white border-zinc-200 group-hover:border-zinc-300'
                                }`}>
                                  {selectedIds.includes(ticket.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                </div>
                              </div>
                            </div>
                            <button className="text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              Ver Detalhes →
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTicket}
      />

      <ResponseModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onUpdate={handleUpdateTicket}
        readOnly={view === 'user'}
      />

      {/* Notifications */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
                notification.type === 'urgent'
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-white border-zinc-200 text-zinc-900'
              }`}
            >
              {notification.type === 'urgent' ? (
                <AlertCircle className="w-6 h-6 animate-bounce" />
              ) : (
                <Bell className="w-6 h-6 text-indigo-600" />
              )}
              <p className="font-bold">{notification.message}</p>
              <button 
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
