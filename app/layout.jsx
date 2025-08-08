import "./globals.css";

export const metadata = {
  title: "Series D Finance Dashboard",
  description: "CFO dashboard for a Series D startup (demo)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
