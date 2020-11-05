import {americanOnly} from './american-only.js';
import {britishOnly} from './british-only.js';
import {americanToBritishSpelling} from './american-to-british-spelling.js';
import {americanToBritishTitles} from './american-to-british-titles.js';

const britishToAmericanSpelling = Object.fromEntries(Object.entries(americanToBritishSpelling).map(([k, v]) => [v, k]));
const britishToAmericanTitles = Object.fromEntries(Object.entries(americanToBritishTitles).map(([k, v]) => [v, k]));

const Locales = {
  us: 'american-to-british',
  uk: 'british-to-american',
}

const Dictionaries = {
  [Locales.us]: {
    titles: americanToBritishTitles,
    spelling: americanToBritishSpelling,
    phrases: americanOnly,
    time: (h, s) => s.replace(/(\d+):(\d+)/g,
      wrapHighlight(h, '$1:$2', '$1.$2')),
  },
  [Locales.uk]: {
    titles: britishToAmericanTitles,
    spelling: britishToAmericanSpelling,
    phrases: britishOnly,
    time: (h, s) => s.replace(/(\d+).(\d+)/g,
      wrapHighlight(h, '$1.$2', "$1:$2")),
  }
}

const wrapHighlight = (highlight, from, to) =>
  highlight ? `<span class="highlight" title="${from}">${to}</span>` : to


const translatePhrases = (sentence, locale, highlight = false) => {
  Object.entries(Dictionaries[locale].phrases).forEach(
    ([fromLocaleTitle, toLocaleTitle]) => {
      fromLocaleTitle = fromLocaleTitle.replace('.', '\.');
      const fromLocaleMatcher = new RegExp(`(?<!-)${fromLocaleTitle}\\.?\\b`, 'ig');
      toLocaleTitle
      if (fromLocaleMatcher.test(sentence)) {
        sentence = sentence.replace(
          fromLocaleMatcher,
          wrapHighlight(highlight, fromLocaleTitle, toLocaleTitle)
        );
      }
    });
  return sentence;
}
const translateSpelling = (sentence, locale, highlight = false) => {
  const dict = Dictionaries[locale].spelling;
  return sentence.split(' ').map(v => {
    return dict[v.toLowerCase()] ?
      wrapHighlight(highlight, v, dict[v.toLowerCase()]) : v
  }).join(' ');
}
const translateTitles = (sentence, locale, highlight = false) => {
  const dict = Dictionaries[locale].titles;
  return sentence.split(' ').map(v => {
    return dict[v.toLowerCase()] ?
      wrapHighlight(highlight, v, dict[v.toLowerCase()].charAt(0).toUpperCase() + dict[v.toLowerCase()].slice(1)) : v
  }).join(' ');
}
const TranslateTimes = (sentence, locale, highlight = false) => {
  const dict = Dictionaries[locale].time;
  return dict(highlight, sentence)
}

/**
 * Translates a sentence from American to British or vice versa.
 * @param {string} sentence American or British English text
 * @param {string} locale
 * @param {bool} highlight Direction of translation
 * @return {string} 
 */
function TranslateSentence(sentence, locale, highlight = false) {
  sentence = translatePhrases(sentence, locale, highlight);
  sentence = translateSpelling(sentence, locale, highlight);
  sentence = translateTitles(sentence, locale, highlight);
  sentence = TranslateTimes(sentence, locale, highlight);
  return sentence;
}

const translateButton = document.getElementById('translate-btn');
const clearButton = document.getElementById('clear-btn');
const localeSelection = document.getElementById('locale-select');
const sentenceInput = document.getElementById('text-input');
const translationDiv = document.getElementById('translated-sentence');
const errorDiv = document.getElementById('error-msg');

const ErrNoText = "Error: No text to translate.";
const NoChange = "Everything looks good to me!";

function clear() {
  console.log("Clear clicked");
  sentenceInput.value = '';
  errorDiv.innerHTML = '';
  translationDiv.innerHTML = '';
}

function translate() {
  console.log('Translate Clicked')
  const sentence = sentenceInput.value;
  const locale = localeSelection.value;
  translationDiv.innerHTML = '';
  errorDiv.innerHTML = '';
  if (!sentence) return errorDiv.innerHTML = ErrNoText;
  const translation = TranslateSentence(sentence, locale, true);
  translationDiv.innerHTML = translation === sentence ? NoChange : translation;

}


document.addEventListener("DOMContentLoaded", () => {
  clearButton.addEventListener('click', clear)
  translateButton.addEventListener('click', translate);
})

/* 
  Export your functions for testing in Node.
  Note: The `try` block is to prevent errors on
  the client side
*/
try {
  module.exports = {
    translate,
    clear,
    Locales,
    TranslateSentence
  }
} catch (e) {}
