import { useState } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { StandardNavigation } from '../../components/StandardNavigation';
import { useAuth } from '../../context/AuthContext';


export function EncryptText() {
  const { theme } = useThemeStore();
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const homoglyphs: { [key: string]: string } = {
    'a': 'а', // cyrillic a
    'b': 'b', // mantemos para parecer normal
    'c': 'с', // cyrillic c
    'd': 'ԁ', // cyrillic d
    'e': 'е', // cyrillic e
    'g': 'ɡ', // latin g
    'h': 'һ', // cyrillic h
    'i': 'і', // cyrillic i
    'k': 'κ', // greek k
    'l': 'ⅼ', // roman numeral l
    'm': 'м', // cyrillic m
    'n': 'ո', // armenian n
    'o': 'о', // cyrillic o
    'p': 'р', // cyrillic p
    'q': 'ԛ', // cyrillic q
    'r': 'r', // keep r
    's': 'ѕ', // cyrillic s
    't': 'т', // cyrillic t
    'u': 'υ', // greek u
    'v': 'ѵ', // cyrillic v
    'w': 'ԝ', // cyrillic w
    'x': 'х', // cyrillic x
    'y': 'у', // cyrillic y
    'z': 'ᴢ', // latin z
    'ç': 'ҫ', // cyrillic c cedilha
    'á': 'а́',
    'é': 'е́',
    'ã': 'а̃',
    'õ': 'о̃',
    'â': 'а̂',
    'ê': 'е̂',
  };

  function obfuscateChar(char: string) {
    const lower = char.toLowerCase();
    const mapped = homoglyphs[lower] || char;
    const finalChar = (char === char.toUpperCase()) ? mapped.toUpperCase() : mapped;
    return finalChar + '\u200B'; // adiciona um caractere invisível após cada letra
  }

  const encryptText = () => {
    const result = input.split('').map(obfuscateChar).join('');
    setOutput(result);
  };

  return (
    <StandardNavigation>
      <div className="px-4 py-8 lg:px-0 pt-16 lg:pt-0">
        <header className={`${theme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-white shadow-sm'} px-4 py-4 lg:px-8`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Criptografar Texto</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8 lg:px-8">
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Texto para criptografar:</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className={`w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base`}
                  rows={4}
                  placeholder="Digite seu texto aqui..."
                />
              </div>

              <button
                onClick={encryptText}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Criptografar
              </button>

              {output && (
                <div>
                  <label className="block text-sm font-medium mb-2">Resultado:</label>
                  <div className="p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-lg break-all text-sm sm:text-base">{output}</div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </StandardNavigation>
  );
}
