export default function Placeholder({ title, desc = "컨텐츠는 곧 추가됩니다." }) {
  return (
    <section style={{ background: "#fff", borderRadius: 12, padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p>{desc}</p>
    </section>
  );
}