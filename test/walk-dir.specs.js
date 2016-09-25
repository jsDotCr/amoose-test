const chai = require( 'chai' )
const sinon = require( 'sinon' )
const sinonChai = require( 'sinon-chai' )
const path = require( 'path' )
const fs = require( 'fs' )
const WalkDir = require( '../lib/walk-dir' )

const expect = chai.expect
chai.use( sinonChai )

describe( 'Walk dir', function(){
  const testDirs = [ 
    path.join( '', 'test', 'test-dir1' )
  ]
  const testNonImages = [ 
    path.join( testDirs[ 0 ], '.file-1' ), 
    path.join( testDirs[ 0 ], '.file-2' ), 
    path.join( testDirs[ 0 ], '.file-3' )
  ]
  const testImages = [
    path.join( testDirs[ 0 ], '.file-4.png' ), 
    path.join( testDirs[ 0 ], '.file-5.png' )
  ]
  const testFiles = [].concat( testNonImages, testImages )
  this.slow( 10 )

  before( 'Setup test filesystem structure', function() {
    testDirs.forEach( testDir => fs.mkdirSync( testDir ) )
    testFiles.forEach( testFile => fs.writeFileSync( testFile, 'Hi. I am a fake file.' ) )
  } )

  describe( 'Transform function', function() {
    it( 'fails if no configuration is passed', function( done ){
      const walkDir = new WalkDir()

      walkDir._transform( undefined, 'utf8', function( err, files ) {
        expect( err ).to.be.instanceOf( Error )
        expect( err.message ).to.contain( 'Configuration object missing' )
        expect( files ).to.equal( null )

        done()
      } )
    } )

    it( 'fails if the folder is undefined', function( done ){
      const walkDir = new WalkDir()

      walkDir._transform( { config: {} }, 'utf8', function( err, files ) {
        expect( err ).to.be.instanceOf( Error )
        expect( err.message ).to.contain( 'Improper directory' )
        expect( files ).to.equal( null )

        done()
      } )
    } )

    it( 'fails if the folder path is not a string', function( done ){
      const walkDir = new WalkDir()

      walkDir._transform( {
        config: {},
        directoryPath: {}
      }, 'utf8', function( err, files ) {
        expect( err ).to.be.instanceOf( Error )
        expect( err.message ).to.contain( 'Improper directory' )
        expect( files ).to.equal( null )

        done()
      } )
    } )

    it( 'fails if the folder path does not exist', function( done ){
      const walkDir = new WalkDir()

      walkDir._transform( { 
        config: {}, 
        directoryPath: 'i/dont/exist/'
      }, 'utf8', function( err, files ) {
        expect( err ).to.be.instanceOf( Error )
        expect( err.message ).to.contain( 'ENOENT' )
        expect( files ).to.equal( null )

        done()
      } )
    } )

    it( 'returns all the defined test files if they are images', function( done ) {
      const walkDir = new WalkDir()

      const pushSpy = sinon.spy( walkDir, 'push' )

      walkDir._transform( {
        config: {},
        directoryPath: testDirs[ 0 ]
      }, 'utf8', function( ) {
        expect( pushSpy ).to.have.callCount( testImages.length )
        pushSpy.restore()
        done()
      } )
    } )
  } )
  
  after( 'Tear down test file', function() {
    testFiles.forEach( testFile => fs.unlinkSync( testFile ) )
    testDirs.forEach( testDir => fs.rmdirSync( testDir ) )
  } )
} )
