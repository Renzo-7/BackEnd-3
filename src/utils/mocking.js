import { faker } from "@faker-js/faker";
import { createHash } from "./index.js";

// Generar usuarios
export const generateMockUsers = async (num) => {
  const users = [];
  for (let i = 0; i < num; i++) {
    users.push({
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      password: await createHash("coder123"),
      role: faker.helpers.arrayElement(["user", "admin"]),
      pets: [],
    });
  }
  return users;
};

// Generar mascotas
export const generateMockPets = (num) => {
  const pets = [];
  for (let i = 0; i < num; i++) {
    pets.push({
      name: faker.animal.petName(),
      specie: faker.helpers.arrayElement(["dog", "cat", "bird"]),
      birthDate: faker.date.past(10),
      adopted: false,
    });
  }
  return pets;
};
