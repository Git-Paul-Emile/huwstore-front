import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useToastStore } from "../store/useToastStore";
import { useLogin, useRegister } from "../hooks/useAuth";
import { Close, Lock, Phone, ArrowRight, Check } from "./icons";

type Mode = "login" | "register" | "forgot" | "otp";

export default function AuthModal() {
  const authOpen = useAuthStore((s) => s.authOpen);
  const setAuthOpen = useAuthStore((s) => s.setAuthOpen);
  const toast = useToastStore((s) => s.toast);
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [consent, setConsent] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);

  if (!authOpen) return null;

  const close = () => setAuthOpen(false);

  const submitLogin = () => {
    loginMutation.mutate(
      { phone, password },
      { onSuccess: () => toast("Bienvenue !"), onError: () => toast("Identifiants invalides.") },
    );
  };

  const submitRegister = () => {
    registerMutation.mutate(
      { name, phone, password },
      { onSuccess: () => toast("Compte créé, bienvenue !"), onError: () => toast("Impossible de créer le compte, réessayez.") },
    );
  };

  const title = {
    login: "Connexion",
    register: "Créer un compte",
    forgot: "Mot de passe oublié",
    otp: "Vérification",
  }[mode];

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={close} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto bg-cream animate-slide-in">
        <div className="flex items-center justify-between border-b border-taupe/25 px-6 py-5">
          <h2 className="serif text-xl">{title}</h2>
          <button onClick={close} className="text-2xl transition-colors hover:text-gold-deep"><Close /></button>
        </div>

        <div className="flex-1 px-6 py-7">
          {/* ---- CONNEXION ---- */}
          {mode === "login" && (
            <div className="space-y-5">
              <Field label="Téléphone">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+221 77 123 45 67" className={inputCls} />
              </Field>
              <Field label="Mot de passe">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
              </Field>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-anthracite">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-gold" />
                  Se souvenir de moi
                </label>
                <button onClick={() => { setMode("forgot"); setForgotStep(1); }} className="text-gold-deep hover:underline">Mot de passe oublié ?</button>
              </div>
              <button
                onClick={submitLogin}
                disabled={!phone || !password || loginMutation.isPending}
                className={`${ctaCls} disabled:cursor-not-allowed disabled:bg-taupe-soft disabled:text-taupe`}
              >
                <span className="label-lux">{loginMutation.isPending ? "Connexion…" : "Se connecter"}</span>
                <ArrowRight className="text-base" />
              </button>

              <Divider />
              <button onClick={() => toast("Connexion par code — bientôt disponible.")} className={ghostCls}>
                <Phone className="text-base" /> Connexion par code SMS / WhatsApp
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => toast("Connexion Google — bientôt disponible.")} className={socialCls}>Google</button>
                <button onClick={() => toast("Connexion Facebook — bientôt disponible.")} className={socialCls}>Facebook</button>
              </div>

              <p className="text-center text-sm text-taupe">
                Nouveau client ?{" "}
                <button onClick={() => setMode("register")} className="text-gold-deep hover:underline">Créer un compte</button>
              </p>
            </div>
          )}

          {/* ---- INSCRIPTION ---- */}
          {mode === "register" && (
            <div className="space-y-5">
              <p className="text-sm text-taupe">Quelques infos suffisent — l'adresse vous sera demandée à la première commande.</p>
              <Field label="Nom complet">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Awa Ndiaye" className={inputCls} />
              </Field>
              <Field label="Téléphone">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+221 77 123 45 67" className={inputCls} />
              </Field>
              <Field label="Mot de passe">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
              </Field>
              <label className="flex items-start gap-2.5 text-xs text-anthracite">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-gold" />
                J'accepte les <span className="text-gold-deep">CGU</span> et la <span className="text-gold-deep">politique de confidentialité</span>.
              </label>
              <button
                disabled={!name || !phone || password.length < 4 || !consent || registerMutation.isPending}
                onClick={submitRegister}
                className={`${ctaCls} disabled:cursor-not-allowed disabled:bg-taupe-soft disabled:text-taupe`}
              >
                <span className="label-lux">{registerMutation.isPending ? "Création…" : "Créer mon compte"}</span>
              </button>
              <p className="text-center text-sm text-taupe">
                Déjà cliente ?{" "}
                <button onClick={() => setMode("login")} className="text-gold-deep hover:underline">Se connecter</button>
              </p>
            </div>
          )}

          {/* ---- MOT DE PASSE OUBLIÉ ---- */}
          {mode === "forgot" && (
            <div className="space-y-5">
              <Steps step={forgotStep} labels={["Vérification", "Nouveau mot de passe", "Terminé"]} />
              {forgotStep === 1 && (
                <>
                  <Field label="Téléphone (recommandé) ou e-mail">
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="77 123 45 67" className={inputCls} />
                  </Field>
                  <p className="text-xs text-taupe">Un code de réinitialisation sera envoyé par SMS / WhatsApp.</p>
                  <button onClick={() => setForgotStep(2)} className={ctaCls}><span className="label-lux">Envoyer le code</span></button>
                </>
              )}
              {forgotStep === 2 && (
                <>
                  <Field label="Nouveau mot de passe">
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
                  </Field>
                  <button disabled={password.length < 4} onClick={() => setForgotStep(3)} className={`${ctaCls} disabled:bg-taupe-soft disabled:text-taupe`}><span className="label-lux">Valider</span></button>
                </>
              )}
              {forgotStep === 3 && (
                <div className="py-6 text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-bottle text-2xl text-cream"><Check /></span>
                  <p className="serif mt-4 text-xl">Mot de passe réinitialisé</p>
                  <button onClick={() => setMode("login")} className={`${ctaCls} mt-6`}><span className="label-lux">Se connecter</span></button>
                </div>
              )}
              {forgotStep < 3 && (
                <button onClick={() => setMode("login")} className="mx-auto block text-sm text-taupe hover:text-gold-deep">Retour</button>
              )}
            </div>
          )}
        </div>

        {/* Checkout invité + sécurité */}
        <div className="border-t border-taupe/25 px-6 py-4">
          {mode !== "forgot" && (
            <button onClick={close} className="mb-3 block w-full text-center text-sm text-anthracite hover:text-gold-deep">
              Commander sans créer de compte →
            </button>
          )}
          <p className="flex items-center justify-center gap-1.5 text-[0.7rem] text-taupe">
            <Lock className="text-sm text-bottle" /> Connexion sécurisée · vos données sont protégées
          </p>
        </div>
      </aside>
    </div>
  );
}

