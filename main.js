const fs = require('fs');

function cleanStr(str) {
  return str.replace(/\s+/g, ' ').trim();
}

function regexHtml(tag, classAttr) {
  return new RegExp(
    `<${tag}[^>]*?class="[^"]*?(?:${classAttr.join(
      '|'
    )})[^"]*?"[^>]*?>(.*?)</${tag}>`,
    'gi'
  );
}

function cleanHtml(html, writeFile = false) {
  const regexComments = /<!--.*?-->/gi;
  const regexStyle = /<style.*?>.*?<\/style>/gi;

  html = html.replace(regexComments, '');
  html = html.replace(regexStyle, '');
  if (writeFile) {
    fs.writeFile('./newhtml.html', html, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
  return html;
}

function getAddTime(html) {
  const regexTime = /(\d+:\d+)/gi;
  const regexInnerHtmlStart = /^([^<]+?)/gi;
  const regexInnerHtmlEnd = /([^>]+?)$/gi;
  const regexTdAddress = regexHtml('td', ['time', '\\baddress\\b']);
  const regexSpanTime = regexHtml('span', ['time']);
  const regexSpanAddress = regexHtml('span', ['address']);

  const results = {
    arrivalAddress: '',
    arrivalTime: '',
    departureAddress: '',
    departureTime: '',
  };
  const tdAddress = [...html.matchAll(regexTdAddress)];
  // console.log('results.length = ', tdAddress.length);
  // console.log(tdAddress.map((e) => [e[0], cleanStr(e[1]), e.index]));
  for (let i = 0; i < tdAddress.length; i++) {
    const isDeparture =
      results.departureTime == '' && results.departureAddress == '';
    const innerTd = tdAddress?.[i]?.[1] || '';

    // Get innerHTML
    const innerHtmlStart = cleanStr(
      [...innerTd.matchAll(regexInnerHtmlStart)]?.[0]?.[1] || ''
    );
    const innerHtmlEnd = cleanStr(
      [...innerTd.matchAll(regexInnerHtmlEnd)]?.[0]?.[1]?.trim() || ''
    );
    innerHtmlStart != ''
      ? (timeOrAddress = innerHtmlStart)
      : (timeOrAddress = innerHtmlEnd);
    let timeInnerHtml = timeOrAddress.match(regexTime)?.[0] || '';
    isDeparture
      ? timeInnerHtml == ''
        ? (results.departureAddress = timeOrAddress)
        : (results.departureTime = timeInnerHtml)
      : timeInnerHtml == ''
      ? (results.arrivalAddress = timeOrAddress)
      : (results.arrivalTime = timeInnerHtml);

    // Get Span with time tag
    const spanTime = [...innerTd.matchAll(regexSpanTime)];
    let time = cleanStr(spanTime?.[0]?.[1] || '');
    time = time.match(regexTime)?.[0] || '';
    time != '' &&
      (isDeparture
        ? (results.departureTime = time)
        : (results.arrivalTime = time));

    // Get Span with address tag
    const spanAddress = [...innerTd.matchAll(regexSpanAddress)];
    const address = cleanStr(spanAddress?.[0]?.[1] || '');
    address != '' &&
      (isDeparture
        ? (results.departureAddress = address)
        : (results.arrivalAddress = address));
  }
  return results;
}

function parseSample(sample) {
  let results = {
    arrivalAddress: '',
    arrivalTime: '',
    departureAddress: '',
    departureTime: '',
  };

  // 1 -- CLEAN (remove comments and css)
  const html = cleanHtml(sample.html);

  // 2 -- ADDRESS && TIME (td address && time)
  const resultsAddTime = getAddTime(html);
  results = { ...results, ...resultsAddTime };

  // 2 -- DISTANCE (distance tag)

  // 3 -- DISTANCEUNIT (distance tag)

  // 4 -- DURATION ('durée' in text)

  // 5 -- DISTANCEFEE (distance tag)

  // 6 -- TIMEFEE ('temps' in text && price tag)

  // 7 -- TOTALPRICEPAID (price final-charge | totalPrice tag)

  // 8 -- CURRENCY (price tag)

  console.log(results);
  return {};
}

const sample1 = require('./samples/sample_3').default;
parseSample(sample1);

exports.parseSample = parseSample;
