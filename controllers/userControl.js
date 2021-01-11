require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const util = require('util');
const dateFormat = require( 'dateformat' );
const time = dateFormat( new Date(), "HH-mm-ii" );


// exported modules
let connection = require('../modules/db')
console.log('users')

// Middleware import
const sendMail = require('../middleware/mailer')

const notificationControl = require('./notificationControl')

connection.query = util.promisify(connection.query);

// sign up Company(post company)
exports.signUp =  (req, res, next) =>{
    const {companyName, email, password} = req.body
    // hash password
    bcrypt.hash (password, 10, (err, hash) => {
        // handle error
        if(err) {return res.status(500).json({message: 'There has been an error, please try again'})}
        
        // handle success
        if (hash){
            queryDB()
            async function  queryDB() {
                try{
                    await connection.query(`INSERT INTO company (companyName, email)
                    VALUES ('${companyName}', '${email}')`)

                    await connection.query(`INSERT INTO staff (companyID, password, email, roleID, username, confirmed)
                    VALUES (LAST_INSERT_ID(), '${hash}', '${email}', '1', '${email}', 'true')`) 
                    
                    await connection.query(`INSERT INTO permissions (permitID, staffID, permitItemID) VALUES ('1', LAST_INSERT_ID(), '1'), 
                    ('1', LAST_INSERT_ID(), '2'), ('1', LAST_INSERT_ID(), '5'), ('1', LAST_INSERT_ID(), '6'), 
                    ('1', LAST_INSERT_ID(), '7'), ('1', LAST_INSERT_ID(), '8'), ('1', LAST_INSERT_ID(), '9'), 
                    ('1', LAST_INSERT_ID(), '10'), ('1', LAST_INSERT_ID(), '11'), ('1', LAST_INSERT_ID(), '12'), 
                    ('1', LAST_INSERT_ID(), '13'), ('1', LAST_INSERT_ID(), '14')`)

                    return res.json({
                        status : 'success',
                        data : req.body
                    })
                
                }catch(err){
                    res.send(err)
                    // return res.status(500).json({message: 'This email already exists'})
                }
            }   
        }
    })
}

