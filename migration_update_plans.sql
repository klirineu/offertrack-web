-- Atualização dos planos com novos preços e funcionalidades
-- Data: 2025-10-24

-- Atualizar plano Starter
UPDATE plans
SET 
  price = 79.90,
  features = ARRAY[
    'Dashboard de Ofertas',
    'Visualize e gerencie todas suas ofertas em um único lugar',
    'Clone/Editor de Sites',
    'Clone e edite páginas de vendas com apenas um clique',
    'Anticlone',
    'Proteja suas páginas contra cópias não autorizadas',
    'Download de Criativos',
    'Baixe imagens, vídeos e outros elementos de campanhas',
    'Biblioteca de Ofertas',
    'Acesse mais de 50 ofertas escaladas para modelar',
    'Remover Metadados',
    'Limpe imagens e vídeos antes de subir para plataformas',
    'Criptografar Texto',
    'Gere textos protegidos para uso em redes sociais',
    'Trackeamento Avançado',
    'Monitore todas as métricas importantes das suas campanhas',
    'Hospedagem de Sites',
    'Hospede seus sites com alta performance e SSL gratuito',
    'Construtor/Clonador de Quiz',
    'Crie e clone quizzes interativos completos em segundos',
    'Monitoramento de até 20 bibliotecas',
    'Clone/Editor de Página',
    'Hospedagem de sites premium + SSL',
    'Suporte WhatsApp'
  ]
WHERE name = 'starter';

-- Atualizar plano Intermediário
UPDATE plans
SET 
  features = ARRAY[
    'Dashboard de Ofertas',
    'Visualize e gerencie todas suas ofertas em um único lugar',
    'Clone/Editor de Sites',
    'Clone e edite páginas de vendas com apenas um clique',
    'Anticlone',
    'Proteja suas páginas contra cópias não autorizadas',
    'Download de Criativos',
    'Baixe imagens, vídeos e outros elementos de campanhas',
    'Biblioteca de Ofertas',
    'Acesse mais de 50 ofertas escaladas para modelar',
    'Remover Metadados',
    'Limpe imagens e vídeos antes de subir para plataformas',
    'Criptografar Texto',
    'Gere textos protegidos para uso em redes sociais',
    'Trackeamento Avançado',
    'Monitore todas as métricas importantes das suas campanhas',
    'Hospedagem de Sites',
    'Hospede seus sites com alta performance e SSL gratuito',
    'Construtor/Clonador de Quiz',
    'Crie e clone quizzes interativos completos em segundos',
    'Cloaker',
    'Proteja suas campanhas e evite bloqueios de anúncios',
    'Monitoramento de até 50 bibliotecas',
    'Até 10 páginas clonadas + 10 com anticlone',
    '5 quizes inclusos (R$3 por quiz adicional)',
    'Cloaker incluso com até 100.000 requisições/mês',
    'Excedente: R$ 3,00 a cada 1.000 requisições extras',
    'Suporte prioridade'
  ]
WHERE name = 'intermediario';

-- Atualizar plano Avançado
UPDATE plans
SET 
  features = ARRAY[
    'Dashboard de Ofertas',
    'Visualize e gerencie todas suas ofertas em um único lugar',
    'Clone/Editor de Sites',
    'Clone e edite páginas de vendas com apenas um clique',
    'Anticlone',
    'Proteja suas páginas contra cópias não autorizadas',
    'Download de Criativos',
    'Baixe imagens, vídeos e outros elementos de campanhas',
    'Biblioteca de Ofertas',
    'Acesse mais de 50 ofertas escaladas para modelar',
    'Remover Metadados',
    'Limpe imagens e vídeos antes de subir para plataformas',
    'Criptografar Texto',
    'Gere textos protegidos para uso em redes sociais',
    'Trackeamento Avançado',
    'Monitore todas as métricas importantes das suas campanhas',
    'Hospedagem de Sites',
    'Hospede seus sites com alta performance e SSL gratuito',
    'Construtor/Clonador de Quiz',
    'Crie e clone quizzes interativos completos em segundos',
    'Cloaker',
    'Proteja suas campanhas e evite bloqueios de anúncios',
    'Monitoramento de até 100 bibliotecas',
    'Até 20 páginas clonadas + 20 com anticlone',
    'Quizes ilimitados',
    'Cloaker incluso com até 200.000 requisições/mês',
    'Excedente: R$ 2,00 a cada 1.000 requisições extras',
    'Suporte premium com atendimento prioritário'
  ]
WHERE name = 'avancado';

-- Verificar os planos atualizados
SELECT id, name, price, max_libraries, max_clones, max_anticlone, max_quizzes, max_cloaker_requests
FROM plans
ORDER BY price ASC;

