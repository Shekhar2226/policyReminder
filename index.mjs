import express from 'express';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: 'Socotra763@outlook.com',
    pass: 'Socotra123*',
  },
});

const app = express();

app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.send('Hello, World!');
});



app.post('/api/sendEmail', async (req, res) => {
    try {
      const { id, transactionId, timestamp, data, type, username } = req.body;
  
      const policyNumber = data["policyLocator"]; // policyLocator

      const reminderName = data["reminderName"];
  
      // Creating Authorization token
      const response_auth = await fetch('https://api.sandbox.socotra.com/account/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'alice.lee',
          password: 'socotra',
          hostName: 'ravendra_socotra-configeditor.co.sandbox.socotra.com',
        }),
      });
  
      if (!response_auth.ok) {
        throw new Error('Failed to authenticate with Socotra API');
      }
  
      const js_obj_auth = await response_auth.json();
      const auth_token = js_obj_auth.authorizationToken;
  
      // Fetching policy from policyLocator
      const response_policy = await fetch(`https://api.sandbox.socotra.com/policy/${policyNumber}`, {
        method: 'GET',
        headers: {
          Authorization: auth_token,
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
  
      if (!response_policy.ok) {
        throw new Error('Failed to fetch policy data from Socotra API');
      }
  
      const js_obj_policy = await response_policy.json();
      const email = js_obj_policy.characteristics[0]?.fieldValues?.email;
      
      if (!email ) {
        throw new Error('Invalid policy data: missing email ');
      }
  
      
      await sendEmail(email, 'Reminder Email', `This is reminder for ${policyNumber} with regarding ${reminderName}.`);
  
      res.status(200).json({ message: 'Request received successfully' });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'An error occurred while processing the request' });
    }
  });
  
  async function sendEmail(to, subject, text) {
    try {
      const mailOptions = {
        from: 'Socotra763@outlook.com',
        to: to,
        subject: subject,
        text: text,
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});