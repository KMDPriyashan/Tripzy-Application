import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Modal,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { addComment, addShare, toggleReaction } from "../utils/postStorage";

export default function FeedCard({ post, onLongPress }) {
  const router = useRouter();

  const [reaction, setReaction] = useState(post.userReaction || null);
  const [reactionCount, setReactionCount] = useState(post.reacts || 0);

  const [showReactions, setShowReactions] = useState(false);

  const [commentsModal, setCommentsModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.commentsList || []);

  const [shareCount, setShareCount] = useState(post.shares || 0);

  const heartScale = useRef(new Animated.Value(0)).current;

  /* ---------------- DOUBLE TAP LIKE ---------------- */

  let lastTap = null;

  const handleDoubleTap = async () => {
    const now = Date.now();

    if (lastTap && now - lastTap < 300) {
      setReaction("love");

      Animated.sequence([
        Animated.timing(heartScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      await toggleReaction(post.id, "love");

      setReactionCount((prev) => prev + 1);
    }

    lastTap = now;
  };

  /* ---------------- REACTIONS ---------------- */

  const reactions = [
    { type: "like", emoji: "👍", name: "Like" },
    { type: "love", emoji: "❤️", name: "Love" },
    { type: "wow", emoji: "😮", name: "Wow" },
    { type: "sad", emoji: "😢", name: "Sad" },
    { type: "angry", emoji: "😡", name: "Angry" },
  ];

  const handleReaction = async (type) => {
    if (reaction === type) {
      setReaction(null);
      setReactionCount((prev) => Math.max(prev - 1, 0));
    } else {
      if (!reaction) setReactionCount((prev) => prev + 1);

      setReaction(type);
    }

    await toggleReaction(post.id, type);
    setShowReactions(false);
  };

  /* ---------------- SHARE ---------------- */

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${post.user} shared a Tripzy story 🌍\n\n${post.description}\nLocation: ${post.location}`,
      });

      setShareCount((prev) => prev + 1);

      await addShare(post.id);
    } catch (error) {
      console.log(error);
    }
  };

  /* ---------------- COMMENTS ---------------- */

  const sendComment = async () => {
    if (!commentText.trim()) return;

    const newComment = {
      type: "text",
      value: commentText,
    };

    const updated = [...comments, newComment];

    setComments(updated);
    setCommentText("");

    await addComment(post.id, newComment);
  };

  /* ---------------- STICKERS ---------------- */

  const stickers = ["🔥", "😍", "🏝️", "✈️", "📍"];

  const addStickerComment = async (sticker) => {
    const newComment = {
      type: "sticker",
      value: sticker,
    };

    const updated = [...comments, newComment];

    setComments(updated);

    await addComment(post.id, newComment);
  };

  /* ---------------- PROFILE CLICK ---------------- */

  const openProfile = () => {
    router.push(`/profile/${post.user}`);
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleDoubleTap}
        onLongPress={() => onLongPress(post)}
      >
        <View style={styles.card}>
          <Image source={{ uri: post.image }} style={styles.image} />

          {/* HEART ANIMATION */}

          <Animated.Text
            style={[
              styles.bigHeart,
              {
                transform: [{ scale: heartScale }],
                opacity: heartScale,
              },
            ]}
          >
            ❤️
          </Animated.Text>

          {/* POST INFO */}

          <View style={styles.overlay}>
            <TouchableOpacity onPress={openProfile}>
              <Text style={styles.name}>{post.user}</Text>
            </TouchableOpacity>

            <Text style={styles.location}>{post.location}</Text>
            <Text style={styles.description}>{post.description}</Text>
          </View>

          {/* ACTION BAR */}

          <View style={styles.actions}>
            {/* REACT */}

            <TouchableOpacity
              style={styles.actionItem}
              onLongPress={() => setShowReactions(true)}
              onPress={() => handleReaction("like")}
            >
              <Text style={{ fontSize: 20 }}>
                {reaction
                  ? reactions.find((r) => r.type === reaction)?.emoji
                  : "👍"}
              </Text>

              <Text style={styles.count}>{reactionCount}</Text>
            </TouchableOpacity>

            {/* COMMENT */}

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => setCommentsModal(true)}
            >
              <Ionicons name="chatbubble-outline" size={22} />
              <Text style={styles.count}>{comments.length}</Text>
            </TouchableOpacity>

            {/* SHARE */}

            <TouchableOpacity style={styles.actionItem} onPress={handleShare}>
              <Ionicons name="paper-plane-outline" size={22} />
              <Text style={styles.count}>{shareCount}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* REACTION BAR */}

      {showReactions && (
        <View style={styles.reactionBar}>
          {reactions.map((r) => (
            <TouchableOpacity
              key={r.type}
              style={styles.reactionItem}
              onPress={() => handleReaction(r.type)}
            >
              <Text style={{ fontSize: 30 }}>{r.emoji}</Text>
              <Text style={styles.reactName}>{r.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* COMMENTS MODAL */}

      <Modal visible={commentsModal} animationType="slide">
        <View style={styles.commentContainer}>
          <Text style={styles.commentTitle}>Comments</Text>

          <FlatList
            data={comments}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                {item.type === "text" && <Text>💬 {item.value}</Text>}

                {item.type === "sticker" && (
                  <Text style={{ fontSize: 28 }}>{item.value}</Text>
                )}
              </View>
            )}
          />

          {/* COMMENT INPUT */}

          <View style={styles.commentInputRow}>
            <TextInput
              placeholder="Write a comment..."
              style={styles.commentInput}
              value={commentText}
              onChangeText={setCommentText}
            />

            <TouchableOpacity onPress={sendComment}>
              <Ionicons name="send" size={24} />
            </TouchableOpacity>
          </View>

          {/* STICKERS */}

          <View style={styles.stickerRow}>
            {stickers.map((s, i) => (
              <TouchableOpacity key={i} onPress={() => addStickerComment(s)}>
                <Text style={{ fontSize: 28 }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setCommentsModal(false)}
          >
            <Text style={{ fontWeight: "bold" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: { marginVertical: 15 },

  image: {
    width: "100%",
    height: 250,
    borderRadius: 20,
  },

  bigHeart: {
    position: "absolute",
    alignSelf: "center",
    top: 100,
    fontSize: 90,
  },

  overlay: {
    position: "absolute",
    bottom: 20,
    left: 15,
  },

  name: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },

  location: { color: "#fff" },

  description: {
    color: "#fff",
    marginVertical: 5,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },

  actionItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  count: { marginLeft: 5 },

  reactionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 25,
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    width: 300,
    elevation: 5,
  },

  reactionItem: {
    alignItems: "center",
  },

  reactName: {
    fontSize: 10,
  },

  commentContainer: {
    flex: 1,
    padding: 20,
  },

  commentTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  commentItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  commentInputRow: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
  },

  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },

  stickerRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },

  closeBtn: {
    alignSelf: "center",
    marginTop: 20,
  },
});
