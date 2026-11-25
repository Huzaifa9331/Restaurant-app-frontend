import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScreenHeader({ title, right }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingTop: insets.top + 10 }]}>
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} hitSlop={14}>
        <Text style={s.back}>‹ Back</Text>
      </Pressable>
      <Text style={s.title}>{title}</Text>
      <View style={s.right}>{right}</View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  back: { color: "#2563eb", fontSize: 17, fontWeight: "600", minWidth: 60 },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  right: { minWidth: 60, alignItems: "flex-end" },
});