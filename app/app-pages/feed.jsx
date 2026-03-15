import { useFocusEffect } from "@react-navigation/native"; // ✅ important
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Progress from "react-native-progress";
import FeedCard from "../components/FeedCard";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import StoryList from "../components/StoryList";
import { deletePost, getPosts } from "../utils/postStorage";

export default function Feed() {
  const router = useRouter();
  const { uploading, storyTitle, userAvatar } = useLocalSearchParams();

  const [progress, setProgress] = useState(0);
  const [showLoader, setShowLoader] = useState(false);

  const [selectedPost, setSelectedPost] = useState(null);
  const [modalType, setModalType] = useState(null);

  const [feedPosts, setFeedPosts] = useState([]);

  // Load posts whenever the Feed screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, []),
  );

  const loadPosts = async () => {
    const storedPosts = await getPosts();
    setFeedPosts(storedPosts);
  };

  // Upload progress simulation
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

      {/* Upload Progress Box */}
      {showLoader && (
        <View style={styles.loaderBox}>
          <Image
            source={{ uri: userAvatar || "https://via.placeholder.com/50" }}
            style={styles.avatar}
          />

          <View style={styles.info}>
            <Text style={styles.title}>{storyTitle || "Uploading Story"}</Text>

            <Progress.Bar progress={progress} width={null} color="#4caf50" />
          </View>

          <Text style={styles.percentage}>{Math.round(progress * 100)}%</Text>
        </View>
      )}

      <StoryList />

      <FlatList
        data={feedPosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <FeedCard
            post={item}
            onLongPress={(post) => {
              setSelectedPost(post);
              setModalType("details");
            }}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* POST MODAL */}
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
                {/* Modal Title */}
                <Text style={styles.modalTitle}>
                  {modalType === "delete"
                    ? "Delete That Post"
                    : selectedPost.user}
                </Text>

                {/* Post Image */}
                <Image
                  source={{ uri: selectedPost.image }}
                  style={styles.modalImage}
                />

                {/* Post Description / Location */}
                <Text style={styles.modalText}>{selectedPost.description}</Text>
                <Text style={styles.modalText}>{selectedPost.location}</Text>

                {/* DETAILS BUTTONS */}
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

                {/* UPDATE BUTTON */}
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

                {/* DELETE CONFIRMATION MODAL */}
                {modalType === "delete" && selectedPost && (
                  <View style={{ width: "100%" }}>
                    <Text
                      style={{
                        color: "red",
                        fontWeight: "bold",
                        fontSize: 18,
                        textAlign: "center",
                        marginBottom: 10,
                      }}
                    >
                      Deleted Successfully
                    </Text>
                    <Text
                      style={{
                        textAlign: "center",
                        color: "#555",
                        marginBottom: 20,
                      }}
                    >
                      You're all set. Deleted the created post. Ready to move to
                      the Home Feed!
                    </Text>

                    <TouchableOpacity
                      style={{ alignSelf: "flex-end" }}
                      onPress={async () => {
                        await deletePost(selectedPost.id);
                        loadPosts();
                        setModalType(null);
                        router.push("profile"); // Navigate to Home
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 16,
                          color: "black",
                        }}
                      >
                        OK
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
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
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  modalImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },

  modalText: {
    textAlign: "center",
    marginBottom: 5,
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 15,
  },

  updateBtn: {
    flex: 1,
    backgroundColor: "#2b8aa3",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
  },

  deleteBtn: {
    flex: 1,
    backgroundColor: "#ff2a2a",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  singleUpdateBtn: {
    width: "100%",
    backgroundColor: "#2b8aa3",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
});
