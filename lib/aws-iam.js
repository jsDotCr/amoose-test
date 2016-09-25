const AWS = require( 'aws-sdk' )
const debug = require( 'debug' )( 'aws-iam' )

let iamUser
let instance

class IAm {
  constructor( { accessKeyId, secretAccessKey } ) {
    debug( `access key (from params): ${accessKeyId}` )
    debug( `access key (from env): ${process.env.ACCESS_KEY_ID}` )
    
    instance = new AWS.IAM( {
      apiVersion: '2010-05-08',
      accessKeyId: accessKeyId || process.env.ACCESS_KEY_ID,
      secretAccessKey: secretAccessKey || process.env.SECRET_ACCESS_KEY_ID
    } )
  }

  get user() {
    return new Promise( ( resolve, reject ) => {
      if ( iamUser && iamUser.UserId ) {
        debug( `User cached: ${iamUser.UserId}` )
        return resolve ( iamUser )
      }
      debug( `User not cached. First time around` )
      
      instance.getUser( {}, function( err, { User } ) {
        if ( err ) {
          debug( `getUser - error - says: ${err}` )
          reject( err )
        } else {
          debug( `getUser - data - says: ${JSON.stringify( User )}` )
          iamUser = User
          resolve( User )
        }
      } )
    } )
  }
}

module.exports = IAm
