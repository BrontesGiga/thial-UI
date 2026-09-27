import { describe, expect, it } from "vitest";
import {
  addItem,
  buildOrderMessage,
  buildWhatsAppUrl,
  cartCount,
  parseCart,
  removeItem,
  setQuantity,
  type CartLine,
} from "../../src/lib/cart";

describe("parseCart", () => {
  it("returns an empty array for null or garbage input", () => {
    expect(parseCart(null)).toEqual([]);
    expect(parseCart("not json")).toEqual([]);
    expect(parseCart('"a string"')).toEqual([]);
    expect(parseCart("42")).toEqual([]);
  });

  it("drops malformed entries", () => {
    const raw = JSON.stringify([
      { id: "a", name: "A", quantity: 1 },
      { id: "b", name: "B", quantity: 0 },
      { id: "c", name: "C", quantity: -1 },
      { id: "d", name: "D", quantity: 1.5 },
      { id: "e", name: "E" },
      { name: "no id", quantity: 1 },
      { id: "f", name: "", quantity: 1 },
      "not an object",
      null,
    ]);
    expect(parseCart(raw)).toEqual([{ id: "a", name: "A", quantity: 1 }]);
  });

  it("caps quantity at 99", () => {
    const raw = JSON.stringify([{ id: "a", name: "A", quantity: 500 }]);
    expect(parseCart(raw)).toEqual([{ id: "a", name: "A", quantity: 99 }]);
  });
});

describe("addItem", () => {
  it("adds a new line", () => {
    const cart = addItem([], { id: "a", name: "A" });
    expect(cart).toEqual([{ id: "a", name: "A", quantity: 1 }]);
  });

  it("increments an existing line", () => {
    const cart: CartLine[] = [{ id: "a", name: "A", quantity: 1 }];
    expect(addItem(cart, { id: "a", name: "A" }, 2)).toEqual([
      { id: "a", name: "A", quantity: 3 },
    ]);
  });

  it("caps at 99", () => {
    const cart: CartLine[] = [{ id: "a", name: "A", quantity: 98 }];
    expect(addItem(cart, { id: "a", name: "A" }, 5)[0].quantity).toBe(99);
  });
});

describe("setQuantity", () => {
  it("sets the quantity of an existing line", () => {
    const cart: CartLine[] = [{ id: "a", name: "A", quantity: 1 }];
    expect(setQuantity(cart, "a", 5)).toEqual([
      { id: "a", name: "A", quantity: 5 },
    ]);
  });

  it("removes the line when quantity is 0 or less", () => {
    const cart: CartLine[] = [{ id: "a", name: "A", quantity: 1 }];
    expect(setQuantity(cart, "a", 0)).toEqual([]);
    expect(setQuantity(cart, "a", -3)).toEqual([]);
  });
});

describe("removeItem", () => {
  it("removes only the matching line", () => {
    const cart: CartLine[] = [
      { id: "a", name: "A", quantity: 1 },
      { id: "b", name: "B", quantity: 2 },
    ];
    expect(removeItem(cart, "a")).toEqual([
      { id: "b", name: "B", quantity: 2 },
    ]);
  });
});

describe("cartCount", () => {
  it("sums quantities", () => {
    const cart: CartLine[] = [
      { id: "a", name: "A", quantity: 2 },
      { id: "b", name: "B", quantity: 1 },
    ];
    expect(cartCount(cart)).toBe(3);
  });

  it("is 0 for an empty cart", () => {
    expect(cartCount([])).toBe(0);
  });
});

const t = {
  greeting: "¡Hola! Quiero hacer un pedido:",
  line: "- {quantity}x {name}",
  footer: "(enviado desde {host})",
};

describe("buildOrderMessage", () => {
  it("joins greeting, lines and footer", () => {
    const lines: CartLine[] = [
      { id: "a", name: "Una canción más", quantity: 2 },
      { id: "b", name: "Abrazo de domingo", quantity: 1 },
    ];
    const message = buildOrderMessage(lines, t, "thial-ui.example.com");
    expect(message).toBe(
      [
        "¡Hola! Quiero hacer un pedido:",
        "- 2x Una canción más",
        "- 1x Abrazo de domingo",
        "(enviado desde thial-ui.example.com)",
      ].join("\n"),
    );
  });
});

describe("buildWhatsAppUrl", () => {
  it("encodes accents, newlines, & and ? correctly", () => {
    const lines: CartLine[] = [{ id: "a", name: "canción", quantity: 1 }];
    const message = buildOrderMessage(lines, t, "a.com");
    const url = buildWhatsAppUrl("573133846317", message);

    expect(url.startsWith("https://wa.me/573133846317?text=")).toBe(true);
    const encoded = url.split("?text=")[1];
    expect(encoded).toContain("canci%C3%B3n");
    expect(encoded).toContain("%0A");
    expect(decodeURIComponent(encoded)).toBe(message);
  });

  it("encodes & and ? in a name", () => {
    const lines: CartLine[] = [
      { id: "a", name: "Sal & pimienta?", quantity: 1 },
    ];
    const message = buildOrderMessage(lines, t, "a.com");
    const url = buildWhatsAppUrl("573133846317", message);
    const encoded = url.split("?text=")[1];
    expect(encoded).toContain("%26");
    expect(encoded).toContain("%3F");
    expect(encoded).not.toContain("&pimienta");
  });
});
