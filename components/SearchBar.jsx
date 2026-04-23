import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export default function SearchBar() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* SEARCH BOX */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="gray" />

        <TextInput
          placeholder="Search Location, province, Username"
          style={styles.input}
        />
      </View>

      {/* ADD BUTTON */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push("/CreateStory")}
      >
        <Ionicons name="add" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    paddingHorizontal: 12, // ✅ important (screen margin)
  },

  searchBox: {
    flex: 1, // takes remaining space
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 45,
  },

  input: {
    marginLeft: 6,
    flex: 1,
    fontSize: 14,
  },

  addBtn: {
    backgroundColor: "#2196f3",
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10, // space between search & button
  },
});
