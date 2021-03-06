// npm packages
let port = process.env.PORT || 8000
let express = require('express')
let bodyParser = require('body-parser')
// let fs = require('fs')
let cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc');

// Swagger jsdoc
const options = {
    swaggerDefinition: {
        openapi: '3.0.1',
        info: {
            title: 'Pace Time Sheet API',
            version: '1.0.0',
            description: 'This is a web base time-sheet that create a convenient and user friendly application that efficiently tracks the amount of time an employee has worked within a certain period of time, whilst maintaining the privacy of its users and creating a steady relationship between the employee and the employers.',
            contact: {
                name: 'T-CIRCUIT'
            },
            /* servers: ['https://localhost:8000'] */
            servers: ['https://pacetimesheet.herokuapp.com']
        },
        basePath: '/',
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
    },
    apis: ['./Routes/*.js']
};

const swaggerDocs = swaggerJsdoc(options);

const app = express()
app.use(bodyParser.json())

let whiteList = ['https://pacetimesheet.herokuapp.com', 'http://localhost:3000']

const corsOptions = {
    origin: function(origin, callback){
        if(whiteList.indexOf(origin !== -1 || !origin)){
            callback(null, true)
        }else{
            callback(new Error('CORS Not allowed'))
        }
    }
}

app.use(cors(corsOptions))


// exported modules
const usersRoute = require('./Routes/usersRoute')
const notificationsRoute = require('./Routes/notificationsRoute')
const taskRoute = require('./Routes/tasksRoute')
const todoRoute = require('./Routes/todoRoute')
const contactRoute = require('./Routes/contactRoute')
const calendarRoute = require('./Routes/calendarRoute')
const eScheduleRoute = require('./Routes/e-scheduleRoute')
const taskSheetRoute = require('./Routes/taskSheetRoute')
const managePermissionsRoute = require('./Routes/managePermissionRoute')
const timeSheetRoute = require('./Routes/timeSheetRoute')
const billingSheetRoute = require('./Routes/billingSheetRoute')
const paymentRoute = require('./Routes/paymentRoute')

// instantiate controllers
app.use('/api/users', usersRoute)
app.use('/api/notifications', notificationsRoute)
app.use('/api/tasks', taskRoute)
app.use('/api/todo', todoRoute)
app.use('/api/contact-us', contactRoute)
app.use('/api/calendar', calendarRoute)
app.use('/api/E-schedule', eScheduleRoute)
app.use('/api/taskSheet', taskSheetRoute)
app.use('/api/permissions', managePermissionsRoute)
app.use('/api/timeSheet', timeSheetRoute)
app.use('/api/billingSheet', billingSheetRoute)
app.use('/api/payment', paymentRoute)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// app.use((error, req, res, next) => {
//     if (req.file) {
//         fs.unlink(req.file.path, (err) => {
//             console.log(err)
//         })
//     }
// })


// app.use((req, res, next) => {
//     throw new error('This route does not exist')
// })

// app.use((error, req, res, next) => {
//     if(res.headerSent){
//         return next(error)
//     }
//     res.status(error.code || 500)
//     res.json({message: error.message || 'Unknown error occurred'})
// })


app.listen(port)
console.log('Listening on port 8000')