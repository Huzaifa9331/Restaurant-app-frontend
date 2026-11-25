
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { useAuth } from "../components/Authocontext";

export default function Signup() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Error",
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const user = await register(
        name.trim(),
        email.trim().toLowerCase(),
        password
      );

      Alert.alert(
        "Account Created",
        `Welcome ${user.name}!`,
        [
          {
            text: "Continue",
            onPress: () => router.replace("/"),
          },
        ]
      );

    } catch (error) {
      console.log("Signup error:", error.message);

      Alert.alert("Signup Failed", error.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.heading}>
          Create Account
        </Text>

        <Text style={styles.subtitle}>
          Join Meg Restaurant
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footer}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.footerText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    padding: 24,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },

  heading: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },

  subtitle: {
    color: "#6b7280",
    marginBottom: 30,
  },

  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 15,
    marginBottom: 18,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 17,
  },

  footer: {
    marginTop: 24,
    alignItems: "center",
  },

  footerText: {
    color: "#2563eb",
  },
});
