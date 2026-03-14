import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateStory() {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Top Image */}
      <Image
        source={
          image
            ? { uri: image }
            : require("../../assets/images/placeholder.jpg")
        }
        style={styles.topImage}
        resizeMode="cover"
      />

      {/* Headings */}
      <Text style={styles.mainTitle}>Wander & Discover</Text>
      <Text style={styles.subTitle}>Every journey begins with a story</Text>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          placeholder="Caption"
          placeholderTextColor="#aaa"
          style={styles.input}
        />

        {/* Image Upload */}
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Ionicons name="image-outline" size={24} color="white" />
          <Text style={styles.uploadText}>Upload your image</Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Location"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <TextInput
          placeholder="Province"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <TextInput
          placeholder="Date"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <TextInput
          placeholder="Title"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <TextInput
          placeholder="Description"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <TextInput
          placeholder="Collaborators"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <TextInput
          placeholder="Travel moods"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <View style={styles.inputWithButton}>
          <TextInput
            placeholder="Special notes"
            placeholderTextColor="#aaa"
            style={styles.inputFlex}
          />
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.warning}>
          <MaterialIcons name="warning" size={24} color="orange" />
          <Text style={styles.warningText}>Please enter one by one</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton}>
        <Ionicons name="send" size={24} color="white" />
        <Text style={styles.submitText}>Create Story</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topImage: { width: "100%", height: 300 },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  subTitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  form: { paddingHorizontal: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: "#000",
  },
  inputWithButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  inputFlex: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    color: "#000",
  },
  addButton: {
    backgroundColor: "#000",
    padding: 12,
    marginLeft: 8,
    borderRadius: 8,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 15,
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 15,
  },
  uploadText: { color: "white", marginLeft: 10, fontSize: 16 },
  warning: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  warningText: { color: "orange", marginLeft: 5 },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#000",
    padding: 15,
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 30,
  },
  submitText: { color: "white", marginLeft: 10, fontSize: 16 },
});
