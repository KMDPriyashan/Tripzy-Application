import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Button, Image, TextInput, View } from "react-native";

export default function CreatePost() {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Upload Travel Photo" onPress={pickImage} />

      {image && (
        <Image source={{ uri: image }} style={{ height: 200, marginTop: 10 }} />
      )}

      <TextInput
        placeholder="Write your travel story..."
        value={caption}
        onChangeText={setCaption}
      />
    </View>
  );
}
