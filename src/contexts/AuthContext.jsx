import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({ isAdmin: false, admin: null, loading: true });

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const verifyToken = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setIsAdmin(false);
      setAdmin(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.valid) {
        setIsAdmin(true);
        setAdmin(data.admin);
      } else {
        localStorage.removeItem('adminToken');
        setIsAdmin(false);
        setAdmin(null);
      }
    } catch (err) {
      console.error('Auth verify error:', err);
      setIsAdmin(false);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const login = async (name, password) => {
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('adminToken', data.token);
      setIsAdmin(true);
      setAdmin(data.admin);
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);