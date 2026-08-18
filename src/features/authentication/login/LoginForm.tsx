"use client";

import { useAuth } from "react-oidc-context";

export function LoginForm() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <p>Verificando sesión...</p>;
  }

  if (auth.error) {
    return <p>No fue posible iniciar sesión.</p>;
  }

  return (
    <button type="button" onClick={() => auth.signinRedirect()}>
      Iniciar sesión
    </button>
  );
}
