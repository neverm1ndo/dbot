import commandLineArgs from 'command-line-args';


// Setup command line options
const options = commandLineArgs([
  { name: 'works', defaultValue: false, alias: 'w', type: Boolean},
  { name: 'dsub', defaultValue: false, alias: 'd', type: Boolean}
]);

export default options;
