import React from 'react';
import { useThemeStore } from '../store/themeStore';
import { LandingPageHeader, LandingPageFooter } from './LandingPage';
import LogoFav from '../assets/favicon.png';

export default function PrivacyPolicy() {
  const { theme } = useThemeStore();
  return (
    <div className={theme === 'dark' ? 'min-h-screen bg-[#111827] text-white' : 'min-h-screen bg-white text-gray-900'}>
      <LandingPageHeader />
      <main className="flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col items-center">
          <img src={LogoFav} alt="Clonup logo" className="w-16 h-16 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Política de Privacidade</h1>
          <div className="space-y-4 text-gray-700 dark:text-gray-300 text-base">
            <p>O Clonup valoriza a sua privacidade. Esta política explica como coletamos, usamos, protegemos e compartilhamos suas informações.</p>
            <p><span className="font-semibold">Coleta de Dados:</span> Coletamos informações fornecidas por você ao criar uma conta, utilizar nossos serviços ou entrar em contato conosco. Também coletamos dados de uso para melhorar a experiência da plataforma.</p>
            <p><span className="font-semibold">Uso das Informações:</span> Utilizamos seus dados para fornecer, operar e melhorar nossos serviços, personalizar sua experiência, enviar comunicações importantes e garantir a segurança da plataforma.</p>
            <p><span className="font-semibold">Compartilhamento:</span> Não vendemos ou compartilhamos suas informações pessoais com terceiros, exceto quando necessário para cumprir obrigações legais ou proteger nossos direitos.</p>
            <p><span className="font-semibold">Segurança:</span> Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição.</p>
            <p><span className="font-semibold">Seus Direitos:</span> Você pode acessar, corrigir ou excluir suas informações pessoais a qualquer momento. Para isso, entre em contato conosco pelo email <a href="mailto:contato@clonup.com" className="text-blue-600">contato@clonup.com</a>.</p>
            <p>Ao utilizar o Clonup, você concorda com esta política. Podemos atualizá-la periodicamente, então recomendamos revisá-la regularmente.</p>
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