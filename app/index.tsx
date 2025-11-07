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
  View,
  Keyboard
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 🔥 Função pra buscar dados da PokéAPI
const getPokemonData = async (name: string) => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
    const data = await response.json();

    // Busca descrição
    const speciesResponse = await fetch(data.species.url);
    const speciesData = await speciesResponse.json();

    // Pega texto em inglês (a API não tem em PT)
    const flavorTextEntry = speciesData.flavor_text_entries.find(
      (entry: { language: { name: string }; flavor_text: string }) => entry.language.name === "en"
    );

    return {
      name: data.name,
      image: data.sprites.other["official-artwork"].front_default,
      types: data.types.map((t: { type: { name: string } }) => t.type.name),
      description: flavorTextEntry ? flavorTextEntry.flavor_text : "No description available.",
    };
  } catch (error) {
    console.error("Erro ao buscar Pokémon:", error);
    return null;
  }
};

type PokemonData = {
  name: string;
  image: string;
  types: string[];
  description: string;
};

export default function Index() {
  const [openSearch, setOpenSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const animation = useRef(new Animated.Value(0)).current;

  // 🔍 Função que controla o input e faz busca
  const toggleSearch = async () => {
    if (openSearch && searchText.trim() !== "") {
      const result = await getPokemonData(searchText);
      if (result) {
        setPokemon(result);
        Keyboard.dismiss();
      }
    } else {
      Animated.timing(animation, {
        toValue: openSearch ? 0 : 1,
        duration: 400,
        useNativeDriver: false,
      }).start();

      if (openSearch) Keyboard.dismiss();
      setOpenSearch(!openSearch);
    }
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
            placeholder="Procure seu Pokémon aqui..."
            placeholderTextColor="#999"
            style={styles.input}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={toggleSearch}
          />
        </Animated.View>

        <Text style={styles.title}>Pokédex</Text>
      </View>

      <View style={styles.content}>
        {pokemon && (
          <View style={styles.card}>
            <Text style={styles.name}>{pokemon.name.toUpperCase()}</Text>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image source={{ uri: pokemon.image }} style={styles.image} />

              <View style={{ flex: 1 }}>
                <Text style={styles.description}>{pokemon.description}</Text>

                <View>
                  {pokemon.types.map((type) => (
                    <Text key={type} style={styles.type}>
                      {type}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
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
    backgroundColor: "#f9f9f9ff",
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
  // Estilos do card
  card: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    elevation: 3,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 16,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  type: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    alignSelf: "flex-start",
  },
});
