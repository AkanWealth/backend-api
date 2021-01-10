const express = require('express')

//  MiddleWare
const authenticateToken = require('../middleware/authentication')
const schema = require('../modules/schema')
const validator = require('../middleware/validator')


// Export controller
const todoController = require('../controllers/todoController')

const router = express.Router();


//Get todo list
router.get('/todolist', authenticateToken, todoController.getTodolist)

//Insert into TODO-LIST
router.post('/companyName/todolist', authenticateToken, validator(schema.insertTodolist), todoController.insertTodolist)

//Insert into TODO-LIST-BREAK-DOWN
router.post('/companyName/todolistbreakdown', authenticateToken, validator(schema.insertBreakdown), todoController.insertBreakdown)

// UPDATE TODO LIST
router.put('/companyName/todolist/:id', authenticateToken, todoController.updateTodolist)

// UPDATE TODO LIST BREAKDOWN
router.put('/companyName/todolistbreakdown/:id', authenticateToken, todoController.updateBreakdown)

//Delete TODO-LIST
router.delete('/companyName/todolist', authenticateToken, todoController.deleteTodolist)

// DELETE TODO-LIST
router.delete('/companyName/todolistbreakdown/:id', authenticateToken, todoController.deleteBreakdown)

module.exports = router