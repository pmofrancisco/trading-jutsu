import Link from "next/link";

export default function Header() {
  return (
    <div className="flex gap-4 p-4 bg-gray-100 justify-between">
      <Link className="font-bold" href="/">Trading Jutsu</Link>
      <div className="flex gap-4">
        <Link href="/crypto">Crypto</Link>
        <Link href="/forex">Forex</Link>
        <Link href="/pse">PSE</Link>
      </div>
    </div>
  );
}
