import React, { useState } from 'react';
import { Clipboard, X, Search } from 'lucide-react';

const palavrasChave: Record<string, Record<string, string[]>> = {
  'Weight Loss': {
    Portuguese: [
      'ritual matinal', 'ritual noturno', 'bebida caseira', 'metabolismo', 'acelerar o metabolismo', 'manequim 38', 'derreter', 'secar', 'gordura localizada', 'banha', 'gordurinha', 'truque matinal', 'queimar gordura', 'segredinho', 'receitinha', 'misturinha', 'cabeça de ozempic', 'dieta', 'coquetel', 'eliminar os quilinhos extras', 'semente bariátrica', 'MONJARO', 'MONJARO NATURAL', 'Truque da banana', 'Truque do limão', 'Truque da laranja', 'Chá Japonês',
    ],
    English: [
      'morning ritual', 'night ritual', 'homemade drink', 'metabolism', 'boost metabolism', 'size 6', 'melt', 'dry', 'localized fat', 'fat', 'morning trick', 'burn fat', 'little secret', 'recipe', 'mixture', 'ozempic head', 'diet', 'cocktail', 'eliminate extra pounds', 'bariatric seed',
    ],
    Spanish: [
      'ritual matutino', 'ritual nocturno', 'bebida casera', 'metabolismo', 'acelerar el metabolismo', 'talla 38', 'derretir', 'secar', 'grasa localizada', 'grasa', 'truco matutino', 'quemar grasa', 'secretito', 'receta', 'mezcla', 'cabeza de ozempic', 'adelgazar', 'quema grasa', 'derretirá', 'eliminar los kilitos de más', 'semilla bariátrica',
    ],
  },
  'Diabetes': {
    Portuguese: [
      'tipo 2', 'glicemia', 'metformina', 'açúcar no sangue', 'glicose', 'insulina', 'ozempic', 'saxenda', 'canetinha', 'diabetes', 'método natural',
    ],
    English: [
      'type 2', 'blood sugar', 'metformin', 'glucose', 'insulin', 'ozempic', 'saxenda', 'pen', 'diabetes', 'natural method', 'Lower Blood Sugar',
    ],
    Spanish: [
      'tipo 2', 'glucemia', 'metformina', 'azúcar en sangre', 'glucosa', 'insulina', 'ozempic', 'saxenda', 'pluma', 'diabetes', 'método natural', 'Bajar azucar', 'niveles de azúcar', 'reducir mis niveles de azúcar',
    ],
  },
  'Erectile Dysfunction': {
    Portuguese: [
      'pílulas azuis', 'viagra', 'tadalafil', 'ferramenta', 'amigão', 'machado', 'martelo', 'duro como uma rocha', 'cajado', 'azulzinho', 'pepino', 'mangueira', 'banana', 'pequenino', 'vitamina caseira', 'devolver sua firmeza como nunca antes',
    ],
    English: [
      'blue pills', 'viagra', 'tadalafil', 'your tool', 'hard as a rock', 'cucumber', 'homemade vitamin', 'restore your firmness like never before', 'Nigerian Nut', 'Nigerian Tonic', 'increase size', 'blood flow hack',
    ],
    Spanish: [
      'pastillas azules', 'viagra', 'tadalafil', 'herramienta', 'duro como una roca', 'pepino', 'vitamina casera', 'devolver su firmeza como nunca antes', 'Palo', 'Problemas de erección', 'Disfunción eréctil', 'tu herramienta', 'tromba', 'huevo', 'verga',
    ],
  },
  'Extra Income': {
    Portuguese: [
      'dinheiro', 'bufunfa', 'panela', 'lucrativo', 'app', 'mudei de vida', 'renda extra', 'grana', 'dinheiro online', 'segunda profissão',
    ],
    English: [
      'cash', 'money', 'make money', 'earning money', 'lucrative', 'app', 'new app', 'changed my life', 'extra income', 'online money', 'side hustle',
    ],
    Spanish: [
      'dinero', 'hacer dinero', 'lucrativo', 'aplicación', 'cambié mi vida', 'ingresos extra', 'dinero en línea', 'segunda profesión', 'dinero fácil', 'Ganar dinero', 'Trabajar desde casa',
    ],
  },
  'Relationship': {
    Portuguese: [
      'meu ex', 'chegar lá', 'sentadinha', 'superei', 'amarração', 'frase secreta', 'conquistar ele', 'trazer de volta', 'seu amor', 'segredinho', 'reconquistar', 'veja se ele está te traindo', 'traição', 'espião', 'sedução', 'seduzir', 'casamento', 'correr atrás de você', 'Faça ele implorar para voltar com você',
    ],
    English: [
      'my ex', 'get there', 'overcome', 'secret phrase', 'conquer him', 'bring back', 'your love', 'little secret', 'win back', 'see if he is cheating on you', 'cheating', 'spy', 'seduction', 'seduce', 'marriage', 'chase after you', 'Make him beg to come back to you',
    ],
    Spanish: [
      'mi ex', 'llegar allí', 'superé', 'frase secreta', 'conquistarlo', 'traer de vuelta', 'tu amor', 'secretito', 'reconquistar', 'ver si te está engañando', 'traición', 'espía', 'seducción', 'seducir', 'matrimonio', 'Volver con ex', 'hombre te persiga',
    ],
  },
  'Skin care': {
    Portuguese: [
      'Pra quem já passou dos 45 anos', 'Creminho anti-rugas', 'Botox', 'colágeno', 'recuperar a firmeza da pele', 'ácido hialurônico', '3 vezes mais colágeno', 'pele mais jovem', 'celulites', 'unhas mais fortes', 'colágeno potente',
    ],
    English: [
      'For those over 45', 'Anti-wrinkle cream', 'Botox', 'collagen', 'restore skin firmness', 'hyaluronic acid', '3 times more collagen', 'younger skin', 'cellulite', 'stronger nails', 'potent collagen',
    ],
    Spanish: [
      'Para quienes ya pasaron los 45 años', 'Crema antiarrugas', 'Botox', 'colágeno', 'recuperar la firmeza de la piel', 'ácido hialurónico', '3 veces más colágeno', 'piel más joven', 'celulitis', 'uñas más fuertes', 'colágeno potente',
    ],
  },
};

