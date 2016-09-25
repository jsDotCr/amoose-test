const AWS = require( 'aws-sdk' )
const { Transform } = require( 'stream' )
const debug = require( 'debug' )( 'aws' )
const IAm = require( './aws-iam' )
const S3 = require( './aws-s3' )

let iAm
let s3

class AwsAdapter extends Transform {

  constructor() {
    super( {
      objectMode: true,
      highWaterMark: 128
    } )
  }

  _transform( { config, fileData, filePath } = {}, encoding, next ) {
    if ( !config ) {
      return next( new Error( 'Configuration object missing...?' ), null )
    }
    if ( !iAm ) {
      iAm = new IAm( config.aws )
    }
    if ( !s3 ) {
      s3 = new S3( config.aws )
    }

    iAm.user
      .then( ( userData ) => s3.uploadFile( userData, filePath, fileData ) )
      .then( ( file ) => next( null, {
        config,
        file
      } ) )
      .catch( ( err ) => next( err, null ) )
  }
}

module.exports = AwsAdapter
