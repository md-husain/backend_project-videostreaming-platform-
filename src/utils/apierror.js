class apiError extends Error {

    // Constructor to initialize the error with a message and status code
    constructor(
        statusCode ,
        message = "Internal Server Error",
        errors = [],
        stack = ""

    ){
        super(message)// Call the parent constructor with the error message
        this.statusCode = statusCode // Set the status code
        this.data = null
        this.message = message // Set the error message
        this.errors = errors // Set any additional error
        this.success = false // Indicate that the operation was not successful
        this.stack = stack // Set the stack trace


        if(stack){
            this.stack = stack; // Set the stack trace if provided
        }else{
            Error.captureStackTrace(this, this.constructor); // Capture the stack trace if not provided
        }
    }
}

export default apiError;