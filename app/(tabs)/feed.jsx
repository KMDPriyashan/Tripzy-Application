import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Progress from "react-native-progress";
import FeedCard from "../../components/FeedCard";
import Header from "../../components/Header";
import SearchBar from "../../components/SearchBar";
// ❌ StoryList REMOVED (as you requested)
import { deletePost, getPosts } from "../../utils/postStorage";

const { width } = Dimensions.get("window");

export default function Feed() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isFocused = useIsFocused();

  const [progress, setProgress] = useState(0);
  const [showLoader, setShowLoader] = useState(false);

  const [selectedPost, setSelectedPost] = useState(null);
  const [modalType, setModalType] = useState(null);

  const [feedPosts, setFeedPosts] = useState([]);

  const uploading = params?.uploading === 'true' || params?.uploading === true;
  const storyTitle = params?.storyTitle ?? "";
  const userAvatar = params?.userAvatar ?? "";

  const loadPosts = async () => {
    const storedPosts = await getPosts();
    setFeedPosts(storedPosts);
  };

  useEffect(() => {
    if (isFocused) {
      loadPosts();
    }
  }, [isFocused]);

  useEffect(() => {
    let interval;

    if (uploading === true) {
      setShowLoader(true);
      setProgress(0);

      let value = 0;

      interval = setInterval(() => {
        value += 0.05;
        setProgress(value);

        if (value >= 1) {
          clearInterval(interval);
          setTimeout(() => setShowLoader(false), 500);
        }
      }, 150);
    } else {
      setShowLoader(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [uploading]);

  // ✅ Recommendation dummy data
  const recommendations = [
    {
      id: "1",
      title: "Sigiriya",
      image: "https://images.unsplash.com/photo-1587502536263-9298c0f9e94f",
    },
    {
      id: "2",
      title: "Ella",
      image: "https://images.unsplash.com/photo-1605538883669-8256f7f7c1e2",
    },
    {
      id: "3",
      title: "Mirissa",
      image:
        "https://www.google.com/imgres?q=mirissa&imgurl=https%3A%2F%2Fwww.theglobetrottergp.com%2Fwp-content%2Fuploads%2F2019%2F05%2FoDZ1LpuSxCdJQd5UhbjSA_thumb_60bb.jpg&imgrefurl=https%3A%2F%2Fwww.theglobetrottergp.com%2Fthings-to-do-in-mirissa%2F&docid=H5VLZdE6BRCB2M&tbnid=Nj1Lf6uqLtH5OM&vet=12ahUKEwiXoY7Mk4KUAxVV-zgGHZ2CFiAQnPAOegQIExAB..i&w=1086&h=724&hcb=2&ved=2ahUKEwiXoY7Mk4KUAxVV-zgGHZ2CFiAQnPAOegQIExAB",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* ✅ CENTERED HEADER */}
          <View style={styles.headerWrapper}>
            <Header />
          </View>

          {/* Search + Button */}
          <View style={styles.searchRow}>
            <SearchBar />
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/CreateStory")}
            >
              <Text style={styles.addText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Upload Progress */}
          {showLoader && (
            <View style={styles.loaderBox}>
              <Image
                source={{ uri: userAvatar || "https://via.placeholder.com/50" }}
                style={styles.avatar}
              />

              <View style={styles.info}>
                <Text style={styles.title}>
                  {storyTitle || "Uploading Story"}
                </Text>
                <Progress.Bar
                  progress={progress}
                  width={null}
                  color="#4caf50"
                />
              </View>

              <Text style={styles.percentage}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
          )}

          {/* ✅ RECOMMENDATION SECTION */}
          <Text style={styles.sectionTitle}>Recommendations</Text>

          <FlatList
            data={recommendations}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.recommendCard}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.recommendImg}
                />
                <Text style={styles.recommendText}>{item.title}</Text>
              </View>
            )}
          />

          {/* ✅ FEED POSTS */}
          <FlatList
            data={feedPosts}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false} // IMPORTANT (avoid double scroll + overflow)
            renderItem={({ item }) => (
              <FeedCard
                post={item}
                onLongPress={(post) => {
                  setSelectedPost(post);
                  setModalType("details");
                }}
              />
            )}
          />

          {/* MODAL */}
          <Modal visible={modalType !== null} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalType(null)}
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>

                {selectedPost && (
                  <>
                    <Text style={styles.modalTitle}>
                      {modalType === "delete"
                        ? "Delete That Post"
                        : selectedPost.user}
                    </Text>

                    <Image
                      source={{ uri: selectedPost.image }}
                      style={styles.modalImage}
                    />

                    <Text style={styles.modalText}>
                      {selectedPost.description}
                    </Text>
                    <Text style={styles.modalText}>
                      {selectedPost.location}
                    </Text>

                    {modalType === "details" && (
                      <View style={styles.buttonRow}>
                        <TouchableOpacity
                          style={styles.updateBtn}
                          onPress={() => setModalType("update")}
                        >
                          <Text style={styles.btnText}>Update</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => setModalType("delete")}
                        >
                          <Text style={styles.btnText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {modalType === "update" && (
                      <TouchableOpacity
                        style={styles.singleUpdateBtn}
                        onPress={() => {
                          setModalType(null);
                          router.push({
                            pathname: "/CreateStory",
                            params: {
                              id: selectedPost.id,
                              data: JSON.stringify(selectedPost),
                            },
                          });
                        }}
                      >
                        <Text style={styles.btnText}>Update Now</Text>
                      </TouchableOpacity>
                    )}

                    {modalType === "delete" && (
                      <View style={{ width: "100%" }}>
                        <Text style={styles.deleteTitle}>
                          Deleted Successfully
                        </Text>

                        <Text style={styles.deleteDesc}>
                          You're all set. Deleted the post.
                        </Text>

                        <TouchableOpacity
                          style={{ alignSelf: "flex-end" }}
                          onPress={async () => {
                            await deletePost(selectedPost.id);
                            await loadPosts();
                            setModalType(null);
                            router.push("/(tabs)/profile");
                          }}
                        >
                          <Text style={styles.okText}>OK</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    flex: 1,
    paddingBottom: 20,
  },

  headerWrapper: {
    alignItems: "center",
    marginTop: 10,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  addButton: {
    width: 45,
    height: 45,
    backgroundColor: "#2196f3",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  addText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
    marginTop: 15,
    marginBottom: 10,
  },

  recommendCard: {
    width: 140,
    marginLeft: 12,
  },

  recommendImg: {
    width: "100%",
    height: 100,
    borderRadius: 12,
  },

  recommendText: {
    marginTop: 6,
    fontWeight: "500",
  },

  loaderBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f0f0f0",
    margin: 8,
    borderRadius: 8,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  title: {
    fontWeight: "600",
    marginBottom: 4,
  },

  percentage: {
    fontSize: 12,
    color: "#666",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    width: "85%",
  },

  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },

  closeText: {
    fontSize: 18,
    color: "#666",
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },

  modalText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  updateBtn: {
    flex: 1,
    backgroundColor: "#2196f3",
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },

  deleteBtn: {
    flex: 1,
    backgroundColor: "#f44336",
    paddingVertical: 8,
    borderRadius: 6,
  },

  singleUpdateBtn: {
    backgroundColor: "#4caf50",
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 12,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },

  deleteTitle: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },

  deleteDesc: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },

  okText: {
    color: "#2196f3",
    fontWeight: "600",
  },
});
