import type { Metadata } from "next";
import { ShoppingList } from "./shopping-list";

export const metadata: Metadata = { title: "Lista de compras" };

export default function ShoppingPage() {
  return <ShoppingList />;
}
