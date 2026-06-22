import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../lib/supabase";

const BUCKET_NAME = "avatars";

export const uploadAvatar = async (userId, imageUri) => {
  try {
    // 1. Get image as blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // 2. Generate unique filename
    const fileExt = imageUri.split(".").pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // 3. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType: blob.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // 4. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const avatarUrl = publicUrlData.publicUrl;

    // 5. Update user profile with avatar URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        avatar_updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) throw updateError;

    // 6. Also update users table if exists
    await supabase
      .from("users")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);

    // 7. Save to local storage for offline access
    await AsyncStorage.setItem(`avatar_${userId}`, avatarUrl);

    return { success: true, avatarUrl };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return { success: false, error: error.message };
  }
};

export const getAvatarUrl = (userId) => {
  return supabase.storage.from(BUCKET_NAME).getPublicUrl(`${userId}`).data
    .publicUrl;
};
