export default function truncateString(string: string, maxChar: number) {
  if (string && string.length > maxChar) {
    const regex = new RegExp(`^(.{${maxChar}}[^\\s]*).*`);
    return string.replace(regex, '$1') + '...';
  } else {
    return string;
  }
}
