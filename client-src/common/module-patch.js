// Runtime module patching for development/preview mode
if (process.env.NODE_ENV !== 'production') {
  // Store original import
  const originalImport = window.import;
  
  // Patch window.import to add missing exports
  window.import = async function(specifier) {
    const module = await originalImport(specifier);
    
    // Add missing exports to utils.js
    if (specifier.includes('utils.js') && !module.c) {
      console.warn(`Adding missing export 'c' to ${specifier}`);
      module.c = () => ({});
    }
    
    return module;
  };
  
  console.info('Module patching enabled for development/preview mode');
}