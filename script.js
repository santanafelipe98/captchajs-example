/**
 * Author:     Felipe Santana
 * Created:    04.08.2021
 * (c) Copyright
 * An example of a simple CAPTCHA system made with Vanilla JS
 */

const STORAGE_KEY = '@captchajs';

/**
 * Generates a random number between min and max range
 * @param {Number} min 
 * @param {Number} max 
 * @returns Number - random number between {min} and {max}
 */
function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

/**
 * Generates a random set of characters with the given length
 * @param {Number} length 
 * @returns String - random set of characters
 */
function generateRandomCharacters(length = 6) {
    const charTable = 'abcdefghijklmnopqrstuvxwyz0123456789';

    let word = '';

    for (let i = 0; i < length; i++) {
        let randomRangeNum = Math.round((Math.random() * (charTable.length - 1)));
        word += charTable.charAt(randomRangeNum);
    }

    return word;
}

/**
 * Creates a new CAPTCHA component
 * @param {any} props 
 * @returns HTMLElement - the CAPTCHA element
 */
function buildComponent({
    submit
}) {
    const id = Date.now().toString(16);

    const captchaEl = document.createElement('div');
    captchaEl.id = id;
    captchaEl.classList.add('captcha');

    const text1     = document.createElement('p');
    text1.innerHTML = 'To continue, type the characters you see in the picture.';

    const wrapper = document.createElement('div');
    wrapper.classList.add('canvas-captcha-wrapper');

    const canvasEl = document.createElement('canvas');
    canvasEl.setAttribute('width', 200);
    canvasEl.setAttribute('height', 64);
    canvasEl.classList.add('captcha-canvas');

    const context = canvasEl.getContext('2d');

    const text2 = document.createElement('p');
    text2.innerHTML = 'The picture contains {x} characters.';

    const buttonChangeEl = document.createElement('button');
    buttonChangeEl.innerHTML = 'R';
    buttonChangeEl.classList.add('captcha-button');
    buttonChangeEl.classList.add('captcha-button-change');
    buttonChangeEl.addEventListener('click', () => {
        generateCaptcha(id, inputEl, context);
    });

    const inputEl = document.createElement('input');
    inputEl.classList.add('captcha-input');

    const messageEl = document.createElement('p');
    messageEl.classList.add('captcha-message');

    const buttonContinueEl = document.createElement('button');
    buttonContinueEl.innerHTML = 'Continue';
    buttonContinueEl.classList.add('captcha-button')
    buttonContinueEl.classList.add('captcha-button-continue');

    wrapper.append(canvasEl);
    wrapper.append(buttonChangeEl);

    captchaEl.append(text1);
    captchaEl.append(wrapper);
    captchaEl.append(text2);
    captchaEl.append(inputEl);
    captchaEl.append(messageEl);
    captchaEl.append(buttonContinueEl);

    generateCaptcha(id, inputEl, context);

    buttonContinueEl.addEventListener('click', () => {
        let word = inputEl.value.toLowerCase();
        let wordHash = word.toString(16);

        try {
            if (compareCaptcha(id, wordHash)) {
                showMessage(messageEl, 'It\'s everything fine.', 'success');
                submit();
            } else {
                const err = new Error('Looks like you typed in the wrong word - try again.');

                generateCaptcha(id, inputEl, context);

                showMessage(messageEl, err.message, 'error');
                submit(err);
            }
        } catch (err) {
            generateCaptcha(id, inputEl, context);

            showMessage(messageEl, err.message, 'error');
            submit(err);
        }
    });

    return captchaEl;
}

/**
 * Clear input value
 * @param {HTMLInputElement} inputEl 
 */
function clearText(inputEl) {
    inputEl.value = '';
}

/**
 * Set CAPTCHA hash
 * @param {String} captchaId 
 * @param {String} hash 
 */
function setCaptchaHash(captchaId, hash) {
    if (localStorage) {
        let captchaJSData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        
        if (captchaJSData) {
            captchaJSData[captchaId] = hash;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(captchaJSData));
    }
}

/**
 * Verify if the CAPTCHA hash is equivalent to the entered hash
 * @param {String} captchaId 
 * @param {String} wordHash 
 * @returns boolean - comparison result
 */
function compareCaptcha(captchaId, wordHash) {
    if (localStorage) {
        let captchaJSData = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (captchaJSData) {
            let hash = captchaJSData[captchaId];

            return hash === wordHash;
        }

        return false;
    }

    throw new Error('There is no such captcha\'s hash for this captcha\'s id.');
}

/**
 * Renders the CAPTCHA picture on canvas
 * @param {CanvasRenderingContext2D} context 
 * @param {String} str 
 * @param {any} fontStyle 
 */
function renderCaptcha(context, str, fontStyle) {
    context.resetTransform();
    context.clearRect(0, 0, 200, 64);

    for (let i = 0; i < str.length; i++) {

        //Draw background lines

        for (let j = 0; j < 2; j++) {
            let x1 = randomRange(j * 4, 200 - j * 4);
            let y1 = 0;
            let x2 = randomRange(j * 4, 200 - j * 4);
            let y2 = 64;

            context.strokeStyle = 'lightblue';
            context.resetTransform();

            context.beginPath();
            context.moveTo(x1, y1)
            context.lineTo(x2, y2)
            context.stroke();
        }

        let isUpper = (Math.round(Math.random()) === 1) ? true : false;
        let char = (isUpper) ? str.charAt(i).toUpperCase() : str.charAt(i);

        context.font = fontStyle;

        let vs = randomRange(-.2, .2);
        let hs = randomRange(-.2, .2);

        context.resetTransform();
        context.transform(1, vs, hs, 1, 0, 0);

        let lineHeight = randomRange(-2, 2);
        context.strokeStyle = 'darkblue';
        context.strokeText(char, 20 + i * 20, 40 + lineHeight);
    }
}

/**
 * Shows a feedback message
 * @param {HTMLElement} messageEl 
 * @param {String} string 
 * @param {String} type 
 */
function showMessage(messageEl, string, type) {
    if (type === 'error') {
        messageEl.innerHTML = string;
        messageEl.classList.remove('message-success');
        messageEl.classList.add('message-error');
    } else {
        messageEl.innerHTML = string;

        messageEl.classList.remove('message-error');
        messageEl.classList.add('message-success');
    }
}

/**
 * Generates and render a new CAPTCHA picture
 * @param {HTMLElement} captchaId 
 * @param {HTMLInputElement} inputEl 
 * @param {CanvasRenderingContext2D} context 
 */
function generateCaptcha(captchaId, inputEl, context) {
    const word = generateRandomCharacters();
    const hash = word.toString(16);

    setCaptchaHash(captchaId, hash);

    renderCaptcha(context, word, '24px bold serif');
    clearText(inputEl);
}