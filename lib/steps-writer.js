const { Transform } = require( 'stream' )
const fs = require( 'fs' )
const debug = require( 'debug' )( 'steps-writer' )

class StepsWriter extends Transform {

  constructor() {
    super( {
      objectMode: true 
    } )
  }

  _transform( { config, jsSteps } = {}, encoding, next ) {
    if ( !config ) {
      return next( new Error( 'Configuration object missing...?' ), null )
    }
    const { paths } = config
    if ( !paths || !paths.testSuite || typeof ( paths.testSuite ) !== 'string' ) {
      return next( new Error( 'Invalid test suite path provided' ) )
    }
    if ( !jsSteps || typeof ( jsSteps ) !== 'string' ) {
      return next( new Error( 'No steps have been provided' ) )
    }
    let stepsFileName = paths.testSuite
    debug( `input (paths): ${JSON.stringify( paths )}` )
    debug( `input (JS steps): ${jsSteps}` )
    debug( `filename: ${stepsFileName}` )

    fs.writeFile( stepsFileName, jsSteps, ( err ) => {
      debug( `file write error? ${err}` )
      next( err, config )
    } )
  }
}

module.exports = StepsWriter
