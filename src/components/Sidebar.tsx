interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen shadow-lg">
      <nav className="p-6">
        <ul className="space-y-4">
          <li>
            <button
              onClick={() => onNavigate('brdp')}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                currentPage === 'brdp'
                  ? 'bg-blue-600'
                  : 'hover:bg-gray-700'
              }`}
            >
              BRDP
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate('settings')}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                currentPage === 'settings'
                  ? 'bg-blue-600'
                  : 'hover:bg-gray-700'
              }`}
            >
              Settings
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
