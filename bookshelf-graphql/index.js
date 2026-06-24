// 1. Import Apollo Server
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import db from "./db.js";

// 2. Define our schema (the "menu")
/*

What are the main parts of a schema?

Types (like type Book) → define the shape of data.
Query → entry point for reading data. Its mandatory for a GraphQL server to have at least one Query type, otherwise the server won't start.
Mutation → entry point for changing data (create/update/delete).

*/

const typeDefs = `
  type Book {
  id: ID!
  title: String!
  isFinished: Boolean
  author: Author    
}

  type Author {
  id: ID!
  name: String!
  books: [Book]     
}

type Query {
  books(finished: Boolean, search: String): [Book]
  authors: [Author]           
  author(id: ID!): Author   
}

  type Mutation {
   addBook(title: String, authorId: ID): Book   
  addAuthor(name: String): Author     
  markAsFinished(id: ID): Book
  deleteBook(id: ID): Boolean
}
`;

// Fake data (pretend this is our database for now)


// Resolvers: functions that return the data
const resolvers = {
  Query: {
  books: (parent, args) => {
    // 1. Start with the base query
    let query = "SELECT * FROM books";
    const conditions = [];
    const values = [];

    // 2. Add a condition if "finished" filter was passed
    if (args.finished !== undefined) {
      conditions.push("isFinished = ?");
      values.push(args.finished ? 1 : 0);  // convert boolean → 0/1 for SQLite
    }

    // 3. Add a condition if "search" was passed
    if (args.search) {
      conditions.push("(title LIKE ? OR author LIKE ?)");
      values.push(`%${args.search}%`, `%${args.search}%`);
    }

    // 4. Combine conditions into a WHERE clause (only if we have any)
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    // 5. Run the query safely with placeholders
    const rows = db.prepare(query).all(...values);

    // 6. Convert isFinished 0/1 → true/false (as always)
    return rows.map((book) => ({
      ...book,
      isFinished: book.isFinished === 1,
    }));
  },
},
  Mutation: {
   addBook: (parent, args) => {
  const result = db
    .prepare("INSERT INTO books (title, authorId) VALUES (?, ?)")
    .run(args.title, args.authorId);   // 👈 store authorId now
  const newBook = db
    .prepare("SELECT * FROM books WHERE id = ?")
    .get(result.lastInsertRowid);
  return { ...newBook, isFinished: newBook.isFinished === 1 };
},
    addAuthor: (parent, args) => {
  const result = db
    .prepare("INSERT INTO authors (name) VALUES (?)")
    .run(args.name);
  return db
    .prepare("SELECT * FROM authors WHERE id = ?")
    .get(result.lastInsertRowid);
},

    deleteBook: (parent, args) => {
  const result = db
    .prepare("DELETE FROM books WHERE id = ?")
    .run(args.id);

  // result.changes tells us how many rows were deleted
  return result.changes > 0;
},
    
  },
};

// Create the server with our schema + resolvers
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start the server
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀 Server ready at: ${url}`);

/*
Every GraphQL schema must have a Query type — it's the main entry point. Without it, your server won't start.

 ✅ The Query type is the front door of your GraphQL API — it's where all read requests enter. No Query type = no way in = server won't start. 
*/