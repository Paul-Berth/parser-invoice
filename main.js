const fs = require('fs');

function cleanStr(str) {
  return str.replace(/\s+/g, ' ').trim();
}

function regexHtml(tag, classAttr) {
  return new RegExp(
    `<${tag}[^>]*?class="[^"]*?${classAttr}[^"]*?"[^>]*?>(.*?)</${tag}>`,
    'gi'
  );
}

function parseSample(sample) {
  const regexComments = /<!--.*?-->/gi;
  const regexStyle = /<style.*?>.*?<\/style>/gi;
  const regexAddress = regexHtml('span', 'add');

  // 1 -- CLEAN (remove comments and css)
  let html = sample.html.replace(regexComments, '');
  html = html.replace(regexStyle, '');
  fs.writeFile('./newhtml.html', html, (err) => {
    if (err) {
      console.error(err);
    }
  });

  // 2 -- ADDRESS (address tag)
  const results = [...html.matchAll(regexAddress)];
  console.log('results.length = ', results.length);
  console.log(results.map((e) => [e[0], cleanStr(e[1]), e.index]));

  // 3 -- TIME (time tag)

  // 4 -- CURRENCY (price tag)

  // 5 -- DISTANCE (distance tag)

  // 6 -- DISTANCEFEE (distance tag)

  // 7 -- DISTANCEUNIT (distance tag)

  // 8 -- DURATION ('durée' in text)

  // 9 -- TIMEFEE ('temps' in text && price tag)

  // 10 -- TOTALPRICEPAID (price final-charge | totalPrice tag)

  return {};
}

const sample1 = require('./samples/sample_test').default;
parseSample(sample1);

exports.parseSample = parseSample;
