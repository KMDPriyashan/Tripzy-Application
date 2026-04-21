import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Image, TextInput, TouchableOpacity, View } from "react-native";
import { getUserProfile, updateUserProfile } from "../utils/userStorage";

export default function EditProfileScreen() {
  const [user, setUser] = useState({});
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getUserProfile();
    setUser(data);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({});
    if (!result.canceled) {
      setUser({ ...user, image: result.assets[0].uri });
    }
  };

  const handleUpdate = async () => {
    await updateUserProfile(user);
    router.back();
  };

  return (
    <View style={{ padding: 20 }}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={{ uri: user.image }}
          style={{ width: 100, height: 100 }}
        />
      </TouchableOpacity>

      <TextInput
        value={user.name}
        onChangeText={(text) => setUser({ ...user, name: text })}
      />

      <TextInput
        value={user.bio}
        onChangeText={(text) => setUser({ ...user, bio: text })}
      />

      <TextInput
        value={user.email}
        onChangeText={(text) => setUser({ ...user, email: text })}
      />

      <Button title="Update Profile" onPress={handleUpdate} />
    </View>
  );
}
