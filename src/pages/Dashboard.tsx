import { useData } from '../context/DataContext';
import { useMemo, useState } from 'react';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowDownRight, ArrowUpRight, AlertCircle } from 'lucide-react';
import { Movement } from '../types';
import { cn } from '../lib/utils';

type Period = 'day' | 'week' | 'month' | 'all';

export const Dashboard = () => {
  const { movements, loading } = useData();
  const [period, setPeriod] = useState<Period>('month');

  const filteredMovements = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    if (period === 'day') {
      start = startOfDay(now);
      end = endOfDay(now);
    } else if (period === 'week') {
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
    } else if (period === 'month') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    }

    if (period === 'all') return movements;

    return movements.filter(m => {
      const d = parseISO(m.date);
      return isWithinInterval(d, { start, end });
    });
  }, [movements, period]);

  const { income, expense, balance, unnecessary } = useMemo(() => {
    return filteredMovements.reduce(
      (acc, m) => {
        if (m.type === 'income') {
          acc.income += m.amount;
          acc.balance += m.amount;
        } else {
          acc.expense += m.amount;
          acc.balance -= m.amount;
          if (!m.isNecessary) {
            acc.unnecessary += m.amount;
          }
        }
        return acc;
      },
      { income: 0, expense: 0, balance: 0, unnecessary: 0 }
    );
  }, [filteredMovements]);

  const chartData = useMemo(() => {
    const expenses = filteredMovements.filter(m => m.type === 'expense');
    const categoryTotals = expenses.reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + m.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredMovements]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#0ea5e9'];

  if (loading) return <div className="p-6 text-center text-gray-500">Cargando datos...</div>;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Resumen Financiero</h1>
        
        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
          {(['day', 'week', 'month', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors",
                period === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
            >
              {p === 'day' ? 'Hoy' : p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Todo'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500">Balance Total</p>
          <p className={cn("text-3xl font-bold mt-2", balance >= 0 ? "text-gray-900" : "text-red-600")}>
            {formatCurrency(balance)}
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <ArrowUpRight className="text-green-500" size={18} />
            Ingresos
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(income)}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <ArrowDownRight className="text-red-500" size={18} />
            Gastos
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(expense)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h2 className="text-lg font-bold text-gray-900 mb-6 self-start">Distribución de Gastos</h2>
          {chartData.length > 0 ? (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
              <PieChart size={48} className="mb-2 opacity-20" />
              <p>No hay gastos registrados en este periodo</p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl shadow-sm border border-red-100 flex flex-col justify-center gap-4">
          <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm">
            <AlertCircle className="text-red-500" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-900">Gastos Innecesarios</h2>
            <p className="text-sm text-red-700/80 mt-1">Identificados en este periodo temporal.</p>
          </div>
          <div className="mt-2">
            <p className="text-3xl font-black text-red-600">{formatCurrency(unnecessary)}</p>
            {expense > 0 && (
              <p className="text-sm font-medium text-red-500 mt-1">
                Representa el {((unnecessary / expense) * 100).toFixed(1)}% de tus gastos
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
