import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import getApiError from "@/utils/apiError";
import AuthSplitLayout from "@/components/layout/AuthSplitLayout";
import FloatingInput from "@/components/common/FloatingInput";
import { authAPI } from "@/services/index";
import { useVerifyOTP } from "@/hooks/auth";
import useAuthStore from "@/store/authStore";
import tokens from "@/utils/tokens";
import "./Auth.css";

/* ─── Brand ─────────────────────────────────────────────────────── */
const GOLD = "#8D5D1D";
const GOLD_DARK = "#7A4E16";
const BLUE = "#0197F6";

/* ─── SVG icons ─────────────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.56 2.684-3.875 2.684-6.615z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
    />
    <path
      fill="#FBBC05"
      d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
    />
    <path
      fill="#EA4335"
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
    />
  </svg>
);

const AppleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 814 1000" fill="#1A1A1A">
    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 436.7 1 279.2 1 116.5c0-95.3 33.7-184.4 94.4-251.2C143.7-192.7 215.8-226 289.7-226c105 0 168.4 70.9 225.7 70.9 55 0 127.1-74.4 240.5-74.4z" />
  </svg>
);

/* ─── Top breadcrumb bar ─────────────────────────────────────────── */
const PageTopBar = ({ title }) => (
  <div
    className="w-full flex items-center shrink-0"
    style={{ background: "#2E2E2E", height: 38, paddingLeft: 22 }}
  >
    <span
      style={{
        color: "rgba(255,255,255,0.75)",
        fontSize: 13,
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      {title}
    </span>
  </div>
);

/* ─── Gold "Continue →" pill button ─────────────────────────────── */
const ContinueBtn = ({
  type = "button",
  onClick,
  loading = false,
  fullWidth = false,
  small = false,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading}
    className={`flex items-center justify-center gap-3 font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 ${fullWidth ? "w-full" : ""}`}
    style={{
      background: GOLD,
      color: "#fff",
      borderRadius: 9999,
      height: small ? 42 : 52,
      paddingLeft: small ? 20 : 28,
      paddingRight: small ? 12 : 14,
      fontSize: small ? 13 : 15,
      fontFamily: "Montserrat, sans-serif",
    }}
  >
    {loading ? "Please wait…" : "Continue"}
    <span
      className="flex items-center justify-center rounded-full shrink-0"
      style={{
        width: small ? 26 : 32,
        height: small ? 26 : 32,
        background: "rgba(255,255,255,0.22)",
      }}
    >
      <ArrowRight size={small ? 13 : 16} color="#fff" />
    </span>
  </button>
);

/* ─── Collage images ─────────────────────────────────────────────── */
const COLLAGE = [
  "/assets/images/auth/collage-1.png",
  "/assets/images/auth/collage-2.jpg",
  null /* gold tile */,
  "/assets/images/auth/collage-3.jpg",
  "/assets/images/auth/collage-4.jpg",
  null,
];

/* ─────────────────────────────────────────────────────────────────
   Step 1 — Role Picker
   ───────────────────────────────────────────────────────────────── */
const ROLES = [
  {
    role: "artist",
    label: "As an Artist",
    desc: "Build your personalized portfolio and find your next best opportunity with Interflow",
    img: "/assets/images/auth/role-artist.jpg",
  },
  {
    role: "organization",
    label: "As an Organization",
    desc: "Build your personalized portfolio and find your next best opportunity with Interflow",
    img: "/assets/images/auth/role-org.jpg",
  },
];

const RolePicker = ({ onSelect }) => (
  <div className="min-h-screen flex flex-col">
    <div className="flex flex-1">
      {/* ── Left: photo collage ── */}
      <div className="hidden md:block bg-[#0D0D0D]" style={{ width: "55%" }}>
        <div className="collage-grid h-full">
          {COLLAGE.map((src, i) => (
            <div key={i} style={{
                    width: 500,
                    height: 320,}} className={`collage-cell ${!src ? "gold" : ""}`}>
              {src && (
                <img
                  src={src}
                  alt=""
                  width={120}
                  height={120}
                  onError={(e) => {
                    e.currentTarget.parentElement.style.background = "#1a1a1a";
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: role selection ── */}
      <div className="relative flex-1 bg-white flex flex-col justify-center px-6 sm:px-10 md:px-14 py-10 overflow-y-auto">
        {/* Decorative arcs – top-right */}
        <div
          className="pointer-events-none absolute top-0 right-0 overflow-hidden"
          style={{ width: 220, height: 220 }}
        >
          <div
            className="absolute"
            style={{
              top: -80,
              right: -80,
              width: 260,
              height: 260,
              border: "1px solid #E8E0D0",
              borderRadius: "50%",
            }}
          />
          <div
            className="absolute"
            style={{
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              border: "1px solid #EDE8DF",
              borderRadius: "50%",
            }}
          />
          <div
            className="absolute"
            style={{
              top: -20,
              right: -20,
              width: 140,
              height: 140,
              border: "1px solid #F2EDE5",
              borderRadius: "50%",
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-[420px]">
          {/* Logo */}
          <img
            src="/assets/icons/interflow-logo.svg"
            alt="Interflow"
            style={{ height: 56, width: "auto", marginBottom: 36 }}
          />

          <h1
            className="font-bold text-[#1A1A1A] mb-2"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(24px, 4vw, 32px)",
            }}
          >
            Welcome!
          </h1>
          <p className="text-[14px] text-[#888] mb-8 leading-relaxed">
            Build your artist portfolio, connect with opportunities and organize
            events.
          </p>

          <p
            className="font-bold text-[#1A1A1A] mb-5"
            style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15 }}
          >
            How would you like to use Interflow?
          </p>

          {/* Role cards */}
          <div className="flex flex-col gap-4">
            {ROLES.map(({ role, label, desc, img }) => (
              <div
                key={role}
                className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all hover:shadow-md group"
                style={{
                  background: "#F5F0E8",
                  borderLeft: `5px solid ${GOLD}`,
                }}
                onClick={() => onSelect(role)}
              >
                {/* Text + button */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-bold text-[#1A1A1A] mb-1"
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 15,
                    }}
                  >
                    {label}
                  </p>
                  <p className="text-[12.5px] text-[#888] leading-snug mb-4">
                    {desc}
                  </p>
                  <ContinueBtn
                    small
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(role);
                    }}
                  />
                </div>

                {/* Avatar with blue ring */}
                <div
                  className="shrink-0 rounded-full overflow-hidden"
                  style={{
                    width: 80,
                    height: 80,
                    border: `3px solid ${BLUE}`,
                    boxShadow: `0 0 0 2px #fff, 0 0 0 5px ${BLUE}`,
                  }}
                >
                  <img
                    src={img}
                    alt={label}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.parentElement.style.background = GOLD;
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   Step 2 — Registration form
   ───────────────────────────────────────────────────────────────── */
const RegisterForm = ({ role, onSuccess }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const email = watch("email", "");
  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await authAPI.register({
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
        role,
        tos_accepted: true,
      });
      onSuccess(data.email);
    } catch (err) {
      toast.error(getApiError(err, "Registration failed"));
    }
  };

  const BG =
    role === "artist"
      ? "/assets/images/auth/register-artist-bg.jpg"
      : "/assets/images/auth/register-org-bg.jpg";

  const roleLabel = role === "artist" ? "Artist" : "Organization";

  return (
    <AuthSplitLayout
      imageSrc={BG}
      imageAlt={`${roleLabel} background`}
      leftWidth="50"
    >
      <div className="w-full max-w-[420px]">
        <h1
          className="font-bold text-[#1A1A1A] mb-2"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "clamp(26px, 5vw, 34px)",
          }}
        >
          Sign Up
        </h1>
        <p className="text-[14px] text-[#888] mb-8">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold underline hover:opacity-80 transition-opacity"
            style={{ color: "#1A1A1A" }}
          >
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FloatingInput
            label="Email"
            type="email"
            value={email}
            error={errors.email?.message}
            {...register("email", { required: "Email is required" })}
          />
          <FloatingInput
            label="Password"
            type="password"
            value={password}
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "At least 8 characters" },
            })}
          />
          <FloatingInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Please confirm your password",
            })}
          />

          <p
            className="text-[11.5px] leading-relaxed"
            style={{ color: "#AAAAAA" }}
          >
            Passwords must be at least 8 characters and contain at least one
            uppercase letter and one number
          </p>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded cursor-pointer"
              style={{ accentColor: GOLD }}
              {...register("terms", { required: "Please agree to the terms" })}
            />
            <span className="text-[13px] text-[#555]">
              Agree to our{" "}
              <a href="#" className="underline text-[#1A1A1A] hover:opacity-70">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline text-[#1A1A1A] hover:opacity-70">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.terms && (
            <p className="text-xs text-red-500">{errors.terms.message}</p>
          )}

          <ContinueBtn type="submit" loading={isSubmitting} fullWidth />
        </form>

        <div className="or-divider my-6">OR</div>

        <div className="space-y-3">
          <button className="social-btn">
            <GoogleIcon /> Sign up with Google
          </button>
          <button className="social-btn">
            <AppleIcon /> Sign up with Apple
          </button>
        </div>
      </div>
    </AuthSplitLayout>
  );
};

