/* global casper:false */
var fs = require( 'fs' )
var phantomCssPath = fs.absolute( fs.workingDirectory + '/node_modules/phantomcss' )
var phantomcss = require( phantomCssPath + '/phantomcss.js' )

casper.test.begin( 'Visual regression tests', function ( test ) {

  phantomcss.init( {
    rebase: casper.cli.get( 'rebase' ),
    libraryRoot: fs.absolute( phantomCssPath ),
    screenshotRoot: fs.absolute( fs.workingDirectory + '/screenshots' ),
    failedComparisonsRoot: fs.absolute( fs.workingDirectory + '/failures' ),
    comparisonResultRoot: fs.absolute( fs.workingDirectory + '/results' ),
  })

  casper.start( '../apollo/public/demos/molecules/ride/ride.html' )

  casper.viewport( 1920, 1200 )

  casper.then( function rideList() {
    casper.waitForSelector( '.ride__list',
      function success() {
        phantomcss.screenshot( '.ride__list', 'Rides list' )
      },
      function timeout() {
        casper.test.fail( 'Failed to find the rides list' )
      }
    )
  })

  casper.then( function compareScreenshots() {
    phantomcss.compareAll()
  } )

  casper.run( function suiteDone() {
    casper.test.info( 'Done!' )
    //casper.test.info( phantomcss.getExitStatus() )
    casper.test.done()
  } )
})
