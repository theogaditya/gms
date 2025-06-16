'use client';

export default function Header({ activeTab }: { activeTab: string }) {
  return (
    <header className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold text-white">
        {{
          dashboard: 'Agent Dashboard',
        }[activeTab as keyof object] || 'Dashboard'}
      </h1>
    </header>
  );
}