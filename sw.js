caches.keys().then((e=>Promise.all(e.map((async e=>console.log("caches.delete",e,await caches.delete(e))))))).then((async()=>{console.log("registration.unregister",await registration.unregister())})).then((()=>console.log("DONE"))).catch(console.error);