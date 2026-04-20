import * as XLSX from 'xlsx';
import { Movement } from '../types';
import { format } from 'date-fns';

export const exportToExcel = (movements: Movement[]) => {
  if (movements.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  const exportData = movements.map(m => ({
    Fecha: format(new Date(m.date), 'dd/MM/yyyy'),
    Tipo: m.type === 'income' ? 'Ingreso' : 'Gasto',
    Categoría: m.category,
    Descripción: m.description,
    Monto: m.amount,
    '¿Necesario?': m.type === 'expense' ? (m.isNecessary ? 'Sí' : 'No') : 'N/A'
  }));

  // Calculate totals
  const totalIncome = movements.filter(m => m.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = movements.filter(m => m.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  // Add empty row
  exportData.push({ Fecha: '', Tipo: '', Categoría: '', Descripción: '', Monto: null as any, '¿Necesario?': '' });
  
  // Add total rows
  exportData.push({ Fecha: 'TOTAL INGRESOS', Tipo: '', Categoría: '', Descripción: '', Monto: totalIncome, '¿Necesario?': '' });
  exportData.push({ Fecha: 'TOTAL GASTOS', Tipo: '', Categoría: '', Descripción: '', Monto: totalExpense, '¿Necesario?': '' });
  exportData.push({ Fecha: 'BALANCE TOTAL', Tipo: '', Categoría: '', Descripción: '', Monto: balance, '¿Necesario?': '' });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Movimientos");

  // Adjust column widths roughly
  worksheet['!cols'] = [
    { wch: 12 }, // Fecha
    { wch: 10 }, // Tipo
    { wch: 15 }, // Categoria
    { wch: 30 }, // Descripcion
    { wch: 12 }, // Monto
    { wch: 12 }, // Necesario
  ];

  XLSX.writeFile(workbook, `Control_Financiero_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
};
