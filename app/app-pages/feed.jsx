import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import * as Progress from "react-native-progress";
import FeedCard from "../components/FeedCard";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import StoryList from "../components/StoryList";
import { posts } from "../data/posts";

export default function Feed() {
  const router = useRouter();
  const { uploading, storyTitle, userAvatar } = useLocalSearchParams();

  const [progress, setProgress] = useState(0);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (uploading === "true") {
      setShowLoader(true);

      let value = 0;
      const interval = setInterval(() => {
        value += 0.05;
        setProgress(value);

        if (value >= 1) {
          clearInterval(interval);
          setTimeout(() => setShowLoader(false), 500);
        }
      }, 150);
    }
  }, [uploading]);

  return (
    <View style={styles.container}>
      <Header />

      <SearchBar />

      {/* Progress loader box */}
      {showLoader && (
        <View style={styles.loaderBox}>
          <Image
            source={{ uri: userAvatar || "https://via.placeholder.com/50" }}
            style={styles.avatar}
          />
          <View style={styles.info}>
            <Text style={styles.title}>{storyTitle || "Uploading Story"}</Text>
            <Progress.Bar
              progress={progress}
              width={null}
              color="#4caf50"
              style={{ marginTop: 5 }}
            />
          </View>
          <Text style={styles.percentage}>{Math.round(progress * 100)}%</Text>
        </View>
      )}

      <StoryList />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <FeedCard post={item} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
  },
  loaderBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 12,
    marginVertical: 10,
    elevation: 3, // shadow for Android
    shadowColor: "#000", // shadow for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
  },
  percentage: {
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 14,
    color: "#555",
  },
});
