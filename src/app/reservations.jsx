import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert, ActivityIndicator } from "react-native";
import ScreenHeader from "../components/ScreenHeader";
import { api } from "../components/client";

export default function Reservations() {
  const [tables, setTables] = useState([]);
  const [mine, setMine] = useState([]);
  const [table, setTable] = useState(null);
  const [guests, setGuests] = useState("2");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [t, r] = await Promise.all([api.get("/tables"), api.get("/reservations/my")]);
      setTables(t.tables || []);
      setMine(r.reservations || []);
    } catch (e) {
      Alert.alert("Could not load", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const book = async () => {
    if (!table) return Alert.alert("Choose a table");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Alert.alert("Date format", "Use YYYY-MM-DD, e.g. 2026-11-25");
    if (!/^\d{2}:\d{2}$/.test(time)) return Alert.alert("Time format", "Use 24-hour HH:MM, e.g. 19:30");
    const when = new Date(`${date}T${time}:00`);
    if (isNaN(when)) return Alert.alert("Invalid date or time");
    setBusy(true);
    try {
      await api.post("/reservations", { table: table._id, date: when.toISOString(), guests: Number(guests), specialRequests: note });
      Alert.alert("Reservation requested", "We will confirm it shortly.");
      setTable(null); setDate(""); setTime(""); setNote("");
      load();
    } catch (e) {
      Alert.alert("Booking failed", e.message);
    } finally {
      setBusy(false);
    }
  };

  const cancel = (id) =>
    Alert.alert("Cancel reservation?", "", [
      { text: "No" },
      { text: "Yes", style: "destructive", onPress: async () => { try { await api.put(`/reservations/${id}/cancel`); load(); } catch (e) { Alert.alert("Error", e.message); } } },
    ]);

  return (
    <View style={s.page}>
      <ScreenHeader title="Reservations" />
      {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2563eb" /> : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          <Text style={s.h}>Book a table</Text>
          <View style={s.tables}>
            {tables.map((t) => (
              <Pressable key={t._id} style={[s.table, table?._id === t._id && s.tableOn]} onPress={() => setTable(t)}>
                <Text style={[s.tNum, table?._id === t._id && { color: "#2563eb" }]}>Table {t.tableNumber}</Text>
                <Text style={s.tSeats}>{t.seats} seats</Text>
              </Pressable>
            ))}
            {tables.length === 0 && <Text style={s.empty}>No tables yet. Run "node seed.js" in MAD-main.</Text>}
          </View>

          <TextInput style={s.input} placeholder="Guests" keyboardType="number-pad" value={guests} onChangeText={setGuests} />
          <TextInput style={s.input} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
          <TextInput style={s.input} placeholder="Time (HH:MM, 24-hour)" value={time} onChangeText={setTime} />
          <TextInput style={s.input} placeholder="Special requests (optional)" value={note} onChangeText={setNote} />

          <Pressable style={[s.btn, busy && { opacity: 0.6 }]} onPress={book} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Reserve Table</Text>}
          </Pressable>

          <Text style={[s.h, { marginTop: 28 }]}>My reservations</Text>
          {mine.length === 0 && <Text style={s.empty}>No reservations yet.</Text>}
          {mine.map((r) => (
            <View key={r._id} style={s.card}>
              <Text style={s.cTitle}>Table {r.table?.tableNumber} • {r.guests} guest(s)</Text>
              <Text style={s.cMeta}>{new Date(r.date).toLocaleString()}</Text>
              <Text style={s.cMeta}>Status: {r.status}</Text>
              {["Pending", "Confirmed"].includes(r.status) && (
                <Pressable style={s.cancel} onPress={() => cancel(r._id)}><Text style={s.cancelText}>Cancel</Text></Pressable>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f8fafc" },
  h: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 12 },
  empty: { color: "#6b7280", marginVertical: 8 },
  tables: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  table: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 12, padding: 14, minWidth: 100, alignItems: "center" },
  tableOn: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  tNum: { fontSize: 16, fontWeight: "700", color: "#111827" },
  tSeats: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 10 },
  btn: { backgroundColor: "#2563eb", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 4 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#e5e7eb" },
  cTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  cMeta: { fontSize: 13, color: "#6b7280", marginTop: 3 },
  cancel: { alignSelf: "flex-start", marginTop: 10, borderWidth: 1, borderColor: "#dc2626", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  cancelText: { color: "#dc2626", fontWeight: "700" },
});