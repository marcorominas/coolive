import { Pressable, Text, ActivityIndicator } from "react-native";

type ButtonProps = {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  fullWidth?: boolean; // opcional: per si vols que ocupi el 100% de l'ample
};

export default function Button({
  title,
  onPress,
  isLoading = false,
  variant = "primary",
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  // Colors segons variant
  const bg =
    variant === "primary"
      ? "bg-orange"
      : "bg-beige border border-brown";
  const textColor =
    variant === "primary" ? "text-white" : "text-brown";

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading || disabled}
      className={`
        ${fullWidth ? "w-full" : ""}
        py-3 px-4
        rounded-2xl
        items-center
        justify-center
        shadow
        ${bg}
        ${isLoading || disabled ? "opacity-60" : ""}
        active:scale-95
        mb-2
        mt-2
      `}
      android_ripple={{ color: "#eab308" }}
      style={({ pressed }) => [
        pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#3E2C2A"} />
      ) : (
        <Text
          className={`font-heading text-base font-bold tracking-wide ${textColor}`}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
