import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

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
    disabled?: boolean;
  };
}

export function SidebarLink({ link }: SidebarLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();
  const location = useLocation();

  // Verificar se a rota atual está ativa
  const isActive = location.pathname === link.href ||
    (link.subLinks && link.subLinks.some(subLink => location.pathname === subLink.href));

  const handleClick = async (e: React.MouseEvent) => {
    if (link.disabled) {
      e.preventDefault();
      alert('Você precisa ter uma assinatura ativa para acessar as Ofertas Escaladas. Redirecionando para a página de planos...');
      window.location.href = '/escolher-plano';
      return;
    }

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

  const linkStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.875rem 1.5rem',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    borderLeft: '3px solid transparent',
    fontWeight: 500,
    fontSize: '0.95rem'
  };

  const activeLinkStyle: React.CSSProperties = {
    ...linkStyle,
    background: 'var(--bg-card-hover)',
    color: 'var(--accent)',
    borderLeftColor: 'var(--accent)'
  };

  return (
    <div>
      {link.label === 'Logout' ? (
        <button
          onClick={handleClick}
          className="w-full"
          style={linkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-card-hover)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '1.25rem', width: '24px', textAlign: 'center' }}>
              {link.icon}
            </span>
            <span>{link.label}</span>
          </div>
        </button>
      ) : (
        <Link
          to={link.href}
          onClick={handleClick}
          style={{
            ...(isActive ? activeLinkStyle : linkStyle),
            ...(link.disabled ? {
              opacity: 0.5,
              cursor: 'not-allowed'
            } : {})
          }}
          onMouseEnter={(e) => {
            if (!isActive && !link.disabled) {
              e.currentTarget.style.background = 'var(--bg-card-hover)';
              e.currentTarget.style.color = 'var(--accent)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive && !link.disabled) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '1.25rem', width: '24px', textAlign: 'center' }}>
              {link.icon}
            </span>
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
              style={{
                ...linkStyle,
                paddingLeft: '2.5rem',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-card-hover)';
                e.currentTarget.style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <div className="flex items-center gap-2">
                {subLink.icon}
                <span>{subLink.label}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 