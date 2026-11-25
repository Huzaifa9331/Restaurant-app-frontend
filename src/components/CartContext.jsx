import React, { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = (item) =>
    setItems((prev) => {
      const found = prev.find((i) => i._id === item._id);
      if (found) return prev.map((i) => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });

  const removeFromCart = (id) => setItems((p) => p.filter((i) => i._id !== id));

  const updateQty = (id, qty) =>
    setItems((p) => qty <= 0 ? p.filter((i) => i._id !== id)
                             : p.map((i) => (i._id === id ? { ...i, qty } : i)));

  const clearCart = () => setItems([]);
  const total = items.reduce((s, i) => s + Number(i.price || 0) * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);