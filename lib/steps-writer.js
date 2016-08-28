const { Transform } = require( 'stream' )
const fs = require( 'fs' )
const debug = require( 'debug' )( 'steps-writer' )

class StepsWriter extends Transform {

  constructor() {
    super( {
      objectMode: true 
    } )
  }

  _transform( { paths, jsSteps }, encoding, done ) {
    let stepsFileName = paths.testSuite
    debug( `input (paths): ${paths}` )
    debug( `input (JS steps): ${jsSteps}` )
    debug( `filename: ${stepsFileName}` )

    fs.writeFile( stepsFileName, jsSteps, ( err ) => {
      debug( `file write error? ${err}` )
      done( err, stepsFileName )
    })
  }
}

module.exports = StepsWriter
