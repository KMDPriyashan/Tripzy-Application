import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FeedCard({ post }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: post.image }} style={styles.image} />

      <View style={styles.overlay}>
        <Text style={styles.name}>{post.user}</Text>

        <Text style={styles.location}>{post.location}</Text>

        <Text style={styles.description}>{post.description}</Text>

        <TouchableOpacity style={styles.moreBtn}>
          <Text style={{ color: "#fff" }}>See more</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <View style={styles.actionItem}>
          <Ionicons name="heart" size={22} color="black" />
          <Text style={styles.count}>{post.reacts}</Text>
        </View>

        <View style={styles.actionItem}>
          <Ionicons name="chatbubble" size={22} color="black" />
          <Text style={styles.count}>{post.comments}</Text>
        </View>

        <View style={styles.actionItem}>
          <Ionicons name="paper-plane" size={22} color="black" />
          <Text style={styles.count}>{post.shares}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 15,
  },

  image: {
    width: "100%",
    height: 250,
    borderRadius: 20,
  },

  overlay: {
    position: "absolute",
    bottom: 20,
    left: 15,
  },

  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  location: {
    color: "#fff",
  },

  description: {
    color: "#fff",
    marginVertical: 5,
  },

  moreBtn: {
    backgroundColor: "#000",
    padding: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },

  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  count: {
    fontSize: 14,
    marginLeft: 4,
  },
});
