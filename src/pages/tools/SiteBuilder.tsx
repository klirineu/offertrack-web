import React, { useState, useContext } from 'react';
import { nanoid } from 'nanoid';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useDroppable,
  DragStartEvent,
  useDraggable,
  closestCorners
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Trash, Type, Image, Square, LayoutGrid,
  Play, FileText, HelpCircle, Share2, Map,
  Clock, Tag,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, AlignHorizontalSpaceAround,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  GripVertical, Copy,
  Facebook, Instagram, Twitter, Linkedin, Youtube
} from 'lucide-react';

// Tipos básicos de bloco
type BlockType =
  | 'section'
  | 'text'
  | 'button'
  | 'image'
  | 'video'
  | 'icon'
  | 'divider'
  | 'form'
  | 'form-field'
  | 'social'
  | 'map'
  | 'countdown'
  | 'pricing'
  | 'faq'
  | 'carousel';

type Direction = 'row' | 'column';
type JustifyContent = 'start' | 'center' | 'end' | 'between' | 'around';
type AlignItems = 'start' | 'center' | 'end' | 'stretch';

export interface Block {
  id: string;
  type: BlockType;
  props: {
    text?: string;
    color?: string;
    fontSize?: number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    fontFamily?: 'sans' | 'serif' | 'mono' | 'heading';
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    fontStyle?: 'normal' | 'italic';
    lineHeight?: string;
    letterSpacing?: string;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    textDecoration?: 'none' | 'underline' | 'line-through';
    background?: string;
    action?: string;
    src?: string;
    alt?: string;
    link?: string;
    title?: string;
    size?: 'small' | 'medium' | 'large';
    isQuestion?: boolean;
    isAnswer?: boolean;
    expanded?: boolean;
    label?: string;
    type?: string;
    required?: boolean;
    direction?: Direction;
    justifyContent?: JustifyContent;
    alignItems?: AlignItems;
    [key: string]: unknown;
  };
  children?: Block[];
  style?: {
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    padding?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    border?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
      style?: string;
      color?: string;
    };
    borderRadius?: {
      topLeft?: string;
      topRight?: string;
      bottomRight?: string;
      bottomLeft?: string;
    };
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundOverlay?: string;
    width?: string;
    height?: string;
    opacity?: string;
    shadowIntensity?: string;
    shadowColor?: string;
  };
}

const initialBlocks: Block[] = [
  {
    id: 'root',
    type: 'section',
    props: {
      direction: 'column' as Direction,
      justifyContent: 'start' as JustifyContent,
      alignItems: 'stretch' as AlignItems
    },
    children: [],
    style: {
      padding: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      }
    }
  }
];

const initialFAQQuestions = [
  {
    question: 'O que vocês oferecem?',
    answer: 'Oferecemos soluções completas para seu negócio, incluindo...'
  },
  {
    question: 'Como funciona o processo?',
    answer: 'Nosso processo é simples e eficiente. Primeiro, fazemos uma análise...'
  },
  {
    question: 'Quais são os preços?',
    answer: 'Nossos preços são competitivos e variam de acordo com suas necessidades...'
  }
];

// Atualizar a interface da categoria
interface Category {
  name: string;
  items: Array<{
    type: BlockType;
    label: string;
    icon: React.ReactNode;
    description: string;
  }>;
}

// Atualizar as categorias
const blockCategories: Category[] = [
  {
    name: 'Layout',
    items: [
      {
        type: 'section',
        label: 'Seção',
        icon: <LayoutGrid size={24} />,
        description: 'Container para organizar outros elementos'
      }
    ]
  },
  {
    name: 'Básico',
    items: [
      {
        type: 'text',
        label: 'Texto',
        icon: <Type size={24} />,
        description: 'Adicione títulos, parágrafos e textos formatados'
      },
      {
        type: 'button',
        label: 'Botão',
        icon: <Square size={24} />,
        description: 'Botão de ação ou link'
      }
    ]
  },
  {
    name: 'Mídia',
    items: [
      {
        type: 'image',
        label: 'Imagem',
        icon: <Image size={24} />,
        description: 'Imagens, fotos e ilustrações'
      },
      {
        type: 'video',
        label: 'Vídeo',
        icon: <Play size={24} />,
        description: 'Vídeos do YouTube, Vimeo ou upload'
      }
    ]
  },
  {
    name: 'Interativo',
    items: [
      {
        type: 'form',
        label: 'Formulário',
        icon: <FileText size={24} />,
        description: 'Formulário de contato ou cadastro'
      },
      {
        type: 'faq',
        label: 'FAQ',
        icon: <HelpCircle size={24} />,
        description: 'Perguntas e respostas frequentes'
      }
    ]
  },
  {
    name: 'Avançado',
    items: [
      {
        type: 'carousel',
        label: 'Carrossel',
        icon: <Image size={24} />,
        description: 'Slider de imagens ou conteúdo'
      },
      {
        type: 'social',
        label: 'Social',
        icon: <Share2 size={24} />,
        description: 'Botões de redes sociais'
      },
      {
        type: 'map',
        label: 'Mapa',
        icon: <Map size={24} />,
        description: 'Mapa do Google Maps'
      },
      {
        type: 'countdown',
        label: 'Contador',
        icon: <Clock size={24} />,
        description: 'Contador regressivo'
      },
      {
        type: 'pricing',
        label: 'Preços',
        icon: <Tag size={24} />,
        description: 'Tabela de preços'
      }
    ]
  }
];

function LibraryItem({ type, label, icon, description }: {
  type: BlockType;
  label: string;
  icon: React.ReactNode;
  description?: string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: type,
    data: {
      type: 'library',
      blockType: type,
      isLibraryItem: true
    }
  });

  const style = {
    transform: isDragging ? 'scale(1.05)' : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    touchAction: 'none'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all select-none ${isDragging ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'}`}
      title={description}
    >
      {icon}
      <span className="text-sm font-medium text-white">{label}</span>
    </div>
  );
}

function DroppableBlock({ block, children }: { block: Block; children: React.ReactNode }) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: `drop-${block.id}`,
    data: {
      type: 'section',
      blockId: block.id,
      accepts: ['block', 'library']
    }
  });

  // Verifica se o item sendo arrastado pode ser solto aqui
  const activeData = active?.data.current as { type: string; blockType?: BlockType; isLibraryItem?: boolean } | undefined;

  const isValidDrop = block.type === 'section' && activeData && (
    // Se for um item da biblioteca, aceita qualquer coisa exceto seção
    (activeData.isLibraryItem && activeData.blockType !== 'section') ||
    // Se for um bloco existente, aceita qualquer coisa exceto seção
    (activeData.type === 'block' && !activeData.isLibraryItem)
  );

  return (
    <div
      ref={setNodeRef}
      className={`relative min-h-[120px] w-full transition-all group/section ${isOver ? 'ring-2' : ''}`}
    >
      {children}
      {/* Área de drop visível sempre que um item estiver sendo arrastado ou ao passar o mouse */}
      <div className={`absolute inset-0 border-2 border-dashed transition-colors pointer-events-none z-10
        ${isOver
          ? (isValidDrop ? 'border-blue-500 bg-blue-500/10' : 'border-red-500 bg-red-500/10')
          : 'border-gray-400 bg-gray-400/5 opacity-0 group-hover/section:opacity-100'}`}
      />
    </div>
  );
}