// sign up User fromAdmin
exports.employeeSignUp = (req, res, next) => {
    const {companyID, email, roleID, expectedWorkHours, billRateCharge, staffRole, departmentID} = req.body
    const password = 'password'

    permitDetails = req.respData.response.find(x => x.permitItem == 'Add user')
    if(permitDetails.permit ===  'allowed'){            
        // hash password
        bcrypt.hash(password, 10, (err, hash) => {
            // handle error
            // if(err) {return res.status(500).json({message: 'There has been an error, please try again'})}
            if(err)return res.send(err)
            // handle success
            if(hash){
                confirmationToken = crypto.randomBytes(20).toString('hex')
                queryDB()
                async function queryDB() {
                    try{
                        response = await connection.query(`INSERT INTO staff (password, userName, companyID, email, roleID, expectedWorkHours, billRateCharge, staffRole, departmentID, confirmed)
                        VALUES ('${hash}', '${email}', '${companyID}', '${email}', '${roleID}', '${expectedWorkHours}', '${billRateCharge}', '${staffRole}', '${departmentID}', 'false')`)
                        console.log(response.insertId)
                        await connection.query(`UPDATE staff SET confirmationToken = '${confirmationToken}', confirmed = 'false' WHERE email = '${email}'`)
                        
                        if (roleID === 2){
                            // If user role is co-Admin (i.e roleID = 2)
                            await connection.query(`INSERT INTO permissions (permitID, staffID, permitItemID) VALUES ('2', LAST_INSERT_ID(), '1'), 
                            ('1', LAST_INSERT_ID(), '2'), ('1', LAST_INSERT_ID(), '5'), ('1', LAST_INSERT_ID(), '6'), 
                            ('1', LAST_INSERT_ID(), '7'), ('1', LAST_INSERT_ID(), '8'), ('2', LAST_INSERT_ID(), '9'), 
                            ('1', LAST_INSERT_ID(), '10'), ('1', LAST_INSERT_ID(), '11'), ('1', LAST_INSERT_ID(), '12'), 
                            ('1', LAST_INSERT_ID(), '13'), ('1', LAST_INSERT_ID(), '13')`)
                        }
                        // If user role is internal Admin (i.e roleID = 4)
                        if (roleID === '4'){
                            await connection.query(`INSERT INTO permissions (permitID, staffID, permitItemID) VALUES ('2', LAST_INSERT_ID(), '1'), 
                            ('2', LAST_INSERT_ID(), '2'), ('2', LAST_INSERT_ID(), '5'), ('1', LAST_INSERT_ID(), '6'), 
                            ('2', LAST_INSERT_ID(), '7'), ('1', LAST_INSERT_ID(), '8'), ('2', LAST_INSERT_ID(), '9'), 
                            ('1', LAST_INSERT_ID(), '10'), ('2', LAST_INSERT_ID(), '11'), ('1', LAST_INSERT_ID(), '12'), 
                            ('2', LAST_INSERT_ID(), '13'), ('2', LAST_INSERT_ID(), '13')`)
                        }
                        // If user role is employee (i.e roleID = 5)
                        if (roleID === '5'){
                            await connection.query(`INSERT INTO permissions (permitID, staffID, permitItemID) VALUES ('2', LAST_INSERT_ID(), '2'), 
                            ('2', LAST_INSERT_ID(), '2'), ('2', LAST_INSERT_ID(), '5'), ('2', LAST_INSERT_ID(), '6'), 
                            ('2', LAST_INSERT_ID(), '7'), ('2', LAST_INSERT_ID(), '8'), ('2', LAST_INSERT_ID(), '9'), 
                            ('2', LAST_INSERT_ID(), '10'), ('2', LAST_INSERT_ID(), '11'), ('2', LAST_INSERT_ID(), '12'), 
                            ('2', LAST_INSERT_ID(), '13'), ('2', LAST_INSERT_ID(), '13')`)
                        }

                        sendMail(
                            'akan.asanga@gmail.com',
                            'ayoola_toluwanimi@yahoo.com',
                            'Password reset link',
                            `<p>Please click the link below to reset you password<p/>
                            <a href = 'https://pacetimesheet.herokuapp.com/api/users/companyName/confirmation/${confirmationToken}/${response.insertID}'>https://pacetimesheet.herokuapp.com/api/users/companyName/confirmation/${confirmationToken}/${response.insertID}<a/> to reset your password`,
                           
                        )
                    
                        return res.json({
                            status : 'Success! A confirmation link has been sent to the user',
                            data : req.body
                        })
                    }catch(err){
                        res.status(500).json({
                            status : 'This user already exists in our database. Try another email?',
                            data : email
                        })
                    }
                   
                }
            }
        })

    }               
}

