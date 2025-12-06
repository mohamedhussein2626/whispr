// components/Sidebar.tsx
import Link from "next/link";

type SidebarProps = {
  links: { name: string; href: string }[];
};

export default function Sidebar({ links }: SidebarProps) {
  return (
    <aside className="w-64 border-r h-screen bg-white flex flex-col overflow-hidden">
      <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
        <div className="p-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="block p-2 rounded hover:bg-gray-100 text-gray-700 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
