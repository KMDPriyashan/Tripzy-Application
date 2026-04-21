import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function SearchBar() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="gray" />

        <TextInput placeholder="Search" style={styles.input} />
      </View>

      <TouchableOpacity onPress={() => router.push("/CreateStory")}>
        <Ionicons name="add-circle" size={32} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },

  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
  },

  input: {
    marginLeft: 5,
    flex: 1,
  },

  addBtn: {
    backgroundColor: "#000",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
});
