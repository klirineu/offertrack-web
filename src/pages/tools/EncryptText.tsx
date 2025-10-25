import { useState } from 'react';
import { StandardNavigation } from '../../components/StandardNavigation';
import { Circle } from 'lucide-react';


export function EncryptText() {
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
      {(sidebarOpen) => (
        <>
          <header className={`page-header ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} style={{ zIndex: 10 }}>
            <div className="page-header-icon">
              <Circle className="w-6 h-6" />
            </div>
            <div className="page-header-content">
              <h1 className="page-header-title">Criptografar Texto</h1>
              <p className="page-header-subtitle">Proteja seus textos com criptografia</p>
            </div>
          </header>

          <main className="px-4 py-8 lg:px-8" style={{ marginTop: '100px' }}>
            <div className="dashboard-card">
              <div className="space-y-6">
                <div className="form-field-wrapper">
                  <label className="form-field-label">Texto para Criptografar</label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="form-input"
                    rows={4}
                    placeholder="Digite seu texto aqui..."
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={encryptText}
                    className="cta-button"
                  >
                    Criptografar
                  </button>
                </div>

                {output && (
                  <div className="form-field-wrapper">
                    <label className="form-field-label">Resultado</label>
                    <div className="form-input" style={{ background: 'var(--bg-card-hover)' }}>
                      {output}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </>
      )}
    </StandardNavigation>
  );
}
