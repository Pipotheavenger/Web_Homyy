'use client';

import { useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const buttons = [
    { icon: Bold, command: 'bold', title: 'Negrita (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Cursiva (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Subrayado (Ctrl+U)' },
    { icon: Heading1, command: 'formatBlock', value: 'h2', title: 'Título Grande' },
    { icon: Heading2, command: 'formatBlock', value: 'h3', title: 'Título Pequeño' },
    { icon: List, command: 'insertUnorderedList', title: 'Lista con viñetas' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Lista numerada' },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Alinear a la izquierda' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Centrar' },
    { icon: AlignRight, command: 'justifyRight', title: 'Alinear a la derecha' },
  ];

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {buttons.map((btn, index) => {
          const Icon = btn.icon;
          return (
            <button
              key={index}
              type="button"
              onClick={() => execCommand(btn.command, btn.value)}
              title={btn.title}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
            >
              <Icon size={18} className="text-gray-700" />
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={(e) => {
          // Permitir pegado con formato
          setTimeout(handleInput, 0);
        }}
        className="min-h-[500px] p-6 focus:outline-none prose prose-lg max-w-none text-gray-900"
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          color: '#111827',
        }}
        data-placeholder={placeholder}
      />

      <style jsx global>{`
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contentEditable] {
          color: #111827 !important;
        }
        
        [contentEditable] * {
          color: #111827 !important;
        }
        
        [contentEditable] h1,
        [contentEditable] h2,
        [contentEditable] h3,
        [contentEditable] h4,
        [contentEditable] h5,
        [contentEditable] h6 {
          color: #111827 !important;
          font-weight: bold;
        }
        
        [contentEditable] p {
          color: #111827 !important;
        }
        
        [contentEditable] li {
          color: #111827 !important;
        }
        
        [contentEditable] strong {
          color: #111827 !important;
          font-weight: bold;
        }
        
        [contentEditable] em {
          color: #111827 !important;
          font-style: italic;
        }
        
        [contentEditable] u {
          color: #111827 !important;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

