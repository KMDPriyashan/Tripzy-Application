import { StyleSheet, Text, View } from "react-native";

export default function Header() {
  return (
    <View style={styles.textContainer}>
      <Text style={styles.title}>Let your travels speak.</Text>
      <Text style={styles.subtitle}>
        A soft, soulful welcome into the journey.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  textContainer: {
    marginLeft: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#777",
  },
});
