//import * as dotenv from 'dotenv'
import { usertModel as User } from '../models/user.js'
import bcrypt from "bcryptjs"
import { commons, signup_messages as msg } from '../static/message.js'
import jwt from 'jsonwebtoken'
import { userAttemptsModel } from '../models/user_attempts.js'

//dotenv.config()

const signup = async (req, res, next) => {
    console.log("request sign in");
    let token
    let existingUser
    let hashedPassword
    var { username, email, password, pattern, sets, sequence} = req.body
    username = username.toLowerCase()

    if (typeof sets === 'undefined' || typeof username === 'undefined' || typeof email === 'undefined' || typeof password === 'undefined' || typeof pattern === 'undefined') {
        res.status(406).json({
            message: commons.invalid_params,
            format: msg.format
        })
        return
    }
    
    try { existingUser = await User.findOne({email: email}) }
    catch(err) {
        res.status(500).json({message: msg.db_user_failed})
        console.log("Error in existingUser")
        return next()
    }

    if (existingUser) {
        res.status(500).json({message: msg.user_already_exist})
        return next()
    }

    try { hashedPassword  = await bcrypt.hash(password, 12) }
    catch(err) {
        res.status(500).json({message: msg.pass_hash_err})
        console.log("Error in hashedPassword")
        return next()
    }

    const createdUser = new User({
        username, email, password: hashedPassword, sets, pattern, sequence:false
    })

    const attempts = new userAttemptsModel({
        username, email, attempts: 0
    })

    try { await createdUser.save() }
    catch (err) {
        console.log(err)
        res.status(500).json({message: msg.db_save_err})
        console.log("Error in CreateUser")
        return next()
    }

    try { await attempts.save() }
    catch (err) {
        console.log(err)
        res.status(500).json({message: msg.db_save_err})
        console.log("Error in attemptSave")
        return next()
    }

    try { token = jwt.sign({userId: createdUser.id, email: createdUser.email}, process.env.TOKEN_KEY) }
    catch (err) {
        res.status(500).json({message: commons.token_failed})
        console.log("Error in signUpToekn",err.message)
        return next()
    }

    res.status(200).json({ username: createdUser.username, userId: createdUser.id, email: createdUser.email, token: token })
}

export {signup as signupController}