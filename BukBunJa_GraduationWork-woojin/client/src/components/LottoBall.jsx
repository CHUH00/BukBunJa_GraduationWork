// client/src/components/LottoBall.jsx
export default function LottoBall({ number }) {
    const getColor = (num) => {
        if (num >= 1 && num <= 10) return "#fbc400"; // 노란색
        if (num >= 11 && num <= 20) return "#69c8f2"; // 파란색
        if (num >= 21 && num <= 30) return "#ff7272"; // 빨강
        if (num >= 31 && num <= 40) return "#aaaaaa"; // 회색
        return "#b0d840"; // 초록
    };

    let backgroundColor = getColor(number);

    return (
        <div
            style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: backgroundColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: 20,
                margin: "0 4px",
                border: "1px solid #ccc"
            }}
        >
            {number}
        </div>
    );
}