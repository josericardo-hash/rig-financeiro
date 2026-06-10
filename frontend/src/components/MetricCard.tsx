type MetricCardProps = {
  title: string;
  value: string;
  tone?: 'blue' | 'green' | 'red' | 'amber' | 'orange' | 'slate';
  detail?: string;
};

export default function MetricCard({ title, value, tone = 'blue', detail }: MetricCardProps) {
  return (
    <article className={`metric ${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </article>
  );
}
