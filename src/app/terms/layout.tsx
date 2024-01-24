export default function MdxLayout({ children }: { children: React.ReactNode }) {
  // Create any shared layout or styles here
  return <div className="max-w-screen-lg mx-auto p-4">{children}</div>;
}
