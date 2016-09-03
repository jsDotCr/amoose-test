const chai = require( 'chai' )
const sinon = require( 'sinon' )
const sinonChai = require( 'sinon-chai' )
const camelize = require( 'underscore.string/camelize' )
const underscored = require( 'underscore.string/underscored' )
const fs = require( 'fs' )
const StepsBuilder = require( '../lib/steps-builder' )

const expect = chai.expect
chai.use( sinonChai )

describe( 'Steps builder', function() {
  const testFile = './test/.test-file'
  this.slow( 10 )

  before( 'Setup test file', function( done ) {
    fs.writeFile( testFile, '', ( err ) => {
      if ( !err ) {
        done()
      }
    } )
  } )

  describe( 'create', function() {
    describe( '`steps`', function() {
      [
        undefined,
        null,
        {},
        'no',
        42
      ].forEach( function( stepToCheck ){
        it( `is invalid with ${stepToCheck}`, function(){
          const stepsBuilder = new StepsBuilder()
          const doneCb = sinon.spy()
          stepsBuilder.createSteps( stepToCheck, [], doneCb )
          
          expect( doneCb.getCall( 0 ).args[ 0 ] ).to.be.instanceOf( Error )
          expect( doneCb.getCall( 0 ).args[ 0 ].message ).to.contain( 'Steps must be an array' )
        } )
      } )

      it( 'succeeds with empty array', function(){
        const stepsBuilder = new StepsBuilder()
        const doneCb = sinon.spy()
        stepsBuilder.createSteps( [], [], doneCb )
        
        expect( doneCb.getCall( 0 ).args[ 0 ] ).to.equal( null )
      } )

      describe( 'name', function() {
        [
          [ {} ],
          [ { url: 'file.html', selector: 'html' } ],
          [ { name: '', url: 'file.html', selector: 'html' } ],
          [ { name: null, url: 'file.html', selector: 'html' } ],
          [ { name: 'name', url: 'file.html', selector: 'html' }, { url: 'url.html', selector: 'html' } ]
        ].forEach( function( stepsToCheck ) {
          it( `returns an error for "${stepsToCheck[ 0 ].name}" (${stepsToCheck.length} step(s) as name`, function(){ 
            const stepsBuilder = new StepsBuilder()
            const doneCb = sinon.spy()

            stepsBuilder.createSteps( stepsToCheck, [ [ 600, 480 ] ], doneCb )

            expect( doneCb.getCall( 0 ).args[ 0 ], JSON.stringify( stepsToCheck ) ).to.be.instanceOf( Error )
            expect( doneCb.getCall( 0 ).args[ 0 ].message, JSON.stringify( stepsToCheck ) ).to.contain( 'Invalid step name' )
          } )
        } )

        ;[
          [ { name: 'name', url: 'file.html', selector: 'html' } ],
          [ { name: 'name', url: 'file.html', selector: 'html' }, { name: 'another name', url: 'url.html', selector: 'html' } ]
        ].forEach( function( stepsToCheck ) {
          it( `"${stepsToCheck[ 0 ].name}" (${stepsToCheck.length}x) is fine`, function(){ 
            const stepsBuilder = new StepsBuilder()
            const doneCb = sinon.spy()

            stepsBuilder.createSteps( stepsToCheck, [ [ 600, 480 ] ], doneCb )

            expect( doneCb.getCall( 0 ).args[ 0 ], JSON.stringify( stepsToCheck ) ).to.equal( null )
          } )
        } )
      } )

      describe( 'URL', function() {
        [
          [ { name: 'name', selector: 'html' } ],
          [ { name: 'name', url: '', selector: 'html' } ],
          [ { name: 'name', url: null, selector: 'html' } ],
          [ { name: 'name', url: 'file.html', selector: 'html' }, { name: 'name', selector: 'html' } ]
        ].forEach( function( stepsToCheck ) {
          it( `returns an error with the URL "${stepsToCheck[ 0 ].url}"`, function(){ 
            const stepsBuilder = new StepsBuilder()
            const doneCb = sinon.spy()

            stepsBuilder.createSteps( stepsToCheck, [ [ 600, 480 ] ], doneCb )

            expect( doneCb.getCall( 0 ).args[ 0 ], JSON.stringify( stepsToCheck ) ).to.be.instanceOf( Error )
            expect( doneCb.getCall( 0 ).args[ 0 ].message, JSON.stringify( stepsToCheck ) ).to.contain( 'Invalid URL' )
          } )
        } )
      } )

      describe( 'selector', function() {
        [
          [ { name: 'name', url: 'index.html' } ],
          [ { name: 'name', url: 'index.html', selector: '' } ],
          [ { name: 'name', url: 'index.html', selector: null } ],
          [ { name: 'name', url: 'file.html', selector: 'html' }, { name: 'name', url: 'index.html' } ]
        ].forEach( function( stepsToCheck ) {
          it( `returns an error with the selector "${stepsToCheck[ 0 ].selector}"`, function(){ 
            const stepsBuilder = new StepsBuilder()
            const doneCb = sinon.spy()

            stepsBuilder.createSteps( stepsToCheck, [ [ 600, 480 ] ], doneCb )

            expect( doneCb.getCall( 0 ).args[ 0 ], JSON.stringify( stepsToCheck ) ).to.be.instanceOf( Error )
            expect( doneCb.getCall( 0 ).args[ 0 ].message, JSON.stringify( stepsToCheck ) ).to.contain( 'Invalid CSS selector' )
          } )
        } )
      } )
    } )

    describe( '`viewports`', function() {
      [
        undefined,
        null,
        {},
        'no',
        42
      ].forEach( function( viewportToCheck ){
        it( `is invalid with ${viewportToCheck}`, function(){
          const stepsBuilder = new StepsBuilder()
          const doneCb = sinon.spy()
          stepsBuilder.createSteps( [], viewportToCheck, doneCb )
          
          expect( doneCb.getCall( 0 ).args[ 0 ] ).to.be.instanceOf( Error )
          expect( doneCb.getCall( 0 ).args[ 0 ].message ).to.contain( 'Viewports must be an array' )
        } )
      } )

      describe( 'input values', function() {
        [
          [ [] ],
          [ [ 42.42, 42.42 ] ],
          [ [ 'no', 'number' ] ],
          [ [ null, 500 ] ],
          [ [ 0, 0 ] ],
          [ [ -50, -500 ] ],
          [ [ 640, Infinity ] ],
          [ [ 42 ] ],
          [ [ '420.5', '640.0' ] ]
        ].forEach( function( viewports ){
          it( `returns an error with the viewport "${viewports}"`, function() {
            const stepsBuilder = new StepsBuilder()
            const doneCb = sinon.spy()

            stepsBuilder.createSteps( [ { name: 'name', url: 'file.html', selector: 'html' } ], viewports, doneCb )

            expect( doneCb.getCall( 0 ).args[ 0 ], JSON.stringify( viewports ) ).to.be.instanceOf( Error )
            expect( doneCb.getCall( 0 ).args[ 0 ].message, JSON.stringify( viewports ) ).to.contain( 'Invalid viewport' )
          } )
        } )

        ;[
          [ [ 42, 42 ] ],
          [ [ '520', '400' ] ],
          [ [ '420.0', '640.0' ] ]
        ].forEach( function( viewports ){
          it( `is valid when it is "${viewports}"`, function() {
            const stepsBuilder = new StepsBuilder()
            const doneCb = sinon.spy()

            stepsBuilder.createSteps( [ { name: 'name', url: 'file.html', selector: 'html' } ], viewports, doneCb )

            expect( doneCb.getCall( 0 ).args[ 0 ], JSON.stringify( viewports ) ).to.equal( null )
          } )
        } )
      } )
    } )

    describe( 'return value', function(){
      it( 'is a well formatted step', function() {
        const stepsBuilder = new StepsBuilder()
        const step = { 
          name: 'well done', 
          url: '../another-project/file-to-test.html', 
          selector: 'body' 
        }
        const viewport = [ 1024, 768 ]
        const stepResult = stepsBuilder.createSteps( [ step ], [ viewport ] )

        expect( stepResult, 'Viewport' ).to.have.string( `casper.viewport( ${viewport[ 0 ]}, ${viewport[ 1 ]} )` )
        
        expect( stepResult, 'url' ).to.have.string( `casper.thenOpen( '${step.url}', ` )
        
        expect( stepResult, 'camelized name' ).to.have.string( `function ${camelize( step.name, true )}(){` )

        expect( stepResult, 'selector' ).to.have.string( `casper.waitForSelector( '${step.selector}',` )

        expect( stepResult, 'screenshot' ).to.have.string( `phantomcss.screenshot( '${step.selector}', '${underscored( `${step.name} at ${viewport[ 0 ]}x${viewport[ 1 ]}` )}' )` )

        expect( stepResult, 'timeout' ).to.have.string( `casper.test.fail( 'Failed to match "${step.selector}""' )` )
      } )
    } )
  } )

  describe( 'transform stream', function() {
    it( 'fails if viewport is undefined', function() {
      const stepsBuilder = new StepsBuilder()
      const doneCb = sinon.spy()

      stepsBuilder._transform( {
        paths: {
          baseline: './test/test-dir',
          failure: './test/test-dir',
          comparison: './test/test-dir'
        },
        steps: [
          {
            name: 'valid name',
            url: 'path.html',
            selector: 'body'
          }
        ]
      }, 'utf8', doneCb )

      expect( doneCb.getCall( 0 ).args[ 0 ] ).to.be.instanceOf( Error )
      expect( doneCb.getCall( 0 ).args[ 0 ].message ).to.contain( 'No viewport has been specified' )
    } )

    it( 'fails if paths are undefined', function() {
      const stepsBuilder = new StepsBuilder()
      const doneCb = sinon.spy()

      stepsBuilder._transform( {
        viewports: [ [ 640, 480 ] ],
        paths: {},
        steps: [
          {
            name: 'valid name',
            url: 'path.html',
            selector: 'body'
          }
        ]
      }, 'utf8', doneCb )

      expect( doneCb.getCall( 0 ).args[ 0 ] ).to.be.instanceOf( Error )
      expect( doneCb.getCall( 0 ).args[ 0 ].message ).to.contain( 'Invalid baseline path' )
    } )

    it( 'fails if failure path is not a directory', function() {
      const stepsBuilder = new StepsBuilder()
      const doneCb = sinon.spy()
      const failingPath = './test/test-dir-doesnt-exist'

      stepsBuilder._transform( {
        viewports: [ [ 640, 480 ] ],
        paths: {
          baseline: './test/test-dir',
          failure: failingPath,
          comparison: './test/test-dir'
        },
        steps: [
          {
            name: 'valid name',
            url: 'path.html',
            selector: 'body'
          }
        ]
      }, 'utf8', doneCb )

      expect( doneCb.getCall( 0 ).args[ 0 ] ).to.be.instanceOf( Error )
      expect( doneCb.getCall( 0 ).args[ 0 ].message ).to.contain( `Error accessing path "${failingPath}"` )
    } )

    it( 'fails when comparison path is a file, not a directory', function() {
      const stepsBuilder = new StepsBuilder()
      const doneCb = sinon.spy()

      stepsBuilder._transform( {
        viewports: [ [ 640, 480 ] ],
        paths: {
          baseline: './test/test-dir',
          failure: './test/test-dir',
          comparison: testFile
        },
        steps: [
          {
            name: 'valid name',
            url: 'path.html',
            selector: 'body'
          }
        ]
      }, 'utf8', doneCb )

      expect( doneCb.getCall( 0 ).args[ 0 ] ).to.be.instanceOf( Error )
      expect( doneCb.getCall( 0 ).args[ 0 ].message ).to.contain( `Path "${testFile}" is not a valid directory` )
    } )
  } )

  after( 'Tear down test file', function( done ) {
    fs.unlink( testFile, done )
  } )
} )
