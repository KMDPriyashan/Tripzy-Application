import { Button, Modal, Text, View } from "react-native";

export default function UploadModal({ visible, onSelect }) {
  return (
    <Modal visible={visible} transparent>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 10,
          }}
        >
          <Text>Select Post Privacy</Text>

          <Button title="Public 🌍" onPress={() => onSelect("public")} />

          <Button title="Private 🔒" onPress={() => onSelect("private")} />
        </View>
      </View>
    </Modal>
  );
}
