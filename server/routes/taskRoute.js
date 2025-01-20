const router = require("express").Router();
const authenticateJWT = require("../middleware/jwt");
const {
  createNewTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getEventsTasks,
} = require("../controllers/taskController");

router.get("/event/:eventId", authenticateJWT, getEventsTasks);
router.get("/:id", authenticateJWT, getTask);
router.get("/", authenticateJWT, getTasks);
router.post("/", authenticateJWT, createNewTask);
router.put("/:id", authenticateJWT, updateTask);
router.delete("/:id", authenticateJWT, deleteTask);

module.exports = router;
