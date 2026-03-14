import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateStory() {
  const [image, setImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

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
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
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

          {/*Upload Image */}
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color="white" />
            <Text style={styles.uploadText}>Upload your image</Text>
          </TouchableOpacity>

          <TextInput
            placeholder="Location"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={location}
            onChangeText={setLocation}
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
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            placeholder="Description"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={description}
            onChangeText={setDescription}
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

        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="send" size={24} color="white" />
          <Text style={styles.submitText}>Create Story</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* POPUP MODAL */}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {/* User Info */}
            <View style={styles.userRow}>
              <Image
                source={require("../../assets/images/default-avatar.png")}
                /*After creating profile page use this - source={{ uri: user.profileImage }}*/
                style={styles.profilePic}
              />

              <View>
                <Text style={styles.username}>Inu Jayasinghe</Text>
                <Text style={styles.descText}>{description}</Text>
              </View>
            </View>

            {/* Story Preview Box */}

            <View style={styles.storyBox}>
              <Image
                source={
                  image
                    ? { uri: image }
                    : require("../../assets/images/placeholder.jpg")
                }
                style={styles.storyImage}
              />

              <View style={{ marginLeft: 10 }}>
                <Text style={styles.storyTitle}>{title}</Text>
                <Text style={styles.storyLocation}>{location}</Text>
              </View>
            </View>

            {/* Publish Button */}

            <TouchableOpacity
              style={styles.publishButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.publishText}>Publish your story</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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

  /* MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },

  username: {
    fontWeight: "bold",
    fontSize: 16,
  },

  descText: {
    color: "#555",
  },

  storyBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },

  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },

  storyTitle: {
    fontWeight: "bold",
  },

  storyLocation: {
    color: "#666",
  },

  publishButton: {
    backgroundColor: "black",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  publishText: {
    color: "white",
    fontWeight: "bold",
  },
});
