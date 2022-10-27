# Parser Creation Test

This test's goal is to evaluate your capacity at creating parsers. Parsers are samples of code that are designed to extract information from various sources. In that case you will have to extract information from an email's HTML that have been anonymised.

# How to do the test?

Run `yarn install` or `npm install`.

You are expected to write your code `main.js` in the root folder. Expected results are located in the `expectedResults.js` file.

You must use Vanilla JS and regex to extract information from samples. You have NOT access to the DOM (don’t use window.getElementFromId for example)

To check your results when you're done run `yarn test` or `npm run test` depending on what tool you use.

All the test must pass in order for the test to be considered complete. We expect something that is legible and comprehensible by a regular software developper.

Good luck !

# Overview

- Step 1: The parser clean the HTML;
- Step 2: The parser extract the informations from the HTML;
- Step 3: The parser cleans and normalizes the data.

# Extraction overview

To extract the information from the HTML, the parser uses regex to find some specific words and numbers in the inner HTML. After that, the parser calculates the score between words and numbers based on the physical and html position. The parser can give a confidence score.

# Advantages and Limitations

An advantage of this parser is that it can be improved by no-technical people. The parser can be improved by:

- adding new words in the `infos.js` file;
- adding new currencies in the `infos.js` file.

A disadvantage of this parser is that it depends on the word in the inner html. So it depends on the language. More the array of words in `infos.js` file is big and more there can be false positives.

# Improvements

A very easy improvement can be to detect the language of the document and adapt the array of words in `infos.js` file.
