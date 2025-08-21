/**
 * Task routes
 * Defines API endpoints for task management
 */
import express from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';

// Create router instance
const router: express.Router = express.Router();

// Create controller instance
const taskController = new TaskController();

// Apply authentication middleware to all task routes
router.use(authenticate);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *               description:
 *                 type: string
 *                 description: Task description
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *                 description: Task status
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Task priority
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Task due date
 *               assigneeId:
 *                 type: string
 *                 description: ID of the user assigned to the task
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', taskController.createTask);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks with optional filtering
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in-progress, done]
 *         description: Filter by task status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by task priority
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *         description: Filter by assignee ID
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *         description: Filter by creator ID
 *       - in: query
 *         name: dueBefore
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by due date before
 *       - in: query
 *         name: dueAfter
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by due date after
 *       - in: query
 *         name: mine
 *         schema:
 *           type: boolean
 *         description: Get tasks created by or assigned to the current user
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', taskController.getTasks);

/**
 * @swagger
 * /tasks/assigned:
 *   get:
 *     summary: Get tasks assigned to the current user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assigned tasks retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/assigned', taskController.getAssignedTasks);

/**
 * @swagger
 * /tasks/my-tasks:
 *   get:
 *     summary: Get tasks created by or assigned to the current user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User tasks retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/my-tasks', taskController.getUserTasks);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.get('/:id', taskController.getTaskById);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *               description:
 *                 type: string
 *                 description: Task description
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *                 description: Task status
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Task priority
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Task due date
 *               assigneeId:
 *                 type: string
 *                 description: ID of the user assigned to the task
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.put('/:id', taskController.updateTask);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', taskController.deleteTask);

export default router;
