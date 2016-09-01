/*globals __dirname:false */
const path = require( 'path' )
const debug = require( 'debug' )( 'index' )
const fs = require( 'fs' )
const chalk = require( 'chalk' )
//const { Transform } = require( 'stream' )

const JSONParser = require( './json-parser' )
const CasperSpawner = require( './casper-spawner' )
const StepsBuilder = require( './steps-builder' )
const StepsWriter = require( './steps-writer' )

function handleError( error ) {
  console.error( chalk.red.bold( error ) )
}

module.exports = function amooseTest() {
  debug( `Stream starts with ${path.join( __dirname, '..', 'test.json' )}` )
fs.createReadStream( path.join( __dirname, '..', 'test.json' ), {
  encoding: 'utf8'
} )
  .on( 'error', ( ...args ) => handleError( 'Stream creation', ...args ) )
  .pipe( new JSONParser() )
    .on( 'error', ( ...args ) => handleError( 'JSON parser', ...args ) )
  .pipe( new StepsBuilder() )
    .on( 'error', ( ...args ) => handleError( 'Steps builder', ...args ) )
  .pipe( new StepsWriter() )
    .on( 'error', ( ...args ) => handleError( 'Steps writer', ...args ) )
  .pipe( new CasperSpawner() )
    .on( 'error', ( ...args ) => handleError( 'Casper spawner', ...args ) )

// 1. collect files
// 2. run casper
// 3. collect images
// 4. push to s3
}
