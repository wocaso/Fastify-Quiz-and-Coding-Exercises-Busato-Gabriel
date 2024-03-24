const fastify = require("fastify")();

//---------------------------------------------------------------------------------------------------------------------------------------//
let products = [
  {
    id: 1,
    name: "Microwave",
    description: "This is a microwave",
    price: 250,
    availability: 5,
  },
  {
    id: 2,
    name: "Fridge",
    description: "This is a fridge",
    price: 450,
    availability: 3,
  },
  {
    id: 3,
    name: "Blender",
    description: "This is a blender",
    price: 150,
    availability: 0,
  },
];
//---------------------------------------------------------------------------------------------------------------------------------------//
// Routes
fastify.get("/api/products", (request, reply) => {
  reply.send(products);
});

fastify.post("/api/products", (request, reply) => {
  const { name, description, price, availability } = request.body;
  const id = products[products.length - 1].id + 1;
  const newProduct = { id, name, description, price, availability };
  products.push(newProduct);
  reply.code(201).send(newProduct);
});

fastify.get("/api/products/:id", (request, reply) => {
  const { id } = request.params;
  const product = products.find((p) => p.id === parseInt(id));
  if (!product) {
    reply.code(404).send({ message: "Product not found" });
    return;
  }
  reply.send(product);
});

fastify.put("/api/products/:id", (request, reply) => {
  const { id } = request.params;
  const { name, description, price, availability } = request.body;
  const index = products.findIndex((p) => p.id === parseInt(id));
  if (index === -1) {
    reply.code(404).send({ message: "Product not found" });
    return;
  }
  products[index] = {
    id: parseInt(id),
    name,
    description,
    price,
    availability,
  };
  reply.send(products[index]);
});

fastify.delete("/api/products/:id", (request, reply) => {
  const { id } = request.params;
  const index = products.findIndex((p) => p.id === parseInt(id));
  if (index === -1) {
    reply.code(404).send({ message: "Product not found" });
    return;
  }
  products.splice(index, 1);
  reply.send({ message: "Product deleted successfully" });
});
//---------------------------------------------------------------------------------------------------------------------------------------//
// Start the server
const PORT = 3000;

try {
  fastify.listen({ port: PORT });
  console.log(`Server listening on ${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
//---------------------------------------------------------------------------------------------------------------------------------------//