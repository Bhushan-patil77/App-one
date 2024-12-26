import jwt from "jsonwebtoken"


export const generateToken = ({ email:email}) =>{
    
   const token = jwt.sign({email:email},  process.env.JWT_SECRET, {expiresIn:'7h'})
   return token
}    