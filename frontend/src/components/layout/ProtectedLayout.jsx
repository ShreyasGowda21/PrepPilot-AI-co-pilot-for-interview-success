import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function ProtectedLayout() {
  return (
    <div className="min-h-full flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        MockMate AI – built for interview prep, powered by smart analysis.
      </footer>
    </div>
  );
}
