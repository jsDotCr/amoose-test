const { Transform } = require( 'stream' )
const fs = require( 'fs' )
const path = require( 'path' )
const debug = require( 'debug' )( 'walk-dir' )

const allowedExtensions = [ '.png' ]

class WalkDir extends Transform {
  constructor() {
    super( {
      objectMode: true 
    } )
  }

  _transform( { config, directoryPath } = {}, encoding, next ) {
    if ( !config ) {
      return next( new Error( 'Configuration object missing...?' ), null )
    }
    if ( !directoryPath || typeof ( directoryPath ) !== 'string' ) {
      return next( new Error( 'Improper directory' ), null )
    }

    debug( `Going to read ${directoryPath}` )

    fs.readdir( directoryPath, ( err, files ) => {
      if ( err ) {
        debug( `readdir errored: ${err}` )
        return next( err, null )
      }
      debug( `Files found in the folder ${directoryPath}: ${files}` )
      files
        .filter( file => allowedExtensions.includes( path.extname( file ) ) )
        .forEach( file => this.push( {
          config,
          filePath: path.join( directoryPath, file ) 
        } ) )

        next()
    } )
  }
}

module.exports = WalkDir