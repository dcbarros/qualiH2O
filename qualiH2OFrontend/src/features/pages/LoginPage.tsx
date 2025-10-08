import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { signIn } from "../auth/api";
import { useAuth } from "../../auth/AuthContext";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const schema = z.object({
  username: z.string().min(3, "Informe seu usuário"),
  password: z.string().min(3, "Senha muito curta"),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {

  const { isAuthenticated } = useAuth(); 
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if(isAuthenticated) {
      const to = location.state?.from?.pathname ?? "/";
      navigate(to, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state])

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutateAsync, isPending, isError, error } = useMutation({
    mutationFn: signIn,
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await mutateAsync(data);
      if (res.authenticated && res.accessToken) {
        login(res.accessToken, res.username);
        navigate("/", { replace: true });
      } else {
        throw new Error("Credenciais inválidas");
      }
    } catch (e) {
      // já exibimos abaixo a mensagem de erro
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow p-6 border">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="text-sm text-gray-600">Acesse o QualiH2O</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700">Usuário</label>
            <input
              type="text"
              autoComplete="username"
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="seu usuário"
              {...register("username")}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <div className="mt-1 relative">
              <input
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                className="w-full rounded-lg border px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="••••••••"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPwd(s => !s)}
                className="absolute inset-y-0 right-2 my-auto text-sm text-gray-500 hover:text-gray-700"
                aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPwd ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* erro do servidor */}
          {isError && (
            <div className="text-sm text-red-600">
              {(error as any)?.response?.data?.message ?? "Falha ao autenticar. Verifique suas credenciais."}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-sky-600 text-white py-2.5 font-medium hover:bg-sky-700 disabled:opacity-60"
          >
            {isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-500">
          Dica: pressione <kbd className="px-1 py-0.5 border rounded">Enter</kbd> para enviar.
        </div>
      </div>
    </div>
  );
}
