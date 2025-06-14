// import nodemailer from 'nodemailer';
// import { PrismaClient } from "@prisma/client"

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: parseInt(process.env.EMAIL_PORT || '587'),
//   secure: process.env.EMAIL_SECURE === 'true',
//   requireTLS: process.env.EMAIL_REQUIRE_TLS === "true",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
//   logger: true,
//   debug: true
// });

// export const sendWelcomeEmail = async (email: string, name: string) => {
//   const mailOptions = {
//     from: `"SwarajDesk Team" <${process.env.EMAIL_FROM}>`,
//     to: email,
//     subject: `Welcome to SwarajDesk ${name}! 🎉`,
//     text: `Hi ${name},

// Thank you for signing up with SwarajDesk! We're excited to have you on board.

// We could love to get to know you better — please take a moment to complete this quick survey:
// https://insight.batoi.com/page/survey/a274834a-3802-4733-8e83-12fb94e76518
// Your feedback helps us improve and serve you better!

// Cheers,  

// The SwarajDesk Team  
// ${process.env.SUPPORT_EMAIL} • ${process.env.WEBSITE_LINK}`,

//     html: `<p>Hi ${name},</p>
//            <p>Thank you for signing up with <strong>SwarajDesk</strong>! We're excited to have you on board.</p>
//            <p><strong>We could love to hear from you!</strong><br>
//            Please take a moment to complete our quick <a href="https://insight.batoi.com/page/survey/a274834a-3802-4733-8e83-12fb94e76518" target="_blank">survey</a>. Your feedback helps us improve and serve you better.</p>
//            <p>Cheers,<br>The SwarajDesk Team<br>
//            <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a> • 
//            <a href="${process.env.WEBSITE_LINK}">${process.env.WEBSITE_LINK}</a></p>`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Welcome email sent to ${email}`);
//   } catch (error) {
//     console.error(`Error sending welcome email:`, error);
//   }
// };

// export const sendComplaintConfirmationEmail = async (
//   email: string,
//   name: string,
//   complaintDetails: {
//     categoryName: string;
//     subCategory: string;
//     standardizedSubCategory: string;
//     description: string;
//     urgency: string;
//     location: {
//       pin: string;
//       district: string;
//       city: string;
//       locality: string;
//       street?: string;
//     };
//     date: string;
//   }
// ) => {
//   const locationText = `
//     PIN: ${complaintDetails.location.pin}
//     District: ${complaintDetails.location.district}
//     City: ${complaintDetails.location.city}
//     Locality: ${complaintDetails.location.locality}
//     ${complaintDetails.location.street ? `Street: ${complaintDetails.location.street}` : ''}
//   `;

//   const htmlLocation = `
//     <p><strong>PIN:</strong> ${complaintDetails.location.pin}</p>
//     <p><strong>District:</strong> ${complaintDetails.location.district}</p>
//     <p><strong>City:</strong> ${complaintDetails.location.city}</p>
//     <p><strong>Locality:</strong> ${complaintDetails.location.locality}</p>
//     ${complaintDetails.location.street ? `<p><strong>Street:</strong> ${complaintDetails.location.street}</p>` : ''}
//   `;

//   const mailOptions = {
//     from: `"SwarajDesk Team" <${process.env.EMAIL_FROM}>`,
//     to: email,
//     subject: 'Complaint Registered Successfully',
//     text: `Hi ${name},
// Your complaint has been successfully registered on SwarajDesh.

// Complaint Details:
// Category: ${complaintDetails.categoryName}
// Sub-Category: ${complaintDetails.subCategory}
// Standardized Sub-category (powered by Swaraj AI): ${complaintDetails.standardizedSubCategory}
// Description: ${complaintDetails.description}
// Urgency: ${complaintDetails.urgency}
// Location:
// ${locationText}
// Date: ${complaintDetails.date}

// Our team will review your complaint and take appropriate action as soon as possible. You can track the progress of your complaint from your profile page.

// Thank you for bringing this to our attention.

// Best regards,
// The SwarajDesk Team
// ${process.env.SUPPORT_EMAIL} • ${process.env.WEBSITE_LINK}`,
//     html: `<p>Hi ${name},</p>
//            <p>Your complaint has been successfully registered on SwarajDesh.</p>
//            <h3>Complaint Details:</h3>
//            <p><strong>Category:</strong> ${complaintDetails.categoryName}</p>
//            <p><strong>Sub-Category:</strong> ${complaintDetails.subCategory}</p>
//            <p><strong>Standardized Sub-category (powered by Swaraj AI):</strong> ${complaintDetails.standardizedSubCategory}</p>
//            <p><strong>Description:</strong> ${complaintDetails.description}</p>
//            <p><strong>Urgency:</strong> ${complaintDetails.urgency}</p>
//            <h4>Location:</h4>
//            ${htmlLocation}
//            <p><strong>Date:</strong> ${complaintDetails.date}</p>
//            <p>Our team will review your complaint and take appropriate action as soon as possible. You can track the progress of your complaint from your profile page.</p>
//            <p>Thank you for bringing this to our attention.</p>
//            <p>Best regards,<br>The SwarajDesk Team<br>
//            <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a> • 
//            <a href="${process.env.WEBSITE_LINK}">${process.env.WEBSITE_LINK}</a></p>`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Complaint confirmation email sent to ${email}`);
//   } catch (error) {
//     console.error(`Error sending complaint confirmation email:`, error);
//   }
// };


