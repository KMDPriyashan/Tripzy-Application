import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { users } from "../data/posts";

export default function StoryList() {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={users}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.story}>
          <Image source={{ uri: item.avatar }} style={styles.image} />

          <Text style={styles.name}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  story: {
    alignItems: "center",
    marginRight: 15,
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  name: {
    fontSize: 12,
    marginTop: 4,
  },
});