function SpacingControl({
  value,
  onChange,
  label
}: {
  value?: { top?: string; right?: string; bottom?: string; left?: string; };
  onChange: (value: { top: string; right: string; bottom: string; left: string; }) => void;
  label: string;
}) {
  const defaultValue = '0px';

  const handleChange = (key: 'top' | 'right' | 'bottom' | 'left', val: string) => {
    const newValue = {
      top: value?.top || defaultValue,
      right: value?.right || defaultValue,
      bottom: value?.bottom || defaultValue,
      left: value?.left || defaultValue,
      [key]: val
    };
    onChange(newValue);
  };

  return (
    <div className="mt-4">
      <label className="text-xs text-gray-300 mb-2 block">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">↑</span>
          <input
            type="number"
            className="w-16 border rounded px-2 py-1 bg-gray-700 text-white"
            value={parseInt(value?.top || defaultValue)}
            onChange={e => handleChange('top', `${e.target.value}px`)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">→</span>
          <input
            type="number"
            className="w-16 border rounded px-2 py-1 bg-gray-700 text-white"
            value={parseInt(value?.right || defaultValue)}
            onChange={e => handleChange('right', `${e.target.value}px`)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">↓</span>
          <input
            type="number"
            className="w-16 border rounded px-2 py-1 bg-gray-700 text-white"
            value={parseInt(value?.bottom || defaultValue)}
            onChange={e => handleChange('bottom', `${e.target.value}px`)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">←</span>
          <input
            type="number"
            className="w-16 border rounded px-2 py-1 bg-gray-700 text-white"
            value={parseInt(value?.left || defaultValue)}
            onChange={e => handleChange('left', `${e.target.value}px`)}
          />
        </div>
      </div>
    </div>
  );
}

function BorderControl({
  value,
  onChange,
  label
}: {
  value?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    style?: string;
    color?: string;
  };
  onChange: (value: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    style?: string;
    color?: string;
  }) => void;
  label: string;
}) {
  const defaultValue = '0px';
  const borderStyles = ['none', 'solid', 'dashed', 'dotted'];

  return (
    <div className="mt-4">
      <label className="text-xs text-gray-300 mb-2 block">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">↑</span>
          <input
            type="number"
            className="w-16 border rounded px-2 py-1 bg-gray-700 text-white"
            value={parseInt(value?.top || defaultValue)}
            onChange={e => onChange({ ...value, top: `${e.target.value}px` })}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">→</span>
          <input
            type="number"
            className="w-16 border rounded px-2 py-1 bg-gray-700 text-white"
            value={parseInt(value?.right || defaultValue)}
            onChange={e => onChange({ ...value, right: `${e.target.value}px` })}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">↓</span>
          <input
            type="number"
            className="w-16 border rounded px-2 py-1 bg-gray-700 text-white"
            value={parseInt(value?.bottom || defaultValue)}
            onChange={e => onChange({ ...value, bottom: `${e.target.value}px` })}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">←</span>
          <input
            type="number"
            className="w-16 border rounded px-2 py-1 bg-gray-700 text-white"
            value={parseInt(value?.left || defaultValue)}
            onChange={e => onChange({ ...value, left: `${e.target.value}px` })}
          />
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-300">Estilo</label>
          <select
            className="w-full border rounded px-2 py-1 bg-gray-700 text-white mt-1"
            value={value?.style || 'solid'}
            onChange={e => onChange({ ...value, style: e.target.value })}
          >
            {borderStyles.map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-300">Cor</label>
          <input
            type="color"
            className="block w-full mt-1"
            value={value?.color || '#000000'}
            onChange={e => onChange({ ...value, color: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

function BorderRadiusControl({
  value,
  onChange,
  label
}: {
  value?: {
    topLeft?: string;
    topRight?: string;
    bottomRight?: string;
    bottomLeft?: string;
  };
  onChange: (value: {
    topLeft?: string;
    topRight?: string;
    bottomRight?: string;
    bottomLeft?: string;
  }) => void;
  label: string;
}) {
  const defaultValue = '0px';

  return (
    <div className="mt-4">
      <label className="text-xs text-gray-300 mb-2 block">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">↖</span>
          <input
            type="number"
            className="w-16 border rounded px-2 py-1 bg-gray-700 text-white"
            value={parseInt(value?.topLeft || defaultValue)}
            onChange={e => onChange({ ...value, topLeft: `${e.target.value}px` })}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">↗</span>
          <input
            type="number"
            className="w-16 border rounded px-2 py-1 bg-gray-700 text-white"
            value={parseInt(value?.topRight || defaultValue)}
            onChange={e => onChange({ ...value, topRight: `${e.target.value}px` })}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">↙</span>
          <input
            type="number"
            className="w-16 border rounded px-2 py-1 bg-gray-700 text-white"
            value={parseInt(value?.bottomLeft || defaultValue)}
            onChange={e => onChange({ ...value, bottomLeft: `${e.target.value}px` })}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">↘</span>
          <input
            type="number"
            className="w-16 border rounded px-2 py-1 bg-gray-700 text-white"
            value={parseInt(value?.bottomRight || defaultValue)}
            onChange={e => onChange({ ...value, bottomRight: `${e.target.value}px` })}
          />
        </div>
      </div>
    </div>
  );
}

function BlockRenderer({ block, onSelect, selectedId, onDragStart, path, onUpdate, onRemove, isPreview = false }: {
  block: Block;
  onSelect: (id: string) => void;
  selectedId?: string;
  onDragStart: (block: Block) => void;
  path: string;
  onUpdate: (id: string, updater: (block: Block) => Block) => void;
  onRemove: (id: string) => void;
  isPreview?: boolean;
}) {
  const isSelected = block.id === selectedId;
  const { setNodeRef, attributes, listeners, transform, isDragging, transition } = useSortable({
    id: block.id,
    data: {
      type: 'block',
      block,
      path,
      isSection: block.type === 'section'
    }
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : block.style?.opacity ? parseFloat(block.style.opacity) / 100 : 1,
    position: 'relative',
    marginTop: block.style?.margin?.top,
    marginRight: block.style?.margin?.right,
    marginBottom: block.style?.margin?.bottom,
    marginLeft: block.style?.margin?.left,
    paddingTop: block.style?.padding?.top,
    paddingRight: block.style?.padding?.right,
    paddingBottom: block.style?.padding?.bottom,
    paddingLeft: block.style?.padding?.left,
    borderTop: block.style?.border?.top ? `${block.style.border.top} ${block.style.border.style || 'solid'} ${block.style.border.color || '#000'}` : undefined,
    borderRight: block.style?.border?.right ? `${block.style.border.right} ${block.style.border.style || 'solid'} ${block.style.border.color || '#000'}` : undefined,
    borderBottom: block.style?.border?.bottom ? `${block.style.border.bottom} ${block.style.border.style || 'solid'} ${block.style.border.color || '#000'}` : undefined,
    borderLeft: block.style?.border?.left ? `${block.style.border.left} ${block.style.border.style || 'solid'} ${block.style.border.color || '#000'}` : undefined,
    borderTopLeftRadius: block.style?.borderRadius?.topLeft,
    borderTopRightRadius: block.style?.borderRadius?.topRight,
    borderBottomRightRadius: block.style?.borderRadius?.bottomRight,
    borderBottomLeftRadius: block.style?.borderRadius?.bottomLeft,
    backgroundColor: block.style?.backgroundColor,
    backgroundImage: block.style?.backgroundImage ? `url(${block.style.backgroundImage})` : undefined,
    backgroundSize: block.style?.backgroundImage ? 'cover' : undefined,
    backgroundPosition: block.style?.backgroundImage ? 'center' : undefined,
    width: block.type === 'section' ? '100%' : block.style?.width,
    height: block.style?.height,
    textAlign: block.props.textAlign as React.CSSProperties['textAlign']
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(block.id);
  };

  // Componentes de controle
  const BlockControls = () => {
    const parentBlocks = useContext(BlocksContext);

    return (
      <div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const duplicatedBlock = JSON.parse(JSON.stringify(block)) as Block;
            duplicatedBlock.id = nanoid();
            if (duplicatedBlock.children) {
              duplicatedBlock.children = duplicatedBlock.children.map((child: Block) => ({
                ...child,
                id: nanoid()
              }));
            }
            const sectionId = findNearestSection(parentBlocks, block.id);
            if (sectionId) {
              onUpdate(sectionId, b => ({
                ...b,
                children: [...(b.children || []), duplicatedBlock]
              }));
            }
          }}
          className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-white shadow-lg"
          title="Duplicar"
        >
          <Copy size={14} />
        </button>
        <div {...attributes} {...listeners} className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-white cursor-move shadow-lg">
          <GripVertical size={14} />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(block.id);
          }}
          className="p-1.5 rounded bg-red-600 hover:bg-red-700 text-white shadow-lg"
          title="Excluir"
        >
          <Trash size={14} />
        </button>
      </div>
    );
  };

  const renderMediaBlock = () => {
    if (block.type === 'image') {
      return (
        <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {block.props.src ? (
            <img
              src={block.props.src as string}
              alt={block.props.alt as string}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              <Image size={48} />
            </div>
          )}
        </div>
      );
    }

    if (block.type === 'video') {
      return (
        <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {block.props.src ? (
            <iframe
              src={block.props.src as string}
              title={block.props.title as string}
              className="w-full h-full"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              <Play size={48} />
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const mediaBlock = renderMediaBlock();
  if (mediaBlock) {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          width: block.type === 'section' ? '100%' : block.style?.width,
          height: block.style?.height,
        }}
        onClick={handleClick}
        className={`group relative ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'} ${isDragging ? 'opacity-50' : ''} cursor-pointer`}
      >
        <BlockControls />
        {mediaBlock}
      </div>
    );
  }

  if (block.type === 'section' || block.type === 'carousel' || block.type === 'faq') {
    const direction = block.props.direction as Direction || 'column';
    const justifyContent = block.props.justifyContent as JustifyContent || 'flex-start';
    const alignItems = block.props.alignItems as AlignItems || 'flex-start';

    const content = (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          position: 'relative',
        }}
        onClick={handleClick}
        className={`min-h-[120px] w-full ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isDragging ? 'opacity-50' : ''} cursor-pointer group`}
      >
        <BlockControls />
        <div
          className={`min-h-[40px] transition-colors flex relative z-10 p-4 w-full`}
          style={{
            flexDirection: direction,
            flexWrap: direction === 'row' ? 'wrap' : 'nowrap',
            justifyContent,
            alignItems
          }}
        >
          {block.type === 'section' && (
            <SortableContext items={block.children?.map(c => c.id) || []} strategy={verticalListSortingStrategy}>
              {block.children?.map((child, idx) => (
                <BlockRenderer
                  key={child.id}
                  block={child}
                  onSelect={onSelect}
                  selectedId={selectedId}
                  onDragStart={onDragStart}
                  path={`${path}.${idx}`}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                  isPreview={isPreview}
                />
              ))}
            </SortableContext>
          )}
          {block.type === 'carousel' && (
            <div className="w-full text-center mb-4">
              <h3 className="text-lg font-semibold">{block.props.title as string || 'Carrossel de Imagens'}</h3>
              {block.children && block.children.length > 0 && (
                <>
                  <div className="relative w-full">
                    {block.children.map((child, idx) => (
                      <div
                        key={child.id}
                        className={`transition-opacity duration-300 ${idx === (block.props.activeSlide as number || 0) ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                      >
                        <BlockRenderer
                          block={child}
                          onSelect={onSelect}
                          selectedId={selectedId}
                          onDragStart={onDragStart}
                          path={`${path}.${idx}`}
                          onUpdate={onUpdate}
                          onRemove={onRemove}
                          isPreview={isPreview}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="w-full flex justify-center gap-2 mt-4">
                    {block.children.map((_, idx) => (
                      <button
                        key={idx}
                        className={`w-3 h-3 rounded-full ${idx === (block.props.activeSlide as number || 0) ? 'bg-blue-500' : 'bg-gray-300'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdate(block.id, b => ({
                            ...b,
                            props: { ...b.props, activeSlide: idx }
                          }));
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {block.type === 'faq' && (
            <div className="w-full">
              <h3 className="text-lg font-semibold text-center mb-6">{block.props.title as string || 'Perguntas Frequentes'}</h3>
              <div className="space-y-4">
                {block.children?.map((child, idx) => {
                  if (child.props.isQuestion) {
                    const answer = block.children?.[idx + 1];
                    const isExpanded = child.props.expanded as boolean;

                    return (
                      <div key={child.id} className="border rounded-lg overflow-hidden" style={{
                        borderColor: block.props.borderColor as string || '#e5e7eb',
                        backgroundColor: block.props.backgroundColor as string || '#fff'
                      }}>
                        <button
                          className="w-full px-6 py-4 text-left hover:bg-opacity-50 flex justify-between items-center"
                          style={{
                            backgroundColor: block.props.questionBgColor as string || '#f9fafb',
                            color: block.props.questionColor as string || '#111'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdate(child.id, b => ({
                              ...b,
                              props: { ...b.props, expanded: !isExpanded }
                            }));
                          }}
                        >
                          <span className="font-medium">{child.props.text as string}</span>
                          <svg
                            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div
                          className={`px-6 py-4 transition-all ${isExpanded ? 'block' : 'hidden'}`}
                          style={{ color: block.props.answerColor as string || '#4b5563' }}
                        >
                          {answer && (
                            <p>{answer.props.text as string}</p>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
          {(!block.children || block.children.length === 0) && (
            <div className="w-full h-full min-h-[100px] flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
              {block.type === 'carousel' ? 'Adicione imagens ao carrossel' :
                block.type === 'faq' ? 'Adicione perguntas ao FAQ' :
                  'Arraste componentes para esta seção ou clique em um componente à esquerda'}
            </div>
          )}
        </div>
      </div>
    );

    return <DroppableBlock block={block}>{content}</DroppableBlock>;
  }

  if (block.type === 'text') {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          width: block.style?.width || 'auto',
          display: 'inline-block'
        }}
        onClick={handleClick}
        className={`group relative ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'} ${isDragging ? 'opacity-50' : ''} cursor-pointer`}
      >
        <BlockControls />
        <div style={{
          color: block.props.color as string,
          fontSize: block.props.fontSize as number,
          fontWeight: (block.props.fontWeight === 'normal' ? 400 :
            block.props.fontWeight === 'medium' ? 500 :
              block.props.fontWeight === 'semibold' ? 600 :
                block.props.fontWeight === 'bold' ? 700 : 400) as number,
          fontFamily: block.props.fontFamily === 'sans' ? 'ui-sans-serif, system-ui, -apple-system, sans-serif' :
            block.props.fontFamily === 'serif' ? 'ui-serif, Georgia, serif' :
              block.props.fontFamily === 'mono' ? 'ui-monospace, monospace' :
                block.props.fontFamily === 'heading' ? 'var(--font-heading, ui-sans-serif)' : 'inherit',
          fontStyle: block.props.fontStyle as React.CSSProperties['fontStyle'],
          lineHeight: block.props.lineHeight,
          letterSpacing: block.props.letterSpacing,
          textTransform: block.props.textTransform as React.CSSProperties['textTransform'],
          textDecoration: block.props.textDecoration as React.CSSProperties['textDecoration'],
          width: '100%'
        }}>
          {block.props.text as string}
        </div>
      </div>
    );
  }

  if (block.type === 'button') {
    return (
      <button
        ref={setNodeRef}
        style={{
          ...style,
          color: block.props.color as string,
          backgroundColor: block.props.background as string,
          display: 'inline-block',
          fontWeight: 600,
          fontSize: 16,
          borderRadius: '6px',
          cursor: 'pointer',
        }}
        onClick={handleClick}
        className={`group relative ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'} ${isDragging ? 'opacity-50' : ''}`}
      >
        <BlockControls />
        {block.props.text as string}
      </button>
    );
  }

  if (block.type === 'form') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleClick}
        className={`group relative ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'} ${isDragging ? 'opacity-50' : ''} cursor-pointer`}
      >
        <BlockControls />
        <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
          <h3 className="text-xl font-semibold text-center">{block.props.title as string || 'Formulário de Contato'}</h3>
          <div className="space-y-4">
            {block.children?.map((field) => (
              <div key={field.id} className="space-y-1">
                <label className="block text-sm font-medium">
                  {field.props.label as string}
                  {field.props.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.props.type === 'textarea' ? (
                  <textarea
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder={field.props.label as string}
                    required={field.props.required as boolean}
                    rows={4}
                  />
                ) : field.props.type === 'select' ? (
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    required={field.props.required as boolean}
                  >
                    <option value="">Selecione uma opção</option>
                  </select>
                ) : (
                  <input
                    type={field.props.type as string}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder={field.props.label as string}
                    required={field.props.required as boolean}
                  />
                )}
              </div>
            ))}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (block.type === 'video') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleClick}
        className={`group relative ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'} ${isDragging ? 'opacity-50' : ''} cursor-pointer`}
      >
        <BlockControls />
        <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {block.props.src ? (
            <iframe
              src={String(block.props.src)}
              title={String(block.props.title)}
              className="w-full h-full"
              style={{ aspectRatio: String(block.props.aspectRatio) || '16:9' }}
              allow={block.props.autoplay ? "autoplay" : ""}
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              <Play size={48} />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (block.type === 'social') {
    const networks = [
      { id: 'facebook', icon: Facebook },
      { id: 'instagram', icon: Instagram },
      { id: 'twitter', icon: Twitter },
      { id: 'linkedin', icon: Linkedin },
      { id: 'youtube', icon: Youtube }
    ];
    const size = block.props.size === 'small' ? 24 : block.props.size === 'large' ? 36 : 30;

    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleClick}
        className={`group relative ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'} ${isDragging ? 'opacity-50' : ''} cursor-pointer`}
      >
        <BlockControls />
        <div className="flex gap-4 justify-center">
          {networks.map(({ id, icon: Icon }) => {
            const url = block.props[id] as string;
            if (!url) return null;
            return (
              <a
                key={id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-500 transition-colors"
              >
                <Icon
                  size={size}
                  className={block.props.iconStyle === 'outline' ? 'opacity-80' : ''}
                />
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  if (block.type === 'countdown') {
    const endDate = new Date(block.props.endDate as string);
    const now = new Date();
    const difference = endDate.getTime() - now.getTime();

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleClick}
        className={`group relative ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'} ${isDragging ? 'opacity-50' : ''} cursor-pointer`}
      >
        <BlockControls />
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4" style={{ color: block.props.textColor as string || '#666666' }}>
            {block.props.title as string}
          </h3>
          <div className={`flex justify-center gap-4 ${block.props.style === 'simple' ? 'text-4xl font-bold' : ''}`}>
            {[
              { value: days, label: 'Dias' },
              { value: hours, label: 'Horas' },
              { value: minutes, label: 'Minutos' },
              { value: seconds, label: 'Segundos' }
            ].map(({ value, label }) => (
              <div
                key={label}
                className={`${block.props.style === 'boxes' ? 'bg-gray-100 p-4 rounded-lg' :
                  block.props.style === 'circular' ? 'rounded-full border-4 w-24 h-24 flex flex-col items-center justify-center' : ''
                  }`}
              >
                <div className="text-3xl font-bold" style={{ color: block.props.numberColor as string || '#000000' }}>
                  {value.toString().padStart(2, '0')}
                </div>
                <div className="text-sm" style={{ color: block.props.textColor as string || '#666666' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (block.type === 'pricing') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleClick}
        className={`group relative ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'} ${isDragging ? 'opacity-50' : ''} cursor-pointer`}
      >
        <BlockControls />
        <div className={`p-6 rounded-lg ${block.props.featured ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white border border-gray-200'}`}>
          <h3 className="text-xl font-semibold text-center mb-2">{block.props.title as string}</h3>
          <div className="text-center mb-6">
            <span className="text-gray-500 text-sm">{block.props.currency as string}</span>
            <span className="text-4xl font-bold mx-1">{block.props.price as number}</span>
            <span className="text-gray-500">{block.props.period as string}</span>
          </div>
          <ul className="space-y-3 mb-6">
            {(block.props.features as string[] || []).map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <a
            href={block.props.buttonLink as string}
            className={`block w-full py-2 px-4 text-center rounded-lg transition-colors ${block.props.featured
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-800 text-white hover:bg-gray-900'
              }`}
          >
            {block.props.buttonText as string || 'Começar agora'}
          </a>
        </div>
      </div>
    );
  }

  if (block.type === 'map') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleClick}
        className={`group relative ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'} ${isDragging ? 'opacity-50' : ''} cursor-pointer`}
      >
        <BlockControls />
        <div
          className="w-full rounded-lg overflow-hidden"
          style={{ height: block.props.height as number || 400 }}
        >
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(block.props.address as string || '')}&zoom=${block.props.zoom as number || 15}`}
            allowFullScreen
          />
        </div>
        {Boolean(block.props.markerTitle) && (
          <div className="mt-2 p-3 bg-white rounded-lg shadow-sm">
            <h4 className="font-medium">{block.props.markerTitle as string}</h4>
            {Boolean(block.props.markerDescription) && (
              <p className="text-gray-600 text-sm mt-1">{block.props.markerDescription as string}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}

function findBlockById(blocks: Block[], id: string): Block | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children) {
      const found = findBlockById(block.children, id);
      if (found) return found;
    }
  }
  return null;
}

function findNearestSection(blocks: Block[], targetId: string): string | null {
  for (const block of blocks) {
    if (block.id === targetId && block.type === 'section') {
      return block.id;
    }
    if (block.children) {
      for (const child of block.children) {
        if (child.id === targetId) {
          return block.id;
        }
      }
      const found = findNearestSection(block.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

// Adicionar novos tipos para o menu de propriedades
type PropertyTab = 'content' | 'style' | 'advanced' | 'templates';

function PropertyEditor({ block, onPropertyChange }: {
  block: Block;
  onPropertyChange: (key: string, value: unknown) => void;
}) {
  if (block.type === 'section') {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Direção</label>
          <div className="flex gap-2">
            <button
              onClick={() => onPropertyChange('direction', 'row')}
              className={`flex-1 p-2 rounded ${block.props.direction === 'row' ? 'bg-blue-500' : 'bg-gray-600'}`}
            >
              <span className="text-white text-sm">Horizontal</span>
            </button>
            <button
              onClick={() => onPropertyChange('direction', 'column')}
              className={`flex-1 p-2 rounded ${block.props.direction === 'column' ? 'bg-blue-500' : 'bg-gray-600'}`}
            >
              <span className="text-white text-sm">Vertical</span>
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-2 block">Alinhamento Horizontal</label>
          <div className="flex gap-2">
            {['flex-start', 'center', 'flex-end', 'space-between', 'space-around'].map(align => (
              <button
                key={align}
                onClick={() => onPropertyChange('justifyContent', align)}
                className={`flex-1 p-2 rounded ${block.props.justifyContent === align ? 'bg-blue-500' : 'bg-gray-600'}`}
                title={align}
              >
                <div className="flex justify-center">
                  {align === 'flex-start' && <AlignLeft size={16} className="text-white" />}
                  {align === 'center' && <AlignCenter size={16} className="text-white" />}
                  {align === 'flex-end' && <AlignRight size={16} className="text-white" />}
                  {align === 'space-between' && <AlignJustify size={16} className="text-white" />}
                  {align === 'space-around' && <AlignHorizontalSpaceAround size={16} className="text-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-2 block">Alinhamento Vertical</label>
          <div className="flex gap-2">
            {['flex-start', 'center', 'flex-end'].map(align => (
              <button
                key={align}
                onClick={() => onPropertyChange('alignItems', align)}
                className={`flex-1 p-2 rounded ${block.props.alignItems === align ? 'bg-blue-500' : 'bg-gray-600'}`}
                title={align}
              >
                <div className="flex justify-center">
                  {align === 'flex-start' && <AlignStartVertical size={16} className="text-white" />}
                  {align === 'center' && <AlignCenterVertical size={16} className="text-white" />}
                  {align === 'flex-end' && <AlignEndVertical size={16} className="text-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (block.type === 'text') {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Texto</label>
          <textarea
            className="w-full h-32 border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.text as string}
            onChange={e => onPropertyChange('text', e.target.value)}
            placeholder="Digite seu texto aqui..."
          />
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-2 block">Tipografia</label>
          <div className="space-y-3">
            <select
              className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
              value={block.props.fontFamily as string || 'sans'}
              onChange={e => onPropertyChange('fontFamily', e.target.value)}
            >
              <option value="sans">Sans Serif</option>
              <option value="serif">Serif</option>
              <option value="mono">Monospace</option>
              <option value="heading">Heading</option>
            </select>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400">Peso</label>
                <select
                  className="w-full border rounded px-3 py-2 bg-gray-700 text-white mt-1"
                  value={block.props.fontWeight as string || 'normal'}
                  onChange={e => onPropertyChange('fontWeight', e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Médio</option>
                  <option value="semibold">Semi-negrito</option>
                  <option value="bold">Negrito</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400">Estilo</label>
                <select
                  className="w-full border rounded px-3 py-2 bg-gray-700 text-white mt-1"
                  value={block.props.fontStyle as string || 'normal'}
                  onChange={e => onPropertyChange('fontStyle', e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Itálico</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400">Altura da linha</label>
              <input
                type="range"
                min="100"
                max="200"
                value={parseInt(block.props.lineHeight as string || '150')}
                onChange={e => onPropertyChange('lineHeight', `${e.target.value}%`)}
                className="w-full mt-1"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>100%</span>
                <span>150%</span>
                <span>200%</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400">Espaçamento entre letras</label>
              <input
                type="range"
                min="-2"
                max="10"
                value={parseFloat(block.props.letterSpacing as string || '0')}
                onChange={e => onPropertyChange('letterSpacing', `${e.target.value}px`)}
                className="w-full mt-1"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-2 block">Cor do texto</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={block.props.color as string}
              onChange={e => onPropertyChange('color', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={block.props.color as string}
              onChange={e => onPropertyChange('color', e.target.value)}
              className="flex-1 border rounded px-3 bg-gray-700 text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-2 block">Tamanho da fonte</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="12"
              max="72"
              value={block.props.fontSize as number}
              onChange={e => onPropertyChange('fontSize', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-white w-12 text-center">{block.props.fontSize}px</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-2 block">Alinhamento</label>
          <div className="flex gap-2">
            {['left', 'center', 'right', 'justify'].map(align => (
              <button
                key={align}
                onClick={() => onPropertyChange('textAlign', align)}
                className={`flex-1 p-2 rounded ${block.props.textAlign === align ? 'bg-blue-500' : 'bg-gray-600'}`}
              >
                <span className="capitalize text-white text-sm">{align}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-2 block">Transformação</label>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="border rounded px-3 py-2 bg-gray-700 text-white"
              value={block.props.textTransform as string || 'none'}
              onChange={e => onPropertyChange('textTransform', e.target.value)}
            >
              <option value="none">Normal</option>
              <option value="uppercase">MAIÚSCULAS</option>
              <option value="lowercase">minúsculas</option>
              <option value="capitalize">Capitalizado</option>
            </select>
            <select
              className="border rounded px-3 py-2 bg-gray-700 text-white"
              value={block.props.textDecoration as string || 'none'}
              onChange={e => onPropertyChange('textDecoration', e.target.value)}
            >
              <option value="none">Nenhum</option>
              <option value="underline">Sublinhado</option>
              <option value="line-through">Riscado</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  if (block.type === 'button') {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Texto do botão</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.text as string}
            onChange={e => onPropertyChange('text', e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">URL ou ação</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.action as string}
            onChange={e => onPropertyChange('action', e.target.value)}
            placeholder="https:// ou #section-id"
          />
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Cores</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-gray-400">Texto</span>
              <input
                type="color"
                value={block.props.color as string}
                onChange={e => onPropertyChange('color', e.target.value)}
                className="block w-full mt-1"
              />
            </div>
            <div>
              <span className="text-xs text-gray-400">Fundo</span>
              <input
                type="color"
                value={block.props.background as string}
                onChange={e => onPropertyChange('background', e.target.value)}
                className="block w-full mt-1"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Tamanho</label>
          <div className="flex gap-2">
            {['small', 'medium', 'large'].map(size => (
              <button
                key={size}
                onClick={() => onPropertyChange('size', size)}
                className={`flex-1 p-2 rounded ${block.props.size === size ? 'bg-blue-500' : 'bg-gray-600'}`}
              >
                <span className="capitalize text-white text-sm">{size}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (block.type === 'image') {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-300 mb-2 block">URL da imagem</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.src as string}
            onChange={e => onPropertyChange('src', e.target.value)}
            placeholder="https://"
          />
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Texto alternativo</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.alt as string}
            onChange={e => onPropertyChange('alt', e.target.value)}
            placeholder="Descrição da imagem"
          />
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Link (opcional)</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.link as string}
            onChange={e => onPropertyChange('link', e.target.value)}
            placeholder="https://"
          />
        </div>
      </div>
    );
  }

  if (block.type === 'faq') {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Título</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.title as string}
            onChange={e => onPropertyChange('title', e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-2 block">Cores</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-gray-400">Título</span>
              <input
                type="color"
                value={block.props.titleColor as string || '#000000'}
                onChange={e => onPropertyChange('titleColor', e.target.value)}
                className="block w-full mt-1"
              />
            </div>
            <div>
              <span className="text-xs text-gray-400">Borda</span>
              <input
                type="color"
                value={block.props.borderColor as string || '#e5e7eb'}
                onChange={e => onPropertyChange('borderColor', e.target.value)}
                className="block w-full mt-1"
              />
            </div>
            <div>
              <span className="text-xs text-gray-400">Fundo da Pergunta</span>
              <input
                type="color"
                value={block.props.questionBgColor as string || '#f9fafb'}
                onChange={e => onPropertyChange('questionBgColor', e.target.value)}
                className="block w-full mt-1"
              />
            </div>
            <div>
              <span className="text-xs text-gray-400">Cor da Pergunta</span>
              <input
                type="color"
                value={block.props.questionColor as string || '#111111'}
                onChange={e => onPropertyChange('questionColor', e.target.value)}
                className="block w-full mt-1"
              />
            </div>
            <div>
              <span className="text-xs text-gray-400">Cor da Resposta</span>
              <input
                type="color"
                value={block.props.answerColor as string || '#4b5563'}
                onChange={e => onPropertyChange('answerColor', e.target.value)}
                className="block w-full mt-1"
              />
            </div>
            <div>
              <span className="text-xs text-gray-400">Fundo</span>
              <input
                type="color"
                value={block.props.backgroundColor as string || '#ffffff'}
                onChange={e => onPropertyChange('backgroundColor', e.target.value)}
                className="block w-full mt-1"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {block.children?.map((child, idx) => {
            if (child.props.isQuestion) {
              return (
                <div key={child.id} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">Pergunta {Math.floor(idx / 2) + 1}</span>
                    <button
                      className="text-red-500 hover:text-red-400"
                      onClick={() => {
                        const newChildren = [...(block.children || [])];
                        newChildren.splice(idx, 2);
                        onPropertyChange('children', newChildren);
                      }}
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 bg-gray-700 text-white mb-2"
                    value={child.props.text as string}
                    onChange={e => {
                      const newChildren = [...(block.children || [])];
                      newChildren[idx] = {
                        ...child,
                        props: { ...child.props, text: e.target.value }
                      };
                      onPropertyChange('children', newChildren);
                    }}
                    placeholder="Pergunta"
                  />
                  <textarea
                    className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
                    value={block.children?.[idx + 1]?.props.text as string}
                    onChange={e => {
                      const newChildren = [...(block.children || [])];
                      newChildren[idx + 1] = {
                        ...newChildren[idx + 1],
                        props: { ...newChildren[idx + 1].props, text: e.target.value }
                      };
                      onPropertyChange('children', newChildren);
                    }}
                    placeholder="Resposta"
                  />
                </div>
              );
            }
            return null;
          })}
        </div>

        <button
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => {
            const newQuestion: Block = {
              id: nanoid(),
              type: 'text',
              props: {
                text: 'Nova pergunta?',
                color: '#222',
                fontSize: 18,
                isQuestion: true,
                expanded: false
              }
            };
            const newAnswer: Block = {
              id: nanoid(),
              type: 'text',
              props: {
                text: 'Sua resposta aqui...',
                color: '#666',
                fontSize: 16,
                isAnswer: true
              }
            };
            onPropertyChange('children', [...(block.children || []), newQuestion, newAnswer]);
          }}
        >
          + Adicionar Pergunta
        </button>
      </div>
    );
  }

  if (block.type === 'carousel') {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Título</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.title as string}
            onChange={e => onPropertyChange('title', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {block.children?.map((child, idx) => (
            <div key={child.id} className="border border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400">Imagem {idx + 1}</span>
                <button
                  className="text-red-500 hover:text-red-400"
                  onClick={() => {
                    const newChildren = [...(block.children || [])];
                    newChildren.splice(idx, 1);
                    onPropertyChange('children', newChildren);
                  }}
                >
                  <Trash size={14} />
                </button>
              </div>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 bg-gray-700 text-white mb-2"
                value={child.props.src as string}
                onChange={e => {
                  const newChildren = [...(block.children || [])];
                  newChildren[idx] = {
                    ...child,
                    props: { ...child.props, src: e.target.value }
                  };
                  onPropertyChange('children', newChildren);
                }}
                placeholder="URL da imagem"
              />
              <input
                type="text"
                className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
                value={child.props.alt as string}
                onChange={e => {
                  const newChildren = [...(block.children || [])];
                  newChildren[idx] = {
                    ...child,
                    props: { ...child.props, alt: e.target.value }
                  };
                  onPropertyChange('children', newChildren);
                }}
                placeholder="Texto alternativo"
              />
            </div>
          ))}
        </div>

        <button
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => {
            const newImage: Block = {
              id: nanoid(),
              type: 'image',
              props: {
                src: 'https://placehold.co/600x400',
                alt: 'Nova imagem'
              }
            };
            onPropertyChange('children', [...(block.children || []), newImage]);
          }}
        >
          + Adicionar Imagem
        </button>
      </div>
    );
  }

  if (block.type === 'form') {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Título do Formulário</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.title as string}
            onChange={e => onPropertyChange('title', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {block.children?.map((child, idx) => (
            <div key={child.id} className="border border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400">Campo {idx + 1}</span>
                <button
                  className="text-red-500 hover:text-red-400"
                  onClick={() => {
                    const newChildren = [...(block.children || [])];
                    newChildren.splice(idx, 1);
                    onPropertyChange('children', newChildren);
                  }}
                >
                  <Trash size={14} />
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
                  value={child.props.label as string}
                  onChange={e => {
                    const newChildren = [...(block.children || [])];
                    newChildren[idx] = {
                      ...child,
                      props: { ...child.props, label: e.target.value }
                    };
                    onPropertyChange('children', newChildren);
                  }}
                  placeholder="Rótulo do campo"
                />
                <select
                  className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
                  value={child.props.type as string}
                  onChange={e => {
                    const newChildren = [...(block.children || [])];
                    newChildren[idx] = {
                      ...child,
                      props: { ...child.props, type: e.target.value }
                    };
                    onPropertyChange('children', newChildren);
                  }}
                >
                  <option value="text">Texto</option>
                  <option value="email">Email</option>
                  <option value="tel">Telefone</option>
                  <option value="textarea">Área de texto</option>
                  <option value="select">Lista de seleção</option>
                </select>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={child.props.required as boolean}
                    onChange={e => {
                      const newChildren = [...(block.children || [])];
                      newChildren[idx] = {
                        ...child,
                        props: { ...child.props, required: e.target.checked }
                      };
                      onPropertyChange('children', newChildren);
                    }}
                  />
                  <span className="text-sm text-white">Campo obrigatório</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <button
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => {
            const newField: Block = {
              id: nanoid(),
              type: 'form-field',
              props: {
                label: 'Novo campo',
                type: 'text',
                required: false
              }
            };
            onPropertyChange('children', [...(block.children || []), newField]);
          }}
        >
          + Adicionar Campo
        </button>
      </div>
    );
  }

  if (block.type === 'video') {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-300 mb-2 block">URL do Vídeo</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.src as string}
            onChange={e => onPropertyChange('src', e.target.value)}
            placeholder="https://youtube.com/... ou https://vimeo.com/..."
          />
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Título</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.title as string}
            onChange={e => onPropertyChange('title', e.target.value)}
            placeholder="Título do vídeo"
          />
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Proporção</label>
          <select
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.aspectRatio as string || '16:9'}
            onChange={e => onPropertyChange('aspectRatio', e.target.value)}
          >
            <option value="16:9">16:9</option>
            <option value="4:3">4:3</option>
            <option value="1:1">1:1</option>
          </select>
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={block.props.autoplay as boolean}
              onChange={e => onPropertyChange('autoplay', e.target.checked)}
            />
            <span className="text-sm text-white">Reprodução automática</span>
          </label>
        </div>
      </div>
    );
  }

  if (block.type === 'social') {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Redes Sociais</label>
          <div className="space-y-2">
            {['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'].map(network => (
              <div key={network} className="flex gap-2">
                <span className="text-sm text-white capitalize w-24">{network}</span>
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2 bg-gray-700 text-white"
                  value={(block.props[network] as string) || ''}
                  onChange={e => onPropertyChange(network, e.target.value)}
                  placeholder={`URL do ${network}`}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Estilo dos Ícones</label>
          <select
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.iconStyle as string || 'filled'}
            onChange={e => onPropertyChange('iconStyle', e.target.value)}
          >
            <option value="filled">Preenchido</option>
            <option value="outline">Contorno</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Tamanho dos Ícones</label>
          <select
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.size as string || 'medium'}
            onChange={e => onPropertyChange('size', e.target.value)}
          >
            <option value="small">Pequeno</option>
            <option value="medium">Médio</option>
            <option value="large">Grande</option>
          </select>
        </div>
      </div>
    );
  }

  if (block.type === 'countdown') {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Data Final</label>
          <input
            type="datetime-local"
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.endDate as string}
            onChange={e => onPropertyChange('endDate', e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Título</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.title as string}
            onChange={e => onPropertyChange('title', e.target.value)}
            placeholder="Ex: Lançamento em..."
          />
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Estilo</label>
          <select
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.style as string || 'boxes'}
            onChange={e => onPropertyChange('style', e.target.value)}
          >
            <option value="boxes">Caixas</option>
            <option value="simple">Simples</option>
            <option value="circular">Circular</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Cores</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-gray-400">Números</span>
              <input
                type="color"
                value={block.props.numberColor as string || '#000000'}
                onChange={e => onPropertyChange('numberColor', e.target.value)}
                className="block w-full mt-1"
              />
            </div>
            <div>
              <span className="text-xs text-gray-400">Texto</span>
              <input
                type="color"
                value={block.props.textColor as string || '#666666'}
                onChange={e => onPropertyChange('textColor', e.target.value)}
                className="block w-full mt-1"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (block.type === 'pricing') {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Título do Plano</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.title as string}
            onChange={e => onPropertyChange('title', e.target.value)}
            placeholder="Ex: Plano Básico"
          />
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Preço</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="w-20 border rounded px-3 py-2 bg-gray-700 text-white"
              value={block.props.currency as string || 'R$'}
              onChange={e => onPropertyChange('currency', e.target.value)}
              placeholder="R$"
            />
            <input
              type="number"
              className="flex-1 border rounded px-3 py-2 bg-gray-700 text-white"
              value={block.props.price as number}
              onChange={e => onPropertyChange('price', parseFloat(e.target.value))}
              placeholder="99.90"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Período</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.period as string}
            onChange={e => onPropertyChange('period', e.target.value)}
            placeholder="Ex: /mês"
          />
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Recursos</label>
          <div className="space-y-2">
            {(block.props.features as string[] || []).map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2 bg-gray-700 text-white"
                  value={feature}
                  onChange={e => {
                    const newFeatures = [...(block.props.features as string[] || [])];
                    newFeatures[index] = e.target.value;
                    onPropertyChange('features', newFeatures);
                  }}
                />
                <button
                  className="p-2 text-red-500 hover:text-red-400"
                  onClick={() => {
                    const newFeatures = [...(block.props.features as string[] || [])];
                    newFeatures.splice(index, 1);
                    onPropertyChange('features', newFeatures);
                  }}
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition w-full"
            onClick={() => {
              const newFeatures = [...(block.props.features as string[] || []), ''];
              onPropertyChange('features', newFeatures);
            }}
          >
            + Adicionar Recurso
          </button>
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Botão</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white mb-2"
            value={block.props.buttonText as string}
            onChange={e => onPropertyChange('buttonText', e.target.value)}
            placeholder="Texto do botão"
          />
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.buttonLink as string}
            onChange={e => onPropertyChange('buttonLink', e.target.value)}
            placeholder="Link do botão"
          />
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Destaque</label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={block.props.featured as boolean}
              onChange={e => onPropertyChange('featured', e.target.checked)}
            />
            <span className="text-sm text-white">Plano em destaque</span>
          </label>
        </div>
      </div>
    );
  }

  if (block.type === 'map') {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Endereço</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.address as string}
            onChange={e => onPropertyChange('address', e.target.value)}
            placeholder="Digite o endereço completo"
          />
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Coordenadas</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              className="border rounded px-3 py-2 bg-gray-700 text-white"
              value={block.props.latitude as string}
              onChange={e => onPropertyChange('latitude', e.target.value)}
              placeholder="Latitude"
            />
            <input
              type="text"
              className="border rounded px-3 py-2 bg-gray-700 text-white"
              value={block.props.longitude as string}
              onChange={e => onPropertyChange('longitude', e.target.value)}
              placeholder="Longitude"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Zoom</label>
          <input
            type="range"
            min="1"
            max="20"
            value={block.props.zoom as number || 15}
            onChange={e => onPropertyChange('zoom', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Altura do Mapa</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            value={block.props.height as number || 400}
            onChange={e => onPropertyChange('height', parseInt(e.target.value))}
            placeholder="Altura em pixels"
          />
        </div>
        <div>
          <label className="text-xs text-gray-300 mb-2 block">Marcador</label>
          <div className="space-y-2">
            <input
              type="text"
              className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
              value={block.props.markerTitle as string}
              onChange={e => onPropertyChange('markerTitle', e.target.value)}
              placeholder="Título do marcador"
            />
            <textarea
              className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
              value={block.props.markerDescription as string}
              onChange={e => onPropertyChange('markerDescription', e.target.value)}
              placeholder="Descrição do marcador"
              rows={3}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Criar contexto para os blocos
const BlocksContext = React.createContext<Block[]>([]);

// Adicionar após as interfaces existentes
interface SiteConfig {
  scripts: {
    head: Array<{
      id: string;
      content: string;
      type?: string;
    }>;
    body: Array<{
      id: string;
      content: string;
      type?: string;
    }>;
  };
  meta: Array<{
    id: string;
    name: string;
    content: string;
  }>;
  analytics: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
  };
}

export default function SiteBuilder() {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);
  const [draggedType, setDraggedType] = useState<BlockType | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'components' | 'settings'>('components');
  const [activeTab, setActiveTab] = useState<PropertyTab>('content');

  const selectedBlock = selectedId ? findBlockById(blocks, selectedId) : null;

  // Adicionar estado para o modo de visualização
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    scripts: {
      head: [],
      body: []
    },
    meta: [],
    analytics: {}
  });

  // Função para remover um bloco
  const handleRemoveBlock = (id: string) => {
    setBlocks(prevBlocks => {
      const removeFromBlocks = (blocks: Block[]): Block[] => {
        return blocks.reduce<Block[]>((acc, block) => {
          if (block.id === id) {
            return acc;
          }
          const newBlock = { ...block };
          if (block.children) {
            newBlock.children = removeFromBlocks(block.children);
          }
          return [...acc, newBlock];
        }, []);
      };

      return removeFromBlocks(prevBlocks);
    });

    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  function handlePropertyChange(key: string, value: unknown) {
    if (!selectedId) return;

    if (key === 'style') {
      setBlocks(blocks => updateBlock(blocks, selectedId, b => ({
        ...b,
        style: value as Block['style']
      })));
    } else if (key === 'children') {
      setBlocks(blocks => updateBlock(blocks, selectedId, b => ({
        ...b,
        children: value as Block[]
      })));
    } else {
      setBlocks(blocks => updateBlock(blocks, selectedId, b => ({
        ...b,
        props: { ...b.props, [key]: value }
      })));
    }
  }

  function updateBlock(blocks: Block[], id: string, updater: (b: Block) => Block): Block[] {
    return blocks.map(block => {
      if (block.id === id) return updater(block);
      if (block.children) {
        return { ...block, children: updateBlock(block.children, id, updater) };
      }
      return block;
    });
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id as string);

    const data = active.data.current as { type: string; blockType?: BlockType; block?: Block; isLibraryItem?: boolean } | undefined;

    console.log('DragStart:', {
      activeId: active.id,
      data,
      isLibraryItem: data?.isLibraryItem,
      blockType: data?.blockType
    });

    if (data?.isLibraryItem && data.blockType) {
      setDraggedType(data.blockType);
    } else {
      const block = findBlockById(blocks, String(active.id));
      if (block) setActiveBlock(block);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveBlock(null);
      setDraggedType(null);
      setActiveId(null);
      return;
    }

    const activeData = active.data.current as { type: string; blockType?: BlockType; block?: Block; isLibraryItem?: boolean; path?: string } | undefined;
    const overData = over.data.current as { type: string; blockId?: string; accepts?: string[]; block?: Block } | undefined;

    console.log('DragEnd - Detailed:', {
      activeData,
      overData,
      activeId: active.id,
      overId: over.id,
      overType: overData?.type,
      overBlock: overData?.block,
      isLibraryItem: activeData?.isLibraryItem,
      blockType: activeData?.blockType,
      isCanvasRoot: over.id === 'canvas-root'
    });

    // Reordenação dentro da seção ou entre seções
    if (activeData?.type === 'block' && !activeData.isLibraryItem) {
      const activeBlock = findBlockById(blocks, String(active.id));
      const overBlock = findBlockById(blocks, String(over.id));

      if (activeBlock) {
        // Encontrar a seção de destino
        const targetSectionId = findNearestSection(blocks, String(over.id));
        if (targetSectionId) {
          // Remover o bloco da seção original
          setBlocks(prevBlocks => {
            const newBlocks = JSON.parse(JSON.stringify(prevBlocks));
            const removeFromSection = (blocks: Block[]): Block[] => {
              return blocks.map(block => {
                if (block.children) {
                  block.children = block.children.filter(child => child.id !== activeBlock.id);
                  if (block.children.length === 0) {
                    block.children = [];
                  }
                  block.children = removeFromSection(block.children);
                }
                return block;
              });
            };
            const blocksWithoutActive = removeFromSection(newBlocks);

            // Adicionar o bloco na nova seção
            const addToSection = (blocks: Block[]): Block[] => {
              return blocks.map(block => {
                if (block.id === targetSectionId) {
                  const targetIndex = overBlock ?
                    block.children?.findIndex(child => child.id === overBlock.id) ?? -1 :
                    (block.children?.length || 0);
                  const insertIndex = targetIndex === -1 ? (block.children?.length || 0) : targetIndex;
                  const children = [...(block.children || [])];
                  children.splice(insertIndex, 0, activeBlock);
                  return { ...block, children };
                }
                if (block.children) {
                  block.children = addToSection(block.children);
                }
                return block;
              });
            };
            return addToSection(blocksWithoutActive);
          });
        }
      }
      return;
    }

    // Se estiver arrastando uma seção da biblioteca
    if (activeData?.type === 'library' && activeData.blockType === 'section') {
      const newSection: Block = {
        id: nanoid(),
        type: 'section',
        props: {
          direction: 'column' as Direction,
          justifyContent: 'start' as JustifyContent,
          alignItems: 'stretch' as AlignItems
        },
        children: [],
        style: {
          padding: { top: '32px', right: '32px', bottom: '32px', left: '32px' }
        }
      };

      let insertIndex = blocks.length;

      // Se soltou sobre uma seção existente, insere antes dela
      if (over.id !== 'canvas-root') {
        insertIndex = blocks.findIndex(b => b.id === over.id);
        if (insertIndex === -1) insertIndex = blocks.length;
      }

      setBlocks(blocks => {
        const newBlocks = [...blocks];
        newBlocks.splice(insertIndex, 0, newSection);
        return newBlocks;
      });

      setSelectedId(newSection.id);
    }

    // Se estiver arrastando um componente para uma seção
    if (activeData?.type === 'library' && activeData.blockType && activeData.blockType !== 'section') {
      const overId = String(over.id);
      const sectionId = overId.startsWith('drop-') ? overId.replace('drop-', '') : findNearestSection(blocks, overId);

      if (sectionId) {
        const newBlock: Block = {
          id: nanoid(),
          type: activeData.blockType,
          props: activeData.blockType === 'text' ? { text: 'Novo texto', color: '#222', fontSize: 20 } :
            activeData.blockType === 'button' ? { text: 'Novo botão', color: '#fff', background: '#2563eb' } :
              activeData.blockType === 'image' ? { src: 'https://placehold.co/240x120' } :
                activeData.blockType === 'carousel' ? { title: 'Carrossel de Imagens', activeSlide: 0 } :
                  activeData.blockType === 'faq' ? { title: 'Perguntas Frequentes' } : {},
          style: activeData.blockType === 'text' ? {
            margin: { top: '0', bottom: '0' },
            padding: { top: '12px', bottom: '12px' }
          } : activeData.blockType === 'button' ? {
            margin: { top: '8px', bottom: '8px' },
            padding: { top: '8px', right: '24px', bottom: '8px', left: '24px' }
          } : undefined
        };

        setBlocks(blocks => updateBlock(blocks, sectionId, b => ({
          ...b,
          children: [...(b.children || []), newBlock]
        })));
        setSelectedId(newBlock.id);
      }
    }

    setActiveBlock(null);
    setDraggedType(null);
    setActiveId(null);
  }

  function handleAddBlock(type: BlockType) {
    const newBlock: Block = {
      id: nanoid(),
      type,
      props: type === 'section' ? {
        direction: 'column' as Direction,
        justifyContent: 'start' as JustifyContent,
        alignItems: 'stretch' as AlignItems
      } :
        type === 'text' ? { text: 'Novo texto', color: '#222', fontSize: 20 } :
          type === 'button' ? { text: 'Novo botão', color: '#fff', background: '#2563eb' } :
            type === 'image' ? { src: 'https://placehold.co/240x120' } :
              type === 'carousel' ? { title: 'Carrossel de Imagens', activeSlide: 0 } :
                type === 'form' ? { title: 'Formulário de Contato' } :
                  type === 'faq' ? { title: 'Perguntas Frequentes' } : {},
      children: type === 'section' ? [] :
        type === 'faq' ? initialFAQQuestions.flatMap(q => [
          {
            id: nanoid(),
            type: 'text',
            props: {
              text: q.question,
              color: '#222',
              fontSize: 18,
              isQuestion: true,
              expanded: false
            }
          },
          {
            id: nanoid(),
            type: 'text',
            props: {
              text: q.answer,
              color: '#666',
              fontSize: 16,
              isAnswer: true
            }
          }
        ]) :
          type === 'carousel' ? [
            {
              id: nanoid(),
              type: 'image',
              props: {
                src: 'https://placehold.co/600x400',
                alt: 'Imagem 1'
              }
            }
          ] :
            type === 'form' ? [
              {
                id: nanoid(),
                type: 'form-field',
                props: {
                  label: 'Nome',
                  type: 'text',
                  required: true
                }
              },
              {
                id: nanoid(),
                type: 'form-field',
                props: {
                  label: 'Email',
                  type: 'email',
                  required: true
                }
              },
              {
                id: nanoid(),
                type: 'form-field',
                props: {
                  label: 'Mensagem',
                  type: 'textarea',
                  required: true
                }
              }
            ] : undefined
    };

    setBlocks(blocks => [...blocks, newBlock]);
    setSelectedId(newBlock.id);
  }

  function handleBlockUpdate(id: string, updater: (block: Block) => Block) {
    setBlocks(blocks => updateBlock(blocks, id, updater));
  }

  const { setNodeRef: setCanvasRef, isOver: isOverCanvas, active: activeOverCanvas } = useDroppable({
    id: 'canvas-root',
    data: {
      type: 'canvas',
      accepts: ['section']
    }
  });

  // Verifica se o item sendo arrastado sobre o canvas é uma seção
  const activeCanvasData = activeOverCanvas?.data.current as { type: string; blockType?: BlockType; isLibraryItem?: boolean } | undefined;

  console.log('Canvas Drop:', {
    isOverCanvas,
    activeCanvasData,
    activeOverCanvas
  });

  const isValidCanvasDrop = activeCanvasData && (
    (activeCanvasData.type === 'library' && activeCanvasData.blockType === 'section')
  );

  // Adicionar antes do return
  const renderSettingsPanel = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">Scripts no Head</h3>
          <div className="space-y-3">
            {siteConfig.scripts.head.map((script) => (
              <div key={script.id} className="bg-gray-700 rounded p-3 relative group">
                <button
                  onClick={() => {
                    setSiteConfig(prev => ({
                      ...prev,
                      scripts: {
                        ...prev.scripts,
                        head: prev.scripts.head.filter(s => s.id !== script.id)
                      }
                    }));
                  }}
                  className="absolute right-2 top-2 p-1 rounded bg-red-600 hover:bg-red-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash size={12} />
                </button>
                <textarea
                  value={script.content}
                  onChange={(e) => {
                    setSiteConfig(prev => ({
                      ...prev,
                      scripts: {
                        ...prev.scripts,
                        head: prev.scripts.head.map(s =>
                          s.id === script.id ? { ...s, content: e.target.value } : s
                        )
                      }
                    }));
                  }}
                  className="w-full h-24 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm font-mono"
                />
                <div className="mt-2">
                  <input
                    type="text"
                    value={script.type || ''}
                    onChange={(e) => {
                      setSiteConfig(prev => ({
                        ...prev,
                        scripts: {
                          ...prev.scripts,
                          head: prev.scripts.head.map(s =>
                            s.id === script.id ? { ...s, type: e.target.value } : s
                          )
                        }
                      }));
                    }}
                    placeholder="Type (opcional, ex: text/javascript)"
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                setSiteConfig(prev => ({
                  ...prev,
                  scripts: {
                    ...prev.scripts,
                    head: [...prev.scripts.head, { id: nanoid(), content: '' }]
                  }
                }));
              }}
              className="w-full py-2 px-3 border border-gray-600 rounded hover:bg-gray-700 text-gray-300 text-sm"
            >
              + Adicionar Script no Head
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">Scripts no Body</h3>
          <div className="space-y-3">
            {siteConfig.scripts.body.map((script) => (
              <div key={script.id} className="bg-gray-700 rounded p-3 relative group">
                <button
                  onClick={() => {
                    setSiteConfig(prev => ({
                      ...prev,
                      scripts: {
                        ...prev.scripts,
                        body: prev.scripts.body.filter(s => s.id !== script.id)
                      }
                    }));
                  }}
                  className="absolute right-2 top-2 p-1 rounded bg-red-600 hover:bg-red-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash size={12} />
                </button>
                <textarea
                  value={script.content}
                  onChange={(e) => {
                    setSiteConfig(prev => ({
                      ...prev,
                      scripts: {
                        ...prev.scripts,
                        body: prev.scripts.body.map(s =>
                          s.id === script.id ? { ...s, content: e.target.value } : s
                        )
                      }
                    }));
                  }}
                  className="w-full h-24 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm font-mono"
                />
                <div className="mt-2">
                  <input
                    type="text"
                    value={script.type || ''}
                    onChange={(e) => {
                      setSiteConfig(prev => ({
                        ...prev,
                        scripts: {
                          ...prev.scripts,
                          body: prev.scripts.body.map(s =>
                            s.id === script.id ? { ...s, type: e.target.value } : s
                          )
                        }
                      }));
                    }}
                    placeholder="Type (opcional, ex: text/javascript)"
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                setSiteConfig(prev => ({
                  ...prev,
                  scripts: {
                    ...prev.scripts,
                    body: [...prev.scripts.body, { id: nanoid(), content: '' }]
                  }
                }));
              }}
              className="w-full py-2 px-3 border border-gray-600 rounded hover:bg-gray-700 text-gray-300 text-sm"
            >
              + Adicionar Script no Body
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">Meta Tags</h3>
          <div className="space-y-3">
            {siteConfig.meta.map((meta) => (
              <div key={meta.id} className="bg-gray-700 rounded p-3 relative group">
                <button
                  onClick={() => {
                    setSiteConfig(prev => ({
                      ...prev,
                      meta: prev.meta.filter(m => m.id !== meta.id)
                    }));
                  }}
                  className="absolute right-2 top-2 p-1 rounded bg-red-600 hover:bg-red-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash size={12} />
                </button>
                <input
                  type="text"
                  value={meta.name}
                  onChange={(e) => {
                    setSiteConfig(prev => ({
                      ...prev,
                      meta: prev.meta.map(m =>
                        m.id === meta.id ? { ...m, name: e.target.value } : m
                      )
                    }));
                  }}
                  placeholder="Nome (ex: description)"
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm mb-2"
                />
                <input
                  type="text"
                  value={meta.content}
                  onChange={(e) => {
                    setSiteConfig(prev => ({
                      ...prev,
                      meta: prev.meta.map(m =>
                        m.id === meta.id ? { ...m, content: e.target.value } : m
                      )
                    }));
                  }}
                  placeholder="Conteúdo"
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                />
              </div>
            ))}
            <button
              onClick={() => {
                setSiteConfig(prev => ({
                  ...prev,
                  meta: [...prev.meta, { id: nanoid(), name: '', content: '' }]
                }));
              }}
              className="w-full py-2 px-3 border border-gray-600 rounded hover:bg-gray-700 text-gray-300 text-sm"
            >
              + Adicionar Meta Tag
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">Analytics</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Google Analytics ID</label>
              <input
                type="text"
                value={siteConfig.analytics.googleAnalyticsId || ''}
                onChange={(e) => {
                  setSiteConfig(prev => ({
                    ...prev,
                    analytics: {
                      ...prev.analytics,
                      googleAnalyticsId: e.target.value
                    }
                  }));
                }}
                placeholder="UA-XXXXXXXXX-X ou G-XXXXXXXXXX"
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Facebook Pixel ID</label>
              <input
                type="text"
                value={siteConfig.analytics.facebookPixelId || ''}
                onChange={(e) => {
                  setSiteConfig(prev => ({
                    ...prev,
                    analytics: {
                      ...prev.analytics,
                      facebookPixelId: e.target.value
                    }
                  }));
                }}
                placeholder="XXXXXXXXXXXXXXXXXX"
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <BlocksContext.Provider value={blocks}>
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex min-h-screen bg-gray-900">
          {/* Sidebar com componentes */}
          <div className="w-64 bg-gray-800 border-r border-gray-700 p-6 flex flex-col gap-6 overflow-y-auto">
            {/* Tabs de navegação */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setSidebarTab('components')}
                className={`flex-1 py-4 text-sm font-medium ${sidebarTab === 'components'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
                  }`}
              >
                Componentes
              </button>
              <button
                onClick={() => setSidebarTab('settings')}
                className={`flex-1 py-4 text-sm font-medium ${sidebarTab === 'settings'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
                  }`}
              >
                Configurações
              </button>
            </div>

            {/* Conteúdo da sidebar */}
            <div className="flex-1 overflow-y-auto p-6">
              {sidebarTab === 'components' ? (
                <>
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-white">Componentes</h2>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        placeholder="Buscar componentes..."
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="7" cy="7" r="6" />
                          <line x1="11" y1="11" x2="15" y2="15" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {blockCategories.map(category => (
                    <div key={category.name} className="mt-6 space-y-3">
                      <h3 className="text-sm font-medium text-gray-400">{category.name}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {category.items.map(block => (
                          <LibraryItem
                            key={block.type}
                            type={block.type}
                            label={block.label}
                            icon={block.icon}
                            description={block.description}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                renderSettingsPanel()
              )}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 flex flex-col items-center p-8 min-h-screen bg-gray-900 overflow-y-auto">
            {/* Controles de visualização */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setViewMode('desktop')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${viewMode === 'desktop' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                Desktop
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${viewMode === 'mobile' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <line x1="12" y1="18" x2="12" y2="18" />
                </svg>
                Mobile
              </button>
            </div>

            <div
              ref={setCanvasRef}
              id="canvas-root"
              className={`transition-all relative bg-gray-800 shadow-xl overflow-hidden ${viewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-5xl'
                }`}
              onClick={() => setSelectedId('canvas-root')}
            >
              {/* Área de drop visível sempre que um item estiver sendo arrastado */}
              {activeOverCanvas && (
                <div className={`absolute inset-0 border-2 border-dashed transition-colors pointer-events-none z-10
                  ${isOverCanvas ? (isValidCanvasDrop ? 'border-blue-500 bg-blue-500/10' : 'border-red-500 bg-red-500/10') : 'border-gray-400 bg-gray-400/5'}`}
                />
              )}

              <div
                className="min-h-[calc(100vh-12rem)] transition-all relative"
              >
                {blocks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="text-center text-gray-400">
                      <p className="text-lg mb-4">Arraste uma seção aqui</p>
                      <p className="text-sm">ou</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAddBlock('section')}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                      >
                        <span>+ Nova Seção</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10">
                    <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                      {blocks.map((block, idx) => (
                        <BlockRenderer
                          key={block.id}
                          block={block}
                          onSelect={setSelectedId}
                          selectedId={selectedId || undefined}
                          onDragStart={setActiveBlock}
                          path={`${idx}`}
                          onUpdate={handleBlockUpdate}
                          onRemove={handleRemoveBlock}
                          isPreview={false}
                        />
                      ))}
                    </SortableContext>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Painel de propriedades */}
          {selectedBlock && (
            <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col min-h-screen">
              <div className="flex border-b border-gray-700">
                <button
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'content' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('content')}
                >
                  Conteúdo
                </button>
                <button
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'style' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('style')}
                >
                  Visual
                </button>
                <button
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'advanced' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('advanced')}
                >
                  Avançado
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                {activeTab === 'content' && (
                  <PropertyEditor
                    block={selectedBlock}
                    onPropertyChange={handlePropertyChange}
                  />
                )}

                {activeTab === 'style' && (
                  <div className="space-y-4">
                    {selectedBlock.type !== 'section' && (
                      <>
                        <div>
                          <label className="text-xs text-gray-300 mb-2 block">Largura</label>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 border rounded px-2 py-1 bg-gray-700 text-white"
                              value={selectedBlock.style?.width || 'auto'}
                              onChange={e => handlePropertyChange('style', { ...selectedBlock.style, width: e.target.value })}
                            >
                              <option value="auto">Auto</option>
                              <option value="100%">100%</option>
                              <option value="75%">75%</option>
                              <option value="50%">50%</option>
                              <option value="25%">25%</option>
                            </select>
                            <input
                              type="number"
                              className="w-20 border rounded px-2 py-1 bg-gray-700 text-white"
                              value={parseInt(selectedBlock.style?.width || '0')}
                              onChange={e => handlePropertyChange('style', { ...selectedBlock.style, width: `${e.target.value}px` })}
                              placeholder="px"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-gray-300 mb-2 block">Altura</label>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 border rounded px-2 py-1 bg-gray-700 text-white"
                              value={selectedBlock.style?.height || 'auto'}
                              onChange={e => handlePropertyChange('style', { ...selectedBlock.style, height: e.target.value })}
                            >
                              <option value="auto">Auto</option>
                              <option value="100%">100%</option>
                              <option value="75%">75%</option>
                              <option value="50%">50%</option>
                              <option value="25%">25%</option>
                            </select>
                            <input
                              type="number"
                              className="w-20 border rounded px-2 py-1 bg-gray-700 text-white"
                              value={parseInt(selectedBlock.style?.height || '0')}
                              onChange={e => handlePropertyChange('style', { ...selectedBlock.style, height: `${e.target.value}px` })}
                              placeholder="px"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Cores e fundos */}
                    <div>
                      <label className="text-xs text-gray-300 mb-2 block">Aparência</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-gray-400">Cor de fundo</span>
                          <input
                            type="color"
                            value={selectedBlock.style?.backgroundColor || '#ffffff'}
                            onChange={e => handlePropertyChange('style', { ...selectedBlock.style, backgroundColor: e.target.value })}
                            className="block w-full mt-1"
                          />
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Opacidade</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={parseInt(selectedBlock.style?.opacity || '100')}
                            onChange={e => handlePropertyChange('style', { ...selectedBlock.style, opacity: `${e.target.value}%` })}
                            className="block w-full mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sombras */}
                    <div>
                      <label className="text-xs text-gray-300 mb-2 block">Sombra</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-gray-400">Intensidade</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={parseInt(selectedBlock.style?.shadowIntensity || '0')}
                            onChange={e => handlePropertyChange('style', { ...selectedBlock.style, shadowIntensity: e.target.value })}
                            className="block w-full mt-1"
                          />
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Cor</span>
                          <input
                            type="color"
                            value={selectedBlock.style?.shadowColor || '#000000'}
                            onChange={e => handlePropertyChange('style', { ...selectedBlock.style, shadowColor: e.target.value })}
                            className="block w-full mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'advanced' && (
                  <div className="space-y-6">
                    <SpacingControl
                      label="Margem"
                      value={selectedBlock.style?.margin}
                      onChange={value => handlePropertyChange('style', { ...selectedBlock.style, margin: value })}
                    />

                    <SpacingControl
                      label="Padding"
                      value={selectedBlock.style?.padding}
                      onChange={value => handlePropertyChange('style', { ...selectedBlock.style, padding: value })}
                    />

                    <BorderControl
                      label="Borda"
                      value={selectedBlock.style?.border}
                      onChange={value => handlePropertyChange('style', { ...selectedBlock.style, border: value })}
                    />

                    <BorderRadiusControl
                      label="Raio da borda"
                      value={selectedBlock.style?.borderRadius}
                      onChange={value => handlePropertyChange('style', { ...selectedBlock.style, borderRadius: value })}
                    />

                    <div>
                      <label className="text-xs text-gray-300 mb-2 block">ID do Elemento</label>
                      <input
                        className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
                        value={selectedBlock.props.elementId as string || ''}
                        onChange={e => handlePropertyChange('elementId', e.target.value)}
                        placeholder="Identificador único"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-300 mb-2 block">Classes CSS</label>
                      <input
                        className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
                        value={selectedBlock.props.cssClasses as string || ''}
                        onChange={e => handlePropertyChange('cssClasses', e.target.value)}
                        placeholder="Classes separadas por espaço"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-300 mb-2 block">Visibilidade</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedBlock.props.hideOnMobile as boolean}
                            onChange={e => handlePropertyChange('hideOnMobile', e.target.checked)}
                          />
                          <span className="text-sm text-white">Ocultar no mobile</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedBlock.props.hideOnDesktop as boolean}
                            onChange={e => handlePropertyChange('hideOnDesktop', e.target.checked)}
                          />
                          <span className="text-sm text-white">Ocultar no desktop</span>
                        </label>
                      </div>
                    </div>

                    <button
                      className="w-full mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center justify-center gap-2"
                      onClick={() => handleRemoveBlock(selectedBlock.id)}
                    >
                      <Trash size={16} />
                      <span>Remover bloco</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <DragOverlay>
            {activeId && (
              draggedType ? (
                <LibraryItem
                  type={draggedType}
                  label={blockCategories.flatMap(c => c.items).find(i => i.type === draggedType)?.label || ''}
                  icon={blockCategories.flatMap(c => c.items).find(i => i.type === draggedType)?.icon || null}
                />
              ) : activeBlock ? (
                <BlockRenderer
                  block={activeBlock}
                  onSelect={() => { }}
                  selectedId={undefined}
                  onDragStart={() => { }}
                  path={''}
                  onUpdate={() => { }}
                  onRemove={() => { }}
                  isPreview={false}
                />
              ) : null
            )}
          </DragOverlay>
        </div>
      </DndContext>
    </BlocksContext.Provider>
  );
} 