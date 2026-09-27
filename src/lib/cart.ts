// Client-side cart: no backend, no prices — just id/name/quantity in
// localStorage, handed off to WhatsApp as a plain-text order at checkout.

export const CART_KEY = "thial-cart";
export const CART_EVENT = "thial-cart-change";

export type CartLine = { id: string; name: string; quantity: number };

const MAX_QUANTITY = 99;

function isValidLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.id === "string" &&
    line.id.length > 0 &&
    typeof line.name === "string" &&
    line.name.length > 0 &&
    typeof line.quantity === "number" &&
    Number.isInteger(line.quantity) &&
    line.quantity >= 1
  );
}

/** Parses stored JSON into valid cart lines, dropping anything malformed. */
export function parseCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  return data.filter(isValidLine).map((line) => ({
    ...line,
    quantity: Math.min(line.quantity, MAX_QUANTITY),
  }));
}

/** Adds `qty` of an item, capped at MAX_QUANTITY, returning a new array. */
export function addItem(
  cart: CartLine[],
  item: { id: string; name: string },
  qty = 1,
): CartLine[] {
  const existing = cart.find((line) => line.id === item.id);
  if (!existing) {
    return [
      ...cart,
      { id: item.id, name: item.name, quantity: Math.min(qty, MAX_QUANTITY) },
    ];
  }
  return cart.map((line) =>
    line.id === item.id
      ? { ...line, quantity: Math.min(line.quantity + qty, MAX_QUANTITY) }
      : line,
  );
}

/** Sets an item's quantity; qty <= 0 removes the line. */
export function setQuantity(
  cart: CartLine[],
  id: string,
  qty: number,
): CartLine[] {
  if (qty <= 0) return removeItem(cart, id);
  const capped = Math.min(qty, MAX_QUANTITY);
  return cart.map((line) =>
    line.id === id ? { ...line, quantity: capped } : line,
  );
}

export function removeItem(cart: CartLine[], id: string): CartLine[] {
  return cart.filter((line) => line.id !== id);
}

export function cartCount(cart: CartLine[]): number {
  return cart.reduce((total, line) => total + line.quantity, 0);
}

export interface OrderMessageStrings {
  greeting: string;
  /** Template with {quantity} and {name} placeholders. */
  line: string;
  /** Template with {host} placeholder. */
  footer: string;
}

function fill(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
}

/** Builds the plain-text WhatsApp order message. */
export function buildOrderMessage(
  lines: CartLine[],
  t: OrderMessageStrings,
  host: string,
): string {
  const body = lines.map((line) =>
    fill(t.line, { quantity: String(line.quantity), name: line.name }),
  );
  return [t.greeting, ...body, fill(t.footer, { host })].join("\n");
}

export function buildWhatsAppUrl(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function readCart(): CartLine[] {
  try {
    return parseCart(localStorage.getItem(CART_KEY));
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(lines));
  } catch {
    // Storage may be unavailable (private mode, quota); the cart just
    // won't persist for this visitor.
  }
  try {
    window.dispatchEvent(new CustomEvent(CART_EVENT));
  } catch {
    // no-op outside a browser
  }
}

export function clearCart(): void {
  writeCart([]);
}
