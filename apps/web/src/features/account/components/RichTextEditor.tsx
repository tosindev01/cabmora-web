import { useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Heading3,
  Quote,
  List,
  Sparkles,
  Eye,
  Code2,
  RotateCcw,
} from 'lucide-react';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (nextHtml: string) => void;
  placeholder?: string;
  helperText?: string;
  minHeightClass?: string;
}

/**
 * Renders a headline string where words wrapped in `*asterisks*` are rendered
 * as italic accent spans using the active accent color class.
 */
export function FormattedHeadline({
  text,
  accentTextClass = 'text-gold',
}: {
  text: string;
  accentTextClass?: string;
}) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          return (
            <em key={idx} className={`italic font-serif ${accentTextClass}`}>
              {part.slice(1, -1)}
            </em>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
}

/**
 * Safely renders the creator's rich HTML narrative with editorial typography.
 */
export function RichTextDisplay({
  html,
  className = '',
  accentTextClass = 'text-gold',
  isDark = true,
}: {
  html: string;
  className?: string;
  accentTextClass?: string;
  isDark?: boolean;
}) {
  const proseTone = isDark ? 'text-canvas/85' : 'text-ink/85';
  const headingTone = isDark ? 'text-canvas' : 'text-ink';
  const quoteBorder = isDark ? 'border-gold/50 bg-canvas/5' : 'border-gold-deep/50 bg-ink/5';

  return (
    <div
      className={`space-y-4 leading-relaxed ${proseTone} [&_h3]:font-serif [&_h3]:text-[22px] [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:${headingTone} [&_p]:leading-[1.8] [&_strong]:font-semibold [&_strong]:${headingTone} [&_em]:italic [&_blockquote]:border-l-2 [&_blockquote]:${quoteBorder} [&_blockquote]:pl-5 [&_blockquote]:py-3 [&_blockquote]:my-5 [&_blockquote]:font-serif [&_blockquote]:italic [&_blockquote]:text-[18px] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_li::marker]:${accentTextClass} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = 'Write your studio narrative...',
  helperText,
  minHeightClass = 'min-h-[160px]',
}: RichTextEditorProps) {
  const [mode, setMode] = useState<'visual' | 'preview'>('visual');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = (before: string, after: string, fallbackText: string) => {
    const el = textareaRef.current;
    if (!el) {
      onChange(`${value}${before}${fallbackText}${after}`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || fallbackText;
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const insertSnippet = (snippet: string) => {
    onChange(`${value}\n${snippet}`.trim());
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-[12px] text-canvas/70 font-medium">{label}</label>
        {helperText && <span className="text-[11px] text-canvas/40">{helperText}</span>}
      </div>

      <div className="bg-panel-800 border border-canvas/10 rounded-xl overflow-hidden focus-within:border-gold transition-colors">
        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-panel-900 border-b border-canvas/10">
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => wrapSelection('<strong>', '</strong>', 'bold text')}
              className="p-1.5 rounded-lg text-canvas/70 hover:text-white hover:bg-canvas/10 transition-colors"
              title="Bold"
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('<em>', '</em>', 'italic emphasis')}
              className="p-1.5 rounded-lg text-canvas/70 hover:text-white hover:bg-canvas/10 transition-colors"
              title="Italic"
            >
              <Italic size={14} />
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('<h3>', '</h3>', 'Section Heading')}
              className="p-1.5 rounded-lg text-canvas/70 hover:text-white hover:bg-canvas/10 transition-colors"
              title="Subheading (H3)"
            >
              <Heading3 size={14} />
            </button>
            <button
              type="button"
              onClick={() =>
                wrapSelection(
                  '<blockquote>“',
                  '”</blockquote>',
                  'Light is the architecture of emotion and memory.',
                )
              }
              className="p-1.5 rounded-lg text-canvas/70 hover:text-white hover:bg-canvas/10 transition-colors"
              title="Editorial Pull Quote"
            >
              <Quote size={14} />
            </button>
            <button
              type="button"
              onClick={() =>
                insertSnippet(
                  '<ul><li><strong>Signature Deliverable:</strong> High-resolution archival stills &amp; 4K cinema reel.</li></ul>',
                )
              }
              className="p-1.5 rounded-lg text-canvas/70 hover:text-white hover:bg-canvas/10 transition-colors"
              title="Bullet List"
            >
              <List size={14} />
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('<p>', '</p>', 'New paragraph...')}
              className="px-2 py-1 rounded-lg text-[11px] font-medium text-gold hover:bg-gold/10 transition-colors flex items-center gap-1"
              title="Insert Paragraph"
            >
              <Sparkles size={12} /> + Paragraph
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMode(mode === 'visual' ? 'preview' : 'visual')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                mode === 'preview'
                  ? 'bg-gold text-ink font-semibold'
                  : 'text-canvas/60 hover:text-white hover:bg-canvas/10'
              }`}
            >
              {mode === 'preview' ? <Code2 size={12} /> : <Eye size={12} />}
              {mode === 'preview' ? 'Edit Rich Markup' : 'Live Rich Preview'}
            </button>
            <button
              type="button"
              onClick={() => {
                const stripped = value.replace(/<[^>]+>/g, '');
                onChange(`<p>${stripped}</p>`);
              }}
              className="p-1.5 rounded-lg text-canvas/40 hover:text-canvas/80 transition-colors"
              title="Reset formatting to plain paragraph"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Editor or Rendered Preview */}
        {mode === 'visual' ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-transparent p-4 text-[13.5px] text-white outline-none leading-relaxed font-sans resize-y ${minHeightClass}`}
          />
        ) : (
          <div className={`p-5 bg-panel-950/60 ${minHeightClass}`}>
            <RichTextDisplay html={value} isDark />
          </div>
        )}
      </div>
    </div>
  );
}

