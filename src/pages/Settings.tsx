import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, Trash2, Tag } from 'lucide-react';
import { useState } from 'react';

export const Settings = () => {
  const { logout, user } = useAuth();
  const { categories, addCategory, deleteCategory } = useData();
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');
  
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await addCategory({ name: newCatName.trim(), type: newCatType });
    setNewCatName('');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8 pb-32">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ajustes</h1>
        <p className="text-gray-500 text-sm">Gestiona tu cuenta y categorías de movimientos.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-12 h-12 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                {user?.email?.[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{user?.displayName || 'Usuario'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Categorías Personalizadas</h2>
          <p className="text-sm text-gray-500 mt-1">
            Agrega nuevas agrupaciones además de las que vienen por defecto.
          </p>
        </div>

        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex gap-2">
            <select
              value={newCatType}
              onChange={(e) => setNewCatType(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
            </select>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Nueva categoría..."
              className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              maxLength={30}
            />
          </div>
          <button
            type="submit"
            disabled={!newCatName.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Agregar
          </button>
        </form>

        <div className="space-y-3">
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No tienes categorías personalizadas.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${c.type === 'expense' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      <Tag size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.name}</p>
                      <p className="text-[10px] uppercase font-semibold text-gray-500">{c.type === 'expense' ? 'Gasto' : 'Ingreso'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => c.id && deleteCategory(c.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
