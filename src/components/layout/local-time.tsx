'use client';

import { useI18n } from '@/i18n/client';
import { localeMeta } from '@/i18n/config';
import { format } from '@/i18n/format';
import { useNow } from '@/lib/use-now';

type Status = 'asleep' | 'working' | 'off';

function statusAt(hour: number, weekday: number): Status {
  if (hour < 7) return 'asleep';
  if (weekday >= 1 && weekday <= 5 && hour >= 9 && hour < 18) return 'working';
  return 'off';
}

/**
 * "Eskişehir 14:52 — probably at work". Rendered after mount: the server
 * can't know the current time, and a stale one would be worse than none.
 */
export function LocalTime({
  city,
  timeZone,
}: {
  city: string;
  timeZone: string;
}) {
  const { locale, t } = useI18n();
  const now = useNow();

  if (!now) return <span aria-hidden="true">{city} --:--</span>;

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
    get('weekday')
  );
  const time = `${get('hour')}:${get('minute')}`;
  const status = statusAt(Number(get('hour')), weekday);

  return (
    <span title={format(t.footer.localTime, { city })}>
      {city}{' '}
      <time dateTime={now.toISOString()} lang={localeMeta[locale].intl}>
        {time}
      </time>{' '}
      <span>— {t.footer.status[status]}</span>
    </span>
  );
}
