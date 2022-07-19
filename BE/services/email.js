const nodemailer = require('nodemailer')

async function sendEmail(dest, subject, message, files)
{
  let transporter = nodemailer.createTransport({
    //host: "smtp.ethereal.email",
    service: 'hotmail',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: 
    { 
      user: process.env.authEmail, 
      pass: process.env.authPassword,
    },
  });

  const mailInfo = 
  {
    from: `" HR Team " <${process.env.authEmail}>`,
    to: dest,
    subject: subject,
    html: message,
    text: "Hello world?",
    //attachments: []
  }

  
  if(files)
  {
    const attachment = files.map( (file)=> 
    {
      return {filename: file.filename, path: file.path}
    }) 
    
    mailInfo.attachments = attachment
  }
    
  await transporter.sendMail(mailInfo)
}

module.exports = sendEmail