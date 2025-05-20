import React from 'react';
import { useThemeStore } from '../store/themeStore';
import { LandingPageHeader, LandingPageFooter } from './LandingPage';
import LogoFav from '../assets/favicon.png';

export default function TermsOfUse() {
  const { theme } = useThemeStore();
  return (
    <div className={theme === 'dark' ? 'min-h-screen bg-[#111827] text-white' : 'min-h-screen bg-white text-gray-900'}>
      <LandingPageHeader />
      <main className="flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col items-center">
          <img src={LogoFav} alt="Clonup logo" className="w-16 h-16 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Termos de Uso</h1>
          <div className="space-y-4 text-gray-700 dark:text-gray-300 text-base">
            <p>Ao acessar e utilizar o Clonup, você concorda com os termos e condições abaixo. Leia atentamente antes de utilizar a plataforma.</p>
            <p><span className="font-semibold">Uso da Plataforma:</span> O Clonup destina-se a afiliados e produtores digitais para gerenciamento, clonagem e análise de ofertas. O uso para fins ilícitos ou que violem direitos de terceiros é proibido.</p>
            <p><span className="font-semibold">Responsabilidades:</span> O usuário é responsável pelas informações inseridas, pelo uso das funcionalidades e pelo cumprimento das leis aplicáveis. O Clonup não se responsabiliza por conteúdos de terceiros clonados ou gerenciados na plataforma.</p>
            <p><span className="font-semibold">Propriedade Intelectual:</span> Todo o conteúdo, marca, design e código do Clonup são protegidos por direitos autorais. É proibida a reprodução ou uso não autorizado.</p>
            <p><span className="font-semibold">Limitação de Responsabilidade:</span> O Clonup não garante disponibilidade ininterrupta, isenção de erros ou resultados específicos. O uso é por sua conta e risco.</p>
            <p><span className="font-semibold">Alterações:</span> Os termos podem ser atualizados a qualquer momento. O uso contínuo da plataforma implica concordância com as alterações.</p>
            <p>Em caso de dúvidas, entre em contato pelo email <a href="mailto:contato@clonup.pro" className="text-blue-600">contato@clonup.pro</a>.</p>
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