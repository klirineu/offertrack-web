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
        `h-full px-4 py-4 hidden md:flex md:flex-col ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'} w-[300px] flex-shrink-0`,
        className
      )}
      animate={{
        width: animate ? (open ? "300px" : "60px") : "300px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
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
          `h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'} w-full`
        )}
        {...props}
      >
        <div className="flex justify-start z-20 w-full mt-4">
          <Menu
            className="text-neutral-800 dark:text-neutral-200 cursor-pointer"
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
                `fixed h-full w-full inset-0 ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'} p-10 z-[100] flex flex-col justify-between`,
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200 cursor-pointer"
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
          "flex items-center justify-start gap-2 group/sidebar py-2",
          className
        )}
        {...props}
      >
        {link.icon}
        <motion.span
          animate={{
            display: animate ? (open ? "inline-block" : "none") : "inline-block",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
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