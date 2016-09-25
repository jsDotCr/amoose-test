const chai = require( 'chai' )
const path = require( 'path' )
const fs = require( 'fs' )
const ReadFile = require( '../lib/read-file' )

const expect = chai.expect

function getFileContent( filePath ) {
  return `Hi. I am a fake file at path "${filePath}"`
}

describe( 'Read file', function(){
  const testDirs = [ 
    path.join( '', 'test', 'test-dir1' )
  ]
  const testFiles = [
    path.join( '', 'test', 'test-dir1', '.file-1' ), 
    path.join( '', 'test', 'test-dir1', '.file-2' ), 
    path.join( '', 'test', 'test-dir1', '.file-3' )
  ]
  this.slow( 10 )

  before( 'Setup test filesystem structure', function(){
    testDirs.forEach( testDir => fs.mkdirSync( testDir ) )
    testFiles.forEach( testFile => fs.writeFileSync( testFile, getFileContent( testFile ) ) )
  } )

  describe( 'Transform function', function() {
    it( 'fails if the config is undefined', function( done ){
      const readFile = new ReadFile()

      readFile._transform( undefined, 'utf8', function( err, files ) {
        expect( err ).to.be.instanceOf( Error )
        expect( err.message ).to.contain( 'Configuration object missing' )
        expect( files ).to.equal( null )

        done()
      } )
    } )

    it( 'fails if the file is undefined', function( done ){
      const readFile = new ReadFile()

      readFile._transform( { config: {} }, 'utf8', function( err, files ) {
        expect( err ).to.be.instanceOf( Error )
        expect( err.message ).to.contain( 'Improper file path' )
        expect( files ).to.equal( null )

        done()
      } )
    } )

    it( 'fails if the file path is not a string', function( done ){
      const readFile = new ReadFile()

      readFile._transform( {
        config: {}, 
        filePath: [ 'i/dont/exist/either' ] 
      }, 'utf8', function( err, files ) {
        expect( err ).to.be.instanceOf( Error )
        expect( err.message ).to.contain( 'Improper file path' )
        expect( files ).to.equal( null )

        done()
      } )
    } )

    it( 'fails if the file path does not exist', function( done ){
      const readFile = new ReadFile()

      readFile._transform( {
        config: {}, 
        filePath: 'i/dont/exist.gif'
      }, 'utf8', function( err, { fileData } ) {
        expect( err ).to.be.instanceOf( Error )
        expect( err.message ).to.contain( 'ENOENT' )
        expect( fileData ).to.equal( null )

        done()
      } )
    } )

    it( 'returns the content for the given file', function( done ) {
      const readFile = new ReadFile()

      readFile._transform( {
        config: {}, 
        filePath: testFiles[ 2 ]
      }, 'utf8', function( err, { fileData } ) {
        expect( fileData ).to.equal( getFileContent( testFiles[ 2 ] ) )
        done()
      } )
    } )
  } )
  
  after( 'Tear down test file', function() {
    testFiles.forEach( testFile => fs.unlinkSync( testFile ) )
    testDirs.forEach( testDir => fs.rmdirSync( testDir ) )
  } )
} )
