const fs = require('fs');
const { connected } = require("process");
const { NAME_MAP } = require('./prefix-map');

const NUMBERS = new Set(['1','2','3','4','5','6','7','8','9','0']);

const cPrefixes = parseCountryPrefixes('country-prefixes.txt');
const cStations = parseCountryStations('country-stations.txt');
//const joined = joinStationPrefixes(cPrefixes, cStations);

const prefixList = parsePrefixList('prefix-list.txt');
const prefixMap = refinePrefixList(prefixList);
console.log(cStations);

// cPrefixes.sort((a, b) => {
//   if (a.continent > b.continent) return 1;
//   if (a.continent < b.continent) return -1;
//   if (a.name > b.name) return 1;
//   if (a.name < b.name) return -1;
//   return 0;
// })
// .forEach(entry => {
//   console.log(entry.continent, entry.name);
// });

// Object
//   .entries(prefixMap)
//   .sort((a, b) => a[0].localeCompare(b[0]))
//   .forEach(([name, value]) => {
//     const prefixes = value.sort((a, b) => a >= b);
//     console.log(name, compressPrefixes(prefixes))
//   });

const prefixFile = Object
  .entries(prefixMap)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([name, prefixes]) => {
    const deduped =  [...new Set(prefixes)];
    const sorted = deduped.sort((a, b) => a.localeCompare(b));
    const prefix = compressPrefixes(sorted).join(',');
    //const prefix = sorted.join(',');

    return { name, prefix };
  });

fs.writeFileSync(
  'country-prefixes.json', 
  JSON.stringify(cPrefixes, null, '  '),
  'utf8'
);

fs.writeFileSync(
  'country-stations.json', 
  JSON.stringify(cStations, null, '  '),
  'utf8'
);

fs.writeFileSync(
  'prefix-list.json', 
  JSON.stringify(prefixList, null, '  '),
  'utf8'
);

fs.writeFileSync(
  'prefixes.json', 
  JSON.stringify(prefixFile, null, '  '),
  'utf8'
);

fs.writeFileSync(
  'prefixes.txt', 
  prefixFile.map(entry => 
    `${entry.name}=${entry.prefix}`
  ).join('|'),
  'utf8'
);



// Object.values(joined)
//   .sort((a, b) => b.total - a.total)
//   .forEach((station, i) => {
//     console.log(i, station.name, station.total);
//     station.cPrefixes.forEach(prefix => {
//       console.log('  ', prefix.name, '===', prefix.prefix);
//     });
//   });

//console.log(JSON.stringify(joined, null, '  '));
// console.log(cStations.length, cPrefixes.length);

/**
 * Compress array of prefixes
 **/
function compressPrefixes(prefixes) {
  const nodes = new Set();
  const rules = [];
  let sequence = [];

  function isSequence(prefix) {
    let next = prefix;

    if (sequence.length) {
      const end = sequence.length - 1;
      next = nextPrefix(sequence[end]);
    }
    return prefix === next;
  }

  function nextPrefix(prefix) { 
    const end = prefix.length - 1;
    const code = prefix.charCodeAt(end);

    return prefix.substring(0, end) 
      + String.fromCharCode(code + 1); 
  }

  function addRule(prefix = '') {
    if (sequence.length === 1) {
      rules.push(sequence.pop());
    }
    else if (sequence.length > 1) {
      rules.push(sequence.shift() + '-' + sequence.pop());
    }
    len = 0;
    sequence = [prefix];
  }

  function isNodeOf(prefix) {
    if (prefix.length > 1) {
      const end = prefix.length - 1;
      const beg = prefix.substring(0, end);
      
      if (NUMBERS.has(prefix[end]) 
        && nodes.has(beg)
      ) {
        return true;
      }
    }
    nodes.add(prefix);
    return false;
  }

  prefixes.forEach(prefix => {
    if (!isNodeOf(prefix)) {
      isSequence(prefix)
        ? sequence.push(prefix)
        : addRule(prefix);
    }
  });
  addRule();

  return rules;
}

/**
 * Refine the prefixList
 **/
