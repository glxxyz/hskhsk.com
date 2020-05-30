/*
    Shanka HSK Flashcards

    @license
    
    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
var util_globals = new Object();

util_globals.wait_cursor_on = false;

function WaitCursorOn() {
    if (!util_globals.wait_cursor_on) {
        util_globals.wait_cursor_on = true;
        // wait 100ms before showing wait cursor
        setTimeout(WaitCursorSwitchOnTimer, 100);
    }
}

// Switch it on straight away!
WaitCursorOn();

function WaitCursorSwitchOnTimer() {
    if (util_globals.wait_cursor_on) {
        document.getElementById("waitcursor").style.display = "inline";
        document.body.style.cursor = "wait";
    }
}

function WaitCursorOff() {
    util_globals.wait_cursor_on = false;
    document.getElementById("waitcursor").style.display = "none";
    document.body.style.cursor = "default";
}

function isEmpty(ob) {
    for (var i in ob) {
        return i == null ? false : false;
    }
    return true;
}

function contains(array, obj) {
    var i = array.indexOf(obj);
    return i != -1;
}

function is_iOS() {
    return /iP(hone|od|ad)/.test(navigator.platform);
}

function is_IE() {
    return /Trident/.test(navigator.userAgent);
}

function arrayAisSubsetOfB(arrayA, arrayB) {
    for (var i = 0, len = arrayA.length; i < len; i++) {
        if (!contains(arrayB, arrayA[i])) {
            return false;
        }
    }
    return true;
}

function arrayAEqualsB(arrayA, arrayB) {
    return arrayA.length == arrayB.length && arrayAisSubsetOfB(arrayA, arrayB);
}

function commaAndList(list) {
    var text = "";
    for (var i = 0, len = list.length; i < len; i++) {
        if (i > 0) {
            if (i == list.length - 1) {
                text += " " + STR.question_and_separator + " ";
            } else {
                text += ", ";
            }
        }
        text += list[i];
    }
    return text;
}

function LookupAtoB(inputkeys, outputvalues, keys, values) {
    for (var i = 0, len = inputkeys.length; i < len; i++) {
        var key = inputkeys[i];
        var index = keys.indexOf(key);
        if (index != -1) {
            var value = values[index];
            if (!contains(outputvalues, value)) {
                outputvalues.push(value);
            }
        }
    }
}

// internal errors can be silenced
util_globals.errors_enabled = true;

function ReportError(str) {
    // get it in the log first at least
    console.log(str);
    // delete this- at least prevent us from going back to this page when refreshing
    delete localStorage["state"];
    if (util_globals.errors_enabled) {
        if (!confirm(STR.app_generic_error + ":\n\n" + str + "\n\n" + STR.app_cancel_silences_error)) {
            util_globals.errors_enabled = false;
        }
    }
}

function ExceptionError(context, err) {
    var str = STR.app_exception_error + " (" + context + "):\n\n";
    if (err.message) str += err.message + "\n";
    if (err.stack) str += err.stack + "\n";
    // get it in the log first at least
    console.log(str);
    // delete this- at least prevent us from going back to this page when refreshing
    delete localStorage["state"];
    if (err.code === DOMException.QUOTA_EXCEEDED_ERR) {
        if (is_iOS()) {
            alert(STR.local_storage_cannot_save_ios);
        } else {
            alert(STR.local_storage_cannot_save_other);
        }
    } else {
        if (errors_enabled) {
            if (!confirm(str + STR.app_cancel_silences_error)) {
                util_globals.errors_enabled = false;
            }
        }
    }
}

function GetUserLanguage() {
    var lang = "";
    if (navigator && navigator.userAgent && (lang = navigator.userAgent.match(/android.*\W(\w\w)-(\w\w)\W/i))) {
        lang = lang[1];
    }
    if ((!lang || !lang.length) && navigator) {
        if (navigator.language) {
            lang = navigator.language;
        } else if (navigator.browserLanguage) {
            lang = navigator.browserLanguage;
        } else if (navigator.systemLanguage) {
            lang = navigator.systemLanguage;
        } else if (navigator.userLanguage) {
            lang = navigator.userLanguage;
        }
        lang = lang.substr(0, 2);
    }
    console.log("current language is", lang);
    return lang;
}

function parseWindowLocation() {
    var currentState = null;
    if (window.location.hash && window.location.hash.length > 1) {
        console.log("constructing state from hash: " + window.location.hash);
        var hashbits = window.location.hash.slice(1).split(",");
        if (hashbits.length > 0) {
            currentState = {
                section: hashbits[0]
            };
        }
        for (var i = 1; i < hashbits.length; i++) {
            var parms = hashbits[i].split("=");
            if (parms.length == 2) {
                currentState[parms[0]] = parms[1];
            }
        }
        console.log("constructed state: " + JSON.stringify(currentState));
    }
    return currentState;
}

/* Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
* @license
* This work is free. You can redistribute it and/or modify it
* under the terms of the WTFPL, Version 2
* For more information see LICENSE.txt or http://www.wtfpl.net/
*
* For more information, the home page:
* http://pieroxy.net/blog/pages/lz-string/testing.html
*
* LZ-based compression algorithm, version 1.3.3 */
var LZString = {
    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    _f: String.fromCharCode,
    compressToBase64: function(input) {
        if (input == null) return "";
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = LZString.compress(input);
        while (i < input.length * 2) {
            if (i % 2 == 0) {
                chr1 = input.charCodeAt(i / 2) >> 8;
                chr2 = input.charCodeAt(i / 2) & 255;
                if (i / 2 + 1 < input.length) chr3 = input.charCodeAt(i / 2 + 1) >> 8; else chr3 = NaN;
            } else {
                chr1 = input.charCodeAt((i - 1) / 2) & 255;
                if ((i + 1) / 2 < input.length) {
                    chr2 = input.charCodeAt((i + 1) / 2) >> 8;
                    chr3 = input.charCodeAt((i + 1) / 2) & 255;
                } else chr2 = chr3 = NaN;
            }
            i += 3;
            enc1 = chr1 >> 2;
            enc2 = (chr1 & 3) << 4 | chr2 >> 4;
            enc3 = (chr2 & 15) << 2 | chr3 >> 6;
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + LZString._keyStr.charAt(enc1) + LZString._keyStr.charAt(enc2) + LZString._keyStr.charAt(enc3) + LZString._keyStr.charAt(enc4);
        }
        return output;
    },
    decompressFromBase64: function(input) {
        if (input == null) return "";
        var output = "", ol = 0, output_, chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0, f = LZString._f;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = LZString._keyStr.indexOf(input.charAt(i++));
            enc2 = LZString._keyStr.indexOf(input.charAt(i++));
            enc3 = LZString._keyStr.indexOf(input.charAt(i++));
            enc4 = LZString._keyStr.indexOf(input.charAt(i++));
            chr1 = enc1 << 2 | enc2 >> 4;
            chr2 = (enc2 & 15) << 4 | enc3 >> 2;
            chr3 = (enc3 & 3) << 6 | enc4;
            if (ol % 2 == 0) {
                output_ = chr1 << 8;
                if (enc3 != 64) {
                    output += f(output_ | chr2);
                }
                if (enc4 != 64) {
                    output_ = chr3 << 8;
                }
            } else {
                output = output + f(output_ | chr1);
                if (enc3 != 64) {
                    output_ = chr2 << 8;
                }
                if (enc4 != 64) {
                    output += f(output_ | chr3);
                }
            }
            ol += 3;
        }
        return LZString.decompress(output);
    },
    compressToUTF16: function(input) {
        if (input == null) return "";
        var output = "", i, c, current, status = 0, f = LZString._f;
        input = LZString.compress(input);
        for (i = 0; i < input.length; i++) {
            c = input.charCodeAt(i);
            switch (status++) {
              case 0:
                output += f((c >> 1) + 32);
                current = (c & 1) << 14;
                break;

              case 1:
                output += f(current + (c >> 2) + 32);
                current = (c & 3) << 13;
                break;

              case 2:
                output += f(current + (c >> 3) + 32);
                current = (c & 7) << 12;
                break;

              case 3:
                output += f(current + (c >> 4) + 32);
                current = (c & 15) << 11;
                break;

              case 4:
                output += f(current + (c >> 5) + 32);
                current = (c & 31) << 10;
                break;

              case 5:
                output += f(current + (c >> 6) + 32);
                current = (c & 63) << 9;
                break;

              case 6:
                output += f(current + (c >> 7) + 32);
                current = (c & 127) << 8;
                break;

              case 7:
                output += f(current + (c >> 8) + 32);
                current = (c & 255) << 7;
                break;

              case 8:
                output += f(current + (c >> 9) + 32);
                current = (c & 511) << 6;
                break;

              case 9:
                output += f(current + (c >> 10) + 32);
                current = (c & 1023) << 5;
                break;

              case 10:
                output += f(current + (c >> 11) + 32);
                current = (c & 2047) << 4;
                break;

              case 11:
                output += f(current + (c >> 12) + 32);
                current = (c & 4095) << 3;
                break;

              case 12:
                output += f(current + (c >> 13) + 32);
                current = (c & 8191) << 2;
                break;

              case 13:
                output += f(current + (c >> 14) + 32);
                current = (c & 16383) << 1;
                break;

              case 14:
                output += f(current + (c >> 15) + 32, (c & 32767) + 32);
                status = 0;
                break;
            }
        }
        return output + f(current + 32);
    },
    decompressFromUTF16: function(input) {
        if (input == null) return "";
        var output = "", current, c, status = 0, i = 0, f = LZString._f;
        while (i < input.length) {
            c = input.charCodeAt(i) - 32;
            switch (status++) {
              case 0:
                current = c << 1;
                break;

              case 1:
                output += f(current | c >> 14);
                current = (c & 16383) << 2;
                break;

              case 2:
                output += f(current | c >> 13);
                current = (c & 8191) << 3;
                break;

              case 3:
                output += f(current | c >> 12);
                current = (c & 4095) << 4;
                break;

              case 4:
                output += f(current | c >> 11);
                current = (c & 2047) << 5;
                break;

              case 5:
                output += f(current | c >> 10);
                current = (c & 1023) << 6;
                break;

              case 6:
                output += f(current | c >> 9);
                current = (c & 511) << 7;
                break;

              case 7:
                output += f(current | c >> 8);
                current = (c & 255) << 8;
                break;

              case 8:
                output += f(current | c >> 7);
                current = (c & 127) << 9;
                break;

              case 9:
                output += f(current | c >> 6);
                current = (c & 63) << 10;
                break;

              case 10:
                output += f(current | c >> 5);
                current = (c & 31) << 11;
                break;

              case 11:
                output += f(current | c >> 4);
                current = (c & 15) << 12;
                break;

              case 12:
                output += f(current | c >> 3);
                current = (c & 7) << 13;
                break;

              case 13:
                output += f(current | c >> 2);
                current = (c & 3) << 14;
                break;

              case 14:
                output += f(current | c >> 1);
                current = (c & 1) << 15;
                break;

              case 15:
                output += f(current | c);
                status = 0;
                break;
            }
            i++;
        }
        return LZString.decompress(output);
    },
    compress: function(uncompressed) {
        if (uncompressed == null) return "";
        var i, value, context_dictionary = {}, context_dictionaryToCreate = {}, context_c = "", context_wc = "", context_w = "", context_enlargeIn = 2, // Compensate for the first entry which should not count
        context_dictSize = 3, context_numBits = 2, context_data_string = "", context_data_val = 0, context_data_position = 0, ii, f = LZString._f;
        for (ii = 0; ii < uncompressed.length; ii += 1) {
            context_c = uncompressed.charAt(ii);
            if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
                context_dictionary[context_c] = context_dictSize++;
                context_dictionaryToCreate[context_c] = true;
            }
            context_wc = context_w + context_c;
            if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
                context_w = context_wc;
            } else {
                if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                    if (context_w.charCodeAt(0) < 256) {
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = context_data_val << 1;
                            if (context_data_position == 15) {
                                context_data_position = 0;
                                context_data_string += f(context_data_val);
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 8; i++) {
                            context_data_val = context_data_val << 1 | value & 1;
                            if (context_data_position == 15) {
                                context_data_position = 0;
                                context_data_string += f(context_data_val);
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    } else {
                        value = 1;
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = context_data_val << 1 | value;
                            if (context_data_position == 15) {
                                context_data_position = 0;
                                context_data_string += f(context_data_val);
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = 0;
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 16; i++) {
                            context_data_val = context_data_val << 1 | value & 1;
                            if (context_data_position == 15) {
                                context_data_position = 0;
                                context_data_string += f(context_data_val);
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    }
                    context_enlargeIn--;
                    if (context_enlargeIn == 0) {
                        context_enlargeIn = Math.pow(2, context_numBits);
                        context_numBits++;
                    }
                    delete context_dictionaryToCreate[context_w];
                } else {
                    value = context_dictionary[context_w];
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = context_data_val << 1 | value & 1;
                        if (context_data_position == 15) {
                            context_data_position = 0;
                            context_data_string += f(context_data_val);
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
                // Add wc to the dictionary.
                context_dictionary[context_wc] = context_dictSize++;
                context_w = String(context_c);
            }
        }
        // Output the code for w.
        if (context_w !== "") {
            if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                if (context_w.charCodeAt(0) < 256) {
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = context_data_val << 1;
                        if (context_data_position == 15) {
                            context_data_position = 0;
                            context_data_string += f(context_data_val);
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                    }
                    value = context_w.charCodeAt(0);
                    for (i = 0; i < 8; i++) {
                        context_data_val = context_data_val << 1 | value & 1;
                        if (context_data_position == 15) {
                            context_data_position = 0;
                            context_data_string += f(context_data_val);
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                } else {
                    value = 1;
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = context_data_val << 1 | value;
                        if (context_data_position == 15) {
                            context_data_position = 0;
                            context_data_string += f(context_data_val);
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = 0;
                    }
                    value = context_w.charCodeAt(0);
                    for (i = 0; i < 16; i++) {
                        context_data_val = context_data_val << 1 | value & 1;
                        if (context_data_position == 15) {
                            context_data_position = 0;
                            context_data_string += f(context_data_val);
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
                delete context_dictionaryToCreate[context_w];
            } else {
                value = context_dictionary[context_w];
                for (i = 0; i < context_numBits; i++) {
                    context_data_val = context_data_val << 1 | value & 1;
                    if (context_data_position == 15) {
                        context_data_position = 0;
                        context_data_string += f(context_data_val);
                        context_data_val = 0;
                    } else {
                        context_data_position++;
                    }
                    value = value >> 1;
                }
            }
            context_enlargeIn--;
            if (context_enlargeIn == 0) {
                context_enlargeIn = Math.pow(2, context_numBits);
                context_numBits++;
            }
        }
        // Mark the end of the stream
        value = 2;
        for (i = 0; i < context_numBits; i++) {
            context_data_val = context_data_val << 1 | value & 1;
            if (context_data_position == 15) {
                context_data_position = 0;
                context_data_string += f(context_data_val);
                context_data_val = 0;
            } else {
                context_data_position++;
            }
            value = value >> 1;
        }
        // Flush the last char
        while (true) {
            context_data_val = context_data_val << 1;
            if (context_data_position == 15) {
                context_data_string += f(context_data_val);
                break;
            } else context_data_position++;
        }
        return context_data_string;
    },
    decompress: function(compressed) {
        if (compressed == null) return "";
        if (compressed == "") return null;
        var dictionary = [], next, enlargeIn = 4, dictSize = 4, numBits = 3, entry = "", result = "", i, w, bits, resb, maxpower, power, c, f = LZString._f, data = {
            string: compressed,
            val: compressed.charCodeAt(0),
            position: 32768,
            index: 1
        };
        for (i = 0; i < 3; i += 1) {
            dictionary[i] = i;
        }
        bits = 0;
        maxpower = Math.pow(2, 2);
        power = 1;
        while (power != maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
                data.position = 32768;
                data.val = data.string.charCodeAt(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
        }
        switch (next = bits) {
          case 0:
            bits = 0;
            maxpower = Math.pow(2, 8);
            power = 1;
            while (power != maxpower) {
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position == 0) {
                    data.position = 32768;
                    data.val = data.string.charCodeAt(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
            }
            c = f(bits);
            break;

          case 1:
            bits = 0;
            maxpower = Math.pow(2, 16);
            power = 1;
            while (power != maxpower) {
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position == 0) {
                    data.position = 32768;
                    data.val = data.string.charCodeAt(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
            }
            c = f(bits);
            break;

          case 2:
            return "";
        }
        dictionary[3] = c;
        w = result = c;
        while (true) {
            if (data.index > data.string.length) {
                return "";
            }
            bits = 0;
            maxpower = Math.pow(2, numBits);
            power = 1;
            while (power != maxpower) {
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position == 0) {
                    data.position = 32768;
                    data.val = data.string.charCodeAt(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
            }
            switch (c = bits) {
              case 0:
                bits = 0;
                maxpower = Math.pow(2, 8);
                power = 1;
                while (power != maxpower) {
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = 32768;
                        data.val = data.string.charCodeAt(data.index++);
                    }
                    bits |= (resb > 0 ? 1 : 0) * power;
                    power <<= 1;
                }
                dictionary[dictSize++] = f(bits);
                c = dictSize - 1;
                enlargeIn--;
                break;

              case 1:
                bits = 0;
                maxpower = Math.pow(2, 16);
                power = 1;
                while (power != maxpower) {
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = 32768;
                        data.val = data.string.charCodeAt(data.index++);
                    }
                    bits |= (resb > 0 ? 1 : 0) * power;
                    power <<= 1;
                }
                dictionary[dictSize++] = f(bits);
                c = dictSize - 1;
                enlargeIn--;
                break;

              case 2:
                return result;
            }
            if (enlargeIn == 0) {
                enlargeIn = Math.pow(2, numBits);
                numBits++;
            }
            if (dictionary[c]) {
                entry = dictionary[c];
            } else {
                if (c === dictSize) {
                    entry = w + w.charAt(0);
                } else {
                    return null;
                }
            }
            result += entry;
            // Add w+entry[0] to the dictionary.
            dictionary[dictSize++] = w + entry.charAt(0);
            enlargeIn--;
            w = entry;
            if (enlargeIn == 0) {
                enlargeIn = Math.pow(2, numBits);
                numBits++;
            }
        }
    }
};

if (typeof module !== "undefined" && module != null) {
    module.exports = LZString;
}

/**
 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
 *
 * @version 0.6.11
 * @codingstandard ftlabs-jsv2
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license MIT License (see LICENSE.txt)
 */
/*jslint browser:true, node:true*/
/*global define, Event, Node*/
/**
 * Instantiate fast-clicking listeners on the specificed layer.
 *
 * @constructor
 * @param {Element} layer The layer to listen on
 */
function FastClick(layer) {
    "use strict";
    var oldOnClick, self = this;
    /**
	 * Whether a click is currently being tracked.
	 *
	 * @type boolean
	 */
    this.trackingClick = false;
    /**
	 * Timestamp for when when click tracking started.
	 *
	 * @type number
	 */
    this.trackingClickStart = 0;
    /**
	 * The element being tracked for a click.
	 *
	 * @type EventTarget
	 */
    this.targetElement = null;
    /**
	 * X-coordinate of touch start event.
	 *
	 * @type number
	 */
    this.touchStartX = 0;
    /**
	 * Y-coordinate of touch start event.
	 *
	 * @type number
	 */
    this.touchStartY = 0;
    /**
	 * ID of the last touch, retrieved from Touch.identifier.
	 *
	 * @type number
	 */
    this.lastTouchIdentifier = 0;
    /**
	 * Touchmove boundary, beyond which a click will be cancelled.
	 *
	 * @type number
	 */
    this.touchBoundary = 10;
    /**
	 * The FastClick layer.
	 *
	 * @type Element
	 */
    this.layer = layer;
    if (!layer || !layer.nodeType) {
        throw new TypeError("Layer must be a document node");
    }
    /** @type function() */
    this.onClick = function() {
        return FastClick.prototype.onClick.apply(self, arguments);
    };
    /** @type function() */
    this.onMouse = function() {
        return FastClick.prototype.onMouse.apply(self, arguments);
    };
    /** @type function() */
    this.onTouchStart = function() {
        return FastClick.prototype.onTouchStart.apply(self, arguments);
    };
    /** @type function() */
    this.onTouchMove = function() {
        return FastClick.prototype.onTouchMove.apply(self, arguments);
    };
    /** @type function() */
    this.onTouchEnd = function() {
        return FastClick.prototype.onTouchEnd.apply(self, arguments);
    };
    /** @type function() */
    this.onTouchCancel = function() {
        return FastClick.prototype.onTouchCancel.apply(self, arguments);
    };
    if (FastClick.notNeeded(layer)) {
        return;
    }
    // Set up event handlers as required
    if (this.deviceIsAndroid) {
        layer.addEventListener("mouseover", this.onMouse, true);
        layer.addEventListener("mousedown", this.onMouse, true);
        layer.addEventListener("mouseup", this.onMouse, true);
    }
    layer.addEventListener("click", this.onClick, true);
    layer.addEventListener("touchstart", this.onTouchStart, false);
    layer.addEventListener("touchmove", this.onTouchMove, false);
    layer.addEventListener("touchend", this.onTouchEnd, false);
    layer.addEventListener("touchcancel", this.onTouchCancel, false);
    // Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
    // which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
    // layer when they are cancelled.
    if (!Event.prototype.stopImmediatePropagation) {
        layer.removeEventListener = function(type, callback, capture) {
            var rmv = Node.prototype.removeEventListener;
            if (type === "click") {
                rmv.call(layer, type, callback.hijacked || callback, capture);
            } else {
                rmv.call(layer, type, callback, capture);
            }
        };
        layer.addEventListener = function(type, callback, capture) {
            var adv = Node.prototype.addEventListener;
            if (type === "click") {
                adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
                    if (!event.propagationStopped) {
                        callback(event);
                    }
                }), capture);
            } else {
                adv.call(layer, type, callback, capture);
            }
        };
    }
    // If a handler is already declared in the element's onclick attribute, it will be fired before
    // FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
    // adding it as listener.
    if (typeof layer.onclick === "function") {
        // Android browser on at least 3.2 requires a new reference to the function in layer.onclick
        // - the old one won't work if passed to addEventListener directly.
        oldOnClick = layer.onclick;
        layer.addEventListener("click", function(event) {
            oldOnClick(event);
        }, false);
        layer.onclick = null;
    }
}

/**
 * Android requires exceptions.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsAndroid = navigator.userAgent.indexOf("Android") > 0;

/**
 * iOS requires exceptions.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);

/**
 * iOS 4 requires an exception for select elements.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOS4 = FastClick.prototype.deviceIsIOS && /OS 4_\d(_\d)?/.test(navigator.userAgent);

/**
 * iOS 6.0(+?) requires the target element to be manually derived
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOSWithBadTarget = FastClick.prototype.deviceIsIOS && /OS ([6-9]|\d{2})_\d/.test(navigator.userAgent);

/**
 * Determine whether a given element requires a native click.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element needs a native click
 */
FastClick.prototype.needsClick = function(target) {
    "use strict";
    switch (target.nodeName.toLowerCase()) {
      // Don't send a synthetic click to disabled inputs (issue #62)
        case "button":
      case "select":
      case "textarea":
        if (target.disabled) {
            return true;
        }
        break;

      case "input":
        // File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
        if (this.deviceIsIOS && target.type === "file" || target.disabled) {
            return true;
        }
        break;

      case "label":
      case "video":
        return true;
    }
    return /\bneedsclick\b/.test(target.className);
};

/**
 * Determine whether a given element requires a call to focus to simulate click into element.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
 */
FastClick.prototype.needsFocus = function(target) {
    "use strict";
    switch (target.nodeName.toLowerCase()) {
      case "textarea":
        return true;

      case "select":
        return !this.deviceIsAndroid;

      case "input":
        switch (target.type) {
          case "button":
          case "checkbox":
          case "file":
          case "image":
          case "radio":
          case "submit":
            return false;
        }
        // No point in attempting to focus disabled inputs
        return !target.disabled && !target.readOnly;

      default:
        return /\bneedsfocus\b/.test(target.className);
    }
};

/**
 * Send a click event to the specified element.
 *
 * @param {EventTarget|Element} targetElement
 * @param {Event} event
 */
FastClick.prototype.sendClick = function(targetElement, event) {
    "use strict";
    var clickEvent, touch;
    // On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
    if (document.activeElement && document.activeElement !== targetElement) {
        document.activeElement.blur();
    }
    touch = event.changedTouches[0];
    // Synthesise a click event, with an extra attribute so it can be tracked
    clickEvent = document.createEvent("MouseEvents");
    clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
    clickEvent.forwardedTouchEvent = true;
    targetElement.dispatchEvent(clickEvent);
};

FastClick.prototype.determineEventType = function(targetElement) {
    "use strict";
    //Issue #159: Android Chrome Select Box does not open with a synthetic click event
    if (this.deviceIsAndroid && targetElement.tagName.toLowerCase() === "select") {
        return "mousedown";
    }
    return "click";
};

/**
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.focus = function(targetElement) {
    "use strict";
    var length;
    // Issue #160: on iOS 7, some input elements (e.g. date datetime) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
    if (this.deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf("date") !== 0 && targetElement.type !== "time") {
        length = targetElement.value.length;
        targetElement.setSelectionRange(length, length);
    } else {
        targetElement.focus();
    }
};

/**
 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
 *
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.updateScrollParent = function(targetElement) {
    "use strict";
    var scrollParent, parentElement;
    scrollParent = targetElement.fastClickScrollParent;
    // Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
    // target element was moved to another parent.
    if (!scrollParent || !scrollParent.contains(targetElement)) {
        parentElement = targetElement;
        do {
            if (parentElement.scrollHeight > parentElement.offsetHeight) {
                scrollParent = parentElement;
                targetElement.fastClickScrollParent = parentElement;
                break;
            }
            parentElement = parentElement.parentElement;
        } while (parentElement);
    }
    // Always update the scroll top tracker if possible.
    if (scrollParent) {
        scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
    }
};

/**
 * @param {EventTarget} targetElement
 * @returns {Element|EventTarget}
 */
FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
    "use strict";
    // On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
    if (eventTarget.nodeType === Node.TEXT_NODE) {
        return eventTarget.parentNode;
    }
    return eventTarget;
};

/**
 * On touch start, record the position and scroll offset.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchStart = function(event) {
    "use strict";
    var targetElement, touch, selection;
    // Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
    if (event.targetTouches.length > 1) {
        return true;
    }
    targetElement = this.getTargetElementFromEventTarget(event.target);
    touch = event.targetTouches[0];
    if (this.deviceIsIOS) {
        // Only trusted events will deselect text on iOS (issue #49)
        selection = window.getSelection();
        if (selection.rangeCount && !selection.isCollapsed) {
            return true;
        }
        if (!this.deviceIsIOS4) {
            // Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
            // when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
            // with the same identifier as the touch event that previously triggered the click that triggered the alert.
            // Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
            // immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
            if (touch.identifier === this.lastTouchIdentifier) {
                event.preventDefault();
                return false;
            }
            this.lastTouchIdentifier = touch.identifier;
            // If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
            // 1) the user does a fling scroll on the scrollable layer
            // 2) the user stops the fling scroll with another tap
            // then the event.target of the last 'touchend' event will be the element that was under the user's finger
            // when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
            // is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
            this.updateScrollParent(targetElement);
        }
    }
    this.trackingClick = true;
    this.trackingClickStart = event.timeStamp;
    this.targetElement = targetElement;
    this.touchStartX = touch.pageX;
    this.touchStartY = touch.pageY;
    // Prevent phantom clicks on fast double-tap (issue #36)
    if (event.timeStamp - this.lastClickTime < 200) {
        event.preventDefault();
    }
    return true;
};

/**
 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.touchHasMoved = function(event) {
    "use strict";
    var touch = event.changedTouches[0], boundary = this.touchBoundary;
    if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
        return true;
    }
    return false;
};

/**
 * Update the last position.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchMove = function(event) {
    "use strict";
    if (!this.trackingClick) {
        return true;
    }
    // If the touch has moved, cancel the click tracking
    if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
        this.trackingClick = false;
        this.targetElement = null;
    }
    return true;
};

/**
 * Attempt to find the labelled control for the given label element.
 *
 * @param {EventTarget|HTMLLabelElement} labelElement
 * @returns {Element|null}
 */
FastClick.prototype.findControl = function(labelElement) {
    "use strict";
    // Fast path for newer browsers supporting the HTML5 control attribute
    if (labelElement.control !== undefined) {
        return labelElement.control;
    }
    // All browsers under test that support touch events also support the HTML5 htmlFor attribute
    if (labelElement.htmlFor) {
        return document.getElementById(labelElement.htmlFor);
    }
    // If no for attribute exists, attempt to retrieve the first labellable descendant element
    // the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
    return labelElement.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea");
};

/**
 * On touch end, determine whether to send a click event at once.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchEnd = function(event) {
    "use strict";
    var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;
    if (!this.trackingClick) {
        return true;
    }
    // Prevent phantom clicks on fast double-tap (issue #36)
    if (event.timeStamp - this.lastClickTime < 200) {
        this.cancelNextClick = true;
        return true;
    }
    // Reset to prevent wrong click cancel on input (issue #156).
    this.cancelNextClick = false;
    this.lastClickTime = event.timeStamp;
    trackingClickStart = this.trackingClickStart;
    this.trackingClick = false;
    this.trackingClickStart = 0;
    // On some iOS devices, the targetElement supplied with the event is invalid if the layer
    // is performing a transition or scroll, and has to be re-detected manually. Note that
    // for this to function correctly, it must be called *after* the event target is checked!
    // See issue #57; also filed as rdar://13048589 .
    if (this.deviceIsIOSWithBadTarget) {
        touch = event.changedTouches[0];
        // In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
        targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
        targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
    }
    targetTagName = targetElement.tagName.toLowerCase();
    if (targetTagName === "label") {
        forElement = this.findControl(targetElement);
        if (forElement) {
            this.focus(targetElement);
            if (this.deviceIsAndroid) {
                return false;
            }
            targetElement = forElement;
        }
    } else if (this.needsFocus(targetElement)) {
        // Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
        // Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
        if (event.timeStamp - trackingClickStart > 100 || this.deviceIsIOS && window.top !== window && targetTagName === "input") {
            this.targetElement = null;
            return false;
        }
        this.focus(targetElement);
        // Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
        if (!this.deviceIsIOS4 || targetTagName !== "select") {
            this.targetElement = null;
            event.preventDefault();
        }
        return false;
    }
    if (this.deviceIsIOS && !this.deviceIsIOS4) {
        // Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
        // and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
        scrollParent = targetElement.fastClickScrollParent;
        if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
            return true;
        }
    }
    // Prevent the actual click from going though - unless the target node is marked as requiring
    // real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
    if (!this.needsClick(targetElement)) {
        event.preventDefault();
        this.sendClick(targetElement, event);
    }
    return false;
};

/**
 * On touch cancel, stop tracking the click.
 *
 * @returns {void}
 */
FastClick.prototype.onTouchCancel = function() {
    "use strict";
    this.trackingClick = false;
    this.targetElement = null;
};

/**
 * Determine mouse events which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onMouse = function(event) {
    "use strict";
    // If a target element was never set (because a touch event was never fired) allow the event
    if (!this.targetElement) {
        return true;
    }
    if (event.forwardedTouchEvent) {
        return true;
    }
    // Programmatically generated events targeting a specific element should be permitted
    if (!event.cancelable) {
        return true;
    }
    // Derive and check the target element to see whether the mouse event needs to be permitted;
    // unless explicitly enabled, prevent non-touch click events from triggering actions,
    // to prevent ghost/doubleclicks.
    if (!this.needsClick(this.targetElement) || this.cancelNextClick) {
        // Prevent any user-added listeners declared on FastClick element from being fired.
        if (event.stopImmediatePropagation) {
            event.stopImmediatePropagation();
        } else {
            // Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
            event.propagationStopped = true;
        }
        // Cancel the event
        event.stopPropagation();
        event.preventDefault();
        return false;
    }
    // If the mouse event is permitted, return true for the action to go through.
    return true;
};

/**
 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
 * an actual click which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onClick = function(event) {
    "use strict";
    var permitted;
    // It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
    if (this.trackingClick) {
        this.targetElement = null;
        this.trackingClick = false;
        return true;
    }
    // Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
    if (event.target.type === "submit" && event.detail === 0) {
        return true;
    }
    permitted = this.onMouse(event);
    // Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
    if (!permitted) {
        this.targetElement = null;
    }
    // If clicks are permitted, return true for the action to go through.
    return permitted;
};

/**
 * Remove all FastClick's event listeners.
 *
 * @returns {void}
 */
FastClick.prototype.destroy = function() {
    "use strict";
    var layer = this.layer;
    if (this.deviceIsAndroid) {
        layer.removeEventListener("mouseover", this.onMouse, true);
        layer.removeEventListener("mousedown", this.onMouse, true);
        layer.removeEventListener("mouseup", this.onMouse, true);
    }
    layer.removeEventListener("click", this.onClick, true);
    layer.removeEventListener("touchstart", this.onTouchStart, false);
    layer.removeEventListener("touchmove", this.onTouchMove, false);
    layer.removeEventListener("touchend", this.onTouchEnd, false);
    layer.removeEventListener("touchcancel", this.onTouchCancel, false);
};

/**
 * Check whether FastClick is needed.
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.notNeeded = function(layer) {
    "use strict";
    var metaViewport;
    var chromeVersion;
    // Devices that don't support touch don't need FastClick
    if (typeof window.ontouchstart === "undefined") {
        return true;
    }
    // Chrome version - zero for other browsers
    chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [ , 0 ])[1];
    if (chromeVersion) {
        if (FastClick.prototype.deviceIsAndroid) {
            metaViewport = document.querySelector("meta[name=viewport]");
            if (metaViewport) {
                // Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
                if (metaViewport.content.indexOf("user-scalable=no") !== -1) {
                    return true;
                }
                // Chrome 32 and above with width=device-width or less don't need FastClick
                if (chromeVersion > 31 && window.innerWidth <= window.screen.width) {
                    return true;
                }
            }
        } else {
            return true;
        }
    }
    // IE10 with -ms-touch-action: none, which disables double-tap-to-zoom (issue #97)
    if (layer.style.msTouchAction === "none") {
        return true;
    }
    return false;
};

/**
 * Factory method for creating a FastClick object
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.attach = function(layer) {
    "use strict";
    return new FastClick(layer);
};

if (typeof define !== "undefined" && define.amd) {
    // AMD. Register as an anonymous module.
    define(function() {
        "use strict";
        return FastClick;
    });
} else if (typeof module !== "undefined" && module.exports) {
    module.exports = FastClick.attach;
    module.exports.FastClick = FastClick;
} else {
    window.FastClick = FastClick;
}

/*
 * AppScroll.js
 *
 * @license
 * Copyright 2013, Jacob Kelley - http://jakiestfu.com/
 * Released under the MIT Licence
 * http://opensource.org/licenses/MIT
 *
 * Github:  https://github.com/jakiestfu/AppScroll
 * Version: 1.0.0
 */
/*jslint browser: true*/
/*global define, module, ender*/
(function(win) {
    "use strict";
    var AppScroll = function(elements) {
        var cache = {
            toolbar: null,
            scroller: null
        }, touchable = function(fn) {
            if ("ontouchstart" in window && typeof fn === "function") {
                fn.call();
            }
        }, events = {
            listen: function() {
                if (cache.scroller) {
                    cache.scroller.addEventListener("touchend", events._touchEnd);
                    cache.scroller.addEventListener("scroll", events._endScroll);
                }
                if (cache.toolbar) {
                    cache.toolbar.addEventListener("touchmove", events._touchMove);
                }
                events._touchEnd();
                events._endScroll();
            },
            noListen: function() {
                if (cache.scroller) {
                    cache.scroller.removeEventListener("touchend", events._touchEnd);
                    cache.scroller.removeEventListener("scroll", events._endScroll);
                }
                if (cache.toolbar) {
                    cache.toolbar.removeEventListener("touchmove", events._touchMove);
                }
            },
            _touchMove: function(e) {
                e.preventDefault();
            },
            _touchEnd: function() {
                cache.listenForScroll = true;
            },
            _endScroll: function() {
                if (cache.scroller && cache.listenForScroll) {
                    var height = parseInt(win.getComputedStyle(cache.scroller).height, 10);
                    if (cache.scroller.scrollTop + height === height) {
                        cache.scroller.scrollTop = 1;
                        cache.listenForScroll = false;
                    } else if (cache.scroller.scrollTop + height === cache.scroller.scrollHeight) {
                        cache.scroller.scrollTop -= 1;
                    }
                } else {
                    cache.listenForScroll = false;
                }
            }
        }, init = function(elements) {
            touchable(function() {
                cache = elements;
                events.listen();
            });
        };
        this.on = function() {
            touchable(function() {
                events.noListen();
                events.listen();
            });
        };
        this.off = function() {
            touchable(events.noListen);
        };
        init(elements);
    };
    if (typeof module !== "undefined" && module.exports) {
        module.exports = AppScroll;
    }
    if (typeof ender === "undefined") {
        this.AppScroll = AppScroll;
    }
    if (typeof define === "function" && define.amd) {
        define("AppScroll", [], function() {
            return AppScroll;
        });
    }
}).call(this, window);

/**
 * jscolor, JavaScript Color Picker
 *
 * @version 1.4.2
 * @license GNU Lesser General Public License, http://www.gnu.org/copyleft/lesser.html
 * @author  Jan Odvarko, http://odvarko.cz
 * @created 2008-06-15
 * @updated 2013-11-25
 * @link    http://jscolor.com
 */
var jscolor = {
    dir: "",
    // location of jscolor directory (leave empty to autodetect)
    bindClass: "color",
    // class name
    binding: true,
    // automatic binding via <input class="...">
    preloading: true,
    // use image preloading?
    install: function() {
        jscolor.addEvent(window, "load", jscolor.init);
    },
    init: function() {
        if (jscolor.binding) {
            jscolor.bind();
        }
        if (jscolor.preloading) {
            jscolor.preload();
        }
    },
    getDir: function() {
        return "res/";
    },
    detectDir: function() {
        var base = location.href;
        var e = document.getElementsByTagName("base");
        for (var i = 0; i < e.length; i += 1) {
            if (e[i].href) {
                base = e[i].href;
            }
        }
        var e = document.getElementsByTagName("script");
        for (var i = 0; i < e.length; i += 1) {
            if (e[i].src && /(^|\/)jscolor\.js([?#].*)?$/i.test(e[i].src)) {
                var src = new jscolor.URI(e[i].src);
                var srcAbs = src.toAbsolute(base);
                srcAbs.path = srcAbs.path.replace(/[^\/]+$/, "");
                // remove filename
                srcAbs.query = null;
                srcAbs.fragment = null;
                return srcAbs.toString();
            }
        }
        return false;
    },
    bind: function() {
        var matchClass = new RegExp("(^|\\s)(" + jscolor.bindClass + ")\\s*(\\{[^}]*\\})?", "i");
        var e = document.getElementsByTagName("input");
        for (var i = 0; i < e.length; i += 1) {
            var m;
            if (!e[i].color && e[i].className && (m = e[i].className.match(matchClass))) {
                var prop = {};
                if (m[3]) {
                    try {
                        prop = new Function("return (" + m[3] + ")")();
                    } catch (eInvalidProp) {
                        eInvalidProp;
                    }
                }
                e[i].color = new jscolor.color(e[i], prop);
            }
        }
    },
    preload: function() {
        for (var fn in jscolor.imgRequire) {
            if (jscolor.imgRequire.hasOwnProperty(fn)) {
                jscolor.loadImage(fn);
            }
        }
    },
    images: {
        pad: [ 181, 101 ],
        sld: [ 16, 101 ],
        cross: [ 15, 15 ],
        arrow: [ 7, 11 ]
    },
    imgRequire: {},
    imgLoaded: {},
    requireImage: function(filename) {
        jscolor.imgRequire[filename] = true;
    },
    loadImage: function(filename) {
        if (!jscolor.imgLoaded[filename]) {
            jscolor.imgLoaded[filename] = new Image();
            jscolor.imgLoaded[filename].src = jscolor.getDir() + filename;
        }
    },
    fetchElement: function(mixed) {
        return typeof mixed === "string" ? document.getElementById(mixed) : mixed;
    },
    addEvent: function(el, evnt, func) {
        if (el.addEventListener) {
            el.addEventListener(evnt, func, false);
        } else if (el.attachEvent) {
            el.attachEvent("on" + evnt, func);
        }
    },
    fireEvent: function(el, evnt) {
        if (!el) {
            return;
        }
        if (document.createEvent) {
            var ev = document.createEvent("HTMLEvents");
            ev.initEvent(evnt, true, true);
            el.dispatchEvent(ev);
        } else if (document.createEventObject) {
            var ev = document.createEventObject();
            el.fireEvent("on" + evnt, ev);
        } else if (el["on" + evnt]) {
            // alternatively use the traditional event model (IE5)
            el["on" + evnt]();
        }
    },
    getElementPos: function(e) {
        var e1 = e, e2 = e;
        var x = 0, y = 0;
        if (e1.offsetParent) {
            do {
                x += e1.offsetLeft;
                y += e1.offsetTop;
            } while (e1 = e1.offsetParent);
        }
        while ((e2 = e2.parentNode) && e2.nodeName.toUpperCase() !== "BODY") {
            x -= e2.scrollLeft;
            y -= e2.scrollTop;
        }
        return [ x, y ];
    },
    getElementSize: function(e) {
        return [ e.offsetWidth, e.offsetHeight ];
    },
    getRelMousePos: function(e) {
        var x = 0, y = 0;
        if (!e) {
            e = window.event;
        }
        if (typeof e.offsetX === "number") {
            x = e.offsetX;
            y = e.offsetY;
        } else if (typeof e.layerX === "number") {
            x = e.layerX;
            y = e.layerY;
        }
        return {
            x: x,
            y: y
        };
    },
    getViewPos: function() {
        if (typeof window.pageYOffset === "number") {
            return [ window.pageXOffset, window.pageYOffset ];
        } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
            return [ document.body.scrollLeft, document.body.scrollTop ];
        } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
            return [ document.documentElement.scrollLeft, document.documentElement.scrollTop ];
        } else {
            return [ 0, 0 ];
        }
    },
    getViewSize: function() {
        if (typeof window.innerWidth === "number") {
            return [ window.innerWidth, window.innerHeight ];
        } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
            return [ document.body.clientWidth, document.body.clientHeight ];
        } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
            return [ document.documentElement.clientWidth, document.documentElement.clientHeight ];
        } else {
            return [ 0, 0 ];
        }
    },
    URI: function(uri) {
        // See RFC3986
        this.scheme = null;
        this.authority = null;
        this.path = "";
        this.query = null;
        this.fragment = null;
        this.parse = function(uri) {
            var m = uri.match(/^(([A-Za-z][0-9A-Za-z+.-]*)(:))?((\/\/)([^\/?#]*))?([^?#]*)((\?)([^#]*))?((#)(.*))?/);
            this.scheme = m[3] ? m[2] : null;
            this.authority = m[5] ? m[6] : null;
            this.path = m[7];
            this.query = m[9] ? m[10] : null;
            this.fragment = m[12] ? m[13] : null;
            return this;
        };
        this.toString = function() {
            var result = "";
            if (this.scheme !== null) {
                result = result + this.scheme + ":";
            }
            if (this.authority !== null) {
                result = result + "//" + this.authority;
            }
            if (this.path !== null) {
                result = result + this.path;
            }
            if (this.query !== null) {
                result = result + "?" + this.query;
            }
            if (this.fragment !== null) {
                result = result + "#" + this.fragment;
            }
            return result;
        };
        this.toAbsolute = function(base) {
            var base = new jscolor.URI(base);
            var r = this;
            var t = new jscolor.URI();
            if (base.scheme === null) {
                return false;
            }
            if (r.scheme !== null && r.scheme.toLowerCase() === base.scheme.toLowerCase()) {
                r.scheme = null;
            }
            if (r.scheme !== null) {
                t.scheme = r.scheme;
                t.authority = r.authority;
                t.path = removeDotSegments(r.path);
                t.query = r.query;
            } else {
                if (r.authority !== null) {
                    t.authority = r.authority;
                    t.path = removeDotSegments(r.path);
                    t.query = r.query;
                } else {
                    if (r.path === "") {
                        t.path = base.path;
                        if (r.query !== null) {
                            t.query = r.query;
                        } else {
                            t.query = base.query;
                        }
                    } else {
                        if (r.path.substr(0, 1) === "/") {
                            t.path = removeDotSegments(r.path);
                        } else {
                            if (base.authority !== null && base.path === "") {
                                t.path = "/" + r.path;
                            } else {
                                t.path = base.path.replace(/[^\/]+$/, "") + r.path;
                            }
                            t.path = removeDotSegments(t.path);
                        }
                        t.query = r.query;
                    }
                    t.authority = base.authority;
                }
                t.scheme = base.scheme;
            }
            t.fragment = r.fragment;
            return t;
        };
        function removeDotSegments(path) {
            var out = "";
            while (path) {
                if (path.substr(0, 3) === "../" || path.substr(0, 2) === "./") {
                    path = path.replace(/^\.+/, "").substr(1);
                } else if (path.substr(0, 3) === "/./" || path === "/.") {
                    path = "/" + path.substr(3);
                } else if (path.substr(0, 4) === "/../" || path === "/..") {
                    path = "/" + path.substr(4);
                    out = out.replace(/\/?[^\/]*$/, "");
                } else if (path === "." || path === "..") {
                    path = "";
                } else {
                    var rm = path.match(/^\/?[^\/]*/)[0];
                    path = path.substr(rm.length);
                    out = out + rm;
                }
            }
            return out;
        }
        if (uri) {
            this.parse(uri);
        }
    },
    //
    // Usage example:
    // var myColor = new jscolor.color(myInputElement)
    //
    color: function(target, prop) {
        this.required = true;
        // refuse empty values?
        this.adjust = true;
        // adjust value to uniform notation?
        this.hash = false;
        // prefix color with # symbol?
        this.caps = true;
        // uppercase?
        this.slider = true;
        // show the value/saturation slider?
        this.valueElement = target;
        // value holder
        this.styleElement = target;
        // where to reflect current color
        this.onImmediateChange = null;
        // onchange callback (can be either string or function)
        this.hsv = [ 0, 0, 1 ];
        // read-only  0-6, 0-1, 0-1
        this.rgb = [ 1, 1, 1 ];
        // read-only  0-1, 0-1, 0-1
        this.minH = 0;
        // read-only  0-6
        this.maxH = 6;
        // read-only  0-6
        this.minS = 0;
        // read-only  0-1
        this.maxS = 1;
        // read-only  0-1
        this.minV = 0;
        // read-only  0-1
        this.maxV = 1;
        // read-only  0-1
        this.pickerOnfocus = true;
        // display picker on focus?
        this.pickerMode = "HSV";
        // HSV | HVS
        this.pickerPosition = "bottom";
        // left | right | top | bottom
        this.pickerSmartPosition = true;
        // automatically adjust picker position when necessary
        this.pickerisGoddamActive = false;
        // only set to TRUE when this picker is god damned actually active
        this.currentlyFingImporting = false;
        // set to TRUE when we are F-ing Importing a colour        
        this.pickerButtonHeight = 20;
        // px
        this.pickerClosable = false;
        this.pickerCloseText = "Close";
        this.pickerButtonColor = "ButtonText";
        // px
        this.pickerFace = 10;
        // px
        this.pickerFaceColor = "ThreeDFace";
        // CSS color
        this.pickerBorder = 1;
        // px
        this.pickerBorderColor = "ThreeDHighlight ThreeDShadow ThreeDShadow ThreeDHighlight";
        // CSS color
        this.pickerInset = 1;
        // px
        this.pickerInsetColor = "ThreeDShadow ThreeDHighlight ThreeDHighlight ThreeDShadow";
        // CSS color
        this.pickerZIndex = 1e4;
        this.onclosedcallback = null;
        for (var p in prop) {
            if (prop.hasOwnProperty(p)) {
                this[p] = prop[p];
            }
        }
        this.hidePicker = function() {
            if (isPickerOwner()) {
                removePicker();
            }
        };
        this.showPicker = function() {
            if (!isPickerOwner()) {
                var tp = jscolor.getElementPos(target);
                // target pos
                var ts = jscolor.getElementSize(target);
                // target size
                var vp = jscolor.getViewPos();
                // view pos
                var vs = jscolor.getViewSize();
                // view size
                var ps = getPickerDims(this);
                // picker size
                var a, b, c;
                switch (this.pickerPosition.toLowerCase()) {
                  case "left":
                    a = 1;
                    b = 0;
                    c = -1;
                    break;

                  case "right":
                    a = 1;
                    b = 0;
                    c = 1;
                    break;

                  case "top":
                    a = 0;
                    b = 1;
                    c = -1;
                    break;

                  default:
                    a = 0;
                    b = 1;
                    c = 1;
                    break;
                }
                var l = (ts[b] + ps[b]) / 2;
                // picker pos
                if (!this.pickerSmartPosition) {
                    var pp = [ tp[a], tp[b] + ts[b] - l + l * c ];
                } else {
                    var pp = [ -vp[a] + tp[a] + ps[a] > vs[a] ? -vp[a] + tp[a] + ts[a] / 2 > vs[a] / 2 && tp[a] + ts[a] - ps[a] >= 0 ? tp[a] + ts[a] - ps[a] : tp[a] : tp[a], -vp[b] + tp[b] + ts[b] + ps[b] - l + l * c > vs[b] ? -vp[b] + tp[b] + ts[b] / 2 > vs[b] / 2 && tp[b] + ts[b] - l - l * c >= 0 ? tp[b] + ts[b] - l - l * c : tp[b] + ts[b] - l + l * c : tp[b] + ts[b] - l + l * c >= 0 ? tp[b] + ts[b] - l + l * c : tp[b] + ts[b] - l - l * c ];
                }
                this.pickerisGoddamActive = true;
                drawPicker(pp[a], pp[b]);
            }
        };
        this.importColor = function() {
            this.currentlyFingImporting = true;
            if (!valueElement) {
                this.exportColor();
            } else {
                if (!this.adjust) {
                    if (!this.fromString(valueElement.value, leaveValue)) {
                        styleElement.style.backgroundImage = styleElement.jscStyle.backgroundImage;
                        styleElement.style.backgroundColor = styleElement.jscStyle.backgroundColor;
                        styleElement.style.color = styleElement.jscStyle.color;
                        this.exportColor(leaveValue | leaveStyle);
                    }
                } else if (!this.required && /^\s*$/.test(valueElement.value)) {
                    valueElement.value = "";
                    styleElement.style.backgroundImage = styleElement.jscStyle.backgroundImage;
                    styleElement.style.backgroundColor = styleElement.jscStyle.backgroundColor;
                    styleElement.style.color = styleElement.jscStyle.color;
                    this.exportColor(leaveValue | leaveStyle);
                } else if (this.fromString(valueElement.value)) {} else {
                    this.exportColor();
                }
            }
            this.currentlyFingImporting = false;
        };
        this.exportColor = function(flags) {
            if (!this.pickerisGoddamActive && !this.currentlyFingImporting) {
                // thank god damn for that
                return;
            }
            if (!(flags & leaveValue) && valueElement) {
                var value = this.toString();
                if (this.caps) {
                    value = value.toUpperCase();
                }
                if (this.hash) {
                    value = "#" + value;
                }
                valueElement.value = value;
            }
            if (!(flags & leaveStyle) && styleElement) {
                styleElement.style.backgroundImage = "none";
                styleElement.style.backgroundColor = "#" + this.toString();
                styleElement.style.color = .213 * this.rgb[0] + .715 * this.rgb[1] + .072 * this.rgb[2] < .5 ? "#FFF" : "#000";
            }
            if (!(flags & leavePad) && isPickerOwner()) {
                redrawPad();
            }
            if (!(flags & leaveSld) && isPickerOwner()) {
                redrawSld();
            }
        };
        this.fromHSV = function(h, s, v, flags) {
            // null = don't change
            if (h !== null) {
                h = Math.max(0, this.minH, Math.min(6, this.maxH, h));
            }
            if (s !== null) {
                s = Math.max(0, this.minS, Math.min(1, this.maxS, s));
            }
            if (v !== null) {
                v = Math.max(0, this.minV, Math.min(1, this.maxV, v));
            }
            this.rgb = HSV_RGB(h === null ? this.hsv[0] : this.hsv[0] = h, s === null ? this.hsv[1] : this.hsv[1] = s, v === null ? this.hsv[2] : this.hsv[2] = v);
            this.exportColor(flags);
        };
        this.fromRGB = function(r, g, b, flags) {
            // null = don't change
            if (r !== null) {
                r = Math.max(0, Math.min(1, r));
            }
            if (g !== null) {
                g = Math.max(0, Math.min(1, g));
            }
            if (b !== null) {
                b = Math.max(0, Math.min(1, b));
            }
            var hsv = RGB_HSV(r === null ? this.rgb[0] : r, g === null ? this.rgb[1] : g, b === null ? this.rgb[2] : b);
            if (hsv[0] !== null) {
                this.hsv[0] = Math.max(0, this.minH, Math.min(6, this.maxH, hsv[0]));
            }
            if (hsv[2] !== 0) {
                this.hsv[1] = hsv[1] === null ? null : Math.max(0, this.minS, Math.min(1, this.maxS, hsv[1]));
            }
            this.hsv[2] = hsv[2] === null ? null : Math.max(0, this.minV, Math.min(1, this.maxV, hsv[2]));
            // update RGB according to final HSV, as some values might be trimmed
            var rgb = HSV_RGB(this.hsv[0], this.hsv[1], this.hsv[2]);
            this.rgb[0] = rgb[0];
            this.rgb[1] = rgb[1];
            this.rgb[2] = rgb[2];
            this.exportColor(flags);
        };
        this.fromString = function(hex, flags) {
            var m = hex.match(/^\W*([0-9A-F]{3}([0-9A-F]{3})?)\W*$/i);
            if (!m) {
                return false;
            } else {
                if (m[1].length === 6) {
                    // 6-char notation
                    this.fromRGB(parseInt(m[1].substr(0, 2), 16) / 255, parseInt(m[1].substr(2, 2), 16) / 255, parseInt(m[1].substr(4, 2), 16) / 255, flags);
                } else {
                    // 3-char notation
                    this.fromRGB(parseInt(m[1].charAt(0) + m[1].charAt(0), 16) / 255, parseInt(m[1].charAt(1) + m[1].charAt(1), 16) / 255, parseInt(m[1].charAt(2) + m[1].charAt(2), 16) / 255, flags);
                }
                return true;
            }
        };
        this.toString = function() {
            return (256 | Math.round(255 * this.rgb[0])).toString(16).substr(1) + (256 | Math.round(255 * this.rgb[1])).toString(16).substr(1) + (256 | Math.round(255 * this.rgb[2])).toString(16).substr(1);
        };
        function RGB_HSV(r, g, b) {
            var n = Math.min(Math.min(r, g), b);
            var v = Math.max(Math.max(r, g), b);
            var m = v - n;
            if (m === 0) {
                return [ null, 0, v ];
            }
            var h = r === n ? 3 + (b - g) / m : g === n ? 5 + (r - b) / m : 1 + (g - r) / m;
            return [ h === 6 ? 0 : h, m / v, v ];
        }
        function HSV_RGB(h, s, v) {
            if (h === null) {
                return [ v, v, v ];
            }
            var i = Math.floor(h);
            var f = i % 2 ? h - i : 1 - (h - i);
            var m = v * (1 - s);
            var n = v * (1 - s * f);
            switch (i) {
              case 6:
              case 0:
                return [ v, n, m ];

              case 1:
                return [ n, v, m ];

              case 2:
                return [ m, v, n ];

              case 3:
                return [ m, n, v ];

              case 4:
                return [ n, m, v ];

              case 5:
                return [ v, m, n ];
            }
        }
        function removePicker() {
            THIS.pickerisGoddamActive = false;
            delete jscolor.picker.owner;
            document.getElementsByTagName("body")[0].removeChild(jscolor.picker.boxB);
            if (THIS.onclosedcallback) {
                THIS.onclosedcallback();
            }
        }
        function drawPicker(x, y) {
            if (!jscolor.picker) {
                jscolor.picker = {
                    box: document.createElement("div"),
                    boxB: document.createElement("div"),
                    pad: document.createElement("div"),
                    padB: document.createElement("div"),
                    padM: document.createElement("div"),
                    sld: document.createElement("div"),
                    sldB: document.createElement("div"),
                    sldM: document.createElement("div"),
                    btn: document.createElement("div"),
                    btnS: document.createElement("span"),
                    btnT: document.createTextNode(THIS.pickerCloseText)
                };
                for (var i = 0, segSize = 4; i < jscolor.images.sld[1]; i += segSize) {
                    var seg = document.createElement("div");
                    seg.style.height = segSize + "px";
                    seg.style.fontSize = "1px";
                    seg.style.lineHeight = "0";
                    jscolor.picker.sld.appendChild(seg);
                }
                jscolor.picker.sldB.appendChild(jscolor.picker.sld);
                jscolor.picker.box.appendChild(jscolor.picker.sldB);
                jscolor.picker.box.appendChild(jscolor.picker.sldM);
                jscolor.picker.padB.appendChild(jscolor.picker.pad);
                jscolor.picker.box.appendChild(jscolor.picker.padB);
                jscolor.picker.box.appendChild(jscolor.picker.padM);
                jscolor.picker.btnS.appendChild(jscolor.picker.btnT);
                jscolor.picker.btn.appendChild(jscolor.picker.btnS);
                jscolor.picker.box.appendChild(jscolor.picker.btn);
                jscolor.picker.boxB.appendChild(jscolor.picker.box);
            }
            var p = jscolor.picker;
            // controls interaction
            p.box.onmouseup = p.box.onmouseout = function() {
                target.focus();
            };
            p.box.onmousedown = function() {
                abortBlur = true;
            };
            p.box.onmousemove = function(e) {
                if (holdPad || holdSld) {
                    holdPad && setPad(e);
                    holdSld && setSld(e);
                    if (document.selection) {
                        document.selection.empty();
                    } else if (window.getSelection) {
                        window.getSelection().removeAllRanges();
                    }
                    dispatchImmediateChange();
                }
            };
            if ("ontouchstart" in window) {
                // if touch device
                var handle_touchmove = function(e) {
                    var event = {
                        offsetX: e.touches[0].pageX - touchOffset.X,
                        offsetY: e.touches[0].pageY - touchOffset.Y
                    };
                    if (holdPad || holdSld) {
                        holdPad && setPad(event);
                        holdSld && setSld(event);
                        dispatchImmediateChange();
                    }
                    e.stopPropagation();
                    // prevent move "view" on broswer
                    e.preventDefault();
                };
                p.box.removeEventListener("touchmove", handle_touchmove, false);
                p.box.addEventListener("touchmove", handle_touchmove, false);
            }
            p.padM.onmouseup = p.padM.onmouseout = function() {
                if (holdPad) {
                    holdPad = false;
                    jscolor.fireEvent(valueElement, "change");
                }
            };
            p.padM.onmousedown = function(e) {
                // if the slider is at the bottom, move it up
                switch (modeID) {
                  case 0:
                    if (THIS.hsv[2] === 0) {
                        THIS.fromHSV(null, null, 1);
                    }
                    ;
                    break;

                  case 1:
                    if (THIS.hsv[1] === 0) {
                        THIS.fromHSV(null, 1, null);
                    }
                    ;
                    break;
                }
                holdSld = false;
                holdPad = true;
                setPad(e);
                dispatchImmediateChange();
            };
            if ("ontouchstart" in window) {
                p.padM.addEventListener("touchstart", function(e) {
                    touchOffset = {
                        X: e.target.offsetParent.offsetLeft,
                        Y: e.target.offsetParent.offsetTop
                    };
                    this.onmousedown({
                        offsetX: e.touches[0].pageX - touchOffset.X,
                        offsetY: e.touches[0].pageY - touchOffset.Y
                    });
                });
            }
            p.sldM.onmouseup = p.sldM.onmouseout = function() {
                if (holdSld) {
                    holdSld = false;
                    jscolor.fireEvent(valueElement, "change");
                }
            };
            p.sldM.onmousedown = function(e) {
                holdPad = false;
                holdSld = true;
                setSld(e);
                dispatchImmediateChange();
            };
            if ("ontouchstart" in window) {
                p.sldM.addEventListener("touchstart", function(e) {
                    touchOffset = {
                        X: e.target.offsetParent.offsetLeft,
                        Y: e.target.offsetParent.offsetTop
                    };
                    this.onmousedown({
                        offsetX: e.touches[0].pageX - touchOffset.X,
                        offsetY: e.touches[0].pageY - touchOffset.Y
                    });
                });
            }
            // picker
            var dims = getPickerDims(THIS);
            p.box.style.width = dims[0] + "px";
            p.box.style.height = dims[1] + "px";
            // picker border
            p.boxB.style.position = "absolute";
            p.boxB.style.clear = "both";
            p.boxB.style.left = x + "px";
            p.boxB.style.top = y + "px";
            p.boxB.style.zIndex = THIS.pickerZIndex;
            p.boxB.style.border = THIS.pickerBorder + "px solid";
            p.boxB.style.borderColor = THIS.pickerBorderColor;
            p.boxB.style.background = THIS.pickerFaceColor;
            // pad image
            p.pad.style.width = jscolor.images.pad[0] + "px";
            p.pad.style.height = jscolor.images.pad[1] + "px";
            // pad border
            p.padB.style.position = "absolute";
            p.padB.style.left = THIS.pickerFace + "px";
            p.padB.style.top = THIS.pickerFace + "px";
            p.padB.style.border = THIS.pickerInset + "px solid";
            p.padB.style.borderColor = THIS.pickerInsetColor;
            // pad mouse area
            p.padM.style.position = "absolute";
            p.padM.style.left = "0";
            p.padM.style.top = "0";
            p.padM.style.width = THIS.pickerFace + 2 * THIS.pickerInset + jscolor.images.pad[0] + jscolor.images.arrow[0] + "px";
            p.padM.style.height = p.box.style.height;
            p.padM.style.cursor = "crosshair";
            // slider image
            p.sld.style.overflow = "hidden";
            p.sld.style.width = jscolor.images.sld[0] + "px";
            p.sld.style.height = jscolor.images.sld[1] + "px";
            // slider border
            p.sldB.style.display = THIS.slider ? "block" : "none";
            p.sldB.style.position = "absolute";
            p.sldB.style.right = THIS.pickerFace + "px";
            p.sldB.style.top = THIS.pickerFace + "px";
            p.sldB.style.border = THIS.pickerInset + "px solid";
            p.sldB.style.borderColor = THIS.pickerInsetColor;
            // slider mouse area
            p.sldM.style.display = THIS.slider ? "block" : "none";
            p.sldM.style.position = "absolute";
            p.sldM.style.right = "0";
            p.sldM.style.top = "0";
            p.sldM.style.width = jscolor.images.sld[0] + jscolor.images.arrow[0] + THIS.pickerFace + 2 * THIS.pickerInset + "px";
            p.sldM.style.height = p.box.style.height;
            try {
                p.sldM.style.cursor = "pointer";
            } catch (eOldIE) {
                eOldIE;
                p.sldM.style.cursor = "hand";
            }
            // "close" button
            function setBtnBorder() {
                var insetColors = THIS.pickerInsetColor.split(/\s+/);
                var pickerOutsetColor = insetColors.length < 2 ? insetColors[0] : insetColors[1] + " " + insetColors[0] + " " + insetColors[0] + " " + insetColors[1];
                p.btn.style.borderColor = pickerOutsetColor;
            }
            p.btn.style.display = THIS.pickerClosable ? "block" : "none";
            p.btn.style.position = "absolute";
            p.btn.style.left = THIS.pickerFace + "px";
            p.btn.style.bottom = THIS.pickerFace + "px";
            p.btn.style.padding = "0 15px";
            p.btn.style.height = "18px";
            p.btn.style.border = THIS.pickerInset + "px solid";
            setBtnBorder();
            p.btn.style.color = THIS.pickerButtonColor;
            p.btn.style.font = "12px sans-serif";
            p.btn.style.textAlign = "center";
            try {
                p.btn.style.cursor = "pointer";
            } catch (eOldIE) {
                eOldIE;
                p.btn.style.cursor = "hand";
            }
            p.btn.onmousedown = function() {
                THIS.hidePicker();
            };
            p.btn.ontouchend = function() {
                THIS.hidePicker();
            };
            p.btnS.style.lineHeight = p.btn.style.height;
            // load images in optimal order
            switch (modeID) {
              case 0:
                var padImg = "hs.png";
                break;

              case 1:
                var padImg = "hv.png";
                break;
            }
            p.padM.style.backgroundImage = "url('" + jscolor.getDir() + "cross.gif')";
            p.padM.style.backgroundRepeat = "no-repeat";
            p.sldM.style.backgroundImage = "url('" + jscolor.getDir() + "arrow.gif')";
            p.sldM.style.backgroundRepeat = "no-repeat";
            p.pad.style.backgroundImage = "url('" + jscolor.getDir() + padImg + "')";
            p.pad.style.backgroundRepeat = "no-repeat";
            p.pad.style.backgroundPosition = "0 0";
            // place pointers
            redrawPad();
            redrawSld();
            jscolor.picker.owner = THIS;
            document.getElementsByTagName("body")[0].appendChild(p.boxB);
        }
        function getPickerDims(o) {
            var dims = [ 2 * o.pickerInset + 2 * o.pickerFace + jscolor.images.pad[0] + (o.slider ? 2 * o.pickerInset + 2 * jscolor.images.arrow[0] + jscolor.images.sld[0] : 0), o.pickerClosable ? 4 * o.pickerInset + 3 * o.pickerFace + jscolor.images.pad[1] + o.pickerButtonHeight : 2 * o.pickerInset + 2 * o.pickerFace + jscolor.images.pad[1] ];
            return dims;
        }
        function redrawPad() {
            // redraw the pad pointer
            switch (modeID) {
              case 0:
                var yComponent = 1;
                break;

              case 1:
                var yComponent = 2;
                break;
            }
            var x = Math.round(THIS.hsv[0] / 6 * (jscolor.images.pad[0] - 1));
            var y = Math.round((1 - THIS.hsv[yComponent]) * (jscolor.images.pad[1] - 1));
            jscolor.picker.padM.style.backgroundPosition = THIS.pickerFace + THIS.pickerInset + x - Math.floor(jscolor.images.cross[0] / 2) + "px " + (THIS.pickerFace + THIS.pickerInset + y - Math.floor(jscolor.images.cross[1] / 2)) + "px";
            // redraw the slider image
            var seg = jscolor.picker.sld.childNodes;
            switch (modeID) {
              case 0:
                var rgb = HSV_RGB(THIS.hsv[0], THIS.hsv[1], 1);
                for (var i = 0; i < seg.length; i += 1) {
                    seg[i].style.backgroundColor = "rgb(" + rgb[0] * (1 - i / seg.length) * 100 + "%," + rgb[1] * (1 - i / seg.length) * 100 + "%," + rgb[2] * (1 - i / seg.length) * 100 + "%)";
                }
                break;

              case 1:
                var rgb, s, c = [ THIS.hsv[2], 0, 0 ];
                var i = Math.floor(THIS.hsv[0]);
                var f = i % 2 ? THIS.hsv[0] - i : 1 - (THIS.hsv[0] - i);
                switch (i) {
                  case 6:
                  case 0:
                    rgb = [ 0, 1, 2 ];
                    break;

                  case 1:
                    rgb = [ 1, 0, 2 ];
                    break;

                  case 2:
                    rgb = [ 2, 0, 1 ];
                    break;

                  case 3:
                    rgb = [ 2, 1, 0 ];
                    break;

                  case 4:
                    rgb = [ 1, 2, 0 ];
                    break;

                  case 5:
                    rgb = [ 0, 2, 1 ];
                    break;
                }
                for (var i = 0; i < seg.length; i += 1) {
                    s = 1 - 1 / (seg.length - 1) * i;
                    c[1] = c[0] * (1 - s * f);
                    c[2] = c[0] * (1 - s);
                    seg[i].style.backgroundColor = "rgb(" + c[rgb[0]] * 100 + "%," + c[rgb[1]] * 100 + "%," + c[rgb[2]] * 100 + "%)";
                }
                break;
            }
        }
        function redrawSld() {
            // redraw the slider pointer
            switch (modeID) {
              case 0:
                var yComponent = 2;
                break;

              case 1:
                var yComponent = 1;
                break;
            }
            var y = Math.round((1 - THIS.hsv[yComponent]) * (jscolor.images.sld[1] - 1));
            jscolor.picker.sldM.style.backgroundPosition = "0 " + (THIS.pickerFace + THIS.pickerInset + y - Math.floor(jscolor.images.arrow[1] / 2)) + "px";
        }
        function isPickerOwner() {
            return jscolor.picker && jscolor.picker.owner === THIS;
        }
        function blurTarget() {
            if (valueElement === target) {
                THIS.importColor();
            }
            if (THIS.pickerOnfocus) {
                THIS.hidePicker();
            }
        }
        function blurValue() {
            if (valueElement !== target) {
                THIS.importColor();
            }
        }
        function setPad(e) {
            var mpos = jscolor.getRelMousePos(e);
            var x = mpos.x - THIS.pickerFace - THIS.pickerInset;
            var y = mpos.y - THIS.pickerFace - THIS.pickerInset;
            switch (modeID) {
              case 0:
                THIS.fromHSV(x * (6 / (jscolor.images.pad[0] - 1)), 1 - y / (jscolor.images.pad[1] - 1), null, leaveSld);
                break;

              case 1:
                THIS.fromHSV(x * (6 / (jscolor.images.pad[0] - 1)), null, 1 - y / (jscolor.images.pad[1] - 1), leaveSld);
                break;
            }
        }
        function setSld(e) {
            var mpos = jscolor.getRelMousePos(e);
            var y = mpos.y - THIS.pickerFace - THIS.pickerInset;
            switch (modeID) {
              case 0:
                THIS.fromHSV(null, null, 1 - y / (jscolor.images.sld[1] - 1), leavePad);
                break;

              case 1:
                THIS.fromHSV(null, 1 - y / (jscolor.images.sld[1] - 1), null, leavePad);
                break;
            }
        }
        function dispatchImmediateChange() {
            if (THIS.onImmediateChange) {
                var callback;
                if (typeof THIS.onImmediateChange === "string") {
                    callback = new Function(THIS.onImmediateChange);
                } else {
                    callback = THIS.onImmediateChange;
                }
                callback.call(THIS);
            }
        }
        var THIS = this;
        var modeID = this.pickerMode.toLowerCase() === "hvs" ? 1 : 0;
        var abortBlur = false;
        var valueElement = jscolor.fetchElement(this.valueElement), styleElement = jscolor.fetchElement(this.styleElement);
        var holdPad = false, holdSld = false, touchOffset = {};
        var leaveValue = 1 << 0, leaveStyle = 1 << 1, leavePad = 1 << 2, leaveSld = 1 << 3;
        // target
        jscolor.addEvent(target, "focus", function() {
            if (THIS.pickerOnfocus) {
                THIS.showPicker();
            }
        });
        jscolor.addEvent(target, "blur", function() {
            if (!abortBlur) {
                window.setTimeout(function() {
                    abortBlur || blurTarget();
                    abortBlur = false;
                }, 0);
            } else {
                abortBlur = false;
            }
        });
        // valueElement
        if (valueElement) {
            var updateField = function() {
                THIS.fromString(valueElement.value, leaveValue);
                dispatchImmediateChange();
            };
            jscolor.addEvent(valueElement, "keyup", updateField);
            jscolor.addEvent(valueElement, "input", updateField);
            jscolor.addEvent(valueElement, "blur", blurValue);
            valueElement.setAttribute("autocomplete", "off");
        }
        // styleElement
        if (styleElement) {
            styleElement.jscStyle = {
                backgroundImage: styleElement.style.backgroundImage,
                backgroundColor: styleElement.style.backgroundColor,
                color: styleElement.style.color
            };
        }
        // require images
        switch (modeID) {
          case 0:
            jscolor.requireImage("hs.png");
            break;

          case 1:
            jscolor.requireImage("hv.png");
            break;
        }
        jscolor.requireImage("cross.gif");
        jscolor.requireImage("arrow.gif");
        this.importColor();
    }
};

jscolor.install();

/*
    Shanka HSK Flashcards - lang_english.js version 1

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any dervied work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

    This file was translated by:
        Name:
        Email:
        Date:
    
*/
/* Start of language definition */
var lang_english = function() {
    /* These strings describe the language of this file */
    this.this_language = "English";
    this.this_switch_language = "Switch Language to English";
    /* These strings describe all currently supported languages */
    this.lang_interface_language = "Switch Language";
    this.lang_english_language = "English";
    this.lang_dutch_language = "Dutch";
    this.lang_spanish_language = "Spanish";
    this.lang_german_language = "German";
    this.lang_french_language = "French";
    this.lang_italian_language = "Italian";
    /* Strings to do with the running of the app*/
    this.app_cancel_silences_error = "('Cancel' silences future errors)";
    this.app_exception_error = "Exception";
    this.app_generic_error = "Error";
    this.app_initialising_message = "<br /><i>Your web browser supports HTML5.<br /><br />Loading...</i><br /><br /><br /><br />";
    this.app_new_version_download_confirm = "A new version of Shanka has been downloaded. Reload the app now?";
    this.app_no_html5_message = "<h3>Your web browser doesn't support HTML5. Please use a modern web browser (Safari or Chrome) to run this app.</h3><br /><br /><br />";
    this.app_nojavascript_error = "Your web browser does not have JavaScript enabled. Please enable JavaScript or use a different browser.";
    this.app_offline_status = "OFFLINE";
    this.app_please_wait_a_moment = "Please wait a moment...";
    this.app_support_see_message = "For support see <a href='http://hskhsk.com/shanka'>hskhsk.com/shanka</a>";
    this.app_was_reloaded_message = "App was reloaded!";
    /* Generic re-usable strings for buttons etc. */
    this.gen_add_text = "Add";
    this.gen_all_text = "All";
    this.gen_cancel_text = "Cancel";
    this.gen_delete_text = "Delete";
    this.gen_duplicate_text = "Duplicate";
    this.gen_edit_all_text = "Edit All";
    this.gen_remove_text = "Remove";
    this.gen_save_text = "Save";
    /* Main page strings */
    this.main_beginners_quickstart_label = "Beginners' Quick Start";
    this.main_browser_no_html5_error = "Your web browser doesn't support HTML5. Please use a modern web browser (Safari or Chrome) to run this app.";
    this.main_choose_option_begin_label = "Choose an option below to begin studying Chinese!";
    this.main_menu_help_label = "Menu <b>&#8801;</b> and Help <b>?</b> are in the top corners.";
    this.main_setup_wizard_label = "Setup Wizard";
    /* Titles of all pages */
    this.page_about_title = "About";
    this.page_add_algorithm_title = "Add Algorithm";
    this.page_add_category_title = "Add Category";
    this.page_add_flashcard_title = "Add Flashcard";
    this.page_add_lesson_title = "Add Lesson";
    this.page_add_question_title = "Add Question";
    this.page_algo_shanka_title = "Shanka Algorithm";
    this.page_algorithms_title = "Algorithms";
    this.page_card_info_title = "Card Info";
    this.page_cards_title = "Flashcards";
    this.page_categories_title = "Categories";
    this.page_category_title = "Category";
    this.page_edit_algorithm_title = "Edit Algorithm";
    this.page_edit_algorithms_title = "Edit Algorithms";
    this.page_edit_categories_title = "Edit Categories";
    this.page_edit_category_name_title = "Edit Category";
    this.page_edit_flashcard_title = "Edit Flashcard";
    this.page_edit_lesson_title = "Edit Lesson";
    this.page_edit_lessons_title = "Edit Lessons";
    this.page_edit_question_title = "Edit Question";
    this.page_edit_questions_title = "Edit Questions";
    this.page_export_title = "Export";
    this.page_help_contents_title = "Help Contents";
    this.page_help_prefix_title = "Help";
    this.page_history_title = "History";
    this.page_import_title = "Import";
    this.page_initialising_title = "Initialising";
    this.page_lessons_title = "Lessons";
    this.page_main_app_title = "Shanka 闪卡";
    this.page_main_title = "Main";
    this.page_maintenance_title = "Maintenance";
    this.page_pleco_import_title = "Pleco Import";
    this.page_practice_title = "Practice";
    this.page_progress_title = "Progress";
    this.page_question_title = "Question";
    this.page_questions_title = "Questions";
    this.page_queue_title = "Queue";
    this.page_settings_title = "Settings";
    this.page_skritter_import_title = "Skritter Import";
    this.page_sticky_import_title = "StickyStudy Import";
    this.page_study_title = "Study";
    this.page_wizard1_title = "Wizard 1/4";
    this.page_wizard2_title = "Wizard 2/4";
    this.page_wizard3_title = "Wizard 3/4";
    this.page_wizard4_title = "Wizard 4/4";
    this.page_wizard_title = "Wizard";
    /* Study page */
    this.study_edit_text = "Edit";
    this.study_field_question_name_calligraphy = "Calligraphy";
    this.study_field_question_name_cursive = "Cursive";
    this.study_field_question_name_definition = "Definition";
    this.study_field_question_name_notes = "Notes";
    this.study_field_question_name_pinyin = "Pinyin";
    this.study_field_question_name_simplified = "Simplified";
    this.study_field_question_name_traditional = "Traditional";
    this.study_field_question_text_calligraphy = "Calligraphy";
    this.study_field_question_text_cursive = "Cursive";
    this.study_field_question_text_definition = "Definition";
    this.study_field_question_text_input_draw = "Draw";
    this.study_field_question_text_input_type = "Type";
    this.study_field_question_text_notes = "Notes";
    this.study_field_question_text_pinyin = "Pinyin";
    this.study_field_question_text_simplified = "Hanzi";
    this.study_field_question_text_traditional = "Hanzi";
    this.study_invalid_card_id_error = "Invalid card id: ";
    this.study_invalid_question_id_error = "Invalid question id: ";
    this.study_no_cards_questions_use_wizard_error = "There are no cards or questions to study, please use the Quick Start, Wizard, or Import!";
    this.study_practice_short_text = "Prac.";
    this.study_practice_text = "Practice";
    this.study_search_no_results = "No Results";
    this.study_search_result_label = "Results";
    this.study_sentence_label = "Sentence";
    this.study_show_answer_label = "Show Answer";
    this.study_study_text = "Study";
    /* Wizard pages */
    this.wizard_added_lesson_message = "Added lesson.";
    this.wizard_added_question_message = "Added question.";
    this.wizard_algorithm_name_advanced = "Advanced";
    this.wizard_algorithm_name_beginner = "Beginner";
    this.wizard_algorithm_name_intermediate = "Intermediate";
    this.wizard_algorithm_name_random = "Random";
    this.wizard_algorithm_name_randomreview = "Random Review";
    this.wizard_algorithm_name_review = "Review";
    this.wizard_both_characters_label = "Both";
    this.wizard_calligraphy_label = "Calligraphy";
    this.wizard_created_algorithm_message = "Created algorithm.";
    this.wizard_created_flashcards_format = "Created {0} flashcards.";
    this.wizard_created_lesson_name = "Wizard Created";
    this.wizard_cursive_label = "Cursive";
    this.wizard_definition_label = "Definition";
    this.wizard_done_label = "Done!";
    this.wizard_found_lesson_message = "Found lesson.";
    this.wizard_found_question_message = "Found question.";
    this.wizard_merged_flashcards_format = "Merged {0} flashcards.";
    this.wizard_next_label = "Next";
    this.wizard_pinyin_label = "Pinyin";
    this.wizard_reading_label = "Reading Hanzi";
    this.wizard_select_one_vocab_error = "Please select at least one vocabulary list!";
    this.wizard_select_something_learn_error = "Please select something to learn!";
    this.wizard_sentences_label = "Sentences";
    this.wizard_simplified_characters_label = "Simplified";
    this.wizard_traditional_characters_label = "Traditional";
    this.wizard_what_is_level_label = "What is your level for this vocabulary?";
    this.wizard_what_want_learn_label = "What do you want to learn?";
    this.wizard_which_characters_label = "Which characters do you want to learn?";
    this.wizard_which_vocab_label = "Which vocabulary list(s) do you want to study?";
    this.wizard_writing_label = "Writing Hanzi";
    /* Flashcard viewing and editing */
    this.card_add_text = "Add Card";
    this.card_delete_selected_confirm = "Delete selected flashcards?";
    this.card_deleted_format = "Deleted {0} flashcards.";
    this.card_duplicate_selected_confirm = "Duplicate selected flashcards?";
    this.card_duplicated_format = "Duplicated {0} flashcards.";
    this.card_enabled_label = "Enabled";
    this.card_historical_bronze_label = "Bronze";
    this.card_historical_forms_label = "Historical Forms";
    this.card_historical_greatseal_label = "Great Seal";
    this.card_historical_oracle_label = "Oracle";
    this.card_historical_smallseal_label = "Small Seal";
    this.card_if_queued_must_be_enabled_error = "If a flashcard is queued, it must also be enabled!";
    this.card_must_have_at_least_simp_trad_error = "You must have at least one of simplified or traditional characters!";
    this.card_must_have_definition_error = "You must have a definition!";
    this.card_queued_label = "Queued";
    this.card_related_flashcards_label = "Related Flashcards";
    this.card_remove_selected_confirm = "Remove selected flashcards from this category?";
    this.card_removed_format = "Removed {0} flashcards.";
    this.card_saved_message = "Card Saved.";
    this.card_stroke_order_label = "Stroke Order";
    /* Category list and edit name page */
    this.category_all_name = "All";
    this.category_uncategorised_name = "Uncategorised";
    this.category_delete_selected_confirm = "Delete selected categories?";
    this.category_deleted_format = "Deleted {0} categories";
    this.category_duplicate_sel_confirm = "Duplicate selected categories?";
    this.category_duplicated_format = "Duplicated {0} categories";
    this.category_edit_name = "Edit Name";
    this.category_must_enter_name_error = "You must enter a category name!";
    this.category_name_exists_error = "That category name already exists!";
    this.category_name_label = "Category Name";
    this.category_new_name = "New Category";
    this.category_saved_format = "Category '{0}' saved";
    /* Settings page */
    this.settings_auto_advance_label = "Auto Advance";
    this.settings_auto_queue_label = "Auto Queue New Flashcards";
    this.settings_background_colour_label = "Background Colour";
    this.settings_background_guides_label = "Background Guides";
    this.settings_border_colour_label = "Border Colour";
    this.settings_brush_colour_label = "Brush Colour";
    this.settings_brush_width_label = "Brush Width";
    this.settings_each_enabled_rating_must_have_val_error = "Each of the enabled rating buttons must have a value";
    this.settings_enable_tone_colours_label = "Enable Tone Colours";
    this.settings_general_label = "General Settings";
    this.settings_grid_colour_label = "Grid Colour";
    this.settings_guide_star_label = "米 Star";
    this.settings_guide_grid_label = "井 Grid";
    this.settings_guide_cross_label = "十 Cross";
    this.settings_guide_bar_label = "丨 Bar";
    this.settings_guide_none_label = "No Guides";
    this.settings_hanzi_input_label = "Hanzi Drawing Input";
    this.settings_must_enable_two_buttons_error = "You must enable at least two of the rating buttons";
    this.settings_preferred_script_label = "Preferred Script";
    this.settings_rating_enabled_label = "Enabled";
    this.settings_ratings_label = "Ratings";
    this.settings_response_1_default = "No Idea";
    this.settings_response_2_default = "Wrong";
    this.settings_response_3_default = "So-So";
    this.settings_response_4_default = "Right";
    this.settings_response_5_default = "Easy";
    this.settings_saved_message = "Settings saved.";
    this.settings_simp_trad_label = "Simplified [Traditional]";
    this.settings_simplified_label = "Simplified Only";
    this.settings_tone_1_label = "Tone 1";
    this.settings_tone_2_label = "Tone 2";
    this.settings_tone_3_label = "Tone 3";
    this.settings_tone_4_label = "Tone 4";
    this.settings_tone_5_label = "Tone 5";
    this.settings_tone_colours_label = "Pinyin Tone Colours";
    this.settings_tone_marks_label = "Pinyin Tone Marks";
    this.settings_trad_simp_label = "Traditional [Simplified]";
    this.settings_traditional_label = "Traditional Only";
    /* Maintenance page */
    this.maintenance_app_cache_label = "App Cache";
    this.maintenance_erase_label = "Erase";
    this.maintenance_erase_local_label = "Erase local data";
    this.maintenance_installed_label = "Installed";
    // this. maintenance_latest_label          = "Latest";
    this.maintenance_rebuild_label = "Rebuild";
    this.maintenance_rebuild_local_label = "Rebuild local storage";
    this.maintenance_refresh_label = "Refresh";
    this.maintenance_reload_label = "Reload";
    this.maintenance_reload_local_label = "Reload local data";
    this.maintenance_stand_alone_label = "Standalone";
    this.maintenance_storage_used_format = "Using {0} characters of local storage";
    this.maintenance_system_language_label = "System Language";
    this.maintenance_update_label = "Update";
    /* Import page */
    this.import_algorithms_label = "Algorithms";
    this.import_default_category_label = "Default Category";
    this.import_downloading_file_message = "Downloading import file, please wait...";
    this.import_flashcards_label = "Flashcards";
    this.import_generic_error = "Import error";
    this.import_lessons_label = "Lessons";
    this.import_parsing_data_message = "Parsing import data...";
    this.import_paste_text_label = "Paste text or a link (http://...) here";
    this.import_pleco_text_file_label = "Pleco Text File";
    this.import_pleco_xml_file_label = "Pleco XML File";
    this.import_progress_label = "Progress";
    this.import_section_other = "Other";
    this.import_section_quick = "Quick";
    this.import_section_shanka = "Shanka";
    this.import_settings_label = "Settings";
    this.import_skritter_simp_label = "Skritter (Simplified)";
    this.import_skritter_trad_label = "Skritter (Traditional)";
    this.import_stickystudy_label = "StickyStudy";
    this.import_timed_out_error = "Import timed out!";
    /* Export page */
    this.export_beginning_message = "Beginning Export...";
    this.export_categories_label = "Categories to Export";
    this.export_do_export_label = "Export";
    this.export_download_filename = "ShankaExport.txt";
    this.export_download_filetext = "Download File";
    this.export_export_format_label = "Export Format";
    this.export_other_label = "Other";
    this.export_success_message = "Exported all data!";
    /* Question list and page */
    this.question_answer_label = "Answer";
    this.question_auto_generate_label = "Auto-generate";
    this.question_calligraphy_label = "Calligraphy";
    this.question_components_label = "Question Components";
    this.question_cursive_label = "Cursive";
    this.question_definition_label = "Definition";
    this.question_delete_selected_confirm = "Delete selected questions?";
    this.question_deleted_format = "Deleted {0} questions";
    this.question_display_label = "Display";
    this.question_duplicate_sel_confirm = "Duplicate selected questions?";
    this.question_duplicated_format = "Duplicated {0} questions";
    this.question_hanzi_touch_label = "Hanzi Touchpad";
    this.question_inputs_label = "Inputs";
    this.question_name_label = "Question Name";
    this.question_name_text_error = "Your question must have a name and some question text!";
    this.question_new_name = "New Question";
    this.question_notes_label = "Notes";
    this.question_pinyin_label = "Pinyin";
    this.question_saved_format = "Question '{0}' saved";
    this.question_simplified_label = "Simplified Hanzi";
    this.question_stem_answer_error = "Your question must have at least one stem and one answer!";
    this.question_stem_label = "Stem";
    this.question_text_edit_label = "Text Edit Field";
    this.question_text_label = "Question Text";
    this.question_traditional_label = "Traditional Hanzi";
    this.question_whats_the_format = "What's the {0}?";
    this.question_and_separator = "and";
    /* Lesson list and page */
    this.lesson_delete_selected_confirm = "Delete selected lessons?";
    this.lesson_deleted_format = "Deleted {0} lessons";
    this.lesson_duplicate_selected_confirm = "Duplicate selected lessons?";
    this.lesson_duplicated_format = "Duplicated {0} lessons";
    this.lesson_must_include_1_cat_error = "You must include at least one category!";
    this.lesson_must_include_1_quest_error = "You must include at least one question!";
    this.lesson_name_already_exist_error = "That lesson name already exists!";
    this.lesson_name_cant_be_empty_error = "Lesson name cannot be empty!";
    this.lesson_name_label = "Lesson Name";
    this.lesson_new_name = "New Lesson";
    this.lesson_review_mode_name = "(Review)";
    this.lesson_reviewing_label = "Reviewing";
    this.lesson_saved_format = "Lesson '{0}' saved";
    /* Algorithm list and page */
    this.algorithm_adjustment_speed_positive_error = "Adjustment Speed must be positive!";
    this.algorithm_any_element_probability_0_1_error = "Any Element Probability must be between 0 and 1!";
    this.algorithm_cannot_delete_last_error = "Cannot delete the last algorithm";
    this.algorithm_daily_correct_target_positive_int_error = "Daily Correct Target must be a positive integer!";
    this.algorithm_daily_minutes_target_positive_int_error = "Daily Minutes Target must be a positive integer!";
    this.algorithm_daily_new_target_positive_int_error = "Daily New Target must be a positive integer!";
    this.algorithm_default_knowledge_rate_0_1_error = "Default Knowledge Rate must be between 0 and 1!";
    this.algorithm_delete_selected_confirm = "Delete selected algorithms?";
    this.algorithm_duplicate_selected_confirm = "Duplicate selected algorithms?";
    this.algorithm_first_element_probability_0_1_error = "First Element Probability must be between 0 and 1!";
    this.algorithm_minimum_interval_postive_0_error = "Minimum Interval must be positive or zero!";
    this.algorithm_minimum_unknown_card_positive_int_error = "Minimum Unknown Cards must be a positive integer!";
    this.algorithm_name_cant_be_empty_error = "Algorithm name cannot be empty!";
    this.algorithm_threshold_knowledge_rate_0_1_error = "Threshold Knowledge Rate must be between 0 and 1!";
    this.algorithm_adjustment_speed = "Adjustment Speed";
    this.algorithm_any_element_probability = "Any Element Probability";
    this.algorithm_choose_label = "Choose an Algorithm";
    this.algorithm_current_label = "Current";
    this.algorithm_daily_correct_target = "Daily Correct Target";
    this.algorithm_daily_minutes_target = "Daily Minutes Target";
    this.algorithm_daily_new_target = "Daily New Target";
    this.algorithm_default_knowledge_rate = "Default Knowledge Rate";
    this.algorithm_deleted_format = "Deleted {0} algorithms";
    this.algorithm_duplicated_format = "Duplicated {0} algorithms";
    this.algorithm_first_element_prob = "First Element Probability";
    this.algorithm_history_today = "today";
    this.algorithm_history_yesterday = "yesterday";
    this.algorithm_knowledge_rate_display = "Knowledge Rate";
    this.algorithm_knowledge_rate_trouble = "having trouble";
    this.algorithm_knowledge_rate_learned = "learned";
    this.algorithm_knowledge_rate_learning = "learning";
    this.algorithm_minimum_interval = "Minimum Interval";
    this.algorithm_minimum_unknown_cards = "Minimum Unknown Cards";
    this.algorithm_name_label = "Name";
    this.algorithm_new_name = "New Algorithm";
    this.algorithm_parameters = "Parameters";
    this.algorithm_saved_format = "Algorithm '{0}' saved";
    this.algorithm_study_settings = "Study Settings";
    this.algorithm_threshold_kn_rate = "Threshold Knowledge Rate";
    /* Local storage rebuild and load */
    this.local_storage_cannot_save_ios = "Unable to save to local storage. Either your local storage quote has been exceeded, or you are in Private Browsing mode.";
    this.local_storage_cannot_save_other = "Unable to save to local storage, your local storage quota has been exceeded.";
    this.local_storage_erase_confirm = "Erase local storage data?";
    this.local_storage_erased_message = "Local storage data was nuked!";
    this.local_storage_rebuild_confirm = "Rebuild local storage?";
    this.local_storage_rebuilt_ok_message = "Local storage was rebuilt- no errors were found!";
    this.local_storage_errors_detected_resolved_error = "Local storage data errors were detected and resolved.\n\n" + "You may have missing or disconnected lessons, questions, categories, or cards.\n\n" + "More detailed information is available in the JavaScript console.";
    /* Help pages */
    this.help_contents_label = "Help Contents";
    this.help_main_page = "<h3>Before you Begin</h3>" + "<p>You should first add the main page (welcome page) of this app to the homescreen of your device.</p>" + "<p>This will let you use the app when you are offline, and will also give put the app full-screen giving you more room to study.</p>" + "<p>On iOS this means clicking the icon in the middle of the bottom of the screen, that looks like a box with an arrow pointing up, and selecting 'Add to Home Screen'.</p>" + "<p>Similar functionality is available on all modern web browsers on Windows, Android, Mac OS, Windows Mobile, and Blackberry.</p>";
    this.help_lessons = "<h3>Selected Lessons</h3>" + "<p>When you study, only questions and categories from lessons that are checked will be used.</p>";
    this.help_card_info = "<h3>Categories</h3>" + "<p>Lists the categories, if any, that the current card is assigned to.</p>" + "<h3>Related Flashcards</h3>" + "<p>Shows all flashchards that share characters in common with the current flashcard.</p>" + "<h3>Stroke Order</h3>" + "<p>Some (but not all) characters have stroke order diagrams provided by the Wikimedia Foundation.</p>" + "<h3>Historical Forms</h3>" + "<p>The Wikimedia Foundation has collected together representative historical forms for many characters. " + "These can help to understand the shape of some pictographs.</p>";
    this.help_practice = "<h3>Just Relax!</h3>" + "<p>The practice page allows you sit back and practice whichever characters you like.</p>" + "<p>Enter the characters that you want to study in the text box.</p>" + "<p>All other character drawing functionality from the Study page is available.</p>" + "<h3>Search</h3>" + "<p>You can search through the hanzi and pinyin of all Flashcards by clicking the magnifying glass icon. " + "The search will look for the characters in the text box, and will display a results list or go to the card if there is only one result.</p>";
    this.help_study = "<p>This is the page of the app where you will spend most of your time, testing yourself on flashcards.</p>" + "<h3>Stem</h3>" + "<p>The Stem of the question is the information that you are given.</p>" + "<h3>Answer</h3>" + "<p>The Answer is the information that you supply. Type or draw the answer as appropriate, and then click 'show answer' to see if you were correct.</p>" + "<h3>Hanzi Input</h3>" + "<p>If a hanzi input control is displayed for the current question, you can draw as many characters as you want of the answer, and repeat each multiple times " + "for practice if you prefer. Clicking the 下 button moves you to the next mini grid, or adds a new one if you are currently viewing the last mini grid. You can also " + "click on the grids to select them. Other controls allow you to choose the colour of the pen, show/hide an overlaay of the current character, undo/redo your drawing, " + "and clear the current grid.</p>" + "<h3>Display</h3>" + "<p>Some extra information such as notes that you are not graded on can also be displayed alongside the answer.</p>" + "<h3>Grading</h3>" + "<p>Grade yourself on each part of the answer, to determine when you will next be tested on the current flashcard. " + "You can grade multiple items at once by swiping or dragging between them.</p>";
    this.help_categories = "<p>Categories are sometimes called word lists in other systems. They help you to organise your flashcards, and to tell the app which flashcards you want to study.</p>" + "<p>A card can exist in multiple categories, or none at all in which case it is 'uncategorised'.</p>";
    this.help_progress = "<p>The progress page shows you how many words were counted as known, how long you studied, and how many flashcards you studied, " + "on each day that you used the app.</p>";
    this.help_history = "<p>The history page shows all of the flashcards that you have studied, in the order that you studied them. " + "Each flashcard will only appear in the list once.</p>";
    this.help_import = "<p>With this page you can import data from the built in word lists, or from another flashcard system.</p>";
    this.help_export = "export help" + "<p>Exporting allows you to backup your data, You can also move it to Shanka running on another device, or to another flashcard system.</p>" + "<h3>Export Result</h3>" + "<p>Copy the text in the textedit and paste into another app. " + 'Alternatively, click the "Download file" button.</p>';
    this.help_settings = "<p>The settings screen allows you to tweak many of the internals of the app.</p>" + "<h3>General Settings</h3>" + "<p>If auto advance is switched on, the next flashcard will be shown as soon as you have graded a flashcard when studying.</p>" + "<h3>Hanzi drawing input</h3>" + "<p>These settings control the look of the hanzi drawing control in study and practice modes.</p>" + "<h3>Background Guides</h3>" + "<p>The shape of the hanzi drawing background guides grid can be configured here.</p>" + "<h3>Pinyin Tone Colours</h3>" + "<p>If enabled, this will control the colours displayed for each syllable of toned pinyin.</p>" + "<h3>Preferred Script</h3>" + "<p>You can decide whether you prefer to see Simplified Hanzi, Traditional, or a combination of the two.</p>" + "<h3>Ratings</h3>" + "<p>Choose the names that you want to see for the ratings in the study page, and disable any that you don't want to use by unselecting them.</p>";
    this.help_queue = "<p>The queue shows you all of the words that you are currently studying, and lets you know how well you know them all. " + "The words are in the approximate order that they will be studied, although the order is randomised so that it doesn't become predictable.</p>";
    this.help_algorithms = "<h3>Shanka Algorithm</h3>" + "<p>This algorithm controls the order that flashcards are displayed to you, and how many new flashcards are added when you have learned earlier ones.</p>" + "<h3>Study Settings</h3>" + "<p><li><b>Minimum Unknown Cards</b> - When the number of unknown cards falls below this level, new cards will be added to the queue.</p>" + "<p><li><b>Daily Correct Target</b> - Target minimum number of questions to answer correct each day.</p>" + "<p><li><b>Daily New Target</b> - Target minimum number of new flashcards to add each day.</p>" + "<p><li><b>Daily Minutes Target</b> - Target minimum time to spend studying each day, in minutes.</p>" + "<h3>Parameters</h3>" + "<p><li><b>Default Knowledge Rate</b> - Knowledge rate <i><b>kn_rate</b></i> is how well you know each piece of information in a flashcard. Zero is not at all, one is perfect knowledge.</p>" + "<p><li><b>Threshold Knowledge Rate</b> - The knowledge rate at which the information on a card will be counted as being 'known'.</p>" + "<p><li><b>Adjustment Speed</b> - How quickly the knowledge rate for each piece of information on a flashcard will move towards zero/one when you answer questions wrong/right. " + "If this adjustment speed is <i><b>a</b></i>, then when a question is answered incorrectly, <i><b>kn_rate<sub>new</sub> = kn_rate<sub>old</sub> / a</b></i>. " + "When a question is answered correctly, <i><b>kn_rate<sub>new</sub> = 1 + (kn_rate<sub>old</sub> - 1) / a</b></i>. If the five answer choices are numbered 1-5, then " + "answer 3 will not change the knowledge rate, answers 2 and 4 are wrong and right, and answers 1 and 5 count as two wrong or right answers respectively.</p>" + "<p><li><b>Any Element Probability</b> - The probability that the next flashcard will be randomly drawn from anywhere in the queue, instead of the front of the queue. " + "This setting allows even very old cards to be occasionally sprinkled into the studying. If you don't want this to happen, set the value to zero.</p>" + "<p><li><b>First Element Probability</b> - If this probability is <i><b>p</b></i>, and the first flashcard in the queue is number <i><b>0</b></i>, then flashcard ";
    "<i><b>n</b></i> will be chosen as the card to study with probability <i><b>p &times; (1-p)<sup>n</sup></b></i>. " + "As the sum for all flashcards in the queue will be slightly less than 1, the leftover probability is assigned to the first element.</p>" + "<p><li><b>Minimum Interval</b> - The minimum number of cards that must be shown before a card is repeated, even if it is always marked as unknown.</p>";
    this.help_questions = "<h3>Question Name</h3> " + "<p>Just used to identify the question in the question lists.</p> " + "<h3>Question Text</h3> " + '<p>The question that appears at the top of the card above the question stem, e.g. "What is the pinyin for this character?"</p> ' + "<p>Leave the auto-generate checkbox clicked if you want to have the app create this text based on the selected inputs, stem and answer.</p> " + "<h3>Inputs</h3> " + "<p>These inputs are displayed alongside the question stem. If you type " + "Chinese into the edit box, you can use either your device's pinyin " + "IME or handwriting input.</p> " + "<h3>Stem</h3> " + "<p>The 'front' of the card, for this question.</p> " + "<h3>Answer</h3> " + "<p>The part of the 'back' of the card that you are graded on.</p> " + "<h3>Display</h3> " + "<p>Other information on the 'back' of the card, that is displayed alongside the answer.</p>";
    this.help_maintenance = "<h3>Reload</h3>" + "<p>Reloading will restart the app, using the information in the local storage. " + " This might help sometimes if you run into problems, or if you accidently run multiple instances of the app.</p>" + "<h3>Standalone</h3>" + "<p>This data is used to help diagnose problems with the app. It should be true if you are running the app in " + "'homescreen' or 'standalone' mode, and false if you are within a web browser.</p>" + "<h3>System Language</h3>" + "<p>This is the language code reported by your system.</p>" + "<h3>App Cache</h3>" + "<p>This web app always stores data about cards etc. in local storage. The app cache is seperate from this, and " + "downloads the actual application pages so that you can access them while offline. If the app cache status is " + "UNCACHED then you may not be able to access the app while offline. To ensure offline use you should look for " + "an app cache status of CACHED.</p>" + "<h3>Update Web App</h3>" + "<p>To install the latest version of this app, click 'Update Web App' if you notice that the latest version is " + "different from the current installed version. You shouldn't need to use this functionality if you download an " + "update when prompted on startup</p>" + "<h3>Local Storage</h3>" + "<p>See <a href='http://dev-test.nemikor.com/web-storage/support-test/'>this page</a> " + "to calculate your local storage limit, which is usually at least 2.5M chars depending on your browser. " + "Note: 1k=2<sup>10</sup>=1024 characters, 1M=2<sup>20</sup> characters. Usually 1 character = 2 bytes, so " + "2.5M characters = 5MB of storage space.</p>" + "<h3>Erase Local Data</h3>" + "<p>If you are having problems you could try clearing your local storage data. If you want to keep your current " + "history, you should first export a backup of your data.</p>";
    this.help_wizard = "<p>Use this wizard to simplify the creation of lessons.</p>" + "<p>You can use the wizard more than once to create multiple lessons, and then choose which to study from the lessons screen.</p>";
    this.help_about = "<h3>License</h3>" + "<p>You are free to copy, distribute, and modify this code, under a similar license " + "to this one. You must give the original author (me) credit in any dervied work. " + "You may not use any part of this code for any commercial purpose without obtaining " + "my permission.</p>" + "<p>Alan Davies 2014 <a href='mailto:alan@hskhsk.com'>alan@hskhsk.com</a></p>" + "<p>See <a href='http://hskhsk.com/shanka'>hskhsk.com/shanka</a> for more information.</p>" + "<h3>Credits</h3>" + "<li>Customised version of the UI library <a href='http://maker.github.io/ratchet/'>Ratchet</a> provides the app's look and feel<br />" + "<li>Sidebar code is <a href='https://github.com/jakiestfu/Snap.js/'>Snap.js</a> by jakiestfu<br />" + "<li>Initial app structure inspired by <a href='http://html5db.desalasworks.com/'>sqldb example</a> by Steven de Salas <br />" + "<li><a href='http://pieroxy.net/blog/pages/lz-string/index.html'>lz-string</a> compression routines by Pieroxy<br />" + "<li>JavaScript code compression is  Mihai Bazon's <a href='http://lisperator.net/uglifyjs/'>UglifyJS2</a> <br />" + "<li>The way to write a Hanzi Canvas was inspired by Greg Murray's <a href='http://gregmurray.org/ipad/touchpaint/'>TouchPaint</a> <br />" + "<li>Colour Picker is Jan Odvárko's <a href='http://jscolor.com/'>jscolor</a> <br />" + "<li>Shanka algorithm inspired by Adam Nagy of Cybertron BT's now-defunct <a href='https://web.archive.org/web/20100424220218/http://memodrops.com/algorithm.html'>Memodrops</a>.<br />" + "<li>iPhone taps are more responsive thanks to <a href='https://github.com/ftlabs/fastclick'>FastClick</a><br />" + "<li>Standalone web app scrolling problems are fixed by <a href='https://github.com/jakiestfu/AppScroll.js/'>AppScroll</a><br />" + "<li><a href='http://commons.wikimedia.org/wiki/Commons:Stroke_Order_Project'>Stroke order animations</a> and " + "<a href='http://commons.wikimedia.org/wiki/Commons:Ancient_Chinese_characters_project'>Ancient Chinese Characters</a> " + "are provided by the <a href='http://commons.wikimedia.org/'>Wikimedia Foundation</a><br />" + "<li>Code was edited using <a href='http://notepad-plus-plus.org/'>Notepad++</a><br />" + "<li>Website hosted using <a href='http://aws.amazon.com/'>Amazon Web Services</a><br />" + "<li>Uploading and manipulating files on Amazon S3 is made a lot easier with NetSDK Software's <a href='http://s3browser.com/'>S3 Browser</a><br />" + "<li>Many problems were solved with the help of the comments and solutions on <a href='http://stackoverflow.com/'>Stack Overflow</a><br />" + "<h3>Thanks</h3>" + "<li>Many thanks to the Chinese Forums, Pleco, and Skritter user communities, and the many beta testers who have found bugs and suggested improvements.<br />" + "<li>Thank you also to the translators who are working on internationalising this app!";
    // Progress page and progress displayed on main page
    this.main_cards_learned_label = "learned";
    // this. main_cards_queued_label  = "queued";
    this.main_cards_total_label = "total";
    this.progress_studied_label = "studied";
    this.progress_total_label = "Total";
    this.progress_daily_label = "Daily";
    this.progress_today_label = "Today";
    this.progress_seconds = "seconds";
    this.progress_minutes = "minutes";
    this.progress_hours = "hours";
    this.progress_days = "days";
    this.progress_weeks = "weeks";
    this.progress_years = "years";
    this.progress_list_format = "Studied {0} and learned {1} cards in {2}";
    /* Translated version of this section should be modified to show
 * which files have and haven't been translated */
    this.language_unknown_error = "Unknown language code:";
    this.import_hsk1_label = "HSK 1 Words";
    this.import_hsk2_label = "HSK 2 Words";
    this.import_hsk3_label = "HSK 3 Words";
    this.import_hsk4_label = "HSK 4 Words";
    this.import_hsk5_label = "HSK 5 Words";
    this.import_hsk6_label = "HSK 6 Words";
    this.import_hsk1_sentences_label = "HSK 1 Sentences";
    this.import_hsk2_sentences_label = "HSK 2 Sentences";
    this.import_hsk3_sentences_label = "HSK 3 Sentences";
    this.import_chineasy_label = "Chineasy";
    this.import_hsk1_category = "HSK 1";
    this.import_hsk2_category = "HSK 2";
    this.import_hsk3_category = "HSK 3";
    this.import_hsk4_category = "HSK 4";
    this.import_hsk5_category = "HSK 5";
    this.import_hsk6_category = "HSK 6";
    this.import_hsk1_sentences_category = "HSK 1 句子";
    this.import_hsk2_sentences_category = "HSK 2 句子";
    this.import_hsk3_sentences_category = "HSK 3 句子";
    this.import_chineasy_category = "Chineasy";
    this.import_hsk1_location = "lists/HSK 2012 L1.txt";
    this.import_hsk2_location = "lists/HSK 2012 L2.txt";
    this.import_hsk3_location = "lists/HSK 2012 L3.txt";
    this.import_hsk4_location = "lists/HSK 2012 L4.txt";
    this.import_hsk5_location = "lists/HSK 2012 L5.txt";
    this.import_hsk6_location = "lists/HSK 2012 L6.txt";
    this.import_hsk1_sentences_location = "lists/HSK 2012 Examples L1.txt";
    this.import_hsk2_sentences_location = "lists/HSK 2012 Examples L2.txt";
    this.import_hsk3_sentences_location = "lists/HSK 2012 Examples L3.txt";
    this.import_chineasy_location = "lists/Chineasy.txt";
};

/*
    Shanka HSK Flashcards - lang_dutch.js version 1

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any dervied work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

    This file was translated by:
        Name:		Axel Dessein
        Email:		axel_dessein@hotmail.com	
        Date:		22/01/2014
    
*/
/* Start of language definition */
var lang_dutch = function() {
    /* These strings describe the language of this file */
    this.this_language = "Nederlands";
    this.this_switch_language = "Wijzig taal naar Nederlands";
    /* These strings describe all currently supported languages */
    this.lang_interface_language = "Taal wijzigen";
    this.lang_english_language = "Engels";
    this.lang_dutch_language = "Nederlands";
    this.lang_spanish_language = "Spaans";
    this.lang_german_language = "Duitse";
    this.lang_french_language = "Frans";
    this.lang_italian_language = "Italiaans";
    /* Strings to do with the running of the app*/
    this.app_cancel_silences_error = "('Cancel' silences future errors)";
    this.app_exception_error = "Uitzondering";
    this.app_generic_error = "Fout";
    this.app_initialising_message = "<br /><i>Uw browser ondersteund HTML5.<br /><br />Loading...</i><br /><br /><br /><br />";
    this.app_new_version_download_confirm = "Een nieuwe versie van Shanka werd gedownload.Wilt u de app nu heropstarten?";
    this.app_no_html5_message = "<h3>Uw browser ondersteund HTML5 niet.Gelieve een moderne browser (Safari of Chrome) te gebruiken om deze app te gebruiken.</h3><br /><br /><br />";
    this.app_nojavascript_error = "JavaScript is uitgeschakeld. Gelieve JavaScript in te schakelen of een andere browser te gebruiken.";
    this.app_offline_status = "OFFLINE";
    this.app_please_wait_a_moment = "Een ogenblik geduld, a.u.b.";
    this.app_support_see_message = "Voor ondersteuning zie <a href='http://hskhsk.com/shanka'>hskhsk.com/shanka</a>";
    this.app_was_reloaded_message = "De app werd heropgestart";
    /* Generic re-usable strings for buttons etc. */
    this.gen_add_text = "Toevoegen";
    this.gen_all_text = "Alle";
    this.gen_cancel_text = "Annuleren";
    this.gen_delete_text = "Verwijderen";
    this.gen_duplicate_text = "Duplicate";
    this.gen_edit_all_text = "Bewerken";
    this.gen_remove_text = "Verwijderen";
    this.gen_save_text = "Opslaan";
    /* Main page strings */
    this.main_beginners_quickstart_label = "Beginners' Quick Start";
    this.main_browser_no_html5_error = "Uw browser ondersteund HTML5 niet.Gelieve een moderne browser (Safari of Chrome) te gebruiken om deze app te gebruiken.";
    this.main_choose_option_begin_label = "Kies één van onderstaande opties om te beginnen met leren.";
    this.main_menu_help_label = "Menu <b>&#8801;</b> en Help <b>?</b> bevinden zich in de hoeken bovenaan.";
    this.main_setup_wizard_label = "Installatiewizard";
    /* Titles of all pages */
    this.page_about_title = "About";
    this.page_add_algorithm_title = "Algoritme toevoegen";
    this.page_add_category_title = "Categorie toevoegen";
    this.page_add_flashcard_title = "Flashcard toevoegen";
    this.page_add_lesson_title = "Les toevoegen";
    this.page_add_question_title = "Vraag toevoegen";
    this.page_algo_shanka_title = "Shanka Algoritme";
    this.page_algorithms_title = "Algoritme";
    this.page_card_info_title = "Card Info";
    this.page_cards_title = "Flashcards";
    this.page_categories_title = "Categorieën";
    this.page_category_title = "Categorie";
    this.page_edit_algorithm_title = "Algoritme aanpassen";
    this.page_edit_algorithms_title = "Algoritme aanpassen";
    this.page_edit_categories_title = "Categorieën aanpassen";
    this.page_edit_category_name_title = "Categorie aanpassen";
    this.page_edit_flashcard_title = "Flashcard aanpassen";
    this.page_edit_lesson_title = "Les aanpassen";
    this.page_edit_lessons_title = "Lessen aanpassen";
    this.page_edit_question_title = "Vraag aanpasse";
    this.page_edit_questions_title = "Vragen aanpassen";
    this.page_export_title = "Exporteren";
    this.page_help_contents_title = "Help Contents";
    this.page_help_prefix_title = "Help";
    this.page_history_title = "Geschiedenis";
    this.page_import_title = "Importeren";
    this.page_initialising_title = "Initialiseren";
    this.page_lessons_title = "Lessen";
    this.page_main_app_title = "Shanka 闪卡";
    this.page_main_title = "Hoofdmenu";
    this.page_maintenance_title = "Onderhoud";
    this.page_pleco_import_title = "Pleco Import";
    this.page_practice_title = "Oefenen";
    this.page_progress_title = "Voortgang";
    this.page_question_title = "Vraag";
    this.page_questions_title = "Vragen";
    this.page_queue_title = "Wachtrij";
    this.page_settings_title = "Instellingen";
    this.page_skritter_import_title = "Skritter Import";
    this.page_sticky_import_title = "StickyStudy Import";
    this.page_study_title = "Studeren";
    this.page_wizard1_title = "Wizard 1/4";
    this.page_wizard2_title = "Wizard 2/4";
    this.page_wizard3_title = "Wizard 3/4";
    this.page_wizard4_title = "Wizard 4/4";
    this.page_wizard_title = "Wizard";
    /* Study page */
    this.study_edit_text = "Wijzigen";
    this.study_field_question_name_calligraphy = "Kalligrafie";
    this.study_field_question_name_cursive = "Cursief";
    this.study_field_question_name_definition = "Definitie";
    this.study_field_question_name_notes = "Notities";
    this.study_field_question_name_pinyin = "Pinyin";
    this.study_field_question_name_simplified = "Vereenvoudigd";
    this.study_field_question_name_traditional = "Traditioneel";
    this.study_field_question_text_calligraphy = "Kalligrafie";
    this.study_field_question_text_cursive = "Cursief";
    this.study_field_question_text_definition = "Definitie";
    this.study_field_question_text_input_draw = "Tekenen";
    this.study_field_question_text_input_type = "Type";
    this.study_field_question_text_notes = "Notities";
    this.study_field_question_text_pinyin = "Pinyin";
    this.study_field_question_text_simplified = "Hanzi";
    this.study_field_question_text_traditional = "Hanzi";
    this.study_invalid_card_id_error = "Ongeldige kaart-ID: ";
    this.study_invalid_question_id_error = "Ongeldige vraag-ID: ";
    this.study_no_cards_questions_use_wizard_error = "Er zijn geen kaarten of vragen om te studeren. Gelieve gebruik te maken van Quick Start, de wizard of importeren";
    this.study_practice_short_text = "Oefen";
    this.study_practice_text = "Oefenen";
    this.study_search_no_results = "Geen resultaten";
    this.study_search_result_label = "Resultaten";
    this.study_sentence_label = "Zin";
    this.study_show_answer_label = "Toon antwoord";
    this.study_study_text = "Studeer";
    /* Wizard pages */
    this.wizard_added_lesson_message = "Toegevoegde les.";
    this.wizard_added_question_message = "Toegevoegde vraag.";
    this.wizard_algorithm_name_advanced = "Geavanceerd";
    this.wizard_algorithm_name_beginner = "Beginners";
    this.wizard_algorithm_name_intermediate = "Intermediate";
    this.wizard_algorithm_name_random = "Willekeurig";
    this.wizard_algorithm_name_randomreview = "Willekeurige beoordeling";
    this.wizard_algorithm_name_review = "Review";
    this.wizard_both_characters_label = "Beide";
    this.wizard_calligraphy_label = "Kalligrafie";
    this.wizard_created_algorithm_message = "Gemaakt algoritme.";
    this.wizard_created_flashcards_format = "{0} flashcards gemaakt.";
    this.wizard_created_lesson_name = "Wizard gemaakt";
    this.wizard_cursive_label = "Cursief";
    this.wizard_definition_label = "Definitie";
    this.wizard_done_label = "Klaar!";
    this.wizard_found_lesson_message = "Les gevonden.";
    this.wizard_found_question_message = "Vraag gevonden.";
    this.wizard_merged_flashcards_format = "{0} flashcards samengevoegd.";
    this.wizard_next_label = "Volgende";
    this.wizard_pinyin_label = "Pinyin";
    this.wizard_reading_label = "Reading Hanzi";
    this.wizard_select_one_vocab_error = "Gelieve minimum één woordenschatlijst te selecteren!";
    this.wizard_select_something_learn_error = "Gelieve iets om te leren te selecteren!";
    this.wizard_sentences_label = "Zinnen";
    this.wizard_simplified_characters_label = "Vereenvoudigd";
    this.wizard_traditional_characters_label = "Traditioneel";
    this.wizard_what_is_level_label = "Wat is uw niveau voor deze woordenschat?";
    this.wizard_what_want_learn_label = "Wat wilt u leren?";
    this.wizard_which_characters_label = "Welke karakters wilt u leren?";
    this.wizard_which_vocab_label = "Welke woordenschatlijst(en) wilt u studeren?";
    this.wizard_writing_label = "Writing Hanzi";
    /* Flashcard viewing and editing */
    this.card_add_text = "Flashcard toevoegen";
    this.card_delete_selected_confirm = "Wilt u de geselecteerde flashcards verwijderen?";
    this.card_deleted_format = "{0} flashcards verwijdert.";
    this.card_duplicate_selected_confirm = "Wilt u de geselecteerde flashcards verdubbelen?";
    this.card_duplicated_format = "{0} flashcards verdubbelt.";
    this.card_enabled_label = "Ingeschakeld";
    this.card_historical_bronze_label = "Brons";
    this.card_historical_forms_label = "Historische vormen";
    this.card_historical_greatseal_label = "Groot Zegel";
    this.card_historical_oracle_label = "Orakel";
    this.card_historical_smallseal_label = "Klein zegel";
    this.card_if_queued_must_be_enabled_error = "Als een flashcard in de wachtrij staat, moet het ook zijn ingeschakeld!";
    this.card_must_have_at_least_simp_trad_error = "U moet minimum één vereenvoudigd of traditioneel karakter hebben!";
    this.card_must_have_definition_error = "U moet een definite hebben!";
    this.card_queued_label = "In de wachtrij gezet";
    this.card_related_flashcards_label = "Gerelateerde flashcards";
    this.card_remove_selected_confirm = "Wilt u de geselecteerde flashcards uit deze categorie verwijderen?";
    this.card_removed_format = "{0} flashcards verwijdert.";
    this.card_saved_message = "Flashcard opgeslagen.";
    this.card_stroke_order_label = "Trekjesvolgorde";
    /* Category list and edit name page */
    this.category_all_name = "Alle";
    this.category_uncategorised_name = "Ongecategoriseerd";
    this.category_delete_selected_confirm = "Wilt u de geselecteerde categorieën verwijderen?";
    this.category_deleted_format = "{0} categories verwijdert";
    this.category_duplicate_sel_confirm = "Wilt u de geselecteerde categorieën verdubbelen?";
    this.category_duplicated_format = "{0} categories verdubbelt";
    this.category_edit_name = "Naam bewerken";
    this.category_must_enter_name_error = "U dient een naam voor deze categorie in te voeren!";
    this.category_name_exists_error = "Deze categorie naam bestaat al!";
    this.category_name_label = "Categorie naam";
    this.category_new_name = "Nieuwe categorie";
    this.category_saved_format = "Categorie '{0}' opgeslagen";
    /* Settings page */
    this.settings_auto_advance_label = "Automatisch vooruit";
    this.settings_auto_queue_label = "Automatisch in de wachtrij plaatsen van nieuwe flashcards";
    this.settings_background_colour_label = "Achtergrondkleur";
    this.settings_background_guides_label = "Background Gidsen";
    this.settings_border_colour_label = "Randkleur";
    this.settings_brush_colour_label = "Borstelkleur";
    this.settings_brush_width_label = "Borstelbreedte";
    this.settings_each_enabled_rating_must_have_val_error = "Elk van de ingeschakelde cijfertoetsen moet een waarde hebben.";
    this.settings_enable_tone_colours_label = "Enable Tone Colours";
    this.settings_general_label = "Algemene instellingen";
    this.settings_grid_colour_label = "Roosterkleur";
    this.settings_guide_star_label = "米 Ster";
    this.settings_guide_grid_label = "井 Rooster";
    this.settings_guide_cross_label = "十 Kruis";
    this.settings_guide_bar_label = "丨 Balk";
    this.settings_guide_none_label = "Geen gidsen";
    this.settings_hanzi_input_label = "Hanzi Teken Input";
    this.settings_must_enable_two_buttons_error = "U moet ten minste twee cijfertoesten inschakelen";
    this.settings_preferred_script_label = "Voorkeurs script";
    this.settings_rating_enabled_label = "Ingeschakeld";
    this.settings_ratings_label = "Ratings";
    this.settings_response_1_default = "Geen idee";
    this.settings_response_2_default = "Fout";
    this.settings_response_3_default = "Zo zo";
    this.settings_response_4_default = "Juist";
    this.settings_response_5_default = "Gemakkelijk";
    this.settings_saved_message = "Instellingen opgeslagen.";
    this.settings_simp_trad_label = "Vereenvoudigd [Traditioneel]";
    this.settings_simplified_label = "Enkel vereenvoudigd";
    this.settings_tone_1_label = "Toon 1";
    this.settings_tone_2_label = "Toon 2";
    this.settings_tone_3_label = "Toon 3";
    this.settings_tone_4_label = "Toon 4";
    this.settings_tone_5_label = "Toon 5";
    this.settings_tone_colours_label = "Pinyin toonkleuren";
    this.settings_tone_marks_label = "Pinyin toontekens";
    this.settings_trad_simp_label = "Traditioneel [Vereenvoudigd]";
    this.settings_traditional_label = "Enkel traditioneel";
    /* Maintenance page */
    this.maintenance_app_cache_label = "App Cache";
    this.maintenance_erase_label = "Erase";
    this.maintenance_erase_local_label = "Erase local data";
    this.maintenance_installed_label = "Installed";
    // this. maintenance_latest_label          = "Latest";
    this.maintenance_rebuild_label = "Rebuild";
    this.maintenance_rebuild_local_label = "Rebuild local storage";
    this.maintenance_refresh_label = "Refresh";
    this.maintenance_reload_label = "Reload";
    this.maintenance_reload_local_label = "Reload local data";
    this.maintenance_stand_alone_label = "Standalone";
    this.maintenance_storage_used_format = "Using {0} characters of local storage";
    this.maintenance_system_language_label = "System Language";
    this.maintenance_update_label = "Update";
    /* Import page */
    this.import_algorithms_label = "Algoritmes";
    this.import_chineasy_label = "Chineasy";
    this.import_default_category_label = "Default Categorie";
    this.import_downloading_file_message = "Bezig met downloaden van het importbestand, even geduld...";
    this.import_flashcards_label = "Flashcards";
    this.import_generic_error = "Import error";
    this.import_hsk1_label = "HSK 1 Woordenschat";
    this.import_hsk2_label = "HSK 2 Woordenschat";
    this.import_hsk3_label = "HSK 3 Woordenschat";
    this.import_hsk4_label = "HSK 4 Woordenschat";
    this.import_hsk5_label = "HSK 5 Woordenschat";
    this.import_hsk6_label = "HSK 6 Woordenschat";
    this.import_lessons_label = "Lessen";
    this.import_parsing_data_message = "Parseren van de importdata...";
    this.import_paste_text_label = "Plak tekst of een link (http://...) hier";
    this.import_pleco_text_file_label = "Pleco Text File";
    this.import_pleco_xml_file_label = "Pleco XML File";
    this.import_progress_label = "Voortgang";
    this.import_section_other = "Andere";
    this.import_section_quick = "Vlug";
    this.import_section_shanka = "Shanka";
    this.import_settings_label = "Instellingen";
    this.import_skritter_simp_label = "Skritter (Vereenvoudigd)";
    this.import_skritter_trad_label = "Skritter (Traditioneel)";
    this.import_stickystudy_label = "StickyStudy";
    this.import_timed_out_error = "Importeren time-out!";
    /* Export page */
    this.export_beginning_message = "Gaat exporteren...";
    this.export_categories_label = "Categorieën tot Export";
    this.export_do_export_label = "Exporteren";
    this.export_download_filename = "ShankaExport.txt";
    this.export_download_filetext = "Bestand downloaden";
    this.export_export_format_label = "Export Format";
    this.export_other_label = "Andere";
    this.export_success_message = "Alle data werd geëxporteerd";
    /* Question list and page */
    this.question_answer_label = "Antwoord";
    this.question_auto_generate_label = "Auto-genereren";
    this.question_calligraphy_label = "Kalligrafie";
    this.question_components_label = "Vraagcomponenten";
    this.question_cursive_label = "Cursief";
    this.question_definition_label = "Definitie";
    this.question_delete_selected_confirm = "Wilt u de geselecteerde vragen verwijderen?";
    this.question_deleted_format = "{0} vragen verwijderd";
    this.question_display_label = "Display";
    this.question_duplicate_sel_confirm = "Wilt u de geselecteerde vragen verdubbelen?";
    this.question_duplicated_format = "{0} vragen verdubbelt";
    this.question_hanzi_touch_label = "Hanzi Touchpad";
    this.question_inputs_label = "Inputs";
    this.question_name_label = "Vraag naam";
    this.question_name_text_error = "Uw vraag moet een naam en wat tekst hebben!";
    this.question_new_name = "Nieuwe vraag";
    this.question_notes_label = "Notities";
    this.question_pinyin_label = "Pinyin";
    this.question_saved_format = "Vraag '{0}' opgeslagen";
    this.question_simplified_label = "Vereenvoudigde Hanzi";
    this.question_stem_answer_error = "Uw vraag moet ten minste een stam en een antwoord hebben!";
    this.question_stem_label = "Stam";
    this.question_text_edit_label = "Tekst bewerken";
    this.question_text_label = "Vraagtekst";
    this.question_traditional_label = "Traditionele Hanzi";
    this.question_whats_the_format = "What is de {0}?";
    this.question_and_separator = "en";
    /* Lesson list and page */
    this.lesson_delete_selected_confirm = "Wilt u de geselecteerde lessen verwijderen?";
    this.lesson_deleted_format = "{0} lessen verwijdert";
    this.lesson_duplicate_selected_confirm = "Wilt u de geselecteerde lessen verdubbelen?";
    this.lesson_duplicated_format = "{0} lessen verdubbelt";
    this.lesson_must_include_1_cat_error = "U moet ten minste één categorie invoegen!";
    this.lesson_must_include_1_quest_error = "You must include at least one question!";
    this.lesson_name_already_exist_error = "Die les naam bestaat al!";
    this.lesson_name_cant_be_empty_error = "De les naam kan niet leeg zijn.!";
    this.lesson_name_label = "Les naam";
    this.lesson_new_name = "Nieuwe les";
    this.lesson_review_mode_name = "(Review)";
    this.lesson_reviewing_label = "Herziening";
    this.lesson_saved_format = "Les '{0}' opgeslagen";
    /* Algorithm list and page */
    this.algorithm_adjustment_speed_positive_error = "Aanpassing snelheid moet positief zijn!";
    this.algorithm_any_element_probability_0_1_error = "Any Element Probability must be between 0 and 1!";
    this.algorithm_cannot_delete_last_error = "Kan het laatste algoritme niet verwijderen";
    this.algorithm_daily_correct_target_positive_int_error = "Daily Correct Target moet een positief geheel getal zijn!";
    this.algorithm_daily_minutes_target_positive_int_error = "Daily Minutes Target moet een positief geheel getal zijn!";
    this.algorithm_daily_new_target_positive_int_error = "Daily New Target moet een positief geheel getal zijn!";
    this.algorithm_default_knowledge_rate_0_1_error = "Default Knowledge Rate moet tussen 0 and 1 zijn!";
    this.algorithm_delete_selected_confirm = "Wilt u de geselecteerde algoritmes verwijderen?";
    this.algorithm_duplicate_selected_confirm = "Wilt u de geselecteerde algoritmes verdubbelen?";
    this.algorithm_first_element_probability_0_1_error = "First Element Probability moet tussen 0 and 1 zijn!";
    this.algorithm_minimum_interval_postive_0_error = "Minimum Interval moet positief of gelijk zijn aan nul!";
    this.algorithm_minimum_unknown_card_positive_int_error = "Minimum Unknown Cards moeten een positief geheel getal zijn!";
    this.algorithm_name_cant_be_empty_error = "Algoritme naam kan niet leeg zijn!";
    this.algorithm_threshold_knowledge_rate_0_1_error = "Threshold Knowledge Rate moet tussen 0 and 1 zijn!";
    this.algorithm_adjustment_speed = "Aanpassing snelheid";
    this.algorithm_any_element_probability = "Any Element Probability";
    this.algorithm_choose_label = "Kies een algoritme";
    this.algorithm_current_label = "Huidige";
    this.algorithm_daily_correct_target = "Dagelijks doel correct";
    this.algorithm_daily_minutes_target = "Dagelijks doel minuten";
    this.algorithm_daily_new_target = "Dagelijks doel nieuw";
    this.algorithm_default_knowledge_rate = "Default Knowledge Rate";
    this.algorithm_deleted_format = "{0} algoritmes verwijdert";
    this.algorithm_duplicated_format = "{0} algoritmes verdubbelt";
    this.algorithm_first_element_prob = "First Element Probability";
    this.algorithm_history_today = "Vandaag";
    this.algorithm_history_yesterday = "Gisteren";
    this.algorithm_knowledge_rate_display = "Kennis graad";
    this.algorithm_knowledge_rate_trouble = "Problemen";
    this.algorithm_knowledge_rate_learned = "Geleerd";
    this.algorithm_knowledge_rate_learning = "Leren";
    this.algorithm_minimum_interval = "Minimale interval";
    this.algorithm_minimum_unknown_cards = "Minimale ongekende flashcards";
    this.algorithm_name_label = "Naal";
    this.algorithm_new_name = "Nieuw Algoritme";
    this.algorithm_parameters = "Parameters";
    this.algorithm_saved_format = "Algoritme '{0}' opgeslagen";
    this.algorithm_study_settings = "Studie instellingen";
    this.algorithm_threshold_kn_rate = "Threshold Knowledge Rate";
    /* Local storage rebuild and load */
    this.local_storage_cannot_save_ios = "Kan niet worden opgeslagen in de lokale opslag. Uw schijfruimte kan overschreden zijn of u bevindt zich in een privé-sessie.";
    this.local_storage_cannot_save_other = "Kan niet worden opgeslagen in de lokale opslage, uw schijfruimte is overschreden.";
    this.local_storage_erase_confirm = "Wilt u de lokale opslage van gegevens verwijderen?";
    this.local_storage_erased_message = "Local storage data was nuked!";
    this.local_storage_rebuild_confirm = "Herbouw lokale opslag?";
    this.local_storage_rebuilt_ok_message = "De lokale opslag werd herbouwd - geen fouten gevonden!";
    this.local_storage_errors_detected_resolved_error = "Fouten in de lokale opslag werden gevonden en opgelost.\n\n" + "U hebt waarschijnlijk ontbrekende of verbroken lessen, vragen, categorieën of kaarten.\n\n" + "Meer gedetailleerde informatie is beschikbaar in de JavaScript-console.";
    /* Help pages */
    this.help_contents_label = "Help";
    this.help_main_page = "<h3>Voordat u begint...</h3>" + "<p>Voegt u eerst onze hoofdpagina (welkomstpagina) toe aan het startscherm van uw toestel.</p>" + "<p>Dit laat u toe de app te gebruiken zelfs als u offline bent. De app zal eveneens op een volledig scherm te zien zijn, zodat u meer ruimte krijgt om te studeren.</p>" + "<p>Voor iOS-systemen gaat dit als volgt: u klikt op het pictogram in het midden van de onderkant van uw scherm, dit lijkt op een doos met pijl naar boven, daarna kiest u voor 'Add to Home Screen'.</p>" + "<p>Vergelijkbare functionaliteit is beschikbaar op alle moderne webbrowsers op Windows, Android, Mac OS, Windows Mobile en Blackberry.</p>";
    this.help_lessons = "<h3>Geselecteerde lessen</h3>" + "<p>Als u studeert zullen enkel vragen en categorieën van de lessen die u aanvinkte worden gebruikt.</p>";
    this.help_card_info = "<h3>Categorieën</h3>" + "<p>Toont de categorieën, indien van toepassing, waartoe de huidige kaart is aangewezen.</p>" + "<h3>Gerelateerde flashcards</h3>" + "<p>Toont alle flashcards die tekens gemeen hebben met de huidige flashcard.</p>" + "<h3>Trekjesvolgorde</h3>" + "<p>Sommige (maar niet alle) karakters hebben hebben een trekjesvolgorde, voorzien door the Wikimedia Foundation.</p>" + "<h3>Historische vormen</h3>" + "<p>The Wikimedia Foundation verzamelde tal van representatieve historische vormen voor Chinese karakters. " + "Deze kunnen bijdragen aan het begrijpen van enkele pictogrammen.</p>";
    this.help_practice = "<h3>Just Relax!</h3>" + "<p>Op deze oefenpagina kunt u achterover leunen en op een rustige wijze karakters leren, dewelke u maar wilt!.</p>" + "<p>Voer de karakters die u wilt leren in het tekstvak in.</p>" + "<p>Alle andere functies van de Studie-pagina is beschikbaar.</p>" + "<h3>Search</h3>" + "<p>U kunt zoeken via de hanzi en pinyin van alle flashcards door op het vergrootglas te klikken." + "Het zoekprogramma zoekt voor de karakters in het tekstvak en zal een lijst met resultaten weergeven. Als er slechts één resultaat is, zal het rechtstreeks naar die flashcard doorgaan.</p>";
    this.help_study = "<p>Dit is de pagina waar u de meeste tijd zal doorbrengen, met het testen d.m.v. flashcards.</p>" + "<h3>Stem</h3>" + "<p>De stam van de vraag is de informatie die u krijgt.</p>" + "<h3>Answer</h3>" + "<p>Het antwoord is de informatie die u levert. Type of teken het antwoord, en klik nadien op 'Toon het antwoord' om te zien of u juist bent.</p>" + "<h3>Hanzi Input</h3>" + "<p>Als een hanzi input wordt weergegeven kan u zoveel tekens trekken als u maar wilt. Daarbovenop kunt u dit ook telkens herhalen." + "Door op de 下 toets te klikken ga je naar het volgende rooster, mocht u zich reeds op het laatste rooster bevinden, dan voegt deze knop een nieuw toe. U kan ook" + "op de roosters klikken om ze te seleteren. Andere controls laten u het kleur van uw pen kiezen, tonen/verbergen een 'overlay' van het karakter of laten u uw tekening hermaken., " + "U kunt het huidige rooster eveneens weer vrijmaken.</p>" + "<h3>Display</h3>" + "<p>Wat extra informatie, zoals notities waarop u niet wordt beoordeeld, kan ook naast het antwoord verschijnen.</p>" + "<h3>Beroordeling</h3>" + "<p>Beoordeel jezelf op elk deel van het antwoord, om te bepalen wanneer u de volgende keer zal worden getest op de huidige flashcard." + "U kunt dit meerdere keren tegelijk doen.</p>";
    this.help_categories = "<p>Categories are sometimes called word lists in other systems. They help you to organise your flashcards, and to tell the app which flashcards you want to study.</p>" + "<p>A card can exist in multiple categories, or none at all in which case it is 'uncategorised'.</p>";
    this.help_progress = "<p>De voortgangspagina toont hoeveel woorden u kent, hoe lang u studeerde, en hoeveel flashcards u hebt ingestudeerd, " + "elke dag dat u de app gebruikt.</p>";
    this.help_history = "<p>De geschiedenis pagina toont u alle flashcards die u instudeerde, in de volgorde dat u ze instudeerde. " + "Elke flashcard zal maar een enkele keer in de lijst verschijnen.</p>";
    this.help_import = "<p>Met deze pagina kunt u data importeren uit de ingebouwde woordenlijsten, of van een ander systeem.</p>";
    this.help_export = "Export help" + "<p>Via exporteren maakt u een back-up van uw gegevens. U kan eveneens deze gegevens overplaatsen naar de Shanka app op een ander (flashcard) systeem.</p>" + "<h3>Export Result</h3>" + "<p>Kopieer de tekst in de Teksteditor en plak deze in een andere app. " + 'U kunt ook op de "Download file" knop klikken.</p>';
    this.help_settings = "<p>Met instellingen kunt u de app naar believen tweaken.</p>" + "<h3>Algemene instellingen</h3>" + "<p>Als auto voortgang is ingeschakeld, zal de volgende flashcard verschijnen zodra u de voorgaande hebt beoordeelt.</p>" + "<h3>Hanzi drawing input</h3>" + "<p>Deze instellingen bepalen het uiterlijk van de hanzi drawing input in de studeer- en oefenmodus.</p>" + "<h3>Achtergrondgidsen</h3>" + "<p>De vorm van de hanzi achtergrondgids kan hier worden geconfigureerd.</p>" + "<h3>Pinyin Toon Kleuren</h3>" + "<p>Indien ingeschakeld, zal dit de weergegeven kleuren voor elke lettergreep weergeven.</p>" + "<h3>Voorkeur schrift</h3>" + "<p>U kunt zelf beslissen of u liever vereenvoudigde, traditionele hanzi, of een combinatie van de twee wilt zien.</p>" + "<h3>Ratings</h3>" + "<p>Kies de namen die u wilt zien voor de beoordelingen in de studie-pagina, en alle die u niet wilt gebruiken.</p>";
    this.help_queue = "<p>De wachtrij toont u alle woorden die u momenteel studeert, en laat u weten hoe goed u ze allemaal kent. " + "De woorden zijn geschatte volgorde waarin ze worden bestudeerd. De orde is wel willekeurig, zodat het niet voorspelbaar wordt.</p>";
    this.help_algorithms = "<h3>Shanka Algoritme</h3>" + "<p>Dit algoritme bepaalt de volgorde waarin de flashcards aan u worden getoond, en hoeveel nieuwe flashcards er worden toegevoegd..</p>" + "<h3>Studie instellingen</h3>" + "<p><li><b>Minimum Unknown Cards </b> - Als het aantal onbekende kaarten nder dit niveau valt, dan zullen nieuwe flashcards worden toegevoegd aan de wachtrij.</p>" + "<p><li><b>Daily Correct Target</b> - Dit is het minimum aantal kaarten die u per dag juist zou moeten hebben.</p>" + "<p><li><b>Daily New Target</b> - Dit is het aantal nieuwe kaarten om dagelijks toe te voegen.</p>" + "<p><li><b>Daily Minutes Target</b> - Dit is het studiedoel per dag, weergegeven in minuten.</p>" + "<h3>Parameters</h3>" + "<p><li><b>Default Knowledge Rate</b> - Kennisgraad <i><b>kn_rate</b></i> is hoe goed je elk stukje informatie in een flashcard kent. Nul is helemaal niet, één is perfect.</p>" + "<p><li><b>Threshold Knowledge Rate</b> - De kennisgraad waarbij elk stukje informatie zal worden gezien als gekend.</p>" + "<p><li><b>Adjustment Speed</b> - De snelheid waarbij de kennis voor elk stukje informatie zal evolueren naar nul/één als u vragen fout/goed beantwoord. " + "If this adjustment speed is <i><b>a</b></i>, then when a question is answered incorrectly, <i><b>kn_rate<sub>new</sub> = kn_rate<sub>old</sub> / a</b></i>. " + "Als u een vraag juist beantwoord, <i><b>kn_rate<sub>new</sub> = 1 + (kn_rate<sub>old</sub> - 1) / a</b></i>. If the five answer choices are numbered 1-5, then " + "answer 3 will not change the knowledge rate, answers 2 and 4 are wrong and right, and answers 1 and 5 count as two wrong or right answers respectively.</p>" + "<p><li><b>Any Element Probability</b> - The probability that the next flashcard will be randomly drawn from anywhere in the queue, instead of the front of the queue. " + "This setting allows even very old cards to be occasionally sprinkled into the studying. If you don't want this to happen, set the value to zero.</p>" + "<p><li><b>First Element Probability</b> - If this probability is <i><b>p</b></i>, and the first flashcard in the queue is number <i><b>0</b></i>, then flashcard " + "<i><b>n</b></i> will be chosen as the card to study with probability <i><b>p &times; (1-p)<sup>n</sup></b></i>. " + "As the sum for all flashcards in the queue will be slightly less than 1, the leftover probability is assigned to the first element.</p>" + "<p><li><b>Minimum Interval</b> - The minimum number of cards that must be shown before a card is repeated, even if it is always marked as unknown.</p>";
    this.help_questions = "<h3>Vraag naam</h3> " + "<p>Enkel gebruikt om de vraag in de vragenlijst te identificeren.</p> " + "<h3>Vraag tekst</h3> " + '<p>De tekst die bovenaan de kaart verschijnt, e.g. "Wat is de pinyin transcriptie voor dit karakter?"</p> ' + "<p>Laat de auto-generate checkbox aangevinkt als u wil dat de app deze tekst creërt a.d.h. van de geselecteerde input, stam en antwoorden.</p> " + "<h3>Inputs</h3> " + "<p>Deze inputs worden weergegeven naast de vraag. Als je Chinees" + "typet in de edit box, dan kan je ofwel het pinyin het van je systeem gebruiken " + "ofwel IME ofwel via de handgeschreven input</p> " + "<h3>Stam</h3> " + "<p> De 'voorzijde' van de kaart, voor deze vraag.</p> " + "<h3>Antwoord</h3> " + "<p> Het deel op de 'achterzijde' van de kaart, waarop je wordt beoordeeld.</p> " + "<h3>Display</h3> " + "<p> Andere informatie op de 'achterzijde' van de kaart, zoals weergegven naast het antwoord.</p>";
    this.help_maintenance = "<h3>Reload</h3>" + "<p>Reloading zal de app heropstarten, gebruikmakende van de informatie in de lokale opslag. " + " Dit kan helpen mocht u in de problemen geraken, of als u per abuis verschillende malen de app draait.</p>" + "<h3>Standalone</h3>" + "<p>Deze date wordt gebruik bij het opsporen van problemen van de app. Het zou moeten 'true' zijn, als u deze app draait in" + "'de homescreen' of 'standalone' modus, en 'false' als u dit doet vanuit een web browser.</p>" + "<h3>Systeemtaal</h3>" + "<p>Dit is de taal, zoals aangegeven door uw systeem.</p>" + "<h3>App Cache</h3>" + "<p>Deze web app bewaart informatie over de flashcards etc. in de lokale opslage. De cache is hiervan afgezonderd, en" + "downloads de eigenlijke applicatie pagina's zodat u ze offline kunt gebruiken. Als de app cache status" + "UNCACHED is, dan zal het waarschijnlijk niet mogelijk zijn om offline toegang te krijgen tot de app. Om offline gebruik te waarborgen, moet je zorgen voor" + "een app cache status CACHED.</p>" + "<h3>Update Web App</h3>" + "<p>Om de laatste versie van deze app the installeren, klikt u 'Update Web App' als u merkt dat de laatste versie" + "anders is dan de huidige geïnstalleerde versie. U zou deze functie niet nodig hebben als u" + "de app updated bij het opstarten</p>" + "<h3>Lokale opslag</h3>" + "<p>Zie <a href='http://dev-test.nemikor.com/web-storage/support-test/'>this page</a> " + "om uw lokale opslagslimiet te berekenen, dit is meestal rond 2,5M afhankelijk van uw browser." + "Note: 1k=2<sup>10</sup>=1024 characters, 1M=2<sup>20</sup> characters. Meestal is 1 karakter = 2 bytes, dus" + "2.5M karakters = 5MB ruimte.</p>" + "<h3>Lokale data verwijderen</h3>" + "<p> Bij problemen kan u opteren om de lokale data te verwijderen. Als u uw huidige geschiedenis " + "wilt behouden, dient u eerst een backup van uw data te exporteren.</p>";
    this.help_wizard = "<p>Gebruik deze wizard ter vereenvoudiging van het creëren van lessen.</p>" + "<p>U kan deze wizard meer dan eens gebruiken voor het creëren van meerdere lessen, om dan te kiezen welke les u wilt instuderen via het lessenvenster.</p>";
    this.help_about = "<h3>License</h3>" + "<p>You are free to copy, distribute, and modify this code, under a similar license " + "to this one. You must give the original author (me) credit in any dervied work. " + "You may not use any part of this code for any commercial purpose without obtaining " + "my permission.</p>" + "<p>Alan Davies 2014 <a href='mailto:alan@hskhsk.com'>alan@hskhsk.com</a></p>" + "<p>See <a href='http://hskhsk.com/shanka'>hskhsk.com/shanka</a> for more information.</p>" + "<h3>Credits</h3>" + "<li>Customised version of the UI library <a href='http://maker.github.io/ratchet/'>Ratchet</a> provides the app's look and feel<br />" + "<li>Sidebar code is <a href='https://github.com/jakiestfu/Snap.js/'>Snap.js</a> by jakiestfu<br />" + "<li>Initial app structure inspired by <a href='http://html5db.desalasworks.com/'>sqldb example</a> by Steven de Salas <br />" + "<li><a href='http://pieroxy.net/blog/pages/lz-string/index.html'>lz-string</a> compression routines by Pieroxy<br />" + "<li>Touchpaint control is a heavily modified version of the <a href='http://gregmurray.org/ipad/touchpaint/'>original by Greg Murray</a> <br />" + "<li>Colour Picker is Jan Odvárko's <a href='http://jscolor.com/'>jscolor</a> <br />" + "<li>Shanka algorithm inspired by Adam Nagy of Cybertron BT's now-defunct <a href='https://web.archive.org/web/20100424220218/http://memodrops.com/algorithm.html'>Memodrops</a>.<br />" + "<li>iPhone taps are more responsive thanks to <a href='https://github.com/ftlabs/fastclick'>FastClick</a><br />" + "<li>Standalone web app scrolling problems are fixed by <a href='https://github.com/jakiestfu/AppScroll.js/'>AppScroll</a><br />" + "<li><a href='http://commons.wikimedia.org/wiki/Commons:Stroke_Order_Project'>Stroke order animations</a> and " + "<a href='http://commons.wikimedia.org/wiki/Commons:Ancient_Chinese_characters_project'>Ancient Chinese Characters</a> " + "are provided by the <a href='http://commons.wikimedia.org/'>Wikimedia Foundation</a><br />" + "<li>Code was edited using <a href='http://notepad-plus-plus.org/'>Notepad++</a><br />" + "<li>Website hosted using <a href='http://aws.amazon.com/'>Amazon Web Services</a><br />" + "<li>Uploading and manipulating files on Amazon S3 is made a lot easier with NetSDK Software's <a href='http://s3browser.com/'>S3 Browser</a><br />" + "<li>Many problems were solved with the help of the comments and solutions on <a href='http://stackoverflow.com/'>Stack Overflow</a><br />" + "<h3>Thanks</h3>" + "<li>Many thanks to the Chinese Forums, Pleco, and Skritter user communities, and the many beta testers who have found bugs and suggested improvements.<br />" + "<li>Thank you also to the translators who are working on internationalising this app!";
    // Progress page and progress displayed on main page
    this.main_cards_learned_label = "geleerd";
    // this. main_cards_queued_label  = "in de wachtrij";
    this.main_cards_total_label = "gotaal";
    this.progress_studied_label = "studeerde";
    this.progress_total_label = "Gotaal";
    this.progress_daily_label = "Dagelijkse";
    this.progress_today_label = "Vandaag";
    this.progress_seconds = "seconden";
    this.progress_minutes = "minuten";
    this.progress_hours = "uren";
    this.progress_days = "dagen";
    this.progress_weeks = "weken";
    this.progress_years = "jaar";
    this.progress_list_format = "Studeerde {0} en {1} leerde kaarten in {2}";
    /* Translated version of this section should be modified to show
 * which files have and haven't been translated */
    this.language_unknown_error = "Unknown language code:";
    this.import_hsk1_label = "HSK 1 Words";
    this.import_hsk2_label = "HSK 2 Words (Engels)";
    this.import_hsk3_label = "HSK 3 Words (Engels)";
    this.import_hsk4_label = "HSK 4 Words (Engels)";
    this.import_hsk5_label = "HSK 5 Words (Engels)";
    this.import_hsk6_label = "HSK 6 Words (Engels)";
    this.import_hsk1_sentences_label = "HSK 1 Zinnen";
    this.import_hsk2_sentences_label = "HSK 2 Zinnen";
    this.import_hsk3_sentences_label = "HSK 3 Zinnen";
    this.import_chineasy_label = "Chineasy";
    this.import_hsk1_category = "HSK 1";
    this.import_hsk2_category = "HSK 2";
    this.import_hsk3_category = "HSK 3";
    this.import_hsk4_category = "HSK 4";
    this.import_hsk5_category = "HSK 5";
    this.import_hsk6_category = "HSK 6";
    this.import_hsk1_sentences_category = "HSK 1 句子";
    this.import_hsk2_sentences_category = "HSK 2 句子";
    this.import_hsk3_sentences_category = "HSK 3 句子";
    this.import_chineasy_category = "Chineasy";
    this.import_hsk1_location = "lists/HSK 2012 L1 nl.txt";
    this.import_hsk2_location = "lists/HSK 2012 L2.txt";
    this.import_hsk3_location = "lists/HSK 2012 L3.txt";
    this.import_hsk4_location = "lists/HSK 2012 L4.txt";
    this.import_hsk5_location = "lists/HSK 2012 L5.txt";
    this.import_hsk6_location = "lists/HSK 2012 L6.txt";
    this.import_hsk1_sentences_location = "lists/HSK 2012 Examples L1 nl.txt";
    this.import_hsk2_sentences_location = "lists/HSK 2012 Examples L2 nl.txt";
    this.import_hsk3_sentences_location = "lists/HSK 2012 Examples L3 nl.txt";
    this.import_chineasy_location = "lists/Chineasy nl.txt";
};

/*
    Shanka HSK Flashcards - lang_spanish.js version 1

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any dervied work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

    This file was translated by:
        Name:Nicolás Godoy
        Email:nicolasgastongodoy@gmail.com
        Date:27/01/2014
    
*/
/* Start of language definition */
var lang_spanish = function() {
    /* These strings describe the language of this file */
    this.this_language = "Español";
    this.this_switch_language = "Cambia el idioma a español";
    /* These strings describe all currently supported languages */
    this.lang_interface_language = "Cambiar idioma";
    this.lang_english_language = "Inglés";
    this.lang_dutch_language = "Holandés";
    this.lang_spanish_language = "Español";
    this.lang_german_language = "Alemán";
    this.lang_french_language = "Francés";
    this.lang_italian_language = "Italiano";
    /* Strings to do with the running of the app*/
    this.app_cancel_silences_error = "('Cancelar' silencia  futuros errores)";
    this.app_exception_error = "Excepción";
    this.app_generic_error = "Error";
    this.app_initialising_message = "<br /><i>Tu buscador soporta HTML5.<br /><br />Cargando...</i><br /><br /><br /><br />";
    this.app_new_version_download_confirm = "Una nueva versión de Shanka ha sido cargada.¿Regargar la applicación ahora?";
    this.app_no_html5_message = "<h3>Tu buscador no soporta HTML5. Por favor use un buscador moderno (Safari o Chrome) para ejecutar esta applicación.</h3><br /><br /><br />";
    this.app_nojavascript_error = "TU buscador no tiene a JavaScript habilitado. Por favor abilite JavaScript o usa un buscador diferente.";
    this.app_offline_status = "FUERA DE LINEA";
    this.app_please_wait_a_moment = "Por favor espere un momento...";
    this.app_support_see_message = "Por soporte vé a...<a href='http://hskhsk.com/shanka'>hskhsk.com/shanka</a>";
    this.app_was_reloaded_message = "¡La applicación ha sido recargada con éxito!";
    /* Generic re-usable strings for buttons etc. */
    this.gen_add_text = "Agregar";
    this.gen_all_text = "Todo";
    this.gen_cancel_text = "Cancelar";
    this.gen_delete_text = "Borrar";
    this.gen_duplicate_text = "Duplicar";
    this.gen_edit_all_text = "Editar Todo";
    this.gen_remove_text = "Remover";
    this.gen_save_text = "Guardar";
    /* Main page strings */
    this.main_beginners_quickstart_label = "'Principiantes' Comienzo Rápido";
    this.main_browser_no_html5_error = "Tú buscador no soporta HTML5. Por favor use un buscador moderno (Safari o Chrome) para ejecutar esta applicación.";
    this.main_choose_option_begin_label = "¡Elija una opción para comenzar a aprender chino!";
    this.main_menu_help_label = "Los menús <b>&#8801;</b> y la ayuda <b>?</b> están arriba en las esquinas.";
    this.main_setup_wizard_label = "Actualización del Asistente de Ayuda";
    /* Titles of all pages */
    this.page_about_title = "Sobre";
    this.page_add_algorithm_title = "Adicionar Algorítmos";
    this.page_add_category_title = "Adicionar Categorías";
    this.page_add_flashcard_title = "Adicionar Flashcard";
    this.page_add_lesson_title = "Adicionar Lección";
    this.page_add_question_title = "Agregar Pregunta";
    this.page_algo_shanka_title = "Algorítmo de Shanka";
    this.page_algorithms_title = "Algoritmos";
    this.page_card_info_title = "Información de Flashcards";
    this.page_cards_title = "Flashcards";
    this.page_categories_title = "Categorías";
    this.page_category_title = "Categoría";
    this.page_edit_algorithm_title = "Editar Algoritmo";
    this.page_edit_algorithms_title = "Editar Algoritmo";
    this.page_edit_categories_title = "Editar Categoría";
    this.page_edit_category_name_title = "Editar Categoría";
    this.page_edit_flashcard_title = "Editar Flashcard";
    this.page_edit_lesson_title = "Editar Lección";
    this.page_edit_lessons_title = "Editar Lecciones";
    this.page_edit_question_title = "Editar Preguntas";
    this.page_edit_questions_title = "Editar Preguntas";
    this.page_export_title = "Exportar";
    this.page_help_contents_title = "Contenido de Ayuda";
    this.page_help_prefix_title = "Ayuda";
    this.page_history_title = "Historia";
    this.page_import_title = "Importar";
    this.page_initialising_title = "Inicializando";
    this.page_lessons_title = "Lecciones";
    this.page_main_app_title = "Shanka 闪卡";
    this.page_main_title = "Página Principal";
    this.page_maintenance_title = "Mantenimiento";
    this.page_pleco_import_title = "Importar Pleco ";
    this.page_practice_title = "Práctica";
    this.page_progress_title = "Progreso";
    this.page_question_title = "Pregunta";
    this.page_questions_title = "Preguntas";
    this.page_queue_title = "Enlistadas";
    this.page_settings_title = "Configuraciones";
    this.page_skritter_import_title = "Importe de Skritter";
    this.page_sticky_import_title = "Importe de StickyStudy";
    this.page_study_title = "Estudiar";
    this.page_wizard1_title = "Asistente de ayuda 1/4";
    this.page_wizard2_title = "Asistente de ayuda 2/4";
    this.page_wizard3_title = "Asistente de ayuda 3/4";
    this.page_wizard4_title = "Asistente de ayuda 4/4";
    this.page_wizard_title = "Asistente de ayuda";
    /* Study page */
    this.study_edit_text = "Editar";
    this.study_field_question_name_calligraphy = "Caligrafía";
    this.study_field_question_name_cursive = "Cursiva";
    this.study_field_question_name_definition = "Definición";
    this.study_field_question_name_notes = "Notas";
    this.study_field_question_name_pinyin = "Pinyin";
    this.study_field_question_name_simplified = "Simplificado";
    this.study_field_question_name_traditional = "Tradicional";
    this.study_field_question_text_calligraphy = "Caligrafía";
    this.study_field_question_text_cursive = "Cursiva";
    this.study_field_question_text_definition = "Definicion";
    this.study_field_question_text_input_draw = "Dibujar";
    this.study_field_question_text_input_type = "Escribir";
    this.study_field_question_text_notes = "Notas";
    this.study_field_question_text_pinyin = "Pinyin";
    this.study_field_question_text_simplified = "Hanzi";
    this.study_field_question_text_traditional = "Hanzi";
    this.study_invalid_card_id_error = "Dirección inválida de carta ";
    this.study_invalid_question_id_error = "ID de pregunta inválido: ";
    this.study_no_cards_questions_use_wizard_error = "No hay preguntas o flashcards para estudiar ¡Por favor use el Comienzo Rápido,el Asistente o Importar!";
    this.study_practice_short_text = "Pract.";
    this.study_practice_text = "Práctica";
    this.study_search_no_results = "Sin resultados";
    this.study_search_result_label = "Resultados";
    this.study_sentence_label = "Oraciones";
    this.study_show_answer_label = "Mostrar Respuesta";
    this.study_study_text = "Estudiar";
    /* Wizard pages */
    this.wizard_added_lesson_message = "Lección agregada.";
    this.wizard_added_question_message = "Pregunta agregada.";
    this.wizard_algorithm_name_advanced = "Avanzado";
    this.wizard_algorithm_name_beginner = "Principiante";
    this.wizard_algorithm_name_intermediate = "Intermediario";
    this.wizard_algorithm_name_random = "Aleatorio";
    this.wizard_algorithm_name_randomreview = "Revisar aleatoreamente";
    this.wizard_algorithm_name_review = "Revisar";
    this.wizard_both_characters_label = "Ambas";
    this.wizard_calligraphy_label = "Caligrafía";
    this.wizard_created_algorithm_message = "Algoritmo creado";
    this.wizard_created_flashcards_format = "{0} flashcards creadas.";
    this.wizard_created_lesson_name = "Asistente Creado";
    this.wizard_cursive_label = "Cursiva";
    this.wizard_definition_label = "Definición";
    this.wizard_done_label = "¡Hecho!";
    this.wizard_found_lesson_message = "Lección encontrada.";
    this.wizard_found_question_message = "Pregunta encontrada.";
    this.wizard_merged_flashcards_format = "{0} flashcards combinadas.";
    this.wizard_next_label = "Próximo";
    this.wizard_pinyin_label = "Pinyin";
    this.wizard_reading_label = "Lectura Hanzi";
    this.wizard_select_one_vocab_error = "¡Por favor elige al menos una lista de vocabulario!";
    this.wizard_select_something_learn_error = "¡Por favor elige algo para aprender!";
    this.wizard_sentences_label = "Oraciones";
    this.wizard_simplified_characters_label = "Simplificado";
    this.wizard_traditional_characters_label = "Tradicional";
    this.wizard_what_is_level_label = "¿Cuál es tu nivel para este vocabulario?";
    this.wizard_what_want_learn_label = "¿Qué quisieras aprender?";
    this.wizard_which_characters_label = "¿Qué carácteres quisieras aprender?";
    this.wizard_which_vocab_label = "¿Cuál lista o listas de vocabulario quisieras aprender?";
    this.wizard_writing_label = "Escritura Hanzi";
    /* Flashcard viewing and editing */
    this.card_add_text = "Agregar Carta";
    this.card_delete_selected_confirm = "¿Deseas borrar cartas selecionadas?";
    this.card_deleted_format = "{0} flashcards borradas.";
    this.card_duplicate_selected_confirm = "¿Deseas duplicar cartas selecionadas?";
    this.card_duplicated_format = "{0} flashcards duplicadas.";
    this.card_enabled_label = "Habilitado";
    this.card_historical_bronze_label = "Bronce";
    this.card_historical_forms_label = "Formas Históricas";
    this.card_historical_greatseal_label = "Gran Seal";
    this.card_historical_oracle_label = "Oráculo";
    this.card_historical_smallseal_label = "Pequeño Seal";
    this.card_if_queued_must_be_enabled_error = "Si una carta está enlistada ¡también tiene que estar habilitada!";
    this.card_must_have_at_least_simp_trad_error = "Debes tener al menos un carácter simplificado o tradicional!";
    this.card_must_have_definition_error = "¡Debes tener una definición!";
    this.card_queued_label = "Enlistada";
    this.card_related_flashcards_label = "Flashcards Relacionadas";
    this.card_remove_selected_confirm = "¿Deseas remover las flashcards seleccionadas de esta categoría?";
    this.card_removed_format = "{0} flashcards borradas.";
    this.card_saved_message = "Carta Guardada.";
    this.card_stroke_order_label = "Orden de Trazos";
    /* Category list and edit name page */
    this.category_all_name = "Todos";
    this.category_uncategorised_name = "Descategorizado";
    this.category_delete_selected_confirm = "¿Deseas borrar las categorías selecionadas?";
    this.category_deleted_format = "{0} categorías borradas";
    this.category_duplicate_sel_confirm = "¿Deseas duplicar las categorías seleccionadas?";
    this.category_duplicated_format = "{0} categories duplicadas";
    this.category_edit_name = "Editar Nombre";
    this.category_must_enter_name_error = "¡Debes ingresar un nombre de categoría!";
    this.category_name_exists_error = "¡El nombre de esa categoría ya existe!";
    this.category_name_label = "Nombre de la Categoría";
    this.category_new_name = "Nueva Categoría";
    this.category_saved_format = "{0} categorías guardadas";
    /* Settings page */
    this.settings_auto_advance_label = "Auto Avance";
    this.settings_auto_queue_label = "Auto-enlistar Nuevas Flashcard";
    this.settings_background_colour_label = "Color de Fondo";
    this.settings_background_guides_label = "Guías de Fondo";
    this.settings_border_colour_label = "Color del Margen ";
    this.settings_brush_colour_label = "Color del Pincel";
    this.settings_brush_width_label = "Anchura del Pincel";
    this.settings_each_enabled_rating_must_have_val_error = "Cada uno de los  botones de clasificación habilitados deben tener una valoración";
    this.settings_enable_tone_colours_label = "Color de Tonos Habilitados";
    this.settings_general_label = "Configuraciones Generales";
    this.settings_grid_colour_label = "Paleta de Colores";
    this.settings_guide_star_label = "米 Estrella";
    this.settings_guide_grid_label = "井 Cuadrícula";
    this.settings_guide_cross_label = "十 Cruz";
    this.settings_guide_bar_label = "丨 Barra";
    this.settings_guide_none_label = "Sin Guías";
    this.settings_hanzi_input_label = "Entrada del Dibujo Hanzi";
    this.settings_must_enable_two_buttons_error = "Debes  habilitar al menos dos de los botones de clasificación";
    this.settings_preferred_script_label = "Secuencia de Comando Preferido";
    this.settings_rating_enabled_label = "Habilitado";
    this.settings_ratings_label = "Calificaciones";
    this.settings_response_1_default = "No tengo idea";
    this.settings_response_2_default = "Incorrecto";
    this.settings_response_3_default = "Más o Menos";
    this.settings_response_4_default = "Correcto";
    this.settings_response_5_default = "Fácil";
    this.settings_saved_message = "Configuraciónes Guardadas.";
    this.settings_simp_trad_label = "Simplificado [Tradicional]";
    this.settings_simplified_label = "Solo Simplificado";
    this.settings_tone_1_label = "Tono 1";
    this.settings_tone_2_label = "Tono 2";
    this.settings_tone_3_label = "Tono 3";
    this.settings_tone_4_label = "Tono 4";
    this.settings_tone_5_label = "Tono 5";
    this.settings_tone_colours_label = "Colores de los tonos de Pinyin";
    this.settings_tone_marks_label = "Marcas de los tonos de Pinyin";
    this.settings_trad_simp_label = "Traditional [Simplificado]";
    this.settings_traditional_label = "Solo Tradicional";
    /* Maintenance page */
    this.maintenance_app_cache_label = "Caché de la Aplicación";
    this.maintenance_erase_label = "Borrar";
    this.maintenance_erase_local_label = "Borrar datos locales";
    this.maintenance_installed_label = "Instalado";
    // this. maintenance_latest_label          = "Último";
    this.maintenance_rebuild_label = "Reconstruido";
    this.maintenance_rebuild_local_label = "Reconstruir el Almacenamiento Local";
    this.maintenance_refresh_label = "Actualizar";
    this.maintenance_reload_label = "Recargar";
    this.maintenance_reload_local_label = "Recargar el Almacenamiento Local";
    this.maintenance_stand_alone_label = "Autónomo";
    this.maintenance_storage_used_format = " {0} Carácteres del Almacenamiento Local en uso";
    this.maintenance_system_language_label = "Lenguajedel Sistema";
    this.maintenance_update_label = "Actualizar";
    /* Import page */
    this.import_algorithms_label = "Algoritmos";
    this.import_chineasy_label = "Chineasy";
    this.import_default_category_label = "Default Category";
    this.import_downloading_file_message = "Descargando el archivo importador, por favor aguarde...";
    this.import_flashcards_label = "Flashcards";
    this.import_generic_error = "Import error";
    this.import_lessons_label = "Lecciones";
    this.import_parsing_data_message = "Analizando datos de importación...";
    this.import_paste_text_label = "Pega el texto o link (http://...) aquí";
    this.import_pleco_text_file_label = "Archivo de texto Pleco";
    this.import_pleco_xml_file_label = "Archivo XML Pleco";
    this.import_progress_label = "Progreso";
    this.import_section_other = "Otro";
    this.import_section_quick = "Rápido";
    this.import_section_shanka = "Shanka";
    this.import_settings_label = "Configuraciones";
    this.import_skritter_simp_label = "Skritter (Simplificado)";
    this.import_skritter_trad_label = "Skritter (Tradicional)";
    this.import_stickystudy_label = "StickyStudy";
    this.import_timed_out_error = "Importar tiempo agotado!";
    /* Export page */
    this.export_beginning_message = "Comenzando Exportación...";
    this.export_categories_label = "Categorías para Exportar";
    this.export_do_export_label = "Exportar";
    this.export_download_filename = "ShankaExport.txt";
    this.export_download_filetext = "Descargar Archivo";
    this.export_export_format_label = "Formato de Exportación";
    this.export_other_label = "Otro";
    this.export_success_message = "Toda la información exportada!";
    /* Question list and page */
    this.question_answer_label = "Respuesta";
    this.question_auto_generate_label = "Autogenerar";
    this.question_calligraphy_label = "Caligrafía";
    this.question_components_label = "Componentes de las Preguntas";
    this.question_cursive_label = "Cursiva";
    this.question_definition_label = "Definición";
    this.question_delete_selected_confirm = "¿Desea borrar las preguntas seleccionadas?";
    this.question_deleted_format = "{0} preguntas borradas";
    this.question_display_label = "Display";
    this.question_duplicate_sel_confirm = "¿Duplicar preguntas seleccionadas?";
    this.question_duplicated_format = "{0}Preguntas duplicadas";
    this.question_hanzi_touch_label = "Touchpad Hanzi";
    this.question_inputs_label = "Entradas";
    this.question_name_label = "Nombre de la pregunta";
    this.question_name_text_error = "¡Tu pregunta debe tener un nombre y algo de texto!";
    this.question_new_name = "Pregunta Nueva";
    this.question_notes_label = "Notas";
    this.question_pinyin_label = "Pinyin";
    this.question_saved_format = "'{0}' preguntas agregadas";
    this.question_simplified_label = "Hanzi Simplificado";
    this.question_stem_answer_error = "¡Tu pregunta debe tener al menos texto y una respuesta!";
    this.question_stem_label = "Tema";
    this.question_text_edit_label = "Campo de Edición de Texto";
    this.question_text_label = "Texto de la Pregunta";
    this.question_traditional_label = "Hanzi Tradicional";
    this.question_whats_the_format = "Qué es {0}?";
    this.question_and_separator = "y";
    /* Lesson list and page */
    this.lesson_delete_selected_confirm = "¿Deseas borrar lecciones seleccionadas?";
    this.lesson_deleted_format = "{0} lecciones seleccionadas";
    this.lesson_duplicate_selected_confirm = "¿Desea duplicar lecciones seleccionadas?";
    this.lesson_duplicated_format = "{0} lecciones duplicadas";
    this.lesson_must_include_1_cat_error = "¡Debes incluir al menos una categoría!";
    this.lesson_must_include_1_quest_error = "¡Debes incluir al menos una pregunta!";
    this.lesson_name_already_exist_error = "¡El nombre de esa lección ya existe!";
    this.lesson_name_cant_be_empty_error = "¡El nombre de la lección está vacío!";
    this.lesson_name_label = "Nombre de la Lección";
    this.lesson_new_name = "Nueva Lección";
    this.lesson_review_mode_name = "(Reveer)";
    this.lesson_reviewing_label = "Reviendo";
    this.lesson_saved_format = "'{0}'lecciones guardadas";
    /* Algorithm list and page */
    this.algorithm_adjustment_speed_positive_error = "¡La Velocidad del Ajuste debe ser positiva!";
    this.algorithm_any_element_probability_0_1_error = "¡Cualquier Elemento de Probabilidad debe estar entre 0 y 1!";
    this.algorithm_cannot_delete_last_error = "¿No puedes borrar el último algoritmo?";
    this.algorithm_daily_correct_target_positive_int_error = "¡El Objetivo Diario Correcto debe ser un entero positivo!";
    this.algorithm_daily_minutes_target_positive_int_error = "¡El Objetivo de Minutos Diarios debe ser un entero positivo!";
    this.algorithm_daily_new_target_positive_int_error = "¡El Nuevo Objetivo Diario debe ser un número positivo entero!";
    this.algorithm_default_knowledge_rate_0_1_error = "¡El Error de la Calificación de Conocimiento  debe estar entre 0 y 1!";
    this.algorithm_delete_selected_confirm = "¿Deseas borrar los algoritmos seleccionados?";
    this.algorithm_duplicate_selected_confirm = "¿Duplicar algoritmos seleccionados?";
    this.algorithm_first_element_probability_0_1_error = "El primer elemento debe estar entre 0 y 1!";
    this.algorithm_minimum_interval_postive_0_error = "El intervalo mínimo debe ser positivo o cero!";
    this.algorithm_minimum_unknown_card_positive_int_error = "El Mínimo de Cartas Desconocidas debe ser un entero positivo!";
    this.algorithm_name_cant_be_empty_error = "¡El Nombre del Argoritmo no puede estar vacío!";
    this.algorithm_threshold_knowledge_rate_0_1_error = "¡El rango en el cual una carta es considerada aprendida debe estar entre 0 y 1!";
    this.algorithm_adjustment_speed = "Ajuste de Velocidad";
    this.algorithm_any_element_probability = "Ningún Elemento de Probabilidad";
    this.algorithm_choose_label = "Elige un algoritmo";
    this.algorithm_current_label = "En uso";
    this.algorithm_daily_correct_target = "Objetivo Diario Correcto";
    this.algorithm_daily_minutes_target = "Objetivo de Minutos Diaros";
    this.algorithm_daily_new_target = "Nuevo Objetivo Diario";
    this.algorithm_default_knowledge_rate = "Tasa de Incumplimiento del Conocimiento.";
    this.algorithm_deleted_format = "{0} algoritmos borrados";
    this.algorithm_duplicated_format = "{0} algoritmos duplicados";
    this.algorithm_first_element_prob = "Probabilidad del Primer Elemento";
    this.algorithm_history_today = "hoy";
    this.algorithm_history_yesterday = "ayer";
    this.algorithm_knowledge_rate_display = "Clasificación de Conocimiento";
    this.algorithm_knowledge_rate_trouble = "Con Problemas";
    this.algorithm_knowledge_rate_learned = "Aprendido";
    this.algorithm_knowledge_rate_learning = "Aprendiendo";
    this.algorithm_minimum_interval = "Intervalo Mínimo";
    this.algorithm_minimum_unknown_cards = "Mínimo Cartas Desconocidad";
    this.algorithm_name_label = "Nombre";
    this.algorithm_new_name = "Algoritmo Nuevo";
    this.algorithm_parameters = "Parámetros";
    this.algorithm_saved_format = "'{0}' algoritmos guardados";
    this.algorithm_study_settings = "Configuración de Estudio";
    this.algorithm_threshold_kn_rate = "Rango de Flashcard aprendida";
    /* Local storage rebuild and load */
    this.local_storage_cannot_save_ios = "Deshabilitado para guardar en el almacenamiento local. Quizá tu almacenamiento locar ha sido excedido, o estás navegando en Modo Privado.";
    this.local_storage_cannot_save_other = "Deshabilitado pata guargar en almacenamiento local, tu capacidad de almacenamiento ha sido excedida.";
    this.local_storage_erase_confirm = "Deseas borrar los datos de almacenamiento local?";
    this.local_storage_erased_message = "Los Datos de Almacenamiento Local fueron bombardeados!";
    this.local_storage_rebuild_confirm = "¿Deseas Reconstruir el Almacenamiento Local?";
    this.local_storage_rebuilt_ok_message = "¡El almacenamienot local ha sido reconstruido, ningún error ha sido encontrado!";
    this.local_storage_errors_detected_resolved_error = "Errores del almacenamieto local de datos fueron detectados y resueltos.\n\n" + "Quizá has estado perdiendo o desconectando lecciones, preguntas, categorías o flashcards.\n\n" + "Información más detallada está disponible en la consola Java.";
    /* Help pages */
    this.help_contents_label = "Contenidos de Asistencia al Usuario";
    this.help_main_page = "<h3>Antes de que Comiences</h3>" + "<p>Primero deberías agregar la página principal (página de bienvenida) de esta aplicación a la pantalla de inicio de tu dispositivo.</p>" + "<p>Eso te permitirá  usar la aplicación  cuando estés desconectado, y también te pondrá la pantalla completa para darte más espacio.</p>" + "<p>En iOS esto significa cliquear el Ícono en el medio del botón de la pantalla, este luce como una caja con una flecha señalando, y seleccionando 'Adicionar a Inicio de Pantalla'.</p>" + "<p>Funcionalidad similar está disponible en todos los buscadores modernos en  Windows, Android, Mac OS, Windows Mobile,y Blackberry.</p>";
    this.help_lessons = "<h3>Lecciones Seleccionadas</h3>" + "<p>Cuando estudies, solo van a ser utilizadas preguntas y categorías de lecciones que estén controladas .</p>";
    this.help_card_info = "<h3>Categorías</h3>" + "<p>Listas de Categorías,si hay alguna,a la cual la carta actual sea asignada.</p>" + "<h3>Flashcards Relacionadas</h3>" + "<p>Mostrar todas las Flashcards que compartan  carácteres en común  con la flashcard en uso.</p>" + "<h3>Orden de Trazos</h3>" + "<p>Algunos (no todos) los carácteres tienen diagramas de orden de trazos provistos por The Wikimedia Foundation.</p>" + "<h3>Formas Históricas</h3>" + "<p>La Fundación WIkipedia ha coleccionado formas de carácteres representativos para muchos carácteres. " + "Estos pueden ayudarte a entender la forma de algunos pictogramas.</p>";
    this.help_practice = "<h3>Relájate!</h3>" + "<p>La página de práctica te permite  sentarte y practicar cualquier carácter que desees.</p>" + "<p>Ingresa los carácteres que quieras estudiar en la próxima caja.</p>" + "<p>Todas las otras funcionalidades de los dibujos de los carácteres de la página de estudio están disponible.</p>" + "<h3>Buscar</h3>" + "<p>Puedes buscar a través de texto en hanzi o pinyin  de todas las flashcards cliqueando sobre la lupa. " + "El buscador va a buscar el carácter en la caja de texto y se desplegará una lista de resultados o irá a la carta si hay solo un resultado.</p>";
    this.help_study = "<p>Esta es la página de la aplicación donde vas a pasar la mayoría del tiempo, poniéndote a prueba en las flashcards.</p>" + "<h3>Tema</h3>" + "<p>El tema de la pregunta es la información que se te va a dar .</p>" + "<h3>Respuesta</h3>" + "<p>La respuesta es la información que administrarás. Escribe o dibuja la respuesta apropiada y luego haz click sobre 'Mostrar Respuesta' para ver si es correcta.</p>" + "<h3>Ingreso de texto en Hanzi</h3>" + "<p>Si un controlador de entrada  hanzi está siendo mostrado por la pregunta actual, podrías dibujar tantos carácteres como quieras dibujar como respuesta y repetir cada uno muchas veces " + "para practicar si es que así lo deseas. Haz click en el botón 下 y te moverás a la próxima mini-grilla o agregará una nueva si estás viendo la última mini-grilla.También puedes " + "hacer click sobre las grillas y seleccionarlas. Los demás controles te permiten  elegir el color del lapiz, muestra/oculta el carácter en modo marca de agua en uso, deshacer/rehacer tu dibujo, " + "y limpiar la grilla actual.</p>" + "<h3>Visualización</h3>" + "<p>Información extra como notas en las que no has sido clasificado pueden ser visualizadas al lado de la respuesta también.</p>" + "<h3>Calificador</h3>" + "<p>Califícate a tí mismo en cada aspecto de la respuesta, para  determinar cuándo serás examinado en la flashcard actual. " + "Puedes calificar vários items a la vez arrastrando y deslizandolos.</p>";
    this.help_categories = "<p>Las categorías son usualmente llamadas listas de palabras en otros sistemas. Ellas ayudan a organizar tus flashcards y le dirán a la apliación cuál flashcadr deseas estudiar.</p>" + "<p>Una flashcard que existe en múltiples categorías o en ninguna en caso de que esté 'descategorizada'.</p>";
    this.help_progress = "<p>La página de progreso te muestra cuántas palabras fueron contadas como aprendidas,cuánto tiempo y cuántas flashcards has estudiado, " + "cada día en el que has usado la aplicación.</p>";
    this.help_history = "<p>La página del historial muestra todas las flashcrs que has estudiado y en el order en que las has estudiado. " + "Cada flashcard aparecerá en la lista solo una vez.</p>";
    this.help_import = "<p>Con esta página  puedes importar datos de las listas construidas o de cualquier otro sistema de flshcards .</p>";
    this.help_export = "Ayuda de Exportación" + "<p>Exportar te permite hacer copias de seguridad de tus datos.También puedes exportarlo a otro dispositivo o a otro sistema de flashcards.</p>" + "<h3>Resultado de Exportación</h3>" + "<p>Copia el texto al editor de teco y pégalo en otra aplicación. " + 'Alternativamente, haz click en botón de "Download file".</p>';
    this.help_settings = "<p>Las configuraciones de pantalla te permiten mejorar la aplicación.</p>" + "<h3>Configuraciones Generales</h3>" + "<p>Si el auto-avance está encendido, la próxima flashcard va a ser mostrada tan pronto como hayas calificado una flashcard cuando estés estudiando.</p>" + "<h3>Ingreso del Dibujo Hanzi</h3>" + "<p>Estas configuraciones controlan el aspecto del control de dibujo Hanzi en el modo de estudio y práctica.</p>" + "<h3>Guías de Fondo</h3>" + "<p>La forma del fondo de la grilla de dibujo Hanzi puede ser configurada aquí.</p>" + "<h3>Color de los tonos Pinyin</h3>" + "<p>Si está habilitado,este controlará los colores mostrados para cada sílaba de los tonos.</p>" + "<h3>Escritura Preferente</h3>" + "<p>Puedes decidir si deseas ver Hanzi, Simplificado o Tradicional , como así también una combinación de ambos.</p>" + "<h3>Calificaciones</h3>" + "<p>Elige los nombres de las calificaciones que deseas ver en la página de estudio,y deshabilita cualquiera que no desees utilizar deseleccionándolas.</p>";
    this.help_queue = "<p>La lista muestra todas la palabras que estás actualmente estudiando y te permite saber qué tan bien las conoces." + "La palabras están en orden aproximado en la forma que serán aprendidas,aunque el orden sea casual así no se hace predecible.</p>";
    this.help_algorithms = "<h3>Algoritmo de Shanka</h3>" + "<p>Este algoritmo  controla el orden de las flashcards en el cual son mostradas,y cómo muchas flashcards nuevas serán adicionadas cuando hayas aprendido las previas.</p>" + "<h3>Configuraciones de Estudio</h3>" + "<p><li><b> Mínimo de Flashcards Desconocidas</b> - Cuando el número de Flascards desconocidas caiga por debajo de este nivel,nuevas flashcards serán adicionadas a la lista.</p>" + "<p><li><b>Objetivo Diario Correcto</b> - Proponte un mínimo de número de preguntas a responder cada día .</p>" + "<p><li><b>Nuevo Obejtivo Diario</b> - Proponte un mínimo número de nuevas flashcards para adicionar cada día .</p>" + "<p><li><b>Objetivo de Minutos Diarios</b> - Proponte un mínimo de tiempo diario para estudiar en minutos.</p>" + "<h3>Parámetros</h3>" + "<p><li><b>Tasa de Incumplimiento del Conocimiento.</b> - La calificación del conocimiento <i><b>kn_rate</b></i> es qué tan bien tú conoces la información en una flashcard.Cero es nada y uno es conocimiento perfecto de la flashcard.</p>" + "<p><li><b>Umbral del Conocimiento </b> - La calificación del conocimiento en la cual la información en una carta será contada como 'aprendida'.</p>" + "<p><li><b>Ajuste dela Velocidad</b> - Qué tan rápido la calificación del conocimiento  para cada información en una flashcard será cambiada a cero/uni cuando respondas las preguntas bien/mal. " + "Si este ajuste de velocidad será <i><b>a</b></i>, cuando una pregunta sea reopondida incorrectamente,<i><b>kn_rate<sub>new</sub> = kn_rate<sub>old</sub> / a</b></i>. " + "Cuando la pregunta sea respondida correctamente, <i><b>kn_rate<sub>new</sub> = 1 + (kn_rate<sub>old</sub> - 1) / a</b></i>. Si las cinco opciones de  respuesta están enumeradas de 1 al 5, luego " + "la respuesta  3 no cambiará  la calificación del conocimiento, las respuestas 2 y 4 son correctas o incorrectas, y las respuestas 1 y 5 como dos incorrectas o correcctas respectivamente.</p>" + "<p><li><b>Cualquier Elemento de Prbabilidad</b> - La probabilidad de que la próxima flashcard  sea dibujada casualmente de cualquier lugar de la lista , en vez del frente de la lista. " + "Esta configuración te permite que flashcards sea ocacionalmente esparcidas en el estudio.Si no deseas que esto suceda, define su valor como cero.</p>" + "<p><li><b>Primer Elemento de Probabilidad</b> - Si esta probabilidad es <i><b>p</b></i>, y la primera flashcard en la lista es número<i><b>0</b></i>, luego la flashcard " + "<i><b>n</b></i> será seleccionada como la flashcard a estudias con probabilidad <i><b>p &times; (1-p)<sup>n</sup></b></i>. " + "Como la suma de todas las flashcards en la lista serán apenas menores a uno, el resto de probabilidad se le será asignada al primer elemento .</p>" + "<p><li><b>Intervalo Mínimo</b> - El intervalo mínimo de número de flashacrs debe ser mostrado antes de que una flashcard se repita, incluso si  esta sea simepre definida como desconocida.</p>";
    this.help_questions = "<h3>Nombre de la Pregunta</h3> " + "<p> Es solo usada para indentificar  la pregunta en la lista de preguntas.</p> " + "<h3>Texto de la Pregunta</h3> " + '<p>La pregunta que aparece en la cima de la flashcard sobre el tem principal de la pregunta ,por ejemplo. "Cuál es el pinyin de este carácter?"</p> ' + "<p>Leave the auto-generate checkbox clicked if you want to have the app create this text based on the selected inputs, stem and answer.</p> " + "<h3>Entradas</h3> " + "<p>Estas entradas  son visualizadas a lo largo de la pregunta. Si escribes 'These inputs are displayed alongside the question stem. If you type' " + "chino en la caja de edición, podrás usar o tu dispositivo IMC para escribir en pinyin " + "o escribiendo a mano.</p> " + "<h3>Stem</h3> " + "<p>El frente de la flashcard para esa pregunta.</p> " + "<h3>Respuesta</h3> " + "<p> Es la parte 'trasera' de la flashcard sobre la cual eres calificado.</p> " + "<h3>Visualización</h3> " + "<p>Más información en la parte trasera de la flashcard que es mostrada junto a la respuesta .</p>";
    this.help_maintenance = "<h3>Recargar</h3>" + "<p>Recargando la applicación se reiniciará,usando la información en el almacenamiento local." + " Quizá esto te ayude si alguna vez tienes problemas o si accientalmente ejecutas varias instancies de la aplicación.</p>" + "<h3>Autonomidad</h3>" + "<p>Esta información es usada para ayudar a identificar problemas con la aplicación.Este debería ser verdadero si estás ejecutando la aplicación en " + " el modo 'pantalla de inicio' o 'autónomo', y falso si estás usando el buscador.</p>" + "<h3>Lenguage del Sistema</h3>" + "<p>Este es el código de lenguaje reportado por tu sistema.</p>" + "<h3>Caché de la Aplicación</h3>" + "<p> Esta aplicación web siempre guarda información sobre las flashcards,etc en el almacenamiento local.El caché de la  aplicación  está separado de este,y" + "descarga las páginas de la aplicación real de modo que  puedas acceder a ellos cuando estés desconectado.Si el estado de la aplicación es" + "NO EN CHACHÉ entonces no deberías accder a la aplicación cuando estés desconectado.Para asegurarte de estar en uso desconectado deberías poner" + "el estatus de la aplicación EN CACHÉ .</p>" + "<h3>Actualizar la Aplicación Web</h3>" + "<p>Para instalar  la última versión de la aplicación, haz click en 'Actualizad la Aplicación Web' si notas que la última versión  es " + "diferente a la versión ya instalada.No deberías necesitas utilizar esta funcionalidad si descargas una " + "cuando se te solicite actualizar una vez iniciada la aplicación</p>" + "<h3>Almacenamiento Local</h3>" + "<p>Ve a  <a href='http://dev-test.nemikor.com/web-storage/support-test/'>this page</a> " + "para calcular tu límite de almacenamiento local , que usualmente es de al menos  2.5M de carácteres dependiendo de tu buscador. " + "Nota: 1k=2<sup>10</sup>=1024 carácteres, 1M=2<sup>20</sup> carácteres. Usualmente  1 carácter = 2 bytes, entonces " + "2.5M carácteres = 5MB de espacio de almacenamiento.</p>" + "<h3>Borrar Almacenamiento Local</h3>" + "<p> Si tienes problemas podrías intentar limpiar tus datos de almacenamiento local.Si deseas mantener tu  historial actual " + "primero deberías exportar una copia de seguridad de tus datos.</p>";
    this.help_wizard = "<p>Usa este asistente para simplificar la creación de lecciones.</p>" + "<p>Puedes utilizar la asistencia más de una vez para crear múltiples lecciones, y luego elegir cuál estudiar de la pantalla de lecciones.</p>";
    this.help_about = "<h3>Licencia</h3>" + "<p>Eres libre para copiar,distribuir y modificar este código bajo licencia similar " + "a esta. Debes darle el crédito al autor origial (yo) en cualquier trabajo derivado. " + "No debes usar ninguna parte de este código  con propósitos comerciales sin haber obtenido " + "mi permiso.</p>" + "<p>Alan Davies 2014 alan@hskhsk.com/p>" + "<p>Ve a  http://hskhsk.com/shanka para más información.</p>" + "<h3>Creditos</h3>" + "Estructura inicial inspirada por Steven de Salas http://html5db.desalasworks.com/<br />" + "String compression routines by Pieroxy http://pieroxy.net/blog/pages/lz-string/index.html<br />" + "Control de pantalla táctil es una versión intensamente modificada  de la versión hecha por Greg Murray http://gregmurray.org/ipad/touchpaint/<br />" + "La Grila de Colores es de  Jan Odvárko's jscolor http://jscolor.com/<br />" + "Algunas partes del algoritmo de Shanka fueron inspirados por  Adam Nagy de Cybertron BT's defunct product Memodrops " + "http://memodrops.com/algorithm.html ( esta pa´gina no existe actualmente pero está archivada en http://archive.org<br />" + "Muchos problemas fueron resueltos con la ayuda de los comentarios y soluciones en Stack Overflow http://stackoverflow.com/<br />" + "Muchas gracias a Chinese Forums, Pleco, y la comunidad de usuarios Skritter , como así también a los testeadores beta que participaron.<br />" + "¡Gracias también a los traductores que internacionalizaron esta aplicación!";
    // Progress page and progress displayed on main page
    this.main_cards_learned_label = "aprendido";
    // this. main_cards_queued_label  = "enlistado";
    this.main_cards_total_label = "total";
    this.progress_studied_label = "estudió";
    this.progress_total_label = "Total";
    this.progress_daily_label = "Diario";
    this.progress_today_label = "Hoy";
    this.progress_seconds = "segundos";
    this.progress_minutes = "minutos";
    this.progress_hours = "horas";
    this.progress_days = "dias";
    this.progress_weeks = "semanas";
    this.progress_years = "año";
    this.progress_list_format = "Estudió {0}, y se enteró de {1} tarjetas, en {2}";
    /* Translated version of this section should be modified to show
 * which files have and haven't been translated */
    this.language_unknown_error = "Código de idioma Desconocido:";
    this.import_hsk1_label = "Palabras HSK 1";
    this.import_hsk2_label = "Palabras HSK 2 (Inglés)";
    this.import_hsk3_label = "Palabras HSK 3 (Inglés)";
    this.import_hsk4_label = "Palabras HSK 4 (Inglés)";
    this.import_hsk5_label = "Palabras HSK 5 (Inglés)";
    this.import_hsk6_label = "Palabras HSK 6 (Inglés)";
    this.import_hsk1_sentences_label = "Frases HSK 1 (Inglés)";
    this.import_hsk2_sentences_label = "Frases HSK 2 (Inglés)";
    this.import_hsk3_sentences_label = "Frases HSK 3 (Inglés)";
    this.import_chineasy_label = "Chineasy";
    this.import_hsk1_category = "HSK 1";
    this.import_hsk2_category = "HSK 2";
    this.import_hsk3_category = "HSK 3";
    this.import_hsk4_category = "HSK 4";
    this.import_hsk5_category = "HSK 5";
    this.import_hsk6_category = "HSK 6";
    this.import_hsk1_sentences_category = "HSK 1 句子";
    this.import_hsk2_sentences_category = "HSK 2 句子";
    this.import_hsk3_sentences_category = "HSK 3 句子";
    this.import_chineasy_category = "Chineasy";
    this.import_hsk1_location = "lists/HSK 2012 L1 es.txt";
    this.import_hsk2_location = "lists/HSK 2012 L2.txt";
    this.import_hsk3_location = "lists/HSK 2012 L3.txt";
    this.import_hsk4_location = "lists/HSK 2012 L4.txt";
    this.import_hsk5_location = "lists/HSK 2012 L5.txt";
    this.import_hsk6_location = "lists/HSK 2012 L6.txt";
    this.import_hsk1_sentences_location = "lists/HSK 2012 Examples L1.txt";
    this.import_hsk2_sentences_location = "lists/HSK 2012 Examples L2.txt";
    this.import_hsk3_sentences_location = "lists/HSK 2012 Examples L3.txt";
    this.import_chineasy_location = "lists/Chineasy es.txt";
};

/*
    Shanka HSK Flashcards - language.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any dervied work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
var supportedLanguages = {
    en: new lang_english(),
    nl: new lang_dutch(),
    es: new lang_spanish()
};

// language object
function language() {
    this.getCurrentLanguage = function() {
        return localStorage["language"];
    };
    this.setLanguage = function(language) {
        if (language in supportedLanguages) {
            localStorage["language"] = language;
            this.primary_language = supportedLanguages[language];
            shanka.init();
            shanka.showmain();
        }
    };
    var currentState = parseWindowLocation();
    // Set the current language for string resources
    if (currentState && "section" in currentState) {
        var section = currentState["section"];
        if (section.substr(0, 4) == "lang") {
            var language = section.substr(5);
            if (language in supportedLanguages) {
                localStorage["language"] = language;
            }
        }
    }
    if (localStorage["language"]) {
        var language = localStorage["language"];
        this.primary_language = supportedLanguages[language];
    } else {
        // fall back on English
        this.primary_language = supportedLanguages["en"];
        localStorage["language"] = "en";
    }
    this.fallback_language = supportedLanguages["en"];
    // always English for now
    // fetch a string from the primary or secondary language
    this.get_str = function(id) {
        if (this.primary_language && this.primary_language.hasOwnProperty(id)) {
            return this.primary_language[id];
        }
        if (this.fallback_language.hasOwnProperty(id)) {
            console.log("get_str id not in primary language: " + id);
            return this.fallback_language[id];
        }
        console.log("get_str id not found: " + id);
        return "";
    };
    // define a 'getter' accessor for a property
    this.declare_str = function(id) {
        Object.defineProperty(this, id, {
            get: function() {
                return this.get_str(id);
            }
        });
    };
    // declare a getter for each English string
    for (var prop in this.fallback_language) {
        this.declare_str(prop);
    }
    // get a given language's name in the current language
    this.get_language_name = function(languageId) {
        var lang = "unknown";
        switch (languageId) {
          case "en":
            lang = this.lang_english_language;
            break;

          case "nl":
            lang = this.lang_dutch_language;
            break;

          case "es":
            lang = this.lang_spanish_language;
            break;

          case "de":
            lang = this.lang_german_language;
            break;

          case "fr":
            lang = this.lang_french_language;
            break;

          case "it":
            lang = this.lang_italian_language;
            break;
        }
        return lang;
    };
}

// define the global string accessor object
var STR = new language();

/*
    Shanka HSK Flashcards - snap.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

    Original license below- heavily modified by Alan Davies 2014

*/
/*
 * Snap.js
 *
 * Copyright 2013, Jacob Kelley - http://jakiestfu.com/
 * Released under the MIT Licence
 * http://opensource.org/licenses/MIT
 *
 * Github:  http://github.com/jakiestfu/Snap.js/
 * Version: 1.9.0
 */
/*jslint browser: true*/
/*global define, module, ender*/
(function(win, doc) {
    "use strict";
    var Snap = Snap || function(userOpts) {
        var settings = {
            element: null,
            dragger: null,
            disable: "none",
            addBodyClasses: true,
            hyperextensible: true,
            resistance: .5,
            flickThreshold: 50,
            transitionSpeed: .3,
            easing: "ease",
            maxPosition: 266,
            minPosition: -266,
            tapToClose: true,
            touchToDrag: true,
            slideIntent: 40,
            // degrees
            minDragDistance: 5
        }, cache = {
            simpleStates: {
                opening: null,
                towards: null,
                hyperExtending: null,
                halfway: null,
                flick: null,
                translation: {
                    absolute: 0,
                    relative: 0,
                    sinceDirectionChange: 0,
                    percentage: 0
                }
            }
        }, eventList = {}, utils = {
            hasTouch: doc.ontouchstart === null,
            eventType: function(action) {
                var eventTypes = {
                    down: utils.hasTouch ? "touchstart" : "mousedown",
                    move: utils.hasTouch ? "touchmove" : "mousemove",
                    up: utils.hasTouch ? "touchend" : "mouseup",
                    out: utils.hasTouch ? "touchcancel" : "mouseout"
                };
                return eventTypes[action];
            },
            page: function(t, e) {
                return utils.hasTouch && e.touches.length && e.touches[0] ? e.touches[0]["page" + t] : e["page" + t];
            },
            klass: {
                has: function(el, name) {
                    return el.className.indexOf(name) !== -1;
                },
                add: function(el, name) {
                    if (!utils.klass.has(el, name) && settings.addBodyClasses) {
                        el.className += " " + name;
                    }
                },
                remove: function(el, name) {
                    if (settings.addBodyClasses) {
                        el.className = el.className.replace(" " + name, "");
                    }
                }
            },
            dispatchEvent: function(type) {
                if (typeof eventList[type] === "function") {
                    return eventList[type].call();
                }
            },
            vendor: function() {
                var tmp = doc.createElement("div"), prefixes = "webkit Moz O ms".split(" "), i;
                for (i in prefixes) {
                    if (typeof tmp.style[prefixes[i] + "Transition"] !== "undefined") {
                        return prefixes[i];
                    }
                }
            },
            transitionCallback: function() {
                return cache.vendor === "Moz" || cache.vendor === "ms" ? "transitionend" : cache.vendor + "TransitionEnd";
            },
            canTransform: function() {
                return typeof settings.element.style[cache.vendor + "Transform"] !== "undefined";
            },
            deepExtend: function(destination, source) {
                var property;
                for (property in source) {
                    if (source[property] && source[property].constructor && source[property].constructor === Object) {
                        destination[property] = destination[property] || {};
                        utils.deepExtend(destination[property], source[property]);
                    } else {
                        destination[property] = source[property];
                    }
                }
                return destination;
            },
            angleOfDrag: function(x, y) {
                var degrees, theta;
                // Calc Theta
                theta = Math.atan2(-(cache.startDragY - y), cache.startDragX - x);
                if (theta < 0) {
                    theta += 2 * Math.PI;
                }
                // Calc Degrees
                degrees = Math.floor(theta * (180 / Math.PI) - 180);
                if (degrees < 0 && degrees > -180) {
                    degrees = 360 - Math.abs(degrees);
                }
                return Math.abs(degrees);
            },
            events: {
                addEvent: function(element, eventName, func) {
                    if (element.addEventListener) {
                        return element.addEventListener(eventName, func, false);
                    } else if (element.attachEvent) {
                        return element.attachEvent("on" + eventName, func);
                    }
                },
                removeEvent: function(element, eventName, func) {
                    if (element.addEventListener) {
                        return element.removeEventListener(eventName, func, false);
                    } else if (element.attachEvent) {
                        return element.detachEvent("on" + eventName, func);
                    }
                },
                prevent: function(e) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                    }
                }
            },
            parentUntil: function(el, attr) {
                var isStr = typeof attr === "string";
                while (el.parentNode) {
                    if (isStr && el.getAttribute && el.getAttribute(attr)) {
                        return el;
                    } else if (!isStr && el === attr) {
                        return el;
                    }
                    el = el.parentNode;
                }
                return null;
            }
        }, action = {
            translate: {
                get: {
                    matrix: function(index) {
                        if (!utils.canTransform()) {
                            return parseInt(settings.element.style.left, 10);
                        } else {
                            var matrix = win.getComputedStyle(settings.element)[cache.vendor + "Transform"].match(/\((.*)\)/), ieOffset = 8;
                            if (matrix) {
                                matrix = matrix[1].split(",");
                                if (matrix.length === 16) {
                                    index += ieOffset;
                                }
                                return parseInt(matrix[index], 10);
                            }
                            return 0;
                        }
                    }
                },
                easeCallback: function() {
                    settings.element.style[cache.vendor + "Transition"] = "";
                    cache.translation = action.translate.get.matrix(4);
                    cache.easing = false;
                    clearInterval(cache.animatingInterval);
                    if (cache.easingTo === 0) {
                        utils.klass.remove(doc.body, "snapjs-right");
                        utils.klass.remove(doc.body, "snapjs-left");
                    }
                    utils.dispatchEvent("animated");
                    utils.events.removeEvent(settings.element, utils.transitionCallback(), action.translate.easeCallback);
                },
                easeTo: function(n) {
                    if (!utils.canTransform()) {
                        cache.translation = n;
                        action.translate.x(n);
                    } else {
                        cache.easing = true;
                        cache.easingTo = n;
                        settings.element.style[cache.vendor + "Transition"] = "all " + settings.transitionSpeed + "s " + settings.easing;
                        cache.animatingInterval = setInterval(function() {
                            utils.dispatchEvent("animating");
                        }, 1);
                        utils.events.addEvent(settings.element, utils.transitionCallback(), action.translate.easeCallback);
                        action.translate.x(n);
                    }
                    if (n === 0) {
                        settings.element.style[cache.vendor + "Transform"] = "";
                    }
                },
                x: function(n) {
                    if (settings.disable === "left" && n > 0 || settings.disable === "right" && n < 0) {
                        return;
                    }
                    if (!settings.hyperextensible) {
                        if (n === settings.maxPosition || n > settings.maxPosition) {
                            n = settings.maxPosition;
                        } else if (n === settings.minPosition || n < settings.minPosition) {
                            n = settings.minPosition;
                        }
                    }
                    n = parseInt(n, 10);
                    if (isNaN(n)) {
                        n = 0;
                    }
                    if (utils.canTransform()) {
                        var theTranslate = "translate3d(" + n + "px, 0,0)";
                        settings.element.style[cache.vendor + "Transform"] = theTranslate;
                    } else {
                        settings.element.style.width = (win.innerWidth || doc.documentElement.clientWidth) + "px";
                        settings.element.style.left = n + "px";
                        settings.element.style.right = "";
                    }
                }
            },
            drag: {
                listen: function() {
                    cache.translation = 0;
                    cache.easing = false;
                    utils.events.addEvent(settings.element, utils.eventType("down"), action.drag.startDrag);
                    utils.events.addEvent(settings.element, utils.eventType("move"), action.drag.dragging);
                    utils.events.addEvent(settings.element, utils.eventType("up"), action.drag.endDrag);
                },
                stopListening: function() {
                    utils.events.removeEvent(settings.element, utils.eventType("down"), action.drag.startDrag);
                    utils.events.removeEvent(settings.element, utils.eventType("move"), action.drag.dragging);
                    utils.events.removeEvent(settings.element, utils.eventType("up"), action.drag.endDrag);
                },
                startDrag: function(e) {
                    // No drag on ignored elements
                    var target = e.target ? e.target : e.srcElement, ignoreParent = utils.parentUntil(target, "data-snap-ignore");
                    if (ignoreParent) {
                        utils.dispatchEvent("ignore");
                        return;
                    }
                    if (settings.dragger) {
                        var dragParent = utils.parentUntil(target, settings.dragger);
                        // Only use dragger if we're in a closed state
                        if (!dragParent && (cache.translation !== settings.minPosition && cache.translation !== settings.maxPosition)) {
                            return;
                        }
                    }
                    utils.dispatchEvent("start");
                    settings.element.style[cache.vendor + "Transition"] = "";
                    cache.isDragging = true;
                    cache.hasIntent = null;
                    cache.intentChecked = false;
                    cache.startDragX = utils.page("X", e);
                    cache.startDragY = utils.page("Y", e);
                    cache.dragWatchers = {
                        current: 0,
                        last: 0,
                        hold: 0,
                        state: ""
                    };
                    cache.simpleStates = {
                        opening: null,
                        towards: null,
                        hyperExtending: null,
                        halfway: null,
                        flick: null,
                        translation: {
                            absolute: 0,
                            relative: 0,
                            sinceDirectionChange: 0,
                            percentage: 0
                        }
                    };
                },
                dragging: function(e) {
                    if (cache.isDragging && settings.touchToDrag) {
                        var thePageX = utils.page("X", e), thePageY = utils.page("Y", e), translated = cache.translation, absoluteTranslation = action.translate.get.matrix(4), whileDragX = thePageX - cache.startDragX, openingLeft = absoluteTranslation > 0, translateTo = whileDragX, diff;
                        // Shown no intent already
                        if (cache.intentChecked && !cache.hasIntent) {
                            return;
                        }
                        if (settings.addBodyClasses) {
                            if (absoluteTranslation > 0) {
                                utils.klass.add(doc.body, "snapjs-left");
                                utils.klass.remove(doc.body, "snapjs-right");
                            } else if (absoluteTranslation < 0) {
                                utils.klass.add(doc.body, "snapjs-right");
                                utils.klass.remove(doc.body, "snapjs-left");
                            }
                        }
                        if (cache.hasIntent === false || cache.hasIntent === null) {
                            var deg = utils.angleOfDrag(thePageX, thePageY), inRightRange = deg >= 0 && deg <= settings.slideIntent || deg <= 360 && deg > 360 - settings.slideIntent, inLeftRange = deg >= 180 && deg <= 180 + settings.slideIntent || deg <= 180 && deg >= 180 - settings.slideIntent;
                            if (!inLeftRange && !inRightRange) {
                                cache.hasIntent = false;
                            } else {
                                cache.hasIntent = true;
                            }
                            cache.intentChecked = true;
                        }
                        if (settings.minDragDistance >= Math.abs(thePageX - cache.startDragX) && // Has user met minimum drag distance?
                        cache.hasIntent === false) {
                            return;
                        }
                        utils.events.prevent(e);
                        utils.dispatchEvent("drag");
                        cache.dragWatchers.current = thePageX;
                        // Determine which direction we are going
                        if (cache.dragWatchers.last > thePageX) {
                            if (cache.dragWatchers.state !== "left") {
                                cache.dragWatchers.state = "left";
                                cache.dragWatchers.hold = thePageX;
                            }
                            cache.dragWatchers.last = thePageX;
                        } else if (cache.dragWatchers.last < thePageX) {
                            if (cache.dragWatchers.state !== "right") {
                                cache.dragWatchers.state = "right";
                                cache.dragWatchers.hold = thePageX;
                            }
                            cache.dragWatchers.last = thePageX;
                        }
                        if (openingLeft) {
                            // Pulling too far to the right
                            if (settings.maxPosition < absoluteTranslation) {
                                diff = (absoluteTranslation - settings.maxPosition) * settings.resistance;
                                translateTo = whileDragX - diff;
                            }
                            cache.simpleStates = {
                                opening: "left",
                                towards: cache.dragWatchers.state,
                                hyperExtending: settings.maxPosition < absoluteTranslation,
                                halfway: absoluteTranslation > settings.maxPosition / 2,
                                flick: Math.abs(cache.dragWatchers.current - cache.dragWatchers.hold) > settings.flickThreshold,
                                translation: {
                                    absolute: absoluteTranslation,
                                    relative: whileDragX,
                                    sinceDirectionChange: cache.dragWatchers.current - cache.dragWatchers.hold,
                                    percentage: absoluteTranslation / settings.maxPosition * 100
                                }
                            };
                        } else {
                            // Pulling too far to the left
                            if (settings.minPosition > absoluteTranslation) {
                                diff = (absoluteTranslation - settings.minPosition) * settings.resistance;
                                translateTo = whileDragX - diff;
                            }
                            cache.simpleStates = {
                                opening: "right",
                                towards: cache.dragWatchers.state,
                                hyperExtending: settings.minPosition > absoluteTranslation,
                                halfway: absoluteTranslation < settings.minPosition / 2,
                                flick: Math.abs(cache.dragWatchers.current - cache.dragWatchers.hold) > settings.flickThreshold,
                                translation: {
                                    absolute: absoluteTranslation,
                                    relative: whileDragX,
                                    sinceDirectionChange: cache.dragWatchers.current - cache.dragWatchers.hold,
                                    percentage: absoluteTranslation / settings.minPosition * 100
                                }
                            };
                        }
                        action.translate.x(translateTo + translated);
                    }
                },
                endDrag: function(e) {
                    if (cache.isDragging) {
                        utils.dispatchEvent("end");
                        var translated = action.translate.get.matrix(4);
                        // Tap Close
                        if (cache.dragWatchers.current === 0 && translated !== 0 && settings.tapToClose) {
                            utils.events.prevent(e);
                            action.translate.easeTo(0);
                            cache.isDragging = false;
                            cache.startDragX = 0;
                            return;
                        }
                        // Revealing Left
                        if (cache.simpleStates.opening === "left") {
                            // Halfway, Flicking, or Too Far Out
                            if (cache.simpleStates.halfway || cache.simpleStates.hyperExtending || cache.simpleStates.flick) {
                                if (cache.simpleStates.flick && cache.simpleStates.towards === "left") {
                                    // Flicking Closed
                                    action.translate.easeTo(0);
                                } else if (cache.simpleStates.flick && cache.simpleStates.towards === "right" || (// Flicking Open OR
                                cache.simpleStates.halfway || cache.simpleStates.hyperExtending)) {
                                    action.translate.easeTo(settings.maxPosition);
                                }
                            } else {
                                action.translate.easeTo(0);
                            }
                        } else if (cache.simpleStates.opening === "right") {
                            // Halfway, Flicking, or Too Far Out
                            if (cache.simpleStates.halfway || cache.simpleStates.hyperExtending || cache.simpleStates.flick) {
                                if (cache.simpleStates.flick && cache.simpleStates.towards === "right") {
                                    // Flicking Closed
                                    action.translate.easeTo(0);
                                } else if (cache.simpleStates.flick && cache.simpleStates.towards === "left" || (// Flicking Open OR
                                cache.simpleStates.halfway || cache.simpleStates.hyperExtending)) {
                                    action.translate.easeTo(settings.minPosition);
                                }
                            } else {
                                action.translate.easeTo(0);
                            }
                        }
                        cache.isDragging = false;
                        cache.startDragX = utils.page("X", e);
                    }
                }
            }
        }, init = function(opts) {
            if (opts.element) {
                utils.deepExtend(settings, opts);
                cache.vendor = utils.vendor();
                action.drag.listen();
            }
        };
        /*
         * Public
         */
        this.open = function(side) {
            utils.klass.remove(doc.body, "snapjs-expand-left");
            utils.klass.remove(doc.body, "snapjs-expand-right");
            if (side === "left") {
                console.log("cache.translation " + cache.translation.toString());
                if (cache.translation === settings.maxPosition) {
                    /* This test added by Alan to close when it is open */
                    this.close();
                } else {
                    cache.simpleStates.opening = "left";
                    cache.simpleStates.towards = "right";
                    utils.klass.add(doc.body, "snapjs-left");
                    utils.klass.remove(doc.body, "snapjs-right");
                    action.translate.easeTo(settings.maxPosition);
                }
            } else if (side === "right") {
                cache.simpleStates.opening = "right";
                cache.simpleStates.towards = "left";
                utils.klass.remove(doc.body, "snapjs-left");
                utils.klass.add(doc.body, "snapjs-right");
                action.translate.easeTo(settings.minPosition);
            }
        };
        this.close = function() {
            action.translate.easeTo(0);
        };
        this.expand = function(side) {
            var to = win.innerWidth || doc.documentElement.clientWidth;
            if (side === "left") {
                utils.klass.add(doc.body, "snapjs-expand-left");
                utils.klass.remove(doc.body, "snapjs-expand-right");
            } else {
                utils.klass.add(doc.body, "snapjs-expand-right");
                utils.klass.remove(doc.body, "snapjs-expand-left");
                to *= -1;
            }
            action.translate.easeTo(to);
        };
        this.on = function(evt, fn) {
            eventList[evt] = fn;
            return this;
        };
        this.off = function(evt) {
            if (eventList[evt]) {
                eventList[evt] = false;
            }
        };
        this.enable = function() {
            action.drag.listen();
        };
        this.disable = function() {
            action.drag.stopListening();
        };
        this.settings = function(opts) {
            utils.deepExtend(settings, opts);
        };
        this.state = function() {
            var state, fromLeft = action.translate.get.matrix(4);
            if (fromLeft === settings.maxPosition) {
                state = "left";
            } else if (fromLeft === settings.minPosition) {
                state = "right";
            } else {
                state = "closed";
            }
            return {
                state: state,
                info: cache.simpleStates
            };
        };
        init(userOpts);
    };
    if (typeof module !== "undefined" && module.exports) {
        module.exports = Snap;
    }
    if (typeof ender === "undefined") {
        this.Snap = Snap;
    }
    if (typeof define === "function" && define.amd) {
        define("snap", [], function() {
            return Snap;
        });
    }
}).call(this, window, document);

/*
    Shanka HSK Flashcards - hanzicanvas.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

    Original license below- heavily modified by Alan Davies 2014

*/
var canvascache = [];

var HanziCanvas = function(uuid) {
    var _this = this;
    var _enabled = true;
    _this.parent = null;
    _this.activeChild = null;
    _this.draw = true;
    var hotmin = 1;
    var hotmax = 279;
    var points = [];
    var maxundolength = 10;
    _this.undohistory = [];
    _this.redohistory = [];
    var lastcontrolx = null;
    var lastcontroly = null;
    var lastbrushwidth = 0;
    this.buffer = null;
    this.penblack = function() {
        // this.canvas.style.cursor = "crosshair";
        this.draw = true;
    };
    this.penwhite = function() {
        // this.canvas.style.cursor = "hand";
        this.draw = false;
    };
    this.addUndoHistoryItem = function() {
        if (this.undohistory.length == maxundolength) {
            this.recyclecanvas(this.undohistory[0]);
            this.undohistory.splice(0, 1);
        }
        var newcanvas = this.getnewcanvas();
        newcanvas.ctx.drawImage(this.canvas, 0, 0);
        this.undohistory.push(newcanvas);
        this.clearredohistory();
        shanka.canvasupdateundoredo();
    };
    this.undo = function() {
        if (this.undohistory.length) {
            var newcanvas = this.getnewcanvas();
            newcanvas.ctx.drawImage(this.canvas, 0, 0);
            this.redohistory.push(newcanvas);
            var undocanvas = this.undohistory.pop();
            this.ctx.globalAlpha = 1;
            this.ctx.shadowBlur = 0;
            this.ctx.drawImage(undocanvas, 0, 0);
            this.copyToChild();
            this.recyclecanvas(undocanvas);
        }
    };
    this.redo = function() {
        if (this.redohistory.length) {
            var newcanvas = this.getnewcanvas();
            newcanvas.ctx.drawImage(this.canvas, 0, 0);
            this.undohistory.push(newcanvas);
            var redocanvas = this.redohistory.pop();
            this.ctx.globalAlpha = 1;
            this.ctx.shadowBlur = 0;
            this.ctx.drawImage(redocanvas, 0, 0);
            this.copyToChild();
            this.recyclecanvas(redocanvas);
        }
    };
    this.canundo = function() {
        return this.undohistory.length > 0;
    };
    this.canredo = function() {
        return this.redohistory.length > 0;
    };
    this.getnewcanvas = function() {
        var newcanvas = null;
        if (canvascache.length) {
            newcanvas = canvascache.pop();
        } else {
            newcanvas = document.createElement("canvas");
            if (this.parent) {
                newcanvas.width = this.parent.canvas.width;
                newcanvas.height = this.parent.canvas.height;
            } else {
                newcanvas.width = this.canvas.width;
                newcanvas.height = this.canvas.height;
            }
            newcanvas.ctx = newcanvas.getContext("2d");
        }
        return newcanvas;
    };
    this.recyclecanvas = function(canvas) {
        canvas.parent = null;
        canvascache.push(canvas);
    };
    this.clearundohistory = function() {
        for (var i = 0, len = this.undohistory.length; i < len; i++) {
            this.recyclecanvas(this.undohistory[i]);
        }
        this.undohistory = [];
    };
    this.clearredohistory = function() {
        for (var i = 0, len = this.redohistory.length; i < len; i++) {
            this.recyclecanvas(this.redohistory[i]);
        }
        this.redohistory = [];
    };
    this.reset = function() {
        this.clear();
    };
    this.deselectActiveChild = function() {
        if (this.activeChild != null) {
            // deselect
            this.activeChild.canvas.classList.remove("touchpaintminisel");
            this.activeChild.canvas.classList.add("touchpaintmini");
        }
    };
    this.selectActiveChild = function() {
        if (this.activeChild != null) {
            // select
            this.activeChild.canvas.classList.remove("touchpaintmini");
            this.activeChild.canvas.classList.add("touchpaintminisel");
        }
    };
    this.copyToChild = function() {
        if (this.activeChild != null) {
            this.activeChild.copyFromParent();
        }
    };
    this.copyFromChild = function() {
        if (this.activeChild != null) {
            this.ctx.drawImage(this.activeChild.buffer, 0, 0);
        }
    };
    this.copyFromParent = function() {
        if (this.parent) {
            this.ctx.drawImage(this.parent.canvas, 0, 0, 280, 280, 0, 0, 55, 55);
            this.overdrawBorder();
            if (!this.buffer) {
                // keep a full resolution copy of the image around
                this.buffer = this.getnewcanvas();
            }
            this.buffer.ctx.drawImage(this.parent.canvas, 0, 0, 280, 280, 0, 0, 280, 280);
        }
    };
    this.copychildtochild = function(from, to) {
        to.canvas.ctx.drawImage(from.canvas, 0, 0);
        if (to.buffer) {
            this.recyclecanvas(to.buffer);
        }
        to.buffer = from.buffer;
        from.buffer = null;
    };
    this.overdrawBorder = function() {
        var m = this.canvas.width;
        this.drawLine({
            x: 0,
            y: 0
        }, {
            x: 0,
            y: m
        }, this.parent.bordercolour, 1);
        this.drawLine({
            x: 0,
            y: 0
        }, {
            x: m,
            y: 0
        }, this.parent.bordercolour, 1);
        this.drawLine({
            x: m,
            y: m
        }, {
            x: 0,
            y: m
        }, this.parent.bordercolour, 1);
        this.drawLine({
            x: m,
            y: m
        }, {
            x: m,
            y: 0
        }, this.parent.bordercolour, 1);
    };
    this.clear = function() {
        if (this.parent) {
            this.copyFromParent();
        } else {
            this.addUndoHistoryItem();
            this.ctx.globalAlpha = 1;
            this.ctx.shadowBlur = 0;
            /*this.ctx.beginPath();
      this.ctx.fillStyle = "#ffffff" ;
      this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
      this.ctx.fillRect( 0, 0, this.canvas.width, this.canvas.height );
      this.ctx.closePath();*/
            this.ctx.beginPath();
            this.ctx.fillStyle = this.backgcolour;
            this.ctx.clearRect(hotmin, hotmin, hotmax - hotmin, hotmax - hotmin);
            this.ctx.fillRect(hotmin, hotmin, hotmax - hotmin, hotmax - hotmin);
            this.ctx.closePath();
            points = [];
            this.drawgrid();
            this.copyToChild();
        }
    };
    this.drawgrid = function() {
        // var gcobefore = this.ctx.globalCompositeOperation;      
        // this.ctx.globalCompositeOperation = "darker";
        this.ctx.globalAlpha = 1;
        var guide = shanka.getsetting("guide");
        var hotmid = hotmin + (hotmax - hotmin) / 2;
        var onethird = hotmin + (hotmax - hotmin) / 3;
        var twothirds = hotmin + (hotmax - hotmin) * 2 / 3;
        if (guide == "star" || guide == "cross" || guide == "bar") {
            this.drawLine({
                x: hotmid,
                y: hotmin
            }, {
                x: hotmid,
                y: hotmax
            }, this.gridcolour, 2);
        }
        if (guide == "star" || guide == "cross") {
            this.drawLine({
                x: hotmin,
                y: hotmid
            }, {
                x: hotmax,
                y: hotmid
            }, this.gridcolour, 2);
        }
        if (guide == "star") {
            this.drawLine({
                x: hotmin,
                y: hotmin
            }, {
                x: hotmax,
                y: hotmax
            }, this.gridcolour, 2);
            this.drawLine({
                x: hotmin,
                y: hotmax
            }, {
                x: hotmax,
                y: hotmin
            }, this.gridcolour, 2);
        }
        if (guide == "grid") {
            this.drawLine({
                x: onethird,
                y: hotmin
            }, {
                x: onethird,
                y: hotmax
            }, this.gridcolour, 2);
            this.drawLine({
                x: twothirds,
                y: hotmin
            }, {
                x: twothirds,
                y: hotmax
            }, this.gridcolour, 2);
            this.drawLine({
                x: hotmin,
                y: onethird
            }, {
                x: hotmax,
                y: onethird
            }, this.gridcolour, 2);
            this.drawLine({
                x: hotmin,
                y: twothirds
            }, {
                x: hotmax,
                y: twothirds
            }, this.gridcolour, 2);
        }
        // all have a border
        this.drawLine({
            x: hotmin,
            y: hotmin
        }, {
            x: hotmin,
            y: hotmax
        }, this.bordercolour, 2);
        this.drawLine({
            x: hotmin,
            y: hotmin
        }, {
            x: hotmax,
            y: hotmin
        }, this.bordercolour, 2);
        this.drawLine({
            x: hotmax,
            y: hotmax
        }, {
            x: hotmin,
            y: hotmax
        }, this.bordercolour, 2);
        this.drawLine({
            x: hotmax,
            y: hotmax
        }, {
            x: hotmax,
            y: hotmin
        }, this.bordercolour, 2);
    };
    function startDrawing(e) {
        if (_enabled) {
            var rect = _this.canvas.getBoundingClientRect();
            var _current;
            if (e.targetTouches && e.targetTouches.item(0) !== null) {
                var te = e.targetTouches.item(0);
                _current = {
                    x: te.pageX - rect.left,
                    y: te.pageY - rect.top
                };
            } else {
                _current = {
                    x: e.pageX - rect.left,
                    y: e.pageY - rect.top
                };
            }
            // console.log("start drawing")
            _this.addUndoHistoryItem();
            points = [ _current ];
            _this.brushLine();
            e.preventDefault();
        } else if (_this.parent) {
            var page = document.getElementById("pagecontentouter");
            _this.scrollTop = page.scrollTop;
        }
    }
    this.setActive = function(activeChild) {
        this.deselectActiveChild();
        // clear
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.fillStyle = this.backgcolour;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.closePath();
        // copy image
        this.activeChild = activeChild;
        this.copyFromChild();
        this.selectActiveChild();
        this.clearundohistory();
        this.clearredohistory();
        shanka.canvasupdateundoredo();
    };
    this.setParent = function(newparent) {
        this.parent = newparent;
    };
    /*    
    this.leftstack = [];
    this.rightstack = [];
    
    this.pushleftstack = function() {
        if (this.buffer) {
            this.leftstack.push(this.buffer);
        }
        this.buffer = null;
    }
    this.pushrightstack = function() {
        if (this.buffer) {
            this.rightstack.push(this.buffer);
        }
        this.buffer = null;
    }
    this.poprightstack = function(target) {
        if (this.rightstack.length) {
            if (this.buffer) {
                this.recycleCanvas(this.buffer);
            }
            this.buffer = this.rightstack.pop();
        } else {
            // nothing on the stack, just clear it, parent will be cleared
            target.copyFromParent();
        }
    }
    this.popleftstack = function(target) {
        if (this.leftstack.length) {
            if (this.buffer) {
                this.recycleCanvas(this.buffer);
            }
            this.buffer = this.leftstack.pop();
        } else {
            // nothing on the stack, just clear it, parent will be cleared
            target.copyFromParent();
        }
    } */
    function stopDrawing(e) {
        if (_enabled) {
            if (points.length) {
                var remapcurx = points[points.length - 1].x * _this.canvas.width / _this.canvas.clientWidth + _this.canvas.clientLeft;
                var remapcury = points[points.length - 1].y * _this.canvas.height / _this.canvas.clientHeight + _this.canvas.clientTop;
                if (points.length == 1) {
                    var remapprvx = remapcurx + (Math.random() - .5) * 20;
                    var remapprvy = remapcury + (Math.random() - .5) * 20;
                    _this.createsplodges(lastbrushwidth, remapprvx, remapprvy, remapcurx, remapcury, false);
                    remapprvx = remapcurx + (Math.random() - .5) * 20;
                    remapprvy = remapcury + (Math.random() - .5) * 20;
                    _this.createsplodges(lastbrushwidth, remapprvx, remapprvy, remapcurx, remapcury, false);
                } else {
                    var remapprvx = points[points.length - 2].x * _this.canvas.width / _this.canvas.clientWidth + _this.canvas.clientLeft;
                    var remapprvy = points[points.length - 2].y * _this.canvas.height / _this.canvas.clientHeight + _this.canvas.clientTop;
                    _this.createsplodges(lastbrushwidth, remapprvx, remapprvy, remapcurx, remapcury, true);
                }
            }
            points = [];
            e.preventDefault();
            _this.copyToChild();
        } else if (_this.parent) {
            // ensure that they didn't scroll
            var page = document.getElementById("pagecontentouter");
            if (_this.scrollTop == page.scrollTop) {
                _this.parent.setActive(_this);
            }
        }
    }
    function move(e) {
        if (points.length) {
            var te = e.targetTouches.item(0);
            var rect = _this.canvas.getBoundingClientRect();
            var _current = {
                x: te.pageX - rect.left - 1,
                y: te.pageY - rect.top
            };
            pushPoint(_current);
        }
        e.preventDefault();
    }
    function moveMouse(e) {
        if (points.length) {
            var rect = _this.canvas.getBoundingClientRect();
            var _current = {
                x: e.pageX - rect.left,
                y: e.pageY - rect.top
            };
            pushPoint(_current);
        }
        e.preventDefault();
    }
    function pushPoint(current) {
        var pushpoint = true;
        if (points.length) {
            var last = points[points.length - 1];
            var deltax = last.x - current.x;
            var deltay = last.y - current.y;
            var dist = Math.sqrt(Math.pow(deltax, 2) + Math.pow(deltay, 2));
            if (dist <= 3) {
                pushpoint = false;
            }
        }
        if (pushpoint) {
            points.push(current);
            _this.brushLine();
        }
    }
    this.brushLine = function() {
        // remap width and high to account for resized canvas
        var remapcurx = points[points.length - 1].x * this.canvas.width / this.canvas.clientWidth + this.canvas.clientLeft;
        var remapcury = points[points.length - 1].y * this.canvas.height / this.canvas.clientHeight + this.canvas.clientTop;
        if (remapcurx < hotmin || remapcury < hotmin || remapcurx > hotmax || remapcury > hotmax) {
            this.ctx.globalAlpha = 1;
        } else {
            this.ctx.globalAlpha = 1;
        }
        // this.ctx.shadowColor= this.brushcolour;
        // this.ctx.shadowBlur = brushwidth/6;        
        if (points.length == 1) {
            var strokeSize = this.brushwidth * 4 / 5;
            lastbrushwidth = strokeSize;
            // a single point is a circle
            this.ctx.beginPath();
            this.ctx.arc(remapcurx, remapcury, strokeSize / 2, 0, 2 * Math.PI, false);
            this.ctx.fillStyle = this.brushcolour;
            this.ctx.fill();
        } else {
            var remapprvx = points[points.length - 2].x * this.canvas.width / this.canvas.clientWidth + this.canvas.clientLeft;
            var remapprvy = points[points.length - 2].y * this.canvas.height / this.canvas.clientHeight + this.canvas.clientTop;
            var minwidth = this.brushwidth * 1 / 3;
            var maxwidth = this.brushwidth;
            var distofmaxwidth = 3;
            // dist must be > 4, so no divide by zero problem
            var distofminwidth = 7;
            var dist = Math.sqrt(Math.pow(remapcurx - remapprvx, 2) + Math.pow(remapcury - remapprvy, 2));
            var strokeSize = minwidth + (maxwidth - minwidth) * (distofminwidth - distofmaxwidth) / (dist - distofmaxwidth);
            // ensure it is in a sensible range
            strokeSize = Math.max(Math.min(strokeSize, maxwidth), minwidth);
            // ensure it's not too big a jump from the last stroke size
            strokeSize = Math.max(Math.min(strokeSize, lastbrushwidth + this.brushwidth / 10), lastbrushwidth - this.brushwidth / 10);
            this.ctx.strokeStyle = this.brushcolour;
            this.ctx.lineWidth = strokeSize;
            this.ctx.beginPath();
            this.ctx.moveTo(remapprvx, remapprvy);
            if (points.length == 2) {
                this.ctx.lineTo(remapcurx, remapcury);
                lastcontrolx = remapcurx - (remapcurx - remapprvx) * .5;
                lastcontroly = remapcury - (remapcury - remapprvy) * .5;
                this.ctx.stroke();
                this.ctx.closePath();
                this.createsplodges(lastbrushwidth, remapcurx, remapcury, remapprvx, remapprvy, true);
            } else {
                var newctlx = remapprvx + (remapprvx - lastcontrolx) * .5;
                var newctly = remapprvy + (remapprvy - lastcontroly) * .5;
                this.ctx.quadraticCurveTo(newctlx, newctly, remapcurx, remapcury);
                lastcontrolx = newctlx;
                lastcontroly = newctly;
                this.ctx.stroke();
                this.ctx.closePath();
            }
            // save for next time
            lastbrushwidth = strokeSize;
        }
        if (!this.draw) {}
    };
    this.drawLine = function(start, end, colour, lineWidth) {
        this.ctx.globalAlpha = 1;
        this.ctx.strokeStyle = colour;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.stroke();
        this.ctx.closePath();
    };
    this.createsplodges = function(lastbrushwidth, fromx, fromy, tox, toy, pointy) {
        var deltax = tox - fromx;
        var deltay = toy - fromy;
        var dist = Math.sqrt(Math.pow(deltax, 2) + Math.pow(deltay, 2));
        var unitx = deltax / dist;
        var unity = deltay / dist;
        var numsplodge = Math.floor(Math.random() * 15 + 15);
        for (var i = 0; i < numsplodge; i++) {
            var strokeSize = (Math.random() + .3) * lastbrushwidth / 4;
            var paralleldist = lastbrushwidth / 2 * (Math.random() * .7 + .4);
            var tangentdist = lastbrushwidth / 2 * (Math.random() * 1.9 - .95);
            if (pointy) {
                paralleldist += (lastbrushwidth / 2 - Math.abs(tangentdist)) * 1.2;
            }
            var remapcurx = tox + unitx * paralleldist + unity * tangentdist;
            var remapcury = toy + unity * paralleldist - unitx * tangentdist;
            var remapprvx = remapcurx - unitx * lastbrushwidth / 2;
            var remapprvy = remapcury - unity * lastbrushwidth / 2;
            // this.ctx.globalAlpha = (Math.random() * 0.7 + 0.1);
            this.ctx.strokeStyle = this.brushcolour;
            this.ctx.lineWidth = strokeSize / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(remapprvx, remapprvy);
            this.ctx.lineTo(remapcurx, remapcury);
            this.ctx.stroke();
            this.ctx.closePath();
        }
    };
    function gobbler(e) {
        e.preventDefault();
    }
    this.getData = function() {};
    this.init = function(args) {
        if (args && "enabled" in args && typeof args.enabled === "boolean") {
            _enabled = args.enabled;
        }
        this.canvas = document.getElementById(uuid);
        if (args && "height" in args && typeof args.height === "number") {
            this.height = args.height;
        } else {
            this.height = this.canvas.clientHeight;
        }
        if (args && "width" in args && typeof args.width === "number") {
            this.width = args.width;
        } else {
            this.width = this.canvas.clientWidth;
        }
        this.canvas.style.background = this.backgcolour;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.lineCap = "round";
        this.canvas.addEventListener("touchstart", startDrawing, false);
        this.canvas.addEventListener("mousedown", startDrawing, false);
        this.canvas.addEventListener("touchend", stopDrawing, false);
        if (_enabled) {
            this.canvas.style.cursor = "crosshair";
            this.canvas.addEventListener("touchmove", move, false);
            document.body.addEventListener("gesturestart", gobbler, true);
            this.canvas.addEventListener("mousemove", moveMouse, false);
            this.canvas.addEventListener("click", stopDrawing, false);
            this.clear();
        }
    };
};

/*
    Shanka HSK Flashcards - shanka.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    
    You muse also respect the licenses of any components written by others which are
    distributed along with this web app.
    
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 (alan@hskhsk.com)
    
    Dutch Translation by Axel Dessein (axel_dessein@hotmail.com)
    Spanish Translation by Nicolás Godoy (nicolasgastongodoy@gmail.com)
        
    See http://hskhsk.com/shanka for more information.

*/
// Google Analytics stuff goes here
(function(i, s, o, g, r, a, m) {
    i["GoogleAnalyticsObject"] = r;
    i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments);
    }, i[r].l = 1 * new Date();
    a = s.createElement(o), m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
})(window, document, "script", "//www.google-analytics.com/analytics.js", "ga");

ga("create", "UA-39955029-5", "hskhsk.com");

ga("send", "pageview");

// ---------------------------
// create shanka as a singleton
var shanka = {};

shanka.init = function() {
    WaitCursorOn();
    try {
        var appsupport = document.getElementById("default_app_support_see_message");
        var appinit = document.getElementById("default_app_support_see_message");
        if (appinit) {
            // 'cut' the 'mustard', apparently
            if ("querySelector" in document && "addEventListener" in window && Array.prototype.forEach) {
                appinit.innerHTML = STR.app_initialising_message;
            } else {
                appinit.innerHTML = STR.app_no_html5_message;
            }
        }
        if (appsupport) {
            appsupport.innerHTML = STR.app_support_see_message;
        }
        document.getElementById("snap_page_main_title").innerHTML = STR.page_main_title;
        document.getElementById("snap_page_practice_title").innerHTML = STR.page_practice_title;
        document.getElementById("snap_study_study_text").innerHTML = STR.study_study_text;
        document.getElementById("snap_gen_add_text").innerHTML = STR.gen_add_text;
        document.getElementById("snap_page_history_title").innerHTML = STR.page_history_title;
        document.getElementById("snap_page_queue_title").innerHTML = STR.page_queue_title;
        document.getElementById("snap_page_progress_title").innerHTML = STR.page_progress_title;
        document.getElementById("snap_page_categories_title").innerHTML = STR.page_categories_title;
        document.getElementById("snap_page_questions_title").innerHTML = STR.page_questions_title;
        document.getElementById("snap_page_lessons_title").innerHTML = STR.page_lessons_title;
        document.getElementById("snap_page_algorithms_title").innerHTML = STR.page_algorithms_title;
        document.getElementById("snap_page_wizard_title").innerHTML = STR.page_wizard_title;
        document.getElementById("snap_page_import_title").innerHTML = STR.page_import_title;
        document.getElementById("snap_page_export_title").innerHTML = STR.page_export_title;
        document.getElementById("snap_page_settings_title").innerHTML = STR.page_settings_title;
        document.getElementById("snap_page_maintenance_title").innerHTML = STR.page_maintenance_title;
        // study
        document.getElementById("studycurrent").innerHTML = STR.study_study_text;
        document.getElementById("studypractice").innerHTML = STR.study_practice_text;
        document.getElementById("studyedit").innerHTML = STR.study_edit_text;
        document.getElementById("studyreveal").innerHTML = STR.study_show_answer_label;
        document.getElementById("study_search_result_label").innerHTML = STR.study_search_result_label;
        shanka.nextguid = 1;
        // increment so all ids unique
        shanka.cards = {};
        // id : card
        shanka.lessons = {};
        // id : lesson 
        shanka.categories = {};
        // id : category
        shanka.questions = {};
        // id : question
        shanka.settings = {};
        // key : value
        shanka.algorithms = {};
        // id : algorithm 
        shanka.progress = [];
        // sorted
        shanka.queue = [];
        // sorted
        shanka.history = [];
        // sorted
        shanka.studybackstack = [];
        shanka.studyfwdstack = [];
        // persistent touchpaints in cache
        shanka.minitps = [];
        // shanka.relatedcharmap[ch] = wordmap
        // wordmap[word] = cardids
        shanka.relatedcharmap = {};
        // {"X" : {"X" : [1, 4], "XX" : [2, 6], "XY" : 3}, "Y" : {"XY" : 3} }
        shanka.algorithm = null;
        shanka.currentlang = "";
        var currentState = parseWindowLocation();
        shanka.readall();
        window.onpopstate = shanka.onpopstate;
        shanka.initlocal();
        if (shanka.state && "section" in shanka.state && shanka.state["section"] != "initialising" && (!currentState || !("section" in currentState) || currentState["section"] == "main" || currentState["section"] == "welcome")) {
            var useStoredState = true;
            if ("cardid" in shanka.state && !(shanka.state["cardid"] in shanka.cards)) {
                console.log("Cannot used stored state, invalid cardid: " + shanka.state["cardid"].toString());
                useStoredState = false;
            }
            if ("questionid" in shanka.state && !(shanka.state["questionid"] in shanka.questions)) {
                console.log("Cannot used stored state, invalid questionid: " + shanka.state["questionid"].toString());
                useStoredState = false;
            }
            if ("categoryid" in shanka.state && !(shanka.state["categoryid"] in shanka.categories)) {
                console.log("Cannot used stored state, invalid categoryid: " + shanka.state["categoryid"].toString());
                useStoredState = false;
            }
            if ("lessonid" in shanka.state && !(shanka.state["lessonid"] in shanka.lessons)) {
                console.log("Cannot used stored state, invalid lessonid: " + shanka.state["lessonid"].toString());
                useStoredState = false;
            }
            if ("algorithmid" in shanka.state && !(shanka.state["algorithmid"] in shanka.algorithms)) {
                console.log("Cannot used stored state, invalid algorithmid: " + shanka.state["algorithmid"].toString());
                useStoredState = false;
            }
            currentState = shanka.state;
            console.log("using stored state instead: " + JSON.stringify(currentState));
        } else {
            shanka.showstate({
                section: "initialising"
            });
        }
        shanka.navigate(currentState);
        shanka.fastclick = new FastClick(document.body);
    } catch (err) {
        ExceptionError("shanka.init", err);
    }
    WaitCursorOff();
};

shanka.doexporttextfile = function() {
    WaitCursorOn();
    try {
        // saveAs(document.getElementById("exporttextdata").value, "shanka-export.txt");
        //window.open("data:text/json;charset=utf-8," + escape(document.getElementById("exporttextdata").value));
        // from http://thiscouldbebetter.wordpress.com/2012/12/18/loading-editing-and-saving-a-text-file-in-html5-using-javascrip/
        var textFileAsBlob = new Blob([ document.getElementById("exporttextdata").value ], {
            type: "text/plain"
        });
        var downloadLink = document.createElement("a");
        downloadLink.download = STR.export_download_filename;
        downloadLink.innerHTML = STR.export_download_filetext;
        if (window.webkitURL != null) {
            // Chrome allows the link to be clicked
            // without actually adding it to the DOM.
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
        } else {
            // Firefox requires the link to be added to the DOM
            // before it can be clicked.
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = destroyClickedElement;
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
        }
        downloadLink.click();
    } catch (err) {
        ExceptionError("doexporttextfile", err);
    }
    WaitCursorOff();
};

shanka.dorebuild = function() {
    if (confirm(STR.local_storage_rebuild_confirm)) {
        shanka.init();
        shanka.addtoresult(STR.local_storage_rebuilt_ok_message);
        shanka._updatemlocalstorageused();
    }
};

shanka.donuke = function() {
    WaitCursorOn();
    try {
        if (confirm(STR.local_storage_erase_confirm)) {
            var language = localStorage["language"];
            if (!language || !(language in supportedLanguages)) {
                language = "en";
            }
            localStorage.clear();
            localStorage["language"] = language;
            shanka.init();
            shanka.addtoresult(STR.local_storage_erased_message);
            shanka._updatemlocalstorageused();
        }
    } catch (err) {
        ExceptionError("donuke", err);
    }
    WaitCursorOff();
};

shanka.doreload = function() {
    WaitCursorOn();
    try {
        shanka.init();
        shanka.addtoresult(STR.app_was_reloaded_message);
    } catch (err) {
        ExceptionError("doreload", err);
    }
    WaitCursorOff();
};

shanka.addtoresult = function(message) {
    var result = document.getElementById("result").innerHTML;
    if (result.length) {
        result += "<br />" + message;
    } else {
        result = message;
    }
    document.getElementById("result").innerHTML = result;
};

shanka.showmain = function() {
    shanka.navigate({
        section: "main"
    });
};

shanka.addcategory = function() {
    shanka.navigate({
        section: "addcategory"
    });
};

shanka.doaddcategoryadd = function() {
    if (shanka._addcategory()) {
        shanka.showcategories();
    }
};

shanka.doshowcategory = function() {
    if ("categoryid" in shanka.state) {
        shanka.showcategory(parseInt(shanka.state["categoryid"]));
    }
};

shanka.showlessons = function() {
    shanka.navigate({
        section: "lessons"
    });
};

shanka.showprogress = function() {
    shanka.navigate({
        section: "progress"
    });
};

shanka.showsettings = function() {
    shanka.navigate({
        section: "settings"
    });
};

shanka.showmaintenance = function() {
    shanka.navigate({
        section: "maintenance"
    });
};

shanka.showquestions = function() {
    shanka.navigate({
        section: "questions"
    });
};

shanka.showquestion = function(questionid) {
    if (questionid) {
        shanka.navigate({
            section: "question",
            questionid: questionid
        });
    } else {
        shanka.navigate({
            section: "question"
        });
    }
};

shanka.showsidebarmenu = function() {
    if (is_IE()) {
        shanka.navigate({
            section: "left-drawer"
        });
    } else {
        snapper.open("left");
    }
};

shanka.showimport = function() {
    shanka.navigate({
        section: "import"
    });
};

shanka.showshankiimport = function() {
    shanka.navigate({
        section: "shankiimport"
    });
};

shanka.showplecoimport = function() {
    shanka.navigate({
        section: "plecoimport"
    });
};

shanka.showstickyimport = function() {
    shanka.navigate({
        section: "stickyimport"
    });
};

shanka.showskritterimport = function() {
    shanka.navigate({
        section: "skritterimport"
    });
};

shanka.showexport = function() {
    shanka.navigate({
        section: "export"
    });
};

shanka.doexportshanka = function() {
    shanka.export("shanka");
};

shanka.doexportother = function() {
    var fileformat = "";
    if (document.getElementById("exportpleco").classList.contains("active")) {
        fileformat = "pleco";
    } else if (document.getElementById("exportsticky").classList.contains("active")) {
        fileformat = "sticky";
    } else if (document.getElementById("exportsimp").classList.contains("active")) {
        fileformat = "simplified";
    } else {
        // exporttrad
        fileformat = "traditional";
    }
    shanka.export(fileformat);
};

shanka.navigate = function(state, stateAction) {
    WaitCursorOn();
    try {
        if (!state || (state["section"] == "study" || state["section"] == "main") && isEmpty(shanka.cards) || state["section"] == "welcome" || state["section"].substr(0, 4) == "lang") {
            if (isEmpty(shanka.cards)) {
                state = {
                    section: "welcome"
                };
            } else {
                state = {
                    section: "main"
                };
            }
        }
        // keep the fwd/back stacks up to date
        if (state["section"] == "study" || state["section"] == "practice" && "cardid" in state || state["section"] == "info") {
            if ("fwdback" in state) {
                delete state["fwdback"];
            } else {
                if (shanka.state["section"] == "study" || shanka.state["section"] == "practice" && "cardid" in shanka.state || shanka.state["section"] == "info") {
                    shanka.studybackstack.push(shanka.state);
                }
                shanka.studyfwdstack = [];
            }
        } else {
            shanka.studybackstack = [];
            shanka.studyfwdstack = [];
        }
        if (stateAction == "suppress") {
            console.log("suppressing state update");
        } else {
            shanka.updateHistoryUrlState(state, stateAction);
        }
        document.getElementById("help-button").style.display = "inline";
        var pageTitle = "Shanka 闪卡";
        shanka.showstate(state);
        switch (state["section"]) {
          case "initialising":
            shanka.initinitialising();
            break;

          case "main":
            shanka.showmenubuttonhideback();
            shanka.initmain();
            shanka.setpagetitle(STR.page_main_app_title);
            break;

          case "welcome":
            shanka.showmenubuttonhideback();
            shanka.initwelcome();
            shanka.setpagetitle(STR.page_main_app_title);
            break;

          case "card":
            var cardid = null;
            if ("cardid" in state) {
                shanka.hidemenubuttonsetback(shanka.studyinfo);
                shanka.setpagetitle(STR.page_edit_flashcard_title);
                cardid = parseInt(state["cardid"]);
            } else {
                shanka.hidemenubuttonsetback(shanka.navigateprevious);
                shanka.setpagetitle(STR.page_add_flashcard_title);
            }
            var categoryid = null;
            if ("categoryid" in state) {
                categoryid = parseInt(state["categoryid"]);
            }
            shanka.initshowcard(cardid, categoryid);
            break;

          case "info":
            if ("cardid" in state) {
                var cardid = parseInt(state["cardid"]);
                shanka.initcardinfo(cardid);
            }
            break;

          case "practice":
            shanka.initpractice();
            // no need for a title
            break;

          case "categories":
            shanka.showmenubuttonhideback();
            shanka.initcategories();
            shanka.setpagetitle(STR.page_categories_title);
            break;

          case "addcategory":
            shanka.hidemenubuttonsetback(shanka.showcategories);
            shanka.initaddcategory();
            shanka.setpagetitle(STR.page_add_category_title);
            break;

          case "editcategory":
            shanka.hidemenubuttonsetback(shanka.showcurrentcategory);
            shanka.initeditcategory(parseInt(state["categoryid"]));
            shanka.setpagetitle(STR.page_edit_category_name_title);
            break;

          case "category":
            shanka.hidemenubuttonsetback(shanka.showcategories);
            shanka.initshowcategory(parseInt(state["categoryid"]), false, false);
            // title set in child function
            break;

          case "editflashcards":
            shanka.hidemenubuttonsetback(shanka.showcurrentcategory);
            shanka.initshowcategory(parseInt(state["categoryid"]), true, true);
            // title set in child function
            break;

          case "progress":
            shanka.showmenubuttonhideback();
            shanka.initprogress();
            shanka.setpagetitle(STR.page_progress_title);
            break;

          case "history":
            shanka.showmenubuttonhideback();
            shanka.inithistory();
            shanka.setpagetitle(STR.page_history_title);
            break;

          case "queue":
            shanka.showmenubuttonhideback();
            shanka.initqueue();
            shanka.setpagetitle(STR.page_queue_title);
            break;

          case "study":
            shanka.initstudy();
            // no need for a title
            break;

          case "settings":
            shanka.showmenubuttonhideback();
            shanka.initsettings();
            shanka.setpagetitle(STR.page_settings_title);
            break;

          case "lessons":
            shanka.showmenubuttonhideback();
            shanka.initlessons();
            shanka.setpagetitle(STR.page_lessons_title);
            break;

          case "lesson":
            shanka.hidemenubuttonsetback(shanka.showlessons);
            if ("lessonid" in state) {
                shanka.initlesson(parseInt(state["lessonid"]));
                shanka.setpagetitle(STR.page_edit_lesson_title);
            } else {
                shanka.initlesson();
                shanka.setpagetitle(STR.page_add_lesson_title);
            }
            break;

          case "help":
            shanka.hidemenubuttonsetback(shanka.navigateprevious);
            document.getElementById("help-button").style.display = "none";
            if ("page" in state) {
                shanka.inithelp(state["page"]);
            } else {
                shanka.inithelp("");
            }
            pageTitle = "Help";
            // title set in child function
            break;

          case "import":
            shanka.showmenubuttonhideback();
            shanka.initimport();
            shanka.setpagetitle(STR.page_import_title);
            break;

          case "export":
            shanka.showmenubuttonhideback();
            shanka.initexport();
            shanka.setpagetitle(STR.page_export_title);
            break;

          case "exported":
            shanka.hidemenubuttonsetback(shanka.showexport);
            shanka.initexported();
            shanka.setpagetitle(STR.page_export_title);
            break;

          case "maintenance":
            shanka.showmenubuttonhideback();
            shanka.initmaintenance();
            shanka.setpagetitle(STR.page_maintenance_title);
            break;

          case "questions":
            shanka.showmenubuttonhideback();
            shanka.initquestions();
            shanka.setpagetitle(STR.page_questions_title);
            break;

          case "question":
            shanka.hidemenubuttonsetback(shanka.showquestions);
            if ("questionid" in state) {
                shanka.initshowquestion(parseInt(state["questionid"]));
                shanka.setpagetitle(STR.page_edit_question_title);
            } else {
                shanka.initshowquestion();
                shanka.setpagetitle(STR.page_add_question_title);
            }
            break;

          case "algorithms":
            shanka.showmenubuttonhideback();
            shanka.initalgorithms();
            shanka.setpagetitle(STR.page_algorithms_title);
            break;

          case "editalgorithms":
            shanka.hidemenubuttonsetback(shanka.showalgorithms);
            shanka.initeditalgorithms();
            shanka.setpagetitle(STR.page_edit_algorithms_title);
            break;

          case "editcategories":
            shanka.hidemenubuttonsetback(shanka.showcategories);
            shanka.initeditcategories();
            shanka.setpagetitle(STR.page_edit_categories_title);
            break;

          case "editquestions":
            shanka.hidemenubuttonsetback(shanka.showquestions);
            shanka.initeditquestions();
            shanka.setpagetitle(STR.page_edit_questions_title);
            break;

          case "editlessons":
            shanka.hidemenubuttonsetback(shanka.showlessons);
            shanka.initeditlessons();
            shanka.setpagetitle(STR.page_edit_lessons_title);
            break;

          case "algorithm-add":
            shanka.hidemenubuttonsetback(shanka.showalgorithms);
            shanka.initaddalgorithms();
            shanka.setpagetitle(STR.page_add_algorithm_title);
            break;

          case "algorithm-shanka":
            if ("algorithmid" in state) {
                shanka.hidemenubuttonsetback(shanka.showalgorithms);
                shanka.initshankaalgorithm(parseInt(state["algorithmid"]));
                shanka.setpagetitle(STR.page_edit_algorithm_title);
            } else {
                shanka.hidemenubuttonsetback(shanka.addalgorithm);
                shanka.initshankaalgorithm();
                shanka.setpagetitle(STR.page_add_algorithm_title);
            }
            break;

          case "wizard1":
            shanka.showmenubuttonhideback();
            shanka.wizard1init();
            shanka.setpagetitle(STR.page_wizard1_title);
            break;

          case "wizard2":
            shanka.hidemenubuttonsetback(shanka.wizard);
            shanka.wizard2init();
            shanka.setpagetitle(STR.page_wizard2_title);
            break;

          case "wizard3":
            shanka.hidemenubuttonsetback(shanka.wizard2);
            shanka.wizard3init();
            shanka.setpagetitle(STR.page_wizard3_title);
            break;

          case "wizard4":
            shanka.hidemenubuttonsetback(shanka.wizard3);
            shanka.wizard4init();
            shanka.setpagetitle(STR.page_wizard4_title);
            break;

          default:
            console.log("shanka.navigate() unknown section: " + state["section"]);
            break;
        }
        // fix the scroll problem (iOS, text field)
        window.scrollTo(0, 0);
    } catch (err) {
        ExceptionError("navigate", err);
    }
    WaitCursorOff();
};

shanka.navigateprevious = function() {
    var state = JSON.parse(JSON.stringify(shanka.state));
    if ("previous" in state) {
        var previous = state["previous"];
        state["section"] = previous;
        delete state["previous"];
    }
    if ("previouscardid" in state) {
        var previouscardid = state["previouscardid"];
        state["cardid"] = previouscardid;
        delete state["previouscardid"];
    }
    shanka.navigate(state);
};

shanka.showmenubuttonhideback = function() {
    document.getElementById("title-button-prev").style.display = "none";
    document.getElementById("toggle-left").style.display = "block";
};

shanka.hidemenubuttonsetback = function(callback) {
    document.getElementById("title-button-prev").style.display = "block";
    document.getElementById("title-button-prev").onclick = callback;
    document.getElementById("toggle-left").style.display = "none";
};

shanka.updateHistoryUrlState = function(state, stateAction) {
    var statebits = [ state["section"] ];
    for (var key in state) {
        if (key != "section") {
            statebits.push(key + "=" + state[key]);
        }
    }
    if (stateAction == "replace") {
        console.log("replacing state with " + JSON.stringify(state));
        history.replaceState(state, state["section"], "#" + statebits.join(","));
    } else {
        console.log("pushState " + JSON.stringify(state));
        history.pushState(state, state["section"], "#" + statebits.join(","));
    }
    localStorage["state"] = shanka.compress(JSON.stringify(shanka.state));
};

shanka.showstate = function(state) {
    console.log("showState " + JSON.stringify(state));
    if (!state) state = {
        section: "main"
    };
    var _body = document.getElementById("pagecontent");
    var section = state["section"];
    if (_body && section) {
        if (section == "study" || section == "info" || section == "practice") {
            // disable the bar, and move the page content up for 'study'/info/practice
            document.getElementById("bar-title").style.display = "none";
            document.getElementById("pagecontentouter").style.top = "0px";
            document.getElementById("pagecontentouter").setAttribute("data-snap-ignore", "true");
        } else {
            document.getElementById("bar-title").style.display = "block";
            // enabled by default
            document.getElementById("pagecontentouter").style.top = "44px";
            // spaced by default
            document.getElementById("pagecontentouter").removeAttribute("data-snap-ignore");
        }
        if (section == "study" || section == "practice") {
            _body.style.display = "none";
            _body.innerHTML = "";
        } else {
            var _content = document.getElementById(section);
            if (_content) {
                var _html = _content.innerHTML;
                _body.innerHTML = _html;
            }
            _body.style.display = "inline";
            document.getElementById("study").style.display = "none";
        }
        shanka.state = state;
        localStorage["state"] = shanka.compress(JSON.stringify(shanka.state));
    }
};

shanka.setpagetitle = function(title) {
    document.getElementById("pagetitle").innerHTML = title;
};

shanka.onpopstate = function(event) {
    console.log("onpopstate " + JSON.stringify(event.state));
    if (event.state) {
        shanka.navigate(event.state, "suppress");
    }
};

shanka.initinitialising = function() {
    document.getElementById("init_app_support_see_message").innerHTML = STR.app_support_see_message;
    document.getElementById("app_please_wait_a_moment").innerHTML = STR.app_please_wait_a_moment;
    // 'cut' the 'mustard', apparently
    if ("querySelector" in document && "addEventListener" in window && Array.prototype.forEach) {
        document.getElementById("app_initialising_message").innerHTML = STR.app_initialising_message;
    } else {
        document.getElementById("app_initialising_message").innerHTML = STR.app_no_html5_message;
    }
};

// Main Section
shanka.initmain = function() {
    shanka.ensuretodayhasprogress();
    document.getElementById("progress_total_label").innerHTML = STR.progress_total_label;
    document.getElementById("progress_today_label").innerHTML = STR.progress_today_label;
    document.getElementById("all_main_cards_learned_label").innerHTML = STR.main_cards_learned_label;
    document.getElementById("all_progress_studied_label").innerHTML = STR.progress_studied_label;
    document.getElementById("today_main_cards_learned_label").innerHTML = STR.main_cards_learned_label;
    document.getElementById("today_progress_studied_label").innerHTML = STR.progress_studied_label;
    document.getElementById("study_study_text").innerHTML = STR.study_study_text;
    document.getElementById("study_practice_text").innerHTML = STR.study_practice_text;
    document.getElementById("card_add_text").innerHTML = STR.card_add_text;
    if (shanka.progress.length) {
        var progress = shanka.progress[0];
        var timestudied = progress.totaltimestudied;
        var itemsstudied = progress.totalitemsstudied;
        var cardsknown = progress.totalcardsknown;
        var valunit = shanka.getprogressvalunit(timestudied);
        document.getElementById("maintimestudiedalltime").innerHTML = valunit[0];
        document.getElementById("maintimeunitalltime").innerHTML = valunit[1];
        document.getElementById("maincardslearnedalltime").innerHTML = cardsknown.toString();
        document.getElementById("maincardsstudiedalltime").innerHTML = itemsstudied.toString();
        if (shanka.progress.length > 1) {
            var prevprogress = shanka.progress[1];
            timestudied = progress.totaltimestudied - prevprogress.totaltimestudied;
            itemsstudied = progress.totalitemsstudied - prevprogress.totalitemsstudied;
            cardsknown = progress.totalcardsknown - prevprogress.totalcardsknown;
        }
        document.getElementById("maintimestudiedtoday").innerHTML = valunit[0];
        document.getElementById("maintimeunittoday").innerHTML = valunit[1];
        document.getElementById("maincardslearnedtoday").innerHTML = cardsknown.toString();
        document.getElementById("maincardsstudiedtoday").innerHTML = itemsstudied.toString();
    }
};

shanka.initwelcome = function() {
    // 'cut' the 'mustard', apparently
    if (!("querySelector" in document) || !("addEventListener" in window) || !Array.prototype.forEach) {
        shanka.addtoresult(STR.main_browser_no_html5_error);
    }
    document.getElementById("main_menu_help_label").innerHTML = STR.main_menu_help_label;
    document.getElementById("main_choose_option_begin_label").innerHTML = STR.main_choose_option_begin_label;
    document.getElementById("main_beginners_quickstart_label").innerHTML = STR.main_beginners_quickstart_label;
    document.getElementById("main_setup_wizard_label").innerHTML = STR.main_setup_wizard_label;
    document.getElementById("lang_interface_language").innerHTML = STR.lang_interface_language;
    document.getElementById("welcome_app_support_see_message").innerHTML = STR.app_support_see_message;
    var supportedlanglist = document.getElementById("supportedlanglist");
    for (var languageId in supportedLanguages) {
        if (languageId != STR.getCurrentLanguage()) {
            var language = supportedLanguages[languageId];
            var ul = document.createElement("ul");
            ul.classList.add("inset");
            ul.classList.add("list");
            ul.innerHTML = "<li>" + "<a href='javascript:STR.setLanguage(\"" + languageId + "\")'>" + language.this_switch_language + " (" + STR.get_language_name(languageId) + ")" + "<span class='chevron'></span>" + "</a>" + "</li>";
            supportedlanglist.appendChild(ul);
            var br = document.createElement("br");
            supportedlanglist.appendChild(br);
        }
    }
};

// ================
// Pinyin numbers to tone marks
/*
var pinyintones = [ "A\u0100\u00C1\u0102\u00C0A", "a\u0101\u00E1\u0103\u00E0a",
                    "E\u0112\u00C9\u0114\u00C8E", "e\u0113\u00E9\u0115\u00E8e",
                    "O\u014C\u00D3\u014E\u00D2O", "o\u014D\u00F3\u014F\u00F2o",
                    "I\u012A\u00CD\u012C\u00CCI", "i\u012B\u00ED\u012D\u00ECi",
                    "U\u016A\u00DA\u016C\u00D9U", "u\u016B\u00FA\u016D\u00F9u",
                    "\u00DC\u01D5\u01D7\u01D9\u01DB\u00DC", "\u00FC\u01D6\u01D8\u01DA\u01DC\u00FC"];
                    */
var pyreplacements = [ [ "u:", "ü" ], [ "v", "ü" ], [ "U:", "Ü" ], [ "V", "Ü" ] ];

var pinyin_numbers_to_tone_marks = function(inputstr) {
    var result = "";
    var nexthanzi = 0;
    var reg = new RegExp(/[A-Za-z\u00FC\u00DC:]+[1-5]/g);
    var match = null;
    while ((match = reg.exec(inputstr)) != null) {
        var start = inputstr.indexOf(match, nexthanzi);
        if (start != nexthanzi) {
            result += inputstr.substr(nexthanzi, start - nexthanzi);
        }
        var syllable = match.substr(0, match.length - 1);
        var tone = parseInt(match.substr(match.length - 1, 1));
        for (var i = 0, len = pyreplacements.length; i < len; i++) {
            syllable = syllable.replace(pyreplacements[i][0], pyreplacements[i][1]);
        }
        for (var i = 0, len = pyreplacements.length; i < len; i++) {
            var tonetest = pyreplacements[i];
            var chartest = tonetest.substr(0, 1);
            if (contains(syllable, chartest)) {
                // don't replace the "i" when we have "iu", we'll do the "u" instead later
                if (chartest.toLowerCase() != "i" || !syllable.toLowerCase().contains("iu")) {
                    result += syllable.replace(chartest, tonetest.substr(tone, 1));
                    break;
                }
            }
        }
        nexthanzi += match.length;
    }
    if (nexthanzi != inputstr.length) {
        result += inputstr.substr(nexthanzi);
    }
};

shanka.filterlistpages = function(population) {
    var pageselect = document.getElementById("pageselect");
    var listmax = parseInt(shanka.getsetting("listmax"));
    var sample = [];
    if (population.length <= listmax) {
        pageselect.style.display = "none";
        sample = population;
    } else {
        pageselect.style.display = "inline";
        var page = 0;
        if ("page" in shanka.state) {
            page = parseInt(shanka.state["page"]);
        }
        if (page == -1) {
            sample = population;
        } else {
            for (var i = page; i < page + listmax && i < population.length; i++) {
                sample.push(population[i]);
            }
        }
        var option = document.createElement("option");
        option.text = STR.gen_all_text + " (" + population.length.toString() + "）";
        option.value = "-1";
        pageselect.add(option, null);
        for (var j = 0; j < population.length; j += listmax) {
            var upperbound = Math.min(j + listmax, population.length);
            var option = document.createElement("option");
            option.text = (j + 1).toString() + " ... " + upperbound.toString();
            option.value = j.toString();
            pageselect.add(option, null);
        }
        if (page == -1) {
            pageselect.selectedIndex = 0;
        } else {
            pageselect.selectedIndex = Math.floor(page / listmax) + 1;
        }
    }
    return sample;
};

shanka.onpageselectchange = function() {
    var pageselect = document.getElementById("pageselect");
    var page = parseInt(pageselect.options[pageselect.selectedIndex].value);
    var state = JSON.parse(JSON.stringify(shanka.state));
    // copy
    state["page"] = page.toString();
    shanka.navigate(state);
};

shanka.snapperclose = function() {
    snapper.close();
};

shanka.snapperopen = function(which) {
    snapper.open(which);
};

/*
    Shanka HSK Flashcards - lesson.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
// ---------------------------
// Lesson is a collection of questions and categories
function Lesson() {
    this.lessonid = 0;
    this.name = "";
    this.enabled = true;
    this.reviewmode = false;
    this.allquestions = false;
    this.allcategories = false;
    this.questionids = [];
    this.categoryids = [];
}

// ---------------------------
// Lesson methods
Lesson.prototype.write = function() {
    localStorage["l" + this.lessonid.toString(36)] = shanka.compress(JSON.stringify(this));
};

Lesson.prototype.del = function() {
    delete shanka.lessons[this.lessonid];
    localStorage.removeItem("l" + this.lessonid.toString(36));
};

// Lessons Section
shanka.getuniquelessonname = function(prefix) {
    var i = 2;
    var newname = prefix;
    var found = true;
    while (found) {
        found = false;
        for (var lessonidstr in shanka.lessons) {
            if (shanka.lessons[lessonidstr].name == newname) {
                found = true;
                break;
            }
        }
        if (found) {
            newname = prefix + " (" + i.toString() + ")";
            i++;
        }
    }
    return newname;
};

shanka.initlessons = function() {
    document.getElementById("study_study_text").innerHTML = STR.study_study_text;
    document.getElementById("gen_add_text").innerHTML = STR.gen_add_text;
    document.getElementById("gen_edit_all_text").innerHTML = STR.gen_edit_all_text;
    // document.getElementById("gen_add_text2").innerHTML = STR.gen_add_text; 
    // document.getElementById("gen_edit_all_text2").innerHTML = STR.gen_edit_all_text; 
    shanka.initlessonslist(false);
};

shanka.initeditlessons = function() {
    document.getElementById("gen_duplicate_text").innerHTML = STR.gen_duplicate_text;
    document.getElementById("gen_delete_text").innerHTML = STR.gen_delete_text;
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text;
    // document.getElementById("gen_duplicate_text2").innerHTML = STR.gen_duplicate_text; 
    // document.getElementById("gen_delete_text2").innerHTML = STR.gen_delete_text; 
    // document.getElementById("gen_cancel_text2").innerHTML = STR.gen_cancel_text; 
    shanka.initlessonslist(true);
};

shanka.initlessonslist = function(addonclick) {
    var lessonlist = document.getElementById("lessonlist");
    var lis = lessonlist.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (lessonlist.firstChild) {
        lessonlist.removeChild(lessonlist.firstChild);
    }
    for (var lessonidstr in shanka.lessons) {
        var lesson = shanka.lessons[lessonidstr];
        var li = document.createElement("li");
        li.innerHTML = template.replace(/#ID#/g, lesson.lessonid.toString()).replace(/#NAME#/g, lesson.name).replace(/#CHECKED#/g, lesson.enabled ? "active" : "").replace(/#REVIEW#/g, lesson.reviewmode ? STR.lesson_review_mode_name : "");
        if (addonclick) {
            li.onclick = function(e) {
                shanka.togglechild(e.target);
                e.preventDefault();
            };
        }
        lessonlist.appendChild(li);
    }
};

shanka.addlesson = function() {
    shanka.navigate({
        section: "lesson"
    });
};

shanka.showlesson = function(lessonid) {
    shanka.navigate({
        section: "lesson",
        lessonid: lessonid
    });
};

shanka.initlesson = function(lessonid) {
    document.getElementById("lesson_name_label").innerHTML = STR.lesson_name_label;
    document.getElementById("lesson_reviewing_label").innerHTML = STR.lesson_reviewing_label;
    document.getElementById("page_questions_title").innerHTML = STR.page_questions_title;
    document.getElementById("questions_gen_all_text").innerHTML = STR.gen_all_text;
    document.getElementById("categories_gen_all_text").innerHTML = STR.gen_all_text;
    document.getElementById("page_categories_title").innerHTML = STR.page_categories_title;
    document.getElementById("gen_save_text").innerHTML = STR.gen_save_text;
    var lesson = null;
    if (lessonid in shanka.lessons) {
        lesson = shanka.lessons[lessonid];
    } else {
        lesson = new Lesson();
        lesson.name = shanka.getuniquelessonname(STR.lesson_new_name);
    }
    document.getElementById("editlessonname").value = lesson.name;
    if (lesson.reviewmode) {
        document.getElementById("reviewmodeenabled").classList.add("active");
    }
    if (lesson.allquestions) {
        document.getElementById("questionenabledall").classList.add("active");
    }
    if (lesson.allcategories) {
        document.getElementById("categoryenabledall").classList.add("active");
    }
    shanka.initquestionlist(true);
    shanka.initcategorylist(true, true);
    shanka.lessonquestionallclicked();
    shanka.lessoncategoryallclicked();
};

shanka.onlessoncheckclick = function() {
    WaitCursorOn();
    try {
        for (var lessonidstr in shanka.lessons) {
            var enabled = document.getElementById("lessonenabled" + lessonidstr).classList.contains("active");
            var lesson = shanka.lessons[lessonidstr];
            if (lesson.enabled != enabled) {
                lesson.enabled = enabled;
                lesson.write();
                shanka.queue = [];
            }
        }
    } catch (err) {
        ExceptionError("onlessoncheckclick", err);
    }
    WaitCursorOff();
};

shanka.dosavelesson = function() {
    WaitCursorOn();
    try {
        var newname = document.getElementById("editlessonname").value;
        var questionids = [];
        var categoryids = [];
        if (!newname.length) {
            alert(STR.lesson_name_cant_be_empty_error);
            WaitCursorOff();
            return;
        }
        for (var iterlessonidstr in shanka.categories) {
            var iterlesson = shanka.categories[iterlessonidstr];
            if (parseInt(iterlessonidstr) != lessonid && iterlesson.newname == newname) {
                alert(STR.lesson_name_already_exist_error);
                WaitCursorOff();
                return;
            }
        }
        for (var questionidstr in shanka.questions) {
            if (document.getElementById("questionenabled" + questionidstr).classList.contains("active")) {
                questionids.push(parseInt(questionidstr));
            }
        }
        for (var categoryidstr in shanka.categories) {
            if (document.getElementById("categoryenabled" + categoryidstr).classList.contains("active")) {
                categoryids.push(parseInt(categoryidstr));
            }
        }
        if (!questionids.length) {
            alert(STR.lesson_must_include_1_quest_error);
            WaitCursorOff();
            return;
        }
        if (!categoryids.length) {
            alert(STR.lesson_must_include_1_cat_error);
            WaitCursorOff();
            return;
        }
        var lesson = null;
        if ("lessonid" in shanka.state) {
            var lessonid = parseInt(shanka.state["lessonid"]);
            lesson = shanka.lessons[lessonid];
        } else {
            lesson = new Lesson();
            lesson.lessonid = shanka.getnextguid();
        }
        lesson.reviewmode = document.getElementById("reviewmodeenabled").classList.contains("active");
        lesson.allquestions = document.getElementById("questionenabledall").classList.contains("active");
        lesson.allcategories = document.getElementById("categoryenabledall").classList.contains("active");
        lesson.name = newname;
        lesson.categoryids = categoryids;
        lesson.questionids = questionids;
        shanka.lessons[lesson.lessonid] = lesson;
        lesson.write();
        shanka.showlessons();
        shanka.addtoresult(STR.lesson_saved_format.replace("{0}", lesson.name));
        // need to rebuild
        shanka.queue = [];
    } catch (err) {
        ExceptionError("dosavelesson", err);
    }
    WaitCursorOff();
};

shanka.editlessons = function() {
    shanka.navigate({
        section: "editlessons"
    });
};

shanka.doduplicatelessons = function() {
    WaitCursorOn();
    try {
        var count = 0;
        if (confirm(STR.lesson_duplicate_selected_confirm)) {
            var lessonids = Object.keys(shanka.lessons);
            var i = lessonids.length;
            while (i--) {
                var lessonid = lessonids[i];
                var toggle = document.getElementById("lessonselected" + lessonid.toString());
                if (toggle && toggle.classList.contains("active")) {
                    var lesson = shanka.lessons[lessonid];
                    var newlesson = JSON.parse(JSON.stringify(lesson));
                    // copy
                    newlesson.__proto__ = Lesson.prototype;
                    newlesson.lessonid = shanka.getnextguid();
                    newlesson.name = shanka.getuniquelessonname(lesson.name);
                    newlesson.current = false;
                    shanka.lessons[newlesson.lessonid] = newlesson;
                    newlesson.write();
                    count++;
                }
            }
            shanka.editlessons();
            shanka.addtoresult(STR.lesson_duplicated_format.replace("{0}", count.toString()));
        }
    } catch (err) {
        ExceptionError("duplicatelessons", err);
    }
    WaitCursorOff();
};

shanka.dodeletelessons = function() {
    WaitCursorOn();
    try {
        var count = 0;
        if (confirm(STR.lesson_delete_selected_confirm)) {
            var lessonids = Object.keys(shanka.lessons);
            var i = lessonids.length;
            while (i--) {
                var lessonid = lessonids[i];
                var lesson = shanka.lessons[lessonid];
                var toggle = document.getElementById("lessonselected" + lessonid.toString());
                if (toggle && toggle.classList.contains("active")) {
                    lesson.del();
                    count++;
                }
            }
            shanka.editlessons();
            shanka.addtoresult(STR.lesson_deleted_format.replace("{0}", count.toString()));
        }
    } catch (err) {
        ExceptionError("deletelessons", err);
    }
    WaitCursorOff();
};

shanka.lessonquestionallclicked = function() {
    var allquestions = document.getElementById("questionenabledall").classList.contains("active");
    if (allquestions) {
        for (var questionidstr in shanka.questions) {
            var questioncheck = document.getElementById("questionenabled" + questionidstr);
            questioncheck.classList.add("active");
            questioncheck.parentElement.classList.add("disabled");
        }
    } else {
        var lesson = null;
        if ("lessonid" in shanka.state) {
            var lessonid = parseInt(shanka.state["lessonid"]);
            lesson = shanka.lessons[lessonid];
        } else {
            lesson = new Lesson();
            lesson.lessonid = shanka.getnextguid();
        }
        for (var questionidstr in shanka.questions) {
            var questioncheck = document.getElementById("questionenabled" + questionidstr);
            questioncheck.parentElement.classList.remove("disabled");
            if (contains(lesson.questionids, parseInt(questionidstr))) {
                questioncheck.classList.add("active");
            } else {
                questioncheck.classList.remove("active");
            }
        }
    }
};

shanka.lessoncategoryallclicked = function() {
    var allcategories = document.getElementById("categoryenabledall").classList.contains("active");
    if (allcategories) {
        for (var categoryidstr in shanka.categories) {
            var categorycheck = document.getElementById("categoryenabled" + categoryidstr);
            categorycheck.classList.add("active");
            categorycheck.parentElement.classList.add("disabled");
        }
    } else {
        var lesson = null;
        if ("lessonid" in shanka.state) {
            var lessonid = parseInt(shanka.state["lessonid"]);
            lesson = shanka.lessons[lessonid];
        } else {
            lesson = new Lesson();
            lesson.lessonid = shanka.getnextguid();
        }
        for (var categoryidstr in shanka.categories) {
            var categorycheck = document.getElementById("categoryenabled" + categoryidstr);
            categorycheck.parentElement.classList.remove("disabled");
            if (contains(lesson.categoryids, parseInt(categoryidstr))) {
                categorycheck.classList.add("active");
            } else {
                categorycheck.classList.remove("active");
            }
        }
    }
};

/*
    Shanka HSK Flashcards - card.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
// Card stores individual flash cards
function Card() {
    this.cardid = 0;
    this.enabled = true;
    this.queued = false;
    this.simplified = "";
    this.traditional = "";
    this.pinyin = "";
    this.kn_rate = 0;
    this.last_time = 0;
    this.next_time = 0;
    this.test_count = 0;
    // not read, but written to disk
    this._definition = null;
    this._notes = null;
    this._data = null;
    // {"ks" : 0.5, "kt" : 0.8, ...}
    // not stored
    this.categoryids = [];
}

// ---------------------------
// Card methods
Card.prototype._getdefault = function(section) {
    var defval = "";
    switch (section) {
      // no need to switch on keystem or keyans
        case "kn_rate":
        defval = .5;
        break;

      case "last_time":
        defval = 0;
        break;

      case "next_time":
        defval = 0;
        break;

      case "last_score":
        defval = 0;
        break;

      case "question_count":
        defval = 0;
        break;

      case "correct_count":
        defval = 0;
        break;

      default:
        ReportError("Card._getdefault unknown section: " + section);
    }
    return defval;
};

Card.prototype._getseckey = function(section, keystem, keyans) {
    var seckey = "";
    switch (section) {
      case "kn_rate":
        seckey = "k";
        break;

      case "last_time":
        seckey = "t";
        break;

      case "next_time":
        seckey = "n";
        break;

      case "last_score":
        seckey = "s";
        break;

      case "question_count":
        seckey = "q";
        break;

      case "correct_count":
        seckey = "c";
        break;

      default:
        ReportError("Card._getseckey unknown section: " + section);
    }
    switch (keystem) {
      case "simplified":
        seckey += "s";
        break;

      case "traditional":
        seckey += "t";
        break;

      case "cursive":
        seckey += "v";
        break;

      case "callig":
        seckey += "g";
        break;

      case "tcursive":
        seckey += "V";
        break;

      // deprecated
        case "tcallig":
        seckey += "G";
        break;

      // deprecated
        case "pinyin":
        seckey += "p";
        break;

      case "definition":
        seckey += "d";
        break;

      case "notes":
        seckey += "n";
        break;

      default:
        ReportError("Card._getseckey unknown keystem: " + keystem);
    }
    switch (keyans) {
      case "simplified":
        seckey += "s";
        break;

      case "traditional":
        seckey += "t";
        break;

      case "cursive":
        seckey += "v";
        break;

      case "callig":
        seckey += "g";
        break;

      case "tcursive":
        seckey += "V";
        break;

      // deprecated
        case "tcallig":
        seckey += "G";
        break;

      // deprecated
        case "pinyin":
        seckey += "p";
        break;

      case "definition":
        seckey += "d";
        break;

      case "notes":
        seckey += "n";
        break;

      default:
        ReportError("Card._getseckey unknown keyans: " + keyans);
    }
    return seckey;
};

Card.prototype.ensuredataloaded = function() {
    if (this._data === null) {
        if (this.cardid) {
            var key = "x" + this.cardid.toString(36);
            var text = localStorage.getItem(key);
            if (text !== null) {
                this._data = JSON.parse(shanka.decompress(text));
            } else {
                this._data = {};
            }
        } else {
            this._data = {};
        }
    }
};

Card.prototype.setdata = function(section, keystem, keyans, value) {
    this.ensuredataloaded();
    var seckey = this._getseckey(section, keystem, keyans);
    this._data[seckey] = value;
};

Card.prototype.hasdata = function(section, keystem, keyans) {
    this.ensuredataloaded();
    var seckey = this._getseckey(section, keystem, keyans);
    return seckey in this._data;
};

Card.prototype.getdata = function(section, keystem, keyans) {
    this.ensuredataloaded();
    var seckey = this._getseckey(section, keystem, keyans);
    if (seckey in this._data) {
        return this._data[seckey];
    }
    return this._getdefault(section);
};

Card.prototype.getdatastring = function() {
    this.ensuredataloaded();
    var text = JSON.stringify(this._data);
    return text;
};

Card.prototype.write = function() {
    // do it like this; save local storage space!
    var arr = this.toarray();
    var key = "f" + this.cardid.toString(36);
    var data = shanka.compress(JSON.stringify(arr));
    localStorage[key] = data;
    if (this._definition !== null) {
        var language = STR.getCurrentLanguage();
        if (language == "en") {
            language = "";
        }
        var defkey = "d" + language + this.cardid.toString(36);
        if (this._definition.length) {
            localStorage[defkey] = shanka.compress(this._definition);
        } else {
            localStorage.removeItem(defkey);
        }
    }
    if (this._notes !== null) {
        var noteskey = "n" + this.cardid.toString(36);
        if (this._notes.length) {
            localStorage[noteskey] = shanka.compress(this._notes);
        } else {
            localStorage.removeItem(noteskey);
        }
    }
    if (this._data !== null) {
        var datakey = "x" + this.cardid.toString(36);
        if (Object.keys(this._data).length) {
            localStorage[datakey] = shanka.compress(JSON.stringify(this._data));
        } else {
            localStorage.removeItem(datakey);
        }
    }
    // remove cached definition, notes, data
    this._definition = null;
    this._notes = null;
    this._data = null;
};

Card.prototype.del = function() {
    if (this.categoryids.length) {
        for (var i = 0, len = this.categoryids.length; i < len; i++) {
            var categoryid = this.categoryids[i];
            var category = shanka.categories[categoryid];
            var index = category.cardids.indexOf(this.cardid);
            if (index != -1) {
                console.log("Deleting card " + this.cardid.toString() + " from category " + categoryid.toString());
                category.cardids.splice(index, 1);
                category.write();
            }
        }
    }
    delete shanka.cards[this.cardid];
    console.log("Removing card" + this.cardid.toString() + " from local storage");
    localStorage.removeItem("f" + this.cardid.toString(36));
    console.log("Removing English card definition" + this.cardid.toString() + " from local storage");
    localStorage.removeItem("d" + this.cardid.toString(36));
    for (var languageId in supportedLanguages) {
        console.log("Removing " + languageId + " language card definition" + this.cardid.toString() + " from local storage");
        localStorage.removeItem("d" + languageId + this.cardid.toString(36));
    }
    console.log("Removing card notes" + this.cardid.toString() + " from local storage");
    localStorage.removeItem("n" + this.cardid.toString(36));
    console.log("Removing card data" + this.cardid.toString() + " from local storage");
    localStorage.removeItem("x" + this.cardid.toString(36));
};

Card.prototype.toarray = function() {
    var arr = [ this.cardid, this.enabled, this.queued, this.simplified, this.traditional, this.pinyin, this.kn_rate, this.last_time, this.next_time, this.test_count ];
    return arr;
};

Card.prototype.fromarray = function(arr) {
    this.cardid = arr[0];
    this.enabled = arr[1];
    this.queued = arr[2];
    this.simplified = arr[3];
    this.traditional = arr[4];
    this.pinyin = arr[5];
    this.kn_rate = arr[6];
    this.last_time = arr[7];
    this.next_time = arr[8];
    this.test_count = arr[9];
};

Card.prototype.getdefinition = function() {
    if (this._definition === null) {
        if (this.cardid == 0) {
            return "";
        } else {
            var language = STR.getCurrentLanguage();
            if (language != "en") {
                var otherkey = "d" + language + this.cardid.toString(36);
                var othertext = shanka.decompress(localStorage.getItem(otherkey));
                if (othertext !== null) {
                    return othertext;
                }
            }
            // fall back on English
            var key = "d" + this.cardid.toString(36);
            var text = shanka.decompress(localStorage.getItem(key));
            if (text === null) {
                return "";
            } else {
                return text;
            }
        }
    }
    return this._definition;
};

Card.prototype.setdefinition = function(newtext) {
    this._definition = newtext;
};

Card.prototype.getnotes = function() {
    if (this._notes === null) {
        if (this.cardid == 0) {
            return "";
        } else {
            var key = "n" + this.cardid.toString(36);
            var text = shanka.decompress(localStorage.getItem(key));
            if (text === null) {
                return "";
            } else {
                return text;
            }
        }
    }
    return this._notes;
};

Card.prototype.setnotes = function(newtext) {
    this._notes = newtext;
};

Card.prototype.getminactive = function(section) {
    var min = null;
    var questionids = shanka.getallactivequestionidslist();
    for (var i = 0, questlen = questionids.length; i < questlen; i++) {
        var questionid = questionids[i];
        var question = shanka.questions[questionid];
        for (var j = 0, anslen = question.answer.length; j < anslen; j++) {
            var answer = question.answer[j];
            for (var k = 0, stemlen = question.stem.length; k < stemlen; k++) {
                var stem = question.stem[k];
                if (this.hasdata(section, stem, answer)) {
                    var val = this.getdata(section, stem, answer);
                    if (min === null) {
                        min = val;
                    } else {
                        min = Math.min(min, val);
                    }
                }
            }
        }
    }
    return min;
};

Card.prototype.getmaxactive = function(section) {
    var max = null;
    var questionids = shanka.getallactivequestionidslist();
    for (var i = 0, questlen = questionids.length; i < questlen; i++) {
        var questionid = questionids[i];
        var question = shanka.questions[questionid];
        for (var j = 0, anslen = question.answer.length; j < anslen; j++) {
            var answer = question.answer[j];
            for (var k = 0, stemlen = question.stem.length; k < stemlen; k++) {
                var stem = question.stem[k];
                if (this.hasdata(section, stem, answer)) {
                    var val = this.getdata(section, stem, answer);
                    if (max === null) {
                        max = val;
                    } else {
                        max = Math.max(max, val);
                    }
                }
            }
        }
    }
    return max;
};

Card.prototype.liststring = function() {
    var eng = this.getdefinition();
    if (eng.length >= 30) {
        eng = eng.substring(0, 27) + "...";
    }
    var hanzi = this.simptradtogether();
    var all = hanzi + " " + this.pinyin + " " + eng;
    return all.replace(/[\{\}\|]/g, "");
};

Card.prototype.simptradtogether = function() {
    var hanzi = "";
    var script = shanka.getsetting("script");
    if ((script == "simplified" || script == "simptrad") && this.simplified.length || this.traditional.length == 0) {
        hanzi = this.simplified;
    } else {
        hanzi = this.traditional;
    }
    if (this.simplified.length && this.traditional.length && this.simplified != this.traditional) {
        if (script == "simptrad") {
            hanzi += " [" + this.traditional + "]";
        } else if (script == "tradsimp") {
            hanzi += " [" + this.simplified + "]";
        }
    }
    return hanzi.replace(/[\{\}\|]/g, "");
};

Card.prototype.getindexedchars = function() {
    var script = shanka.getsetting("script");
    if (script == "simplified") {
        return this.simplified;
    } else if (script == "traditional") {
        return this.traditional;
    } else if (script == "simptrad") {
        return this.simplified + this.traditional;
    } else {
        return this.traditional + this.simplified;
    }
};

Card.prototype.getfield = function(field) {
    switch (field) {
      case "simplified":
      case "cursive":
      case "callig":
        return this.simplified.replace(/[\{\}\|]/g, "");

      case "traditional":
        return this.traditional.replace(/[\{\}\|]/g, "");

      case "pinyin":
        return this.pinyin.replace(/[\{\}]/g, "");

      // TODO tones to numbers and vice versa
        case "definition":
        return this.getdefinition().replace(/[\{\}]/g, "");

      case "notes":
        return this.getnotes();
    }
    return "";
};

Card.prototype.issentence = function() {
    return this.simplified.indexOf("|") != -1 || this.traditional.indexOf("|") != -1;
};

Card.prototype.getsentencewords = function() {
    var hanzi = this.simplified.replace(/[\{\}]/g, "|");
    var words = hanzi.split("|");
    return words;
};

shanka.getuniquecardname = function(prefix) {
    var i = 2;
    var newname = prefix;
    var found = true;
    while (found) {
        found = false;
        for (var cardidstr in shanka.cards) {
            if (shanka.cards[cardidstr].name == newname) {
                found = true;
                break;
            }
        }
        if (found) {
            newname = prefix + " (" + i.toString() + ")";
            i++;
        }
    }
    return newname;
};

// Card Section
shanka.showcard = function(cardid) {
    var state = JSON.parse(JSON.stringify(shanka.state));
    var section = state["section"];
    state["previous"] = section;
    state["section"] = "card";
    if (cardid) {
        state["cardid"] = cardid;
    } else if ("cardid" in state) {
        state["previouscardid"] = state["cardid"];
        delete state["cardid"];
    }
    shanka.navigate(state);
};

shanka.editflashcards = function() {
    if ("categoryid" in shanka.state) {
        var state = {
            section: "editflashcards"
        };
        state["categoryid"] = shanka.state["categoryid"];
        shanka.navigate(state);
    }
};

shanka.doduplicateflashcards = function() {
    WaitCursorOn();
    try {
        var count = 0;
        if (confirm(STR.card_duplicate_selected_confirm)) {
            var categoryid = parseInt(shanka.state["categoryid"]);
            var category = shanka.categories[categoryid];
            var i = category.cardids.length;
            while (i--) {
                var cardid = category.cardids[i];
                var cardtoggle = document.getElementById("cardselected" + cardid.toString());
                if (cardtoggle && cardtoggle.classList.contains("active")) {
                    var card = shanka.cards[cardid];
                    var newcard = new Card();
                    newcard.cardid = shanka.getnextguid();
                    newcard.name = shanka.getuniquecardname(card.name);
                    newcard.simplified = card.simplified;
                    newcard.traditional = card.traditional;
                    newcard.pinyin = card.pinyin;
                    newcard.setdefinition(card.getdefinition());
                    newcard.setnotes(card.getnotes());
                    for (var j = 0, len = card.categoryids.length; j < len; j++) {
                        var itercategoryid = card.categoryids[j];
                        var itercategory = shanka.categories[itercategoryid];
                        itercategory.cardids.push(newcard.cardid);
                        newcard.categoryids.push(itercategoryid);
                        if (itercategoryid != categoryid) {
                            itercategory.write();
                        }
                    }
                    shanka.cards[newcard.cardid] = newcard;
                    newcard.write();
                    count++;
                }
            }
            category.write();
            shanka.editflashcards();
            shanka.addtoresult(STR.card_duplicated_format.replace("{0}", count.toString()));
        }
    } catch (err) {
        ExceptionError("duplicateflashcards", err);
    }
};

shanka.doremoveflashcards = function() {
    WaitCursorOn();
    try {
        var count = 0;
        if (confirm(STR.card_remove_selected_confirm)) {
            var categoryid = parseInt(shanka.state["categoryid"]);
            var category = shanka.categories[categoryid];
            var i = category.cardids.length;
            while (i--) {
                var cardid = category.cardids[i];
                var card = shanka.cards[cardid];
                var cardtoggle = document.getElementById("cardselected" + cardid.toString());
                if (cardtoggle && cardtoggle.classList.contains("active")) {
                    category.cardids.splice(i, 1);
                    var index = card.categoryids.indexOf(categoryid);
                    if (index != -1) {
                        card.categoryids.splice(index, 1);
                        if (card.categoryids.length == 0) {
                            var uncat = shanka.categories[0];
                            uncat.cardids.push(card.cardid);
                            uncat.write();
                        }
                        card.write();
                        count++;
                    }
                }
            }
            category.write();
            shanka.editflashcards();
            shanka.addtoresult(STR.card_removed_format.replace("{0}", count.toString()));
        }
    } catch (err) {
        ExceptionError("removeflashcards", err);
    }
};

shanka.dodeleteflashcards = function() {
    WaitCursorOn();
    try {
        var count = 0;
        if (confirm(STR.card_delete_selected_confirm)) {
            var categoryid = parseInt(shanka.state["categoryid"]);
            var category = shanka.categories[categoryid];
            var i = category.cardids.length;
            while (i--) {
                var cardid = category.cardids[i];
                var card = shanka.cards[cardid];
                var cardtoggle = document.getElementById("cardselected" + cardid.toString());
                if (cardtoggle && cardtoggle.classList.contains("active")) {
                    card.del();
                    count++;
                    shanka.queue = [];
                    // need to rebuild          
                    shanka.relatedcharmap = {};
                }
            }
            shanka.editflashcards();
            shanka.addtoresult(STR.card_deleted_format.replace("{0}", count.toString()));
        }
    } catch (err) {
        ExceptionError("deleteflashcards", err);
    }
    WaitCursorOff();
};

shanka.initshowcard = function(cardid, categoryid) {
    document.getElementById("card_enabled_label").innerHTML = STR.card_enabled_label;
    document.getElementById("card_queued_label").innerHTML = STR.card_queued_label;
    document.getElementById("question_simplified_label").innerHTML = STR.question_simplified_label;
    document.getElementById("question_traditional_label").innerHTML = STR.question_traditional_label;
    document.getElementById("question_pinyin_label").innerHTML = STR.question_pinyin_label;
    document.getElementById("question_definition_label").innerHTML = STR.question_definition_label;
    document.getElementById("question_notes_label").innerHTML = STR.question_notes_label;
    document.getElementById("page_categories_title").innerHTML = STR.page_categories_title;
    document.getElementById("savecard").innerHTML = STR.gen_save_text;
    document.getElementById("cancelcard").innerHTML = STR.gen_cancel_text;
    var card = null;
    if (cardid) {
        card = shanka.cards[cardid];
    }
    if (!card) {
        card = new Card();
    }
    // don't display uncategorised
    shanka.initcategorylist(true, false);
    if (Object.keys(shanka.categories).length == 1) {
        document.getElementById("categorylist").style.display = "none";
        document.getElementById("categorytitle").style.display = "none";
    }
    document.getElementById("cardsimp").value = card.simplified;
    document.getElementById("cardtrad").value = card.traditional;
    document.getElementById("cardpiny").value = card.pinyin;
    document.getElementById("carddef").value = card.getdefinition();
    document.getElementById("cardnotes").value = card.getnotes();
    if (card.enabled) {
        document.getElementById("cardenabled").classList.add("active");
    }
    if (card.queued) {
        document.getElementById("cardqueued").classList.add("active");
    }
    for (var i = 0, len = card.categoryids.length; i < len; i++) {
        var itercatid = card.categoryids[i];
        if (itercatid != 0) {
            document.getElementById("categoryenabled" + itercatid.toString()).classList.add("active");
        }
    }
    if (!cardid) {
        var categorycheck = null;
        if (categoryid === null) {
            categorycheck = document.getElementById("categoryenabled" + shanka.getsetting("lastcategoryid"));
        } else {
            categorycheck = document.getElementById("categoryenabled" + categoryid.toString());
        }
        if (categorycheck) {
            categorycheck.classList.add("active");
        }
    }
};

shanka.savecard = function() {
    WaitCursorOn();
    try {
        var simplified = document.getElementById("cardsimp").value;
        var traditional = document.getElementById("cardtrad").value;
        var pinyin = document.getElementById("cardpiny").value;
        var definition = document.getElementById("carddef").value;
        var notes = document.getElementById("cardnotes").value;
        var newcategories = {};
        // id -> category
        var enabled = document.getElementById("cardenabled").classList.contains("active");
        var queued = document.getElementById("cardqueued").classList.contains("active");
        for (var categoryidstr in shanka.categories) {
            if (parseInt(categoryidstr) != 0) {
                var categoryenabled = document.getElementById("categoryenabled" + categoryidstr);
                if (categoryenabled.classList.contains("active")) {
                    var category = shanka.categories[categoryidstr];
                    newcategories[categoryidstr] = category;
                }
            }
        }
        // add the 'uncategorised' category
        if (Object.keys(newcategories).length == 0) {
            newcategories[0] = shanka.categories[0];
        }
        if (queued && !enabled) {
            alert(STR.card_if_queued_must_be_enabled_error);
            WaitCursorOff();
            return;
        }
        if (!simplified.length && !traditional.length) {
            alert(STR.card_must_have_at_least_simp_trad_error);
            WaitCursorOff();
            return;
        }
        if (!definition.length) {
            alert(STR.card_must_have_definition_error);
            WaitCursorOff();
            return;
        }
        var card = null;
        if ("cardid" in shanka.state) {
            card = shanka.cards[parseInt(shanka.state["cardid"])];
        } else {
            card = new Card();
            card.cardid = shanka.getnextguid();
        }
        if (card.simplified != simplified || card.traditional != traditional) {
            // reset related chars
            shanka.relatedcharmap = {};
        }
        card.simplified = simplified;
        card.traditional = traditional;
        card.pinyin = pinyin;
        card.setdefinition(definition);
        card.setnotes(notes);
        card.enabled = enabled;
        card.queued = queued;
        for (var i = 0, catlen = card.categoryids.length; i < catlen; i++) {
            var oldcategoryid = card.categoryids[i];
            if (!(oldcategoryid in newcategories)) {
                var category = shanka.categories[oldcategoryid];
                for (var j = 0, cardlen = category.cardids.length; j < cardlen; j++) {
                    if (category.cardids[j] == card.cardid) {
                        category.cardids.splice(j, 1);
                        category.write();
                        shanka.queue = [];
                        // need to rebuild
                        break;
                    }
                }
            }
        }
        card.categoryids = [];
        for (var newcategoryidstr in newcategories) {
            if (parseInt(newcategoryidstr) >= 0) {
                var category = shanka.categories[newcategoryidstr];
                var containsit = false;
                for (var i = 0, len = category.cardids.length; i < len; i++) {
                    var testcardid = category.cardids[i];
                    if (card.cardid == testcardid) {
                        containsit = true;
                        break;
                    }
                }
                if (!containsit) {
                    category.cardids.push(card.cardid);
                    category.write();
                    shanka.queue = [];
                }
                card.categoryids.push(parseInt(newcategoryidstr));
            }
        }
        shanka.cards[card.cardid] = card;
        card.write();
        shanka.removefromqueue(card);
        shanka.addtoqueue(card);
        if ("categoryid" in shanka.state) {
            shanka.showcurrentcategory();
        } else {
            shanka.showcardinfo(card.cardid);
        }
        shanka.addtoresult(STR.card_saved_message);
    } catch (err) {
        ExceptionError("savecard", err);
    }
    WaitCursorOff();
};

shanka.addtocharmap = function(word, cardid) {
    for (var i = 0, len = word.length; i < len; i++) {
        var ch = word[i];
        if (ch.search(/[A-Za-z0-9]/) == -1) {
            if (!(ch in shanka.relatedcharmap)) {
                shanka.relatedcharmap[ch] = {};
            }
            var wordmap = shanka.relatedcharmap[ch];
            if (!(word in wordmap)) {
                wordmap[word] = [];
            }
            if (!contains(wordmap[word], cardid)) {
                wordmap[word].push(cardid);
            }
        }
    }
};

shanka.rebuildcharmap = function() {
    shanka.relatedcharmap = {};
    for (var cardidstr in shanka.cards) {
        var card = shanka.cards[cardidstr];
        shanka.addtocharmap(card.simplified, card.cardid);
        shanka.addtocharmap(card.traditional, card.cardid);
    }
};

shanka.getrelatedcardids = function(cardid) {
    if (isEmpty(shanka.relatedcharmap)) {
        shanka.rebuildcharmap();
    }
    var relatedcardids = [];
    var card = shanka.cards[cardid];
    var hanzi = card.getindexedchars();
    for (var i = 0, ilen = hanzi.length; i < ilen; i++) {
        var ch = hanzi[i];
        if (ch in shanka.relatedcharmap) {
            var wordmap = shanka.relatedcharmap[ch];
            for (var word in wordmap) {
                var cardids = wordmap[word];
                for (var j = 0, jlen = cardids.length; j < jlen; j++) {
                    var itercardid = cardids[j];
                    var itercard = shanka.cards[itercardid];
                    if (!contains(relatedcardids, itercardid) && cardid != itercardid && !(card.issentence() && itercard.issentence())) {
                        relatedcardids.push(itercardid);
                    }
                }
            }
        }
    }
    return relatedcardids;
};

shanka.mergeimportedcardwithexisting = function(card) {
    var exactmatch = null;
    if (card.simplified.length) {
        var ch = card.simplified.charAt(0);
        if (ch in shanka.relatedcharmap) var wordmap = shanka.relatedcharmap[ch];
        for (var word in wordmap) {
            if (word == card.simplified) {
                var cardids = wordmap[word];
                for (var i = 0, len = cardids.length; i < len; i++) {
                    var cardid = cardids[i];
                    var cardmatch = shanka.cards[cardid];
                    if (!cardmatch) {}
                    if (cardmatch.simplified == card.simplified && cardmatch.traditional == card.traditional) {
                        exactmatch = cardmatch;
                        break;
                    }
                }
            }
            if (exactmatch) {
                break;
            }
        }
    } else {
        var ch = card.traditional.charAt(0);
        if (ch in shanka.relatedcharmap) var wordmap = shanka.relatedcharmap[ch];
        for (var word in wordmap) {
            if (word == card.traditional) {
                var cardids = wordmap[word];
                for (var i = 0, len = cardids.length; i < len; i++) {
                    var cardid = cardids[i];
                    var cardmatch = shanka.cards[cardid];
                    if (!cardmatch) {}
                    if (cardmatch.simplified == card.simplified && cardmatch.traditional == card.traditional) {
                        exactmatch = cardmatch;
                        break;
                    }
                }
            }
            if (exactmatch) {
                break;
            }
        }
    }
    if (exactmatch) {
        // TODO decide whether to update the definition or not
        // var matchdef = exactmatch.getdefinition();
        // var importdef = card.getdefinition();
        var matchpinyin = pinyin_numbers_to_tone_marks(exactmatch.pinyin);
        var importpinyin = pinyin_numbers_to_tone_marks(card.pinyin);
        if (matchpinyin == importpinyin) {
            if (card.getdefinition().length) {
                exactmatch.setdefinition(card.getdefinition());
            }
            if (card.getnotes().length) {
                exactmatch.setnotes(card.getnotes());
            }
            return exactmatch;
        }
    }
    return null;
};

/*
    Shanka HSK Flashcards - category.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
// category is for category lists
function Category() {
    this.categoryid = 0;
    this.name = STR.category_new_name;
    this.cardids = [];
}

// ---------------------------
// Category methods
Category.prototype.write = function() {
    localStorage["c" + this.categoryid.toString(36)] = shanka.compress(JSON.stringify(this));
};

Category.prototype.del = function() {
    for (var i = 0, cardlen = this.cardids.length; i < cardlen; i++) {
        var cardid = this.cardids[i];
        var card = shanka.cards[cardid];
        for (var j = 0, catlen = card.categoryids.length; j < catlen; j++) {
            var categoryid = card.categoryids[j];
            if (categoryid == this.categoryid) {
                card.categoryids.splice(j, 1);
                card.write();
                break;
            }
        }
    }
    for (var lessonidstr in shanka.lessons) {
        var lesson = shanka.lessons[lessonidstr];
        for (var j = 0, catlen = lesson.categoryids.length; j < catlen; j++) {
            if (lesson.categoryids[j] == this.categoryid) {
                lesson.categoryids.splice(j, 1);
                lesson.write();
                break;
            }
        }
    }
    delete shanka.categories[this.categoryid];
    localStorage.removeItem("c" + this.categoryid.toString(36));
};

shanka.getuniquecategoryname = function(prefix) {
    var i = 2;
    var newname = prefix;
    var found = true;
    while (found) {
        found = false;
        for (var categoryidstr in shanka.categories) {
            if (shanka.categories[categoryidstr].name == newname) {
                found = true;
                break;
            }
        }
        if (found) {
            newname = prefix + " (" + i.toString() + ")";
            i++;
        }
    }
    return newname;
};

// Add Category Section
shanka._addcategory = function() {
    var newcategory = new Category();
    newcategory.name = document.getElementById("addcategoryname").value;
    if (newcategory.name == "") {
        alert(STR.category_must_enter_name_error);
        return false;
    }
    for (var categoryidstr in shanka.categories) {
        var category = shanka.categories[categoryidstr];
        if (category.name == newcategory.name) {
            alert(STR.category_name_exists_error);
            return false;
        }
    }
    newcategory.categoryid = shanka.getnextguid();
    shanka.categories[newcategory.categoryid] = newcategory;
    shanka.addnewcategorytolessons(newcategory.categoryid);
    newcategory.write();
    shanka.setsetting("lastcategoryid", newcategory.categoryid);
    return true;
};

// Categories Section
shanka.categorysort = function(left, right) {
    if (left == 0) return -1; else if (right == 0) return 1;
    return shanka.categories[left].name.localeCompare(shanka.categories[right].name);
};

shanka.initcategories = function() {
    document.getElementById("gen_add_text").innerHTML = STR.gen_add_text;
    document.getElementById("gen_edit_all_text").innerHTML = STR.gen_edit_all_text;
    // document.getElementById("gen_add_text2").innerHTML = STR.gen_add_text; 
    // document.getElementById("gen_edit_all_text2").innerHTML = STR.gen_edit_all_text; 
    shanka.initcategorylist(false, true);
};

shanka.initeditcategories = function() {
    document.getElementById("gen_duplicate_text").innerHTML = STR.gen_duplicate_text;
    document.getElementById("gen_delete_text").innerHTML = STR.gen_delete_text;
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text;
    // document.getElementById("gen_duplicate_text2").innerHTML = STR.gen_duplicate_text; 
    // document.getElementById("gen_delete_text2").innerHTML = STR.gen_delete_text; 
    // document.getElementById("gen_cancel_text2").innerHTML = STR.gen_cancel_text; 
    shanka.initcategorylist(true, false);
};

shanka.initcategorylist = function(addonclick, displayuncat) {
    var categorylist = document.getElementById("categorylist");
    var lis = categorylist.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (categorylist.firstChild) {
        categorylist.removeChild(categorylist.firstChild);
    }
    var categoryidssorted = [];
    for (var categoryidstr in shanka.categories) {
        if (parseInt(categoryidstr) > 0 || displayuncat) {
            categoryidssorted.push(parseInt(categoryidstr));
        }
    }
    categoryidssorted.sort(shanka.categorysort);
    for (var i = 0, len = categoryidssorted.length; i < len; i++) {
        var categoryid = categoryidssorted[i];
        var category = shanka.categories[categoryid];
        var li = document.createElement("li");
        li.innerHTML = template.replace(/#ID#/g, category.categoryid.toString()).replace(/#NAME#/g, category.name).replace(/#ITEMS#/g, category.cardids.length.toString());
        categorylist.appendChild(li);
        if (addonclick) {
            li.onclick = function(e) {
                shanka.togglechild(e.target);
                e.preventDefault();
            };
        }
    }
};

shanka.initaddcategory = function() {
    document.getElementById("category_name_label").innerHTML = STR.category_name_label;
    document.getElementById("gen_save_text").innerHTML = STR.gen_save_text;
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text;
};

shanka.initeditcategory = function(categoryid) {
    document.getElementById("category_name_label").innerHTML = STR.category_name_label;
    document.getElementById("gen_save_text").innerHTML = STR.gen_save_text;
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text;
    var category = shanka.categories[categoryid];
    document.getElementById("editcategoryname").value = category.name;
};

shanka.initshowcategory = function(categoryid, addonclick, showall) {
    document.getElementById("category_edit_name").innerHTML = STR.category_edit_name;
    document.getElementById("gen_add_text").innerHTML = STR.gen_add_text;
    document.getElementById("gen_edit_all_text").innerHTML = STR.gen_edit_all_text;
    // document.getElementById("category_edit_name2").innerHTML = STR.category_edit_name; 
    // document.getElementById("gen_add_text2").innerHTML = STR.gen_add_text; 
    // document.getElementById("gen_edit_all_text2").innerHTML = STR.gen_edit_all_text; 
    document.getElementById("gen_duplicate_text").innerHTML = STR.gen_duplicate_text;
    document.getElementById("gen_remove_text").innerHTML = STR.gen_remove_text;
    document.getElementById("gen_delete_text").innerHTML = STR.gen_delete_text;
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text;
    // document.getElementById("gen_duplicate_text2").innerHTML = STR.gen_duplicate_text; 
    // document.getElementById("gen_remove_text2").innerHTML = STR.gen_remove_text; 
    // document.getElementById("gen_delete_text2").innerHTML = STR.gen_delete_text; 
    // document.getElementById("gen_cancel_text2").innerHTML = STR.gen_cancel_text; 
    var cards = document.getElementById("cards");
    var lis = cards.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (cards.firstChild) {
        cards.removeChild(cards.firstChild);
    }
    if (categoryid in shanka.categories) {
        var cardids = [];
        var category = shanka.categories[categoryid];
        shanka.setpagetitle(category.name);
        if (categoryid >= 0) {
            for (var i = 0, len = category.cardids.length; i < len; i++) {
                cardids.push(category.cardids[i]);
            }
        } else {
            for (var cardidstr in shanka.cards) {
                cardids.push(parseInt(cardidstr));
            }
        }
        if (showall) {
            // Add an 'all' element
            var li = document.createElement("li");
            li.innerHTML = template.replace(/#ID#/g, -1).replace(/#DESCRIPTION#/g, "<strong>" + STR.category_all_name + "</strong>");
            for (var i = 0, len = li.children.length; i < len; i++) {
                if (li.children[i].classList.contains("toggle")) {
                    li.children[i].classList.add("all");
                }
            }
            cards.appendChild(li);
            if (addonclick) {
                li.onclick = function(e) {
                    shanka.togglechild(e.target);
                    e.preventDefault();
                };
            }
        }
        var filteredcardids = shanka.filterlistpages(cardids);
        for (var i = 0, len = filteredcardids.length; i < len; i++) {
            var cardid = filteredcardids[i];
            var card = shanka.cards[cardid];
            var li = document.createElement("li");
            li.innerHTML = template.replace(/#ID#/g, cardid).replace(/#DESCRIPTION#/g, card.liststring());
            cards.appendChild(li);
            if (addonclick) {
                li.onclick = function(e) {
                    shanka.togglechild(e.target);
                    e.preventDefault();
                };
            }
        }
    }
};

shanka.showcategories = function() {
    shanka.navigate({
        section: "categories"
    });
};

shanka.showcategory = function(categoryid) {
    shanka.navigate({
        section: "category",
        categoryid: categoryid
    });
};

shanka.showcurrentcategory = function() {
    if ("categoryid" in shanka.state) {
        shanka.navigate({
            section: "category",
            categoryid: shanka.state["categoryid"]
        });
    }
};

shanka.editcategory = function() {
    shanka.navigate({
        section: "editcategory",
        categoryid: shanka.state["categoryid"]
    });
};

shanka.dosavecategory = function(categoryid) {
    WaitCursorOn();
    try {
        var categoryid = parseInt(shanka.state["categoryid"]);
        var category = shanka.categories[categoryid];
        var newname = document.getElementById("editcategoryname").value;
        if (!newname) {
            alert(STR.category_must_enter_name_error);
            return;
        }
        for (var itercatidstr in shanka.categories) {
            var itercat = shanka.categories[itercatidstr];
            if (parseInt(itercatidstr) != categoryid && itercat.newname == newname) {
                alert(STR.category_name_exists_error);
                return;
            }
        }
        category.name = newname;
        category.write();
        shanka.showcurrentcategory();
        shanka.addtoresult(STR.category_saved_format.replace("{0}", category.name));
    } catch (err) {
        ExceptionError("dosavecategory", err);
    }
    WaitCursorOff();
};

shanka.getallactivecategoryidsdict = function(foradding) {
    // build a list of all categories that are part of enabled lessons
    var categoryids = {};
    for (var lessonidstr in shanka.lessons) {
        var lesson = shanka.lessons[lessonidstr];
        // if we are adding, ignore lessons in 'review mode'
        if (lesson.enabled && (!foradding || !lesson.reviewmode)) {
            for (var i = 0, len = lesson.categoryids.length; i < len; i++) {
                var categoryid = lesson.categoryids[i];
                categoryids[categoryid] = true;
            }
        }
    }
    return categoryids;
};

shanka.getallactivecategoryidslist = function(foradding) {
    var categoryidslist = [];
    var categoryidsdict = shanka.getallactivecategoryidsdict(foradding);
    for (var categoryidstr in categoryidsdict) {
        categoryidslist.push(parseInt(categoryidstr));
    }
    return categoryidslist;
};

shanka.getallactivequestionidsdict = function() {
    var questionids = {};
    for (var lessonidstr in shanka.lessons) {
        var lesson = shanka.lessons[lessonidstr];
        if (lesson.enabled) {
            for (var i = 0, len = lesson.questionids.length; i < len; i++) {
                var questionid = lesson.questionids[i];
                questionids[questionid] = true;
            }
        }
    }
    return questionids;
};

shanka.getallactivequestionidslist = function() {
    var questionidslist = [];
    var questionidsdict = shanka.getallactivequestionidsdict();
    for (var questionidstr in questionidsdict) {
        questionidslist.push(parseInt(questionidstr));
    }
    return questionidslist;
};

shanka.editcategories = function() {
    shanka.navigate({
        section: "editcategories"
    });
};

shanka.doduplicatecategories = function() {
    WaitCursorOn();
    try {
        var count = 0;
        if (confirm(STR.category_duplicate_sel_confirm)) {
            var categoryids = Object.keys(shanka.categories);
            var i = categoryids.length;
            while (i--) {
                var categoryid = categoryids[i];
                var toggle = document.getElementById("categoryselected" + categoryid.toString());
                if (toggle && toggle.classList.contains("active")) {
                    var category = shanka.categories[categoryid];
                    var newcategory = JSON.parse(JSON.stringify(category));
                    // copy
                    newcategory.__proto__ = Category.prototype;
                    newcategory.categoryid = shanka.getnextguid();
                    newcategory.name = shanka.getuniquecategoryname(category.name);
                    newcategory.current = false;
                    shanka.categories[newcategory.categoryid] = newcategory;
                    for (var j = 0, cardslen = newcategory.cardids.length; j < cardslen; j++) {
                        var cardid = newcategory.cardids[j];
                        var card = shanka.cards[cardid];
                        card.categoryids.push(newcategory.categoryid);
                    }
                    shanka.addnewcategorytolessons(newcategory.categoryid);
                    newcategory.write();
                    count++;
                }
            }
            shanka.editcategories();
            shanka.addtoresult(STR.category_duplicated_format.replace("{0}", count.toString()));
        }
    } catch (err) {
        ExceptionError("duplicatecategories", err);
    }
    WaitCursorOff();
};

shanka.dodeletecategories = function() {
    WaitCursorOn();
    try {
        var count = 0;
        if (confirm(STR.category_delete_selected_confirm)) {
            var categoryids = Object.keys(shanka.categories);
            var i = categoryids.length;
            while (i--) {
                var categoryid = categoryids[i];
                var category = shanka.categories[categoryid];
                var toggle = document.getElementById("categoryselected" + categoryid.toString());
                if (toggle && toggle.classList.contains("active")) {
                    category.del();
                    count++;
                }
            }
            shanka.editcategories();
            shanka.addtoresult(STR.category_deleted_format.replace("{0}", count.toString()));
        }
    } catch (err) {
        ExceptionError("deletecategories", err);
    }
    WaitCursorOff();
};

shanka.addnewcategorytolessons = function(categoryid) {
    // add this category to any lessons flagged 'all'
    for (var lessonidstr in shanka.lessons) {
        var lessonid = parseInt(lessonidstr);
        var lesson = shanka.lessons[lessonid];
        if (lesson.allcategories) {
            lesson.categoryids.push(categoryid);
            lesson.write();
        }
    }
};

/*
    Shanka HSK Flashcards - question.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
function Question() {
    this.questionid = 0;
    this.autogenname = true;
    this.name = "";
    this.autogentext = true;
    this.questiontext = "";
    this.input = [];
    // ["draw", "type"]
    this.stem = [];
    // ["simplified"]
    this.answer = [];
    // ["english", "pinyin"];
    this.display = [];
}

// ---------------------------
// Question methods
Question.prototype.write = function() {
    localStorage["q" + this.questionid.toString(36)] = shanka.compress(JSON.stringify(this));
};

Question.prototype.del = function() {
    for (var lessonidstr in shanka.lessons) {
        var lesson = shanka.lessons[lessonidstr];
        for (var j = 0, len = lesson.questionids.length; j < len; j++) {
            if (lesson.questionids[j] == this.questionid) {
                lesson.questionids.splice(j, 1);
                lesson.write();
                break;
            }
        }
    }
    delete shanka.questions[this.questionid];
    localStorage.removeItem("q" + this.questionid.toString(36));
};

Question.prototype.generatename = function() {
    var stembits = [];
    var answerbits = [];
    var inputbits = [];
    var studyfieldsName = [ STR.study_field_question_name_simplified, STR.study_field_question_name_cursive, STR.study_field_question_name_calligraphy, STR.study_field_question_name_traditional, STR.study_field_question_name_pinyin, STR.study_field_question_name_definition, STR.study_field_question_name_notes ];
    var inputfieldsName = [ STR.study_field_question_text_input_draw, STR.study_field_question_text_input_type ];
    LookupAtoB(this.stem, stembits, studyfields, studyfieldsName);
    LookupAtoB(this.answer, answerbits, studyfields, studyfieldsName);
    LookupAtoB(this.input, inputbits, inputfields, inputfieldsName);
    if (stembits.length == 0) {
        stembits = [ "..." ];
    }
    if (answerbits.length == 0) {
        answerbits = [ "..." ];
    }
    this.name = "";
    if (inputbits.length) {
        this.name += commaAndList(inputbits) + ": ";
    }
    this.name += commaAndList(stembits) + " -> " + commaAndList(answerbits);
};

Question.prototype.generatequestiontext = function() {
    var answerbits = [];
    var inputbits = [];
    var studyfieldsText = [ STR.study_field_question_text_simplified, STR.study_field_question_text_cursive, STR.study_field_question_text_calligraphy, STR.study_field_question_text_traditional, STR.study_field_question_text_pinyin, STR.study_field_question_text_definition, STR.study_field_question_text_notes ];
    var inputfieldsName = [ STR.study_field_question_text_input_draw, STR.study_field_question_text_input_type ];
    LookupAtoB(this.answer, answerbits, studyfields, studyfieldsText);
    LookupAtoB(this.input, inputbits, inputfields, inputfieldsName);
    if (answerbits.length == 0) {
        answerbits = [ "..." ];
    }
    this.questiontext = STR.question_whats_the_format.replace("{0}", commaAndList(answerbits));
};

shanka.getuniquequestionname = function(prefix) {
    var i = 2;
    var newname = prefix;
    var found = true;
    while (found) {
        found = false;
        for (var questionidstr in shanka.questions) {
            if (shanka.questions[questionidstr].name == newname) {
                found = true;
                break;
            }
        }
        if (found) {
            newname = prefix + " (" + i.toString() + ")";
            i++;
        }
    }
    return newname;
};

shanka.initquestions = function() {
    document.getElementById("gen_add_text").innerHTML = STR.gen_add_text;
    document.getElementById("gen_edit_all_text").innerHTML = STR.gen_edit_all_text;
    // document.getElementById("gen_add_text2"     ).innerHTML = STR.gen_add_text2;
    // document.getElementById("gen_edit_all_text2").innerHTML = STR.gen_edit_all_text2;
    shanka.initquestionlist(false);
};

shanka.editquestions = function() {
    shanka.navigate({
        section: "editquestions"
    });
};

shanka.initeditquestions = function() {
    document.getElementById("gen_duplicate_text").innerHTML = STR.gen_duplicate_text;
    document.getElementById("gen_delete_text").innerHTML = STR.gen_delete_text;
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text;
    // document.getElementById("gen_duplicate_text2").innerHTML = STR.gen_duplicate_text; 
    // document.getElementById("gen_delete_text2").innerHTML = STR.gen_delete_text; 
    // document.getElementById("gen_cancel_text2").innerHTML = STR.gen_cancel_text; 
    shanka.initquestionlist(true);
};

shanka.initquestionlist = function(addonclick) {
    var questionlist = document.getElementById("questionlist");
    var lis = questionlist.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (questionlist.firstChild) {
        questionlist.removeChild(questionlist.firstChild);
    }
    for (var questionidstr in shanka.questions) {
        var question = shanka.questions[questionidstr];
        var li = document.createElement("li");
        li.innerHTML = template.replace(/#ID#/g, questionidstr).replace(/#NAME#/g, question.name);
        if (addonclick) {
            li.onclick = function(e) {
                shanka.togglechild(e.target);
                e.preventDefault();
            };
        }
        questionlist.appendChild(li);
    }
};

shanka.initshowquestion = function(questionid) {
    document.getElementById("question_auto_generate_label").innerHTML = STR.question_auto_generate_label;
    document.getElementById("question_name_label").innerHTML = STR.question_name_label;
    document.getElementById("question_auto_generate_label2").innerHTML = STR.question_auto_generate_label2;
    document.getElementById("question_text_label").innerHTML = STR.question_text_label;
    document.getElementById("question_components_label").innerHTML = STR.question_components_label;
    document.getElementById("question_stem_label").innerHTML = STR.question_stem_label;
    document.getElementById("question_answer_label").innerHTML = STR.question_answer_label;
    document.getElementById("question_display_label").innerHTML = STR.question_display_label;
    document.getElementById("question_simplified_label").innerHTML = STR.question_simplified_label;
    document.getElementById("question_traditional_label").innerHTML = STR.question_traditional_label;
    document.getElementById("question_pinyin_label").innerHTML = STR.question_pinyin_label;
    document.getElementById("question_definition_label").innerHTML = STR.question_definition_label;
    document.getElementById("question_notes_label").innerHTML = STR.question_notes_label;
    document.getElementById("question_cursive_label").innerHTML = STR.question_cursive_label;
    document.getElementById("question_calligraphy_label").innerHTML = STR.question_calligraphy_label;
    document.getElementById("question_inputs_label").innerHTML = STR.question_inputs_label;
    document.getElementById("question_hanzi_touch_label").innerHTML = STR.question_hanzi_touch_label;
    document.getElementById("question_text_edit_label").innerHTML = STR.question_text_edit_label;
    document.getElementById("gen_save_text").innerHTML = STR.gen_save_text;
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text;
    var question = null;
    if (questionid && questionid in shanka.questions) {
        question = shanka.questions[questionid];
    } else {
        question = new Question();
        question.name = shanka.getuniquequestionname(STR.question_new_name);
    }
    if (question.autogenname) document.getElementById("questionnameauto").classList.add("active");
    document.getElementById("questionname").value = question.name;
    if (question.autogentext) document.getElementById("questiontextauto").classList.add("active");
    document.getElementById("questiontext").value = question.questiontext;
    if (contains(question.input, "draw")) document.getElementById("questiondrawinput").classList.add("active");
    if (contains(question.input, "type")) document.getElementById("questiontypeinput").classList.add("active");
    for (var i = 0, len = studyfields.length; i < len; i++) {
        var field = studyfields[i];
        var stemcheck = document.getElementById(field + "stem");
        var answercheck = document.getElementById(field + "answer");
        var displaycheck = document.getElementById(field + "display");
        if (contains(question.stem, field)) {
            stemcheck.classList.add("active");
        }
        if (contains(question.answer, field)) {
            answercheck.classList.add("active");
        }
        if (contains(question.display, field)) {
            displaycheck.classList.add("active");
        }
    }
    shanka.onquestionchange();
};

shanka.addquestionoption = function(field) {
    var stemlist = document.getElementById(field + "options");
    for (var i = 0; i < 10; i++) {
        var select = document.getElementById(field + "select" + i.toString());
        if (!select) {
            var template = document.getElementById("questionoptiontemplate");
            select = document.createElement("select");
            select.innerHTML = template.innerHTML;
            select.id = field + "select" + i.toString();
            select.onchange = shanka.onquestionchange;
            stemlist.appendChild(select);
            return select;
        }
    }
    return null;
};

shanka.onquestionchange = function() {
    var stembits = [];
    var answerbits = [];
    var displaybits = [];
    var inputbits = [];
    shanka.getquestionbits(stembits, answerbits, displaybits, inputbits);
    var question = new Question();
    question.stem = stembits;
    question.answer = answerbits;
    question.display = displaybits;
    question.input = inputbits;
    question.generatename();
    question.generatequestiontext();
    if (document.getElementById("questionnameauto").classList.contains("active")) {
        document.getElementById("questionname").disabled = true;
        document.getElementById("questionname").value = question.name;
    } else {
        document.getElementById("questionname").disabled = false;
    }
    if (document.getElementById("questiontextauto").classList.contains("active")) {
        document.getElementById("questiontext").disabled = true;
        document.getElementById("questiontext").value = question.questiontext;
    } else {
        document.getElementById("questiontext").disabled = false;
    }
};

shanka.getquestionbits = function(stembits, answerbits, displaybits, inputbits) {
    for (var i = 0, len = studyfields.length; i < len; i++) {
        var field = studyfields[i];
        var stemcheck = document.getElementById(field + "stem");
        var answercheck = document.getElementById(field + "answer");
        var displaycheck = document.getElementById(field + "display");
        if (stemcheck.classList.contains("active")) {
            stembits.push(field);
        }
        if (answercheck.classList.contains("active")) {
            answerbits.push(studyfields[i]);
        }
        if (displaycheck.classList.contains("active")) {
            displaybits.push(studyfields[i]);
        }
    }
    if (document.getElementById("questiondrawinput").classList.contains("active")) {
        inputbits.push("draw");
    }
    if (document.getElementById("questiontypeinput").classList.contains("active")) {
        inputbits.push("type");
    }
};

shanka.doupdatequestion = function() {
    WaitCursorOn();
    try {
        var stembits = [];
        var answerbits = [];
        var displaybits = [];
        var inputbits = [];
        shanka.getquestionbits(stembits, answerbits, displaybits, inputbits);
        if (!stembits.length || !answerbits.length) {
            alert(STR.question_stem_answer_error);
            WaitCursorOff();
            return;
        }
        var newname = document.getElementById("questionname").value;
        var newtext = document.getElementById("questiontext").value;
        if (!newname.length || !newtext.length) {
            alert(STR.question_name_text_error);
            WaitCursorOff();
            return;
        }
        var question = null;
        if ("questionid" in shanka.state) {
            var questionid = parseInt(shanka.state["questionid"]);
            question = shanka.questions[questionid];
        } else {
            question = new Question();
            question.questionid = shanka.getnextguid();
            shanka.addnewquestiontolessons(question.questionid);
        }
        question.name = newname;
        question.questiontext = newtext;
        question.autogenname = document.getElementById("questionnameauto").classList.contains("active");
        question.autogentext = document.getElementById("questiontextauto").classList.contains("active");
        question.input = inputbits;
        question.stem = stembits;
        question.answer = answerbits;
        question.display = displaybits;
        shanka.questions[question.questionid] = question;
        question.write();
        shanka.showquestions();
        shanka.addtoresult(STR.question_saved_format.replace("{0}", question.name));
    } catch (err) {
        ExceptionError("doupdatequestion", err);
    }
    WaitCursorOff();
};

shanka.doduplicatequestions = function() {
    WaitCursorOn();
    try {
        var count = 0;
        if (confirm(STR.question_duplicate_sel_confirm)) {
            var questionids = Object.keys(shanka.questions);
            var i = questionids.length;
            while (i--) {
                var questionid = questionids[i];
                var toggle = document.getElementById("questionselected" + questionid.toString());
                if (toggle && toggle.classList.contains("active")) {
                    var question = shanka.questions[questionid];
                    var newquestion = JSON.parse(JSON.stringify(question));
                    // copy
                    newquestion.__proto__ = Question.prototype;
                    newquestion.questionid = shanka.getnextguid();
                    newquestion.name = shanka.getuniquequestionname(question.name);
                    newquestion.current = false;
                    shanka.questions[newquestion.questionid] = newquestion;
                    shanka.addnewquestiontolessons(newquestion.questionid);
                    newquestion.write();
                    count++;
                }
            }
            shanka.editquestions();
            shanka.addtoresult(STR.question_duplicated_format.replace("{0}", count.toString()));
        }
    } catch (err) {
        ExceptionError("duplicatequestions", err);
    }
    WaitCursorOff();
};

shanka.dodeletequestions = function() {
    WaitCursorOn();
    try {
        var count = 0;
        if (confirm(STR.question_delete_selected_confirm)) {
            var questionids = Object.keys(shanka.questions);
            var i = questionids.length;
            while (i--) {
                var questionid = questionids[i];
                var question = shanka.questions[questionid];
                var toggle = document.getElementById("questionselected" + questionid.toString());
                if (toggle && toggle.classList.contains("active")) {
                    question.del();
                    count++;
                }
            }
            shanka.editquestions();
            shanka.addtoresult(STR.question_deleted_format.replace("{0}", count.toString()));
        }
    } catch (err) {
        ExceptionError("deletequestions", err);
    }
    WaitCursorOff();
};

shanka.addnewquestiontolessons = function(questionid) {
    // add this question to any lessons flagged 'all'
    for (var lessonidstr in shanka.lessons) {
        var lessonid = parseInt(lessonidstr);
        var lesson = shanka.lessons[lessonid];
        if (lesson.allquestions) {
            lesson.questionids.push(questionid);
            lesson.write();
        }
    }
};

/*
    Shanka HSK Flashcards - algorithm.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
// Algorithm is for SRS algorithms
function Algorithm() {
    this.algorithmid = 0;
    this.current = false;
    this.enabled = true;
    this.name = "";
    this.type = "";
    this.data = {};
}

// ---------------------------
// Algorithm methods
Algorithm.prototype.write = function() {
    localStorage["a" + this.algorithmid.toString(36)] = shanka.compress(JSON.stringify(this));
};

Algorithm.prototype.del = function() {
    delete shanka.algorithms[this.algorithmid];
    localStorage.removeItem("a" + this.algorithmid.toString(36));
};

Algorithm.prototype.getdata = function(key) {
    if (key in this.data) {
        return this.data[key];
    }
    return this._getdefault(key);
};

/* ********** Begin algorithm-specific code ********** */
Algorithm.prototype._getdefault = function(key) {
    var defval = "";
    switch (this.type) {
      case "shanka":
        // just break for now
        break;

      default:
        ReportError("Algorithm._getdefault Unknown type: " + this.type);
        break;
    }
    switch (key) {
      case "auto_unknown_min":
        defval = 7;
        break;

      // shanka
        case "daily_correct_target":
        defval = 50;
        break;

      // shanka
        case "daily_new_target":
        defval = 10;
        break;

      // shanka
        case "daily_time_target":
        defval = 20;
        break;

      // shanka
        case "default_kn_rate":
        defval = .5;
        break;

      // shanka
        case "known_kn_rate":
        defval = .8;
        break;

      // shanka
        case "default_lead_time":
        defval = 24 * 60 * 60 * 1e3;
        break;

      // time based SRS, in ms
        case "answer_1_factor":
        defval = .33;
        break;

      // time based SRS
        case "answer_2_factor":
        defval = .67;
        break;

      // time based SRS
        case "answer_3_factor":
        defval = 1;
        break;

      // time based SRS
        case "answer_4_factor":
        defval = 1.5;
        break;

      // time based SRS
        case "answer_5_factor":
        defval = 3;
        break;

      // time based SRS
        case "adjustment_speed":
        defval = 2;
        break;

      // shanka
        case "prob_of_any_random":
        defval = .1;
        break;

      // shanka
        case "first_element_prob":
        defval = .15;
        break;

      // shanka
        case "minimum_interval":
        defval = 4;
        break;

      // shanka
        default:
        ReportError("Algorithm._getdefault Unknown key: " + key + " for type: " + this.type);
    }
    return defval;
};

Algorithm.prototype.getnextcardquestion = function() {
    var card = null;
    var question = null;
    if (shanka.queue.length == 0) {
        shanka.rebuildqueue();
    }
    switch (this.type) {
      case "shanka":
        var prob_of_any_random = this.getdata("prob_of_any_random");
        var random1 = Math.random();
        var random2 = Math.random();
        var index = 0;
        // trim the queue, to avoid repeating characters
        var trimmedqueue = shanka.queue.concat();
        var minimum_interval = this.getdata("minimum_interval");
        var lastOutOfTrimmedQueue = null;
        for (var i = 0; i < minimum_interval; i++) {
            if (trimmedqueue.length == 1) {
                // save this one for later
                lastOutOfTrimmedQueue = trimmedqueue[0];
            }
            if (shanka.history.length == i) {
                // not enough in the history
                break;
            }
            var cardremove = shanka.history[i];
            var removeindex = trimmedqueue.indexOf(cardremove);
            if (removeindex != -1) {
                trimmedqueue.splice(removeindex, 1);
            }
        }
        if (random1 < prob_of_any_random) {
            // choose a random element from the queue
            index = Math.floor(random2 * trimmedqueue.length);
        } else {
            var a = this.getdata("first_element_prob");
            /* Element 0 is chosen with probability a           => random2 < a  = p_0
                 * Element 1 is chosen with probability a(1-a) = ar => random2 < ar = p_1
                 * Element 2 is chosen with probability a(1-a)^2    => random2 < ar = p_2
                 * p_n = Sum[k=0 to n](ar^n) = a(1-r^(n+1))/(1-r)
                 * => n = ln(1-p_n(1-r)/a)/ln(r) - 1
                 * As 1-r = a this simplifies: n = ln(1-p_n)/ln(r) - 1
                 * Round up n to the next integer and we have an index into the array! If this index is too big for the array, set it
                 * to zero, to assign any extra probability to the first element. */
            var raw = Math.log(1 - random2) / Math.log(1 - a) - 1;
            var index = Math.ceil(raw);
        }
        if (index >= trimmedqueue.length || index < 0) {
            card = shanka.addcardtoqueueifallowed();
            index = 0;
            if (!card) {
                // we failed to get a new card in the queue, at least try 
                // the last one that was in the trimmed queue.
                card = lastOutOfTrimmedQueue;
            }
        }
        if (!card && index < trimmedqueue.length) {
            card = trimmedqueue[index];
        }
        // todo choose the least known question
        // if no matching question, should de-queue card, and try again!
        var questionids = shanka.getallactivequestionidslist();
        var questionid = questionids[Math.floor(Math.random() * questionids.length)];
        question = shanka.questions[questionid];
        break;

      default:
        ReportError("Algorithm.getnextcardquestion Unknown Algorithm: " + this.type);
        break;
    }
    return [ card, question ];
};

Algorithm.prototype.choosequestionbasedoncard = function(card) {
    card;
    var question = null;
    switch (this.type) {
      case "shanka":
        // todo choose the least known question for this card
        // TODO card must also have valid fields for this question
        // can return NULL
        var questionids = shanka.getallactivequestionidslist();
        var questionid = questionids[Math.floor(Math.random() * questionids.length)];
        question = shanka.questions[questionid];
        break;

      default:
        ReportError("Algorithm.choosequestionbasedoncard Unknown Algorithm: " + this.type);
        break;
    }
    return question;
};

Algorithm.prototype.setcardscore = function(card, question, scores) {
    switch (this.type) {
      case "shanka":
        for (var i = 0, anslen = question.answer.length; i < anslen; i++) {
            var answer = question.answer[i];
            var score = scores[answer];
            for (var j = 0, stemlen = question.stem.length; j < stemlen; j++) {
                var stem = question.stem[j];
                var kn_rate = card.getdata("kn_rate", stem, answer);
                var last_time = card.getdata("last_time", stem, answer);
                var next_time = card.getdata("next_time", stem, answer);
                var last_score = card.getdata("last_score", stem, answer);
                var question_count = card.getdata("question_count", stem, answer);
                var correct_count = card.getdata("correct_count", stem, answer);
                var timeNow = new Date().getTime();
                var leadTime = this.getdata("default_lead_time");
                var adjustment_speed = this.getdata("adjustment_speed");
                // if (last_time) {
                //    leadTime = ... TODO for time-based SRS
                // }
                if (score == 1) {
                    kn_rate /= Math.pow(adjustment_speed, 2);
                } else if (score == 2) {
                    kn_rate /= adjustment_speed;
                } else if (score == 3) {
                    kn_rate *= 1.00001;
                } else if (score == 4) {
                    kn_rate = 1 + (kn_rate - 1) / adjustment_speed;
                } else {
                    kn_rate = 1 + (kn_rate - 1) / Math.pow(adjustment_speed, 2);
                }
                last_time = timeNow;
                next_time = timeNow + leadTime;
                last_score = score;
                question_count += 1;
                if (score > 3) correct_count += 1;
                card.setdata("kn_rate", stem, answer, kn_rate);
                card.setdata("last_time", stem, answer, last_time);
                card.setdata("next_time", stem, answer, next_time);
                card.setdata("last_score", stem, answer, last_score);
                card.setdata("question_count", stem, answer, question_count);
                card.setdata("correct_count", stem, answer, correct_count);
            }
        }
        card.kn_rate = card.getminactive("kn_rate");
        card.next_time = card.getminactive("next_time");
        card.last_time = card.getmaxactive("last_time");
        card.test_count += 1;
        card.write();
        // update queue and history
        shanka.removefromqueue(card);
        shanka.removefromhistory(card);
        shanka.addtoqueue(card);
        shanka.addtohistory(card);
        break;

      default:
        ReportError("Algorithm.setcardscore Unknown Algorithm: " + this.type);
        break;
    }
};

Algorithm.prototype.queuecompare = function(a, b) {
    var cmp = 0;
    switch (this.type) {
      case "shanka":
        cmp = a.kn_rate - b.kn_rate;
        // sort on kn_rate, lowest first
        if (cmp == 0) {
            cmp = b.last_time - a.last_time;
        }
        break;

      default:
        ReportError("Algorithm.queuecompare Unknown Algorithm: " + this.type);
        break;
    }
    return cmp;
};

// nasty to use globals, but quick...
var algorithm_globals = new Object();

algorithm_globals.trouble_shown = false;

algorithm_globals.learned_shown = false;

algorithm_globals.learning_shown = false;

Algorithm.prototype.getqueuedisplaytext = function() {
    var kn_rate = 0;
    var text = "";
    switch (this.type) {
      case "shanka":
        kn_rate = Math.round(card.kn_rate * 100);
        text = STR.algorithm_knowledge_rate_display + ": " + kn_rate.toString() + "%";
        if (kn_rate < Math.round(this.getdata("default_kn_rate") * 100)) {
            if (!algorithm_globals.trouble_shown) {
                text += " (" + STR.algorithm_knowledge_rate_trouble + ")";
                algorithm_globals.trouble_shown = true;
            }
        } else if (card.kn_rate > this.getdata("known_kn_rate")) {
            if (!algorithm_globals.learned_shown) {
                text += " (" + STR.algorithm_knowledge_rate_learned + ")";
                algorithm_globals.learned_shown = true;
            }
        } else {
            if (!algorithm_globals.learning_shown) {
                text += " (" + STR.algorithm_knowledge_rate_learning + ")";
                algorithm_globals.learning_shown = true;
            }
        }
        break;

      default:
        ReportError("Algorithm.getqueuedisplaytext Unknown Algorithm: " + this.type);
        break;
    }
    return [ kn_rate, text ];
};

Algorithm.prototype.gethistorydisplaytext = function(card) {
    var text = "";
    switch (this.type) {
      case "shanka":
        var date = new Date(card.last_time);
        var now = new Date();
        text = date.toLocaleDateString();
        if (text == now.toLocaleDateString()) {
            text += " (" + STR.algorithm_history_today + " )";
        } else {
            var yesterday = new Date(now.getTime() - 864e5);
            if (text == yesterday.toLocaleDateString()) {
                text += " (" + STR.algorithm_history_yesterday + " )";
            }
        }
        break;

      default:
        ReportError("Algorithm.gethistorydisplaytext Unknown Algorithm: " + this.type);
        break;
    }
    return text;
};

/* ********** End algorithm-specific code ********** */
shanka.getuniquealgorithmname = function(prefix) {
    // New Algorithm by default
    var i = 2;
    var newname = prefix;
    var found = true;
    while (found) {
        found = false;
        for (var algorithmidstr in shanka.algorithms) {
            if (shanka.algorithms[algorithmidstr].name == newname) {
                found = true;
                break;
            }
        }
        if (found) {
            newname = prefix + " (" + i.toString() + ")";
            i++;
        }
    }
    return newname;
};

shanka.showalgorithms = function() {
    shanka.navigate({
        section: "algorithms"
    });
};

shanka.addalgorithm = function() {
    shanka.navigate({
        section: "algorithm-add"
    });
};

shanka.showalgorithm = function(algorithmid) {
    var algorithm = shanka.algorithms[algorithmid];
    shanka.navigate({
        section: "algorithm-" + algorithm.type,
        algorithmid: algorithmid.toString()
    });
};

shanka.editalgorithms = function() {
    shanka.navigate({
        section: "editalgorithms"
    });
};

shanka.onalgorithmcheckclick = function(algorithmid) {
    var algorithm = shanka.algorithms[algorithmid];
    if (algorithm && shanka.algorithm.algorithmid != algorithm.algorithmid) {
        shanka.algorithm.current = false;
        shanka.algorithm.write();
        shanka.algorithm = algorithm;
        shanka.algorithm.current = true;
        shanka.algorithm.write();
    }
};

shanka.doduplicatealgorithms = function() {
    WaitCursorOn();
    try {
        var count = 0;
        if (confirm(STR.algorithm_duplicate_selected_confirm)) {
            var algorithmids = Object.keys(shanka.algorithms);
            var i = algorithmids.length;
            while (i--) {
                var algorithmid = algorithmids[i];
                var toggle = document.getElementById("algorithmselected" + algorithmid.toString());
                if (toggle && toggle.classList.contains("active")) {
                    var algorithm = shanka.algorithms[algorithmid];
                    var newalgorithm = JSON.parse(JSON.stringify(algorithm));
                    // copy
                    newalgorithm.__proto__ = Algorithm.prototype;
                    newalgorithm.algorithmid = shanka.getnextguid();
                    newalgorithm.name = shanka.getuniquealgorithmname(algorithm.name);
                    newalgorithm.current = false;
                    shanka.algorithms[newalgorithm.algorithmid] = newalgorithm;
                    newalgorithm.write();
                    count++;
                }
            }
            shanka.editalgorithms();
            shanka.addtoresult(STR.algorithm_duplicated_format.replace("{0}", count.toString()));
        }
    } catch (err) {
        ExceptionError("duplicatealgorithms", err);
    }
    WaitCursorOff();
};

shanka.dodeletealgorithms = function() {
    WaitCursorOn();
    try {
        var count = 0;
        if (confirm(STR.algorithm_delete_selected_confirm)) {
            var algorithmids = Object.keys(shanka.algorithms);
            var i = algorithmids.length;
            while (i--) {
                var algorithmid = algorithmids[i];
                var algorithm = shanka.algorithms[algorithmid];
                var toggle = document.getElementById("algorithmselected" + algorithmid.toString());
                if (toggle && toggle.classList.contains("active")) {
                    if (Object.keys(shanka.algorithms).length == 1) {
                        alert(STR.algorithm_cannot_delete_last_error);
                        break;
                    }
                    algorithm.del();
                    count++;
                }
            }
            // ensure an enabled algorithm is selected
            if (!(shanka.algorithm.algorithmid in shanka.algorithms)) {
                for (var algorithmid in shanka.algorithms) {
                    if (algorithm.enabled) {
                        shanka.algorithm = shanka.algorithms[algorithmid];
                        shanka.algorithm.current = true;
                        shanka.algorithm.write();
                        break;
                    }
                }
            }
            shanka.editalgorithms();
            shanka.addtoresult(STR.algorithm_deleted_format.replace("{0}", count.toString()));
        }
    } catch (err) {
        ExceptionError("deletealgorithms", err);
    }
    WaitCursorOff();
};

shanka.doaddshankaalgorithm = function() {
    shanka.navigate({
        section: "algorithm-shanka"
    });
};

shanka.dosaveshankaalgorithm = function() {
    WaitCursorOn();
    try {
        var newname = document.getElementById("editalgorithmname").value;
        var auto_unknown_min = parseInt(document.getElementById("auto_unknown_min").value);
        var daily_correct_target = parseInt(document.getElementById("daily_correct_target").value);
        var daily_new_target = parseInt(document.getElementById("daily_new_target").value);
        var daily_time_target = parseInt(document.getElementById("daily_time_target").value);
        var default_kn_rate = parseFloat(document.getElementById("default_kn_rate").value);
        var known_kn_rate = parseFloat(document.getElementById("known_kn_rate").value);
        var adjustment_speed = parseFloat(document.getElementById("adjustment_speed").value);
        var prob_of_any_random = parseFloat(document.getElementById("prob_of_any_random").value);
        var first_element_prob = parseFloat(document.getElementById("first_element_prob").value);
        var minimum_interval = parseInt(document.getElementById("minimum_interval").value);
        if (!newname.length) {
            alert(STR.algorithm_name_cant_be_empty_error);
            WaitCursorOff();
            return;
        }
        if (auto_unknown_min < 1) {
            alert(STR.algorithm_minimum_unknown_card_positive_int_error);
            WaitCursorOff();
            return;
        }
        if (daily_correct_target < 1) {
            alert(STR.algorithm_daily_correct_target_positive_int_error);
            WaitCursorOff();
            return;
        }
        if (daily_new_target < 1) {
            alert(STR.algorithm_daily_new_target_positive_int_error);
            WaitCursorOff();
            return;
        }
        if (daily_time_target < 1) {
            alert(STR.algorithm_daily_minutes_target_positive_int_error);
            WaitCursorOff();
            return;
        }
        if (default_kn_rate < 0 || default_kn_rate > 1) {
            alert(STR.algorithm_default_knowledge_rate_0_1_error);
            WaitCursorOff();
            return;
        }
        if (known_kn_rate < 0 || known_kn_rate > 1) {
            alert(STR.algorithm_threshold_knowledge_rate_0_1_error);
            WaitCursorOff();
            return;
        }
        if (adjustment_speed <= 0) {
            alert(STR.algorithm_adjustment_speed_positive_error);
            WaitCursorOff();
            return;
        }
        if (prob_of_any_random < 0 || prob_of_any_random > 1) {
            alert(STR.algorithm_any_element_probability_0_1_error);
            WaitCursorOff();
            return;
        }
        if (first_element_prob < 0 || first_element_prob > 1) {
            alert(STR.algorithm_first_element_probability_0_1_error);
            WaitCursorOff();
            return;
        }
        if (minimum_interval < 0) {
            alert(STR.algorithm_minimum_interval_postive_0_error);
            WaitCursorOff();
            return;
        }
        var algorithm = null;
        if ("algorithmid" in shanka.state) {
            var algorithmid = parseInt(shanka.state["algorithmid"]);
            algorithm = shanka.algorithms[algorithmid];
        } else {
            algorithm = new Algorithm();
            algorithm.algorithmid = shanka.getnextguid();
            algorithm.type = "shanka";
        }
        algorithm.name = newname;
        algorithm.setdata("auto_unknown_min", auto_unknown_min);
        algorithm.setdata("daily_correct_target", daily_correct_target);
        algorithm.setdata("daily_new_target", daily_new_target);
        algorithm.setdata("daily_time_target", daily_time_target);
        algorithm.setdata("default_kn_rate", default_kn_rate);
        algorithm.setdata("known_kn_rate", known_kn_rate);
        algorithm.setdata("adjustment_speed", adjustment_speed);
        algorithm.setdata("prob_of_any_random", prob_of_any_random);
        algorithm.setdata("first_element_prob", first_element_prob);
        algorithm.setdata("minimum_interval", minimum_interval);
        shanka.algorithms[algorithm.algorithmid] = algorithm;
        algorithm.write();
        shanka.showalgorithms();
        shanka.addtoresult(STR.algorithm_saved_format.replace("{0}", algorithm.name));
    } catch (err) {
        ExceptionError("doexporttextfile", err);
    }
    WaitCursorOff();
};

shanka.initalgorithms = function() {
    document.getElementById("algorithm_current_label").innerHTML = STR.algorithm_current_label;
    document.getElementById("gen_add_text").innerHTML = STR.gen_add_text;
    document.getElementById("gen_edit_all_text").innerHTML = STR.gen_edit_all_text;
    // document.getElementById("gen_add_text2").innerHTML = STR.gen_add_text; 
    // document.getElementById("gen_edit_all_text2").innerHTML = STR.gen_edit_all_text; 
    shanka.initalgorithmlist(false);
    var selected = document.getElementById("algorithmenabled" + shanka.algorithm.algorithmid.toString());
    selected.classList.add("active");
};

shanka.initeditalgorithms = function() {
    document.getElementById("gen_duplicate_text").innerHTML = STR.gen_duplicate_text;
    document.getElementById("gen_delete_text").innerHTML = STR.gen_delete_text;
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text;
    // document.getElementById("gen_duplicate_text2").innerHTML = STR.gen_duplicate_text; 
    // document.getElementById("gen_delete_text2").innerHTML = STR.gen_delete_text; 
    // document.getElementById("gen_cancel_text2").innerHTML = STR.gen_cancel_text; 
    shanka.initalgorithmlist(true);
};

shanka.initalgorithmlist = function(addonclick) {
    var algorithmlist = document.getElementById("algorithmlist");
    var lis = algorithmlist.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (algorithmlist.firstChild) {
        algorithmlist.removeChild(algorithmlist.firstChild);
    }
    for (var algorithmid in shanka.algorithms) {
        var algorithm = shanka.algorithms[algorithmid];
        var li = document.createElement("li");
        li.innerHTML = template.replace(/#ID#/g, algorithm.algorithmid.toString()).replace(/#NAME#/g, algorithm.name);
        if (addonclick) {
            li.onclick = function(e) {
                shanka.togglechild(e.target);
                e.preventDefault();
            };
        }
        if (!algorithm.enabled) {
            li.classList.add("disabled");
            for (var i = 0, len = li.children.length; i < len; i++) {
                var x = li.children[i];
                x.removeAttribute("href");
            }
        }
        algorithmlist.appendChild(li);
    }
};

shanka.initaddalgorithms = function() {
    document.getElementById("algorithm_choose_label").innerHTML = STR.algorithm_choose_label;
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text;
};

shanka.initshankaalgorithm = function(algorithmid) {
    document.getElementById("page_algo_shanka_title").innerHTML = STR.page_algo_shanka_title;
    document.getElementById("algorithm_name_label").innerHTML = STR.algorithm_name_label;
    document.getElementById("algorithm_study_settings").innerHTML = STR.algorithm_study_settings;
    document.getElementById("algorithm_minimum_unknown_cards").innerHTML = STR.algorithm_minimum_unknown_cards;
    document.getElementById("algorithm_daily_correct_target").innerHTML = STR.algorithm_daily_correct_target;
    document.getElementById("algorithm_daily_new_target").innerHTML = STR.algorithm_daily_new_target;
    document.getElementById("algorithm_daily_minutes_target").innerHTML = STR.algorithm_daily_minutes_target;
    document.getElementById("algorithm_parameters").innerHTML = STR.algorithm_parameters;
    document.getElementById("algorithm_default_knowledge_rate").innerHTML = STR.algorithm_default_knowledge_rate;
    document.getElementById("algorithm_threshold_kn_rate").innerHTML = STR.algorithm_threshold_kn_rate;
    document.getElementById("algorithm_adjustment_speed").innerHTML = STR.algorithm_adjustment_speed;
    document.getElementById("algorithm_any_element_probability").innerHTML = STR.algorithm_any_element_probability;
    document.getElementById("algorithm_first_element_prob").innerHTML = STR.algorithm_first_element_prob;
    document.getElementById("algorithm_minimum_interval").innerHTML = STR.algorithm_minimum_interval;
    document.getElementById("gen_save_text").innerHTML = STR.gen_save_text;
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text;
    var algorithm = null;
    if (algorithmid) {
        algorithm = shanka.algorithms[algorithmid];
    } else {
        algorithm = new Algorithm();
        algorithm.name = shanka.getuniquealgorithmname(STR.algorithm_new_name);
        algorithm.type = "shanka";
    }
    document.getElementById("editalgorithmname").value = algorithm.name;
    document.getElementById("auto_unknown_min").value = algorithm.getdata("auto_unknown_min").toString();
    document.getElementById("daily_correct_target").value = algorithm.getdata("daily_correct_target").toString();
    document.getElementById("daily_new_target").value = algorithm.getdata("daily_new_target").toString();
    document.getElementById("daily_time_target").value = algorithm.getdata("daily_time_target").toString();
    document.getElementById("default_kn_rate").value = algorithm.getdata("default_kn_rate").toString();
    document.getElementById("known_kn_rate").value = algorithm.getdata("known_kn_rate").toString();
    document.getElementById("adjustment_speed").value = algorithm.getdata("adjustment_speed").toString();
    document.getElementById("prob_of_any_random").value = algorithm.getdata("prob_of_any_random").toString();
    document.getElementById("first_element_prob").value = algorithm.getdata("first_element_prob").toString();
};

/*
    Shanka HSK Flashcards - progress.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
// Progress is for historic info
function Progress() {
    this.progressid = 0;
    this.date = 0;
    this.totaltimestudied = 0;
    this.totalcardsknown = 0;
    this.totalitemsstudied = 0;
}

// ---------------------------
// Progress methods
Progress.prototype.write = function() {
    localStorage["p" + this.progressid.toString(36)] = shanka.compress(JSON.stringify(this));
};

Progress.prototype.del = function() {
    delete shanka.progress[this.progressid];
    localStorage.removeItem("p" + this.progressid.toString(36));
};

shanka.initprogress = function() {
    document.getElementById("progress_total_label").innerHTML = STR.progress_total_label;
    document.getElementById("progress_daily_label").innerHTML = STR.progress_daily_label;
    var progresstotallist = document.getElementById("progresstotallist");
    var progressdailylist = document.getElementById("progressdailylist");
    var filteredprogress = shanka.filterlistpages(shanka.progress);
    for (var i = 0, len = filteredprogress.length; i < len; i++) {
        var progress = filteredprogress[i];
        var year = Math.floor(progress.date / 1e4);
        var month = Math.floor(progress.date / 100) - year * 100;
        var day = progress.date - year * 1e4 - month * 100;
        var progresstext = year.toString() + "-";
        if (month < 10) {
            progresstext += "0";
        }
        progresstext += month.toString() + "-";
        if (day < 10) {
            progresstext += "0";
        }
        progresstext += day.toString() + ": ";
        var timestudied = progress.totaltimestudied;
        var itemsstudied = progress.totalitemsstudied;
        var cardsknown = progress.totalcardsknown;
        var format = STR.progress_list_format;
        var valunit = shanka.getprogressvalunit(timestudied);
        var totalstring = progresstext + format.replace("{0}", itemsstudied.toString()).replace("{1}", cardsknown.toString()).replace("{2}", valunit[0] + " " + valunit[1]);
        var li = document.createElement("li");
        var text = document.createTextNode(totalstring);
        li.appendChild(text);
        li.classList.add("norightpaddinglist");
        li.style = "padding-right: 10px;";
        progresstotallist.appendChild(li);
        if (i < shanka.progress.length - 1) {
            var prevprogress = shanka.progress[i + 1];
            timestudied = progress.totaltimestudied - prevprogress.totaltimestudied;
            itemsstudied = progress.totalitemsstudied - prevprogress.totalitemsstudied;
            cardsknown = progress.totalcardsknown - prevprogress.totalcardsknown;
        }
        var valunit = shanka.getprogressvalunit(timestudied);
        var dailystring = progresstext + format.replace("{0}", itemsstudied.toString()).replace("{1}", cardsknown.toString()).replace("{2}", valunit[0] + " " + valunit[1]);
        var li = document.createElement("li");
        var text = document.createTextNode(dailystring);
        li.appendChild(text);
        li.classList.add("norightpaddinglist");
        li.style = "padding-right: 10px;";
        progressdailylist.appendChild(li);
    }
};

shanka.getprogressvalunit = function(timems) {
    var valunit = [ "", "" ];
    var adjtime = 0;
    if (timems < 1e3 * 60) {
        adjtime = timems / 1e3;
        valunit[1] = STR.progress_seconds;
    } else if (timems < 1e3 * 60 * 60) {
        adjtime = timems / (1e3 * 60);
        valunit[1] = STR.progress_minutes;
    } else if (timems < 1e3 * 60 * 60 * 24) {
        adjtime = timems / (1e3 * 60 * 60);
        valunit[1] = STR.progress_hours;
    } else if (timems < 1e3 * 60 * 60 * 24 * 7) {
        adjtime = timems / (1e3 * 60 * 60 * 24);
        valunit[1] = STR.progress_days;
    } else if (timems < 1e3 * 60 * 60 * 24 * 365) {
        adjtime = timems / (1e3 * 60 * 60 * 7);
        valunit[1] = STR.progress_weeks;
    } else {
        adjtime = timems / (1e3 * 60 * 60 * 365);
        valunit[1] = STR.progress_hours;
    }
    var rounded = Math.round(adjtime * 10) / 10;
    valunit[0] = rounded.toString();
    return valunit;
};

shanka.getcurrentdayid = function() {
    var now = new Date();
    var dayid = now.getFullYear() * 1e4 + (now.getMonth() + 1) * 100 + now.getDate();
    return dayid;
};

shanka.updateCurrentProgress = function(timeStudied, known_increment) {
    var today = shanka.getcurrentdayid();
    var lastprogress = shanka.progress[0];
    if (!lastprogress || today != lastprogress.date) {
        var newprogress = new Progress();
        newprogress.progressid = shanka.getnextguid();
        newprogress.date = today;
        newprogress.totalcardsknown = shanka.queue.length - shanka.countqueueunknown();
        newprogress.totalitemsstudied = lastprogress ? lastprogress.totalitemsstudied : 0;
        newprogress.totaltimestudied = lastprogress ? lastprogress.totaltimestudied : 0;
        shanka.progress.unshift(newprogress);
        lastprogress = newprogress;
    }
    lastprogress.totalitemsstudied += 1;
    lastprogress.totalcardsknown += known_increment;
    lastprogress.totaltimestudied += timeStudied;
    lastprogress.write();
};

shanka.ensuretodayhasprogress = function() {
    var today = shanka.getcurrentdayid();
    if (!shanka.progress.length || shanka.progress[0].date != today) {
        var newprogress = new Progress();
        newprogress.date = today;
        shanka.progress.unshift(newprogress);
        newprogress.write();
    }
};

shanka.progresscompare = function(a, b) {
    return b.date - a.date;
};

/*
    Shanka HSK Flashcards - local.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
// ---------------------------
// Objects and local storage serialisation
// ---------------------------
// Local storage format
//
// localStorage["i1A"] = shanka.compress(JSON.stringify(an card obj));
// localStorage["g2B"] = shanka.compress(JSON.stringify(a question obj));
// localStorage["c3C"] = shanka.compress(JSON.stringify(a category obj));
// localStorage["h4D"] = shanka.compress(JSON.stringify(a History obj));
// localStorage["settings"] = shanka.compress(JSON.stringify(settings));
// ---------------------------
// Shanka local storage methods
shanka.getnextguid = function() {
    var guid = shanka.nextguid;
    shanka.nextguid++;
    return guid;
};

shanka.checkguid = function(id) {
    if (id >= shanka.nextguid) {
        shanka.nextguid = id + 1;
    }
};

shanka.compress = function(data) {
    return LZString.compressToUTF16(data);
};

shanka.decompress = function(data) {
    return LZString.decompressFromUTF16(data);
};

shanka.readall = function() {
    var keystodelete = [];
    for (var i = 0, len = localStorage.length; i < len; i++) {
        var key = localStorage.key(i);
        if (!key) {
            console.log("readall null key i:" + String(i));
            continue;
        }
        if (key.charAt(0) == "n" || key.charAt(0) == "d" || key.charAt(0) == "x") {
            // notes or description or data - ignore
            continue;
        }
        var localStorageItem = null;
        var decompressed = null;
        try {
            if (key == "language") {
                // used by language object
                continue;
            }
            localStorageItem = localStorage.getItem(key);
            decompressed = shanka.decompress(localStorageItem);
            var obj = JSON.parse(decompressed);
            if (key == "settings") {
                shanka.settings = obj;
            } else if (key == "state") {
                shanka.state = obj;
            } else if (key.charAt(0) == "f") {
                var card = new Card();
                card.fromarray(obj);
                // Cards are serialised into an array- saves lots of storage space
                shanka.cards[card.cardid] = card;
                shanka.checkguid(card.cardid);
            } else if (key.charAt(0) == "l") {
                obj.__proto__ = Lesson.prototype;
                shanka.lessons[obj.lessonid] = obj;
                shanka.checkguid(obj.lessonid);
            } else if (key.charAt(0) == "a") {
                obj.__proto__ = Algorithm.prototype;
                shanka.algorithms[obj.algorithmid] = obj;
                shanka.checkguid(obj.algorithmid);
                if (obj.current) {
                    shanka.algorithm = obj;
                }
            } else if (key.charAt(0) == "q") {
                obj.__proto__ = Question.prototype;
                shanka.questions[obj.questionid] = obj;
                shanka.checkguid(obj.questionid);
            } else if (key.charAt(0) == "c") {
                obj.__proto__ = Category.prototype;
                shanka.categories[obj.categoryid] = obj;
                shanka.checkguid(obj.categoryid);
            } else if (key.charAt(0) == "p") {
                obj.__proto__ = Progress.prototype;
                shanka.progress.push(obj);
                shanka.checkguid(obj.progressid);
            } else {
                ReportError("readall： Local storage key with unknown prefix: " + key);
                errorsDetected = true;
            }
        } catch (err) {
            ExceptionError("readall key:" + String(key), err);
            if (localStorageItem) {
                console.log("readall failed for key: " + String(key) + " localStorageItem: [[" + localStorageItem + "]]");
            }
            if (decompressed) {
                console.log("readall failed for key: " + String(key) + " decompressed: " + decompressed + "]]");
            }
            keystodelete.push(key);
        }
    }
    var key = null;
    var i = 0;
    try {
        for (i = 0, len = keystodelete.length; i < len; i++) {
            key = keystodelete[i];
            localStorage.removeItem(key);
        }
    } catch (err) {
        ExceptionError("readall deleting i:" + String(i) + " key:" + String(key), err);
    }
    // add default 'uncategorised' category if it is not there. Should always exist and can't be deleted!
    if (!(0 in shanka.categories)) {
        var category1 = new Category();
        category1.name = STR.category_uncategorised_name;
        category1.categoryid = 0;
        shanka.categories[category1.categoryid] = category1;
        category1.write();
    }
    // add default algorithms if there are none
    if (isEmpty(shanka.algorithms)) {
        shanka.EnsureAlgorithmBeginnerExists();
        var algorithm = shanka.EnsureAlgorithmIntermediateExists();
        shanka.EnsureAlgorithmAdvancedExists();
        shanka.EnsureAlgorithmReviewExists();
        shanka.EnsureAlgorithmRandomExists();
        shanka.EnsureAlgorithmRandomReviewExists();
        shanka.EnsureAlgorithmPlecoExists();
        shanka.EnsureAlgorithmSkritterExists();
        algorithm.current = true;
        shanka.algorithm = algorithm;
        algorithm.write();
    }
    var errorsDetected = false;
    // iterate over all lessons, cleaning up any missing questions and categories
    for (var lessonidstr in shanka.lessons) {
        var lesson = shanka.lessons[lessonidstr];
        var dirty = false;
        // detect missing categories
        var i = lesson.categoryids.length;
        while (i--) {
            var categoryid = lesson.categoryids[i];
            if (!(categoryid in shanka.categories)) {
                lesson.categoryids.splice(i, 1);
                ReportError("readall: data integrity error: removing missing category " + categoryid + " from lesson " + lesson.lessonid + " " + lesson.name);
                dirty = true;
                errorsDetected = true;
            }
        }
        // detect missing questions
        var i = lesson.questionids.length;
        while (i--) {
            var questionid = lesson.questionids[i];
            if (!(questionid in shanka.questions)) {
                lesson.questionids.splice(i, 1);
                ReportError("readall: data integrity error: removing missing question " + questionid + " from lesson " + lesson.lessonid + " " + lesson.name);
                dirty = true;
                errorsDetected = true;
            }
        }
        if (lesson.allquestions) {
            for (var questionidstr in shanka.questions) {
                var questionid = parseInt(questionidstr);
                if (!contains(lesson.questionids, questionid)) {
                    ReportError("readall: data integrity error: lesson " + lesson.lessonid.toString() + " " + lesson.name + " with 'all' questions set was missing question id " + questionidstr);
                    lesson.questionids.push(questionid);
                    dirty = true;
                    errorsDetected = true;
                }
            }
        }
        if (lesson.allcategories) {
            for (var categoryidstr in shanka.categories) {
                var categoryid = parseInt(categoryidstr);
                if (!contains(lesson.categoryids, categoryid)) {
                    ReportError("readall: data integrity error: lesson " + lesson.lessonid.toString() + " " + lesson.name + " with 'all' categories set was missing category id " + categoryidstr);
                    lesson.categoryids.push(categoryid);
                    dirty = true;
                    errorsDetected = true;
                }
            }
        }
        if (dirty) {
            lesson.write();
        }
    }
    // Now fill in all of the category links in the cards, which aren't saved to save space
    // as we go, remove any cards that aren't found
    for (var categoryidstr in shanka.categories) {
        var category = shanka.categories[categoryidstr];
        var dirty = false;
        var i = category.cardids.length;
        while (i--) {
            var cardid = category.cardids[i];
            var card = shanka.cards[cardid];
            if (card) {
                card.categoryids.push(parseInt(categoryidstr));
            } else {
                ReportError("readall: data integrity error: removing missing card " + cardid + " from category " + categoryidstr + " " + category.name);
                category.cardids.splice(i, 1);
                dirty = true;
                errorsDetected = true;
            }
        }
        if (dirty) {
            category.write();
        }
    }
    var uncategorised = shanka.categories[0];
    var dirty = false;
    // iterate over all cards, adding any that don't have categories
    // to uncategorised
    for (var cardidstr in shanka.cards) // warning - cardidstr is a string!
    {
        var card = shanka.cards[parseInt(cardidstr)];
        if (card.categoryids.length == 0) {
            ReportError("readall: data integrity error: setting card to uncategorised: " + cardidstr + " " + card.simplified + "[" + card.traditional + "]");
            card.categoryids.push(uncategorised.categoryid);
            uncategorised.cardids.push(parseInt(cardidstr));
            dirty = true;
            errorsDetected = true;
        }
    }
    if (dirty) {
        uncategorised.write();
    }
    shanka.rebuildqueue();
    shanka.rebuildhistory();
    shanka.progress.sort(function(a, b) {
        return shanka.progresscompare(a, b);
    });
    if (errorsDetected) {
        alert(STR.local_storage_errors_detected_resolved_error);
    }
};

shanka.initlocal = function() {
    if (window.applicationCache) {
        if (applicationCache.status === applicationCache.UPDATEREADY) {
            shanka.confirmandupdate();
        } else {
            applicationCache.addEventListener("updateready", shanka.confirmandupdate);
            if (applicationCache.status === applicationCache.UPDATEREADY) {
                shanka.confirmandupdate();
            }
        }
    }
    try {
        // fetch the version numbers if they haven't been got already
        if (shanka.getsetting("currentversionnum") == "0") {
            shanka.setsetting("currentversionnum", shanka.getOnlineAppVersion());
            shanka.setsetting("currentversiondate", shanka.getOnlineAppBuildDate());
        }
    } catch (err) {
        console.log("Must be offline, couldn't get online app version: " + err.message);
    }
};

shanka.setlocalversioninfo = function() {
    document.getElementById("currentversionnum").innerHTML = shanka.getsetting("currentversionnum");
    document.getElementById("currentversiondate").innerHTML = shanka.getsetting("currentversiondate");
};

shanka.redownload = function() {
    shanka.updateappcachestatus();
    window.location.reload();
    shanka.updateappcachestatus();
    try {
        shanka.setsetting("currentversionnum", "0");
        shanka.setsetting("currentversionnum", shanka.getOnlineAppVersion());
        shanka.setsetting("currentversiondate", shanka.getOnlineAppBuildDate());
    } catch (err) {
        console.log("shanka.redownload " + err.message);
    }
    setTimeout(shanka.updateappcachestatus, 1e3);
    setTimeout(shanka.updateappcachestatus, 2e3);
    setTimeout(shanka.updateappcachestatus, 3e3);
    setTimeout(shanka.updateappcachestatus, 4e3);
    setTimeout(shanka.updateappcachestatus, 5e3);
    setTimeout(shanka.updateappcachestatus, 6e3);
    setTimeout(shanka.updateappcachestatus, 7e3);
    setTimeout(shanka.updateappcachestatus, 8e3);
    setTimeout(shanka.updateappcachestatus, 9e3);
    setTimeout(shanka.updateappcachestatus, 1e4);
};

shanka.getappcachestatus = function() {
    var status = "";
    switch (applicationCache.status) {
      case applicationCache.UNCACHED:
        // UNCACHED == 0
        status = "UNCACHED";
        break;

      case applicationCache.IDLE:
        // IDLE == 1
        status = "IDLE";
        break;

      case applicationCache.CHECKING:
        // CHECKING == 2
        status = "CHECKING";
        break;

      case applicationCache.DOWNLOADING:
        // DOWNLOADING == 3
        status = "DOWNLOADING";
        break;

      case applicationCache.UPDATEREADY:
        // UPDATEREADY == 4
        status = "UPDATEREADY";
        break;

      case applicationCache.OBSOLETE:
        // OBSOLETE == 5
        status = "OBSOLETE";
        break;

      default:
        status = "UKNOWN CACHE STATUS";
        break;
    }
    return status;
};

shanka.confirmandupdate = function() {
    if (confirm(STR.app_new_version_download_confirm)) {
        window.location.reload();
        try {
            shanka.setsetting("currentversionnum", "0");
            shanka.setsetting("currentversionnum", shanka.getOnlineAppVersion());
            shanka.setsetting("currentversiondate", shanka.getOnlineAppBuildDate());
        } catch (err) {
            console.log("shanka.redownload " + err.message);
        }
    }
};

/*
    Shanka HSK Flashcards - study.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
shanka.initcardinfo = function(cardid) {
    document.getElementById("infostudycurrent").innerHTML = STR.study_study_text;
    document.getElementById("study_practice_short_text").innerHTML = STR.study_practice_short_text;
    document.getElementById("study_edit_text").innerHTML = STR.study_edit_text;
    document.getElementById("page_categories_title").innerHTML = STR.page_categories_title;
    document.getElementById("card_related_flashcards_label").innerHTML = STR.card_related_flashcards_label;
    document.getElementById("card_stroke_order_label").innerHTML = STR.card_stroke_order_label;
    document.getElementById("card_historical_oracle_label").innerHTML = STR.card_historical_oracle_label;
    document.getElementById("card_historical_bronze_label").innerHTML = STR.card_historical_bronze_label;
    document.getElementById("card_historical_greatseal_label").innerHTML = STR.card_historical_greatseal_label;
    document.getElementById("card_historical_smallseal_label").innerHTML = STR.card_historical_smallseal_label;
    document.getElementById("card_historical_bronze_label").innerHTML = STR.card_historical_bronze_label;
    var cardid = parseInt(shanka.state["cardid"]);
    var card = shanka.cards[cardid];
    var hanzi = card.simptradtogether();
    var innercontent = document.getElementById("pagecontent");
    innercontent.innerHTML = innercontent.innerHTML.replace(/#HANZI#/g, hanzi).replace(/#TRADITIONAL#/g, card.traditional).replace(/#PINYIN#/g, card.pinyin).replace(/#DEFINITION#/g, card.getdefinition()).replace(/#NOTES#/g, card.getnotes());
    shanka.initstudyinfocategories(card);
    shanka.initstudyinforelatedcards(card);
    shanka.initstudyinfostrokeorder(card);
    shanka.initstudyinfoetymology(card);
    if (!is_iOS()) {
        document.getElementById("infoplecotop").style.display = "none";
    }
    document.getElementById("study-back-button").disabled = shanka.studybackstack.length == 0;
    document.getElementById("study-fwd-button").disabled = shanka.studyfwdstack.length == 0;
    if ("cardid" in shanka.state && "questionid" in shanka.state) {
        document.getElementById("infostudycurrent").style.display = "inline";
    } else {
        document.getElementById("infostudycurrent").style.display = "none";
    }
};

shanka.initstudy = function() {
    shanka.studystarttime = new Date();
    var cardid = parseInt(shanka.state["cardid"]);
    var card = shanka.cards[cardid];
    var questionid = parseInt(shanka.state["questionid"]);
    var question = shanka.questions[questionid];
    if (!card) {
        alert(STR.study_invalid_card_id_error + cardid.toString());
        shanka.showmain();
        return;
    }
    if (!question) {
        alert(STR.study_invalid_question_id_error + questionid.toString());
        shanka.showmain();
        return;
    }
    if (contains(question.input, "draw")) {
        if (card.issentence()) {
            document.getElementById("sentencehanziouter").style.display = "block";
            document.getElementById("touchpaintouter").style.display = "none";
            shanka.initstudysentencehanzi(card);
        } else {
            document.getElementById("sentencehanziouter").style.display = "none";
            document.getElementById("touchpaintouter").style.display = "inline";
            shanka.inittouchpaint(5);
        }
    } else {
        document.getElementById("sentencehanziouter").style.display = "none";
        document.getElementById("touchpaintouter").style.display = "none";
    }
    // setup auto-advance, may be overridden during selectanswer
    if (shanka.getsetting("autoadvance") == "true") {
        document.getElementById("studysubmit").style.display = "none";
    } else {
        document.getElementById("studysubmit").style.display = "block";
        document.getElementById("studysubmit").classList.add("disabled");
    }
    shanka.updateStudyReveal();
    document.getElementById("questionstemtext").innerHTML = question.questiontext;
    var rating1enable = shanka.getsetting("rating1enable");
    var rating2enable = shanka.getsetting("rating2enable");
    var rating3enable = shanka.getsetting("rating3enable");
    var rating4enable = shanka.getsetting("rating4enable");
    var rating5enable = shanka.getsetting("rating5enable");
    for (var i = 0, len = studyfields.length; i < len; i++) {
        var f = studyfields[i];
        var answertable = document.getElementById("answertable" + f);
        var answertext = document.getElementById("answertext" + f);
        if (contains(question.answer, f)) {
            answertable.style.display = "inline";
            answertext.style.display = "block";
            answertext.innerHTML = card.getfield(f);
        } else {
            answertable.style.display = "none";
            answertext.style.display = "none";
            answertext.innerHTML = "";
        }
        var answerbtn1 = document.getElementById("answerbtn" + f + "1");
        var answerbtn2 = document.getElementById("answerbtn" + f + "2");
        var answerbtn3 = document.getElementById("answerbtn" + f + "3");
        var answerbtn4 = document.getElementById("answerbtn" + f + "4");
        var answerbtn5 = document.getElementById("answerbtn" + f + "5");
        answerbtn1.style.display = rating1enable == "false" ? "none" : "inline";
        answerbtn2.style.display = rating2enable == "false" ? "none" : "inline";
        answerbtn3.style.display = rating3enable == "false" ? "none" : "inline";
        answerbtn4.style.display = rating4enable == "false" ? "none" : "inline";
        answerbtn5.style.display = rating5enable == "false" ? "none" : "inline";
        answerbtn1.innerHTML = shanka.getsetting("rating1title");
        answerbtn2.innerHTML = shanka.getsetting("rating2title");
        answerbtn3.innerHTML = shanka.getsetting("rating3title");
        answerbtn4.innerHTML = shanka.getsetting("rating4title");
        answerbtn5.innerHTML = shanka.getsetting("rating5title");
        answerbtn1.classList.remove("answerbtnsel1");
        answerbtn2.classList.remove("answerbtnsel2");
        answerbtn3.classList.remove("answerbtnsel3");
        answerbtn4.classList.remove("answerbtnsel4");
        answerbtn5.classList.remove("answerbtnsel5");
        answerbtn1.classList.remove("answerbtntouch1");
        answerbtn2.classList.remove("answerbtntouch2");
        answerbtn3.classList.remove("answerbtntouch3");
        answerbtn4.classList.remove("answerbtntouch4");
        answerbtn5.classList.remove("answerbtntouch5");
        answerbtn1.classList.add("answerbtn1");
        answerbtn2.classList.add("answerbtn2");
        answerbtn3.classList.add("answerbtn3");
        answerbtn4.classList.add("answerbtn4");
        answerbtn5.classList.add("answerbtn5");
        var answertext = document.getElementById("answertext" + f);
        answertext.style.background = "#FFFFFF";
        var stemfield = document.getElementById(f + "stem");
        var displayfield = document.getElementById(f + "display");
        if (contains(question.stem, f)) {
            var stemdivtype = f == "pinyin" || f == "notes" || f == "definition" ? "block" : "inline";
            stemfield.style.display = stemdivtype;
            stemfield.innerHTML = card.getfield(f);
        } else {
            stemfield.style.display = "none";
            stemfield.innerHTML = "";
        }
        if (contains(question.display, f)) {
            displayfield.style.display = "inline";
            displayfield.innerHTML = card.getfield(f);
        } else {
            displayfield.style.display = "none";
            displayfield.innerHTML = "";
        }
        if (f in shanka.state) {
            shanka.selectanswer(f, parseInt(shanka.state[f]), false);
        }
    }
    document.getElementById("answers").ontouchstart = shanka.doontouchstart;
    document.getElementById("answers").ontouchmove = shanka.doontouchmove;
    document.getElementById("answers").ontouchcancel = shanka.doontouchend;
    document.getElementById("answers").ontouchend = shanka.doontouchend;
    document.getElementById("answers").onmousedown = shanka.doansweronmousedown;
    document.getElementById("answers").onmouseover = shanka.doansweronmouseover;
    document.getElementById("answers").onmouseup = shanka.doansweronmouseup;
    // innercontent.style.display="block";
    if (contains(question.input, "type")) {
        // set focus, only if answer not revealed
        document.getElementById("studytextinput").focus();
        document.getElementById("textanswer").style.display = "inline";
        document.getElementById("studytextinput").value = "";
    } else if (!("reveal" in shanka.state) || shanka.state["reveal"] != "true") {
        document.getElementById("textanswer").style.display = "none";
    }
    // disable display of these if trad == simp, and at least one of the
    // stem and answer is already showing that field.
    if (card.simplified == card.traditional) {
        if (contains(question.stem, "simplified") || contains(question.stem, "traditional") || contains(question.answer, "simplified") || contains(question.answer, "traditional")) {
            document.getElementById("simplifieddisplay").style.display = "none";
            document.getElementById("traditionaldisplay").style.display = "none";
        }
        if (contains(question.stem, "cursive") || contains(question.answer, "cursive")) {
            document.getElementById("cursivedisplay").style.display = "none";
        }
        if (contains(question.stem, "callig") || contains(question.answer, "callig")) {
            document.getElementById("calligdisplay").style.display = "none";
        }
    }
    if (!is_iOS()) {
        document.getElementById("studyplecotop").style.display = "none";
    }
    shanka.updatecharbutton();
    shanka.updateminitpmorebuttons();
    var backbutton = document.getElementById("study-back-button");
    var fwdbutton = document.getElementById("study-fwd-button");
    backbutton.style.display = "inline";
    backbutton.disabled = shanka.studybackstack.length == 0;
    fwdbutton.style.display = "inline";
    fwdbutton.disabled = shanka.studyfwdstack.length == 0;
    document.getElementById("studyinfo").style.display = "inline";
    document.getElementById("studycurrent").style.display = "none";
    document.getElementById("studypractice").style.display = "inline";
    document.getElementById("studyedit").style.display = "inline";
    document.getElementById("practicetext").style.display = "none";
    document.getElementById("practicesearch").style.display = "none";
    document.getElementById("studydisplay").style.display = "inline";
    document.getElementById("studytopbits").style.display = "inline";
    document.getElementById("searchresults").style.display = "none";
    // show the whole study div, if just switching to this page
    document.getElementById("study").style.display = "inline";
};

shanka.initpractice = function() {
    shanka.inittouchpaint(10);
    if ("cardid" in shanka.state && "questionid" in shanka.state) {
        document.getElementById("studycurrent").style.display = "inline";
    } else {
        document.getElementById("studycurrent").style.display = "none";
    }
    if ("cardid" in shanka.state) {
        document.getElementById("studyinfo").style.display = "inline";
        document.getElementById("studyedit").style.display = "inline";
        if (is_iOS()) {
            document.getElementById("studyplecotop").style.display = "inline";
        } else {
            document.getElementById("studyplecotop").style.display = "none";
        }
        document.getElementById("study-back-button").style.display = "inline";
        document.getElementById("study-back-button").disabled = shanka.studybackstack.length == 0;
        document.getElementById("study-fwd-button").style.display = "inline";
        document.getElementById("study-fwd-button").disabled = shanka.studyfwdstack.length == 0;
    } else {
        document.getElementById("study-back-button").style.display = "none";
        document.getElementById("study-fwd-button").style.display = "none";
        document.getElementById("studyinfo").style.display = "none";
        document.getElementById("studyedit").style.display = "none";
        document.getElementById("studyplecotop").style.display = "none";
    }
    document.getElementById("practicetext").value = shanka.calculatetraceword();
    document.getElementById("practicetext").style.display = "inline";
    document.getElementById("practicesearch").style.display = "inline";
    document.getElementById("touchpaintouter").style.display = "inline";
    document.getElementById("canvastoolbar").style.display = "block";
    document.getElementById("touchpaintlayers").style.display = "block";
    document.getElementById("tracechar").style.display = "inline";
    shanka.updatecharbutton();
    shanka.updateminitpmorebuttons();
    document.getElementById("studytopbits").style.display = "none";
    document.getElementById("answers").style.display = "none";
    document.getElementById("studydisplay").style.display = "none";
    document.getElementById("studypractice").style.display = "none";
    document.getElementById("studysubmit").style.display = "none";
    document.getElementById("searchresults").style.display = "none";
    document.getElementById("sentencehanziouter").style.display = "none";
    // show the study div
    document.getElementById("study").style.display = "inline";
};

shanka.initstudysentencehanzi = function(card) {
    var buttons = document.getElementById("sentencehanzibuttons");
    while (buttons.firstChild) {
        buttons.removeChild(buttons.firstChild);
    }
    var words = card.getsentencewords();
    while (words.length) {
        var i = Math.floor(Math.random() * words.length);
        var word = words[i];
        words.splice(i, 1);
        var button = document.createElement("button");
        button.innerHTML = word;
        button.classList.add("sentencebutton");
        button.onclick = shanka.sentencebuttonclicked;
        buttons.appendChild(button);
        var text = document.createTextNode(" ");
        buttons.appendChild(text);
    }
    document.getElementById("sentencehanziinput").value = "";
};

shanka.sentencebuttonclicked = function(e) {
    var button = e.target;
    var hanzi = button.innerHTML;
    var input = document.getElementById("sentencehanziinput");
    var text = input.value;
    var hanzi = button.innerHTML;
    if (button.classList.contains("sentenceselected")) {
        button.classList.remove("sentenceselected");
        text = text.replace(hanzi, "");
    } else {
        button.classList.add("sentenceselected");
        text += hanzi;
    }
    input.value = text;
};

shanka.initstudyinforelatedcards = function(card) {
    var relatedcards = document.getElementById("relatedcards");
    var lis = relatedcards.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (relatedcards.firstChild) {
        relatedcards.removeChild(relatedcards.firstChild);
    }
    var relatedcardids = shanka.getrelatedcardids(card.cardid);
    for (var i = 0, len = relatedcardids.length; i < len; i++) {
        var relatedcardid = relatedcardids[i];
        var relatedcard = shanka.cards[relatedcardid];
        var li = document.createElement("li");
        li.innerHTML = template.replace(/#DESCRIPTION#/g, relatedcard.liststring()).replace(/#ID#/g, relatedcard.cardid.toString());
        relatedcards.appendChild(li);
    }
    if (relatedcardids.length == 0) {
        document.getElementById("relatedflashcards").style.display = "none";
    }
};

shanka.initstudyinfocategories = function(card) {
    var categorylist = document.getElementById("categorylist");
    var lis = categorylist.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (categorylist.firstChild) {
        categorylist.removeChild(categorylist.firstChild);
    }
    for (var i = 0, len = card.categoryids.length; i < len; i++) {
        var categoryid = card.categoryids[i];
        var category = shanka.categories[categoryid];
        var li = document.createElement("li");
        li.innerHTML = template.replace(/#ID#/g, category.categoryid.toString()).replace(/#NAME#/g, category.name).replace(/#ITEMS#/g, category.cardids.length.toString());
        categorylist.appendChild(li);
    }
};

shanka.initstudyinfostrokeorder = function(card) {
    var outer = document.getElementById("sorder");
    var divinner = document.getElementById("sorderdiv");
    var template = divinner.innerHTML;
    while (outer.firstChild) {
        outer.removeChild(outer.firstChild);
    }
    var script = shanka.getsetting("script");
    var allchars = "";
    var charstouse = "";
    if (script == "simplified") {
        allchars = card.simplified;
    } else if (script == "traditional") {
        allchars = card.traditional;
    } else if (script == "simptrad") {
        allchars = card.simplified + card.traditional;
    } else {
        allchars = card.traditional + card.simplified;
    }
    for (var i = 0, len = allchars.length; i < len; i++) {
        var ch = allchars[i];
        if (!contains(charstouse, ch)) {
            charstouse += ch;
        }
    }
    for (var i = 0, len = charstouse.length; i < len; i++) {
        var ch = charstouse[i];
        var charencode = encodeURIComponent(ch);
        var div = document.createElement("div");
        div.innerHTML = template.replace(/#CHAR#/g, charencode);
        div.style.display = "none";
        div.classList.add("paddedbox");
        div.id = "sorder-" + charencode;
        outer.appendChild(div);
    }
};

shanka.initstudyinfoetymology = function(card) {
    var outer = document.getElementById("hform");
    var divinner = document.getElementById("hformdiv");
    var template = divinner.innerHTML;
    while (outer.firstChild) {
        outer.removeChild(outer.firstChild);
    }
    var allchars = allchars = card.simplified + card.traditional;
    var charstouse = "";
    for (var i = 0, len = allchars.length; i < len; i++) {
        var ch = allchars[i];
        if (!contains(charstouse, ch)) {
            charstouse += ch;
        }
    }
    for (var i = 0, len = charstouse.length; i < len; i++) {
        var ch = charstouse[i];
        var charencode = encodeURIComponent(ch);
        var div = document.createElement("div");
        div.innerHTML = template.replace(/#CHAR#/g, charencode);
        div.style.display = "none";
        div.classList.add("paddedbox");
        div.id = "hform-" + charencode;
        div.width = "80";
        div.height = "90";
        outer.appendChild(div);
    }
};

shanka.reveal = function() {
    if (document.getElementById("answers").style.display == "none") {
        shanka.state["reveal"] = "true";
        shanka.updateHistoryUrlState(shanka.state, "replace");
    } else {
        shanka.state["reveal"] = "false";
        shanka.updateHistoryUrlState(shanka.state, "replace");
    }
    shanka.updateStudyReveal();
};

var studyfields = [ "simplified", "cursive", "callig", "traditional", "pinyin", "definition", "notes" ];

var inputfields = [ "draw", "type" ];

shanka.studycorrectanswerheight = function() {
    for (var i = 0, len = studyfields.length; i < len; i++) {
        var f = studyfields[i];
        var answertable = document.getElementById("answertable" + f);
        var answertext = document.getElementById("answertext" + f);
        answertable.style.height = answertext.offsetHeight.toString() + "px";
    }
};

shanka.updateStudyReveal = function() {
    if ("reveal" in shanka.state && shanka.state["reveal"] == "true") {
        document.getElementById("answers").style.display = "block";
        document.getElementById("canvastoolbar").style.display = "none";
        document.getElementById("touchpaintlayers").style.display = "none";
        document.getElementById("studyreveal").innerHTML = "Hide Answer";
        document.getElementById("tracechar").style.display = "none";
        shanka.studycorrectanswerheight();
    } else {
        document.getElementById("answers").style.display = "none";
        document.getElementById("canvastoolbar").style.display = "block";
        document.getElementById("touchpaintlayers").style.display = "block";
        document.getElementById("studyreveal").innerHTML = "Show Answer";
        document.getElementById("tracechar").style.display = "inline";
    }
};

shanka.canvasright = function() {
    for (var i = 0, len = shanka.minitpdisplayed; i < len; i++) {
        if (shanka.minitps[i] == window.tp.activeChild) {
            if (i + 1 < shanka.minitpdisplayed) {
                window.tp.setActive(shanka.minitps[i + 1]);
            } else /* if (shanka.state["section"] == "practice")  */ {
                window.tp.deselectActiveChild();
                window.tp.activeChild = null;
                window.tp.clear();
                shanka.addminitouchpaint();
                window.tp.setActive(shanka.minitps[shanka.minitpdisplayed - 1]);
            }
            /* else {
                window.tp.pushleftstack();
                for (var j=0, jlen=shanka.minitpdisplayed - 1; j<jlen; j++) {
                    window.tp.copychildtochild(shanka.minitps[j+1], shanka.minitps[j]);
                }
                window.tp.clear();
                window.tp.poprightstack(shanka.minitps[shanka.minitpdisplayed-1]);
                window.tp.copyFromChild();    
                shanka.leftminitpindex += 1;
                shanka.updateminitpmorebuttons();
            } */
            break;
        }
    }
};

shanka.canvasleft = function() {
    for (var i = 0, len = shanka.minitpdisplayed; i < len; i++) {
        if (shanka.minitps[i] == window.tp.activeChild) {
            if (i > 0) {
                window.tp.setActive(shanka.minitps[i - 1]);
            }
            /* else if (shanka.leftminitpindex > 0) {
                window.tp.pushrightstack();
                for (var j=shanka.minitpdisplayed-1; j>=1; j--) {
                    window.tp.copychildtochild(shanka.minitps[j-1], shanka.minitps[j]);   
                }
                window.tp.clear();
                window.tp.popleftstack(shanka.minitps[0]);                
                window.tp.copyFromChild();    
                shanka.leftminitpindex -= 1;
                shanka.updateminitpmorebuttons();
            } */
            break;
        }
    }
};

shanka.oncolourselected = function() {
    var brushcolour = document.getElementById("tpbrushcolour");
    brushcolour.style.display = "none";
    shanka.setsetting("brushcolour", brushcolour.value);
    shanka.writesettings();
    window.tp.brushcolour = "#" + shanka.getsetting("brushcolour");
    shanka.updatebrushcolour();
    var brushcolour = document.getElementById("tpbrushcolour");
};

shanka.updatebrushcolour = function() {
    var brushcolour = document.getElementById("tpbrushcolour");
    var canvaspenblack = document.getElementById("canvaspenblack");
    var tracechar = document.getElementById("tracechar");
    canvaspenblack.style.backgroundColor = brushcolour.style.color;
    canvaspenblack.style.color = brushcolour.style.backgroundColor;
    var colour = brushcolour.style.backgroundColor;
    colour = colour.replace(")", ",0.2)");
    colour = colour.replace("rgb", "rgba");
    tracechar.style.color = colour;
};

shanka.canvaspenblack = function() {
    var brushcolour = document.getElementById("tpbrushcolour");
    brushcolour.style.display = "block";
    brushcolour.focus();
};

shanka.gettraceword = function() {
    if (shanka.state["section"] == "study") {
        return shanka.calculatetraceword();
    }
    return document.getElementById("practicetext").value;
};

shanka.calculatetraceword = function() {
    if ("cardid" in shanka.state) {
        var cardid = parseInt(shanka.state["cardid"]);
        var card = shanka.cards[cardid];
        var text = "";
        var script = shanka.getsetting("script");
        if (script == "simptrad" && card.simplified.length && card.traditional.length) {
            text = card.simplified + " " + card.traditional;
        } else if (script == "tradsimp" && card.simplified.length && card.traditional.length) {
            text = card.traditional + " " + card.simplified;
        } else if (script == "simplified" && card.simplified.length) {
            text = card.simplified;
        } else if (script == "traditional" && card.traditional.length) {
            text = card.traditional;
        } else if (card.simplified.length) {
            text = card.simplified;
        } else {
            text = card.traditional;
        }
        return text;
    }
    return "字";
};

shanka.showcharbutton = function() {
    var index = 0;
    if ("char" in shanka.state) {
        index = parseInt(shanka.state["char"]);
        index++;
    }
    var text = shanka.gettraceword();
    if (index >= text.length) {
        delete shanka.state["char"];
    } else {
        shanka.state["char"] = index;
    }
    shanka.updateHistoryUrlState(shanka.state, "replace");
    shanka.updatecharbutton();
};

shanka.updatecharbutton = function() {
    if ("char" in shanka.state) {
        var index = parseInt(shanka.state["char"]);
        var text = shanka.gettraceword();
        var tracechar = text.charAt(index);
        document.getElementById("tracechar").innerHTML = tracechar;
        if (tracechar.length && tracechar != " ") {
            document.getElementById("canvasshowchar").classList.add("clickedsmallb");
        } else {
            document.getElementById("canvasshowchar").classList.remove("clickedsmallb");
        }
    } else {
        document.getElementById("tracechar").innerHTML = "";
        document.getElementById("canvasshowchar").classList.remove("clickedsmallb");
    }
};

shanka.updateminitpmorebuttons = function() {
    if (window.tp && window.tp.leftstack && window.tp.leftstack.length) {
        document.getElementById("leftmoremini").style.display = "inline";
    } else {
        document.getElementById("leftmoremini").style.display = "none";
    }
    if (window.tp && window.tp.rightstack && window.tp.rightstack.length) {
        document.getElementById("rightmoremini").style.display = "inline";
    } else {
        document.getElementById("rightmoremini").style.display = "none";
    }
};

shanka.canvaspenwhite = function() {
    window.tp.penwhite();
};

shanka.canvasundo = function() {
    window.tp.undo();
    shanka.canvasupdateundoredo();
};

shanka.canvasredo = function() {
    window.tp.redo();
    shanka.canvasupdateundoredo();
};

shanka.canvasclear = function() {
    window.tp.clear();
};

shanka.canvasupdateundoredo = function() {
    if (window.tp.canundo()) {
        document.getElementById("canvasundo").style.color = "#000";
        document.getElementById("canvasundo").style.pointerEvents = "";
    } else {
        document.getElementById("canvasundo").style.color = "#888";
        document.getElementById("canvasundo").style.pointerEvents = "none";
    }
    if (window.tp.canredo()) {
        document.getElementById("canvasredo").style.color = "#000";
        document.getElementById("canvasredo").style.pointerEvents = "";
    } else {
        document.getElementById("canvasredo").style.color = "#888";
        document.getElementById("canvasredo").style.pointerEvents = "none";
    }
};

shanka.inittouchpaint = function(minicount) {
    if (!window.tp) {
        window.tp = new HanziCanvas("touchpaint");
    }
    window.tp.brushcolour = "#" + shanka.getsetting("brushcolour");
    window.tp.backgcolour = "#" + shanka.getsetting("backgcolour");
    window.tp.gridcolour = "#" + shanka.getsetting("gridcolour");
    window.tp.bordercolour = "#" + shanka.getsetting("bordercolour");
    window.tp.brushwidth = parseInt(shanka.getsetting("brushwidth"));
    window.tp.init({
        width: "280",
        height: "280"
    });
    var brushcolour = document.getElementById("tpbrushcolour");
    brushcolour.value = shanka.getsetting("brushcolour");
    if (!window.colourpicker) {
        window.colourpicker = new jscolor.color(brushcolour, {
            pickerMode: "HVS",
            pickerClosable: true
        });
        window.colourpicker.onclosedcallback = shanka.oncolourselected;
        window.colourpicker.pickerPosition = "top";
    }
    shanka.updatebrushcolour();
    shanka.leftminitpindex = 0;
    shanka.minitpdisplayed = 0;
    for (var i = 0; i < minicount; i++) {
        shanka.addminitouchpaint();
    }
    shanka.hideremainingminitps(minicount);
    // window.tp.canvas.style.width  = '280px';
    // window.tp.canvas.style.height  = '280px';
    window.tp.setActive(shanka.minitps[0]);
    window.tp.copyFromParent();
    window.tp.clearundohistory();
    window.tp.clearredohistory();
    shanka.canvasupdateundoredo();
};

shanka.addminitouchpaint = function() {
    if (shanka.minitpdisplayed == shanka.minitps.length) {
        var newtc = document.createElement("canvas");
        newtc.ctx = newtc.getContext("2d");
        newtc.id = "touchpaintmini" + shanka.minitps.length.toString();
        newtc.width = 55;
        newtc.height = 55;
        newtc.className = "touchpaintmini";
        var minitouchpaints = document.getElementById("minitouchpaints");
        minitouchpaints.appendChild(newtc);
        var newtp = new HanziCanvas("touchpaintmini" + shanka.minitps.length.toString());
        newtp.init({
            enabled: false
        });
        newtp.setParent(window.tp);
        newtp.copyFromParent();
        shanka.minitps.push(newtp);
    } else {
        var id = "touchpaintmini" + shanka.minitpdisplayed.toString();
        var reusetpel = document.getElementById(id);
        var reusetp = shanka.minitps[shanka.minitpdisplayed];
        reusetp.clear();
        reusetpel.style.display = "inline";
    }
    shanka.minitpdisplayed += 1;
};

shanka.hideremainingminitps = function(minicount) {
    for (var i = minicount; i < shanka.minitps.length; i++) {
        var id = "touchpaintmini" + i.toString();
        var reusetpel = document.getElementById(id);
        reusetpel.style.display = "none";
    }
};

shanka.doontouchstart = function(event) {
    // var touch = event.touches.item(0);
    var target = event.touches[0].target;
    shanka.doanswerstart(target, true);
    event.preventDefault();
};

shanka.doontouchmove = function(event) {
    // var touch = event.touches.item(0);
    var target = document.elementFromPoint(touch.screenX, touch.screenY);
    shanka.doanswermove(target, true);
    event.preventDefault();
};

shanka.doontouchend = function(event) {
    shanka.doanswerend();
    event.preventDefault();
};

shanka.doansweronmousedown = function(event) {
    shanka.doanswerstart(event.target, false);
    event.preventDefault();
};

shanka.doansweronmouseover = function(event) {
    shanka.doanswermove(event.target, false);
};

shanka.doansweronmouseup = function() {
    shanka.doanswerend();
};

shanka.answertouchstarted = false;

shanka.answermovelastover = null;

shanka.doanswerstart = function(target, touch) {
    if (target && target.className.slice(0, "answerbtn".length) == "answerbtn") {
        shanka.answertouchstarted = true;
        shanka.doanswermove(target, touch);
    }
};

shanka.doanswermove = function(target, touch) {
    touch;
    if (target && shanka.answertouchstarted && shanka.answermovelastover != target && target.className.slice(0, "answerbtn".length) == "answerbtn") {
        var touchmovegroup = target.id.slice(0, -1);
        var field = touchmovegroup.slice("answerbtn".length);
        var index = parseInt(target.id.slice(-1));
        shanka.answermovelastover = target;
        shanka.state[field] = index;
        shanka.updateHistoryUrlState(shanka.state, "replace");
        shanka.selectanswer(field, index);
    }
};

shanka.selectanswer = function(field, index, touch) {
    var element1 = document.getElementById("answerbtn" + field + "1");
    var element2 = document.getElementById("answerbtn" + field + "2");
    var element3 = document.getElementById("answerbtn" + field + "3");
    var element4 = document.getElementById("answerbtn" + field + "4");
    var element5 = document.getElementById("answerbtn" + field + "5");
    var target = document.getElementById("answerbtn" + field + index.toString());
    element1.classList.remove("answerbtnsel1");
    element2.classList.remove("answerbtnsel2");
    element3.classList.remove("answerbtnsel3");
    element4.classList.remove("answerbtnsel4");
    element5.classList.remove("answerbtnsel5");
    var classstart = touch ? "answerbtntouch" : "answerbtn";
    if (element1 != target && element1.className != classstart + "1") element1.classList.add(classstart + "1");
    if (element2 != target && element1.className != classstart + "2") element2.classList.add(classstart + "2");
    if (element3 != target && element1.className != classstart + "3") element3.classList.add(classstart + "3");
    if (element4 != target && element1.className != classstart + "4") element4.classList.add(classstart + "4");
    if (element5 != target && element1.className != classstart + "5") element5.classList.add(classstart + "5");
    target.classList.remove("answerbtntouch" + index);
    target.classList.remove("answerbtn" + index);
    target.classList.add("answerbtnsel" + index);
    var answertext = document.getElementById("answertext" + field);
    if (index == 1) {
        answertext.style.background = "#f3abab";
    } else if (index == 2) {
        answertext.style.background = "#f5c595";
    } else if (index == 3) {
        answertext.style.background = "#ece599";
    } else if (index == 4) {
        answertext.style.background = "#bbe3b6";
    } else {
        answertext.style.background = "#a5d2eb";
    }
    if (shanka.allanswerschosen()) {
        document.getElementById("studysubmit").style.display = "block";
        document.getElementById("studysubmit").classList.remove("disabled");
    }
};

shanka.doanswerend = function() {
    WaitCursorOn();
    try {
        shanka.answertouchstarted = false;
        shanka.answermovelastover = null;
        if (shanka.getsetting("autoadvance") == "true" && shanka.allanswerschosen()) {
            shanka.studysubmit();
        }
    } catch (err) {
        ExceptionError("shanka.init", err);
    }
    WaitCursorOff();
};

shanka.allanswerschosen = function() {
    // var cardid = parseInt(shanka.state["cardid"]);
    // var card = shanka.cards[cardid];
    var questionid = parseInt(shanka.state["questionid"]);
    var question = shanka.questions[questionid];
    var allanswers = true;
    for (var i = 0, len = question.answer.length; i < len; i++) {
        var f = question.answer[i];
        if (!(f in shanka.state)) {
            allanswers = false;
            break;
        }
    }
    return allanswers;
};

shanka.studysubmit = function() {
    WaitCursorOn();
    try {
        var cardid = parseInt(shanka.state["cardid"]);
        var card = shanka.cards[cardid];
        var questionid = parseInt(shanka.state["questionid"]);
        var question = shanka.questions[questionid];
        var known_kn_rate = shanka.algorithm.getdata("known_kn_rate");
        var kn_before = card.kn_rate;
        shanka.algorithm.setcardscore(card, question, shanka.state);
        var now = new Date();
        var timeStudied = 0;
        if (shanka.studystarttime) {
            timeStudied = now.getTime() - shanka.studystarttime.getTime();
            timeStudied = Math.min(timeStudied, 60 * 1e3);
        }
        var known_increment = 0;
        if (card.kn_rate > known_kn_rate && kn_before <= known_kn_rate) {
            known_increment = 1;
        } else if (card.kn_rate <= known_kn_rate && kn_before > known_kn_rate) {
            known_increment = -1;
        }
        shanka.updateCurrentProgress(timeStudied, known_increment);
        shanka.showstudy();
    } catch (err) {
        ExceptionError("shanka.init", err);
    }
    WaitCursorOff();
};

shanka.studyinfo = function() {
    if ("cardid" in shanka.state) {
        var state = JSON.parse(JSON.stringify(shanka.state));
        state["section"] = "info";
        shanka.navigate(state);
    }
};

shanka.showcardinfo = function(cardid) {
    shanka.navigate({
        section: "info",
        cardid: cardid.toString()
    });
};

shanka.showstudy = function() {
    WaitCursorOn();
    try {
        var cardquestion = shanka.algorithm.getnextcardquestion();
        var card = cardquestion[0];
        var question = cardquestion[1];
        if (card && question) {
            shanka.navigate({
                section: "study",
                cardid: card.cardid.toString(),
                questionid: question.questionid.toString()
            });
        } else {
            alert(STR.study_no_cards_questions_use_wizard_error);
            if (!card && !question) {
                shanka.showmain();
            } else if (!card) {
                shanka.showimport();
            } else {
                shanka.wizard();
            }
        }
    } catch (err) {
        ExceptionError("showstudy", err);
    }
    WaitCursorOff();
};

shanka.studycurrent = function() {
    WaitCursorOn();
    try {
        if ("cardid" in shanka.state && "questionid" in shanka.state) {
            var state = JSON.parse(JSON.stringify(shanka.state));
            state["section"] = "study";
            shanka.navigate(state);
        }
    } catch (err) {
        ExceptionError("studycurrent", err);
    }
    WaitCursorOff();
};

shanka.studypractice = function() {
    if ("cardid" in shanka.state) {
        var state = JSON.parse(JSON.stringify(shanka.state));
        state["section"] = "practice";
        shanka.navigate(state);
    }
};

shanka.freepractice = function() {
    shanka.navigate({
        section: "practice"
    });
};

shanka.studyedit = function() {
    if ("cardid" in shanka.state) {
        var cardid = parseInt(shanka.state["cardid"]);
        shanka.navigate({
            section: "card",
            cardid: cardid.toString()
        });
    }
};

shanka.studypleco = function() {
    var cardid = parseInt(shanka.state["cardid"]);
    var card = shanka.cards[cardid];
    var hanzi = card.simplified;
    if (!hanzi.length) {
        hanzi = card.traditional;
    }
    // don't use x-success as can't call us back in a standalone app
    var url = "plecoapi://x-callback-url/s?q=" + encodeURIComponent(hanzi);
    // + "&x-source=Shanka%20Flaschards&x-success="
    // + encodeURIComponent(document.URL);
    window.location.href = url;
};

shanka.studyback = function() {
    if (shanka.studybackstack.length) {
        shanka.studyfwdstack.push(shanka.state);
        var state = shanka.studybackstack.pop();
        state["fwdback"] = "true";
        shanka.navigate(state);
    }
};

shanka.studyforward = function() {
    if (shanka.studyfwdstack.length) {
        shanka.studybackstack.push(shanka.state);
        var state = shanka.studyfwdstack.pop();
        state["fwdback"] = "true";
        shanka.navigate(state);
    }
};

shanka.practicesearch = function() {
    var searchresults = document.getElementById("searchresults");
    var practicetext = document.getElementById("practicetext");
    var results = shanka.searchcards(practicetext.value);
    // hide touchpaint
    document.getElementById("touchpaintouter").style.display = "none";
    // empty results lists
    var resultslist = document.getElementById("searchresultslist");
    while (resultslist.firstChild) {
        resultslist.removeChild(resultslist.firstChild);
    }
    searchresults.style.display = "block";
    if (results.length == 0) {
        var li = document.createElement("li");
        li.innerHTML = STR.study_search_no_results;
        resultslist.appendChild(li);
    } else if (results.length == 1) {
        var card = results[0];
        shanka.showcardinfo(card.cardid);
    } else {
        for (var i = 0, len = results.length; i < len; i++) {
            var card = results[i];
            var a = document.createElement("a");
            a.href = "javascript:shanka.showcardinfo(" + card.cardid.toString() + ");";
            var text = document.createTextNode(card.liststring());
            a.appendChild(text);
            var chevron = document.createElement("span");
            chevron.classList.add("chevron");
            a.appendChild(chevron);
            var li = document.createElement("li");
            li.appendChild(a);
            resultslist.appendChild(li);
        }
    }
};

shanka.searchcards = function(text) {
    text = text.toLowerCase();
    var results = [];
    for (var cardidstr in shanka.cards) {
        var card = shanka.cards[cardidstr];
        if (card.simplified.toLowerCase().search(text) != -1 || card.traditional.toLowerCase().search(text) != -1 || card.pinyin.toLowerCase().search(text) != -1) {
            results.push(card);
        }
    }
    if (results.length == 0) {
        for (var cardidstr in shanka.cards) {
            var card = shanka.cards[cardidstr];
            if (card.getdefinition().toLowerCase().search(text) != -1 || card.getnotes().toLowerCase().search(text) != -1) {
                results.push(card);
            }
        }
    }
    return results;
};

/*
    Shanka HSK Flashcards - import.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
shanka.import = function(data, format, categoryname, ishttp, callbackafterimport) {
    WaitCursorOn();
    try {
        var newcatid = 0;
        if (categoryname) {
            newcatid = shanka.findorcreatecategory(categoryname);
        }
        if (ishttp || data.slice(0, 4) == "http") {
            shanka.addtoresult(STR.import_downloading_file_message);
            var xhr = new XMLHttpRequest();
            xhr.open("GET", data, true);
            xhr.responseType = "text";
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    shanka.continueimport(xhr.response, format, newcatid, callbackafterimport);
                }
            };
            xhr.onerror = function(e) {
                e;
                ReportError(STR.import_generic_error + ": " + xhr.statusText);
            };
            xhr.ontimeout = function() {
                ReportError(STR.import_timed_out_error);
            };
            xhr.onabort = function() {
                ReportError(STR.import_aborted_error);
            };
            xhr.send(null);
        } else {
            shanka.continueimport(data, format, newcatid, callbackafterimport);
        }
    } catch (err) {
        ExceptionError("import", err);
    }
};

shanka.continueimport = function(response, format, categoryid, callbackafterimport) {
    try {
        shanka.addtoresult(STR.import_parsing_data_message);
        var countcreated = 0;
        var countmerged = 0;
        var defaultcategory = null;
        if (categoryid >= 0 && categoryid in shanka.categories) {
            defaultcategory = shanka.categories[categoryid];
        }
        // TODO: check for duplicate cards when adding
        if (format == "shanka") {
            var importobj = JSON.parse(response);
            for (var key in importobj) {
                // TODO
                switch (key) {
                  case "categories":
                    break;

                  case "cards":
                    break;

                  case "settings":
                    break;

                  case "lessons":
                    break;

                  case "questions":
                    break;

                  case "algorithms":
                    break;

                  case "progress":
                    break;

                  default:
                    ReportError("continueimport: unknown object key: " + key);
                    break;
                }
            }
        } else if (format == "sticky") {
            var lines = response.split("\n");
            for (var i = 0, len = lines.length; i < len; i++) {
                var line = lines[i].replace(/\r/g, "");
                var splitted = line.split("	");
                if (splitted && splitted.length == 5) {
                    var card = new Card();
                    card.simplified = splitted[0];
                    card.traditional = splitted[1];
                    card.pinyin = splitted[3];
                    card.setdefinition(splitted[4].replace(/\s*\|\s*/g, "\n"));
                    // unfold ugly newline replacement I introduced making these lists
                    if (card.simplified.length || card.traditional.length) {
                        var cardfound = shanka.mergeimportedcardwithexisting(card);
                        if (cardfound) {
                            card = cardfound;
                            countmerged++;
                        } else {
                            card.cardid = shanka.getnextguid();
                            shanka.cards[card.cardid] = card;
                            shanka.addtocharmap(card.simplified, card.cardid);
                            shanka.addtocharmap(card.traditional, card.cardid);
                            countcreated++;
                        }
                        if (!contains(card.categoryids, categoryid)) {
                            card.categoryids.push(categoryid);
                            // add the reverse link
                            defaultcategory.cardids.push(card.cardid);
                        }
                        card.write();
                    }
                }
            }
        } else if (format == "plecotext") {
            var lines = response.split("\n");
            for (var i = 0, len = lines.length; i < len; i++) {
                var line = lines[i].replace(/\r/g, "");
                if (line.charAt(0) == "/") {
                    var catname = line;
                    while (catname.charAt(0) == "/") {
                        catname = catname.slice(1);
                    }
                    catname = catname.replace("/", " ");
                    categoryid = shanka.findorcreatecategory(catname);
                    defaultcategory.write();
                    defaultcategory = shanka.categories[categoryid];
                } else {
                    var splitted = line.split("	");
                    if (splitted && splitted.length >= 1) {
                        var card = new Card();
                        if (contains(splitted[0], "[")) {
                            var split = splitted[0].split("[");
                            card.simplified = split[0];
                            card.traditional = split[1].replace("]", "");
                        } else {
                            card.simplified = splitted[0];
                            card.traditional = splitted[0];
                        }
                        if (splitted.length >= 2) {
                            card.pinyin = splitted[1];
                        }
                        if (splitted.length >= 3) {
                            card.setdefinition(splitted[2]);
                        }
                        if (card.simplified.length || card.traditional.length) {
                            var cardfound = shanka.mergeimportedcardwithexisting(card);
                            if (cardfound) {
                                card = cardfound;
                                countmerged++;
                            } else {
                                card.cardid = shanka.getnextguid();
                                shanka.cards[card.cardid] = card;
                                shanka.addtocharmap(card.simplified, card.cardid);
                                shanka.addtocharmap(card.traditional, card.cardid);
                                countcreated++;
                            }
                            if (!contains(card.categoryids, categoryid)) {
                                card.categoryids.push(categoryid);
                                // add the reverse link
                                defaultcategory.cardids.push(card.cardid);
                            }
                            card.write();
                        }
                    }
                }
            }
        } else if (format == "plecoxml") {} else if (format == "skrittersimp") {} else if (format == "skrittertrad") {}
        defaultcategory.write();
        callbackafterimport(defaultcategory, countcreated, countmerged);
    } catch (err) {
        ExceptionError("continueimport", err);
    }
    WaitCursorOff();
};

shanka.initimport = function() {
    var categorylist = document.getElementById("categorylist");
    for (var categoryidstr in shanka.categories) {
        var category = shanka.categories[categoryidstr];
        var option = document.createElement("option");
        option.text = category.name + " (" + category.cardids.length.toString() + ")";
        option.value = category.name;
        categorylist.add(option, null);
    }
    document.getElementById("import_section_quick").innerHTML = STR.import_section_quick;
    document.getElementById("import_section_shanka").innerHTML = STR.import_section_shanka;
    document.getElementById("import_section_other").innerHTML = STR.import_section_other;
    document.getElementById("import_hsk1_label").innerHTML = STR.import_hsk1_label;
    document.getElementById("import_hsk2_label").innerHTML = STR.import_hsk2_label;
    document.getElementById("import_hsk3_label").innerHTML = STR.import_hsk3_label;
    document.getElementById("import_hsk4_label").innerHTML = STR.import_hsk4_label;
    document.getElementById("import_hsk5_label").innerHTML = STR.import_hsk5_label;
    document.getElementById("import_hsk6_label").innerHTML = STR.import_hsk6_label;
    document.getElementById("import_hsk1_sentences_label").innerHTML = STR.import_hsk1_sentences_label;
    document.getElementById("import_hsk2_sentences_label").innerHTML = STR.import_hsk2_sentences_label;
    document.getElementById("import_hsk3_sentences_label").innerHTML = STR.import_hsk3_sentences_label;
    document.getElementById("import_chineasy_label").innerHTML = STR.import_chineasy_label;
    document.getElementById("import_flashcards_label").innerHTML = STR.import_flashcards_label;
    document.getElementById("import_lessons_label").innerHTML = STR.import_lessons_label;
    document.getElementById("import_algorithms_label").innerHTML = STR.import_algorithms_label;
    document.getElementById("import_settings_label").innerHTML = STR.import_settings_label;
    document.getElementById("import_progress_label").innerHTML = STR.import_progress_label;
    document.getElementById("import_paste_text_label").innerHTML = STR.import_paste_text_label;
    document.getElementById("import_pleco_text_file_label").innerHTML = STR.import_pleco_text_file_label;
    document.getElementById("import_pleco_xml_file_label").innerHTML = STR.import_pleco_xml_file_label;
    document.getElementById("import_stickystudy_label").innerHTML = STR.import_stickystudy_label;
    document.getElementById("import_skritter_simp_label").innerHTML = STR.import_skritter_simp_label;
    document.getElementById("import_skritter_trad_label").innerHTML = STR.import_skritter_trad_label;
    document.getElementById("import_default_category_label").innerHTML = STR.import_default_category_label;
    document.getElementById("import_paste_text_label2").innerHTML = STR.import_paste_text_label;
    document.getElementById("import_button_title").innerHTML = STR.page_import_title;
};

shanka.doimport = function() {
    var data = "";
    var format = "";
    var categoryname = "";
    if (document.getElementById("import-shanka-button").classList.contains("active")) {
        data = document.getElementById("importdatashanka").value;
        format = "shanka";
        categoryname = null;
    } else {
        if (document.getElementById("importplecoxml").classList.contains("active")) {
            format = "plecoxml";
        } else if (document.getElementById("importplecotext").classList.contains("active")) {
            format = "plecotext";
        } else if (document.getElementById("importsticky").classList.contains("active")) {
            format = "sticky";
        } else if (document.getElementById("importsimp").classList.contains("active")) {
            format = "skrittersimp";
        } else {
            format = "skrittertrad";
        }
        data = document.getElementById("importdataother").value;
        var categorylist = document.getElementById("categorylist");
        categoryname = categorylist.options[categorylist.selectedIndex].value;
    }
    shanka.import(data, format, categoryname, false, function(category, created, merged) {
        category;
        shanka.showmain();
        shanka.addtoresult(STR.wizard_created_flashcards_format.replace("{0}", created.toString()));
        if (merged) {
            shanka.addtoresult(STR.wizard_merged_flashcards_format.replace("{0}", merged.toString()));
        }
    });
};

shanka.findorcreatecategory = function(categoryname) {
    var newcatid = null;
    for (var categoryidstr in shanka.categories) {
        var category = shanka.categories[categoryidstr];
        if (categoryname == category.name) {
            newcatid = category.categoryid;
            break;
        }
    }
    if (newcatid == null) {
        var newcategory = new Category();
        newcategory.name = categoryname;
        newcategory.categoryid = shanka.getnextguid();
        newcategory.write();
        shanka.categories[newcategory.categoryid] = newcategory;
        newcategory.write();
        shanka.setsetting("lastcategoryid", newcategory.categoryid);
        newcatid = newcategory.categoryid;
    }
    return newcatid;
};

shanka.importHSK1Wrapper = function() {
    shanka.importHSK1(shanka.importdefaultcallback);
};

shanka.importHSK2Wrapper = function() {
    shanka.importHSK2(shanka.importdefaultcallback);
};

shanka.importHSK3Wrapper = function() {
    shanka.importHSK3(shanka.importdefaultcallback);
};

shanka.importHSK4Wrapper = function() {
    shanka.importHSK4(shanka.importdefaultcallback);
};

shanka.importHSK5Wrapper = function() {
    shanka.importHSK5(shanka.importdefaultcallback);
};

shanka.importHSK6Wrapper = function() {
    shanka.importHSK6(shanka.importdefaultcallback);
};

shanka.importHSK1SentencesWrapper = function() {
    shanka.importHSK1Sentences(shanka.importdefaultcallback);
};

shanka.importHSK2SentencesWrapper = function() {
    shanka.importHSK2Sentences(shanka.importdefaultcallback);
};

shanka.importHSK3SentencesWrapper = function() {
    shanka.importHSK3Sentences(shanka.importdefaultcallback);
};

shanka.importChineasyWrapper = function() {
    shanka.importChineasy(shanka.importdefaultcallback);
};

shanka.importdefaultcallback = function(category, created, merged) {
    shanka.showcategory(category.categoryid);
    shanka.addtoresult(STR.wizard_created_flashcards_format.replace("{0}", created.toString()));
    if (merged) {
        shanka.addtoresult(STR.wizard_merged_flashcards_format.replace("{0}", merged.toString()));
    }
};

/*
    Shanka HSK Flashcards - export.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
shanka.initexported = function() {
    document.getElementById("export_download_filetext").innerHTML = STR.export_download_filetext;
};

shanka.initexport = function() {
    var categorylist = document.getElementById("exportcategorylist");
    var lis = categorylist.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (categorylist.firstChild) {
        categorylist.removeChild(categorylist.firstChild);
    }
    for (var categoryidstr in shanka.categories) {
        var category = shanka.categories[categoryidstr];
        var li = document.createElement("li");
        li.innerHTML = template.replace(/#ID#/g, categoryidstr).replace(/#NAME#/g, category.name).replace(/#ITEMS#/g, category.cardids.length.toString());
        li.onclick = function(e) {
            shanka.togglechild(e.target);
            e.preventDefault();
        };
        categorylist.appendChild(li);
    }
    document.getElementById("export_categories_label").innerHTML = STR.export_categories_label;
    document.getElementById("export_export_format_label").innerHTML = STR.export_export_format_label;
    document.getElementById("export_section_shanka").innerHTML = STR.import_section_shanka;
    document.getElementById("export_other_label").innerHTML = STR.export_other_label;
    document.getElementById("export_lessons_label").innerHTML = STR.import_lessons_label;
    document.getElementById("export_algorithms_label").innerHTML = STR.import_algorithms_label;
    document.getElementById("export_settings_label").innerHTML = STR.import_settings_label;
    document.getElementById("export_progress_label").innerHTML = STR.import_progress_label;
    document.getElementById("export_do_export_label").innerHTML = STR.export_do_export_label;
    document.getElementById("export_pleco_text_file_label").innerHTML = STR.import_pleco_text_file_label;
    document.getElementById("export_stickystudy_label").innerHTML = STR.import_stickystudy_label;
    document.getElementById("export_skritter_simp_label").innerHTML = STR.import_skritter_simp_label;
    document.getElementById("export_skritter_trad_label").innerHTML = STR.import_skritter_trad_label;
    document.getElementById("export_do_export_label2").innerHTML = STR.export_do_export_label;
};

shanka.export = function(fileformat) {
    WaitCursorOn();
    try {
        var exportdata = "";
        shanka.addtoresult(STR.export_beginning_message);
        if (fileformat == "shanka") {
            var categories = [];
            var cards = [];
            for (var categoryidstr in shanka.categories) {
                var category = shanka.categories[categoryidstr];
                if (document.getElementById("exportcategories" + categoryidstr).classList.contains("active")) {
                    categories.push(category);
                    for (var i = 0, len = category.cardids.length; i < len; i++) {
                        var cardid = category.cardids[i];
                        var card = shanka.cards[cardid];
                        var array = card.toarray();
                        array.push(card.getdefinition());
                        array.push(card.getnotes());
                        array.push(card.getdatastring());
                        cards.push(array);
                    }
                }
            }
            var exportobj = {
                categories: categories,
                cards: cards
            };
            if (document.getElementById("exportsettings").classList.contains("active")) {
                exportobj["settings"] = shanka.settings;
            }
            if (document.getElementById("exportlessons").classList.contains("active")) {
                exportobj["lessons"] = shanka.lessons;
                exportobj["questions"] = shanka.questions;
            }
            if (document.getElementById("exportalgorithms").classList.contains("active")) {
                exportobj["algorithms"] = shanka.algorithms;
            }
            if (document.getElementById("exportprogress").classList.contains("active")) {
                exportobj["progress"] = shanka.progress;
            }
            exportdata = JSON.stringify(exportobj);
        } else {
            for (var categoryidstr in shanka.categories) {
                var category = shanka.categories[categoryidstr];
                if (document.getElementById("exportcategories" + categoryidstr).classList.contains("active")) {
                    if (fileformat == "pleco") {
                        if (exportdata.length) {
                            exportdata += "\n";
                        }
                        exportdata += "//" + category.name + "\n";
                    }
                    for (var i = 0, len = category.cardids.length; i < len; i++) {
                        var cardid = category.cardids[i];
                        var card = shanka.cards[cardid];
                        if (fileformat == "pleco") {
                            if (card.simplified.length) exportdata += card.simplified;
                            if (card.traditional.length) {
                                if (card.simplified.length == 0) exportdata += card.traditional; else if (card.simplified != card.traditional) exportdata += "[" + card.traditional + "]";
                            }
                            // TODO: use pinyin tone numbers not marks
                            exportdata += "	" + card.pinyin + "	" + card.getdefinition() + "\n";
                        } else if (fileformat == "sticky") {
                            exportdata += card.simplified + "	" + card.traditional + "	" + card.pinyin + "	" + card.pinyin + "	" + card.getdefinition() + "\n";
                        } else if (document.getElementById("dataformatsimp").classList.contains("active")) {
                            if (card.simplified.length) exportdata += card.simplified + "\n";
                        } else {
                            // trad
                            if (card.traditional.length) exportdata += card.traditional + "\n";
                        }
                    }
                }
            }
        }
        shanka.navigate({
            section: "exported"
        });
        document.getElementById("exporttextdata").value = exportdata;
        shanka.addtoresult(STR.export_success_message);
    } catch (err) {
        ExceptionError("export", err);
    }
    WaitCursorOff();
};

/*
    Shanka HSK Flashcards - historyqueue.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
shanka.rebuildqueue = function() {
    shanka.queue = [];
    // build a list of all categories that are part of enabled lessons
    var categoryids = shanka.getallactivecategoryidsdict(false);
    // find all queued cards in those categories
    for (var cardidstr in shanka.cards) {
        var card = shanka.cards[cardidstr];
        if (card.queued) {
            for (var i = 0, len = card.categoryids.length; i < len; i++) {
                var categoryid = card.categoryids[i];
                if (categoryid in categoryids) {
                    shanka.queue.push(card);
                    break;
                }
            }
        }
    }
    shanka.queue.sort(function(a, b) {
        return shanka.algorithm.queuecompare(a, b);
    });
};

shanka.rebuildhistory = function() {
    shanka.history = [];
    for (var cardidstr in shanka.cards) {
        var card = shanka.cards[cardidstr];
        if (card.last_time) {
            shanka.history.push(card);
        }
    }
    shanka.history.sort(shanka.historycompare);
};

shanka.historycompare = function(a, b) {
    return b.last_time - a.last_time;
};

shanka.removefromhistory = function(card) {
    for (var i = 0, len = shanka.history.length; i < len; i++) {
        var cardtest = shanka.history[i];
        if (card.cardid == cardtest.cardid) {
            shanka.history.splice(i, 1);
            break;
        }
    }
};

shanka.addtohistory = function(card) {
    var index = shanka.binaryInsertionSearch(shanka.history, card, shanka.historycompare);
    shanka.history.splice(index, 0, card);
};

shanka.removefromqueue = function(card) {
    for (var i = 0, len = shanka.queue.length; i < len; i++) {
        var cardtest = shanka.queue[i];
        if (card.cardid == cardtest.cardid) {
            shanka.queue.splice(i, 1);
            break;
        }
    }
};

shanka.addtoqueue = function(card) {
    var index = shanka.binaryInsertionSearch(shanka.queue, card, function(a, b) {
        return shanka.algorithm.queuecompare(a, b);
    });
    shanka.queue.splice(index, 0, card);
};

shanka.countqueueunknown = function() {
    var card = new Card();
    // TODO: do something else for date-based algorithms!
    // var datenow = new Date();
    // var datenext = new Date(datenow.getTime() + );
    card.kn_rate = shanka.algorithm.getdata("known_kn_rate");
    // card.last_time = datenow.getTime();
    // card.next_time = datenext.getTime();
    var index = shanka.binaryInsertionSearch(shanka.queue, card, function(a, b) {
        return shanka.algorithm.queuecompare(a, b);
    });
    while (index > 0 && shanka.queue[index - 1].kn_rate == card.kn_rate) {
        index--;
    }
    return index;
};

// returns the index of where to insert a value, using a given comparator
shanka.binaryInsertionSearch = function(array, value, comparator) {
    var low = 0, high = array.length - 1, i = 0, comparison;
    while (low <= high) {
        i = Math.floor((low + high) / 2);
        comparison = comparator(array[i], value);
        if (comparison < 0) {
            low = i + 1;
            i = low;
            continue;
        }
        if (comparison > 0) {
            high = i - 1;
            continue;
        }
        break;
    }
    return i;
};

shanka.showhistory = function() {
    shanka.navigate({
        section: "history"
    });
};

shanka.showqueue = function() {
    shanka.navigate({
        section: "queue"
    });
};

shanka.inithistory = function() {
    var historylist = document.getElementById("historylist");
    var lis = historylist.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (historylist.firstChild) {
        historylist.removeChild(historylist.firstChild);
    }
    var filteredhistory = shanka.filterlistpages(shanka.history);
    var lastdividertext = "";
    for (var i = 0, len = filteredhistory.length; i < len; i++) {
        var card = filteredhistory[i];
        var dividertext = shanka.algorithm.gethistorydisplaytext(card);
        if (dividertext != lastdividertext) {
            var lidivider = document.createElement("li");
            lidivider.innerHTML = dividertext;
            lidivider.classList.add("list-divider");
            historylist.appendChild(lidivider);
            lastdividertext = dividertext;
        }
        var li = document.createElement("li");
        li.innerHTML = template.replace(/#ID#/g, card.cardid).replace(/#DESCRIPTION#/g, card.liststring());
        historylist.appendChild(li);
    }
};

shanka.initqueue = function() {
    if (shanka.queue.length == 0) {
        shanka.rebuildqueue();
    }
    var queuelist = document.getElementById("queuelist");
    var lis = queuelist.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (queuelist.firstChild) {
        queuelist.removeChild(queuelist.firstChild);
    }
    var filteredqueue = shanka.filterlistpages(shanka.queue);
    // nasty to use globals, but quick...
    algorithm_globals.trouble_shown = false;
    algorithm_globals.learned_shown = false;
    algorithm_globals.learning_shown = false;
    var lastdividerkn = -1;
    for (var i = 0, len = filteredqueue.length; i < len; i++) {
        var card = filteredqueue[i];
        var dividerinfo = shanka.algorithm.getqueuedisplaytext(card);
        var dividerkn = dividerinfo[0];
        var dividertext = dividerinfo[1];
        if (dividerkn != lastdividerkn) {
            var lidivider = document.createElement("li");
            lidivider.innerHTML = dividertext;
            lidivider.classList.add("list-divider");
            queuelist.appendChild(lidivider);
            lastdividerkn = dividerkn;
        }
        var li = document.createElement("li");
        li.innerHTML = template.replace(/#ID#/g, card.cardid).replace(/#DESCRIPTION#/g, card.liststring());
        queuelist.appendChild(li);
    }
};

shanka.addcardtoqueueifallowed = function() {
    var cardadded = null;
    var auto_unknown_min = shanka.algorithm.getdata("auto_unknown_min");
    if (auto_unknown_min) {
        var categoryids = shanka.getallactivecategoryidslist(true);
        var num_unknown = shanka.countqueueunknown();
        if (num_unknown < auto_unknown_min && categoryids.length) {
            var index = Math.floor(Math.random() * categoryids.length);
            var categoryid = categoryids[index];
            var category = shanka.categories[categoryid];
            for (var i = 0, len = category.cardids.length; i < len; i++) {
                var cardid = category.cardids[i];
                var card = shanka.cards[cardid];
                if (card.enabled && !card.queued) {
                    card.queued = true;
                    card.kn_rate = shanka.algorithm.getdata("default_kn_rate");
                    // TODO: initialise time-based SRS stuff
                    card.write();
                    cardadded = card;
                    shanka.queue = [];
                    break;
                }
            }
            if (i == category.cardids.length) {
                // we got to the end of the category, remove it from the list
                categoryids.splice(index, 1);
            }
        }
    }
    return cardadded;
};

/*
    Shanka HSK Flashcards - settings.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any dervied work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
// Settings Section
shanka.getsetting = function(key) {
    if (key in shanka.settings) {
        return shanka.settings[key];
    }
    return shanka.getdefault(key);
};

shanka.getdefault = function(key) {
    // default values
    switch (key.toString()) {
      case "lastcategoryid":
        return "0";

      // study settings
        case "brushcolour":
        return "302821";

      // "000000";
        case "backgcolour":
        return "FDFFF5";

      // "FFFFFF";
        case "gridcolour":
        return "EEEDE0";

      // "eeeeee";
        case "bordercolour":
        return "B8A983";

      // "888888";
        case "brushwidth":
        return "12";

      case "script":
        return "simplified";

      case "guide":
        return "star";

      case "tonecolourenable":
        return "true";

      case "tone1colour":
        return "FF0000";

      // Red 	(rgb 255,0,0)	 - from Marjolein, thanks!
        case "tone2colour":
        return "FFAA00";

      // Orange 	(rgb 255,170,0)	
        case "tone3colour":
        return "00A000";

      // Green 	(rgb 0, 160,0)	
        case "tone4colour":
        return "0000FF";

      // Blue 	(rgb 0,0,255)	
        case "tone5colour":
        return "5D5D5D";

      // Grey	(rgb 93,93,93)	
        case "rating1title":
        return STR.settings_response_1_default;

      case "rating2title":
        return STR.settings_response_2_default;

      case "rating3title":
        return STR.settings_response_3_default;

      case "rating4title":
        return STR.settings_response_4_default;

      case "rating5title":
        return STR.settings_response_5_default;

      case "rating1enable":
        return "true";

      case "rating2enable":
        return "true";

      case "rating3enable":
        return "true";

      case "rating4enable":
        return "true";

      case "rating5enable":
        return "true";

      case "rating5enable":
        return "true";

      case "addcardsmethod":
        return "auto";

      case "pinyintones":
        return "marks";

      case "autoadvance":
        return "true";

      case "script":
        return "simplified";

      case "listmax":
        return "100";

      // version
        case "currentversionnum":
        return "0";

      case "currentversiondate":
        return "2013-12-01";
    }
    return "";
};

shanka.setsetting = function(key, value) {
    if (value == shanka.getdefault(key)) {
        delete shanka.settings[key.toString()];
    } else {
        shanka.settings[key.toString()] = value.toString();
    }
};

shanka.writesettings = function() {
    localStorage["settings"] = shanka.compress(JSON.stringify(shanka.settings));
};

shanka.initsettings = function() {
    document.getElementById("lang_interface_language").innerHTML = STR.lang_interface_language;
    document.getElementById("settings_general_label").innerHTML = STR.settings_general_label;
    document.getElementById("settings_auto_queue_label").innerHTML = STR.settings_auto_queue_label;
    document.getElementById("settings_tone_marks_label").innerHTML = STR.settings_tone_marks_label;
    document.getElementById("settings_auto_advance_label").innerHTML = STR.settings_auto_advance_label;
    document.getElementById("settings_hanzi_input_label").innerHTML = STR.settings_hanzi_input_label;
    document.getElementById("settings_brush_colour_label").innerHTML = STR.settings_brush_colour_label;
    document.getElementById("settings_background_colour_label").innerHTML = STR.settings_background_colour_label;
    document.getElementById("settings_grid_colour_label").innerHTML = STR.settings_grid_colour_label;
    document.getElementById("settings_border_colour_label").innerHTML = STR.settings_border_colour_label;
    document.getElementById("settings_brush_width_label").innerHTML = STR.settings_brush_width_label;
    document.getElementById("settings_background_guides_label").innerHTML = STR.settings_background_guides_label;
    document.getElementById("settings_guide_star_label").innerHTML = STR.settings_guide_star_label;
    document.getElementById("settings_guide_grid_label").innerHTML = STR.settings_guide_grid_label;
    document.getElementById("settings_guide_cross_label").innerHTML = STR.settings_guide_cross_label;
    document.getElementById("settings_guide_bar_label").innerHTML = STR.settings_guide_bar_label;
    document.getElementById("settings_guide_none_label").innerHTML = STR.settings_guide_none_label;
    document.getElementById("settings_tone_colours_label").innerHTML = STR.settings_tone_colours_label;
    document.getElementById("settings_enable_tone_colours_label").innerHTML = STR.settings_enable_tone_colours_label;
    document.getElementById("settings_tone_1_label").innerHTML = STR.settings_tone_1_label;
    document.getElementById("settings_tone_2_label").innerHTML = STR.settings_tone_2_label;
    document.getElementById("settings_tone_3_label").innerHTML = STR.settings_tone_3_label;
    document.getElementById("settings_tone_4_label").innerHTML = STR.settings_tone_4_label;
    document.getElementById("settings_tone_5_label").innerHTML = STR.settings_tone_5_label;
    document.getElementById("settings_preferred_script_label").innerHTML = STR.settings_preferred_script_label;
    document.getElementById("settings_simp_trad_label").innerHTML = STR.settings_simp_trad_label;
    document.getElementById("settings_trad_simp_label").innerHTML = STR.settings_trad_simp_label;
    document.getElementById("settings_simplified_label").innerHTML = STR.settings_simplified_label;
    document.getElementById("settings_traditional_label").innerHTML = STR.settings_traditional_label;
    document.getElementById("settings_rating_enabled_label").innerHTML = STR.settings_rating_enabled_label;
    document.getElementById("settings_ratings_label").innerHTML = STR.settings_ratings_label;
    document.getElementById("gen_save_text").innerHTML = STR.gen_save_text;
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text;
    var supportedlanglist = document.getElementById("settingslanguages");
    for (var languageId in supportedLanguages) {
        if (languageId != STR.getCurrentLanguage()) {
            var language = supportedLanguages[languageId];
            var ul = document.createElement("ul");
            ul.classList.add("inset");
            ul.classList.add("list");
            ul.innerHTML = "<li>" + "<a href='javascript:STR.setLanguage(\"" + languageId + "\")'>" + language.this_switch_language + " (" + STR.get_language_name(languageId) + ")" + "<span class='chevron'></span>" + "</a>" + "</li>";
            supportedlanglist.appendChild(ul);
            var br = document.createElement("br");
            supportedlanglist.appendChild(br);
        }
    }
    if (shanka.getsetting("addcardsmethod") == "auto") {
        document.getElementById("studyaddauto").classList.add("active");
    }
    if (shanka.getsetting("pinyintones") == "marks") {
        document.getElementById("pinyinmarks").classList.add("active");
    }
    if (shanka.getsetting("autoadvance") == "true") {
        document.getElementById("autoadvance").classList.add("active");
    }
    if (shanka.getsetting("script") == "simplified") {
        document.getElementById("scriptsimplified").classList.add("active");
    }
    if (shanka.getsetting("script") == "traditional") {
        document.getElementById("scripttraditional").classList.add("active");
    }
    if (shanka.getsetting("script") == "simptrad") {
        document.getElementById("scriptsimptrad").classList.add("active");
    }
    if (shanka.getsetting("script") == "tradsimp") {
        document.getElementById("scripttradsimp").classList.add("active");
    }
    document.getElementById("rating1title").value = shanka.getsetting("rating1title");
    document.getElementById("rating2title").value = shanka.getsetting("rating2title");
    document.getElementById("rating3title").value = shanka.getsetting("rating3title");
    document.getElementById("rating4title").value = shanka.getsetting("rating4title");
    document.getElementById("rating5title").value = shanka.getsetting("rating5title");
    if (shanka.getsetting("guide") == "star") {
        document.getElementById("guidestar").classList.add("active");
    }
    if (shanka.getsetting("guide") == "grid") {
        document.getElementById("guidegrid").classList.add("active");
    }
    if (shanka.getsetting("guide") == "cross") {
        document.getElementById("guidecross").classList.add("active");
    }
    if (shanka.getsetting("guide") == "bar") {
        document.getElementById("guidebar").classList.add("active");
    }
    if (shanka.getsetting("guide") == "none") {
        document.getElementById("guidenone").classList.add("active");
    }
    if (shanka.getsetting("rating1enable") == "true") {
        document.getElementById("rating1enable").classList.add("active");
    }
    if (shanka.getsetting("rating2enable") == "true") {
        document.getElementById("rating2enable").classList.add("active");
    }
    if (shanka.getsetting("rating3enable") == "true") {
        document.getElementById("rating3enable").classList.add("active");
    }
    if (shanka.getsetting("rating4enable") == "true") {
        document.getElementById("rating4enable").classList.add("active");
    }
    if (shanka.getsetting("rating5enable") == "true") {
        document.getElementById("rating5enable").classList.add("active");
    }
    var brushcolour = document.getElementById("brushcolour");
    brushcolour.value = shanka.getsetting("brushcolour");
    var brushcolourPicker = new jscolor.color(brushcolour, {
        pickerMode: "HVS",
        pickerClosable: true
    });
    brushcolourPicker.pickerPosition = "top";
    var backgcolour = document.getElementById("backgcolour");
    backgcolour.value = shanka.getsetting("backgcolour");
    var backgcolourPicker = new jscolor.color(backgcolour, {
        pickerMode: "HSV",
        pickerClosable: true
    });
    backgcolourPicker.pickerPosition = "top";
    var gridcolour = document.getElementById("gridcolour");
    gridcolour.value = shanka.getsetting("gridcolour");
    var gridcolourPicker = new jscolor.color(gridcolour, {
        pickerMode: "HSV",
        pickerClosable: true
    });
    gridcolourPicker.pickerPosition = "top";
    var bordercolour = document.getElementById("bordercolour");
    bordercolour.value = shanka.getsetting("bordercolour");
    var bordercolourPicker = new jscolor.color(bordercolour, {
        pickerMode: "HSV",
        pickerClosable: true
    });
    bordercolourPicker.pickerPosition = "top";
    var brushwidth = document.getElementById("brushwidth");
    brushwidth.value = shanka.getsetting("brushwidth");
    var tone1colour = document.getElementById("tone1colour");
    tone1colour.value = shanka.getsetting("tone1colour");
    var tone1colourPicker = new jscolor.color(tone1colour, {
        pickerMode: "HSV",
        pickerClosable: true
    });
    tone1colourPicker.pickerPosition = "top";
    var tone2colour = document.getElementById("tone2colour");
    tone2colour.value = shanka.getsetting("tone2colour");
    var tone2colourPicker = new jscolor.color(tone2colour, {
        pickerMode: "HSV",
        pickerClosable: true
    });
    tone2colourPicker.pickerPosition = "top";
    var tone3colour = document.getElementById("tone3colour");
    tone3colour.value = shanka.getsetting("tone3colour");
    var tone3colourPicker = new jscolor.color(tone3colour, {
        pickerMode: "HSV",
        pickerClosable: true
    });
    tone3colourPicker.pickerPosition = "top";
    var tone4colour = document.getElementById("tone4colour");
    tone4colour.value = shanka.getsetting("tone4colour");
    var tone4colourPicker = new jscolor.color(tone4colour, {
        pickerMode: "HSV",
        pickerClosable: true
    });
    tone4colourPicker.pickerPosition = "top";
    var tone5colour = document.getElementById("tone5colour");
    tone5colour.value = shanka.getsetting("tone5colour");
    var tone5colourPicker = new jscolor.color(tone5colour, {
        pickerMode: "HSV",
        pickerClosable: true
    });
    tone5colourPicker.pickerPosition = "top";
    if (shanka.getsetting("tonecolourenable") == "true") {
        document.getElementById("tonecolourenable").classList.add("active");
    }
    shanka.tonecolourenableclicked();
};

shanka.dosavesettings = function() {
    if ((document.getElementById("rating1enable").classList.contains("active") ? 1 : 0) + (document.getElementById("rating2enable").classList.contains("active") ? 1 : 0) + (document.getElementById("rating3enable").classList.contains("active") ? 1 : 0) + (document.getElementById("rating4enable").classList.contains("active") ? 1 : 0) + (document.getElementById("rating5enable").classList.contains("active") ? 1 : 0) < 2) {
        alert(STR.settings_must_enable_two_buttons_error);
        return;
    }
    if (document.getElementById("rating1enable").classList.contains("active") && !document.getElementById("rating1title").value.length || document.getElementById("rating2enable").classList.contains("active") && !document.getElementById("rating2title").value.length || document.getElementById("rating3enable").classList.contains("active") && !document.getElementById("rating3title").value.length || document.getElementById("rating4enable").classList.contains("active") && !document.getElementById("rating4title").value.length || document.getElementById("rating5enable").classList.contains("active") && !document.getElementById("rating5title").value.length) {
        alert(STR.settings_each_enabled_rating_must_have_val_error);
        return;
    }
    if (document.getElementById("scriptsimplified").classList.contains("active")) {
        shanka.setsetting("script", "simplified");
    } else if (document.getElementById("scripttraditional").classList.contains("active")) {
        shanka.setsetting("script", "traditional");
    } else if (document.getElementById("scriptsimptrad").classList.contains("active")) {
        shanka.setsetting("script", "simptrad");
    } else {
        shanka.setsetting("script", "tradsimp");
    }
    if (document.getElementById("guidestar").classList.contains("active")) {
        shanka.setsetting("guide", "star");
    }
    if (document.getElementById("guidegrid").classList.contains("active")) {
        shanka.setsetting("guide", "grid");
    }
    if (document.getElementById("guidecross").classList.contains("active")) {
        shanka.setsetting("guide", "cross");
    }
    if (document.getElementById("guidebar").classList.contains("active")) {
        shanka.setsetting("guide", "bar");
    }
    if (document.getElementById("guidenone").classList.contains("active")) {
        shanka.setsetting("guide", "none");
    }
    shanka.setsetting("addcardsmethod", document.getElementById("studyaddauto").classList.contains("active") ? "auto" : "manual");
    shanka.setsetting("pinyintones", document.getElementById("pinyinmarks").classList.contains("active") ? "marks" : "numbers");
    shanka.setsetting("autoadvance", document.getElementById("autoadvance").classList.contains("active") ? "true" : "false");
    shanka.setsetting("rating1title", document.getElementById("rating1title").value);
    shanka.setsetting("rating2title", document.getElementById("rating2title").value);
    shanka.setsetting("rating3title", document.getElementById("rating3title").value);
    shanka.setsetting("rating4title", document.getElementById("rating4title").value);
    shanka.setsetting("rating5title", document.getElementById("rating5title").value);
    shanka.setsetting("rating1enable", document.getElementById("rating1enable").classList.contains("active") ? "true" : "false");
    shanka.setsetting("rating2enable", document.getElementById("rating2enable").classList.contains("active") ? "true" : "false");
    shanka.setsetting("rating3enable", document.getElementById("rating3enable").classList.contains("active") ? "true" : "false");
    shanka.setsetting("rating4enable", document.getElementById("rating4enable").classList.contains("active") ? "true" : "false");
    shanka.setsetting("rating5enable", document.getElementById("rating5enable").classList.contains("active") ? "true" : "false");
    shanka.setsetting("brushcolour", document.getElementById("brushcolour").value);
    shanka.setsetting("backgcolour", document.getElementById("backgcolour").value);
    shanka.setsetting("gridcolour", document.getElementById("gridcolour").value);
    shanka.setsetting("bordercolour", document.getElementById("bordercolour").value);
    shanka.setsetting("brushwidth", document.getElementById("brushwidth").value);
    shanka.setsetting("tonecolourenable", document.getElementById("tonecolourenable").classList.contains("active") ? "true" : "false");
    shanka.setsetting("tone1colour", document.getElementById("tone1colour").value);
    shanka.setsetting("tone2colour", document.getElementById("tone2colour").value);
    shanka.setsetting("tone3colour", document.getElementById("tone3colour").value);
    shanka.setsetting("tone4colour", document.getElementById("tone4colour").value);
    shanka.setsetting("tone5colour", document.getElementById("tone5colour").value);
    shanka.writesettings();
    shanka.showmain();
    shanka.addtoresult(STR.settings_saved_message);
};

shanka.tonecolourenableclicked = function() {
    var tone1colour = document.getElementById("tone1colour");
    var tone2colour = document.getElementById("tone2colour");
    var tone3colour = document.getElementById("tone3colour");
    var tone4colour = document.getElementById("tone4colour");
    var tone5colour = document.getElementById("tone5colour");
    var tonecolourenable = document.getElementById("tonecolourenable");
    if (tonecolourenable.classList.contains("active")) {
        tone1colour.removeAttribute("disabled");
        tone2colour.removeAttribute("disabled");
        tone3colour.removeAttribute("disabled");
        tone4colour.removeAttribute("disabled");
        tone5colour.removeAttribute("disabled");
        tone1colour.parentElement.classList.remove("disabled");
        tone2colour.parentElement.classList.remove("disabled");
        tone3colour.parentElement.classList.remove("disabled");
        tone4colour.parentElement.classList.remove("disabled");
        tone5colour.parentElement.classList.remove("disabled");
    } else {
        tone1colour.disabled = "disabled";
        tone2colour.disabled = "disabled";
        tone3colour.disabled = "disabled";
        tone4colour.disabled = "disabled";
        tone5colour.disabled = "disabled";
        tone1colour.parentElement.classList.add("disabled");
        tone2colour.parentElement.classList.add("disabled");
        tone3colour.parentElement.classList.add("disabled");
        tone4colour.parentElement.classList.add("disabled");
        tone5colour.parentElement.classList.add("disabled");
    }
};

/*
    Shanka HSK Flashcards - maintenance.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
// Maintenance Section
shanka.initmaintenance = function() {
    document.getElementById("maintenance_reload_local_label").innerHTML = STR.maintenance_reload_local_label;
    document.getElementById("maintenance_reload_label").innerHTML = STR.maintenance_reload_label;
    document.getElementById("maintenance_stand_alone_label").innerHTML = STR.maintenance_stand_alone_label;
    document.getElementById("maintenance_system_language_label").innerHTML = STR.maintenance_system_language_label;
    document.getElementById("maintenance_app_cache_label").innerHTML = STR.maintenance_app_cache_label;
    document.getElementById("maintenance_refresh_label").innerHTML = STR.maintenance_refresh_label;
    document.getElementById("maintenance_installed_label").innerHTML = STR.maintenance_installed_label;
    document.getElementById("maintenance_update_label").innerHTML = STR.maintenance_update_label;
    document.getElementById("maintenance_erase_local_label").innerHTML = STR.maintenance_erase_local_label;
    document.getElementById("maintenance_erase_label").innerHTML = STR.maintenance_erase_label;
    shanka._updatemlocalstorageused();
    shanka.updateappcachestatus();
    document.getElementById("standalonestatus").innerHTML = String(window.navigator.standalone);
    document.getElementById("systemlanguage").innerHTML = GetUserLanguage();
    shanka.setlocalversioninfo();
};

shanka.updateappcachestatus = function() {
    var appcachestatus = document.getElementById("appcachestatus");
    if (appcachestatus) {
        appcachestatus.innerHTML = shanka.getappcachestatus();
    }
};

shanka._updatemlocalstorageused = function() {
    var number = JSON.stringify(localStorage).length;
    var formatted = "";
    if (number < 1024) {
        formatted = number.toString();
    } else {
        var suffix = "";
        if (number < 1024 * 1024) {
            number = number / 1024;
            suffix = "k";
        } else {
            number = number / (1024 * 1024);
            suffix = "M";
        }
        if (number < 1) {
            formatted = number.toFixed(3).toString() + suffix;
        } else if (number < 10) {
            formatted = number.toFixed(2).toString() + suffix;
        } else {
            formatted = number.toFixed(1).toString() + suffix;
        }
    }
    var usedlabel = STR.maintenance_storage_used_format.replace("{0}", formatted);
    document.getElementById("localstorageused").innerHTML = usedlabel;
};

/*
    Shanka HSK Flashcards - wizard.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
shanka.onetouchwizard = function() {
    WaitCursorOn();
    try {
        shanka.importmultiplecategories([ "chineasy", "hsk1" ], shanka.onetouchwizard_afterimport, []);
    } catch (err) {
        ExceptionError("onetouchwizard", err);
    }
    WaitCursorOff();
};

shanka.importmultiplecategories = function(categories, callback, categoryids) {
    WaitCursorOn();
    try {
        var category = categories[0];
        var categoriesnew = categories.concat();
        categoriesnew.splice(0, 1);
        var callbackwrapper = function(categoryimported, created, merged) {
            shanka.addtoresult(STR.wizard_created_flashcards_format.replace("{0}", created.toString()));
            if (merged) {
                shanka.addtoresult(STR.wizard_merged_flashcards_format.replace("{0}", merged.toString()));
            }
            var categoryidsnew = categoryids.concat();
            categoryidsnew.push(categoryimported.categoryid);
            if (categoriesnew.length) {
                shanka.importmultiplecategories(categoriesnew, callback, categoryidsnew);
            } else {
                callback(categoryidsnew);
            }
        };
        switch (category) {
          case "chineasy":
            shanka.importChineasy(callbackwrapper);
            break;

          case "hsk1":
            shanka.importHSK1(callbackwrapper);
            break;

          case "hsk2":
            shanka.importHSK2(callbackwrapper);
            break;

          case "hsk3":
            shanka.importHSK3(callbackwrapper);
            break;

          case "hsk4":
            shanka.importHSK4(callbackwrapper);
            break;

          case "hsk5":
            shanka.importHSK5(callbackwrapper);
            break;

          case "hsk6":
            shanka.importHSK6(callbackwrapper);
            break;

          case "hsk1sent":
            shanka.importHSK1Sentences(callbackwrapper);
            break;

          case "hsk2sent":
            shanka.importHSK2Sentences(callbackwrapper);
            break;

          case "hsk3sent":
            shanka.importHSK3Sentences(callbackwrapper);
            break;
        }
    } catch (err) {
        ExceptionError("onetouchwizard_afterimporthsk", err);
    }
    WaitCursorOff();
};

shanka.onetouchwizard_afterimport = function(categoryids) {
    WaitCursorOn();
    try {
        var beginner = shanka.EnsureAlgorithmBeginnerExists();
        shanka.addtoresult(STR.wizard_created_algorithm_message);
        beginner.current = true;
        shanka.algorithm = beginner;
        beginner.write();
        var sToPD = shanka.EnsureQuestionExists([ "simplified" ], [ "pinyin", "definition" ], [ "notes" ], []);
        var dToPS = shanka.EnsureQuestionExists([ "definition" ], [ "simplified", "pinyin" ], [ "notes" ], [ "draw" ]);
        var lesson = shanka.EnsureLessonExists("Chinese 101", [ sToPD.questionid, dToPS.questionid ], categoryids, false);
        lesson.allquestions = false;
        lesson.allcategories = false;
        lesson.enabled = true;
        lesson.write();
        shanka.showstudy();
    } catch (err) {
        ExceptionError("onetouchwizard_afterimportchineasy", err);
    }
    WaitCursorOff();
};

shanka.wizard = function() {
    var state = {};
    state["section"] = "wizard1";
    shanka.navigate(state);
};

shanka.wizard2 = function() {
    var state = JSON.parse(JSON.stringify(shanka.state));
    state["section"] = "wizard2";
    shanka.navigate(state);
};

shanka.wizard3 = function() {
    var state = JSON.parse(JSON.stringify(shanka.state));
    state["section"] = "wizard3";
    shanka.navigate(state);
};

shanka.wizard1result = function(script) {
    var state = JSON.parse(JSON.stringify(shanka.state));
    state["script"] = script;
    state["section"] = "wizard2";
    shanka.navigate(state);
};

shanka.wizard2result = function() {
    var state = JSON.parse(JSON.stringify(shanka.state));
    var vocab = [];
    if (document.getElementById("vocabchineasy").classList.contains("active")) {
        vocab.push("chineasy");
    }
    if (document.getElementById("vocabhsk1").classList.contains("active")) {
        vocab.push("hsk1");
    }
    if (document.getElementById("vocabhsk2").classList.contains("active")) {
        vocab.push("hsk2");
    }
    if (document.getElementById("vocabhsk3").classList.contains("active")) {
        vocab.push("hsk3");
    }
    if (document.getElementById("vocabhsk4").classList.contains("active")) {
        vocab.push("hsk4");
    }
    if (document.getElementById("vocabhsk5").classList.contains("active")) {
        vocab.push("hsk5");
    }
    if (document.getElementById("vocabhsk6").classList.contains("active")) {
        vocab.push("hsk6");
    }
    if (document.getElementById("vocabhsk1sent").classList.contains("active")) {
        vocab.push("hsk1sent");
    }
    if (document.getElementById("vocabhsk2sent").classList.contains("active")) {
        vocab.push("hsk2sent");
    }
    if (document.getElementById("vocabhsk3sent").classList.contains("active")) {
        vocab.push("hsk3sent");
    }
    if (vocab.length == 0) {
        alert(STR.wizard_select_one_vocab_error);
        return;
    }
    state["vocab"] = vocab.join(",");
    state["section"] = "wizard3";
    shanka.navigate(state);
};

shanka.wizard3result = function(level) {
    var state = JSON.parse(JSON.stringify(shanka.state));
    state["level"] = level;
    state["section"] = "wizard4";
    shanka.navigate(state);
};

shanka.wizard4result = function() {
    WaitCursorOn();
    try {
        var categorystr = shanka.state["vocab"];
        var categorynames = categorystr.split(",");
        shanka.importmultiplecategories(categorynames, shanka.wizard4continue, []);
    } catch (err) {
        ExceptionError("wizard4result", err);
    }
    WaitCursorOff();
};

shanka.wizard4continue = function(categoryids) {
    WaitCursorOn();
    try {
        var learndefinition = document.getElementById("learndefinition").classList.contains("active");
        var learnpinyin = document.getElementById("learnpinyin").classList.contains("active");
        var learnhanzi = document.getElementById("learnhanzi").classList.contains("active");
        var learnwriting = document.getElementById("learnwriting").classList.contains("active");
        var learncursive = document.getElementById("learncursive").classList.contains("active");
        var learncallig = document.getElementById("learncallig").classList.contains("active");
        var count = (learndefinition ? 1 : 0) + (learnpinyin ? 1 : 0) + (learnhanzi || learnwriting ? 1 : 0) + (learncursive || learncallig ? 1 : 0);
        if (count == 0) {
            alert(STR.wizard_select_something_learn_error);
        }
        // set the algorithm
        var level = shanka.state["level"];
        var algorithm = null;
        if (level == "beginner") {
            algorithm = shanka.EnsureAlgorithmBeginnerExists();
        } else if (level == "intermediate") {
            algorithm = shanka.EnsureAlgorithmIntermediateExists();
        } else {
            algorithm = shanka.EnsureAlgorithmAdvancedExists();
        }
        shanka.addtoresult(STR.wizard_created_algorithm_message);
        algorithm.current = true;
        shanka.algorithm = algorithm;
        algorithm.write();
        for (var algorithmidstr in shanka.algorithms) {
            var algorithmiter = shanka.algorithms[algorithmidstr];
            if (algorithmiter.algorithmid != algorithm.algorithmid && algorithmiter.current) {
                algorithmiter.current = false;
                algorithmiter.write();
            }
        }
        // set the script
        var script = shanka.state["script"];
        var simplified = script == "simplified" || script == "both";
        var traditional = script == "traditional" || script == "both";
        if (simplified && traditional) {
            shanka.setsetting("script", "simptrad");
        } else if (simplified) {
            shanka.setsetting("script", "simplified");
        } else {
            shanka.setsetting("script", "traditional");
        }
        // create the questions        
        var questionids = [];
        var answer = [];
        if (learndefinition) answer.push("definition");
        if ((learnhanzi || learnwriting || learncursive || learncallid) && simplified) answer.push("simplified");
        if ((learnhanzi || learnwriting || learncursive || learncallid) && traditional) answer.push("traditional");
        if (learnpinyin) answer.push("pinyin");
        if (learndefinition) {
            var inputs = learnwriting ? [ "draw" ] : [];
            var answersremoved = copyandremove(answer, "definition");
            var question = shanka.EnsureQuestionExists([ "definition" ], answersremoved, [ "notes" ], inputs);
            questionids.push(question.questionid);
        }
        if (learnhanzi || learnwriting) {
            if (simplified) {
                var answersremoved = copyandremove(answer, "simplified");
                var question = shanka.EnsureQuestionExists([ "simplified" ], answersremoved, [ "notes" ], []);
                questionids.push(question.questionid);
            }
            if (traditional) {
                var answersremoved = copyandremove(answer, "traditional");
                var question = shanka.EnsureQuestionExists([ "traditional" ], answersremoved, [ "notes" ], []);
                questionids.push(question.questionid);
            }
        }
        if (learncursive) {
            var inputs = learnwriting ? [ "draw" ] : [];
            //if (simplified) {
            var answersremoved = copyandremove(answer, "cursive");
            var question = shanka.EnsureQuestionExists([ "cursive" ], answersremoved, [ "notes" ], inputs);
            questionids.push(question.questionid);
        }
        if (learncallig) {
            var inputs = learnwriting ? [ "draw" ] : [];
            //if (simplified) {
            var answersremoved = copyandremove(answer, "callig");
            var question = shanka.EnsureQuestionExists([ "callig" ], answersremoved, [ "notes" ], inputs);
            questionids.push(question.questionid);
        }
        var lesson = shanka.EnsureLessonExists(STR.wizard_created_lesson_name, questionids, categoryids, false);
        lesson.allquestions = false;
        lesson.allcategories = false;
        lesson.enabled = true;
        lesson.write();
        shanka.showstudy();
    } catch (err) {
        ExceptionError("wizard4result", err);
    }
    WaitCursorOff();
};

var copyandremove = function(array, item) {
    var copy = array.concat();
    var index = copy.indexOf(item);
    while (index != -1) {
        copy.splice(index, 1);
        index = copy.indexOf(item);
    }
    return copy;
};

shanka.wizard1init = function() {
    document.getElementById("wizard_which_characters_label").innerHTML = STR.wizard_which_characters_label;
    document.getElementById("wizard_simplified_characters_label").innerHTML = STR.wizard_simplified_characters_label;
    document.getElementById("wizard_traditional_characters_label").innerHTML = STR.wizard_traditional_characters_label;
    document.getElementById("wizard_both_characters_label").innerHTML = STR.wizard_both_characters_label;
};

shanka.wizard2init = function() {
    document.getElementById("wizard_which_vocab_label").innerHTML = STR.wizard_which_vocab_label;
    document.getElementById("import_hsk1_label").innerHTML = STR.import_hsk1_label;
    document.getElementById("import_hsk2_label").innerHTML = STR.import_hsk2_label;
    document.getElementById("import_hsk3_label").innerHTML = STR.import_hsk3_label;
    document.getElementById("import_hsk4_label").innerHTML = STR.import_hsk4_label;
    document.getElementById("import_hsk5_label").innerHTML = STR.import_hsk5_label;
    document.getElementById("import_hsk6_label").innerHTML = STR.import_hsk6_label;
    document.getElementById("import_hsk1_sentences_label").innerHTML = STR.import_hsk1_sentences_label;
    document.getElementById("import_hsk2_sentences_label").innerHTML = STR.import_hsk2_sentences_label;
    document.getElementById("import_hsk3_sentences_label").innerHTML = STR.import_hsk3_sentences_label;
    document.getElementById("import_chineasy_label").innerHTML = STR.import_chineasy_label;
    document.getElementById("wizard_next_label").innerHTML = STR.wizard_next_label;
};

shanka.wizard3init = function() {
    document.getElementById("wizard_what_is_level_label").innerHTML = STR.wizard_what_is_level_label;
    document.getElementById("wizard_algorithm_name_beginner").innerHTML = STR.wizard_algorithm_name_beginner;
    document.getElementById("wizard_algorithm_name_intermediate").innerHTML = STR.wizard_algorithm_name_intermediate;
    document.getElementById("wizard_algorithm_name_advanced").innerHTML = STR.wizard_algorithm_name_advanced;
};

shanka.wizard4init = function() {
    document.getElementById("wizard_what_want_learn_label").innerHTML = STR.wizard_what_want_learn_label;
    document.getElementById("wizard_definition_label").innerHTML = STR.wizard_definition_label;
    document.getElementById("wizard_pinyin_label").innerHTML = STR.wizard_pinyin_label;
    document.getElementById("wizard_reading_label").innerHTML = STR.wizard_reading_label;
    document.getElementById("wizard_writing_label").innerHTML = STR.wizard_writing_label;
    document.getElementById("wizard_cursive_label").innerHTML = STR.wizard_cursive_label;
    document.getElementById("wizard_calligraphy_label").innerHTML = STR.wizard_calligraphy_label;
    document.getElementById("wizard_done_label").innerHTML = STR.wizard_done_label;
};

shanka.importHSK1 = function(callbackafterimport) {
    shanka.import(STR.import_hsk1_location, "plecotext", STR.import_hsk1_category, true, callbackafterimport);
};

shanka.importHSK2 = function(callbackafterimport) {
    shanka.import(STR.import_hsk2_location, "plecotext", STR.import_hsk2_category, true, callbackafterimport);
};

shanka.importHSK3 = function(callbackafterimport) {
    shanka.import(STR.import_hsk3_location, "plecotext", STR.import_hsk3_category, true, callbackafterimport);
};

shanka.importHSK4 = function(callbackafterimport) {
    shanka.import(STR.import_hsk4_location, "plecotext", STR.import_hsk4_category, true, callbackafterimport);
};

shanka.importHSK5 = function(callbackafterimport) {
    shanka.import(STR.import_hsk5_location, "plecotext", STR.import_hsk5_category, true, callbackafterimport);
};

shanka.importHSK6 = function(callbackafterimport) {
    shanka.import(STR.import_hsk6_location, "plecotext", STR.import_hsk6_category, true, callbackafterimport);
};

shanka.importHSK1Sentences = function(callbackafterimport) {
    shanka.import(STR.import_hsk1_sentences_location, "plecotext", STR.import_hsk1_sentences_category, true, callbackafterimport);
};

shanka.importHSK2Sentences = function(callbackafterimport) {
    shanka.import(STR.import_hsk2_sentences_location, "plecotext", STR.import_hsk2_sentences_category, true, callbackafterimport);
};

shanka.importHSK3Sentences = function(callbackafterimport) {
    shanka.import(STR.import_hsk3_sentences_location, "plecotext", STR.import_hsk3_sentences_category, true, callbackafterimport);
};

shanka.importChineasy = function(callbackafterimport) {
    shanka.import(STR.import_chineasy_location, "plecotext", STR.import_chineasy_category, true, callbackafterimport);
};

shanka.EnsureAlgorithmBeginnerExists = function() {
    var algorithmname = STR.wizard_algorithm_name_beginner;
    var algorithm = shanka.FindAlgorithmByName(algorithmname);
    if (!algorithm) {
        algorithm = new Algorithm();
        algorithm.algorithmid = shanka.getnextguid();
        algorithm.current = false;
        algorithm.enabled = true;
        algorithm.name = algorithmname;
        algorithm.type = "shanka";
        algorithm.data = {
            minimum_interval: 3,
            auto_unknown_min: 5,
            default_kn_rate: .4,
            first_element_prob: .2
        };
        algorithm.write();
        shanka.algorithms[algorithm.algorithmid] = algorithm;
    }
    return algorithm;
};

shanka.EnsureAlgorithmIntermediateExists = function() {
    var algorithmname = STR.wizard_algorithm_name_intermediate;
    var algorithm = shanka.FindAlgorithmByName(algorithmname);
    if (!algorithm) {
        algorithm = new Algorithm();
        algorithm.algorithmid = shanka.getnextguid();
        algorithm.current = false;
        algorithm.enabled = true;
        algorithm.name = algorithmname;
        algorithm.type = "shanka";
        algorithm.data = {};
        // use defaults
        algorithm.write();
        shanka.algorithms[algorithm.algorithmid] = algorithm;
    }
    return algorithm;
};

shanka.EnsureAlgorithmAdvancedExists = function() {
    var algorithmname = STR.wizard_algorithm_name_advanced;
    var algorithm = shanka.FindAlgorithmByName(algorithmname);
    if (!algorithm) {
        algorithm = new Algorithm();
        algorithm.algorithmid = shanka.getnextguid();
        algorithm.current = false;
        algorithm.enabled = true;
        algorithm.name = algorithmname;
        algorithm.type = "shanka";
        algorithm.data = {
            minimum_interval: 5,
            auto_unknown_min: 10,
            default_kn_rate: .6,
            first_element_prob: .1
        };
        algorithm.write();
        shanka.algorithms[algorithm.algorithmid] = algorithm;
    }
    return algorithm;
};

shanka.EnsureAlgorithmReviewExists = function() {
    var algorithmname = STR.wizard_algorithm_name_review;
    var algorithm = shanka.FindAlgorithmByName(algorithmname);
    if (!algorithm) {
        algorithm = new Algorithm();
        algorithm.algorithmid = shanka.getnextguid();
        algorithm.current = false;
        algorithm.enabled = true;
        algorithm.name = algorithmname;
        algorithm.type = "shanka";
        algorithm.data = {
            auto_unknown_min: 0
        };
        algorithm.write();
        shanka.algorithms[algorithm.algorithmid] = algorithm;
    }
    return algorithm;
};

shanka.EnsureAlgorithmRandomExists = function() {
    var algorithmname = STR.wizard_algorithm_name_random;
    var algorithm = shanka.FindAlgorithmByName(algorithmname);
    if (!algorithm) {
        algorithm = new Algorithm();
        algorithm.algorithmid = shanka.getnextguid();
        algorithm.current = false;
        algorithm.enabled = true;
        algorithm.name = algorithmname;
        algorithm.type = "shanka";
        algorithm.data = {
            prob_of_any_random: 1
        };
        algorithm.write();
        shanka.algorithms[algorithm.algorithmid] = algorithm;
    }
    return algorithm;
};

shanka.EnsureAlgorithmRandomReviewExists = function() {
    var algorithmname = STR.wizard_algorithm_name_randomreview;
    var algorithm = shanka.FindAlgorithmByName(algorithmname);
    if (!algorithm) {
        algorithm = new Algorithm();
        algorithm.algorithmid = shanka.getnextguid();
        algorithm.current = false;
        algorithm.enabled = true;
        algorithm.name = algorithmname;
        algorithm.type = "shanka";
        algorithm.data = {
            auto_unknown_min: 0,
            prob_of_any_random: 1
        };
        algorithm.write();
        shanka.algorithms[algorithm.algorithmid] = algorithm;
    }
    return algorithm;
};

shanka.EnsureAlgorithmPlecoExists = function() {
    var algorithmname = "Pleco";
    var algorithm = shanka.FindAlgorithmByName(algorithmname);
    if (!algorithm) {
        algorithm = new Algorithm();
        algorithm.algorithmid = shanka.getnextguid();
        algorithm.current = false;
        algorithm.enabled = false;
        algorithm.name = algorithmname;
        algorithm.type = "shanka";
        algorithm.data = {};
        // use defaults
        algorithm.write();
        shanka.algorithms[algorithm.algorithmid] = algorithm;
    }
    return algorithm;
};

shanka.EnsureAlgorithmSkritterExists = function() {
    var algorithmname = "Skritter";
    var algorithm = shanka.FindAlgorithmByName(algorithmname);
    if (!algorithm) {
        algorithm = new Algorithm();
        algorithm.algorithmid = shanka.getnextguid();
        algorithm.current = false;
        algorithm.enabled = false;
        algorithm.name = algorithmname;
        algorithm.type = "shanka";
        algorithm.data = {};
        // use defaults
        algorithm.write();
        shanka.algorithms[algorithm.algorithmid] = algorithm;
    }
    return algorithm;
};

shanka.FindAlgorithmByName = function(algorithmname) {
    var algorithm = null;
    for (var algorithmidstr in shanka.algorithms) {
        var algorithmiter = shanka.algorithms[algorithmidstr];
        if (algorithmiter.name == algorithmname) {
            algorithm = algorithmiter;
            break;
        }
    }
    return algorithm;
};

shanka.EnsureQuestionExists = function(stem, answer, display, input) {
    for (var questionidstr in shanka.questions) {
        var question = shanka.questions[questionidstr];
        if (arrayAEqualsB(stem, question.stem) && arrayAEqualsB(answer, question.answer) && arrayAEqualsB(display, question.display) && arrayAEqualsB(input, question.input)) {
            shanka.addtoresult(STR.wizard_found_question_message);
            return question;
        }
    }
    var question = new Question();
    question.questionid = shanka.getnextguid();
    shanka.addnewquestiontolessons(question.questionid);
    question.input = input.concat();
    question.stem = stem.concat();
    question.answer = answer.concat();
    question.display = display.concat();
    question.generatename();
    question.generatequestiontext();
    question.write();
    shanka.questions[question.questionid] = question;
    shanka.addtoresult(STR.wizard_added_question_message);
    return question;
};

shanka.EnsureLessonExists = function(lessonname, questionids, categoryids, reviewmode) {
    for (var lessonidstr in shanka.lessons) {
        var lesson = shanka.lessons[lessonidstr];
        if (arrayAisSubsetOfB(questionids, lesson.questionids) && arrayAisSubsetOfB(categoryids, lesson.categoryids) && reviewmode == lesson.reviewmode && lessonname == lesson.name) {
            shanka.addtoresult(STR.wizard_found_lesson_message);
            return lesson;
        }
    }
    var lesson = new Lesson();
    lesson.lessonid = shanka.getnextguid();
    lesson.name = shanka.getuniquelessonname(lessonname);
    lesson.questionids = questionids.concat();
    lesson.categoryids = categoryids.concat();
    lesson.reviewmode = reviewmode;
    lesson.write();
    shanka.lessons[lesson.lessonid] = lesson;
    shanka.addtoresult(STR.wizard_added_lesson_message);
    return lesson;
};

/*
    Shanka HSK Flashcards - help.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
shanka.showhelp = function(page) {
    var state = JSON.parse(JSON.stringify(shanka.state));
    var section = state["section"];
    if (section && section != "help") {
        state["previous"] = section;
    }
    state["section"] = "help";
    if (page) {
        state["page"] = page;
    } else if ("section" in shanka.state) {
        state["page"] = shanka.state["section"];
    } else {
        state["page"] = "";
    }
    shanka.navigate(state);
};

shanka.inithelp = function(page) {
    document.getElementById("help_contents_label").innerHTML = STR.help_contents_label;
    document.getElementById("help_app_support_see_message").innerHTML = STR.app_support_see_message;
    if (!page) page = "";
    switch (page) {
      case "":
      case "contents":
        shanka.inithelp_contents();
        break;

      case "initialising":
      case "welcome":
      case "main":
        shanka.inithelp_mainpage();
        break;

      case "about":
        shanka.inithelp_about();
        break;

      case "algorithm-add":
      case "algorithm-shanka":
      case "editalgorithms":
      case "algorithms":
        shanka.inithelp_algorithms();
        break;

      case "addcategory":
      case "editcategoryname":
      case "categories":
      case "category":
        shanka.inithelp_categories();
        break;

      case "exportresult":
      case "export":
        shanka.inithelp_export();
        break;

      case "history":
        shanka.inithelp_history();
        break;

      case "shankaimport":
      case "skritterimport":
      case "stickyimport":
      case "plecoimport":
      case "import":
        shanka.inithelp_import();
        break;

      case "card":
      case "info":
        shanka.inithelp_info();
        break;

      case "lesson":
      case "lessons":
        shanka.inithelp_lessons();
        break;

      case "maintenance":
        shanka.inithelp_maintenance();
        break;

      case "practice":
        shanka.inithelp_practice();
        break;

      case "progress":
        shanka.inithelp_progress();
        break;

      case "question":
      case "questions":
        shanka.inithelp_questions();
        break;

      case "queue":
        shanka.inithelp_queue();
        break;

      case "settings":
        shanka.inithelp_settings();
        break;

      case "study":
        shanka.inithelp_study();
        break;

      case "wizard1":
      case "wizard2":
      case "wizard3":
      case "wizard4":
        shanka.inithelp_wizard();
        break;

      default:
        ReportError("shanka.inithelp Unknown help page: " + page);
        break;
    }
};

// ----------------------------------------------------------------
shanka.inithelp_contents = function() {
    shanka.setpagetitle(STR.page_help_contents_title);
    document.getElementById("helptext").innerHTML = "<h3>" + STR.page_help_contents_title + "</h3>" + "<h3><li><a href=\"javascript:shanka.showhelp('main');\">  " + STR.page_main_title + "</a></li>" + "<li><a href=\"javascript:shanka.showhelp('study');\"> " + STR.page_study_title + "</a></li>" + "<li><a href=\"javascript:shanka.showhelp('practice');\">" + STR.page_practice_title + "</a></li>" + "<li><a href=\"javascript:shanka.showhelp('card');\">  " + STR.page_cards_title + "</a></li>" + "<li><a href=\"javascript:shanka.showhelp('history');\"> " + STR.page_history_title + "</a></li>" + "<li><a href=\"javascript:shanka.showhelp('queue');\"> " + STR.page_queue_title + "</a></li>" + "<li><a href=\"javascript:shanka.showhelp('progress');\">" + STR.page_progress_title + "</a></li>" + "<li><a href=\"javascript:shanka.showhelp('categories');\">" + STR.page_categories_title + "</a></li>" + "<li><a href=\"javascript:shanka.showhelp('questions');\">" + STR.page_questions_title + "</a></li>" + "<li><a href=\"javascript:shanka.showhelp('lessons');\">" + STR.page_lessons_title + "</a></li>" + "<li><a href=\"javascript:shanka.showhelp('algorithms');\">" + STR.page_algorithms_title + "</a></li>" + "<li><a href=\"javascript:shanka.showhelp('wizard1');\">" + STR.page_wizard_title + "</a></li>" + "<li><a href=\"javascript:shanka.showhelp('import');\">" + STR.page_import_title + "</a></li>" + "<li><a href=\"javascript:shanka.showhelp('export');\">" + STR.page_export_title + "</a></li>" + "<li><a href=\"javascript:shanka.showhelp('settings');\">" + STR.page_settings_title + "</a></li>" + "<li><a href=\"javascript:shanka.showhelp('maintenance');\">" + STR.page_maintenance_title + "</a></li>" + "<li><a href=\"javascript:shanka.showhelp('about');\"> " + STR.page_about_title + "</a></li></h3>";
};

shanka.inithelp_mainpage = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_main_title);
    document.getElementById("helptext").innerHTML = STR.help_main_page;
};

shanka.inithelp_lessons = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_lessons_title);
    document.getElementById("helptext").innerHTML = STR.help_lessons;
};

shanka.inithelp_study = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_study_title);
    document.getElementById("helptext").innerHTML = STR.help_study;
};

shanka.inithelp_info = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_card_info_title);
    document.getElementById("helptext").innerHTML = STR.help_card_info;
};

shanka.inithelp_practice = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_practice_title);
    document.getElementById("helptext").innerHTML = STR.help_practice;
};

shanka.inithelp_card = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_cards_title);
    document.getElementById("helptext").innerHTML = STR.help_study;
};

shanka.inithelp_categories = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_categories_title);
    document.getElementById("helptext").innerHTML = STR.help_categories;
};

shanka.inithelp_progress = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_progress_title);
    document.getElementById("helptext").innerHTML = STR.help_progress;
};

shanka.inithelp_history = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_history_title);
    document.getElementById("helptext").innerHTML = STR.help_history;
};

shanka.inithelp_import = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_import_title);
    document.getElementById("helptext").innerHTML = STR.help_import;
};

shanka.inithelp_export = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_export_title);
    document.getElementById("helptext").innerHTML = STR.help_export;
};

shanka.inithelp_settings = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_settings_title);
    document.getElementById("helptext").innerHTML = STR.help_settings;
};

shanka.inithelp_queue = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_queue_title);
    document.getElementById("helptext").innerHTML = STR.help_queue;
};

shanka.inithelp_algorithms = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_algorithms_title);
    document.getElementById("helptext").innerHTML = STR.help_algorithms;
};

shanka.inithelp_questions = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_questions_title);
    document.getElementById("helptext").innerHTML = STR.help_questions;
};

shanka.inithelp_maintenance = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_maintenance_title);
    document.getElementById("helptext").innerHTML = STR.help_maintenance;
};

shanka.inithelp_wizard = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_wizard_title);
    document.getElementById("helptext").innerHTML = STR.help_wizard;
};

shanka.inithelp_about = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_about_title);
    document.getElementById("helptext").innerHTML = STR.help_about;
};

/*
    Shanka HSK Flashcards - version.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any dervied work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
/* chrome://appcache-internals/ */
shanka.getOnlineAppVersion = function() {
    return "0.26";
};

shanka.getOnlineAppBuildDate = function() {
    return "2014-03-14";
};

/*
    Shanka HSK Flashcards - ratchet.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/
// Initialisation code from the HTML file
// Helper
var $ = function(id) {
    return document.getElementById(id);
};

// Instance
var snapper = new Snap({
    element: document.getElementById("content"),
    disable: "right"
});

// 
var UpdateDrawers = function() {
    var state = snapper.state(), towards = state.info.towards, opening = state.info.opening;
    if (opening == "right" && towards == "left") {
        $("left-drawer").classList.remove("active-drawer");
    } else if (opening == "left" && towards == "right") {
        $("left-drawer").classList.add("active-drawer");
    }
};

snapper.on("drag", UpdateDrawers);

snapper.on("animating", UpdateDrawers);

snapper.on("animated", UpdateDrawers);

$("toggle-left").addEventListener("click", function() {
    shanka.showsidebarmenu();
});

$("help-button").addEventListener("click", function() {
    shanka.showhelp();
});

// appscroll 
var scroller = new AppScroll({
    toolbar: document.getElementsByClassName("bar-title")[0],
    scroller: document.getElementsByClassName("content")[0]
});

scroller.on();

shanka.switchtab = function(tabbutton, targetid) {
    var ul = tabbutton.parentElement;
    for (var i = 0, len = ul.children.length; i < len; i++) {
        var li = ul.children[i];
        if (li.id == tabbutton.id) {
            li.classList.add("active");
        } else /* if (li.nodeType == 1 && li.tagName.toLowerCase() == "li") */ {
            li.classList.remove("active");
        }
    }
    var target = document.getElementById(targetid);
    var ul = target.parentElement;
    for (var i = 0, len = ul.children.length; i < len; i++) {
        var li = ul.children[i];
        if (li.id == target.id) {
            li.classList.add("active");
        } else /* if (li.nodeType == 1 && li.tagName.toLowerCase() == "li") */ {
            li.classList.remove("active");
        }
    }
};

shanka.toggle = function(tbutton) {
    if (tbutton.classList.contains("radio")) {
        shanka.toggleradio(tbutton);
    } else if (tbutton.classList.contains("check")) {
        shanka.togglecheck(tbutton);
    } else if (tbutton.classList.contains("active")) {
        tbutton.classList.remove("active");
    } else {
        tbutton.classList.add("active");
    }
};

shanka.togglechild = function(item) {
    if (item.classList.contains("toggle") && !item.classList.contains("disabled")) {
        shanka.toggle(item);
    } else {
        for (var i = 0, len = item.children.length; i < len; i++) {
            if (item.children[i].classList.contains("toggle") && !item.children[i].classList.contains("disabled")) {
                shanka.toggle(item.children[i]);
            }
        }
    }
};

shanka.toggleradio = function(tbutton) {
    var active = tbutton.classList.contains("active");
    var group = tbutton.parentElement;
    while (group && !group.classList.contains("radiogroup")) {
        // if any parent element is disabled, just return without any action
        if (group.classList.contains("disabled")) {
            return;
        }
        group = group.parentElement;
    }
    if (group) {
        for (var i = 0, len = group.children.length; i < len; i++) {
            var groupchild = group.children[i];
            if (groupchild.classList.contains("toggle")) {
                groupchild.classList.remove("active");
            }
            for (var j = 0, lilen = groupchild.children.length; j < lilen; j++) {
                if (groupchild.children[j].classList.contains("toggle")) {
                    groupchild.children[j].classList.remove("active");
                }
            }
        }
    }
    var deselectallowed = tbutton.classList.contains("deselectallowed");
    if (!active) {
        tbutton.classList.add("active");
    } else if (deselectallowed) {
        tbutton.classList.remove("active");
    }
};

shanka.togglecheck = function(tbutton) {
    var disabled = tbutton.parentElement.classList.contains("disabled");
    if (disabled) {
        return;
    }
    var active = tbutton.classList.contains("active");
    var all = tbutton.classList.contains("all");
    var ul = tbutton.parentElement.parentElement;
    var allbutton = null;
    var allactive = true;
    if (!all) {
        if (active) {
            tbutton.classList.remove("active");
        } else {
            tbutton.classList.add("active");
        }
    }
    for (var i = 0, len = ul.children.length; i < len; i++) {
        var li = ul.children[i];
        for (var j = 0, lilen = li.children.length; j < lilen; j++) {
            if (li.children[j].classList.contains("toggle")) {
                if (all && active) {
                    li.children[j].classList.remove("active");
                } else if (all) {
                    li.children[j].classList.add("active");
                } else {
                    if (li.children[j].classList.contains("all")) {
                        allbutton = li.children[j];
                    } else {
                        allactive = allactive && li.children[j].classList.contains("active");
                    }
                }
            }
        }
    }
    if (allbutton) {
        if (allactive) {
            allbutton.classList.add("active");
        } else {
            allbutton.classList.remove("active");
        }
    }
};