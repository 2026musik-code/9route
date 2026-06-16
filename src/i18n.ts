import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Dashboard": "Dashboard",
      "API Keys": "API Keys",
      "Playground": "Playground",
      "Settings": "Settings",
      "Quota Usage": "Quota Usage",
      "Total Allowed": "Total Allowed",
      "Used Tokens": "Used Tokens",
      "Remaining Tokens": "Remaining Tokens",
      "Real-time Token Consumption": "Real-time Token Consumption",
      "Recent Usage Logs": "Recent Usage Logs",
      "Model": "Model",
      "Tokens": "Tokens",
      "Status": "Status",
      "Time": "Time",
      "Warning": "Warning",
      "Quota near limit": "You have consumed over 90% of your quota.",
      "Send": "Send Request",
      "Type message": "Type your message to test...",
      "Documentation": "Documentation"
    }
  },
  id: {
    translation: {
      "Dashboard": "Dasbor",
      "API Keys": "Kunci API",
      "Playground": "Taman Bermain",
      "Settings": "Pengaturan",
      "Quota Usage": "Penggunaan Kuota",
      "Total Allowed": "Total Diizinkan",
      "Used Tokens": "Token Digunakan",
      "Remaining Tokens": "Token Tersisa",
      "Real-time Token Consumption": "Konsumsi Token Real-time",
      "Recent Usage Logs": "Log Penggunaan Terbaru",
      "Model": "Model",
      "Tokens": "Token",
      "Status": "Status",
      "Time": "Waktu",
      "Warning": "Peringatan",
      "Quota near limit": "Anda telah menggunakan lebih dari 90% kuota Anda.",
      "Send": "Kirim Permintaan",
      "Type message": "Ketik pesan Anda untuk diuji...",
      "Documentation": "Dokumentasi"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
