import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export function useStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<[boolean, T]>([true, initialValue]);

  useEffect(() => {
    SecureStore.getItemAsync(key).then((value) => {
      setState([false, value ? JSON.parse(value) : initialValue]);
    });
  }, [key]);

  const setValue = (value: T) => {
    setState([false, value]);
    if (value === null) {
      SecureStore.deleteItemAsync(key);
    } else {
      SecureStore.setItemAsync(key, JSON.stringify(value));
    }
  };

  return [state, setValue] as const;
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (Platform.OS === "web") {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error("Local storage is unavailable:", e);
    }
  } else {
    if (value == null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }
}
