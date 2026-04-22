import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Modal,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { addComment, addShare, toggleReaction } from "../utils/postStorage";

export default function FeedCard({ post, onLongPress }) {
  const router = useRouter();

  const [reaction, setReaction] = useState(null);
  const [reactionCount, setReactionCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [shareCount, setShareCount] = useState(0);

  const [showReactions, setShowReactions] = useState(false);
  const [commentsModal, setCommentsModal] = useState(false);
  const [commentText, setCommentText] = useState("");

  const heartScale = useRef(new Animated.Value(0)).current;
  const lastTapRef = useRef(null);

  useEffect(() => {
    if (post) {
      setReaction(post.userReaction || null);
      setReactionCount(post.reacts || 0);
      setComments(post.commentsList || []);
      setShareCount(post.shares || 0);
    }
  }, [post]);

  /* ---------------- DOUBLE TAP LIKE ---------------- */
  const handleDoubleTap = async () => {
    const now = Date.now();

    if (lastTapRef.current && now - lastTapRef.current < 300) {
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

    lastTapRef.current = now;
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

    const newComment = { type: "text", value: commentText };

    const updated = [...comments, newComment];
    setComments(updated);
    setCommentText("");

    await addComment(post.id, newComment);
  };

  const stickers = ["🔥", "😍", "🏝️", "✈️", "📍"];

  const addStickerComment = async (sticker) => {
    const newComment = { type: "sticker", value: sticker };

    const updated = [...comments, newComment];
    setComments(updated);

    await addComment(post.id, newComment);
  };

  const openProfile = () => {
    router.push(`/profile`);
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleDoubleTap}
        onLongPress={() => onLongPress(post)}
      >
        <View style={styles.card}>
          {/* IMAGE */}
          <Image source={{ uri: post.image }} style={styles.image} />

          {/* STATUS BADGE */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{post.status || "Planned"}</Text>
          </View>

          {/* BIG HEART */}
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

          {/* CONTENT */}
          <View style={styles.overlay}>
            <TouchableOpacity onPress={openProfile}>
              <Text style={styles.name}>{post.user}</Text>
            </TouchableOpacity>

            <Text style={styles.title}>{post.title || post.location}</Text>

            <Text style={styles.location}>{post.location}</Text>

            <Text style={styles.description}>{post.description}</Text>
          </View>

          {/* ACTIONS */}
          <View style={styles.actions}>
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

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => setCommentsModal(true)}
            >
              <Ionicons name="chatbubble-outline" size={22} />
              <Text style={styles.count}>{comments.length}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleShare}>
              <Ionicons name="paper-plane-outline" size={22} />
              <Text style={styles.count}>{shareCount}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* REACTIONS BAR */}
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

const styles = {
  card: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    width: "92%",
    alignSelf: "center",
  },

  image: {
    width: "100%",
    height: 220,
  },

  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  badgeText: {
    fontSize: 12,
    color: "#2196f3",
    fontWeight: "600",
  },

  bigHeart: {
    position: "absolute",
    fontSize: 80,
    alignSelf: "center",
    top: "30%",
  },

  overlay: {
    padding: 12,
  },

  name: {
    fontWeight: "700",
    fontSize: 14,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },

  location: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },

  description: {
    fontSize: 14,
    color: "#444",
    marginTop: 4,
  },

  actions: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 16,
  },

  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  count: {
    fontSize: 13,
    color: "#555",
  },

  reactionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 4,
  },

  reactionItem: {
    alignItems: "center",
  },

  reactName: {
    fontSize: 10,
    color: "#555",
  },

  commentContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
  },

  commentTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  commentItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
    gap: 8,
  },

  commentInput: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
  },

  stickerRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
  },

  closeBtn: {
    alignSelf: "center",
    marginTop: 8,
    padding: 10,
  },
};
