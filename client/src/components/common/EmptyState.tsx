export default function EmptyState({ title, description }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', color: '#5b7372' }}>
      <h3 style={{ marginBottom: 10 }}>{title}</h3>
      <p style={{ margin: 0 }}>{description}</p>
    </div>
  );
}
