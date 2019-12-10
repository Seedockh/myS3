import { Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.JWT_SECRET === undefined)
    return res.status(403).send({ message: 'ERROR: jwt_secret is undefined' })

  const header = req.headers['authorization']
  let jwtPayload

  if (typeof header !== 'undefined') {
    const bearer = header.split(' ')
    const token = bearer[1]

    jwt.verify(token, process.env.JWT_SECRET, (err, authorizedData) => {
      if (err) {
        // If error
        res.status(403).send({ message: 'ERROR: Wrong token sent' })
      } else {
        // If token is successfully verified
        jwtPayload = authorizedData
        res.locals.jwtPayload = jwtPayload
        console.log('SUCCESS: Connected to protected route')
      }
    })
  } else {
    // If header is undefined
    res.status(403).send({ message: 'ERROR: Bearer token is undefined' })
  }

  if (jwtPayload != undefined) {
    // The token is valid for 1 hour
    // Send a new token on every request
    const { userId, username } = jwtPayload
    const newToken = jwt.sign({ userId, username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })
    res.setHeader('token', newToken)
    // Call the next middleware or controller
    next()
  }
}
