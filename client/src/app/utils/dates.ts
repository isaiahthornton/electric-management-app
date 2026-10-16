// Today's date as 'YYYY-MM-DD' in local time.
// (toISOString() uses UTC, which is a day ahead after 8pm in New York.)
export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-based
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
// Current local date + time as 'YYYY-MM-DDTHH:mm:ss' (same format as timeReported in db.json)
export function nowIso(): string {
  const now = new Date();
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
  return `${todayIso()}T${time}`;
}
