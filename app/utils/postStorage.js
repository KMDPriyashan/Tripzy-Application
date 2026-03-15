import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "TRIPZY_POSTS";

// Save a single new post (prepend to existing posts)
export const savePost = async (post) => {
  try {
    const existingPosts = await AsyncStorage.getItem(STORAGE_KEY);
    const posts = existingPosts ? JSON.parse(existingPosts) : [];
    const updatedPosts = [post, ...posts];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
  } catch (error) {
    console.log("Error saving post", error);
  }
};

// Get all posts
export const getPosts = async () => {
  try {
    const posts = await AsyncStorage.getItem(STORAGE_KEY);
    return posts ? JSON.parse(posts) : [];
  } catch (error) {
    console.log("Error getting posts", error);
    return [];
  }
};

// Delete a post by ID
export const deletePost = async (id) => {
  try {
    const posts = await getPosts();
    const updatedPosts = posts.filter((post) => post.id !== id);
    await savePostArray(updatedPosts);
  } catch (error) {
    console.log("Error deleting post:", error);
  }
};

// Save an entire array of posts (overwrite)
export const savePostArray = async (postsArray) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(postsArray));
  } catch (error) {
    console.log("Error saving posts array:", error);
  }
};

// Update an existing post by ID
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
