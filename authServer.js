const fastify = require("fastify")();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

//---------------------------------------------------------------------------------------------------------------------------------------//
const users = [
  { id: 1, username: "admin", password: "admin" },
  { id: 2, username: "user", password: "123" },
];
//---------------------------------------------------------------------------------------------------------------------------------------//
// Secret key for signing JWT tokens
let JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error(
    "JWT_SECRET environment variable is not set. Using default secret key."
  );
  JWT_SECRET = "abc123";
}

//---------------------------------------------------------------------------------------------------------------------------------------//
// Authenticate user
function authenticateUser(username, password) {
  return users.find(
    (user) => user.username === username && user.password === password
  );
}

// Generate JWT token
function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "1h",
  });
}

// Middleware to verify JWT token
function authenticateToken(request, reply, done) {
  if (request.url === "/api/login") {
    done();
    return;
  }

  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    reply.code(401).send({ message: "Unauthorized: Missing or invalid token" });
    return;
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      reply.code(401).send({ message: "Unauthorized: Invalid token" });
      return;
    }
    request.user = { id: decoded.id, username: decoded.username };
    done();
  });
}
//---------------------------------------------------------------------------------------------------------------------------------------//
// Routes
// Login route
fastify.post("/api/login", (request, reply) => {
  const { username, password } = request.body;
  const user = authenticateUser(username, password);
  if (!user) {
    reply.code(401).send({ message: "Invalid username or password" });
    return;
  }
  const token = generateToken(user);
  reply.send({ token });
});

// Secure existing routes with authentication
fastify.addHook("onRequest", authenticateToken);

fastify.get("/api/posts", (request, reply) => {
  reply.send({ message: "Welcome to the secured blog API!" });
});

//---------------------------------------------------------------------------------------------------------------------------------------//
const PORT = 3000;

try {
  fastify.listen({ port: PORT });
  console.log(`Server listening on ${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
//---------------------------------------------------------------------------------------------------------------------------------------//