function refinePrefixList(prefixList) {
  return prefixList.reduce((map, { prefix, country }) => {
    if (!/Prefix no longer used/i.test(country)
      && !/Not allocated by ITU/i.test(country)
      && !/Optionally replaced/i.test(country)
      && !/Special/i.test(country)
      && !/Commercial/i.test(country)
    ) {
      const name = country.replace(/\(.*/, '').trim();
      const entry = map[name] || [];
      const parts = prefix
        .replace(/\s+to\s+/gim, '-')
        .split(/[, ]+/)
        .map(prefix => prefix.trim())
        .filter(prefix => /^([a-z]{1,2}|[a-z][0-9]|[0-9][a-z]|[a-z][a-z][0-9])$/i.test(prefix)
        //  && !/\d|[a-zA-Z]{3}/.test(prefix)
        );
      
      if (parts.length) {
        map[name] = entry.concat(parts);
      }
    }
    return map;
  }, {});
}

/**
 * Parse Prefix List
 **/
function parsePrefixList(fileName) {
  return fs 
    .readFileSync(fileName, 'utf8')
    .split(/\r?\n/)
    .filter(line => line && !/^\s*#/.test(line))
    .reduce((out, line) => {
      const prefix = line.substring(0, 14).replace(/ø/gm, '0').trim();
      const country = line.substring(15, 75).trim();
      const cq = line.substring(75, 79).trim();
      const itu = line.substring(79, 82).trim();

      if (prefix) {
        out.prefix.push(prefix);

        if (country) {
          out.list.push({ 
            prefix: out.prefix.join(' '), 
            country, 
            cq, 
            itu 
          });
          out.prefix = [];
        }
        else {
          out.prefix.push(prefix);
        }
      }
      else if (country) {
        const end = out.list[out.list.length - 1];

        end.country += ' ' + country;
        end.cq = cq;
        end.itu = itu;
      }

      return out;
    }, { prefix: [], list: [] }).list;
}

/**
 * Parse Country Prefixes
 **/
function parseCountryPrefixes(fileName) {
  return fs
    .readFileSync(fileName, 'utf8')
    .split(/\r?\n/)
    .map(country => {
      const [name, prefix, continent] = country.split(/\t/);
      return { name, prefix, continent };
    });
}

/**
 * Join Station and Prefix arrays
 **/
function joinStationPrefixes(cPrefixes, cStations) {
  return cPrefixes.reduce((out, prefix) => {
    let pname = prefix.name.toLowerCase();
    const mapping = NAME_MAP[prefix.name];
    let found;
  
    if (mapping) {
      if (mapping !== '?') {
        found = cStations.find(station => 
          mapping === station.name
        );
      }
    }
    else {
      let x;
  
      for (x = 0; x < cStations.length; x++) {
        const station = cStations[x];
        const sname = station.name.toLowerCase();
  
        if (pname.includes(sname)) {
          found = station;
          break;
        }
      }
    }
    if (found) {
      out[found.name] = found;
      if (!found.cPrefixes) {
        found.cPrefixes = [];
      }
      found.cPrefixes.push(prefix);
    }
    return out;
  }, {});
}

/**
 * Parse Country Stations
 **/
function parseCountryStations(fileName) {
  return fs
    .readFileSync(fileName, 'utf8')
    .split(/\r?\n/)
    .reduce((out, line) => 
      {
        if (/^\w/.test(line)) {
          if (/Information being sought/.test(line)) { }
          else {
            const countryCode = line.substring(0, 3);
            const countryName = line.substring(4, 18).trim();
            const stationsClub = line.substring(19, 23).trim();
            const stationsSingle = line.substring(33, 23).trim();
            const stationsTotal = line.substring(43, 34).trim();
            const operatorsTotal = line.substring(53, 44).trim();
            const licensedMembers = line.substring(63, 54).trim();
            const societyMembers = line.substring(73, 64).trim();
            const dataYear = line.substring(80, 78).trim();

            out.list.push({ 
              code: countryCode,
              name: countryName,
              total: parseInt(stationsTotal, 10) || 0,
              region: out.region
            })
          }
        }
        if (/^# Region/.test(line)) {
          const region = line.match(/Region\s+(\d)/)[1];
          out.region = parseInt(region, 10);
        }
        return out;
      }, 
      { 
        region: 0, 
        list: [] 
      }
    ).list;
}
