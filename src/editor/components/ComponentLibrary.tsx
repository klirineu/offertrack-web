import { DndContext, useDraggable } from '@dnd-kit/core';

const components = [
  { type: 'button', label: 'Botão', category: 'Básicos', preview: '<button>Botão</button>', icon: '🔘' },
  { type: 'text', label: 'Texto', category: 'Básicos', preview: '<p>Texto de exemplo</p>', icon: '📝' },
  { type: 'image', label: 'Imagem', category: 'Básicos', preview: '<img src="https://placehold.co/200x100" alt="Imagem" />', icon: '🖼️' },
  { type: 'video', label: 'Vídeo', category: 'Básicos', preview: '<video src="https://www.w3schools.com/html/mov_bbb.mp4" controls width="200"></video>', icon: '🎬' },
  { type: 'link', label: 'Link', category: 'Básicos', preview: '<a href="#">Link</a>', icon: '🔗' },
  { type: 'input', label: 'Input', category: 'Básicos', preview: '<input type="text" placeholder="Digite aqui" />', icon: '🔲' },
  // Seções prontas
  { type: 'header', label: 'Header', category: 'Seções', preview: '<header style="background:#222;color:#fff;padding:24px;text-align:center;font-size:2rem;">Header Moderno</header>', icon: '📢' },
  { type: 'hero', label: 'Hero', category: 'Seções', preview: '<section style="padding:48px;text-align:center;background:#f5f5f5;"><h1>Hero Section</h1><p>Chamada de destaque</p></section>', icon: '🌟' },
  { type: 'cta', label: 'CTA', category: 'Seções', preview: '<section style="padding:32px;text-align:center;background:#2563eb;color:#fff;"><h2>Chamada para ação</h2><button style="margin-top:16px;">Quero saber mais</button></section>', icon: '📣' },
  { type: 'contact', label: 'Contato', category: 'Seções', preview: '<section style="padding:32px;text-align:center;"><h2>Fale conosco</h2><form><input type="text" placeholder="Seu nome" style="margin:8px;"/><input type="email" placeholder="Seu email" style="margin:8px;"/><button>Enviar</button></form></section>', icon: '📬' },
  { type: 'pricing', label: 'Pricing', category: 'Seções', preview: '<section style="padding:32px;text-align:center;background:#f0f0f0;"><h2>Planos</h2><div style="display:flex;justify-content:center;gap:16px;"><div style="background:#fff;padding:16px;">Básico</div><div style="background:#fff;padding:16px;">Pro</div></div></section>', icon: '💰' },
];

const categories = ['Seções', 'Básicos'];

function DraggableComponent({ type, label, preview, icon }: { type: string; label: string; preview: string; icon: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: type });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex flex-col items-center justify-center p-3 m-2 border rounded-lg cursor-move bg-gray-800 text-gray-100 shadow transition-all duration-150 hover:bg-blue-700 hover:text-white ${isDragging ? 'opacity-50' : ''}`}
      title={label}
      style={{ minWidth: 90, minHeight: 90 }}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-semibold text-xs text-center mb-1">{label}</div>
    </div>
  );
}

const ComponentLibrary = () => {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 h-full overflow-y-auto">
      <DndContext>
        {categories.map((cat) => (
          <div key={cat} className="mb-6">
            <div className="sticky top-0 z-10 bg-gray-900 py-2 px-2 text-blue-400 font-bold text-sm border-b border-gray-700 mb-2 w-48">{cat}</div>
            <div className="grid grid-cols-2 gap-2 px-2">
              {components.filter((c) => c.category === cat).map((c) => (
                <DraggableComponent key={c.type} type={c.type} label={c.label} preview={c.preview} icon={c.icon} />
              ))}
            </div>
          </div>
        ))}
      </DndContext>
    </aside>
  );
};

export default ComponentLibrary; 