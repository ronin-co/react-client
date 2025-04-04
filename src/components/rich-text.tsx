import type { FunctionComponent, ReactHTML, ReactNode } from 'react';

type ValueOf<T> = T[keyof T];

type RichTextContent =
  | {
      type:
        | 'doc'
        | 'paragraph'
        | 'blockquote'
        | 'codeBlock'
        | 'bulletList'
        | 'listItem'
        | 'orderedList';
      // If the node is empty in the editor, it won't have `content` set. For example,
      // you might add a new empty paragraph inside the editor.
      content?: Array<RichTextContent>;
      attrs: {
        language: string | null;
      };
    }
  | {
      type: 'codeBlock';
      // If the node is empty in the editor, it won't have `content` set. For example,
      // you might add a new empty code block inside the editor.
      attrs: {
        language: string | null;
      };
      content?: Array<{
        type: 'text';
        text: string;
      }>;
    }
  | {
      type: 'heading';
      // If the node is empty in the editor, it won't have `content` set.
      content?: Array<RichTextContent>;
      attrs: {
        level: 1 | 2 | 3 | 4;
      };
    }
  | {
      type: 'text';
      text: string;
      marks?: Array<
        | {
            type: 'bold' | 'italic' | 'code' | 'link';
          }
        | {
            type: 'link';
            attrs: {
              href: string;
              target: string;
              rel: string;
              class: string;
            };
          }
      >;
    };

interface RichTextProps {
  data: unknown;
  components?: ReactHTML;
}

export const RichText = ({ data, components }: RichTextProps) => {
  const items: Array<RichTextContent> = Array.isArray(data) ? data : [data];

  return items.map((item, position) => {
    if (item.type === 'text') {
      return (item.marks || []).reduce((final, mark) => {
        let Element: keyof JSX.IntrinsicElements | ValueOf<ReactHTML> | null = null;
        let attributes = {};

        switch (mark.type) {
          case 'bold':
            Element = components?.b || 'b';
            break;
          case 'italic':
            Element = components?.i || 'i';
            break;
          case 'code':
            Element = components?.code || 'code';
            break;
          case 'link': {
            Element = components?.a || 'a';
            if ('attrs' in mark) {
              attributes = {
                // We're selecting these properties individually because the last one
                // must be renamed.
                href: mark.attrs.href,
                rel: mark.attrs.rel,
                target: mark.attrs.target,
                className: mark.attrs.class,
              };
            }
            break;
          }
        }

        const RenderingElement = Element as FunctionComponent<{
          children: ReactNode;
        }> | null;

        return RenderingElement ? (
          <RenderingElement
            {...attributes}
            key={
              (typeof RenderingElement === 'string'
                ? RenderingElement
                : RenderingElement.name) + String(position)
            }>
            {final}
          </RenderingElement>
        ) : (
          final
        );
      }, item.text as ReactNode);
    }

    const richtTextPrefix = 'rich-text-';

    let Element: keyof JSX.IntrinsicElements | ValueOf<ReactHTML> | null = null;
    let children: JSX.Element | string | null = item.content ? (
      <RichText
        data={item.content}
        components={components}
        key={richtTextPrefix + String(position)}
      />
    ) : null;
    let language: string | undefined;
    switch (item.type) {
      case 'doc':
        Element = components?.div || 'div';
        break;
      case 'paragraph':
        Element = components?.p || 'p';
        break;
      case 'blockquote':
        Element = components?.blockquote || 'blockquote';
        break;
      case 'heading': {
        if (item.attrs.level === 1) Element = components?.h1 || 'h1';
        if (item.attrs.level === 2) Element = components?.h2 || 'h2';
        if (item.attrs.level === 3) Element = components?.h3 || 'h3';
        if (item.attrs.level === 4) Element = components?.h4 || 'h4';
        break;
      }
      case 'codeBlock':
        {
          Element = components?.pre || 'pre';
          // Marks are not allowed within code blocks, so we can pick its text children
          // directly, to avoid having to render React elements for each line of code.
          language =
            typeof item?.attrs.language === 'undefined' ||
            item.attrs.language === 'null' ||
            item.attrs.language === null
              ? 'plaintext'
              : item?.attrs.language;
          const firstChild = item.content?.[0];
          children = firstChild && 'text' in firstChild ? firstChild?.text : null;
        }
        break;
      case 'bulletList':
        Element = components?.ul || 'ul';
        break;
      case 'listItem':
        Element = components?.li || 'li';
        break;

      case 'orderedList':
        Element = components?.ol || 'ol';
        break;
    }

    const RenderingElement = Element as FunctionComponent<{
      language?: string;
      children: ReactNode;
    }> | null;

    return RenderingElement ? (
      <RenderingElement
        key={
          (typeof RenderingElement === 'string'
            ? RenderingElement
            : RenderingElement.name) + String(position)
        }
        language={language}>
        {children}
      </RenderingElement>
    ) : (
      children
    );
  });
};
