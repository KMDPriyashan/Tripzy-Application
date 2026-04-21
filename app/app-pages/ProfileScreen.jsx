import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getUserProfile } from "../utils/userStorage";

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await getUserProfile();
    if (!data) {
      router.push("/profile/CreateProfile");
    } else {
      setUser(data);
    }
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Image source={{ uri: user.image }} style={styles.avatar} />

      <Text style={styles.name}>{user.name}</Text>
      <Text>{user.bio}</Text>
      <Text>{user.email}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/profile/EditProfile")}
      >
        <Text style={{ color: "#fff" }}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginTop: 50 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  name: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
  button: {
    marginTop: 20,
    backgroundColor: "#1877f2",
    padding: 10,
    borderRadius: 8,
  },
});
