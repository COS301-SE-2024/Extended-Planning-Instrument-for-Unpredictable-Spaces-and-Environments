import Papa from 'papaparse';

export function parseCSV(csvText: string) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      complete: (results) => {
        if (results.errors.length) {
          reject(results.errors);
        } else {
          resolve(results.data);
        }
      }
    });
  });
}
