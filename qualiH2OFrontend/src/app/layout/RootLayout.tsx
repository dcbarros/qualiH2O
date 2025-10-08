import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { LogOut, ChartNoAxesCombined, Microscope } from "lucide-react";

function CN(active: boolean) {
  return [
    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
    active ? "bg-emerald-500 text-white" : "text-sky-700 hover:bg-sky-100"
  ].join(" ");
}

export function RootLayout() {
  const { username, logout } = useAuth();
  const date = new Date;
  return (
    <div className="min-h-screen grid grid-cols-12 bg-white">

      <aside className="col-span-12 md:col-span-2 bg-white border-r border-emerald-500">
        <div className="p-4 border-b border-emerald-500">
          <div className="text-emerald-700 text-xl font-bold">QualiH2O</div>
          <div className="text-xs text-emerald-400 ">painel - análises ETE X</div>
        </div>

        <nav className="p-3 space-y-1">
          <NavLink to="/" end className={({ isActive }) => CN(isActive)}>
            <div className="flex items-center">
              <ChartNoAxesCombined className="h-3.5 w-3.5 me-2" />
              <span>Dashboard</span>
            </div>
          </NavLink>

          <NavLink to="/analises" className={({ isActive }) => CN(isActive)}>
            <div className="flex items-center">
              <Microscope className="h-3.5 w-3.5 me-2" />
              <span>Análises</span>
            </div>
          </NavLink>
        </nav>
      </aside>

      <div className="col-span-12 md:col-span-10">

        <header className="sticky top-0 z-10 bg-white border-b border-emerald-500">
          <div className="h-14 px-4 flex items-center justify-between">
            <div className="font-medium text-blue-700">Bem-vindo</div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-sm text-sky-600">Matrícula: {username}</span>
                <span className="text-sm text-sky-600">Dia: {date.toLocaleDateString()}</span>
              </div>
              <button
                onClick={logout}
                type="button"
                className="text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-xl text-sm px-4 py-2.5 text-center me-2"
                title="Sair"
              >
                <div className="flex items-center">
                  <LogOut className="h-3.5 w-3.5 me-2" />
                  <span>Sair</span>
                </div>
                
              </button>
            </div>
          </div>
        </header>

        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
