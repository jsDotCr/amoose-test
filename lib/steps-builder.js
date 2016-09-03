const { Transform } = require( 'stream' )
const camelize = require( 'underscore.string/camelize' )
const underscored = require( 'underscore.string/underscored' )
const debug = require( 'debug' )( 'steps-builder' )
const path = require( 'path' )
const fs = require( 'fs' )

class StepsBuilder extends Transform {

  constructor() {
    super( {
      objectMode: true 
    } )
  }

  _transform( { viewports, paths, steps }, encoding, next ) {
    const phantomCssPath = require.resolve( 'phantomcss' )

    if ( !Array.isArray( viewports ) ) {
      return next( new Error( 'No viewport has been specified' ) )
    }

    [ 'baseline', 'failure', 'comparison' ].forEach( pathType => {
      let path = paths[ pathType ]
      if ( path && typeof ( path ) === 'string' ) {
        let pathStats
        try {
          pathStats = fs.statSync( path )
        } catch ( e ) {
          return next( new Error( `Error accessing path "${path}": ${e}` ) )
        }
        if ( !pathStats.isDirectory() ) {
          return next( new Error( `Path "${path}" is not a valid directory` ) )
        }
        return true
      }
      return next( new Error( `Invalid ${pathType} path: "${path}"` ) )
    })
    
    let jsSteps = `
/* global casper:false */
var fs = require( 'fs' )
var phantomcss = require( '${phantomCssPath}' )
var phantomCssPath = '${path.dirname( phantomCssPath )}'

casper.test.begin( 'Visual regression test suite', function ( test ) {

  phantomcss.init( {
    rebase: casper.cli.get( 'rebase' ),
    libraryRoot: phantomCssPath,
    screenshotRoot: '${paths.baseline}',
    failedComparisonsRoot: '${paths.failure}',
    comparisonResultRoot: '${paths.comparison}',
    cleanupComparisonImages: true
  })

  casper.start()

  ${this.createSteps( steps, viewports, next )}

  casper.then( function compareScreenshots() {
    phantomcss.compareAll()
  } )

  casper.run( function suiteDone() {
    casper.test.info( 'Done!' )
    casper.test.info( phantomcss.getExitStatus() )
    casper.test.done()
  } )
})
`
    debug( 'input', viewports, paths, steps )
    debug( 'output', jsSteps )

    next( null, {
      viewports, 
      paths, 
      steps,
      jsSteps
    } )
  }

  createSteps( steps, viewports, next ) {
    if ( !Array.isArray( steps ) ) {
      return next( new Error( 'Steps must be an array' ) )
    }
    if ( !Array.isArray( viewports ) ) {
      return next( new Error( 'Viewports must be an array' ) )
    }

    let stepsAsJs = steps.map( ( { name, url, selector }, stepsCounter ) => {
      debug( `Step #${stepsCounter}: ${name} (camelized: ${camelize( name )}), ${url}, ${selector}` )

      if ( !name || typeof ( name ) !== 'string' ) {
        return next( new Error( `Invalid step name "${name}"` ) )
      }
      if ( !url || typeof ( url ) !== 'string' ) { // @TODO stricter check with url.parse / fs.access
        return next( new Error( `Invalid URL "${url}"` ) )
      }
      if ( !selector || typeof ( selector ) !== 'string' ) {
        return next( new Error( `Invalid CSS selector "${selector}"` ) )
      }

      return viewports.map( ( [ width, height ] ) => {
        width = Number( width )
        height = Number( height )
        if ( !Number.isSafeInteger( width ) || width <= 0 || !Number.isSafeInteger( height ) || height <= 0 ) {
          return next( new Error( `Invalid viewport "${width}x${height}"` ) )
        }

        return `
  casper.then( function setViewport() {
    casper.viewport( ${width}, ${height} )
  })
  casper.thenOpen( '${url}', function ${camelize( name, true )}(){
    casper.waitForSelector( '${selector}',
      function success() {
        phantomcss.screenshot( '${selector}', '${underscored( `${name} at ${width}x${height}` )}' )
      },
      function timeout() {
        casper.test.fail( 'Failed to match "${selector}""' )
      }
    )
  })` 
      } ).join( '\n' )
    } ).join( '\n' )

    if ( typeof ( next ) === 'function' ) {
      return next( null, stepsAsJs )
    } else {
      return stepsAsJs
    }
  }
}

module.exports = StepsBuilder
