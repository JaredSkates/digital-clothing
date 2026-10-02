import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CATEGORIES, Category } from "@/constants/clothing";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ClothingFormProps } from "@/types/clothing";
import { Host, Picker } from "@expo/ui";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";

// imgUri is owned by the image picker in upload.tsx
export default function ClothingForm({ onSubmit }: ClothingFormProps) {
  const theme = useTheme();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category | "">("");

  const trimmedName = name.trim();
  const canSubmit = trimmedName !== "" && category !== "";

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ name: trimmedName, category });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.field}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Name
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.textSecondary,
              color: theme.text,
            },
          ]}
          placeholder="e.g. Navy wool blazer"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="words"
          value={name}
          onChangeText={setName}
        />
      </ThemedView>

      <ThemedView style={styles.row}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Category
        </ThemedText>
        <Host matchContents ignoreSafeArea="all">
          <Picker selectedValue={category} onValueChange={setCategory}>
            <Picker.Item label="Select a category" value="" />
            {CATEGORIES.map((category) => (
              <Picker.Item key={category} label={category} value={category} />
            ))}
          </Picker>
        </Host>
      </ThemedView>

      <Pressable
        disabled={!canSubmit}
        onPress={handleSubmit}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <ThemedView
          type={canSubmit ? "primary" : "backgroundSelected"}
          style={styles.submit}
        >
          <ThemedText
            type="smallBold"
            themeColor={canSubmit ? "primaryText" : "textSecondary"}
          >
            Save item
          </ThemedText>
        </ThemedView>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    height: 44,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.two,
  },
  submit: {
    alignItems: "center",
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
