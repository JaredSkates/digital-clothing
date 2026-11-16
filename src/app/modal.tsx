import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { Alert, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ClothingForm from "@/components/clothing-form";
import { ThemedView } from "@/components/themed-view";
import ImageUploader from "@/components/upload";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useImagePicker } from "@/hooks/use-img-picker";
import { useTheme } from "@/hooks/use-theme";
import { addClosetItem } from "@/services/closet-storage";
import { ClothingInput } from "@/types/clothing";

export default function ModalScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { image, selectImage, takePhoto } = useImagePicker();
  const isSaving = useRef(false); // stops a double-tap from saving twice

  const saveItem = async (formData: ClothingInput) => {
    if (!image || isSaving.current) return;

    isSaving.current = true;
    try {
      await addClosetItem({ ...formData, imgUri: image });
      router.back(); // the Closet tab reloads itself when it regains focus
    } catch (e) {
      Alert.alert(
        "Couldn't save item",
        e instanceof Error ? e.message : "Something went wrong. Please try again.",
      );
    } finally {
      isSaving.current = false;
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* exit button */}
      <Pressable
        style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={28} color={theme.text} />
      </Pressable>

      {/* content */}
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <ImageUploader
            image={image}
            onSelectImage={selectImage}
            onTakePhoto={takePhoto}
          />
          {image && <ClothingForm onSubmit={saveItem} />}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingHorizontal: Spacing.four,
    paddingTop: 80,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  closeButton: {
    position: "absolute",
    top: Spacing.three,
    left: Spacing.three,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});