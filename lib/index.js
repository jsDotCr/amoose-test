/*globals __dirname:false */
const path = require( 'path' )
const debug = require( 'debug' )( 'index' )
const fs = require( 'fs' )
const chalk = require( 'chalk' )

const JSONParser = require( './json-parser' )
const CasperSpawner = require( './casper-spawner' )
const StepsBuilder = require( './steps-builder' )
const StepsWriter = require( './steps-writer' )
const WalkDir = require( './walk-dir' )
const ReadFile = require( './read-file' )
const AwsAdapter = require( './aws-adapter' )

function handleError( error ) {
  console.error( chalk.red.bold( error.message ) )
  console.error( chalk.red.bold( error.stack ) )
}

module.exports = function amooseTest() {
  debug( `Stream starts with ${path.join( __dirname, '..', 'test.json' )}` )

  const configurationStream = fs.createReadStream( path.join( __dirname, '..', 'test.json' ), {
    encoding: 'utf8'
  } )

  ;[ 
    JSONParser, 
    StepsBuilder, 
    StepsWriter, 
    CasperSpawner, 
    WalkDir, 
    ReadFile, 
    AwsAdapter 
  ].reduce( ( currentStream, NextStream ) => {
    const nextStream = new NextStream()

    nextStream.on( 'error', handleError )

    return currentStream.pipe( nextStream )
  }, configurationStream )
}
