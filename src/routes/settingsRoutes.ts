import { Router } from "express";
import { getMaintenanceStatus, toggleMaintenanceStatus } from "../controllers/settingsController";

const router = Router();

// Retrieve Settings Route
router.get("/maintenance", getMaintenanceStatus);

// Update Settings Route
router.post("/maintenance", toggleMaintenanceStatus);

export default router;