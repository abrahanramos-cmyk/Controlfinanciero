import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Movement, MovementType } from '../types';
import { exportToExcel } from '../lib/export';
import { Download, Plus, Filter, X, ArrowUpRight, ArrowDownRight, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const Movements = () => {
  const { movements, addMovement, deleteMovement, PREDEFINED_CATEGORIES, categories } = useData();
  const [showForm, setShowForm] = useState(false);
  
  // Filters
  const [filterType, setFilterType] = useState<'all' | MovementType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterNecessity, setFilterNecessity] = useState<'all' | 'necessary' | 'unnecessary'>('all');

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      if (filterType !== 'all' && m.type !== filterType) return false;
      if (filterCategory !== 'all' && m.category !== filterCategory) return false;
      if (filterNecessity !== 'all' && m.type === 'expense') {
        if (filterNecessity === 'necessary' && !m.isNecessary) return false;
        if (filterNecessity === 'unnecessary' && m.isNecessary) return false;
      }
      return true;
    });
  }, [movements, filterType, filterCategory, filterNecessity]);

  const allCategories = useMemo(() => {
    const custom = categories.map(c => c.name);
    return Array.from(new Set([...PREDEFINED_CATEGORIES.income, ...PREDEFINED_CATEGORIES.expense, ...custom])).sort();
  }, [categories, PREDEFINED_CATEGORIES]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Movimientos</h1>
          <p className="text-sm text-gray-500 mt-1">Registra y administra tus finanzas</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => exportToExcel(filteredMovements)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm"
          >
            <Plus size={18} />
            <span>Nuevo</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Tipo</label>
          <select 
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">Todos</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
          </select>
        </div>
        <div className="space-y-1 min-w-[150px]">
          <label className="text-xs font-semibold text-gray-500 uppercase">Categoría</label>
          <select 
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 text-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Todas</option>
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1 max-w-[150px]">
          <label className="text-xs font-semibold text-gray-500 uppercase">Necesidad</label>
          <select 
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 text-sm disabled:opacity-50"
            value={filterNecessity}
            onChange={(e) => setFilterNecessity(e.target.value as any)}
            disabled={filterType === 'income'}
          >
            <option value="all">Todos (Gastos)</option>
            <option value="necessary">Necesarios</option>
            <option value="unnecessary">Innecesarios</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredMovements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Fecha</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Descripción</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Categoría</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Monto</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((m) => (
                  <tr key={m.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(parseISO(m.date), "dd MMM yyyy", { locale: es })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{m.description}</div>
                      {m.type === 'expense' && (
                        <div className="text-xs mt-0.5">
                          {m.isNecessary ? <span className="text-emerald-600">Necesario</span> : <span className="text-red-500 font-medium">Innecesario</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">
                        {m.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={cn("font-bold flex items-center justify-end gap-1", m.type === 'income' ? 'text-green-600' : 'text-gray-900')}>
                        {m.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} className="text-red-500" />}
                        {formatCurrency(m.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => deleteMovement(m.id!)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <p>No se encontraron movimientos.</p>
          </div>
        )}
      </div>

      {showForm && (
        <MovementForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

const MovementForm = ({ onClose }: { onClose: () => void }) => {
  const { addMovement, PREDEFINED_CATEGORIES, categories } = useData();
  const [type, setType] = useState<MovementType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isNecessary, setIsNecessary] = useState(true);

  const availableCategories = useMemo(() => {
    const predefined = PREDEFINED_CATEGORIES[type];
    const custom = categories.filter(c => c.type === type).map(c => c.name);
    return Array.from(new Set([...predefined, ...custom])).sort();
  }, [type, categories, PREDEFINED_CATEGORIES]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description || !date) return;

    try {
      await addMovement({
        type,
        amount: parseFloat(amount),
        category,
        description,
        date,
        isNecessary: type === 'income' ? true : isNecessary,
        tags: []
      });
      onClose();
    } catch (err: any) {
      alert("Error al guardar el registro: " + (err.message || 'Intente nuevamente.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
          <h2 className="text-xl font-bold text-gray-900">Nuevo Registro</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={cn("flex-1 py-2 text-sm font-semibold rounded-lg transition-colors", type === 'expense' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={cn("flex-1 py-2 text-sm font-semibold rounded-lg transition-colors", type === 'income' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
            >
              Ingreso
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                required
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="" disabled>Selecciona una categoría...</option>
                {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <input
                type="text"
                required
                maxLength={100}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Ej. Compra de supermercado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            {type === 'expense' && (
              <div className="pt-2">
                <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={isNecessary}
                    onChange={e => setIsNecessary(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                  />
                  <div>
                    <div className="font-medium text-gray-900">¿Es un gasto necesario?</div>
                    <div className="text-xs text-gray-500 mt-0.5">Desmarca si fue un capricho o gasto evitable</div>
                  </div>
                </label>
              </div>
            )}
          </div>

          <div className="pt-4 sticky bottom-0 bg-white border-t border-gray-100 mt-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Guardar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
