import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar sessão ativa do Supabase
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
          // Se houve sign_out, redirecionar para auth
          if (event === 'SIGNED_OUT') {
            navigate('/auth', { replace: true });
          }
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();

      if (error) {
        console.error("Erro ao carregar perfil:", error);
        // Se não há perfil, usar dados do Supabase User
        setUser({
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
          email: supabaseUser.email || '',
        });
        return;
      }

      if (profile) {
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      // Fallback para dados do auth user
      setUser({
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
        email: supabaseUser.email || '',
      });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message === "Invalid login credentials" 
          ? "Email ou senha incorretos" 
          : error.message);
        return false;
      }

      if (data.user) {
        await loadUserProfile(data.user);
        toast.success("Login realizado com sucesso!");
        navigate("/");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error("Erro ao realizar login");
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Email já cadastrado");
        } else {
          toast.error(error.message);
        }
        return false;
      }

      if (data.user) {
        // Se o Supabase estiver configurado para confirmar email, mostrar mensagem
        if (data.user.identities?.length === 0) {
          toast.info("Usuário já cadastrado. Por favor, faça login.");
          return false;
        }
        
        toast.success("Cadastro realizado com sucesso!");
        
        // Se confirmação de email estiver desabilitada, fazer login automático
        if (data.session) {
          await loadUserProfile(data.user);
          navigate("/");
        } else {
          toast.info("Por favor, confirme seu email para fazer login.");
        }
        
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast.error("Erro ao realizar cadastro");
      return false;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      setUser(null);
      toast.success("Logout realizado com sucesso");
      
      // Aguarda um tick para garantir que o estado foi atualizado
      setTimeout(() => {
        navigate("/auth", { replace: true });
        setLoading(false);
      }, 100);
    } catch (error) {
      console.error("Erro no logout:", error);
      toast.error("Erro ao realizar logout");
      setUser(null);
      navigate("/auth", { replace: true });
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};
