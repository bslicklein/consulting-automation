import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  MessageSquare,
  FileText,
  CheckSquare,
  Settings
} from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Consulting Automation',
  description: 'AI-powered consulting workflow platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-900 text-white flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <h1 className="text-xl font-bold">Consulting AI</h1>
              <p className="text-sm text-gray-400">Automation Platform</p>
            </div>
            
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/" 
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <LayoutDashboard size={20} />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/projects" 
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <FolderKanban size={20} />
                    Projects
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/organizations" 
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Users size={20} />
                    Organizations
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/interviews" 
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <MessageSquare size={20} />
                    Interviews
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/findings" 
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <FileText size={20} />
                    Findings
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/tasks" 
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <CheckSquare size={20} />
                    Tasks
                  </Link>
                </li>
              </ul>
            </nav>
            
            <div className="p-4 border-t border-gray-800">
              <Link 
                href="/settings" 
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400"
              >
                <Settings size={20} />
                Settings
              </Link>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-auto bg-gray-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
