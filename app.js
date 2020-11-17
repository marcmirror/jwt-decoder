"use strict";

let windowLoaded = false;

function decodeJwt() {
    const encodedJwt = document.getElementById("jwt-in").value
        .split(" ")
        .join("")
        .replace(/[\r\n]/gm, '');

    if (!encodedJwt) {
        hideEncodedJwt();
        return;
    }

    const encodedJwtArr = isValidJwt(encodedJwt);
    const jwtObjectHeader = JSON.parse(atob(prepareForBase64Decoding(encodedJwtArr[0])));
    const jwtObjectPayload = JSON.parse(atob(prepareForBase64Decoding(encodedJwtArr[1])));

    document.getElementById("jwt-out-header").innerHTML = JSON.stringify(jwtObjectHeader, null, "\t");

    const dateRegex = /((?:"iat"|"exp"):) "(.+)"/g; // Remove the double quotes around the 'iat' and 'exp' values
    document.getElementById("jwt-out-payload").innerHTML
        = JSON.stringify(jwtObjectPayload, addHumanReadableTimestamp, "\t").replace(dateRegex, '$1 $2');

    showEncodedJwt();
}

function prepareForBase64Decoding(base64UrlEncodedString) {
    let payload = base64UrlEncodedString.replace(/-/g, '+').replace(/_/g, '/');
    const pad = payload.length % 4;

    if (pad) {
        if (pad === 1) {
            throw malformedJwtException();
        }
        payload += new Array(5 - pad).join('=');
    }

    return payload;
}

function isValidJwt(encodedJwt) {
    const encodedJwtArr = encodedJwt.split(".");

    if (encodedJwtArr.length !== 3) {
        throw malformedJwtException();
    }

    setTextareaValid();

    return encodedJwtArr;
}

window.onload = function () {
    try {
        decodeJwt()
    } catch (ignore) {
    } finally {
        windowLoaded = true;
    }
}

window.onerror = (event, source, lineno, colno, error) => {
    if (error.message === malformedJwtException().message) {
        setTextareaInvalid();
        hideEncodedJwt();
    }
}

function addHumanReadableTimestamp(key, value) {
    if (key === "iat" || key === "exp") {
        const now = Math.floor((new Date().getTime()) / 1000);

        const newDate = new Date();
        newDate.setTime(value * 1000);

        let classes = "";
        if (key === "exp" && value < now) {
            classes = "expired"
        }

        return `<span class='${classes}' data-tooltip='${newDate.toString()}'>${value}</span>`;
    }

    return value;
}

function setTextareaInvalid() {
    if (windowLoaded) {
        const jwtTextarea = document.getElementById("jwt-in");
        jwtTextarea.setAttribute('aria-invalid', "true")
    }
}

function setTextareaValid() {
    const jwtTextarea = document.getElementById("jwt-in");
    jwtTextarea.setAttribute('aria-invalid', null)
}

function showEncodedJwt() {
    const jwtOut = document.getElementsByClassName("jwt-out");
    for (let jwtOutElement of jwtOut) {
        jwtOutElement.classList.remove("hidden")
    }
}

function hideEncodedJwt() {
    const jwtOut = document.getElementsByClassName("jwt-out");
    for (let jwtOutElement of jwtOut) {
        jwtOutElement.innerHTML = "";
        jwtOutElement.classList.add("hidden")
    }
}

function malformedJwtException() {
    return new Error("Malformed JWT");
}
