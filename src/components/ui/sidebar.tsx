import { cn } from "../../lib/utils";
import { Link } from "react-router-dom";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../context/AuthContext';

interface Links {
  label: string;
  href: string;
  icon?: React.JSX.Element | React.ReactNode;
  subLinks?: {
    label: string;
    href: string;
    icon?: React.JSX.Element | React.ReactNode;
  }[];
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
  const { theme } = useThemeStore();

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  const { theme } = useThemeStore();
  return (
    <motion.div
      className={cn(
        `h-full px-4 py-4 hidden md:flex md:flex-col flex-shrink-0 fixed left-0 top-0 z-40`,
        className
      )}
      style={{
        background: '#0b0f19',
        borderRight: '1px solid rgba(30, 41, 59, 0.5)'
      }}
      animate={{
        width: animate ? (open ? "240px" : "70px") : "240px",
      }}
      {...props}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full flex items-center justify-center transition-all z-50"
        style={{
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          color: 'white',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
          zIndex: 1000,
        }}
        title={open ? "Recolher sidebar" : "Expandir sidebar"}
      >
        <i className={`fas fa-chevron-${open ? 'left' : 'right'}`} style={{ fontSize: '0.7rem' }}></i>
      </button>
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  const { theme } = useThemeStore();
  return (
    <>
      <div
        className={cn(
          `h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between w-full`
        )}
        style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)'
        }}
        {...props}
      >
        <div className="flex justify-start z-20 w-full mt-4">
          <Menu
            style={{ color: 'var(--text)' }}
            className="cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                `fixed h-full w-full inset-0 p-10 z-[100] flex flex-col justify-between`,
                className
              )}
              style={{
                background: 'var(--bg-card)'
              }}
            >
              <div
                className="absolute right-10 top-10 z-50 cursor-pointer"
                style={{ color: 'var(--text)' }}
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: any;
}) => {
  const { open, animate } = useSidebar();
  const { signOut } = useAuth();
  const location = window.location;
  const isActive = location.pathname === link.href || location.pathname.startsWith(link.href + '/');

  const linkStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.7rem 1rem',
    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    borderLeft: isActive ? '4px solid var(--accent)' : '4px solid transparent',
    fontWeight: isActive ? 700 : 500,
    background: isActive ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
    borderRadius: isActive ? '0 8px 8px 0' : '0'
  };

  return (
    <>
      <Link
        to={link.href}
        onClick={() => {
          if (link.label === 'Logout') {
            signOut();
          }
        }}
        className={cn(
          "flex items-center justify-start gap-3 group/sidebar",
          className
        )}
        style={linkStyle}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'var(--bg-card-hover)';
            e.currentTarget.style.color = 'var(--accent)';
            e.currentTarget.style.borderLeftColor = 'var(--accent)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderLeftColor = 'transparent';
          }
        }}
        {...props}
      >
        <span style={{
          fontSize: '1.1rem',
          width: open ? '20px' : '100%',
          textAlign: 'center',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {link.icon}
        </span>
        <motion.span
          animate={{
            display: animate ? (open ? "inline-block" : "none") : "inline-block",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className="group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
          style={{ fontSize: '0.85rem' }}
        >
          {link.label}
        </motion.span>
      </Link>
      {link.subLinks && open && (
        <div className="ml-4">
          {link.subLinks.map((subLink, idx) => (
            <SidebarLink key={idx} link={subLink} className={className} />
          ))}
        </div>
      )}
    </>
  );
};