import nodemailer from 'nodemailer';
import { PrismaClient } from "@prisma/client"

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail service directly
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use app password here
  },
  logger: true,
  debug: true
});

// Alternative configuration if the above doesn't work
/*
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use app password here
  },
  tls: {
    rejectUnauthorized: false
  },
  logger: true,
  debug: true
});
*/

export const sendWelcomeEmail = async (email: string, name: string) => {
  const mailOptions = {
    from: `"SwarajDesk Team" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Welcome to SwarajDesk ${name}! 🎉`,
    text: `Hi ${name},

Thank you for signing up with SwarajDesk! We're excited to have you on board.

We could love to get to know you better — please take a moment to complete this quick survey:
https://insight.batoi.com/page/survey/a274834a-3802-4733-8e83-12fb94e76518
Your feedback helps us improve and serve you better!

Cheers,  

The SwarajDesk Team  
${process.env.SUPPORT_EMAIL} • ${process.env.WEBSITE_LINK}`,

    html: `<p>Hi ${name},</p>
           <p>Thank you for signing up with <strong>SwarajDesk</strong>! We're excited to have you on board.</p>
           <p><strong>We could love to hear from you!</strong><br>
           Please take a moment to complete our quick <a href="https://insight.batoi.com/page/survey/a274834a-3802-4733-8e83-12fb94e76518" target="_blank">survey</a>. Your feedback helps us improve and serve you better.</p>
           <p>Cheers,<br>The SwarajDesk Team<br>
           <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a> • 
           <a href="${process.env.WEBSITE_LINK}">${process.env.WEBSITE_LINK}</a></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending welcome email:`, error);
  }
};

export const sendComplaintConfirmationEmail = async (
  email: string,
  name: string,
  complaintDetails: {
    categoryName: string;
    subCategory: string;
    standardizedSubCategory: string;
    description: string;
    urgency: string;
    location: {
      pin: string;
      district: string;
      city: string;
      locality: string;
      street?: string;
    };
    date: string;
  }
) => {
  const locationText = `
    PIN: ${complaintDetails.location.pin}
    District: ${complaintDetails.location.district}
    City: ${complaintDetails.location.city}
    Locality: ${complaintDetails.location.locality}
    ${complaintDetails.location.street ? `Street: ${complaintDetails.location.street}` : ''}
  `;

  const htmlLocation = `
    <p><strong>PIN:</strong> ${complaintDetails.location.pin}</p>
    <p><strong>District:</strong> ${complaintDetails.location.district}</p>
    <p><strong>City:</strong> ${complaintDetails.location.city}</p>
    <p><strong>Locality:</strong> ${complaintDetails.location.locality}</p>
    ${complaintDetails.location.street ? `<p><strong>Street:</strong> ${complaintDetails.location.street}</p>` : ''}
  `;

  const mailOptions = {
    from: `"SwarajDesk Team" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Complaint Registered Successfully',
    text: `Hi ${name},
Your complaint has been successfully registered on SwarajDesh.

Complaint Details:
Category: ${complaintDetails.categoryName}
Sub-Category: ${complaintDetails.subCategory}
Standardized Sub-category (powered by Swaraj AI): ${complaintDetails.standardizedSubCategory}
Description: ${complaintDetails.description}
Urgency: ${complaintDetails.urgency}
Location:
${locationText}
Date: ${complaintDetails.date}

Our team will review your complaint and take appropriate action as soon as possible. You can track the progress of your complaint from your profile page.

Thank you for bringing this to our attention.

Best regards,
The SwarajDesk Team
${process.env.SUPPORT_EMAIL} • ${process.env.WEBSITE_LINK}`,
    html: `<p>Hi ${name},</p>
           <p>Your complaint has been successfully registered on SwarajDesh.</p>
           <h3>Complaint Details:</h3>
           <p><strong>Category:</strong> ${complaintDetails.categoryName}</p>
           <p><strong>Sub-Category:</strong> ${complaintDetails.subCategory}</p>
           <p><strong>Standardized Sub-category (powered by Swaraj AI):</strong> ${complaintDetails.standardizedSubCategory}</p>
           <p><strong>Description:</strong> ${complaintDetails.description}</p>
           <p><strong>Urgency:</strong> ${complaintDetails.urgency}</p>
           <h4>Location:</h4>
           ${htmlLocation}
           <p><strong>Date:</strong> ${complaintDetails.date}</p>
           <p>Our team will review your complaint and take appropriate action as soon as possible. You can track the progress of your complaint from your profile page.</p>
           <p>Thank you for bringing this to our attention.</p>
           <p>Best regards,<br>The SwarajDesk Team<br>
           <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a> • 
           <a href="${process.env.WEBSITE_LINK}">${process.env.WEBSITE_LINK}</a></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Complaint confirmation email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending complaint confirmation email:`, error);
  }
};