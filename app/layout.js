import "./globals.css";

export const metadata = {
  title: "Task-management",
  description: "Task-management web application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
