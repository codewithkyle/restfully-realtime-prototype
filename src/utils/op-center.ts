function setValueFromKeypath(object, keypath, value){
    const key = keypath[0];
    keypath.splice(0, 1);
    if (keypath.length){
        setValueFromKeypath(object[key], keypath, value);
    } else {
        object[key] = value;
    }
}

function unsetValueFromKeypath(object, keypath){
    const key = keypath[0];
    keypath.splice(0, 1);
    if (keypath.length){
        unsetValueFromKeypath(object[key], keypath);
    } else {
        delete object[key];
    }
}

export { setValueFromKeypath, unsetValueFromKeypath };