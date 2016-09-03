const { Transform } = require( 'stream' )
const fs = require( 'fs' )
const debug = require( 'debug' )( 'steps-writer' )

class StepsWriter extends Transform {

  constructor() {
    super( {
      objectMode: true 
    } )
  }

  _transform( { paths, jsSteps }, encoding, next ) {
    if ( !paths || !paths.testSuite || typeof ( paths.testSuite ) !== 'string' ) {
      return next( new Error( 'Invalid test suite path provided' ) )
    }
    if ( !jsSteps || typeof ( jsSteps ) !== 'string' ) {
      return next( new Error( 'No steps have been provided' ) )
    }
    let stepsFileName = paths.testSuite
    debug( `input (paths): ${paths}` )
    debug( `input (JS steps): ${jsSteps}` )
    debug( `filename: ${stepsFileName}` )

    fs.writeFile( stepsFileName, jsSteps, ( err ) => {
      debug( `file write error? ${err}` )
      next( err, stepsFileName )
    } )
  }
}

module.exports = StepsWriter
