import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';

export interface TipTapEditorProps {
  value: JSONContent | null | undefined;
  onChange: (json: JSONContent) => void;
  onUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
  placeholder?: string;
}

type ActivePanel = 'image' | 'link' | null;
type UploadState = 'idle' | 'uploading' | 'error';

interface ToolbarButtonProps {
  children: ReactNode;
  disabled?: boolean;
  isActive?: boolean;
  label: string;
  onClick: () => void;
}

const EMPTY_DOCUMENT: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

function ToolbarButton({
  children,
  disabled = false,
  isActive = false,
  label,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      aria-label={label}
      aria-pressed={isActive}
      className={`editor-toolbar-button${isActive ? ' is-active' : ''}`}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function toSafeLink(rawUrl: string): string | null {
  const value = rawUrl.trim();

  if (!value) {
    return null;
  }

  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(value);

  try {
    const url = new URL(hasScheme ? value : `https://${value}`);

    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function toSafeImageUrl(rawUrl: string): string | null {
  const value = rawUrl.trim();

  if (!value) {
    return null;
  }

  if (value.startsWith('/')) {
    return value;
  }

  if (/^data:image\/(?:avif|gif|jpe?g|png|svg\+xml|webp);base64,/i.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('The image could not be read.'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Controlled rich-text editor for article bodies. When no upload handler is
 * supplied, local image files are embedded as data URLs so drafting still works.
 */
export default function TipTapEditor({
  value,
  onChange,
  onUpload,
  disabled = false,
  placeholder = 'Write the story women will want to pass on…',
}: TipTapEditorProps) {
  const onChangeRef = useRef(onChange);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadState, setUploadState] = useState<UploadState>('idle');

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
        },
      }),
    ],
    content: value ?? EMPTY_DOCUMENT,
    editable: !disabled,
    editorProps: {
      attributes: {
        'aria-label': 'Article content editor',
        class: 'editor-content',
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor: updatedEditor }) => {
      onChangeRef.current(updatedEditor.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextContent = value ?? EMPTY_DOCUMENT;
    const currentContent = JSON.stringify(editor.getJSON());
    const incomingContent = JSON.stringify(nextContent);

    if (currentContent !== incomingContent) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
    }
  }, [editor, value]);

  const togglePanel = (panel: Exclude<ActivePanel, null>) => {
    setUploadMessage('');
    setUploadState('idle');

    if (panel === 'link' && editor?.isActive('link')) {
      const href = editor.getAttributes('link').href;
      setLinkUrl(typeof href === 'string' ? href : '');
    }

    setActivePanel((currentPanel) => (currentPanel === panel ? null : panel));
  };

  const insertImage = (source: string) => {
    const safeSource = toSafeImageUrl(source);

    if (!safeSource) {
      setUploadState('error');
      setUploadMessage('Use an https image URL, a site upload, or a local image file.');
      return false;
    }

    editor
      ?.chain()
      .focus()
      .setImage({
        src: safeSource,
        ...(imageAlt.trim() ? { alt: imageAlt.trim() } : {}),
      })
      .run();

    setImageUrl('');
    setImageAlt('');
    setUploadMessage('');
    setUploadState('idle');
    setActivePanel(null);
    return true;
  };

  const handleImageUrlInsert = () => {
    insertImage(imageUrl);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || disabled) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadState('error');
      setUploadMessage('Choose an image file to add it to the article.');
      return;
    }

    setUploadState('uploading');
    setUploadMessage('Adding image…');

    try {
      const source = onUpload ? await onUpload(file) : await fileToDataUrl(file);

      if (!insertImage(source)) {
        return;
      }
    } catch (error) {
      setUploadState('error');
      setUploadMessage(error instanceof Error ? error.message : 'The image upload failed. Please try again.');
    }
  };

  const handleLinkInsert = () => {
    const safeUrl = toSafeLink(linkUrl);

    if (!safeUrl) {
      setUploadState('error');
      setUploadMessage('Enter a valid web, email, or phone link.');
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: safeUrl }).run();
    setLinkUrl('');
    setUploadMessage('');
    setUploadState('idle');
    setActivePanel(null);
  };

  const isDisabled = disabled || !editor;

  return (
    <section
      aria-label="Rich text editor"
      className={`editor-shell${disabled ? ' is-disabled' : ''}`}
    >
      <div aria-label="Text formatting" className="editor-toolbar" role="toolbar">
        <div className="editor-toolbar-group">
          <ToolbarButton
            disabled={isDisabled}
            isActive={editor?.isActive('bold')}
            label="Bold"
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <strong aria-hidden="true">B</strong>
          </ToolbarButton>
          <ToolbarButton
            disabled={isDisabled}
            isActive={editor?.isActive('italic')}
            label="Italic"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <em aria-hidden="true">I</em>
          </ToolbarButton>
          <ToolbarButton
            disabled={isDisabled}
            isActive={editor?.isActive('underline')}
            label="Underline"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <span aria-hidden="true" className="editor-underlined-letter">U</span>
          </ToolbarButton>
          <ToolbarButton
            disabled={isDisabled}
            isActive={editor?.isActive('highlight')}
            label="Highlight"
            onClick={() => editor?.chain().focus().toggleHighlight().run()}
          >
            <span aria-hidden="true" className="editor-highlight-letter">A</span>
          </ToolbarButton>
        </div>

        <span aria-hidden="true" className="editor-toolbar-divider" />

        <div className="editor-toolbar-group">
          {[1, 2, 3].map((level) => (
            <ToolbarButton
              disabled={isDisabled}
              isActive={editor?.isActive('heading', { level })}
              key={level}
              label={`Heading ${level}`}
              onClick={() =>
                editor
                  ?.chain()
                  .focus()
                  .toggleHeading({ level: level as 1 | 2 | 3 })
                  .run()
              }
            >
              <span aria-hidden="true">H{level}</span>
            </ToolbarButton>
          ))}
        </div>

        <span aria-hidden="true" className="editor-toolbar-divider" />

        <div className="editor-toolbar-group">
          <ToolbarButton
            disabled={isDisabled}
            isActive={editor?.isActive('bulletList')}
            label="Bulleted list"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <span aria-hidden="true">•≡</span>
          </ToolbarButton>
          <ToolbarButton
            disabled={isDisabled}
            isActive={editor?.isActive('orderedList')}
            label="Numbered list"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <span aria-hidden="true">1≡</span>
          </ToolbarButton>
          <ToolbarButton
            disabled={isDisabled}
            isActive={editor?.isActive('blockquote')}
            label="Block quote"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          >
            <span aria-hidden="true">❝</span>
          </ToolbarButton>
        </div>

        <span aria-hidden="true" className="editor-toolbar-divider" />

        <div className="editor-toolbar-group">
          <ToolbarButton
            disabled={isDisabled}
            isActive={editor?.isActive({ textAlign: 'left' })}
            label="Align left"
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          >
            <span aria-hidden="true">≡</span>
          </ToolbarButton>
          <ToolbarButton
            disabled={isDisabled}
            isActive={editor?.isActive({ textAlign: 'center' })}
            label="Align center"
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          >
            <span aria-hidden="true">☰</span>
          </ToolbarButton>
          <ToolbarButton
            disabled={isDisabled}
            isActive={editor?.isActive({ textAlign: 'right' })}
            label="Align right"
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          >
            <span aria-hidden="true">☷</span>
          </ToolbarButton>
        </div>

        <span aria-hidden="true" className="editor-toolbar-divider" />

        <div className="editor-toolbar-group">
          <ToolbarButton
            disabled={isDisabled}
            isActive={editor?.isActive('link') || activePanel === 'link'}
            label="Add or edit link"
            onClick={() => togglePanel('link')}
          >
            <span aria-hidden="true">↗</span>
          </ToolbarButton>
          <ToolbarButton
            disabled={isDisabled}
            isActive={activePanel === 'image'}
            label="Add image"
            onClick={() => togglePanel('image')}
          >
            <span aria-hidden="true">▧</span>
          </ToolbarButton>
        </div>

        <div className="editor-toolbar-spacer" />

        <div className="editor-toolbar-group">
          <ToolbarButton
            disabled={isDisabled || !editor?.can().undo()}
            label="Undo"
            onClick={() => editor?.chain().focus().undo().run()}
          >
            <span aria-hidden="true">↶</span>
          </ToolbarButton>
          <ToolbarButton
            disabled={isDisabled || !editor?.can().redo()}
            label="Redo"
            onClick={() => editor?.chain().focus().redo().run()}
          >
            <span aria-hidden="true">↷</span>
          </ToolbarButton>
        </div>
      </div>

      {activePanel === 'link' && (
        <div aria-label="Insert link" className="editor-input-panel" role="group">
          <label className="editor-input-label" htmlFor="tiptap-link-url">
            Link address
          </label>
          <input
            className="editor-inline-input"
            disabled={isDisabled}
            id="tiptap-link-url"
            onChange={(event) => setLinkUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleLinkInsert();
              }
            }}
            placeholder="https://example.com"
            type="url"
            value={linkUrl}
          />
          <button
            className="editor-inline-action"
            disabled={isDisabled}
            onClick={handleLinkInsert}
            type="button"
          >
            Apply link
          </button>
          {editor?.isActive('link') && (
            <button
              className="editor-inline-action editor-inline-action-muted"
              disabled={isDisabled}
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                setActivePanel(null);
              }}
              type="button"
            >
              Remove link
            </button>
          )}
        </div>
      )}

      {activePanel === 'image' && (
        <div aria-label="Insert image" className="editor-input-panel editor-image-panel" role="group">
          <label className="editor-input-label" htmlFor="tiptap-image-url">
            Image URL
          </label>
          <input
            className="editor-inline-input"
            disabled={isDisabled || uploadState === 'uploading'}
            id="tiptap-image-url"
            onChange={(event) => setImageUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleImageUrlInsert();
              }
            }}
            placeholder="https://images.example.com/editorial.jpg"
            type="url"
            value={imageUrl}
          />
          <label className="editor-input-label" htmlFor="tiptap-image-alt">
            Alt text <span className="editor-optional-label">(optional)</span>
          </label>
          <input
            className="editor-inline-input"
            disabled={isDisabled || uploadState === 'uploading'}
            id="tiptap-image-alt"
            onChange={(event) => setImageAlt(event.target.value)}
            placeholder="Describe the image"
            type="text"
            value={imageAlt}
          />
          <button
            className="editor-inline-action"
            disabled={isDisabled || uploadState === 'uploading'}
            onClick={handleImageUrlInsert}
            type="button"
          >
            Insert URL
          </button>
          <input
            accept="image/avif,image/gif,image/jpeg,image/png,image/svg+xml,image/webp"
            aria-label="Upload an image file"
            className="editor-file-input"
            disabled={isDisabled || uploadState === 'uploading'}
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
          <button
            className="editor-inline-action editor-upload-button"
            disabled={isDisabled || uploadState === 'uploading'}
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            {uploadState === 'uploading' ? 'Uploading…' : 'Upload image'}
          </button>
        </div>
      )}

      {uploadMessage && (
        <p
          aria-live="polite"
          className={`editor-upload-status${uploadState === 'error' ? ' is-error' : ''}`}
          role={uploadState === 'error' ? 'alert' : undefined}
        >
          {uploadMessage}
        </p>
      )}

      <div className="editor-surface">
        {editor ? (
          <EditorContent editor={editor} />
        ) : (
          <p aria-live="polite" className="editor-loading">
            Preparing your writing desk…
          </p>
        )}
      </div>
    </section>
  );
}
