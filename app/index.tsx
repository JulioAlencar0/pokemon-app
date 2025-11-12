import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Keyboard,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const typeColors: Record<string, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

const typeTranslations: Record<string, string> = {
  fogo: "fire",
  água: "water",
  grama: "grass",
  elétrico: "electric",
  lutador: "fighting",
  venenoso: "poison",
  terra: "ground",
  voador: "flying",
  psíquico: "psychic",
  inseto: "bug",
  pedra: "rock",
  fantasma: "ghost",
  dragão: "dragon",
  sombrio: "dark",
  aço: "steel",
  fada: "fairy",
  gelo: "ice",
  normal: "normal",
};

type PokemonData = {
  id: number;
  name: string;
  image: string;
  types: string[];
  description: string;
};

// Função que busca pokémons da API principal
const fetchPokemons = async (limit = 30, offset = 0) => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  const data = await res.json();

  const results = await Promise.all(
    data.results.map(async (p: any) => {
      const info = await fetch(p.url);
      const dataInfo = await info.json();

      const species = await fetch(dataInfo.species.url);
      const speciesData = await species.json();

      const desc = speciesData.flavor_text_entries.find(
        (entry: any) => entry.language.name === "en"
      );

      return {
        id: dataInfo.id,
        name: dataInfo.name,
        image: dataInfo.sprites.other["official-artwork"].front_default,
        types: dataInfo.types.map((t: any) => t.type.name),
        description: desc ? desc.flavor_text.replace(/\n|\f/g, " ") : "No description available.",
      };
    })
  );

  return results;
};

export default function Index() {
  // Estados principais
  const [openSearch, setOpenSearch] = useState(false); // controla se o input tá aberto
  const [searchText, setSearchText] = useState(""); // texto digitado no input
  const [pokemons, setPokemons] = useState<PokemonData[]>([]); // lista de pokémons que será mostrada
  const [offset, setOffset] = useState(0); // paginação
  const [loading, setLoading] = useState(false); // evita chamadas duplicadas
  const [hasMore, setHasMore] = useState(true); // controla se tem mais pokémons pra carregar
  const animation = useRef(new Animated.Value(0)).current; // animação da barra de pesquisa

  // Carrega os pokémons quando o app inicia
  useEffect(() => {
    loadPokemons(true);
  }, []);

  // Função pra carregar os pokémons da API (30 por vez)
  const loadPokemons = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    const limit = 30;
    const results = await fetchPokemons(limit, reset ? 0 : offset);
    setPokemons((prev) => (reset ? results : [...prev, ...results]));
    setOffset((prev) => (reset ? limit : prev + limit));
    setHasMore(results.length === limit);
    setLoading(false);
  };

  // Pesquisa por nome OU tipo
  const handleSearch = async () => {
    if (searchText.trim() === "") {
      setOffset(0);
      await loadPokemons(true);
      return;
    }

    const normalized = searchText.toLowerCase();
    const type = typeTranslations[normalized] || normalized;

    // Primeiro tenta buscar por tipo
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
      const data = await response.json();
      const results = await Promise.all(
        data.pokemon.map(async (p: any) => {
          const res = await fetch(p.pokemon.url);
          const pokeData = await res.json();

          const species = await fetch(pokeData.species.url);
          const speciesData = await species.json();

          const desc = speciesData.flavor_text_entries.find(
            (entry: any) => entry.language.name === "en"
          );

          return {
            id: pokeData.id,
            name: pokeData.name,
            image: pokeData.sprites.other["official-artwork"].front_default,
            types: pokeData.types.map((t: any) => t.type.name),
            description: desc ? desc.flavor_text.replace(/\n|\f/g, " ") : "No description available.",
          };
        })
      );
      setPokemons(results);
      setHasMore(false);
    } catch {
      // Se não for tipo, tenta buscar por nome
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${normalized}`);
        const data = await res.json();
        const species = await fetch(data.species.url);
        const speciesData = await species.json();

        const desc = speciesData.flavor_text_entries.find(
          (entry: any) => entry.language.name === "en"
        );

        const result = {
          id: data.id,
          name: data.name,
          image: data.sprites.other["official-artwork"].front_default,
          types: data.types.map((t: any) => t.type.name),
          description: desc ? desc.flavor_text.replace(/\n|\f/g, " ") : "No description available.",
        };
        setPokemons([result]);
      } catch {
        setPokemons([]);
      }
    }
  };

  // Abre/fecha o input de busca e faz reset se necessário
  const toggleSearch = async () => {
    if (openSearch && searchText.trim() !== "") {
      await handleSearch();
      Keyboard.dismiss();
    } else {
      Animated.timing(animation, {
        toValue: openSearch ? 0 : 1,
        duration: 400,
        useNativeDriver: false,
      }).start();

      if (openSearch && searchText.trim() === "") {
        await loadPokemons(true);
      }

      if (openSearch) Keyboard.dismiss();
      setOpenSearch(!openSearch);
    }
  };

  // Animações do input
  const inputTranslate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [200, 0],
  });

  const inputOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // Renderiza cada card de Pokémon
  const renderItem = ({ item }: { item: PokemonData }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: typeColors[item.types[0]] || "#ccc" },
      ]}
    >
      <Text style={styles.name}>{item.name.toUpperCase()}</Text>
      <View style={styles.cardBody}>
        <View style={{ flex: 1 }}>
          <Text style={styles.description}>{item.description}</Text>
          {item.types.map((t) => (
            <Text key={t} style={styles.type}>
              {t}
            </Text>
          ))}
        </View>
        <Image source={{ uri: item.image }} style={styles.image} />
      </View>
    </View>
  );

  //               RETURN
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <StatusBar barStyle="dark-content" hidden={false} />

        <TouchableOpacity style={styles.searchButton} onPress={toggleSearch}>
          <Ionicons name="search-circle-sharp" size={45} color="#000" />
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
            onSubmitEditing={handleSearch}
          />
        </Animated.View>

        <Text style={styles.title}>Pokédex</Text>
      </View>

      {/* LISTA DE POKÉMONS */}
      <FlatList
        data={pokemons} // lista que será renderizada
        renderItem={renderItem} // função que desenha cada item
        keyExtractor={(item) => item.id.toString()} // chave única
        numColumns={2} // duas colunas (grid 2x2)
        columnWrapperStyle={styles.row} // estilo das linhas
        onEndReached={() => hasMore && !loading && loadPokemons()} // scroll infinito
        onEndReachedThreshold={0.4} // quando chegar a 40% do fim
        contentContainerStyle={{ padding: 16 }}
        ListFooterComponent={
          loading ? (
            <Text style={{ textAlign: "center", margin: 20 }}>Procurando Pokémons...</Text>
          ) : null
        }
      />
    </View>
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
    shadowColor: "#000",
    top: 35,
    marginBottom: 20,
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
  title: {
    position: "absolute",
    top: 140,
    left: 16,
    fontSize: 32,
    fontWeight: "bold",
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 4,
    elevation: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
  },
  description: {
    fontSize: 9,
    color: "#fff",
    marginBottom: 4,
  },
  type: {
    fontSize: 10,
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
});
