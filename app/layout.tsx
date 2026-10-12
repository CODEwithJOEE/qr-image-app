import "./globals.css";

// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="antialiased text-slate-900 bg-white"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
