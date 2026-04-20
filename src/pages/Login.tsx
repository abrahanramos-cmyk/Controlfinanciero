import { useAuth } from '../context/AuthContext';
import { Wallet } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
          <Wallet size={32} className="text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Control Financiero</h1>
        <p className="text-sm text-gray-500 mb-8">Administra tus gastos, ingresos y analiza tus finanzas personales de manera sencilla.</p>

        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continuar con Google
        </button>
      </div>
      <p className="mt-8 text-xs text-gray-400">PWA optimizada para tu móvil</p>
    </div>
  );
};
