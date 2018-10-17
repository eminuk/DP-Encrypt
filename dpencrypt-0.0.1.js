/**
 * Decrypt-format Preserving Encryption
 */
var dpEncript = new function () {
    // Property
    const _NK = 16;
    const _NR = 24;
    const _DELTA = new Uint32Array([0xc3efe9db, 0x44626b02, 0x79e27c8a, 0x78df30ec, 0x715ea49e, 0xc785da0a, 0xe04ef22a, 0xe5c40957]);

    // Constructor
    (function () {
    })();

    // Method - private
    /**
     * Key schedule - 128 bit encryption 
     */
    function _keyScheduleEnc128(k) {
        var rtn = [];
        var t = _bArrToWArr(k, 4);
        for(var i = 0, len = _NR; i < len; i++) {
            t[0] = _rol32Bit(t[0] + _rol32Bit(_DELTA[i % 4], i), 1);
            t[1] = _rol32Bit(t[1] + _rol32Bit(_DELTA[i % 4], i + 1), 3);
            t[2] = _rol32Bit(t[2] + _rol32Bit(_DELTA[i % 4], i + 2), 6);
            t[3] = _rol32Bit(t[3] + _rol32Bit(_DELTA[i % 4], i + 3), 11);
            rtn[i] = new Uint32Array([t[0], t[1], t[2], t[1], t[3], t[1]]);
        }
        return rtn;
    }
    /**
     * Key schedule - 128 bit decryption 
     */
    function _keyScheduleDec128(k) {
        var rtn = [];
        var t = _bArrToWArr(k, 4);
        for(var i = 0, len = _NR; i < len; i++) {
            t[0] = _rol32Bit(t[0] + _rol32Bit(_DELTA[i % 4], i), 1);
            t[1] = _rol32Bit(t[1] + _rol32Bit(_DELTA[i % 4], i + 1), 3);
            t[2] = _rol32Bit(t[2] + _rol32Bit(_DELTA[i % 4], i + 2), 6);
            t[3] = _rol32Bit(t[3] + _rol32Bit(_DELTA[i % 4], i + 3), 11);
            rtn[_NR - 1 - i] = new Uint32Array([t[0], t[1], t[2], t[1], t[3], t[1]]);
        }
        return rtn;
    }
    /**
     * Round function - encrypt
     */
    function _roundEnc(x, rk) {
        var rtn = new Uint32Array(4);
        rtn[0] = _rol32Bit((x[0] ^ rk[0]) + (x[1] ^ rk[1]), 9);
        rtn[1] = _ror32Bit((x[1] ^ rk[2]) + (x[2] ^ rk[3]), 5);
        rtn[2] = _ror32Bit((x[2] ^ rk[4]) + (x[3] ^ rk[5]), 3);
        rtn[3] = x[0];
        return rtn;
    }
    /**
     * Round function - decrypt
     */
    function _roundDec(x, rk) {
        var rtn = new Uint32Array(4);
        rtn[0] = x[3];
        rtn[1] = (_ror32Bit(x[0], 9) - (rtn[0] ^ rk[0])) ^ rk[1];
        rtn[2] = (_rol32Bit(x[1], 5) - (rtn[1] ^ rk[2])) ^ rk[3];
        rtn[3] = (_rol32Bit(x[2], 3) - (rtn[2] ^ rk[4])) ^ rk[5];
        return rtn;
    }
    /**
     * Byte array to ward Array
     */
    function _bArrToWArr(b_arr, n) {
        var w_arr = new Uint32Array(n);
        var temp = "";
        for (var i = 0; i < n; i++) {
            temp = b_arr.substr((4 * i + 3) * 2, 2);
            temp += b_arr.substr((4 * i + 2) * 2, 2);
            temp += b_arr.substr((4 * i + 1) * 2, 2);
            temp += b_arr.substr((4 * i) * 2, 2);
            w_arr[i] = parseInt(temp, 16);
        }
        return w_arr;
    }
    /**
     * Ward Array to byte array
     * @param {*} w_arr 
     * @param {*} n 
     */
    function _wArrToBArr(w_arr, n) {
        var b_arr = "";
        var temp = "";
        for (var i = 0, len = w_arr.length; i < len; i++){
            temp = ("00000000" + w_arr[i].toString(16)).slice(-8);
            b_arr += temp.substr(6, 2);
            b_arr += temp.substr(4, 2);
            b_arr += temp.substr(2, 2);
            b_arr += temp.substr(0, 2);
        }
        return b_arr;
    }
    /**
     * rotateShiftLeft
     */
    function _rol32Bit(param, shift) {
        var uint = new Uint32Array(1);
        uint[0] = (param << shift) | (param >>> (32 - shift));
        return uint[0];
    }
    /**
     * rotateShiftLeft
     */
    function _ror32Bit(param, shift) {
        var uint = new Uint32Array(1);
        uint[0] = (param >>> shift) | (param << (32 - shift));
        return uint[0];
    }
    /**
     * convert to byteString from string
     * @param {*} param 
     */
    function _stringToBArr(param) {
        var rtn = "";
        for (var i = 0, len = param.length; i < len; i++) {
            rtn += ('000' + param.charCodeAt(i).toString(16)).slice(-4);
        }
        rtn = ('00000000000000000000000000000000' + rtn).slice(-32);
        
        return rtn;
    }
    /**
     * convert to string from byteString
     * @param {*} param 
     */
    function _bArrToString(param) {
        var rtn = "";
        var hex = param.match(/.{1,4}/g) || [];
        for (var i = 0, len = hex.length; i < len; i++) {
            rtn += String.fromCharCode(parseInt(hex[i], 16));
        }
        return rtn;
    }
    function _numberToBArr(param) {
        var rtn = "";
        var num = Number(String(Math.floor(Math.random() * 42) + 1) + ("00000000" + String(param)).slice(-8));
        rtn = ("00000000" + num.toString(16)).slice(-8);
        return rtn;
    }
    function _bArrToNumber(param) {
        var rtn = "";
        rtn = String(parseInt(param.substr(0,8), 16)).slice(-8);
        return rtn;
    }
    /**
     * Write console.log to byte format
     * @param {byte array} arr 
     */
    function _consoleLogto16(arr) {
        var temp = "";
        for (var i = 0, len = arr.length; i < len; i++) {
            temp += " " + ("00000000" + arr[i].toString(16)).slice(-8);
        }
        temp = temp.slice(1);
        console.log(temp);
    }

    // Method - public
    /**
     * Encrypt
     */
    function encrypt(plaintext, password) {
        if (isNaN(plaintext) || !password) {
            return undefined;
        }

        // Make plain byte
        var plain = _numberToBArr(plaintext);

        // Create encrypt round key
        var k_byte = _stringToBArr(password);
        var rk = _keyScheduleEnc128(k_byte);

        // Do encrypt
        var x = [];
        x[0] = _bArrToWArr(plain, 4);
        for (var i = 0; i < _NR; i++) {
            x[i + 1] = _roundEnc(x[i], rk[i]);
        }
        
        // Response result - encodeing base64
        var rtn = _wArrToBArr(x[_NR]);
        return btoa(rtn);
    }
    /**
     * Decrypt
     * @param {*} ciphertext 
     * @param {*} password 
     */
    function decrypt(ciphertext, password) {
        if (!password) {
            return undefined;
        }

        // Decodeing base64
        var cipher = atob(ciphertext);

        // Create decrypt round key
        var k_byte = _stringToBArr(password);
        var rk = _keyScheduleDec128(k_byte);

        // Do decrypt
        var x = [];
        x[0] = _bArrToWArr(cipher, 4);
        for (var i = 0; i < _NR; i++) {
            x[i + 1] = _roundDec(x[i], rk[i]);
        }
        
        // Response result
        var rtn = _wArrToBArr(x[_NR]);
        return _bArrToNumber(rtn);
    }

    // Set public objects
    return {
        encrypt: encrypt,
        decrypt: decrypt
    };
};
//*/
