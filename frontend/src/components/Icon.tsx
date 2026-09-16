import type { ReactElement, SVGProps } from 'react';

export type IconName =
  | 'arrow'
  | 'bookmark'
  | 'check'
  | 'chevron'
  | 'close'
  | 'dashboard'
  | 'edit'
  | 'image'
  | 'link'
  | 'menu'
  | 'more'
  | 'pen'
  | 'plus'
  | 'search'
  | 'sparkle'
  | 'trash'
  | 'upload'
  | 'user';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

const paths: Record<IconName, ReactElement> = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  bookmark: <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.5L6 21V4.75Z" />,
  check: <path d="m5 12 4.25 4.25L19 6.5" />,
  chevron: <path d="m7 10 5 5 5-5" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  dashboard: <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" />,
  edit: <path d="m4 16.5-.75 4.25 4.25-.75L19 8.5 15.5 5 4 16.5ZM13.8 6.7l3.5 3.5M4 4h6" />,
  image: <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13ZM4 16l4.7-4.7a1.5 1.5 0 0 1 2.1 0l2.5 2.5 1.6-1.6a1.5 1.5 0 0 1 2.1 0L20 15.2M8 8.5h.01" />,
  link: <path d="M10 13.5a4 4 0 0 0 5.66.02l2.12-2.12a4 4 0 0 0-5.66-5.66l-1.21 1.2M14 10.5a4 4 0 0 0-5.66-.02L6.22 12.6a4 4 0 0 0 5.66 5.66l1.21-1.2" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  more: <path d="M5 12h.01M12 12h.01M19 12h.01" strokeWidth="3" />,
  pen: <path d="m4 16.5-.75 4.25 4.25-.75L19 8.5 15.5 5 4 16.5ZM13.8 6.7l3.5 3.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <path d="m20 20-4.5-4.5m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />,
  sparkle: <path d="m12 3 1.5 5.4L19 10l-5.5 1.6L12 17l-1.5-5.4L5 10l5.5-1.6L12 3Zm6.5 12 .6 2.1 2.1.6-2.1.6-.6 2.1-.6-2.1-2.1-.6 2.1-.6.6-2.1Z" />,
  trash: <path d="M4 7h16M10 11v5M14 11v5M6.5 7l.75 13h9.5l.75-13M9 7V4h6v3" />,
  upload: <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14.5V19h14v-4.5" />,
  user: <path d="M20 21a8 8 0 0 0-16 0M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" />,
};

export const Icon = ({ name, ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {paths[name]}
  </svg>
);
