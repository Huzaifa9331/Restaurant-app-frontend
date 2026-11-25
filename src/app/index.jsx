import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../components/Authocontext";
import { useCart } from "../components/CartContext";

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, restoring, isAuthenticated, logout } = useAuth();
  const { items } = useCart();
  const cartCount = items.reduce((n, i) => n + i.qty, 0);

  useEffect(() => {
    if (!restoring && !isAuthenticated) router.replace("/login"); // change if your login file is named differently
  }, [restoring, isAuthenticated]);

  if (restoring || !user) {
    return <View style={s.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  const cards = [
    { title: "Food Menu", sub: "Explore available food items", to: "/menu" },
    { title: "My Cart", sub: cartCount ? `${cartCount} item(s) in your cart` : "Your cart is empty", to: "/cart" },
    { title: "My Orders", sub: "View your previous orders", to: "/orders" },
    { title: "Order Tracking", sub: "Follow your order status", to: "/tracking" },
    { title: "Reservations", sub: "Manage your table bookings", to: "/reservations" },
  ];

  return (
    <ScrollView style={s.page} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40, paddingHorizontal: 20 }}>
      <Text style={s.hello}>Welcome, {user.name}!</Text>
      <Text style={s.sub}>Customer Dashboard</Text>

      {cards.map((c) => (
        <Pressable key={c.to} style={({ pressed }) => [s.card, pressed && { opacity: 0.6 }]} onPress={() => router.push(c.to)}>
          <Text style={s.cardTitle}>{c.title}</Text>
          <Text style={s.cardSub}>{c.sub}</Text>
        </Pressable>
      ))}

      <View style={s.info}>
        <Text style={s.cardTitle}>Account Information</Text>
        <Text style={s.line}>Name: {user.name}</Text>
        <Text style={s.line}>Email: {user.email}</Text>
        <Text style={s.line}>Role: {user.role}</Text>
      </View>

      <Pressable style={s.logout} onPress={async () => { await logout(); router.replace("/login"); }}>
        <Text style={s.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hello: { fontSize: 28, fontWeight: "800", color: "#111827" },
  sub: { fontSize: 22, fontWeight: "700", color: "#2563eb", marginTop: 6, marginBottom: 16 },
  card: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#e5e7eb", padding: 20, marginBottom: 14 },
  cardTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  cardSub: { fontSize: 16, color: "#6b7280", marginTop: 6 },
  info: { backgroundColor: "#fff", borderRadius: 14, padding: 20, marginTop: 10 },
  line: { fontSize: 16, color: "#374151", marginTop: 8 },
  logout: { backgroundColor: "#dc2626", borderRadius: 10, padding: 16, alignItems: "center", marginTop: 20 },
  logoutText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});