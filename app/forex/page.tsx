import Link from "next/link";

export default function Forex() {
  return (
    <div>
      <h1>Forex Page</h1>
      <Link href="/forex/currency-pairs">View Currency Pairs</Link>
    </div>
  );
}