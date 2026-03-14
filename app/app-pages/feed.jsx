import { FlatList, StyleSheet, View } from "react-native";
import FeedCard from "../components/FeedCard";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import StoryList from "../components/StoryList";
import { posts } from "../data/posts";

export default function Feed() {
  return (
    <View style={styles.container}>
      <Header />

      <SearchBar />

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
});
