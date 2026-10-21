import { createContext, useContext, useState } from 'react';
import strings from './strings';

const LangContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k });
export const useLang = () => useContext(LangContext);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(localStorage.getItem('safemaga_lang') || 'en');
  const setLang = (l) => { localStorage.setItem('safemaga_lang', l); setLangState(l); };
  const t = (key) => strings[lang]?.[key] || strings.en[key] || key;
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}
