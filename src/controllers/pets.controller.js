import PetDTO from "../dto/Pet.dto.js";
import { petsService } from "../services/index.js";
import __dirname from "../utils/index.js";

const getAllPets = async (req, res) => {
  try {
    const pets = await petsService.getAll();
    req.logger.info(`Se obtuvieron ${pets.length} mascotas`);
    res.send({ status: "success", payload: pets });
  } catch (error) {
    req.logger.error(`Error al obtener mascotas: ${error.message}`);
    res
      .status(500)
      .send({ status: "error", error: "Error interno del servidor" });
  }
};

const createPet = async (req, res) => {
  try {
    const { name, specie, birthDate } = req.body;

    if (!name || !specie || !birthDate) {
      req.logger.warning("Intento de crear mascota con datos incompletos");
      return res
        .status(400)
        .send({ status: "error", error: "Incomplete values" });
    }

    const pet = PetDTO.getPetInputFrom({ name, specie, birthDate });
    const result = await petsService.create(pet);

    req.logger.info(`Mascota creada con id ${result._id}`);
    res.send({ status: "success", payload: result });
  } catch (error) {
    req.logger.error(`Error al crear mascota: ${error.message}`);
    res
      .status(500)
      .send({ status: "error", error: "Error interno del servidor" });
  }
};

const updatePet = async (req, res) => {
  try {
    const petUpdateBody = req.body;
    const petId = req.params.pid;

    const result = await petsService.update(petId, petUpdateBody);

    if (!result) {
      req.logger.warning(
        `Intento de actualizar mascota inexistente con id ${petId}`
      );
      return res.status(404).send({ status: "error", error: "Pet not found" });
    }

    req.logger.info(`Mascota con id ${petId} actualizada`);
    res.send({ status: "success", message: "Pet updated" });
  } catch (error) {
    req.logger.error(`Error al actualizar mascota: ${error.message}`);
    res
      .status(500)
      .send({ status: "error", error: "Error interno del servidor" });
  }
};

const deletePet = async (req, res) => {
  try {
    const petId = req.params.pid;
    const result = await petsService.delete(petId);

    if (!result) {
      req.logger.warning(
        `Intento de eliminar mascota inexistente con id ${petId}`
      );
      return res.status(404).send({ status: "error", error: "Pet not found" });
    }

    req.logger.info(`Mascota con id ${petId} eliminada`);
    res.send({ status: "success", message: "Pet deleted" });
  } catch (error) {
    req.logger.error(`Error al eliminar mascota: ${error.message}`);
    res
      .status(500)
      .send({ status: "error", error: "Error interno del servidor" });
  }
};

const createPetWithImage = async (req, res) => {
  try {
    const file = req.file;
    const { name, specie, birthDate } = req.body;

    if (!name || !specie || !birthDate) {
      req.logger.warning(
        "Intento de crear mascota con imagen pero datos incompletos"
      );
      return res
        .status(400)
        .send({ status: "error", error: "Incomplete values" });
    }

    const pet = PetDTO.getPetInputFrom({
      name,
      specie,
      birthDate,
      image: `${__dirname}/../public/img/${file.filename}`,
    });

    const result = await petsService.create(pet);

    req.logger.info(`Mascota con imagen creada con id ${result._id}`);
    res.send({ status: "success", payload: result });
  } catch (error) {
    req.logger.error(`Error al crear mascota con imagen: ${error.message}`);
    res
      .status(500)
      .send({ status: "error", error: "Error interno del servidor" });
  }
};

export default {
  getAllPets,
  createPet,
  updatePet,
  deletePet,
  createPetWithImage,
};
