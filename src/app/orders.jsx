import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import ScreenHeader from "../components/ScreenHeader";
import { api } from "../components/client";

const COLORS = { Pending: "#d97706", Preparing: "#2563eb", Ready: "#7c3aed", Completed: "#16a34a", Cancelled: "#dc2626" };

export default function Orders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api.get("/orders/my");
      setOrders(r.orders || []);
    } catch (e) {
      Alert.alert("Could not load orders", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cancel = (id) =>
    Alert.alert("Cancel order?", "This cannot be undone.", [
      { text: "No" },
      { text: "Yes, cancel", style: "destructive", onPress: async () => {
          try { await api.put(`/orders/${id}/cancel`); load(); } catch (e) { Alert.alert("Error", e.message); }
        } },
    ]);

  return (
    <View style={s.page}>
      <ScreenHeader title="My Orders" />
      {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2563eb" /> : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o._id}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={s.empty}>No orders yet.</Text>}
          renderItem={({ item: o }) => (
            <View style={s.card}>
              <View style={s.top}>
                <Text style={s.date}>{new Date(o.createdAt).toLocaleString()}</Text>
                <Text style={[s.badge, { backgroundColor: COLORS[o.orderStatus] }]}>{o.orderStatus}</Text>
              </View>
              {o.orderItems.map((i, idx) => (
                <Text key={idx} style={s.item}>{i.quantity} × {i.menuItem?.name || "Item"}</Text>
              ))}
              <Text style={s.meta}>{o.paymentMethod} • Payment {o.paymentStatus}</Text>
              <Text style={s.total}>Total: Rs. {o.totalAmount}</Text>
              <View style={s.actions}>
                {!["Completed", "Cancelled"].includes(o.orderStatus) && (
                  <Pressable style={s.track} onPress={() => router.push("/tracking")}><Text style={s.trackText}>Track</Text></Pressable>
                )}
                {o.orderStatus === "Pending" && (
                  <Pressable style={s.cancel} onPress={() => cancel(o._id)}><Text style={s.cancelText}>Cancel</Text></Pressable>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f8fafc" },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 40, fontSize: 16 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  date: { color: "#6b7280", fontSize: 13 },
  badge: { color: "#fff", fontSize: 12, fontWeight: "700", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: "hidden" },
  item: { fontSize: 15, color: "#111827", marginTop: 2 },
  meta: { fontSize: 13, color: "#6b7280", marginTop: 8 },
  total: { fontSize: 17, fontWeight: "800", color: "#2563eb", marginTop: 4 },
  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  track: { backgroundColor: "#2563eb", paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8 },
  trackText: { color: "#fff", fontWeight: "700" },
  cancel: { borderWidth: 1, borderColor: "#dc2626", paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8 },
  cancelText: { color: "#dc2626", fontWeight: "700" },
});