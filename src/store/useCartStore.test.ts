import { describe, expect, it, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCartStore, useCartTotals } from "./useCartStore";
import { makeProduct, makeVariant, makeZone } from "../test/fixtures";

const reset = () =>
  useCartStore.setState({ cart: [], wishlist: [], zone: null, pendingWishlist: null });

describe("useCartStore", () => {
  beforeEach(reset);

  it("ajoute une ligne puis incrémente la quantité pour la même déclinaison", () => {
    const product = makeProduct();
    const variant = product.variants[0];

    useCartStore.getState().addToCart(product, variant, 1);
    useCartStore.getState().addToCart(product, variant, 2);

    const { cart } = useCartStore.getState();
    expect(cart).toHaveLength(1);
    expect(cart[0].qty).toBe(3);
  });

  it("garde deux coloris du même modèle sur deux lignes distinctes", () => {
    const noir = makeVariant({ id: "v-noir", color: "Noir" });
    const beige = makeVariant({ id: "v-beige", color: "Beige" });
    const product = makeProduct({ variants: [noir, beige] });

    useCartStore.getState().addToCart(product, noir);
    useCartStore.getState().addToCart(product, beige);

    expect(useCartStore.getState().cart).toHaveLength(2);
  });

  it("plafonne la quantité au stock disponible lors d'un réincrément", () => {
    const variant = makeVariant({ stock: { qty: 2, threshold: 1 } });
    const product = makeProduct({ variants: [variant] });

    useCartStore.getState().addToCart(product, variant, 1);
    useCartStore.getState().addToCart(product, variant, 5); // 1 + 5 → plafonné à 2
    expect(useCartStore.getState().cart[0].qty).toBe(2);
  });

  it("setQty ne descend jamais sous 1", () => {
    const product = makeProduct();
    useCartStore.getState().addToCart(product, product.variants[0]);
    useCartStore.getState().setQty(product.variants[0].id, -3);
    expect(useCartStore.getState().cart[0].qty).toBe(1);
  });
});

describe("useCartTotals", () => {
  beforeEach(reset);

  it("facture les frais de port sous le seuil de gratuité", () => {
    const product = makeProduct({ price: 6000 });
    useCartStore.getState().addToCart(product, product.variants[0], 2); // 12 000
    useCartStore.getState().setZone(makeZone({ fee: 2000, freeFrom: 30000 }));

    const { result } = renderHook(() => useCartTotals());
    expect(result.current).toMatchObject({ count: 2, subtotal: 12000, shipping: 2000 });
  });

  it("offre la livraison au-delà du seuil de la zone", () => {
    const product = makeProduct({ price: 20000 });
    useCartStore.getState().addToCart(product, product.variants[0], 2); // 40 000
    useCartStore.getState().setZone(makeZone({ fee: 2000, freeFrom: 30000 }));

    const { result } = renderHook(() => useCartTotals());
    expect(result.current.shipping).toBe(0);
  });

  it("n'applique aucun frais de port sur un panier vide", () => {
    useCartStore.getState().setZone(makeZone({ fee: 2000, freeFrom: 30000 }));

    const { result } = renderHook(() => useCartTotals());
    expect(result.current).toMatchObject({ count: 0, subtotal: 0, shipping: 0 });
  });
});
