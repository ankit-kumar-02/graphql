import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Button,
} from "react-native";

const GET_BOOKS = gql`
  query GetBooks($finished: Boolean, $search: String) {
    books(finished: $finished, search: $search) {
      id
      title
      author
      isFinished
    }
  }
`;

// 1. Define the mutation
const ADD_BOOK = gql`
  mutation AddBook($title: String, $author: String) {
    addBook(title: $title, author: $author) {
      id
      title
      author
      isFinished
    }
  }
`;

const MARK_FINISHED = gql`
  mutation MarkAsFinished($id: ID) {
    markAsFinished(id: $id) {
      id
      isFinished
    }
  }
`;

const DELETE_BOOK = gql`
  mutation DeleteBook($id: ID) {
    deleteBook(id: $id)
  }
`;

export default function HomeScreen() {
  const [search, setSearch] = useState('');
const [filter, setFilter] = useState<boolean | undefined>(undefined);

//useQuery watches its variables. When the variables change, it automatically re-fetches. You never call fetch yourself.
  const { loading, error, data } = useQuery(GET_BOOKS, {
  variables: {
    search: search || undefined,   // empty string → undefined (no filter)
    finished: filter,
  },
});

  // 2. Set up the mutation hook
  const [addBook] = useMutation(ADD_BOOK, {
    refetchQueries: [GET_BOOKS], // refetchQueries refresh the list after adding
  });

  const [markAsFinished] = useMutation(MARK_FINISHED, {
    refetchQueries: [GET_BOOKS],
  });

  const [deleteBook] = useMutation(DELETE_BOOK, {
    refetchQueries: [GET_BOOKS],
  });

  // 3. Form state (you know this already!)
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const handleAdd = () => {
    addBook({ variables: { title, author } });
    setTitle("");
    setAuthor("");
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 100 }} />;
  if (error)
    return <Text style={{ marginTop: 100 }}>Error: {error.message}</Text>;

  return (
    <ScrollView style={{ marginTop: 100, padding: 20 }}>
    <View style={{ marginTop: 100, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>My Bookshelf 📚</Text>
{/* Search box */}
<TextInput
  placeholder="Search by title or author..."
  value={search}
  onChangeText={setSearch}
  style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
/>

{/* Filter buttons */}
<View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
  <Button title="All" onPress={() => setFilter(undefined)} />
  <Button title="Finished" onPress={() => setFilter(true)} />
  <Button title="Unfinished" onPress={() => setFilter(false)} />
</View>
      {/* Form to add a book */}
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, padding: 8, marginVertical: 5 }}
      />
      <TextInput
        placeholder="Author"
        value={author}
        onChangeText={setAuthor}
        style={{ borderWidth: 1, padding: 8, marginVertical: 5 }}
      />
      <Button title="Add Book" onPress={handleAdd} />

      <FlatList
        data={data.books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderColor: "#eee",
            }}
          >
            <Text style={{ fontSize: 18 }}>
              {item.title} {item.isFinished ? "✅" : "📖"}
            </Text>
            <Text style={{ color: "gray" }}>{item.author}</Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 5 }}>
              {!item.isFinished && (
                <Button
                  title="Mark Finished"
                  onPress={() => markAsFinished({ variables: { id: item.id } })}
                />
              )}
              <Button
                title="Delete"
                color="red"
                onPress={() => deleteBook({ variables: { id: item.id } })}
              />
            </View>
            
          </View>
        )}
      />
    </View>
    </ScrollView>
  );
}

/*
useQuery runs automatically when the component mounts — because you almost always want to show data as soon as a screen loads. (Reading is passive.) 📖
useMutation gives you a function to call on a specific action — like a button press — because you only want to change data when the user decides to. (Writing is intentional.) 

*/
