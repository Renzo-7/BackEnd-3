import { usersService } from "../services/index.js";

const getAllUsers = async (req, res) => {
  try {
    const users = await usersService.getAll();
    req.logger.info(`Se obtuvieron ${users.length} usuarios`);
    res.send({ status: "success", payload: users });
  } catch (error) {
    req.logger.error(`Error al obtener usuarios: ${error.message}`);
    res
      .status(500)
      .send({ status: "error", error: "Error interno del servidor" });
  }
};

const getUser = async (req, res) => {
  try {
    const userId = req.params.uid;
    const user = await usersService.getUserById(userId);

    if (!user) {
      req.logger.warning(`Usuario con id ${userId} no encontrado`);
      return res.status(404).send({ status: "error", error: "User not found" });
    }

    req.logger.info(`Usuario con id ${userId} obtenido correctamente`);
    res.send({ status: "success", payload: user });
  } catch (error) {
    req.logger.error(`Error al obtener usuario: ${error.message}`);
    res
      .status(500)
      .send({ status: "error", error: "Error interno del servidor" });
  }
};

const updateUser = async (req, res) => {
  try {
    const updateBody = req.body;
    const userId = req.params.uid;
    const user = await usersService.getUserById(userId);

    if (!user) {
      req.logger.warning(
        `Intento de actualizar usuario inexistente con id ${userId}`
      );
      return res.status(404).send({ status: "error", error: "User not found" });
    }

    await usersService.update(userId, updateBody);
    req.logger.info(`Usuario con id ${userId} actualizado`);
    res.send({ status: "success", message: "User updated" });
  } catch (error) {
    req.logger.error(`Error al actualizar usuario: ${error.message}`);
    res
      .status(500)
      .send({ status: "error", error: "Error interno del servidor" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.uid;
    const user = await usersService.getUserById(userId);

    if (!user) {
      req.logger.warning(
        `Intento de eliminar usuario inexistente con id ${userId}`
      );
      return res.status(404).send({ status: "error", error: "User not found" });
    }

    await usersService.delete(userId);
    req.logger.info(`Usuario con id ${userId} eliminado`);
    res.send({ status: "success", message: "User deleted" });
  } catch (error) {
    req.logger.error(`Error al eliminar usuario: ${error.message}`);
    res
      .status(500)
      .send({ status: "error", error: "Error interno del servidor" });
  }
};

export default {
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
};
