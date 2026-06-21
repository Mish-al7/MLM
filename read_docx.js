const fs = require('fs');
const AdmZip = require('adm-zip');

try {
  const zip = new AdmZip('PRD - Jinil.docx');
  const zipEntries = zip.getEntries();
  const docEntry = zipEntries.find(entry => entry.entryName === 'word/document.xml');
  if (docEntry) {
    const xml = docEntry.getData().toString('utf8');
    const text = xml.replace(/<[^>]+>/g, ' ');
    fs.writeFileSync('prd.txt', text);
    console.log('Success');
  } else {
    console.log('word/document.xml not found');
  }
} catch (e) {
  console.error(e);
}
