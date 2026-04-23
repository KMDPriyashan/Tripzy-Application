import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "TRIPZY_POSTS";

/* ---------------- SAVE NEW POST ---------------- */

export const savePost = async (post) => {
  try {
    const existingPosts = await AsyncStorage.getItem(STORAGE_KEY);
    const posts = existingPosts ? JSON.parse(existingPosts) : [];

    const newPost = {
      ...post,
      reacts: 0,
      shares: 0,
      reactions: {},
      comments: 0,
      commentsList: [],
    };

    const updatedPosts = [newPost, ...posts];

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
  } catch (error) {
    console.log("Error saving post", error);
  }
};

/* ---------------- GET POSTS ---------------- */

export const getPosts = async () => {
  try {
    const posts = await AsyncStorage.getItem(STORAGE_KEY);
    return posts ? JSON.parse(posts) : [];
  } catch (error) {
    console.log("Error getting posts", error);
    return [];
  }
};

/* ---------------- DELETE POST ---------------- */

export const deletePost = async (id) => {
  try {
    const posts = await getPosts();
    const updatedPosts = posts.filter((post) => post.id !== id);
    await savePostArray(updatedPosts);
  } catch (error) {
    console.log("Error deleting post:", error);
  }
};

/* ---------------- SAVE POSTS ARRAY ---------------- */

export const savePostArray = async (postsArray) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(postsArray));
  } catch (error) {
    console.log("Error saving posts array:", error);
  }
};

/* ---------------- UPDATE POST ---------------- */

export const updatePost = async (updatedPost) => {
  try {
    const posts = await getPosts();

    const newPosts = posts.map((post) =>
      post.id === updatedPost.id ? updatedPost : post,
    );

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts));
  } catch (error) {
    console.log("Error updating post:", error);
  }
};

/* ---------------- ADD REACTION ---------------- */

export const toggleReaction = async (postId, reactionType) => {
  try {
    const posts = await getPosts();

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        let reactions = post.reactions || {};
        let userReaction = post.userReaction || null;

        // IF USER PRESSES SAME REACTION AGAIN → REMOVE
        if (userReaction === reactionType) {
          reactions[reactionType] = Math.max(
            (reactions[reactionType] || 1) - 1,
            0,
          );

          return {
            ...post,
            reactions,
            reacts: Math.max((post.reacts || 1) - 1, 0),
            userReaction: null,
          };
        }

        // IF USER CHANGES REACTION
        else {
          if (userReaction) {
            reactions[userReaction] = Math.max(
              (reactions[userReaction] || 1) - 1,
              0,
            );
          }

          reactions[reactionType] = (reactions[reactionType] || 0) + 1;

          const totalReacts = Object.values(reactions).reduce(
            (sum, val) => sum + val,
            0,
          );

          return {
            ...post,
            reactions,
            reacts: totalReacts,
            userReaction: reactionType,
          };
        }
      }

      return post;
    });

    await savePostArray(updatedPosts);
  } catch (error) {
    console.log("Reaction error:", error);
  }
};

/* ---------------- ADD COMMENT ---------------- */

export const addComment = async (postId, comment) => {
  try {
    const posts = await getPosts();

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const commentsList = post.commentsList || [];

        const updatedComments = [...commentsList, comment];

        return {
          ...post,
          commentsList: updatedComments,
          comments: updatedComments.length,
        };
      }
      return post;
    });

    await savePostArray(updatedPosts);
  } catch (error) {
    console.log("Error adding comment:", error);
  }
};

/* ---------------- ADD STICKER COMMENT ---------------- */

export const addStickerComment = async (postId, sticker) => {
  try {
    const posts = await getPosts();

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const commentsList = post.commentsList || [];

        const updatedComments = [
          ...commentsList,
          { type: "sticker", value: sticker },
        ];

        return {
          ...post,
          commentsList: updatedComments,
          comments: updatedComments.length,
        };
      }
      return post;
    });

    await savePostArray(updatedPosts);
  } catch (error) {
    console.log("Error adding sticker:", error);
  }
};

/* ---------------- ADD SHARE ---------------- */

export const addShare = async (postId) => {
  try {
    const posts = await getPosts();

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          shares: (post.shares || 0) + 1,
        };
      }
      return post;
    });

    await savePostArray(updatedPosts);
  } catch (error) {
    console.log("Error adding share:", error);
  }
};
