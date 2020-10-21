export function today() {
    let now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}

export function now() {
    let now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;
}

export function ffprint(text) {
    console.log(text.endsWith('\n') ? text.replace('\n', '') : text);
}
