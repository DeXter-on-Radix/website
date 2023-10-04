import { usePathname } from "next/navigation";
import Link from "next/link";

interface AccentLinkProps {
  href: string;
  originalClassName?: string;
  children: React.ReactNode;
}

export const AccentLink: React.FC<AccentLinkProps> = ({
  href,
  originalClassName,
  children,
}) => {
  const pathName = usePathname();
  let className = originalClassName || "";

  if (pathName === href) {
    className += " !text-accent";
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};
