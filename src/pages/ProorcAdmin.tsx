import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Navigate } from "react-router-dom";
import AdminTabs from "@/components/proorc/AdminTabs";

export default function ProorcAdmin() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    getUser();
  }, []);

  if (loading) return <div>Carregando...</div>;

  // 🔐 trava acesso
  if (user?.user_metadata?.global !== "admin") {
    return <Navigate to="/proorc" />;
  }

  return <AdminTabs />;
}
