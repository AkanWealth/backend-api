require('dotenv').config()
const nodemailer = require('nodemailer')
const mailGun = require('nodemailer-mailgun-transport')

// const auth = {
//     auth: {
//       apiKey: `${process.env.API_KEY}`,
//       domain: `${process.env.DOMAIN}`
//     }
// }

// const mailer = nodemailer.createTransport(mailGun(auth));

// const sendMail = (email, receiver, subject, html, text, cb) => {
//     const mailOptions = {
//         from : email,
//         to : receiver,
//         subject : subject,
//         html : html,
//         text : text
//     };
//     mailer.sendMail(mailOptions, (err, info) => {
//         if(err){
//             cb(err, null)
//         }
//         else{
//             cb(null, info)
//         }
//     })
// }

var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "9f06e003b14b45",
        pass: "e32d15f2d5cfff"
    }
});

const sendMail = (from, to, subject, html) => {
    const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: html
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}




module.exports = sendMail

// let transporter = nodemailer.createTransport({
//     host: `${process.env.HOST}`,
//     port: `${process.env.PORT_NO}`,
//     auth: {
//         user: `${process.env.USER}`,
//         pass: `${process.env.PASSWORD}`
//     }
// });
// const mailOptions = {
//     from: 'akan.asanga@gmail.com',
//     to: 'akan.asanga@yahoo.com',
//     subject: 'From contact',
//     html: `<h1>Contact-us</h1> \n
//     '${req.body.contactName}', \n
//     '${req.body.contactEmail}',\n
//     '${req.body.message}',\n
//     '${req.body.date}'`
// };

// transporter.sendMail(mailOptions, function(error, info) {
//     if (error) {
//         console.log(error);
//     } else {
//         console.log('Email sent: ' + info.response);
//     }
// });

// module.exports = transporter.sendMail