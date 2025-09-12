import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../api/client";
import { getErrorMessage } from "../../utils/httpError";
import styles from "./Auth.module.css";

function AgreementBox({ label, required, description, checked, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: 12, padding: 10 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span style={{ fontWeight: 600 }}>
          {required ? "(필수)" : "(선택)"} {label}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            marginLeft: "auto",
            background: "none",
            border: 0,
            color: "#7a0e0e",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          {open ? "닫기 ▲" : "자세히 ▼"}
        </button>
      </label>

      {open && (
        <div style={{ marginTop: 8, paddingLeft: 28, fontSize: 12, color: "#555", lineHeight: 1.55 }}>
          {description}
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
    privacyAgree: false,
    marketingAgree: false,
  });
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password || !form.name) {
      setError("필수 항목을 입력하세요.");
      return;
    }
    if (form.password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!form.privacyAgree) {
      setError("개인정보 수집 및 이용에 동의해야 합니다.");
      return;
    }

    try {
      await api.post("/auth/register", {
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone || null,
        privacy_agree: form.privacyAgree,
        marketing_agree: form.marketingAgree,
      });
      alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다 : )");
      nav("/login");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className={styles.twoColWrap} style={{ backgroundColor: "#fdecee" }}>
      <section className={styles.leftPane}>
        <form onSubmit={onSubmit} className={styles.card}>
          <h2 className={styles.title}>회원가입</h2>

          <label className={styles.label}>이름*</label>
          <input
            className={styles.input}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <label className={styles.label}>이메일*</label>
          <input
            className={styles.input}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <label className={styles.label}>비밀번호*</label>
          <input
            className={styles.input}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <label className={styles.label}>비밀번호 확인*</label>
          <input
            className={styles.input}
            type="password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />

          <label className={styles.label}>휴대전화</label>
          <input
            className={styles.input}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="010-1234-5678"
          />

          <AgreementBox
            label="개인정보 수집 및 이용 동의"
            required
            checked={form.privacyAgree}
            onChange={(e) => setForm({ ...form, privacyAgree: e.target.checked })}
            description={
              <>
                <strong>수집항목</strong>: 이름, 이메일, 비밀번호, 휴대전화<br />
                <strong>이용목적</strong>: 회원가입 처리, 본인확인, 서비스 제공 및 문의 대응<br />
                <strong>보관기간</strong>: 회원 탈퇴 시 까지(관계 법령에 따라 별도 보관 가능)
              </>
            }
          />

          <AgreementBox
            label="마케팅 수신 동의"
            checked={form.marketingAgree}
            onChange={(e) => setForm({ ...form, marketingAgree: e.target.checked })}
            description={
              <>
                <strong>수집항목</strong>: 이메일, 휴대전화<br />
                <strong>이용목적</strong>: 이벤트/프로모션 정보 제공, 맞춤형 광고 안내<br />
                <strong>보관기간</strong>: 동의 철회 시 까지
              </>
            }
          />

          {error && <p className={styles.error}>{String(error)}</p>}

          <button type="submit" className={styles.primaryBtn}>가입하기</button>
          <p className={styles.hint}>
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </p>
        </form>
      </section>

      <aside
        className={`${styles.rightPane} ${styles.registerHero}`}
        aria-hidden="true"
      />
    </div>
  );
}