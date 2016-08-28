const { Transform } = require( 'stream' )
const chalk = require( 'chalk' )
const debug = require( 'debug' )( 'json-parser' )

class JSONParser extends Transform {

  constructor() {
    super( {
      objectMode: true 
    } )
  }

  _transform( data, encoding, done ) {
    debug( 'input type', typeof( data ) )
    debug( 'input', data )

    if ( typeof ( data ) === 'object' ) {
      return done( null, data )
    }
    if ( typeof ( data ) === 'string' ) {
      try {
        data = JSON.parse( data )
        debug( `JSON parsed: ${data}` )
        return done( null, data )
      } catch ( e ) {
        debug( `Failed at parsing JSON: ${e}` )
        return done( e, {} )
      }
    }
  }
}

module.exports = JSONParser
