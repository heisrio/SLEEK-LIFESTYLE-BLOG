import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import type { JSONContent } from '@tiptap/core';
import type { RichContent } from '../types';

interface ContentRendererProps {
  content: RichContent;
}

export const ContentRenderer = ({ content }: ContentRendererProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ HTMLAttributes: { class: 'article-content__image' } }),
      Link.configure({ openOnClick: true, HTMLAttributes: { rel: 'noreferrer noopener', target: '_blank' } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
    ],
    content: content as JSONContent,
    editable: false,
    immediatelyRender: false,
    editorProps: { attributes: { class: 'article-content__prose' } },
  });

  return <EditorContent editor={editor} className="article-content" />;
};

export default ContentRenderer;
