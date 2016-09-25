const { Transform } = require( 'stream' )
const fs = require( 'fs' )
const debug = require( 'debug' )( 'read-file' )

class ReadFile extends Transform {

  constructor() {
    super( {
      objectMode: true,
      highWaterMark: 128 
    } )
  }

  _transform( { config, filePath } = {}, encoding, next ) {
    if ( !config ) {
      return next( new Error( 'Configuration object missing...?' ), null )
    }
    if ( !filePath || typeof ( filePath ) !== 'string' ) {
      return next( new Error( 'Improper file path' ), null )
    }

    debug( `File path to read: ${filePath}` )

    fs.readFile( filePath, 'utf8', ( err, data ) => next( err, {
      config,
      filePath,
      fileData: data || null 
    } ) )
  }

}

module.exports = ReadFile