// Confirm employee signUp
exports.confirmSignUp = (req, res, next) => {
    const {password} = req.body
    const {id} = req.params
    connection.query(`SELECT * FROM staff WHERE staffID = ${id}`, (err, respToken) => {
        if(err){return res.status(500).json({message: 'There has been an error, try again'})}

        if(respToken){
            if(respToken[0].confirmed == 'false'){                
                connection.query(`UPDATE staff SET confirmed = 'true', lastUpdated = NOW() WHERE staffID = '${id}'`,(err, respConfirm) => {
                    // if(err){return res.status(500).json({message: 'There has been an error, try again'})}
                    if(err)res.send(err)
                    if(respConfirm){
                        bcrypt.hash(password, 10, (err, hash) => {

                            if(err) {return res.status(500).json({message: 'There has been an error, please try again'})}
                            
                            if(hash){
                                connection.query(`UPDATE staff SET password = '${hash}', confirmed = 'true', lastUpdated = NOW() WHERE staffID = '${id}'`, (err, resp) => {
                                    if(err) {return res.status(500).json({message: 'There has been an error, try again'})}

                                    if(resp){
                                        let payload = { 'data': resp }
                            
                                        let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, { expiresIn: '3600000' })

                                        let respData = {
                                            'data': resp,
                                            'accessToken': accessToken
                                        }

                                        return res.json({
                                            status : 'success',
                                            data : respData
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }else if(respToken[0].confirmed == 'true'){
                return res.json({
                    message : 'This link has been used before',
                })
            }
        }
        
    })

}

// login user
exports.userLogin = (req, res, next) => {
    const {email, password} = req.body
    // get user with user email
    connection.query(`SELECT  firstName, lastName, email, password, expectedWorkHours, billRateCharge, departmentID, companyID, staffID, confirmed, roleID FROM staff WHERE email = '${email}'`, (err, resp) => {
        if(err)res.send(err)

        if (resp == 0){ return res.json({Message : "User does not exist"})}

        if(resp){
            connection.query(`SELECT permit, permitItem FROM permissions p  
            JOIN permitItem pi ON pi.permitItemID = p.permitItemID
            JOIN permit pe ON pe.permitID = p.permitID
            WHERE staffID = '${resp[0].staffID}'`, 
            (err, resp1) => {

                // if(err) {return res.status(500).json({message: 'There has been an error, please try again'})}
                if(err)return res.send(err)
                
                //if user email in database
                if(resp1){
                    connection.query(`SELECT c.companyName, d.departmentName, d.departmentID from staff s
                    JOIN company c ON c.companyID = s.companyID
                    LEFT JOIN department d ON d.companyID = s.companyID
                    WHERE s.staffID = "${resp[0].staffID}"`,(err, respQuery) => {
                        if(err) {return res.status(500).json({message: 'There has been an error, please try again'})}

                        if(respQuery){
                            bcrypt.compare(password, resp[0].password, (hashErr, valid) => {
                                //if password does not match
                                if(!valid) {return res.status(500).json({message: 'Incorrect password'})}
                
                                if(hashErr) {return res.status(500).json({message: 'There has been an error, please try again'})}
                
                                // if password matches
                                let  payload = {'response': resp1}
                
                                //get token
                                let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, {expiresIn : '3600000'})
                
                                let respData = {
                                    'response' : resp1,
                                    'accessToken' : accessToken
                                }
                                return res.json({
                                    status : 'success',
                                    data : respData,
                                    data1 : respQuery,
                                    data2 : resp1
                                })
                            })    
                        }
                    })
                }
            })
        }
    })
    
}

// get all staff
exports.getAllCompanyStaff = (req, res, next) => {
    const {companyID} = req.params
    permitDetails = req.respData.response.find(x => x.permitItem == 'View all company users')
    if(permitDetails.permit === 'allowed'){
        connection.query(`select * from company c JOIN staff s ON c.companyID = s.companyID 
        JOIN department d ON c.companyID = d.companyID WHERE c.companyID = ${companyID} `, 
        (err, resp) => {
            if(err) {return res.status(500).json({message: 'There has been an error, please try again'})}

            if(resp){
                return res.json({
                    status : 'success',
                    data : resp
                })
            }
        })
    }else{
        return res.status(403).json({message: 'You do not have permission to view all staff'})
    } 
}

// search company staff
exports.searchStaff = (req, res, next) => {
    const {id} = req.params
    const {search} = req.body
    permitDetails = req.respData.response.find(x => x.permitItem == 'View all company users')
    if(permitDetails.permit.companyID == id){
        connection.query(`select firstName, lastName from staff WHERE firstName LIKE '%${search}%' `, (err, resp) => {
            if(err) {return res.status(500).json({message: 'There has been an error, please try again'})}

            if(resp){
                return res.json({
                    status : 'success',
                    data : resp
                })
            }
        })
    }else{
        return res.status(403).json({message: 'You do not have permission staff'})
    } 
}

// Update company record
exports.updateCompanyRecord = (req, res, next) => {
    const {companyAdjective, companyType, currency} = req.body
    const {id} = req.params
    permitDetails = req.respData.response.find(x => x.permitItem == 'Edit user billing and time')
    if(permitDetails.permit === 'allowed'){
        if(permitDetails.companyID == id){
            connection.query(`UPDATE company SET companyType = '${companyType}', companyAdjective='${companyAdjective}', currency = '${currency}', lastUpdated = NOW() WHERE companyID = ${id}`,
            (err, resp) => {
                if(err) {return res.status(500).json({message: 'There has been an error, please try again'})}

                if(resp){
                    return res.json({
                        status : 'success',
                        data : req.body
                    })
                } 
            })
        }else{
            return res.status(500).json({message: 'You do not have permission to edit company details'})
        }
    }  
}

// Add department
exports.addDepartment = (req, res, next) => {
    const {departmentName} = req.body
    const {id} = req.params
    permitDetails = req.respData.response.find(x => x.permitItem == 'Edit user billing and time')
    if(permitDetails.permit === 'allowed'){
        if(permitDetails.companyID == id){
            connection.query(`INSERT INTO department (departmentName, companyID) VALUES('${departmentName}', '${id}')`,
            (err, resp) => {
                if(err) {return res.status(500).json({message: 'There has been an error, please try again'})}

                if(resp){
                    return res.json({
                        status : 'success',
                        data : req.body
                    })
                } 
            })
        }else{
            return res.status(500).json({message: 'You do not have permission to edit company details'})
        }
    }else{
        return res.status(500).json({message: 'You do not have permission to edit company details'})
    }
}

// get department
exports.getDepartment = (req, res, next) => {
    const {id} = req.params

    permitDetails = req.respData.response.find(x => x.permitItem == 'Edit user billing and time')
    if(permitDetails.permit === 'allowed'){
        if(permitDetails.companyID == id){
            connection.query(`SELECT departmentName, departmentID FROM department WHERE companyID = '${id}' ORDER BY departmentID ASC`, (err, resp) => {
                // if(err) {return res.status(500).json({message: 'There has been an error, please try again'})}
                if(err)res.send(err)
                if(resp){
                    return res.json({
                        status : 'success',
                        data : resp
                    })
                } 
            })
        }else{
            return res.status(500).json({message: 'You do not have permission to edit company details'})
        }
    }else{
        return res.status(500).json({message: 'You do not have permission to edit company details'})
    } 
}

exports.editDepartment = (req, res, next) => {
    const{departmentName} = req.body
    const {id, departmentID} = req.params

    permitDetails = req.respData.response.find(x => x.permitItem == 'Edit user billing and time')
    if(permitDetails.permit === 'allowed'){
        if(permitDetails.companyID == id){
            connection.query(`UPDATE department SET departmentName = ${departmentName} WHERE companyID = '${id}' AND departmentID = ${departmentID} `, (err, resp) => {
                if(err) {return res.status(500).json({message: 'There has been an error, please try again'})}

                if(resp){
                    return res.json({
                        status : 'success',
                        data : req.body
                    })
                } 
            })
        }else{
            return res.status(500).json({message: 'You do not have permission to edit company details'})
        }
    }else{
        return res.status(500).json({message: 'You do not have permission to edit company details'})
    } 
}

exports.deleteDepartment = (req, res, next) => {
    const {id, departmentID} = req.params

    permitDetails = req.respData.response.find(x => x.permitItem == 'Edit user billing and time')
    if(permitDetails.permit === 'allowed'){
        if(permitDetails.companyID == id){
            connection.query(`DELETE from department WHERE WHERE companyID = '${id}' AND departmentID = ${departmentID} `, (err, resp) => {
                if(err) {return res.status(500).json({message: 'There has been an error, please try again'})}

                if(resp){
                    return res.json({
                        status : 'success'
                    })
                } 
            })
        }else{
            return res.status(500).json({message: 'You do not have permission to edit company details'})
        }
    }else{
        return res.status(500).json({message: 'You do not have permission to edit company details'})
    } 
}


// Update user record
exports.updateUserRecord = (req, res, next) => {
    const {firstName, lastName, phoneNumber, address, userName,} = req.body
    const {id} = req.params
    if(!req.file){
        connection.query(`UPDATE staff SET firstName = '${firstName}', lastName='${lastName}', phoneNumber =  '${phoneNumber}', address = '${address}', 
        userName = '${userName}', lastUpdated = NOW() WHERE staffID = ${id}`,
        (err, resp) => {
            if(err) {return res.status(500).json({message: 'There has been an error, please try again'})}
            // if(err)res.send(err)
            if(resp){
                return res.json({
                    status : 'success',
                    data : req.body
                })
            } 
        })
    }else{
        image = req.file.path.replace("/\\/g", "//")
        connection.query(`UPDATE staff SET firstName = '${firstName}', lastName='${lastName}', phoneNumber =  '${phoneNumber}', address = '${address}', 
        userName = '${userName}', image = '${image}', lastUpdated = NOW() WHERE staffID = ${id}`,
        (err, resp) => {
            if(err) {return res.status(500).json({message: 'This userName has been used before, try another userName'})}
            // if(err)res.send(err)
            if(resp){
                return res.json({
                    status : 'success',
                    data : req.body
                })
            } 
        })
    }
}

// read company
exports.viewCompanyProfile = (req, res, next) => {
    const {id} = req.params
    permitDetails = req.respData.response.find(x => x.permitItem == 'Edit user billing and time')
    if(permitDetails.permit === 'allowed'){
        if(permitDetails.companyID == id){
            connection.query(`select * from company where companyID = ${id}`, (err, resp) => {
                if(err) {return res.status(500).json({message: 'There has been an error, please try again'})}

                if(resp){
                    return res.json({
                        status : 'success',
                        data : resp
                    })
                }
            })
        }else{
            return res.status(500).json({message: 'You do not have permission to edit company details'})
        }
    }else{
        return res.status(500).json({message: 'You do not have permission to edit company details'})
    }   
}

// read User
exports.viewProfile = (req, res, next) => {
    const {id} = req.params
    if(req.respData.response[0].staffID == id){
        connection.query(`select * from staff where staffID = ${id}`, (err, resp) => {
            if(err) {return res.status(500).json({message: 'There has been an error, please try again'})}

            if(resp){
                return res.json({
                    status : 'success',
                    data : resp
                })
            }
        })
    }else{
        return res.status(500).json({message: 'Permission not granted'})
    }
}

// change user password
exports.changePassword = (req, res, next) => {
    const {id} = req.params
    const {password} = req.body
    
    if(req.respData.response[0].staffID == id){
        bcrypt.hash(password, 10, (err, hash) => {
            if(err) {return res.status(500).json({message: 'There has been an error, please try again'})}

            if(hash){
                connection.query(`UPDATE staff SET password = '${hash}'`, (err, resp) => {
                    if(err) {return res.status(500).json({message: 'There has been an error, try again'})}

                    if(resp){
                        return res.json({
                            status : 'success',
                            data : "password successfully changed"
                        })
                    }
                })
            }
        })
    }
}

// edit employee time and billing
exports.timeAndBilling = (req, res, next) => {
    const {expectedWorkHours, billRateCharge, departmentID} = req.body
    const {id} = req.params

    permitDetails = req.respData.response.find(x => x.permitItem == 'Edit user billing and time')
    if(permitDetails.permit === 'allowed'){
        connection.query(`UPDATE staff SET expectedWorkHours = '${expectedWorkHours}', 
        billRateCharge ='${billRateCharge}', departmentID = '${departmentID}', lastUpdated = NOW()
        where staffID = ${id} and companyID = ${permitDetails.companyID}`,
        (err, resp) => {
            // if(err) {return res.status(500).json({message: 'There has been an error, try again'})}
            if(err)res.send(err)
            if(!resp){
                return res.json({
                    status : 'User does not exist in this company',
                })
            }
            if(resp){
                let notified = {
                    'staffID' : id,
                    'heading' : 'User details update',
                    'body' :  `Your bill rate charge has been updated to ${billRateCharge} and expected hours updated to ${expectedWorkHours}`,
                    'status' : 'false'
                }
                notificationControl.logNotification(notified, res)
                return res.json({
                    status : 'success',
                    data : req.body
                })
            } 
        })
    }else{
        res.send('You do not have permission to edit details')
    }  
}

// password reset
exports.resetPassword = (req, res, next) => {
    const {email} = req.body
    connection.query(`SELECT password, passwordResetExpires, staffID, TIMEDIFF(minute) tokenUsed FROM staff WHERE email = '${email}' `, (errQuery, respQuery) => {
        if(errQuery){
            {return res.status(500).json({message: 'There has been an error, try again'})}
        }

        if(respQuery){
            // generate a crypto code
            passwordResetToken = crypto.randomBytes(20).toString('hex')
            // Set expiration time to one hour after crypto code was generated
            passwordResetExpires = Date.now() + 3600000
            // insert code, expiration time and link status to
            connection.query(`UPDATE staff SET passwordResetToken = "${passwordResetToken}", passwordResetExpires = '${passwordResetExpires}' ,tokenUsed = 'false' , lastUpdated = NOW() WHERE email = '${email}'`, (err, resp) => {
                if(resp){
                    sendMail(
                        'ayoola.toluwanimi@lmu.edu.ng',
                        'ayoola_toluwanimi@yahoo.com',
                        'Password reset link',
                        `<p>Please click the link below to reset you password<p/>
                        <a href = '/api/companyName/users/companyName/userProfile/passwordReset/${passwordResetToken}/${respQuery[0].staffID}'>/api/companyName/users/companyName/userProfile/passwordReset/${passwordResetToken}/${respQuery[0].staffID}<a/>`,
                        (errMail, info) => {
                            // if(errMail){return res.status(500).json({message: 'There has been an error, try again'})}
                            
                            let payload = { 'response': respQuery }
                            
                            let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, { expiresIn: '3600000' })

                            let respData = {
                                'response': respQuery,
                                'accessToken': accessToken
                            }

                            return res.json({
                                message : 'Reset password link has been sent to your email',
                                data : respData
                            })
                            
                        }
                    )
                }

                if(err) {return res.status(500).json({message: 'There has been an error, try again'})}
            })
        }
    })
}

exports.setNewPassword = (req, res, next) => {
    connection.query(`SELECT tokenUsed, password from staff where staffId = '${req.params.id}'`, (err, respQuery) => {
        if(err) {return res.status(500).json({message: 'There has been an error, try again'})}

        if(respQuery){
            console.log(respQuery[0])
            if( respQuery[0].tokenUsed == 'false'){

                connection.query(`UPDATE staff SET tokenUsed = 'true' where staffID = '${req.params.id}'`,(err, respReset) => {
                if(err){return res.status(500).json({message: 'There has been an error, try again'})}
                
                if(respReset){
                    bcrypt.compare(req.body.password, respQuery[0].password, (hashErr, valid) => {
                        if(valid){
                            return res.json({
                                message : 'Password cannot be the same',
                            })
                        }

                        if(!valid){
                            bcrypt.hash(req.body.password, 10, (err, hash) => {
                                if(err){return res.status(500).json({message: 'There has been an error, try again'})}
                    
                                if(hash){
                                    connection.query(`UPDATE staff SET password = '${hash}' WHERE staffID = '${req.params.id}'`, (err, resp) => {
                                        if(err){
                                            res.statusCode = 401
                                            res.send(err)
                                        }
                    
                                        if(resp){
                                            return res.json({
                                                message : 'Password Updated',
                                            })
                                        }
                                    })
                                }
                            })
                        }

                        if(hashErr){return res.status(500).json({message: 'There has been an error, try again'})}

                    })
                }

                    if(err){return res.status(500).json({message: 'There has been an error, try again'})}

                })
            }
            if( respQuery[0].tokenUsed == 'true'){
                    return res.json({
                    message : 'This token has been used before',
                })
            }
        }
    })
}

exports.deleteUser = (req, res, next) => {
    connection.query(`DELETE from staff WHERE staffID = ${req.params.id}`, (err, resp) => {
        if (err) {
            if(err){return res.status(500).json({message: 'There has been an error, try again'})}
        }

        if (resp) {
            return res.json({
                message : 'User has been deleted',
            })
        }
    })
}

   