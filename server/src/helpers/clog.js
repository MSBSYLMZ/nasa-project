const clog = {};

clog.blue = (...parameters)=>{
    console.log("\x1b[1m\x1b[34m%s\x1b[0m",...parameters);
}

clog.red = (...parameters)=>{
    console.log("\x1b[1m\x1b[91m%s\x1b[0m",...parameters);
}

clog.green = (...parameters)=>{
    console.log("\x1b[1m\x1b[32m%s\x1b[0m",...parameters);
}

clog.yellow = (...parameters)=>{
    console.log("\x1b[1m\x1b[33m%s\x1b[0m",...parameters);
}

clog.magenta = (...parameters)=>{
    console.log("\x1b[1m\x1b[35m%s\x1b[0m",...parameters);
}

clog.cyan = (...parameters)=>{
    console.log("\x1b[1m\x1b[36m%s\x1b[0m",...parameters);
}

clog.white = (...parameters)=>{
    console.log("\x1b[1m\x1b[37m%s\x1b[0m",...parameters);
}

clog.success = clog.green;
clog.error = clog.red;
clog.info = clog.cyan;

module.exports = clog;
