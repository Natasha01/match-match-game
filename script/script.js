'use strict';

let whole_amount_of_cards,
    card_counter,
    match_cards = [],
    start_date,
    timerId,
    result_time = {},
    theme;

class Card {
    constructor(i, img, element) {
        this.img = img;
        this.i = i;
        this.element = element;
        this.element.addEventListener('click', () => flip(this));
        this.isShown = false;
    }
}

function flip(obj) {
    if (!obj.isShown) {
        obj.element.className = 'flipped' + ' ' + obj.i;
        obj.isShown = true;
        setTimeout(() => match(obj), 1000);
    }
}

function match(obj) {
    if ((match_cards[0] === undefined) && (match_cards[1] === undefined)) {    // if no card is open
        match_cards[0] = obj;
    } else {    // if one card is open
        match_cards[1] = obj;
        if (match_cards[0].i === match_cards[1].i) {  // if the cards coincided
            match_cards[0].element.className = 'unflipped coincided' + ' ' + match_cards[0].i;
            match_cards[1].element.className = 'unflipped coincided ' + ' ' + match_cards[1].i;
            card_counter -= 2;
            if (card_counter == 0) {
                setTimeout(gameOver(), 3000);
            }
        } else {
            match_cards[0].element.className = 'unflipped' + ' ' + match_cards[0].i;
            match_cards[1].element.className = 'unflipped' + ' ' + match_cards[1].i;
        }
        match_cards[0].isShown = false;
        match_cards[1].isShown = false;
        match_cards[0] = undefined;
        match_cards[1] = undefined;
    }
}

function compareRandom(a, b) {
    return Math.random() - 0.5;  // [-0.5 ... 0.5)
}

function randomArr(length) {
    let arr = [];
    for (let i = 1; i <= (length / 2); i++) {
        arr.push(i);
        arr.push(i);
    }
    arr.sort(compareRandom);
    return arr;
}

function updateTime() {
    let clock = document.getElementById('clock_div');
    let date = new Date();
    let minutes = date.getMinutes() - start_date.getMinutes();
    if (date.getMinutes() < start_date.getMinutes()) {
        minutes += 60;
    }
    let seconds = date.getSeconds() - start_date.getSeconds();
    if (date.getSeconds() < start_date.getSeconds()) {
        seconds += 60;
        minutes -= 1;
    }
    if (minutes < 10) { minutes = '0' + minutes; }
    clock.children[0].innerHTML = minutes;
    if (seconds < 10) { seconds = '0' + seconds; }
    clock.children[2].innerHTML = seconds;
}

function clockStart() {
    timerId = setInterval(updateTime, 1000);
    updateTime();
}

function clockStop() {
    clearInterval(timerId);
    timerId = null;
}

function showResultTime(sec) {
    let minutes = Math.floor(sec / 60);
    let seconds = sec - minutes * 60;
    let clock = document.getElementById('clock_div');
    if (minutes < 10) { minutes = '0' + minutes; }
    clock.children[0].innerHTML = minutes;
    if (seconds < 10) { seconds = '0' + seconds; }
    clock.children[2].innerHTML = seconds;
    return minutes + ':' + seconds;
}

function validate() {
    let elems = document.forms.init.elements;
    if (!elems.firstname.value) { elems.firstname.className = 'error'; }
    else { elems.firstname.className = ''; }
    if (!elems.lastname.value) { elems.lastname.className = 'error'; }
    else { elems.lastname.className = ''; }
    if (!elems.email.value) { elems.email.className = 'error'; }
    else { elems.email.className = ''; }

    let rad = document.getElementsByName('theme');
    for (var i = 0; i < rad.length; i++) {
        if (rad[i].checked) {
            theme = rad[i].value;
        }
    }
    rad = document.getElementsByName('difficulty');
    for (var i = 0; i < rad.length; i++) {
        if (rad[i].checked) {
            whole_amount_of_cards = Number(rad[i].value);
        }
    }

    if (elems.firstname.value && elems.lastname.value && elems.email.value) {
        window.localStorage.setItem("firstname", elems.firstname.value);
        window.localStorage.setItem("lastname", elems.lastname.value);
        window.localStorage.setItem("email", elems.email.value);
        document.querySelector('header').style.backgroundImage = 'url(./images/' + theme + '/bg.jpg)';
        newField();
    }
}

function greeting() {
    document.getElementById('greeting').innerHTML = 'Hello, ' + window.localStorage.getItem('firstname') + ' ' + window.localStorage.getItem('lastname') + '!';
}

function newField() {
    greeting();
    document.getElementById('field').innerHTML = '';
    card_counter = whole_amount_of_cards;
    document.getElementById('start').style.display = 'none';
    let arr_of_cards = randomArr(whole_amount_of_cards);
    for (let i = 0; i <= (whole_amount_of_cards - 1); i++) {
        let div = document.createElement('div');
        div.className = String(arr_of_cards[i]);
        div.innerHTML = '<img src="images/' + theme + '/' + (arr_of_cards[i]) + '.jpg" alt=":(" width="100%">';
        document.getElementById('field').appendChild(div);
        let card = new Card(arr_of_cards[i], div.innerHTML, div);
    }
    match_cards[0] = undefined;
    match_cards[1] = undefined;
    start_date = new Date();
    clockStart();
}

function checkRecords(time) {
    let record_table;
    if (window.localStorage.getItem('records' + whole_amount_of_cards)) {
        record_table = JSON.parse(window.localStorage.getItem('records' + whole_amount_of_cards));
        if (time < record_table[4][2]) {
            record_table[4][0] = window.localStorage.getItem('firstname') + ' ' + window.localStorage.getItem('lastname');
            record_table[4][1] = whole_amount_of_cards;
            record_table[4][2] = time;
            record_table = record_table.sort(function (a, b) {
                return a[2] - b[2];
            });
            window.localStorage.setItem('records' + whole_amount_of_cards, JSON.stringify(record_table));
        }
    } else {
        record_table = new Array();
        let row = 5, col = 3;
        for (let i = 0; i < row; i++) {
            record_table[i] = new Array(col);
            record_table[i][2] = 3600;
        }
        record_table[0][0] = window.localStorage.getItem('firstname') + ' ' + window.localStorage.getItem('lastname');
        record_table[0][1] = whole_amount_of_cards;
        record_table[0][2] = time;
        window.localStorage.setItem('records' + whole_amount_of_cards, JSON.stringify(record_table));
    }
}

function gameOver() {
    clockStop();
    result_time.min = document.querySelector('.minutes').innerHTML;
    result_time.sec = document.querySelector('.seconds').innerHTML;
    checkRecords(result_time.min * 60 + result_time.sec);
    
    document.querySelector('.the_end').style.display = 'block';
    let table = document.querySelector('.records');
    let record_table = JSON.parse(window.localStorage.getItem('records' + whole_amount_of_cards));
    for (let i = 0; i < 5; i++) {
        if (record_table[i][2] == 3600) break;
        table.rows[i].cells[1].innerHTML = record_table[i][0];
        table.rows[i].cells[2].innerHTML = showResultTime(record_table[i][2]);
    }
    document.querySelector('.result_time').innerHTML = 'Your resultant time: ' + result_time.min + ':' + result_time.sec;
}

function closeRecords() {
    document.querySelector('.the_end').style.display = 'none';
}