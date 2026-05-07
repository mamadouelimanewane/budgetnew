import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  fr: {
    translation: {
      appTitle: "Budget1",
      login: "Connexion",
      email: "Email",
      password: "Mot de passe",
      signIn: "Se connecter",
      me: "Mon profil",
      language: "Langue",
    },
  },
  en: {
    translation: {
      appTitle: "Budget1",
      login: "Login",
      email: "Email",
      password: "Password",
      signIn: "Sign in",
      me: "My profile",
      language: "Language",
    },
  },
  wo: {
    translation: {
      appTitle: "Budget1",
      login: "Jokkoo",
      email: "Email",
      password: "Baatu jàll",
      signIn: "Dugg",
      me: "Sama xibaar",
      language: "Làkk",
    },
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: "fr",
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

export default i18n;

