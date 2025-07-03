
// approch one for wrapper class of handling async/await errors and requests and responses

// promise based async handler
const asynchandler = (requesthandle) => {
   return  (req,res,next) => {
        Promise.resolve(requesthandle(req,res,next)).
        catch((err) => next(err))
    }
}
export{asynchandler}

// approch 2 using async and await(try-catch block\)

// const asyncHandler =  () => {}
 // const asyncHandler =  (fxn) => async () => {}

    // const asyncHandler = (fxn) => async(req,res,next) => {
    //     try {
    //         await fxn(req,res,next);
    //     } catch (error) {
    //        res.status(err.code || 500).json({
    //             success: false,
    //             message: error.message || "Internal Server Error",
    //             error: error
    //        })
    //     }
    // }