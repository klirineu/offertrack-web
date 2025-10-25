/**
 * ===============================================
 * ANIMAÇÕES E UTILITÁRIOS JAVASCRIPT/TYPESCRIPT
 * Design System ClonUp - Funções Reutilizáveis
 * ===============================================
 */

// ============================================
// 1. PRELOADER
// ============================================

export const handlePreloader = (): void => {
  window.addEventListener("load", () => {
    const preloader = document.querySelector(".preloader");
    if (preloader) {
      setTimeout(() => {
        preloader.classList.add("fade-out");
        setTimeout(() => {
          preloader.remove();
        }, 500);
      }, 500);
    }
  });
};

// ============================================
// 2. SCROLL ANIMATIONS (Intersection Observer)
// ============================================

export const handleScrollAnimations = (): void => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  const fadeElements = document.querySelectorAll(".fade-in");
  fadeElements.forEach((el) => observer.observe(el));
};

// ============================================
// 3. SCROLL INDICATOR (Seta para baixo)
// ============================================

export const handleScrollIndicator = (): void => {
  const scrollIndicator = document.getElementById("scrollIndicator");

  if (scrollIndicator) {
    // Ocultar após rolar 100px
    window.addEventListener("scroll", () => {
      if (window.scrollY > 100) {
        scrollIndicator.style.opacity = "0";
        scrollIndicator.style.pointerEvents = "none";
      } else {
        scrollIndicator.style.opacity = "0.7";
        scrollIndicator.style.pointerEvents = "auto";
      }
    });

    // Click para rolar
    scrollIndicator.addEventListener("click", () => {
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      });
    });
  }
};

// ============================================
// 4. SMOOTH SCROLL (Links internos)
// ============================================

export const handleSmoothScroll = (): void => {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const href = this.getAttribute("href");
      if (href && href !== "#") {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  });
};

// ============================================
// 5. MOBILE MENU
// ============================================

export const handleMobileMenu = (): void => {
  const menuButton = document.querySelector(".mobile-menu-button");
  const navLinks = document.querySelector(".nav-links");

  if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
      navLinks.classList.toggle("active");

      // Trocar ícone
      const icon = menuButton.querySelector("i");
      if (icon) {
        if (navLinks.classList.contains("active")) {
          icon.className = "fas fa-times";
        } else {
          icon.className = "fas fa-bars";
        }
      }
    });

    // Fechar menu ao clicar em um link
    const links = navLinks.querySelectorAll("a");
    links.forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        const icon = menuButton.querySelector("i");
        if (icon) {
          icon.className = "fas fa-bars";
        }
      });
    });
  }
};

// ============================================
// 6. FAQ ACCORDION
// ============================================

export const handleFAQ = (): void => {
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
      const faqItem = question.parentElement;
      const answer = question.nextElementSibling as HTMLElement;

      if (!faqItem || !answer) return;

      // Fechar outras FAQs
      document.querySelectorAll(".faq-item").forEach((item) => {
        if (item !== faqItem) {
          const q = item.querySelector(".faq-question");
          const a = item.querySelector(".faq-answer") as HTMLElement;
          if (q && a) {
            q.classList.remove("active");
            a.style.display = "none";
          }
        }
      });

      // Toggle atual
      question.classList.toggle("active");
      if (answer.style.display === "block") {
        answer.style.display = "none";
      } else {
        answer.style.display = "block";
      }
    });
  });
};

// ============================================
// 7. THEME TOGGLE (Dark/Light Mode)
// ============================================

export const handleThemeToggle = (): void => {
  const themeToggle = document.querySelector(".theme-toggle");
  const currentTheme = localStorage.getItem("theme") || "dark";

  // Aplicar tema salvo
  if (currentTheme === "light") {
    document.body.classList.add("light-theme");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");

      const newTheme = document.body.classList.contains("light-theme")
        ? "light"
        : "dark";
      localStorage.setItem("theme", newTheme);

      // Trocar ícone
      const icon = themeToggle.querySelector("i");
      if (icon) {
        icon.className = newTheme === "light" ? "fas fa-moon" : "fas fa-sun";
      }
    });
  }
};

// ============================================
// 8. PARALLAX EFFECT
// ============================================

export const handleParallax = (selector: string, speed: number = 0.5): void => {
  const element = document.querySelector(selector) as HTMLElement;

  if (element) {
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset;
      element.style.transform = `translateY(${scrolled * speed}px)`;
    });
  }
};

// ============================================
// 9. COUNTER ANIMATION (Números animados)
// ============================================

export const animateCounter = (
  element: HTMLElement,
  target: number,
  duration: number = 2000
): void => {
  const start = 0;
  const increment = target / (duration / 16); // 60fps
  let current = start;

  const updateCounter = () => {
    current += increment;
    if (current < target) {
      element.textContent = Math.floor(current).toString();
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target.toString();
    }
  };

  updateCounter();
};

// Uso com Intersection Observer
export const handleCounterAnimations = (): void => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          !entry.target.classList.contains("counted")
        ) {
          const target = parseInt(
            entry.target.getAttribute("data-target") || "0"
          );
          animateCounter(entry.target as HTMLElement, target);
          entry.target.classList.add("counted");
        }
      });
    },
    { threshold: 0.5 }
  );

  document
    .querySelectorAll("[data-counter]")
    .forEach((el) => observer.observe(el));
};

// ============================================
// 10. TYPING EFFECT
// ============================================

export const typingEffect = (
  element: HTMLElement,
  text: string,
  speed: number = 100
): Promise<void> => {
  return new Promise((resolve) => {
    let i = 0;
    element.textContent = "";

    const type = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        resolve();
      }
    };

    type();
  });
};

// ============================================
// 11. TOAST NOTIFICATION
// ============================================

