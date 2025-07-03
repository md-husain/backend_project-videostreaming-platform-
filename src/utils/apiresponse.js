// File: src/utils/apiresponse.js
class Apirsponse {

    // Constructor to initialize the error with a message and status code
    constructor(statusCode,data,message= success){
        this.statusCode  = statusCode // Set the status code
        this.data = data // Set the data,
        //message = "Internal Server Error"
        this.message = message // Set the error message
        this.success = statusCode < 400 // Indicate that the operation was successful,
        
    }
    

}
export default Apirsponse;