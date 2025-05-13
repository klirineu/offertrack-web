import React from 'react';
import { useThemeStore } from '../store/themeStore';
import { LandingPageHeader, LandingPageFooter } from './LandingPage';
import LogoFav from '../assets/favicon.png';

export default function About() {
  const { theme } = useThemeStore();
  return (
    <div className={theme === 'dark' ? 'min-h-screen bg-[#111827] text-white' : 'min-h-screen bg-white text-gray-900'}>
      <LandingPageHeader />
      <main className="flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col items-center">
          <img src={LogoFav} alt="Clonup logo" className="w-16 h-16 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Sobre o Clonup</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 text-center">
            O <span className="font-semibold text-blue-600">Clonup</span> nasceu para revolucionar a forma como afiliados e produtores digitais gerenciam, clonam e acompanham suas ofertas online. Nossa missão é simplificar processos, aumentar resultados e entregar tecnologia de ponta para quem vive de performance.
          </p>
          <div className="space-y-4 text-gray-700 dark:text-gray-300 text-base">
            <p><span className="font-semibold">Missão:</span> Democratizar o acesso a ferramentas avançadas de marketing digital, tornando o gerenciamento de ofertas acessível, seguro e eficiente para todos.</p>
            <p><span className="font-semibold">Visão:</span> Ser referência nacional em soluções para afiliados e produtores digitais, promovendo inovação e resultados reais.</p>
            <p><span className="font-semibold">Valores:</span> Inovação, transparência, ética, foco no cliente e paixão por resultados.</p>
          </div>
          <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>Clonup &copy; {new Date().getFullYear()} - Todos os direitos reservados.</p>
          </div>
        </div>
      </main>
      <LandingPageFooter />
    </div>
  );
} 