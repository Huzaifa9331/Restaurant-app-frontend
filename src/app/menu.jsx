import { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, ScrollView, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import ScreenHeader from "../components/ScreenHeader";
import { api } from "../components/client";
import { useCart } from "../components/CartContext";

const CATS = ["All", "Starters", "Mains", "Sides", "Desserts", "Drinks"];

export default function Menu() {
  const router = useRouter();
  const { items: cart, addToCart } = useCart();
  const [menu, setMenu] = useState([]);
  const [cat, setCat] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/menu")
      .then((r) => setMenu(r.items || []))
      .catch((e) => Alert.alert("Could not load menu", e.message))
      .finally(() => setLoading(false));
  }, []);

  const shown = cat === "All" ? menu : menu.filter((m) => m.category === cat);
  const count = cart.reduce((n, i) => n + i.qty, 0);
  const inCart = (id) => cart.find((i) => i._id === id)?.qty || 0;

  return (
    <View style={s.page}>
      <ScreenHeader title="Food Menu" />
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          {CATS.map((c) => (
            <Pressable key={c} onPress={() => setCat(c)} style={[s.chip, cat === c && s.chipOn]}>
              <Text style={[s.chipText, cat === c && { color: "#fff" }]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2563eb" /> : (
        <FlatList
          data={shown}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
          ListEmptyComponent={<Text style={s.empty}>No items yet. Run "node seed.js" in MAD-main.</Text>}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.thumb}><Text style={{ fontSize: 30 }}>🍽️</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.name}</Text>
                <Text style={s.desc} numberOfLines={2}>{item.description}</Text>
                <Text style={s.price}>Rs. {item.price}</Text>
              </View>
              <Pressable style={s.add} onPress={() => addToCart(item)}>
                <Text style={s.addText}>{inCart(item._id) ? `+ (${inCart(item._id)})` : "Add"}</Text>
              </Pressable>
            </View>
          )}
        />
      )}

      {count > 0 && (
        <Pressable style={s.cartBar} onPress={() => router.push("/cart")}>
          <Text style={s.cartText}>View Cart ({count})</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f8fafc" },
  chips: { padding: 12, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#e5e7eb" },
  chipOn: { backgroundColor: "#2563eb" },
  chipText: { fontWeight: "600", color: "#374151" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb", gap: 12 },
  thumb: { width: 60, height: 60, borderRadius: 10, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  name: { fontSize: 17, fontWeight: "700", color: "#111827" },
  desc: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  price: { fontSize: 15, fontWeight: "700", color: "#2563eb", marginTop: 4 },
  add: { backgroundColor: "#2563eb", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  addText: { color: "#fff", fontWeight: "700" },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 40 },
  cartBar: { position: "absolute", left: 16, right: 16, bottom: 24, backgroundColor: "#111827", borderRadius: 14, padding: 16, alignItems: "center" },
  cartText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});