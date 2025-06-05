// nativewind.d.ts

import 'react-native';

// Extendim les props de React Native per afegir className
declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface KeyboardAvoidingViewProps {
    className?: string;
  }
  // Si utilitzes més components (p.ex. FlatList, TouchableOpacity, etc.),
  // aquí pots afegir-los també, per exemple:
  // interface FlatListProps<T> {
  //   className?: string;
  // }
}
