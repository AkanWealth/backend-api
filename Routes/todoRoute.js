const express = require('express')

//  MiddleWare
const authenticateToken = require('../middleware/authentication')
const schema = require('../modules/schema')
const validator = require('../middleware/validator')


// Export controller
const todoController = require('../controllers/todoController')

const router = express.Router();

/* TODO LIST SCHEMA */

/** 
 *
 * @swagger
 *  components:
 *    schemas:
 *      List:
 *        type: object
 *        required:
 *          - staffID
 *          - listName
 *          - dueDate
 *          - status
 *        properties:
 *          id:
 *            type: integer
 *            description: The auto-generated id of the todolist.
 *          staffID:
 *            type: string
 *            description: The id
 *          listName:
 *            type: string
 *            description: The title of your todolist.
 *          dueDate:
 *            type: string
 *            description: Date when due for the task
 *          status:
 *            type: string
 *            description: Status of the todo task
 *          createdAt:
 *            type: string
 *            format: date
 *            description: The date of the record creation.
 *        example:
 *           staffID: 1861
 *           listName: The Pragmatic Programmer
 *           dueDate: date.now()
 *           status: pending
 */

//Get todo list
/**
 * @swagger
 *
 *   /api/todo/companyName/todolist:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     tags: [TODO]
 *     produces:
 *      - application/json
 *     description: Get TODO LIST
 *     responses:
 *       '200':
 *          description: successful
 */
router.get('/companyName/todolist', authenticateToken, todoController.getTodolist)

//Insert into TODO-LIST
/**
 * @swagger
 *
 *   /api/todo/companyName/todolist:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     tags: [TODO]
 *     produces:
 *      - application/json
 *     description: Insert a TODO LIST
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/List'
 *     responses:
 *       '200':
 *          description: Todolist added successfully
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/List'
 */
router.post('/companyName/todolist', authenticateToken, todoController.insertTodolist)

// UPDATE TODO LIST
/**
 * @swagger
 *
 *   /api/todo/companyName/todolist/:id:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     tags: [TODO]
 *     produces:
 *      - application/json
 *     description: Updating the TODO LIST
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           required: true
 *           description: The todo id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/List'
 *     responses:
 *       '201':
 *          description: Updated was successful
 *       '404':
 *          description: Todolist not found.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/List'
 */
router.put('/companyName/todolist/:id', authenticateToken, todoController.updateTodolist)

//Delete TODO-LIST
/**
 * @swagger
 *
 *   /api/todo/companyName/todolist/:id:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     tags: [TODO]
 *     produces:
 *      - application/json
 *     description: Deleting a TODO LIST
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           required: true
 *           description:  Todo list id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/List'
 *     responses:
 *       '204':
 *          description: Todo list has being deleted
 *       '404':
 *          description: Todo list not found.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/List'
 */
router.delete('/companyName/todolist/:id', authenticateToken, todoController.deleteTodolist)


module.exports = router