/* ─────────────────────────────────────────────────────────────────
   Step 3 — Email confirmation
   ───────────────────────────────────────────────────────────────── */
const EmailConfirm = ({ email, onContinue }) => {
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.resendOTP({ email });
      toast.success("Email resent!");
    } catch {
      toast.error("Failed to resend email");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="confirm-wrap">
      <img
        src="/assets/images/auth/email-bg.jpg"
        alt=""
        className="confirm-bg-img"
        onError={(e) => {
          e.currentTarget.parentElement.style.background = "#0D0D0D";
          e.currentTarget.style.display = "none";
        }}
      />
      <div className="confirm-overlay" />

      <div className="confirm-card">
        <img
          src="/assets/icons/interflow-logo.svg"
          alt="Interflow"
          style={{ height: 52, width: "auto", margin: "0 auto 24px" }}
        />

        {/* Mail icon */}
        <div
          className="flex items-center justify-center rounded-full mx-auto mb-5"
          style={{ width: 80, height: 80, border: "2px solid #1A1A1A" }}
        >
          <Mail size={32} strokeWidth={1.5} style={{ color: GOLD }} />
        </div>

        <h2
          className="font-bold text-[#1A1A1A] mb-3"
          style={{ fontFamily: "Montserrat, sans-serif", fontSize: 26 }}
        >
          You&apos;ve Got a Mail!
        </h2>
        <p className="text-[13.5px] text-[#777] leading-relaxed mb-7">
          A confirmation mail has been sent to{" "}
          <strong className="text-[#1A1A1A]">{email}</strong> with instructions
          on confirmation and resetting of password.
        </p>

        <ContinueBtn fullWidth onClick={onContinue} />

        <p className="mt-5 text-[13px] text-[#888]">
          If you did not receive the email,{" "}
          <button
            onClick={handleResend}
            disabled={resending}
            className="font-semibold hover:underline disabled:opacity-60"
            style={{ color: GOLD }}
          >
            {resending ? "Sending…" : "resend another email"}
          </button>
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   Step 4 — OTP Verification
   ───────────────────────────────────────────────────────────────── */
const OTPVerify = ({ email }) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();
  const { mutateAsync: verifyOTP } = useVerifyOTP();
  const [resending, setResending] = useState(false);

  const onSubmit = async (data) => {
    try {
      await verifyOTP({ email, code: data.code });
      // useVerifyOTP hook auto-navigates to /register/success on success
    } catch (err) {
      toast.error(getApiError(err, "Invalid code. Please try again."));
    }
  };

  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    try {
      await authAPI.resendOTP({ email });
      toast.success("Verification code resent!");
    } catch (err) {
      toast.error(getApiError(err, "Failed to resend code."));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="confirm-wrap">
      <img
        src="/assets/images/auth/email-bg.jpg"
        alt=""
        className="confirm-bg-img"
        onError={(e) => {
          e.currentTarget.parentElement.style.background = "#0D0D0D";
          e.currentTarget.style.display = "none";
        }}
      />
      <div className="confirm-overlay" />

      <div className="confirm-card">
        <img
          src="/assets/icons/interflow-logo.svg"
          alt="Interflow"
          style={{ height: 52, width: "auto", margin: "0 auto 24px" }}
        />

        <h2
          className="font-bold text-[#1A1A1A] mb-3"
          style={{ fontFamily: "Montserrat, sans-serif", fontSize: 26 }}
        >
          Verify Your Email
        </h2>
        <p className="text-[13.5px] text-[#777] leading-relaxed mb-7">
          Enter the 6-digit code we sent to{" "}
          <strong className="text-[#1A1A1A]">{email}</strong>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <input
            type="text"
            maxLength={6}
            placeholder="------"
            {...register("code", { required: true })}
            style={{
              display: "block",
              width: "100%",
              textAlign: "center",
              fontSize: 28,
              letterSpacing: "0.35em",
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              color: "#1A1A1A",
              border: "2px solid #E0D8CC",
              borderRadius: 12,
              padding: "14px 16px",
              outline: "none",
              background: "#FAFAFA",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = GOLD;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E0D8CC";
            }}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            style={{
              background: GOLD,
              color: "#fff",
              borderRadius: 9999,
              height: 52,
              fontSize: 15,
              fontFamily: "Montserrat, sans-serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = GOLD_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.background = GOLD)}
          >
            {isSubmitting ? "Verifying…" : "Verify"}
          </button>
        </form>

        <p className="mt-5 text-[13px] text-[#888]">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-semibold hover:underline disabled:opacity-60"
            style={{ color: GOLD }}
          >
            {resending ? "Sending…" : "Resend Code"}
          </button>
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   Main RegisterPage — orchestrates the 4 steps
   ───────────────────────────────────────────────────────────────── */
const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("role"); // 'role' | 'form' | 'confirm' | 'otp'
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");

  // Clear any stale partial-registration auth state so PublicRoute doesn't
  // redirect a returning user based on a previous incomplete session.
  useEffect(() => {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (isAuthenticated && !user?.is_onboarded) {
      tokens.clear();
      useAuthStore.setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    }
  }, []);

  if (step === "role") {
    return (
      <RolePicker
        onSelect={(r) => {
          setRole(r);
          setStep("form");
        }}
      />
    );
  }
  if (step === "form") {
    return (
      <RegisterForm
        role={role}
        onSuccess={(mail) => {
          setEmail(mail);
          setStep("confirm");
        }}
        onBack={() => setStep("role")}
      />
    );
  }
  if (step === "confirm") {
    return <EmailConfirm email={email} onContinue={() => setStep("otp")} />;
  }
  return <OTPVerify email={email} />;
};

export default RegisterPage;
