import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = (item) =>
    setItems((prev) => {
      const id = item._id || item.id;
      const found = prev.find((i) => i.menuItem === id);
      if (found)
        return prev.map((i) =>
          i.menuItem === id ? { ...i, quantity: i.quantity + 1 } : i
        );
      return [
        ...prev,
        { menuItem: id, name: item.name, price: Number(item.price), quantity: 1 },
      ];
    });

  const changeQty = (menuItem, delta) =>
    setItems((prev) =>
      prev
        .map((i) =>
          i.menuItem === menuItem ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    );

  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, changeQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);