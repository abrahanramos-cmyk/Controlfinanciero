import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Movement, Category } from '../types';

interface DataContextType {
  movements: Movement[];
  categories: Category[];
  loading: boolean;
  addMovement: (m: Omit<Movement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMovement: (id: string, m: Omit<Movement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteMovement: (id: string) => Promise<void>;
  addCategory: (c: Omit<Category, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  PREDEFINED_CATEGORIES: { income: string[], expense: string[] };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const PREDEFINED_CATEGORIES = {
  income: ['Salario', 'Negocios', 'Inversiones', 'Regalos', 'Otros'],
  expense: ['Alimentación', 'Transporte', 'Servicios', 'Entretenimiento', 'Salud', 'Educación', 'Ropa', 'Hogar', 'Otros']
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMovements([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubMovements: () => void;
    let unsubCategories: () => void;

    try {
      const qMovements = query(collection(db, 'movements'), where('userId', '==', user.uid));
      unsubMovements = onSnapshot(qMovements, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movement));
        // Sort in memory by date descending
        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setMovements(data);
      }, (err) => handleFirestoreError(err, 'list', 'movements'));

      const qCategories = query(collection(db, 'categories'), where('userId', '==', user.uid));
      unsubCategories = onSnapshot(qCategories, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(data);
        setLoading(false);
      }, (err) => {
        handleFirestoreError(err, 'list', 'categories');
        setLoading(false);
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
    }

    return () => {
      if (unsubMovements) unsubMovements();
      if (unsubCategories) unsubCategories();
    };
  }, [user]);

  const addMovement = async (m: Omit<Movement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    try {
      const now = Date.now();
      await addDoc(collection(db, 'movements'), {
        ...m,
        userId: user.uid,
        createdAt: now,
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, 'create', 'movements');
    }
  };

  const updateMovement = async (id: string, m: Omit<Movement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    try {
      const old = movements.find(x => x.id === id);
      if (!old) return;
      await updateDoc(doc(db, 'movements', id), {
        ...m,
        userId: user.uid,
        createdAt: old.createdAt, // Preserve creation time
        updatedAt: Date.now()
      });
    } catch (err) {
      handleFirestoreError(err, 'update', `movements/${id}`);
    }
  };

  const deleteMovement = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'movements', id));
    } catch (err) {
      handleFirestoreError(err, 'delete', `movements/${id}`);
    }
  };

  const addCategory = async (c: Omit<Category, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'categories'), {
        ...c,
        userId: user.uid,
        createdAt: Date.now(),
      });
    } catch (err) {
      handleFirestoreError(err, 'create', 'categories');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err) {
      handleFirestoreError(err, 'delete', `categories/${id}`);
    }
  };

  return (
    <DataContext.Provider value={{
      movements,
      categories,
      loading,
      addMovement,
      updateMovement,
      deleteMovement,
      addCategory,
      deleteCategory,
      PREDEFINED_CATEGORIES
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
