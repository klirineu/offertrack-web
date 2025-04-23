import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface SubLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarLinkProps {
  link: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    subLinks?: SubLink[];
  };
}

export function SidebarLink({ link }: SidebarLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();

  const handleClick = async (e: React.MouseEvent) => {
    if (link.label === 'Logout') {
      e.preventDefault();
      await signOut();
      return;
    }

    if (link.subLinks) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div>
      {link.label === 'Logout' ? (
        <button
          onClick={handleClick}
          className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <div className="flex items-center gap-2">
            {link.icon}
            <span>{link.label}</span>
          </div>
        </button>
      ) : (
        <Link
          to={link.href}
          onClick={handleClick}
          className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <div className="flex items-center gap-2">
            {link.icon}
            <span>{link.label}</span>
          </div>
          {link.subLinks && (
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
        </Link>
      )}

      {link.subLinks && isOpen && (
        <div className="ml-4 mt-1 space-y-1">
          {link.subLinks.map((subLink, idx) => (
            <Link
              key={idx}
              to={subLink.href}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              {subLink.icon}
              <span>{subLink.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 