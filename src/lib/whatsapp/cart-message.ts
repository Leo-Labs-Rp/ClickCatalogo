import { formatCurrency } from "@/lib/format/currency";
import type { CatalogProduct } from "@/types/catalog";

export type CartLine = {
  product: CatalogProduct;
  quantity: number;
};

export function createCartMessage(storeName: string, items: CartLine[]) {
  const lines = items.map(({ product, quantity }) => {
    const subtotal = product.preco * quantity;
    return `• ${quantity}x ${product.nome} — ${formatCurrency(product.preco)} cada — ${formatCurrency(subtotal)}`;
  });
  const total = items.reduce(
    (sum, { product, quantity }) => sum + product.preco * quantity,
    0,
  );

  return [
    `Olá! Gostaria de fazer este pedido na ${storeName}:`,
    "",
    ...lines,
    "",
    `Total do pedido: ${formatCurrency(total)}`,
  ].join("\n");
}
