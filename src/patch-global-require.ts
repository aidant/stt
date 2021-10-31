/*
  Discord Voice expects there to be a require function in the global scope even
  tho its a dual export package. Since I am using the EcmaScript Module variant
  of the package there is no require function on the global scope. so I need to
  patch it in here. Normally this would be a terrible idea since the require
  path is relative to this file, but in this case its ok since discord js just
  uses the require function to dynamically load the encryption packages.  
*/

import { createRequire } from 'module'
globalThis.require = createRequire(import.meta.url)