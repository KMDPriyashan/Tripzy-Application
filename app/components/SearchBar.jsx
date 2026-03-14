import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export default function SearchBar() {
  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="gray" />

        <TextInput placeholder="Search Any Things" style={styles.input} />
      </View>

      <TouchableOpacity style={styles.addBtn}>
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
