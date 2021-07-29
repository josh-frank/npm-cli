const fs = require('fs')

const filenameCli = functionToTest => `
"use strict";

const ${ functionToTest.split( "." )[ 0 ] } = require( "." );

/* eslint no-process-exit: 0 */
/* eslint global-require: 0 */

const parseFile = ( error, data ) => {
    if ( error ) {
        console.error( error );
        return;
    }
    console.log( ${ functionToTest }( data ) );
};

if ( require.main === module ) {
  let sliceN = 1;
  if ( process.argv.indexOf( module.filename ) > -1 || require( "path" ).basename( process.argv[ 1 ] ) === "parse-paths-from-svg" ) sliceN = 2;
  const args = process.argv.slice( sliceN, process.argv.length );
  if ( args.length === 0 ) {
    console.error( "You must pass an SVG file path in quotes as a parameter" );
    process.exit( 1 );
  }
  require( "fs" ).readFile( args[ 0 ], "utf8" , parseFile );
}
`;

const updatePackageDotJson = packageDotJsonToUpdate => {
  const packageScripts = packageDotJsonToUpdate.match( /"scripts":\s+{([\s]+.+)+}/gm )[ 0 ];
  let updatedPackageScripts = packageScripts + "";
  if ( !packageScripts.match( /"cli": "node index.js"/g ) ) {
    updatedPackageScript = updatedPackageScripts.replace( "}", `"cli": "node index.js"\n    },` );
  }
  return packageDotJsonToUpdate.replace( packageScripts, updatedPackageScripts );
}

const writeCliAndUpdatePackage = functionToTest => {
  fs.writeFile( "cli.js", filenameCli( functionToTest ), error => {
    if ( error ) {
      console.error( error );
      return;
    }
    fs.readFile( "package.json", "utf8", ( error, data ) => {
      if ( error ) {
        console.error( error );
        return;
      }
      fs.writeFile( "package.json", updatePackageDotJson( data ), error => {
        if ( error ) {
          console.error( error );
          return;
        }
        console.log( "CLI written successfully" );
      } );
    } );
  } );
}

if ( require.main === module ) {
  let sliceN = 1;
  if ( process.argv.indexOf( module.filename ) > -1 || require( "path" ).basename( process.argv[ 1 ] ) === "parse-paths-from-svg" ) sliceN = 2;
  const args = process.argv.slice( sliceN, process.argv.length );
  if ( args.length === 0 ) {
    console.error( "You must pass a parameter: the name of a function to test as a string" );
    process.exit( 1 );
  }
  if ( args[ 0 ].match( /(?=.*)\./g ) !== 1 ) {
    console.error( "Malformed parameter: must be a module name, period and function name, as in: 'console.log'" );
    process.exit( 1 );
  }
  writeCliAndUpdatePackage( args[ 0 ] );
}

