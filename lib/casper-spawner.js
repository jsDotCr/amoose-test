let { spawn } = require( 'child_process' )
const chalk = require( 'chalk' )
const { Transform } = require( 'stream' )
const debug = require( 'debug' )( 'casper-spawner' )
const fs = require( 'fs' )

class CasperSpawner extends Transform {

  constructor( spawnReplacement ) {
    // Testing purposes...
    if ( spawnReplacement && typeof ( spawnReplacement ) === 'function' ) {
      spawn = spawnReplacement
    }

    super( {
      objectMode: true 
    } )
  }

  _transform( testSuitePath, encoding, next ) {
    debug( `Test suite filename: ${testSuitePath}` )

    fs.access( testSuitePath, fs.constants.R_OK, ( err ) => {
      if ( err ) {
        return next( err, null )
      }
      debug( 'Test suite file readble. Going to spawn CasperJS' )
      this.spawn( testSuitePath, next )
    } )
  }

  spawn( testSuitePath, next ) {
    const casperInstance = spawn( 'casperjs', [ 
      'test',
      testSuitePath,
      '--concise'
    ] )
    casperInstance.on( 'message', this.onMessage )
    casperInstance.stdout.on( 'data', this.onMessage )
    casperInstance.on( 'error', this.onError.bind( this, next ) )
    casperInstance.stderr.on( 'data', this.onError.bind( this, next ) )
    casperInstance.on( 'exit', this.done.bind( this, next ) )
  }

  onMessage( messsage ) {
    debug( messsage.toString() )
  }

  onError( next, error ) {
    debug( chalk.bold.red( 'Casper errored' ), error.toString() )
    next( error, null )
  }

  done( next, exitCode ) {
    debug( chalk.bold[ exitCode === 0 ? 'green' : 'red' ]( `Casper is done with exit code ${exitCode}` ) )
    next( exitCode )
  }

}

module.exports = CasperSpawner