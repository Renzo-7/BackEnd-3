import {
  adoptionsService,
  petsService,
  usersService,
} from "../services/index.js";
import logger from "../utils/logger.js";

const getAllAdoptions = async (_req, res) => {
  try {
    const result = await adoptionsService.getAll();
    logger.info(`Adoptions fetched: ${result.length} records`);
    res.send({ status: "success", payload: result });
  } catch (error) {
    logger.error("Error fetching adoptions", error);
    res.status(500).send({ status: "error", error: "Internal server error" });
  }
};

const getAdoption = async (req, res) => {
  try {
    const adoptionId = req.params.aid;
    logger.http(`Fetching adoption with ID: ${adoptionId}`);
    const adoption = await adoptionsService.getBy({ _id: adoptionId });

    if (!adoption) {
      logger.warn(`Adoption not found with ID: ${adoptionId}`);
      return res
        .status(404)
        .send({ status: "error", error: "Adoption not found" });
    }

    res.send({ status: "success", payload: adoption });
  } catch (error) {
    logger.error("Error fetching adoption", error);
    res.status(500).send({ status: "error", error: "Internal server error" });
  }
};

const createAdoption = async (req, res) => {
  try {
    const { uid, pid } = req.params;
    logger.http(`Creating adoption: User=${uid}, Pet=${pid}`);

    const user = await usersService.getUserById(uid);
    if (!user) {
      logger.warn(`User not found: ${uid}`);
      return res.status(404).send({ status: "error", error: "User not found" });
    }

    const pet = await petsService.getBy({ _id: pid });
    if (!pet) {
      logger.warn(`Pet not found: ${pid}`);
      return res.status(404).send({ status: "error", error: "Pet not found" });
    }

    if (pet.adopted) {
      logger.warn(`Pet already adopted: ${pid}`);
      return res
        .status(400)
        .send({ status: "error", error: "Pet is already adopted" });
    }

    user.pets.push(pet._id);
    await usersService.update(user._id, { pets: user.pets });
    await petsService.update(pet._id, { adopted: true, owner: user._id });
    await adoptionsService.create({ owner: user._id, pet: pet._id });

    logger.info(`Pet adopted successfully. User=${uid}, Pet=${pid}`);
    res.send({ status: "success", message: "Pet adopted" });
  } catch (error) {
    logger.error("Error creating adoption", error);
    res.status(500).send({ status: "error", error: "Internal server error" });
  }
};

export default {
  createAdoption,
  getAllAdoptions,
  getAdoption,
};
