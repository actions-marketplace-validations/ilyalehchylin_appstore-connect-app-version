import fs from 'fs'
import jwt from 'jsonwebtoken'
import tools from './tools.js'

export default class Token {

  constructor(keyRaw, keyFile, keyFileBase64) {
    if (!tools.isEmpty(keyRaw)) {
      this.privateKey = keyRaw
    } else if (!tools.isEmpty(keyFile)) {
      this.privateKey = fs.readFileSync(keyFile)
    } else if (!tools.isEmpty(keyFileBase64)) {
      const keyFilename = 'authkey.p8'
      const buffer = Buffer.from(keyFileBase64, 'base64')
      fs.writeFileSync(keyFilename, buffer)
      this.privateKey = fs.readFileSync(keyFilename)
    } else {
      throw new Error(`You must pass either private-key-raw, 
      or private-key-p8-path, or private-key-p8-base64 in order to generate JWT automatically. 
      Otherwise you should pass json-web-token.`)
    }
  }

  verifyToken(token) {
    jwt.verify(token, this.privateKey, { algorithms: ['ES256'] })
  }

  generate(appId, issuerId, keyId) {
    const exp = '20m'
    const alg = 'ES256'
    const aud = 'appstoreconnect-v1'
    const scope = `GET /v1/apps/${appId}/appStoreVersions`
    const payload = { iss: issuerId, aud: aud, scope: [scope] }
    const jwtOptions = { expiresIn: exp, algorithm: alg, header: { kid: keyId } }
    return jwt.sign(payload, this.privateKey, jwtOptions)
  }
}
