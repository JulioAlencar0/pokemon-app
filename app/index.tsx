import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import React, { useRef, useState } from "react";
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [openSearch, setOpenSearch] = useState(false);
  const [search, setSearch] = useState("");
  const animation = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const toggleSearch = () => {
    if (openSearch && search.trim() !== "") {
      console.log("🔍 Pesquisando por:", search);
      return;
    }

    // se o input estiver aberto e sem texto, fecha e esconde o teclado
    if (openSearch && search.trim() === "") {
      inputRef.current?.blur(); 
    }

    Animated.timing(animation, {
      toValue: openSearch ? 0 : 1,
      duration: 400,
      useNativeDriver: false,
    }).start();

    setOpenSearch(!openSearch);
  };

  const inputTranslate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [200, 0],
  });

  const inputOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <StatusBar backgroundColor="#E4ECE9" barStyle="dark-content" />

        <TouchableOpacity style={styles.searchButton} onPress={toggleSearch}>
          <Ionicons name="search-circle-sharp" size={45} color="#000000ff" />
        </TouchableOpacity>

        <Image source={require("../assets/ball.png")} style={styles.logo} />

        <Animated.View
          style={[
            styles.inputContainer,
            {
              transform: [{ translateX: inputTranslate }],
              opacity: inputOpacity,
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            placeholder="Procure seu Pokémon aqui..."
            placeholderTextColor="#999"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => console.log("🔍 Buscando:", search)}
          />
        </Animated.View>

        <Text style={styles.title}>Pokédex</Text>
      </View>

      <View style={styles.content}></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    height: 200,
    position: "relative",
    overflow: "hidden",
  },
  logo: {
    width: 230,
    height: 230,
    alignSelf: "flex-end",
    right: -85,
    top: -50,
    opacity: 0.03,
    position: "absolute",
  },
  searchButton: {
    position: "absolute",
    top: 42,
    right: 8,
    zIndex: 5,
  },
  inputContainer: {
    position: "absolute",
    top: 48,
    right: 140,
    width: 260,
    height: 40,
    backgroundColor: "#f9f9f9",
    borderRadius: 9,
    justifyContent: "center",
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: "#000",
  },
  input: {
    fontSize: 16,
    color: "#000",
  },
  content: {
    marginTop: 40,
    paddingHorizontal: 16,
  },
  title: {
    position: "absolute",
    top: 110,
    left: 16,
    fontSize: 32,
    fontWeight: "bold",
  },
});
