const chai = require( 'chai' )
const sinon = require( 'sinon' )
const sinonChai = require( 'sinon-chai' )
const childProcess = require( 'child_process' )
const fs = require( 'fs' )
const CasperSpawner = require( '../lib/casper-spawner' )

const expect = chai.expect
chai.use( sinonChai )

describe( 'Casper spawner', function(){
  const testFile = './test/.test-file'
  this.slow( 10 )

  before( 'Setup test file', function( done ) {
    fs.writeFile( testFile, '', ( err ) => {
      if ( !err ) {
        done()
      }
    } )
  } )

  describe( 'Event callbacks', function(){
    it( 'onMessage', function() {
      const casperSpawner = new CasperSpawner()
      const messageSpy = sinon.spy( )
      
      casperSpawner.onMessage( {
        toString: messageSpy
      } )

      expect( messageSpy ).to.have.been.calledOnce
    } )

    it( 'onError', function() {
      const casperSpawner = new CasperSpawner()
      const errorSpy = sinon.spy( )
      
      casperSpawner.onError( errorSpy, 'Error' )

      expect( errorSpy ).to.have.been.calledOnce.and.calledWith( 'Error', null )
    } )

    describe( 'done', function() {
      it( 'succeeds', function() {
        const casperSpawner = new CasperSpawner()
        const doneSpy = sinon.spy( )

        casperSpawner.done( doneSpy, 0 )

        expect( doneSpy ).to.have.been.calledOnce.and.calledWith( 0 )
      } )
      it( 'fails', function() {
        const casperSpawner = new CasperSpawner()
        const doneSpy = sinon.spy( )

        casperSpawner.done( doneSpy, 42 )

        expect( doneSpy ).to.have.been.calledOnce.and.calledWith( 42 )
      } )
    } )
  } )

  describe( 'Transform function', function(){
    it( 'does not call the `spawn` function when it fails (file not found)', function( done ) {
      const casperSpawner = new CasperSpawner()
      const spawnStub = sinon.stub( casperSpawner, 'spawn' )

      casperSpawner._transform( 'randomfile/that/doesn/t/exist', 'utf8', function( err, data ){
        expect( err ).to.be.instanceOf( Error )
        expect( data ).to.not.exist
        expect( spawnStub ).to.not.have.been.called 

        spawnStub.restore()
        done()
      } )
    } )

    it( 'does call the `spawn` function when the file is readable', function( done ) {
      const nextStepSpy = sinon.spy()
      const casperSpawner = new CasperSpawner()
      sinon.stub( casperSpawner, 'spawn', function( fileName, next ){
        expect( fileName ).to.equal( testFile )
        expect( nextStepSpy ).to.not.have.been.called
        next()
        expect( nextStepSpy ).to.have.been.calledOnce

        done()
      } )

      casperSpawner._transform( testFile, 'utf8', nextStepSpy )
    } )
  } )

  describe( 'Spawner', function(){
    it( 'calls the spawn library', function( ) {
      const spawnStub = sinon.stub()
      spawnStub.returns( {
        on: function(){},
        stdout: {
          on: function(){}
        },
        stderr: {
          on: function(){}
        }
      } )
      const casperSpawner = new CasperSpawner( spawnStub )

      casperSpawner.spawn( testFile, function(){ } )

      expect( spawnStub ).to.have.been.calledOnce.and.calledWith( 'casperjs' )
    } )
  } )

  after( 'Tear down test file', function( done ) {
    fs.unlink( testFile, done )
  } )
} )
