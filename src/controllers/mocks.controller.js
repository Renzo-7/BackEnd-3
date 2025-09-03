import { generateMockUsers, generateMockPets } from "../utils/mocking.js";
import { usersService, petsService } from "../services/index.js";
import logger from "../utils/logger.js";

const mockingPets = (_req, res) => {
  try {
    const pets = generateMockPets(50);
    logger.http("Generated 50 mock pets");
    res.send({ status: "success", payload: pets });
  } catch (error) {
    logger.error("Error generating mock pets", error);
    res.status(500).send({ status: "error", error: "Internal server error" });
  }
};

const mockingUsers = async (_req, res) => {
  try {
    const users = await generateMockUsers(50);
    logger.http("Generated 50 mock users");
    res.send({ status: "success", payload: users });
  } catch (error) {
    logger.error("Error generating mock users", error);
    res.status(500).send({ status: "error", error: "Internal server error" });
  }
};

const generateData = async (req, res) => {
  try {
    const { users = 0, pets = 0 } = req.body;

    const mockUsers = await generateMockUsers(users);
    const mockPets = generateMockPets(pets);

    if (!mockUsers.length && !mockPets.length) {
      logger.warn("No data generated in /generateData");
      return res
        .status(400)
        .send({ status: "error", error: "No data to insert" });
    }

    if (mockUsers.length) {
      await usersService.create(mockUsers);
      logger.info(`${users} mock users inserted into DB`);
    }

    if (mockPets.length) {
      await petsService.create(mockPets);
      logger.info(`${pets} mock pets inserted into DB`);
    }

    res.send({
      status: "success",
      message: `${users} usuarios y ${pets} mascotas generadas e insertadas.`,
    });
  } catch (error) {
    logger.error("Error inserting mock data into DB", error);
    res.status(500).send({ status: "error", error: "Internal server error" });
  }
};

export default {
  mockingPets,
  mockingUsers,
  generateData,
};
