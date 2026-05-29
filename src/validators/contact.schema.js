import { z } from 'zod';

const contactSchema = z
  .object({
    fullName: z
      .string()
      .min(4, 'Full name must be at least 4 characters long')
      .max(100, 'Full name must be at most 100 characters long'),

    email: z
      .string()
      .email('Invalid email address'),

    projectCategory: z
      .string()
      .min(2, 'Project category must be at least 2 characters long')
      .max(50, 'Project category must be at most 50 characters long'),

    detailMessage: z
      .string()
      .min(10, 'Message must be at least 10 characters long')
      .max(1000, 'Message must be at most 1000 characters long'),
  })


  // Email domain + TLD validation
  .refine((data) => {
    const allowedDomains = [
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'hotmail.com',
      'icloud.com',
    ];

    const allowedTlds = ['.com', '.org', '.net'];

    const domain = data.email.split('@')[1];

    return (
      allowedDomains.includes(domain) &&
      allowedTlds.some((tld) => domain.endsWith(tld))
    );
  }, {
    message:
      'Email must be from gmail, yahoo, outlook, hotmail, or icloud and use .com, .org, or .net',
    path: ['email'],
  })


  // Forbidden words validation
  .refine((data) => {
    const forbiddenWords = ['spam', 'advertisement', 'promotion'];
    const messageLower = data.detailMessage.toLowerCase();

    return !forbiddenWords.some((word) =>
      messageLower.includes(word)
    );
  }, {
    message: 'Message contains forbidden words',
    path: ['detailMessage'],
  });


export default contactSchema;
