import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Navigate } from "react-router-dom";
import ProorcAdminTabs from "../components/proorc-admin/ProorcAdminTabs";

export default function ProorcAdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    loadUser();
  }, []);

  if (loading) return <div>Carregando...</div>;

  if (user?.user_metadata?.global !== "admin") {
    return <Navigate to="/proorc" />;
  }

  return <ProorcAdminTabs />;
}
