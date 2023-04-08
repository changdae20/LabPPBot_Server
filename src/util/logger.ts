import moment from 'moment';

export function makeLogger(header?: string) {
  if (header == null) header = '';
  else header = `${header} - `;

  return (...msg: any[]) => {
    const now = moment(new Date()).local();
    console.log();
    console.log(`${header}${now.format('YYYY-MM-DD hh:mm:ss')} -`, ...msg);
  };
}
