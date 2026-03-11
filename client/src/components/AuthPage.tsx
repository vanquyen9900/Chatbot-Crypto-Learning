import React, { useState } from "react";

type Mode = "signin" | "signup";

export default function Auth({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<Mode>("signin");
  const Accent = "#9EEC37";
  const isSignUp = mode === "signup";

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(1100px, 100%)",
          height: 620,
          background: "#fff",
          borderRadius: 18,
          border: "1px solid rgba(0,0,0,0.08)",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        {/* forms layer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
            <div style={{ width: 380, maxWidth: "100%", opacity: isSignUp ? 1 : 0, pointerEvents: isSignUp ? "auto" : "none", transition: "opacity .4s" }}>
              <SignUpForm onAuthed={onAuthed} accent={Accent} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
            <div style={{ width: 380, maxWidth: "100%", opacity: !isSignUp ? 1 : 0, pointerEvents: !isSignUp ? "auto" : "none", transition: "opacity .4s" }}>
              <SignInForm onAuthed={onAuthed} accent={Accent} />
            </div>
          </div>
        </div>

        {/* curved panel */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "50%",
            transform: isSignUp ? "translateX(100%)" : "translateX(0%)",
            transition: "transform .7s cubic-bezier(.2,.8,.2,1)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: Accent,
              clipPath: isSignUp
                ? "ellipse(90% 130% at 100% 50%)"
                : "ellipse(90% 130% at 0% 50%)",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 2,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 48px",
              textAlign: "center",
              color: "#111",
            }}
          >
            {isSignUp ? (
              <div style={{ maxWidth: 360 }}>
                <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", opacity: 0.75 }}>
                  One of us?
                </div>
                <div style={{ fontSize: 44, fontWeight: 800, marginTop: 10 }}>
                  Welcome Back
                </div>
                <div style={{ marginTop: 12, opacity: 0.75 }}>
                  Đăng nhập để tiếp tục.
                </div>
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  style={ctaBtnStyle()}
                >
                  SIGN IN
                </button>
              </div>
            ) : (
              <div style={{ maxWidth: 360 }}>
                <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", opacity: 0.75 }}>
                  New here?
                </div>
                <div style={{ fontSize: 44, fontWeight: 800, marginTop: 10 }}>
                  Create Account
                </div>
                <div style={{ marginTop: 12, opacity: 0.75 }}>
                  Tạo tài khoản để bắt đầu trải nghiệm CoinSight.
                </div>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  style={ctaBtnStyle()}
                >
                  SIGN UP
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ctaBtnStyle(): React.CSSProperties {
  return {
    marginTop: 28,
    padding: "10px 28px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.8)",
    background: "rgba(255,255,255,0.18)",
    fontWeight: 700,
    cursor: "pointer",
  };
}

function Input({ accent, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { accent: string }) {
  return (
    <input
      {...rest}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "rgba(0,0,0,0.04)",
        outline: "none",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.10)")}
    />
  );
}

function SignInForm({ onAuthed, accent }: { onAuthed: () => void; accent: string }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onAuthed();
      }}
    >
      <h2 style={{ fontSize: 34, fontWeight: 800, textAlign: "center", marginBottom: 22 }}>Sign in</h2>
      <div style={{ display: "grid", gap: 14 }}>
        <Input accent={accent} required type="email" placeholder="Email" />
        <Input accent={accent} required type="password" placeholder="Password" />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "none",
            background: accent,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          LOGIN
        </button>
      </div>
      <div style={{ marginTop: 18, textAlign: "center", fontSize: 12, opacity: 0.6 }}>
        Or Sign in with social platforms
      </div>
      <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 10 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ width: 34, height: 34, borderRadius: 999, border: "1px solid rgba(0,0,0,0.2)" }} />
        ))}
      </div>
    </form>
  );
}

function SignUpForm({ onAuthed, accent }: { onAuthed: () => void; accent: string }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onAuthed();
      }}
    >
      <h2 style={{ fontSize: 34, fontWeight: 800, textAlign: "center", marginBottom: 22 }}>Sign up</h2>
      <div style={{ display: "grid", gap: 14 }}>
        <Input accent={accent} required placeholder="Username" />
        <Input accent={accent} required type="email" placeholder="Email" />
        <Input accent={accent} required type="password" placeholder="Password" />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "none",
            background: accent,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          SIGN UP
        </button>
      </div>
      <div style={{ marginTop: 18, textAlign: "center", fontSize: 12, opacity: 0.6 }}>
        Or Sign up with social platforms
      </div>
      <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 10 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ width: 34, height: 34, borderRadius: 999, border: "1px solid rgba(0,0,0,0.2)" }} />
        ))}
      </div>
    </form>
  );
}
