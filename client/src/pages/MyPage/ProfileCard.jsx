import { API_BASE } from "../../utils/api";

export default function ProfileCard({
  loading = false,
  nickname = "",
  email = "",
  memo = "",
  avatar,
}) {
    console.log("🔍 ProfileCard avatar prop:", avatar);

  const greet = loading ? "불러오는 중..." : nickname || "회원";

  const avatarUrl =
    avatar && avatar.trim?.() !== ""
      ? avatar.startsWith("http")
        ? avatar
        : `${API_BASE}${avatar.startsWith("/") ? avatar : "/" + avatar}`
      : null;

  return (
    <div className="pc-wrap">
      <div className="pc-card">
        <div className="pc-top">
          <div className="pc-top-row">
            {avatarUrl ? (
              <img src={avatarUrl} alt="프로필 사진" className="pc-avatar-img" />
            ) : (
              <div className="pc-avatar-icon" aria-hidden="true">👤</div>
            )}
            <div className="pc-meta">
              <div className="pc-greet">{greet}</div>
              {email && <div className="pc-email-text">{email}</div>}
            </div>
          </div>
        </div>

        <div className="pc-bottom">
          <div className="pc-divider" />
          <div className="pc-foot">
            이번 주 나의 로또 번호 :{" "}
            <span className="pc-memo-nums">
              {String(memo).replace("이번 주 나의 로또 번호 : ", "") || "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}