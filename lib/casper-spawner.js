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

  _transform( config = {}, encoding, next ) {
    if ( !config ) {
      return next( new Error( 'Configuration object missing...?' ), null )
    }
    const { paths: { testSuite } } = config
    if ( !testSuite || typeof ( testSuite ) !== 'string' ) {
      return next( new Error( 'Improper test suite path' ), null )
    }
    debug( `Test suite filename: ${testSuite}` )

    fs.access( testSuite, fs.constants.R_OK, ( err ) => {
      if ( err ) {
        return next( err, null )
      }
      debug( 'Test suite file readble. Going to spawn CasperJS' )
      this.spawn( config, next )
    } )
  }

  spawn( config = {}, next ) {
    const { paths: { testSuite } } = config
    if ( !testSuite || typeof ( testSuite ) !== 'string' ) {
      return next( new Error( 'Improper test suite path' ), null )
    }
    const casperInstance = spawn( 'casperjs', [ 
      'test',
      testSuite,
      '--concise'
    ] )
    casperInstance.on( 'message', this.onMessage )
    casperInstance.stdout.on( 'data', this.onMessage )
    casperInstance.on( 'error', this.onError.bind( this, next ) )
    casperInstance.stderr.on( 'data', this.onError.bind( this, next ) )
    casperInstance.on( 'exit', this.done.bind( this, config, next ) )
  }

  onMessage( messsage ) {
    debug( messsage.toString() )
  }

  onError( next, error ) {
    debug( chalk.bold.red( 'Casper errored' ), error.toString() )
    return next( error, null )
  }

  done( config = {}, next, exitCode ) {
    const { paths: { baseline, failure } } = config
    
    debug( `Paths are ${JSON.stringify( [ baseline, failure ] )}` )
    debug( chalk.bold[ exitCode === 0 ? 'green' : 'red' ]( `Casper is done with exit code ${exitCode}` ) )

    if ( !baseline || !failure ) {
      return next( new Error( 'Missing baseline or failure folder paths' ), null )
    }

    ;[ baseline, failure ].forEach( directoryPath => this.push( {
      config, 
      directoryPath
    } ) )
    
    next()
  }

}

module.exports = CasperSpawner