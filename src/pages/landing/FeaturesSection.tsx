import React from 'react';

const features = [
  {
    title: 'Dashboard de Ofertas',
    desc: 'Visualize e gerencie todas suas campanhas em um único lugar, com métricas importantes e controle total.',
  },
  {
    title: 'Clonador de Sites',
    desc: 'Clone páginas de vendas com apenas um clique, preservando todos os elementos e funcionalidades originais.',
  },
  {
    title: 'Anticlone',
    desc: 'Proteja suas páginas contra cópias não autorizadas com nossa tecnologia exclusiva de proteção.',
  },
  {
    title: 'Download de Criativos',
    desc: 'Baixe imagens, vídeos e outros elementos de campanhas bem-sucedidas para inspirar suas próximas criações.',
  },
  {
    title: 'Remover Metadados',
    desc: 'Limpe imagens e vídeos antes de subir para plataformas, aumentando sua segurança digital.',
  },
  {
    title: 'Criptografar Texto',
    desc: 'Gere textos protegidos para uso em redes sociais, mantendo suas estratégias seguras.',
  },
  {
    title: 'Ofertas Escaladas',
    desc: 'Ferramenta avançada para automatizar e escalar suas ofertas mais bem-sucedidas com facilidade.',
  },
  {
    title: 'Integração com Supabase',
    desc: 'Armazenamento seguro e escalável para seus dados, com infraestrutura de ponta.',
  },
];

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <h3 className="text-xl font-semibold text-blue-700 mb-2">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-2">
          Funcionalidades poderosas para sua segurança digital
        </h2>
        <p className="text-center text-lg text-gray-600 mb-10">
          Ferramentas exclusivas criadas para proteger, otimizar e escalar seu desempenho no mercado digital
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((f) => (
            <FeatureCard key={f.title} title={f.title} desc={f.desc} />
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <a
            href="#"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
          >
            Experimente todas as funcionalidades
          </a>
        </div>
      </div>
    </section>
  );
} 