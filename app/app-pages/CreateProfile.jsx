import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Button,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { saveUserProfile } from "../utils/userStorage";

export default function CreateProfileScreen() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState(null);

  const router = useRouter();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const userData = { name, bio, email, image };
    await saveUserProfile(userData);
    router.replace("/profile");
  };

  return (
    <View style={{ padding: 20 }}>
      <TouchableOpacity onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={{ width: 100, height: 100 }} />
        ) : (
          <Text>Select Profile Image</Text>
        )}
      </TouchableOpacity>

      <TextInput placeholder="Name" onChangeText={setName} />
      <TextInput placeholder="Bio" onChangeText={setBio} />
      <TextInput placeholder="Email" onChangeText={setEmail} />

      <Button title="Finish Profile" onPress={handleSubmit} />
    </View>
  );
}
