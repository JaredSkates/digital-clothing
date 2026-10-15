import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CATEGORIES, Category } from "@/constants/clothing";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Host, Picker } from "@expo/ui";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";

type ClothingFormProps = {
  onSubmit: (values: { name: string; category: Category }) => void;
  isSubmitting?: boolean;
};

export default function ClothingForm({
  onSubmit,
  isSubmitting,
}: ClothingFormProps) {
  const theme = useTheme();

  // Local form state (isolated from the database and image picker)
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category | "">("");

  // Basic validation: ensure user typed a name and selected a category
  const canSubmit = name.trim() !== "" && category !== "";

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ name, category: category as Category });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Clothing Name Input */}
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

      {/* Category Picker Dropdown */}
      <ThemedView style={styles.row}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Category
        </ThemedText>
        <Host matchContents ignoreSafeArea="all">
          <Picker
            selectedValue={category}
            onValueChange={(val) => setCategory(val as Category)}
          >
            <Picker.Item label="Select a category" value="" />
            {CATEGORIES.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </Host>
      </ThemedView>

      {/* Submit Action Button */}
      <Pressable
        disabled={!canSubmit || isSubmitting}
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
            {isSubmitting ? "Saving..." : "Save item"}
          </ThemedText>
        </ThemedView>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: "stretch", gap: Spacing.three },
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
  pressed: { opacity: 0.7 },
});
