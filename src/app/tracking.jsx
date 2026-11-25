import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import ScreenHeader from "../components/ScreenHeader";
import { api } from "../components/client";

const STEPS = ["Pending", "Preparing", "Ready", "Completed"];
const HINT = {
  Pending: "Order received, waiting for the kitchen",
  Preparing: "The kitchen is preparing your food",
  Ready: "Your order is ready",
  Completed: "Delivered. Enjoy your meal!",
};

export default function Tracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await api.get("/orders/my");
        if (alive) { setOrders((r.orders || []).filter((o) => !["Completed", "Cancelled"].includes(o.orderStatus))); setError(""); }
      } catch (e) {
        if (alive) setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 5000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  return (
    <View style={s.page}>
      <ScreenHeader title="Order Tracking" />
      {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2563eb" /> : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {!!error && <Text style={s.error}>{error}</Text>}
          {orders.length === 0 && !error && <Text style={s.empty}>No active orders to track.</Text>}
          {orders.map((o) => {
            const at = STEPS.indexOf(o.orderStatus);
            return (
              <View key={o._id} style={s.card}>
                <Text style={s.title}>Order #{o._id.slice(-6).toUpperCase()}</Text>
                <Text style={s.meta}>{o.orderItems.map((i) => `${i.quantity}× ${i.menuItem?.name || "Item"}`).join(", ")}</Text>
                <Text style={s.meta}>Total Rs. {o.totalAmount} • {o.paymentMethod} ({o.paymentStatus})</Text>
                <View style={{ marginTop: 14 }}>
                  {STEPS.map((step, idx) => (
                    <View key={step} style={s.step}>
                      <View style={[s.dot, idx <= at && s.dotOn]} />
                      <Text style={[s.stepText, idx <= at && s.stepOn]}>{step}</Text>
                    </View>
                  ))}
                </View>
                <Text style={s.hint}>{HINT[o.orderStatus]}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f8fafc" },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 40, fontSize: 16 },
  error: { color: "#dc2626", textAlign: "center", marginBottom: 10 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#e5e7eb" },
  title: { fontSize: 18, fontWeight: "800", color: "#111827" },
  meta: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  step: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: "#d1d5db", marginRight: 12 },
  dotOn: { backgroundColor: "#16a34a" },
  stepText: { fontSize: 16, color: "#9ca3af" },
  stepOn: { color: "#111827", fontWeight: "700" },
  hint: { marginTop: 10, fontSize: 14, color: "#2563eb", fontWeight: "600" },
});