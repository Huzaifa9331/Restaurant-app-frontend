import { Stack } from "expo-router";
import { AuthProvider } from "../components/Authocontext"; // adjust per table above
import { CartProvider } from "../components/CartContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </CartProvider>
    </AuthProvider>
  );
}