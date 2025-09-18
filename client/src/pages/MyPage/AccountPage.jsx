import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import styles from "./styles/AccountPage.module.css";
import { getErrorMessage } from "../../utils/httpError";

export default function AccountPage() {
  const [me, setMe] = useState(null);
  const [status, setStatus] = useState({ naver: false, kakao: false });
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const token = localStorage.getItem("access_token");
  const location = useLocation();
  const navigate = useNavigate();

  const socialCount = useMemo(
    () => (status.naver ? 1 : 0) + (status.kakao ? 1 : 0),
    [status]
  );
  const isSocialOnlyEmail = useMemo(
    () => me?.email?.endsWith("@noreply.social"),
    [me]
  );
  const isSocialLinked = socialCount > 0;

  const canUnlinkNaver = status.naver && !(socialCount === 1 && isSocialOnlyEmail);
  const canUnlinkKakao = status.kakao && !(socialCount === 1 && isSocialOnlyEmail);

  useEffect(() => {
    (async () => {
      try {
        const meRes = await api.get("/auth/me");
        setMe(meRes.data);
        setName(meRes.data.name || "");
        const st = await api.get("/auth/social/status");
        setStatus(st.data);
      } catch {
        setErr("계정 정보를 불러오지 못했습니다.");
      }
    })();
  }, []);

  const refreshStatus = async () => {
    const st = await api.get("/auth/social/status");
    setStatus(st.data);
  };

  const refreshMe = async () => {
    const meRes = await api.get("/auth/me");
    setMe(meRes.data);
    setName(meRes.data.name || "");
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const linked = params.get("linked");
    if (linked) {
      const label = linked === "kakao" ? "카카오" : "네이버";
      setMsg(`${label} 연동이 완료되었습니다.`);
      (async () => {
        await refreshStatus();
        await refreshMe();
      })();
      navigate("/mypage/account", { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    const onFocus = () => refreshStatus();
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshStatus();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const link = async (provider) => {
    try {
      setErr(""); setMsg(""); setBusy(true);
      const { data } = await api.get(`/auth/${provider}/login`, {
        params: { link: 1, app_token: token },
      });
      window.location.href = data.auth_url;
    } catch (e) {
      setErr(getErrorMessage(e));
      setBusy(false);
    }
  };

  const unlink = async (provider) => {
    if (socialCount === 1 && isSocialOnlyEmail) {
      alert("최소 1개의 로그인 수단은 남아 있어야 합니다. 다른 소셜을 먼저 연동하세요.");
      return;
    }
    if (!confirm(`${provider === "kakao" ? "카카오" : "네이버"} 연결을 해제할까요?`)) return;

    try {
      setErr(""); setMsg(""); setBusy(true);
      await api.delete(`/auth/social/${provider}`);
      await refreshStatus();
      setMsg("연결이 해제되었습니다.");
    } catch (e) {
      setErr(getErrorMessage(e) || "연결 해제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");

    if (!isSocialLinked && (pw || pw2)) {
      if (pw.length < 8) {
        setErr("비밀번호는 8자 이상이어야 합니다.");
        return;
      }
      if (pw !== pw2) {
        setErr("비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    try {
      setBusy(true);
      const body = { name };
      if (!isSocialLinked && pw) {
        body.password = pw;
        body.password_confirm = pw2;
      }
      await api.patch("/users/me", body);
      await refreshMe();
      setMsg("수정되었습니다.");
      setPw(""); setPw2("");
    } catch (e) {
      setErr(getErrorMessage(e) || "수정에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    try {
      setBusy(true); setErr(""); setMsg("");
      await api.delete("/users/me");
      localStorage.removeItem("access_token");
      window.location.replace("/");
    } catch (e) {
      setErr(getErrorMessage(e) || "탈퇴에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  if (!me) return null;

  return (
    <div className={styles.twoColWrap} style={{ backgroundColor: "#fdecee", minHeight: "100vh" }}>
      <section className={styles.leftPane}>
        <form onSubmit={onSubmit} className={styles.card}>
          <h2 className={styles.title}>계정 설정</h2>

          <label className={styles.label}>이름</label>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
          />

          <label className={styles.label}>이메일</label>
          <input className={styles.input} value={me.email} disabled />

          <label className={styles.label}>비밀번호 변경</label>
          <input
            className={styles.input}
            type="password"
            placeholder="********"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            disabled={isSocialLinked || busy}
          />

          <label className={styles.label}>비밀번호 확인</label>
          <input
            className={styles.input}
            type="password"
            placeholder="********"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            disabled={isSocialLinked || busy}
          />

          <div className={styles.sectionTitle}>소셜 로그인</div>

          <div className={styles.socialRow}>
            <div className={styles.socialBox}>
              <span className={styles.socialLabel}>
                네이버 {status.naver ? <em className={styles.badgeOk}>연결됨</em> : <em className={styles.badgeNo}>미연결</em>}
              </span>
              {status.naver ? (
                <button
                  type="button"
                  className={styles.outlineBtn}
                  onClick={() => unlink("naver")}
                  disabled={!canUnlinkNaver || busy}
                  title={!canUnlinkNaver ? "마지막 로그인 수단은 해제할 수 없습니다." : ""}
                >
                  연결 해제
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => link("naver")}
                  disabled={busy}
                >
                  연동하기
                </button>
              )}
            </div>

            <div className={styles.socialBox}>
              <span className={styles.socialLabel}>
                카카오 {status.kakao ? <em className={styles.badgeOk}>연결됨</em> : <em className={styles.badgeNo}>미연결</em>}
              </span>
              {status.kakao ? (
                <button
                  type="button"
                  className={styles.outlineBtn}
                  onClick={() => unlink("kakao")}
                  disabled={!canUnlinkKakao || busy}
                  title={!canUnlinkKakao ? "마지막 로그인 수단은 해제할 수 없습니다." : ""}
                >
                  연결 해제
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => link("kakao")}
                  disabled={busy}
                >
                  연동하기
                </button>
              )}
            </div>
          </div>

          {err && <p className={styles.error}>{err}</p>}
          {msg && <p className={styles.ok}>{msg}</p>}

          <div className={styles.actions}>
            <button type="submit" className={styles.submitBtn} disabled={busy}>
              {busy ? "저장 중..." : "수정하기"}
            </button>

            <button
              type="button"
              className={styles.dangerBtn}
              onClick={onDelete}
              disabled={busy}
            >
              회원 탈퇴
            </button>
          </div>
        </form>
      </section>

      <aside className={styles.rightPane} aria-hidden="true" />
    </div>
  );
}