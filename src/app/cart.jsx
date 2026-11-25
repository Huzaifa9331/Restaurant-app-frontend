import { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import ScreenHeader from "../components/ScreenHeader";
import { api } from "../components/client";
import { useCart } from "../components/CartContext";

export default function Cart() {
  const router = useRouter();
  const { items, updateQty, removeFromCart, clearCart, total } = useCart();
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("Cash On Delivery");
  const [busy, setBusy] = useState(false);

  const placeOrder = async () => {
    if (!address.trim()) return Alert.alert("Address needed", "Enter your delivery address.");
    setBusy(true);
    try {
      const res = await api.post("/orders", {
        orderItems: items.map((i) => ({ menuItem: i._id, quantity: i.qty })),
        deliveryAddress: address.trim(),
        paymentMethod: payment,
      });
      if (payment === "Online") await api.put(`/orders/${res.order._id}/pay`);
      clearCart();
      Alert.alert("Order placed", payment === "Online" ? "Payment received. Thank you!" : "Pay cash on delivery.");
      router.replace("/tracking");
    } catch (e) {
      Alert.alert("Order failed", e.message);
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={s.page}>
        <ScreenHeader title="My Cart" />
        <View style={s.emptyBox}>
          <Text style={s.empty}>Your cart is empty</Text>
          <Pressable style={s.btn} onPress={() => router.replace("/menu")}><Text style={s.btnText}>Browse Menu</Text></Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={s.page}>
      <ScreenHeader title="My Cart" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {items.map((i) => (
          <View key={i._id} style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{i.name}</Text>
              <Text style={s.price}>Rs. {i.price} × {i.qty} = Rs. {i.price * i.qty}</Text>
            </View>
            <View style={s.qty}>
              <Pressable style={s.qBtn} onPress={() => updateQty(i._id, i.qty - 1)}><Text style={s.qText}>−</Text></Pressable>
              <Text style={s.qNum}>{i.qty}</Text>
              <Pressable style={s.qBtn} onPress={() => updateQty(i._id, i.qty + 1)}><Text style={s.qText}>+</Text></Pressable>
            </View>
            <Pressable onPress={() => removeFromCart(i._id)} hitSlop={10}><Text style={s.remove}>✕</Text></Pressable>
          </View>
        ))}

        <Text style={s.label}>Delivery address</Text>
        <TextInput style={s.input} placeholder="House, street, area" value={address} onChangeText={setAddress} multiline />

        <Text style={s.label}>Payment method</Text>
        {["Cash On Delivery", "Online"].map((m) => (
          <Pressable key={m} style={[s.option, payment === m && s.optionOn]} onPress={() => setPayment(m)}>
            <Text style={[s.optionText, payment === m && { color: "#2563eb" }]}>
              {payment === m ? "◉ " : "○ "}{m === "Online" ? "Online (card, simulated)" : "Cash On Delivery"}
            </Text>
          </Pressable>
        ))}

        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>Rs. {total}</Text>
        </View>

        <Pressable style={[s.btn, busy && { opacity: 0.6 }]} onPress={placeOrder} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Place Order</Text>}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f8fafc" },
  emptyBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  empty: { fontSize: 18, color: "#6b7280" },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#e5e7eb", gap: 10 },
  name: { fontSize: 16, fontWeight: "700", color: "#111827" },
  price: { fontSize: 13, color: "#6b7280", marginTop: 3 },
  qty: { flexDirection: "row", alignItems: "center", gap: 8 },
  qBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: "#e5e7eb", alignItems: "center", justifyContent: "center" },
  qText: { fontSize: 18, fontWeight: "700" },
  qNum: { fontSize: 16, fontWeight: "700", minWidth: 18, textAlign: "center" },
  remove: { color: "#dc2626", fontSize: 18, paddingLeft: 4 },
  label: { fontSize: 15, fontWeight: "700", color: "#374151", marginTop: 18, marginBottom: 8 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, padding: 12, fontSize: 16, minHeight: 56 },
  option: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, padding: 14, marginBottom: 8 },
  optionOn: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  optionText: { fontSize: 16, color: "#374151", fontWeight: "600" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, marginBottom: 16 },
  totalLabel: { fontSize: 20, fontWeight: "700" },
  totalValue: { fontSize: 20, fontWeight: "800", color: "#2563eb" },
  btn: { backgroundColor: "#2563eb", borderRadius: 12, padding: 16, alignItems: "center", paddingHorizontal: 28 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});