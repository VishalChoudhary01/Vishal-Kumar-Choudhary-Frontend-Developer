import  contactSchema from '@/validators/contact.schema.js';
import validateRequest from '@/validators/validateRequest.js';

const handleContactForm=async(body)=>{
    const validation=validateRequest(contactSchema,body)
    if(!validation.success){
        return{ status:400,error:validation.error}
    }
    
    // Send email logic here
    await sendContactEmail(validation.data)
    return{ status:200,message:"Contact form submitted successfully"}
}

export default handleContactForm;