interface ToastOptions {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export const showToast = ({
  message,
  type = "info",
  duration = 3000,
  position = "top-right",
}: ToastOptions): void => {
  const toast = document.createElement("div");

  const colors = {
    success: "var(--success)",
    error: "var(--error)",
    warning: "#f59e0b",
    info: "var(--accent)",
  };

  const positions = {
    "top-right": { top: "2rem", right: "2rem" },
    "top-left": { top: "2rem", left: "2rem" },
    "bottom-right": { bottom: "2rem", right: "2rem" },
    "bottom-left": { bottom: "2rem", left: "2rem" },
  };

  Object.assign(toast.style, {
    position: "fixed",
    ...positions[position],
    background: "var(--bg-card)",
    color: "var(--text)",
    padding: "1rem 1.5rem",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    border: `1px solid ${colors[type]}`,
    zIndex: "10000",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    minWidth: "300px",
    animation: "slideIn 0.3s ease",
    borderLeft: `4px solid ${colors[type]}`,
  });

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  toast.innerHTML = `
    <span style="font-size: 1.5rem; color: ${colors[type]}">${icons[type]}</span>
    <span style="flex: 1">${message}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

// CSS para animações do Toast (adicione ao seu CSS)
const toastAnimationStyles = `
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
`;

// ============================================
// 12. COPY TO CLIPBOARD
// ============================================

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    showToast({
      message: "Copiado para a área de transferência!",
      type: "success",
    });
    return true;
  } catch (err) {
    showToast({
      message: "Erro ao copiar texto",
      type: "error",
    });
    return false;
  }
};

// ============================================
// 13. LOADING OVERLAY
// ============================================

export const showLoading = (message: string = "Carregando..."): void => {
  const overlay = document.createElement("div");
  overlay.id = "loading-overlay";

  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "rgba(11, 15, 25, 0.9)",
    backdropFilter: "blur(5px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "99999",
    gap: "1rem",
  });

  overlay.innerHTML = `
    <div class="loader">
      <div class="loader-circle"></div>
      <div class="loader-circle"></div>
      <div class="loader-circle"></div>
    </div>
    <p style="color: var(--text); font-size: 1.1rem; font-weight: 600;">${message}</p>
  `;

  document.body.appendChild(overlay);
};

export const hideLoading = (): void => {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 300);
  }
};

// ============================================
// 14. DEBOUNCE (Otimização de performance)
// ============================================

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Exemplo de uso:
// const handleSearch = debounce((value: string) => {
//   console.log('Searching for:', value);
// }, 500);

// ============================================
// 15. FORM VALIDATION
// ============================================

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message?: string;
}

export const validateField = (
  value: string,
  rules: ValidationRule
): string | null => {
  if (rules.required && !value.trim()) {
    return rules.message || "Este campo é obrigatório";
  }

  if (rules.minLength && value.length < rules.minLength) {
    return rules.message || `Mínimo de ${rules.minLength} caracteres`;
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return rules.message || `Máximo de ${rules.maxLength} caracteres`;
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return rules.message || "Formato inválido";
  }

  if (rules.custom && !rules.custom(value)) {
    return rules.message || "Valor inválido";
  }

  return null;
};

// Validações comuns
export const validationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Email inválido",
  },
  phone: {
    pattern: /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/,
    message: "Telefone inválido",
  },
  cpf: {
    pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    message: "CPF inválido",
  },
};

// ============================================
// 16. LOCAL STORAGE HELPER
// ============================================

export const storage = {
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Error saving to localStorage", e);
    }
  },

  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (e) {
      console.error("Error reading from localStorage", e);
      return defaultValue || null;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Error removing from localStorage", e);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error("Error clearing localStorage", e);
    }
  },
};

// ============================================
// 17. FORMATADORES
// ============================================

export const formatters = {
  currency: (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  },

  number: (value: number): string => {
    return new Intl.NumberFormat("pt-BR").format(value);
  },

  date: (date: Date): string => {
    return new Intl.DateTimeFormat("pt-BR").format(date);
  },

  dateTime: (date: Date): string => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  },

  percentage: (value: number, decimals: number = 0): string => {
    return `${value.toFixed(decimals)}%`;
  },

  phone: (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  },

  cpf: (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    return value;
  },
};

// ============================================
// 18. INICIALIZAÇÃO COMPLETA
// ============================================

export const initializeAllAnimations = (): void => {
  handlePreloader();
  handleScrollAnimations();
  handleScrollIndicator();
  handleSmoothScroll();
  handleMobileMenu();
  handleFAQ();
  handleThemeToggle();
  handleCounterAnimations();
};

// ============================================
// EXEMPLO DE USO COMPLETO
// ============================================

/*
// No seu arquivo principal (ex: App.tsx ou index.tsx):

import { useEffect } from 'react';
import { initializeAllAnimations, showToast, storage } from './animations';

function App() {
  useEffect(() => {
    // Inicializar todas as animações
    initializeAllAnimations();

    // Verificar usuário salvo
    const user = storage.get('user');
    if (user) {
      showToast({
        message: `Bem-vindo de volta, ${user.name}!`,
        type: 'success'
      });
    }
  }, []);

  return (
    // Seu conteúdo...
  );
}
*/

export default {
  handlePreloader,
  handleScrollAnimations,
  handleScrollIndicator,
  handleSmoothScroll,
  handleMobileMenu,
  handleFAQ,
  handleThemeToggle,
  handleParallax,
  animateCounter,
  handleCounterAnimations,
  typingEffect,
  showToast,
  copyToClipboard,
  showLoading,
  hideLoading,
  debounce,
  validateField,
  validationRules,
  storage,
  formatters,
  initializeAllAnimations,
};
