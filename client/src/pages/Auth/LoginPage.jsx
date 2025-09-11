import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { getErrorMessage } from "../../utils/httpError";
import styles from "./Auth.module.css";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get("token");
    if (!t) return;

    (async () => {
      try {
        localStorage.setItem("access_token", t);
        window.history.replaceState({}, "", "/");
        const { data: me } = await api.get("/auth/me");
        window.dispatchEvent(new CustomEvent("auth-changed", { detail: me }));
        window.location.replace("/");
      } catch (e) {
        localStorage.removeItem("access_token");
        setError(getErrorMessage(e));
      }
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("access_token", data.access_token);

      const { data: me } = await api.get("/auth/me");
      window.dispatchEvent(new CustomEvent("auth-changed", { detail: me }));

      nav("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const redirectTo = async (provider) => {
    if (redirecting) return;
    setError("");
    setRedirecting(true);
    try {
      const { data } = await api.get(`/auth/${provider}/login`);
      window.location.href = data.auth_url;
    } catch (err) {
      setError(getErrorMessage(err));
      setRedirecting(false);
    }
  };

  return (
    <div className={styles.twoColWrap}>
      <section className={styles.leftPane}>
        <form onSubmit={onSubmit} className={styles.card}>
          <h2 className={styles.title}>로그인</h2>

          <label className={styles.label}>이메일</label>
          <input
            className={styles.input}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting || redirecting}
          />

          <label className={styles.label}>비밀번호</label>
          <input
            className={styles.input}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting || redirecting}
          />

          {error && <p className={styles.error}>{String(error)}</p>}

          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={submitting || redirecting}
          >
            {submitting ? "로그인 중..." : "로그인"}
          </button>

          <p className={styles.hint} style={{ marginTop: 10 }}>
            또는
          </p>

          <button
            type="button"
            className={styles.naverBtn}
            onClick={() => redirectTo("naver")}
            disabled={submitting || redirecting}
          >
            <img src="/images/naver-logo.png" alt="네이버" className={styles.socialIcon} />
            {redirecting ? "이동 중..." : "네이버로 로그인"}
          </button>

          <button
            type="button"
            className={styles.kakaoBtn}
            onClick={() => redirectTo("kakao")}
            disabled={submitting || redirecting}
          >
            <img src="/images/kakao-logo.png" alt="카카오" className={styles.socialIcon} />
            {redirecting ? "이동 중..." : "카카오로 로그인"}
          </button>

          <p className={styles.hint}>
            계정이 없으신가요? <Link to="/register">회원가입</Link>
          </p>
        </form>
      </section>

      <aside
        className={`${styles.rightPane} ${styles.loginHero}`}
        aria-hidden="true"
      />
    </div>
  );
}