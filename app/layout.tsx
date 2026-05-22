import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'mdspace - Infinite Canvas',
  description: 'Create nested infinite canvases with editable boxes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
