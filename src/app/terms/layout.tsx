export default function MdxLayout({ children }: { children: React.ReactNode }) {
  // Create any shared layout or styles here
  return (
    <div className="px-16">
      <div className="max-w-screen-md mx-auto py-28">
        <h1
          className="!m-0 !mb-8 text-5xl text-md bg-gradient-to-r
          from-dexter-gradient-blue to-dexter-gradient-green to-50% bg-clip-text
          text-transparent font-normal"
        >
          Terms of Service
        </h1>
        <div className="text-xs">{children}</div>
      </div>
    </div>
  );
}
