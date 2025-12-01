"use client";

type NavItem = { key: string; label: string };

export function Sidebar({ active }: { active: string }) {
  const navItems: NavItem[] = [
    { key: "bookings", label: "Boekingen" },
    { key: "services", label: "Services" },
    { key: "opening", label: "Openingstijden" },
    { key: "clients", label: "Clients" },
  ];

  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col gap-4 border-r border-[#e8e0eb] bg-[#fff9fd] px-4 py-6 shadow-sm lg:flex">
      <div className="rounded-2xl bg-[#2f1126] px-4 py-3 text-white shadow-md">
        <p className="text-xs uppercase tracking-[0.2em] text-[#f5d7e3]">VV Beauty</p>
        <p className="text-lg font-semibold">Admin</p>
        <p className="text-sm text-[#f5d7e3]/80">Beheer</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <div
            key={item.key}
            className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
              active === item.key
                ? "bg-white text-[#2f1126] shadow-sm"
                : "text-[#4c3b49] hover:bg-white hover:shadow-sm"
            }`}
          >
            {item.label}
          </div>
        ))}
      </nav>
      <div className="mt-auto space-y-2 text-xs text-[#4c3b49]">
        <p>Live data via Supabase.</p>
        <p>Gebruik service role.</p>
      </div>
    </aside>
  );
}
