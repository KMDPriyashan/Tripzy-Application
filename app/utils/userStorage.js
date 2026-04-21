import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "USER_PROFILE";

export const saveUserProfile = async (data) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data));
  } catch (e) {
    console.log("Error saving profile", e);
  }
};

export const getUserProfile = async () => {
  try {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.log("Error getting profile", e);
  }
};

export const updateUserProfile = async (data) => {
  await saveUserProfile(data);
};
