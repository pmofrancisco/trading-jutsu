import Link from "next/link";

export default function Header() {
  return (
    <div className="flex gap-4 p-2">
      <Link href="/">Home</Link>
      <Link href="/crypto">Crypto</Link>
      <Link href="/forex">Forex</Link>
      <Link href="/pse">PSE</Link>
    </div>
  );
}
