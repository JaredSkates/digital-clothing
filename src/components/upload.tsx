import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { UploadProps } from "@/types/upload";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { Pressable, StyleSheet } from "react-native";

export default function ImageUploader({
  image,
  onSelectImage,
  onTakePhoto,
}: UploadProps) {
  const theme = useTheme();

  return (
    <>
      {image ? (
        <Image
          source={{ uri: image }}
          style={styles.image}
          contentFit="contain"
          transition={200}
        />
      ) : (
        <ThemedView
          style={[
            styles.image,
            styles.placeholder,
            { borderColor: theme.textSecondary },
          ]}
        />
      )}

      <ThemedView style={styles.buttons}>
        <Pressable style={styles.button} onPress={onSelectImage}>
          <ThemedView type="backgroundElement" style={styles.buttonInner}>
            <Ionicons name="images-outline" size={18} color={theme.text} />
            <ThemedText type="small">Gallery</ThemedText>
          </ThemedView>
        </Pressable>

        <Pressable style={styles.button} onPress={onTakePhoto}>
          <ThemedView type="backgroundElement" style={styles.buttonInner}>
            <Ionicons name="camera-outline" size={18} color={theme.text} />
            <ThemedText type="small">Camera</ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: undefined,
    aspectRatio: undefined,
    minHeight: 300,
    maxHeight: 500,
    borderRadius: Spacing.three,
  },
  placeholder: {
    borderWidth: 2,
    height: 300,
    borderStyle: "dashed",
  },
  buttons: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  button: {
    flex: 1,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
});