const categorias = Object.keys(palavrasChave);

export default function ClonupFloatingWidget() {
  const [open, setOpen] = useState(false);
  const [categoria, setCategoria] = useState(categorias[0]);
  const [idioma, setIdioma] = useState(Object.keys(palavrasChave[categorias[0]])[0]);
  const [copied, setCopied] = useState<string | null>(null);

  function handleClick(palavra: string) {
    // Copiar para área de transferência
    navigator.clipboard.writeText(palavra);
    setCopied(palavra);
    setTimeout(() => setCopied(null), 1200);
    // Tentar inserir no input de busca comum
    const input = document.querySelector('input[type="search"], input[placeholder*="pesquisar" i], input[placeholder*="search" i]');
    if (input) {
      (input as HTMLInputElement).value = palavra;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      (input as HTMLInputElement).focus();
    }
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl font-bold focus:outline-none"
        onClick={() => setOpen(o => !o)}
        title="Abrir Clonup"
      >
        <Search className="w-7 h-7" />
      </button>
      {/* Popup flutuante */}
      {open && (
        <div className="fixed bottom-28 right-6 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl w-96 max-w-full max-h-[80vh] overflow-y-auto p-4 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Palavras-chave Clonup</h2>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
          </div>
          {/* Tabs de categoria */}
          <div className="flex flex-wrap gap-2 mb-3">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategoria(cat); setIdioma(Object.keys(palavrasChave[cat])[0]); }}
                className={`px-3 py-1 rounded-full text-sm font-medium ${cat === categoria ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Tabs de idioma */}
          <div className="flex gap-2 mb-4">
            {Object.keys(palavrasChave[categoria]).map(lang => (
              <button
                key={lang}
                onClick={() => setIdioma(lang)}
                className={`px-2 py-1 rounded text-xs font-semibold ${lang === idioma ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              >
                {lang}
              </button>
            ))}
          </div>
          {/* Lista de palavras */}
          <ul className="space-y-1">
            {palavrasChave[categoria][idioma].map(palavra => (
              <li key={palavra}>
                <button
                  onClick={() => handleClick(palavra)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900 text-left text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-800"
                >
                  <span>{palavra}</span>
                  {copied === palavra ? <span className="text-green-600 text-xs flex items-center gap-1"><Clipboard className="w-4 h-4" />Copiado!</span> : <Clipboard className="w-4 h-4 opacity-60" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
} 