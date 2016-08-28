const { Transform } = require( 'stream' )
const camelize = require( 'underscore.string/camelize' )
const underscored = require( 'underscore.string/underscored' )
const debug = require( 'debug' )( 'steps-builder' )
const path = require( 'path' )

class StepsBuilder extends Transform {

  constructor() {
    super( {
      objectMode: true 
    } )
  }

  _transform( { viewports, paths, steps }, encoding, next ) {
    const phantomCssPath = require.resolve( 'phantomcss' )
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

  ${this.createSteps( steps, viewports )}

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

  createSteps( steps, viewports ) {
    if ( !Array.isArray( steps ) ) {
      throw new Error( 'Steps must be an array' )
    }
    if ( !Array.isArray( viewports ) ) {
      throw new Error( 'Viewports must be an array' )
    }

    return steps.map( ({ name, url, selector }, stepsCounter ) => {
      debug( `Step #${stepsCounter}: ${name} (camelized: ${camelize(name)}), ${url}, ${selector}` )

      if ( typeof( name ) !== 'string' ) {
        throw new Error( `Invalid step name "${name}"` )
      }
      if ( typeof( url ) !== 'string' ) { // @TODO stricter check with url.parse / fs.access
        throw new Error( `Invalid URL "${url}"` )
      }
      if ( typeof( selector ) !== 'string' ) {
        throw new Error( `Invalid CSS selector "${selector}"` )
      }

      return viewports.map( ([ width, height ]) => `
  casper.then( function setViewport() {
    casper.viewport( ${width}, ${height} )
  })
  casper.thenOpen( '${url}', function ${camelize(name, true)}(){
    casper.waitForSelector( '${selector}',
      function success() {
        phantomcss.screenshot( '${selector}', '${underscored(`${name} at ${width}x${height}`)}' )
      },
      function timeout() {
        casper.test.fail( 'Failed to match "${selector}""' )
      }
    )
  })` ).join( '\n' )
    }).join( '\n' )
  }
}

module.exports = StepsBuilder
