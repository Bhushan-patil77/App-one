import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'


export const authProtector = async (req, res, next) => {
    try {

        const encriptedToken = req.cookies.token
        

        if(!encriptedToken){return res.status(500).json({ error: 'No token provided, redirecting to login page' })}
        
        const decodedToken = jwt.verify(encriptedToken, process.env.JWT_SECRET)
        if (!decodedToken) {return res.status(500).json({ error: 'unauthorized token' }) }

        const user = await User.findOne({ email: decodedToken.email }).select('-password')
        if (!user) {return res.status(400).json({ error: 'cannot find user. something went wrong' }) }

        res.user=user
        next()

    } catch (error) {
        res.status(500).json({ error: `error in authProtector route  ${error}` })
    } 
 
}     