const inputCls = "w-full border border-taupe/45 bg-cream px-4 py-3 text-sm outline-none transition-colors placeholder:text-taupe focus:border-gold";
const ctaCls = "flex w-full items-center justify-center gap-2 bg-ink py-4 text-cream transition-colors hover:bg-anthracite active:scale-[0.99]";
const ghostCls = "flex w-full items-center justify-center gap-2 border border-ink py-3.5 text-sm text-ink transition-colors hover:bg-ink hover:text-cream";
const socialCls = "border border-taupe/45 py-3 text-sm text-anthracite transition-colors hover:border-gold hover:text-gold-deep";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-lux text-[0.6rem] text-taupe">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 text-[0.65rem] text-taupe">
      <span className="h-px flex-1 bg-taupe/30" /> OU <span className="h-px flex-1 bg-taupe/30" />
    </div>
  );
}

function Steps({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="flex items-center">
      {labels.map((l, i) => {
        const n = i + 1;
        const done = step >= n;
        return (
          <div key={l} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <span className={`grid h-7 w-7 place-items-center rounded-full text-xs ${done ? "bg-gold text-ink" : "bg-taupe-soft text-taupe"}`}>{n}</span>
              <span className="mt-1.5 text-center text-[0.6rem] text-taupe">{l}</span>
            </div>
            {i < labels.length - 1 && <span className={`mb-4 h-px flex-1 ${step > n ? "bg-gold" : "bg-taupe/30"}`} />}
          </div>
        );
      })}
    </div>
  );
}
