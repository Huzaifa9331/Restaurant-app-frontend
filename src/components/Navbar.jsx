
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import logo from "../../assets/logo.jpeg";
import { useAuth } from "./Authocontext";

export default function Navbar() {
  const router = useRouter();

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <View style={styles.navbar}>
      <TouchableOpacity
        style={styles.brand}
        onPress={() => router.replace("/")}
      >
        <Image source={logo} style={styles.logo} />

        <Text style={styles.brandText}>
          Meg Restaurant
        </Text>
      </TouchableOpacity>

      <View style={styles.right}>
        {user ? (
          <>
            <Text style={styles.userName}>
              {user.name}
            </Text>

            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutText}>
                Logout
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => router.push("/login")}
            >
              <Text style={styles.link}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/signup")}
            >
              <Text style={styles.link}>Sign Up</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  brandText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  userName: {
    color: "#374151",
    fontSize: 13,
  },

  link: {
    color: "#2563eb",
    fontWeight: "600",
  },

  logoutButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },

  logoutText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
