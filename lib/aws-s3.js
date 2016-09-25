const AWS = require( 'aws-sdk' )
const debug = require( 'debug' )( 'aws-s3' )

let instance

class S3 {
  constructor( { accessKeyId, secretAccessKey } ) {
    debug( `access key (from params): ${accessKeyId}` )
    debug( `access key (from env): ${process.env.ACCESS_KEY_ID}` )

    instance = new AWS.S3( {
      accessKeyId: accessKeyId || process.env.ACCESS_KEY_ID,
      apiVersion: '2006-03-01',
      params: {
        Bucket: 'amoose-screenshots'
      },
      region: 'eu-central-1',
      secretAccessKey: secretAccessKey || process.env.SECRET_ACCESS_KEY_ID
    } )
  }

  uploadFile( userData, filePath, fileData ) {
    debug( `User data: ${JSON.stringify( userData )}` )
    debug( `File path: ${JSON.stringify( filePath )}` )

    debug( `Going to upload "${userData.UserId}/${filePath}"` )
    return new Promise( ( resolve, reject ) => {
      instance.putObject( {
        Key: `${userData.UserId}/${filePath}`
      }, function( err, data ) {
        if ( err ) {
          debug( `putObject error: ${err}` )
          reject( err )
        } else {
          debug( `putObject data: ${data}` )
          resolve( data )
        }
      } )
    } )
  }
}

module.exports = S3