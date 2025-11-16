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
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Verificar sessão ativa do Supabase
    const checkSession = async () => {
      try {
        console.log('[Auth] Verificando sessão...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[Auth] Erro ao verificar sessão:", error);
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }
        
        if (session?.user && mounted) {
          console.log('[Auth] Sessão encontrada, carregando perfil...');
          await loadUserProfile(session.user);
        } else if (mounted) {
          console.log('[Auth] Sem sessão ativa');
          setUser(null);
        }
      } catch (error) {
        console.error("[Auth] Erro ao verificar sessão:", error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          console.log('[Auth] Finalizando verificação de sessão - loading=false');
          setLoading(false);
        }
      }
    };

    checkSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] State change:', event, session?.user?.id);
        
        if (!mounted) return;

        if (session?.user) {
          await loadUserProfile(session.user);
          setLoading(false);
        } else {
          setUser(null);
          setLoading(false);
          // Não navega automaticamente - deixa o ProtectedRoute decidir
          // Isso evita redirects indesejados no F5
        }
      }
    );

    return () => {
      console.log('[Auth] Cleanup - desmontando');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Carregando perfil do usuário:', supabaseUser.id);
      
      // Timeout de segurança de 5 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao carregar perfil')), 5000)
      );

      const profilePromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .maybeSingle(); // Usa maybeSingle ao invés de single para evitar erro quando não encontrar

      const result = await Promise.race([profilePromise, timeoutPromise]) as any;
      const { data: profile, error } = result;

      // Se a tabela não existe ou há erro de permissão, usa fallback
      if (error && (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('permission'))) {
        console.log('Tabela profiles não disponível, usando dados do auth');
        setUser({
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
          email: supabaseUser.email || '',
        });
        return;
      }

      if (error || !profile) {
        console.log('Perfil não encontrado ou erro, usando dados do auth:', error?.message);
        setUser({
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
          email: supabaseUser.email || '',
        });
        return;
      }

      console.log('Perfil carregado com sucesso');
      setUser({
        id: profile.id,
        name: profile.name || supabaseUser.email?.split('@')[0] || 'Usuário',
        email: profile.email || supabaseUser.email || '',
      });
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error);
      // Fallback para dados do auth user - SEMPRE define o usuário
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

  const refreshProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user);
      }
    } catch (error) {
      console.error("Erro ao recarregar perfil:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        refreshProfile,
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
