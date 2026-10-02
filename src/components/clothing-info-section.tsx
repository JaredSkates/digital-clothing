import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CATEGORIES, Category } from "@/constants/clothing";
import { Spacing } from "@/constants/theme";
import { Host, Picker } from "@expo/ui";
import { useState } from "react";
import { StyleSheet, TextInput } from "react-native";

import { useTheme } from "@/hooks/use-theme";

// imgUri comes from the picker in upload.tsx, so this only tracks the rest.
type ClothingInfo = {
  name: string;
  category: Category | "";
};

export default function ClothingInfoSection() {
  const theme = useTheme();
  const [info, setInfo] = useState<ClothingInfo>({
    name: "",
    category: "",
  });

  const updateCategory = (category: Category | "") => {
    if (category !== "") {
      setInfo((prev) => ({ ...prev, category }));
    }
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
          value={info.name}
          onChangeText={(name) => setInfo((prev) => ({ ...prev, name }))}
        />
      </ThemedView>

      <ThemedView style={styles.row}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Category
        </ThemedText>
        <Host matchContents ignoreSafeArea="all">
          <Picker selectedValue={info.category} onValueChange={updateCategory}>
            <Picker.Item label="Select a category" value="" />
            {CATEGORIES.map((category) => (
              <Picker.Item key={category} label={category} value={category} />
            ))}
          </Picker>
        </Host>
      </ThemedView>
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
});
