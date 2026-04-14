import { ScrollView, View, useWindowDimensions } from 'react-native';
import { Divider, List } from 'react-native-paper';
import * as React from 'react';
import { useRef } from 'react';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';

export interface CustomActionSheetOption {
  title: string;
  icon: IconSource;
  onPress: () => void;
  color?: string;
  visible: boolean;
}

interface CustomActionSheetProps {
  options: CustomActionSheetOption[];
}

export default function CustomActionSheet({ options }: CustomActionSheetProps) {
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const { height } = useWindowDimensions();
  const visibleOptions = options.filter((option) => option.visible);

  return (
    <ActionSheet ref={actionSheetRef}>
      <View style={{ paddingHorizontal: 5, paddingVertical: 15 }}>
        <Divider />
        <ScrollView
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          style={{ maxHeight: height * 0.6 }}
        >
          <List.Section>
            {visibleOptions.map((entity, index) => (
              <List.Item
                key={index}
                style={{ paddingHorizontal: 15 }}
                titleStyle={{ color: entity.color ?? 'black' }}
                title={entity.title}
                left={() => (
                  <List.Icon icon={entity.icon} color={entity.color} />
                )}
                onPress={async () => {
                  await actionSheetRef.current?.hide();
                  setTimeout(() => {
                    entity.onPress();
                  }, 250);
                }}
              />
            ))}
          </List.Section>
        </ScrollView>
      </View>
    </ActionSheet>
  );
}
