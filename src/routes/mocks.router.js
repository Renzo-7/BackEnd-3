import { Router } from "express";
import mocksController from "../controllers/mocks.controller.js";

const router = Router();

router.get("/mockingpets", mocksController.mockingPets);

// Endpoint para generar usuarios
router.get("/mockingusers", mocksController.mockingUsers);

// Endpoint para generar e insertar datos en la DB
router.post("/generateData", mocksController.generateData);

export default router;
