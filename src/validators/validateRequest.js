const validateRequest = (schema,data) => {
    const result = schema.safeParse(data);
    if(!result.success){
        return{success:false,error:result.error.errors[0].message};
    }

    return{success:true,data:result.data};

}

export default validateRequest;