
import React, { useState } from "react";

// SafeMaga Component 4
// Trilingual migration fraud awareness and FAQ assistant.
// This is a curated educational prototype, not a generative AI chatbot.

const translations = {
  en: {
    eyebrow: "SAFEMAGA | RESEARCH COMPONENT 04",
    title: "Fraud Awareness & Safe Migration Hub",
    subtitle:
      "Learn how to identify suspicious overseas job offers, " +
      "protect your information, and find official help.",
    back: "← Back to Fraud Checker",
    warningsTitle: "Common Migration Scam Warning Signs",
    warnings: [
      "Guaranteed visa approval or guaranteed overseas employment.",
      "Pressure to transfer money immediately or to a personal account.",
      "Requests for passwords, OTP codes or unnecessary personal documents.",
      "Recruiters who refuse to provide verifiable agency details.",
      "Offers that discourage independent checks through official channels."
    ],
    checklistTitle: "Safety Checklist Before Applying",
    checklist: [
      "Verify the recruitment agency through official SLBFE information.",
      "Independently confirm the employer, vacancy and contract details.",
      "Check the relevant visa and recruitment requirements.",
      "Do not send passwords or OTP codes to recruiters.",
      "Keep copies of messages, receipts and employment documents.",
      "Seek official guidance before making any payment."
    ],
    reportingTitle: "What If You Suspect a Scam?",
    reporting: [
      "Stop payments and avoid sharing additional personal information.",
      "Save screenshots, messages, payment details and relevant evidence.",
      "Contact your bank immediately if money has already been transferred.",
      "Report suspicious foreign employment recruitment to SLBFE."
    ],
    resourcesTitle: "Official Information & Reporting",
    agencyLink: "Check licensed recruitment agencies",
    officialLink: "Visit the official SLBFE website",
    reportingLink: "SLBFE law enforcement information",
    hotline: "SLBFE Hotline (Sri Lanka): 1989",
    sourceNote:
      "These links lead to external official SLBFE resources. " +
      "SafeMaga does not independently verify individual agencies.",
    chatTitle: "Trilingual Fraud Awareness FAQ Assistant",
    chatSubtitle:
      "Select a question or type a short question about safe migration.",
    placeholder: "Ask about agency licences, payments, documents or reporting...",
    send: "Send",
    reset: "Clear conversation",
    noAnswer:
      "I cannot reliably answer that question from my prepared FAQ. " +
      "Please consult SLBFE or another relevant official authority.",
    chatWarning:
      "FAQ-based prototype, not an AI-generated answer. " +
      "Do not enter passport numbers, OTPs, bank details or other private data.",
    footer:
      "Educational research prototype. This guidance cannot establish " +
      "whether an advertisement is legitimate or provide legal advice."
  },

  si: {
    eyebrow: "SAFEMAGA | පර්යේෂණ සංරචකය 04",
    title: "වංචා පිළිබඳ දැනුවත් කිරීම සහ ආරක්ෂිත විදේශ රැකියා",
    subtitle:
      "සැක සහිත විදේශ රැකියා දැන්වීම් හඳුනාගැනීමට, " +
      "පුද්ගලික තොරතුරු ආරක්ෂා කරගැනීමට සහ නිල සහාය ලබාගැනීමට ඉගෙනගන්න.",
    back: "← වංචා පරීක්ෂකයට ආපසු",
    warningsTitle: "විදේශ රැකියා වංචාවල අනතුරු ඇඟවීමේ ලකුණු",
    warnings: [
      "වීසා හෝ විදේශ රැකියාව අනිවාර්යයෙන් ලබාදෙන බවට පොරොන්දු වීම.",
      "වහාම මුදල් හෝ පුද්ගලික බැංකු ගිණුමකට ගෙවීම් ඉල්ලා සිටීම.",
      "මුරපද, OTP අංක හෝ අනවශ්‍ය පුද්ගලික ලේඛන ඉල්ලා සිටීම.",
      "ආයතනයේ බලපත්‍ර තොරතුරු තහවුරු කිරීමට ඉඩ නොදීම.",
      "නිල මාර්ග හරහා තොරතුරු පරීක්ෂා කිරීමෙන් ඔබ වැළැක්වීම."
    ],
    checklistTitle: "අයදුම් කිරීමට පෙර ආරක්ෂිත පරීක්ෂණ ලැයිස්තුව",
    checklist: [
      "SLBFE නිල තොරතුරු හරහා රැකියා නියෝජිත ආයතනය පරීක්ෂා කරන්න.",
      "සේවායෝජකයා, රැකියා අවස්ථාව සහ ගිවිසුම තහවුරු කරන්න.",
      "අදාළ වීසා සහ බඳවාගැනීමේ අවශ්‍යතා පරීක්ෂා කරන්න.",
      "මුරපද හෝ OTP අංක කිසිවෙකුට නොදෙන්න.",
      "පණිවිඩ, රිසිට්පත් සහ රැකියා ලේඛනවල පිටපත් තබාගන්න.",
      "මුදල් ගෙවීමට පෙර නිල මාර්ගයකින් උපදෙස් ලබාගන්න."
    ],
    reportingTitle: "වංචාවක් සැක නම් කළ යුත්තේ කුමක්ද?",
    reporting: [
      "ගෙවීම් නවතා තවදුරටත් පුද්ගලික තොරතුරු ලබා නොදෙන්න.",
      "තිර රූප, පණිවිඩ සහ ගෙවීම් සම්බන්ධ සාක්ෂි සුරකින්න.",
      "මුදල් යවා ඇත්නම් වහාම ඔබේ බැංකුව අමතන්න.",
      "සැක සහිත විදේශ රැකියා බඳවාගැනීම් SLBFE වෙත වාර්තා කරන්න."
    ],
    resourcesTitle: "නිල තොරතුරු සහ පැමිණිලි",
    agencyLink: "බලපත්‍රලාභී රැකියා නියෝජිත ආයතන පරීක්ෂා කරන්න",
    officialLink: "නිල SLBFE වෙබ් අඩවිය",
    reportingLink: "SLBFE නීතිය ක්‍රියාත්මක කිරීමේ තොරතුරු",
    hotline: "SLBFE ක්ෂණික ඇමතුම් අංකය: 1989",
    sourceNote:
      "මෙම සබැඳි නිල SLBFE මූලාශ්‍ර වෙත යොමු කරයි. " +
      "SafeMaga ආයතනවල නීත්‍යානුකූලභාවය තහවුරු නොකරයි.",
    chatTitle: "භාෂා තුනෙන් වංචා දැනුවත් කිරීමේ FAQ සහායකයා",
    chatSubtitle: "ප්‍රශ්නයක් තෝරන්න හෝ කෙටි ප්‍රශ්නයක් ඇතුළත් කරන්න.",
    placeholder: "බලපත්‍ර, ගෙවීම්, ලේඛන හෝ පැමිණිලි ගැන අසන්න...",
    send: "යවන්න",
    reset: "සංවාදය හිස් කරන්න",
    noAnswer:
      "මෙම ප්‍රශ්නයට මගේ සූදානම් කළ FAQ තොරතුරුවලින් " +
      "විශ්වාසදායක පිළිතුරක් ලබාදිය නොහැක. කරුණාකර නිල ආයතනයක් අමතන්න.",
    chatWarning:
      "මෙය සූදානම් කළ FAQ පදනම් කරගත් පර්යේෂණ මූලාකෘතියකි. " +
      "පාස්පෝට් අංක, OTP, බැංකු තොරතුරු හෝ රහස් දත්ත ඇතුළත් නොකරන්න.",
    footer:
      "මෙය අධ්‍යාපනික පර්යේෂණ මූලාකෘතියකි. " +
      "දැන්වීමක නීත්‍යානුකූලභාවය තහවුරු කිරීමක් හෝ නීති උපදෙසක් නොවේ."
  },

  ta: {
    eyebrow: "SAFEMAGA | ஆராய்ச்சி கூறு 04",
    title: "மோசடி விழிப்புணர்வு மற்றும் பாதுகாப்பான வெளிநாட்டு வேலைவாய்ப்பு",
    subtitle:
      "சந்தேகத்திற்குரிய வெளிநாட்டு வேலை விளம்பரங்களை அறிந்து, " +
      "தனிப்பட்ட தகவல்களைப் பாதுகாத்து, அதிகாரப்பூர்வ உதவி பெறுங்கள்.",
    back: "← மோசடி பரிசோதனைக்குத் திரும்பு",
    warningsTitle: "வெளிநாட்டு வேலை மோசடிக்கான எச்சரிக்கை அறிகுறிகள்",
    warnings: [
      "விசா அல்லது வெளிநாட்டு வேலை நிச்சயம் கிடைக்கும் என்ற வாக்குறுதி.",
      "உடனடியாகப் பணம் செலுத்த அல்லது தனிப்பட்ட கணக்கிற்குப் பணம் அனுப்ப அழுத்தம்.",
      "கடவுச்சொல், OTP அல்லது தேவையற்ற தனிப்பட்ட ஆவணங்களை கேட்பது.",
      "முகவர் நிறுவனத்தின் உரிம விவரங்களைச் சரிபார்க்க அனுமதிக்காதது.",
      "அதிகாரப்பூர்வ வழிகளில் தகவல்களை உறுதிப்படுத்த வேண்டாம் என்று கூறுவது."
    ],
    checklistTitle: "விண்ணப்பிக்கும் முன் பாதுகாப்புப் பட்டியல்",
    checklist: [
      "SLBFE அதிகாரப்பூர்வ தகவல்களில் முகவர் நிறுவனத்தைச் சரிபார்க்கவும்.",
      "வேலை வழங்குநர், காலியிடம் மற்றும் ஒப்பந்த விவரங்களை உறுதிப்படுத்தவும்.",
      "தொடர்புடைய விசா மற்றும் ஆட்சேர்ப்பு விதிகளைச் சரிபார்க்கவும்.",
      "கடவுச்சொல் அல்லது OTP எண்ணை யாரிடமும் பகிர வேண்டாம்.",
      "செய்திகள், ரசீதுகள் மற்றும் வேலை ஆவணங்களின் நகல்களை வைத்திருக்கவும்.",
      "பணம் செலுத்தும் முன் அதிகாரப்பூர்வ ஆலோசனையைப் பெறவும்."
    ],
    reportingTitle: "மோசடி என சந்தேகித்தால் என்ன செய்வது?",
    reporting: [
      "பணம் செலுத்துவதை நிறுத்தி, மேலும் தனிப்பட்ட தகவல்களைப் பகிர வேண்டாம்.",
      "திரைப் படங்கள், செய்திகள் மற்றும் பணப் பரிவர்த்தனை ஆதாரங்களைச் சேமிக்கவும்.",
      "பணம் அனுப்பியிருந்தால் உடனடியாக உங்கள் வங்கியைத் தொடர்புகொள்ளவும்.",
      "சந்தேகத்திற்குரிய வெளிநாட்டு ஆட்சேர்ப்பை SLBFE-க்கு அறிவிக்கவும்."
    ],
    resourcesTitle: "அதிகாரப்பூர்வ தகவல் மற்றும் முறைப்பாடுகள்",
    agencyLink: "உரிமம் பெற்ற வேலைவாய்ப்பு முகவர்களைச் சரிபார்க்கவும்",
    officialLink: "SLBFE அதிகாரப்பூர்வ இணையதளம்",
    reportingLink: "SLBFE சட்ட அமலாக்கத் தகவல்",
    hotline: "SLBFE அவசரத் தொடர்பு எண்: 1989",
    sourceNote:
      "இந்த இணைப்புகள் SLBFE அதிகாரப்பூர்வ தகவல்களுக்கு வழிநடத்துகின்றன. " +
      "SafeMaga தனிப்பட்ட நிறுவனங்களின் நம்பகத்தன்மையைச் சான்றளிக்காது.",
    chatTitle: "மும்மொழி மோசடி விழிப்புணர்வு FAQ உதவியாளர்",
    chatSubtitle: "ஒரு கேள்வியைத் தேர்ந்தெடுக்கவும் அல்லது சுருக்கமாகக் கேட்கவும்.",
    placeholder: "முகவர் உரிமம், கட்டணம், ஆவணங்கள் அல்லது புகார் பற்றி கேளுங்கள்...",
    send: "அனுப்பு",
    reset: "உரையாடலை அழி",
    noAnswer:
      "இந்தக் கேள்விக்கு எனது தயாரிக்கப்பட்ட FAQ தகவல்களில் " +
      "நம்பகமான பதில் இல்லை. அதிகாரப்பூர்வ நிறுவனத்தை அணுகவும்.",
    chatWarning:
      "இது முன்கூட்டியே தயாரிக்கப்பட்ட FAQ ஆராய்ச்சி மாதிரி. " +
      "கடவுச்சீட்டு எண், OTP, வங்கி விவரங்கள் அல்லது தனிப்பட்ட தகவல்களை உள்ளிட வேண்டாம்.",
    footer:
      "இது கல்வி நோக்கிலான ஆராய்ச்சி மாதிரி. " +
      "விளம்பரத்தின் நம்பகத்தன்மைக்கான உறுதிப்பாடோ சட்ட ஆலோசனையோ அல்ல."
  }
};

// Curated FAQs with answers in all three languages.
// Keywords are used only for simple matching, not AI generation.
const faqs = [
  {
    id: "agency",
    keywords: [
      "agency", "licence", "license", "verify",
      "registered", "agent",
      "බලපත්‍ර", "ආයතන", "ලියාපදිංචි",
      "முகவர்", "உரிமம்", "பதிவு"
    ],
    question: {
      en: "How do I verify a recruitment agency?",
      si: "රැකියා නියෝජිත ආයතනයක් පරීක්ෂා කරන්නේ කෙසේද?",
      ta: "வேலைவாய்ப்பு முகவரை எவ்வாறு சரிபார்ப்பது?"
    },
    answer: {
      en:
        "Check the agency through the official SLBFE licensed-agency " +
        "information. Confirm the licence and relevant job details " +
        "independently before making any payment.",
      si:
        "SLBFE නිල බලපත්‍රලාභී ආයතන තොරතුරු භාවිතයෙන් ආයතනය පරීක්ෂා කරන්න. " +
        "මුදල් ගෙවීමට පෙර බලපත්‍රය සහ රැකියා තොරතුරු ස්වාධීනව තහවුරු කරන්න.",
      ta:
        "SLBFE அதிகாரப்பூர்வ உரிமம் பெற்ற முகவர் தகவல்களில் சரிபார்க்கவும். " +
        "பணம் செலுத்தும் முன் உரிமம் மற்றும் வேலை விவரங்களை தனியாக உறுதிப்படுத்தவும்."
    }
  },
  {
    id: "payments",
    keywords: [
      "pay", "payment", "fee", "money", "deposit", "bank",
      "මුදල්", "ගෙව", "ගාස්තු", "බැංකු",
      "பணம்", "கட்டணம்", "செலுத்த", "வங்கி"
    ],
    question: {
      en: "Should I pay a recruitment fee immediately?",
      si: "රැකියා ගාස්තුවක් වහාම ගෙවිය යුතුද?",
      ta: "வேலைவாய்ப்புக் கட்டணத்தை உடனே செலுத்த வேண்டுமா?"
    },
    answer: {
      en:
        "Do not pay simply because someone creates urgency. " +
        "Verify the recruiter's authorization, fee requirements " +
        "and payment instructions through official channels first.",
      si:
        "හදිසි බව පවසන නිසා පමණක් මුදල් නොගෙවන්න. " +
        "පළමුව නිල මාර්ග හරහා ආයතනයේ අවසරය, ගාස්තු සහ ගෙවීම් උපදෙස් පරීක්ෂා කරන්න.",
      ta:
        "அவசரப்படுத்துவதால் மட்டும் பணம் செலுத்த வேண்டாம். " +
        "முகவரின் அங்கீகாரம், கட்டண விதிகள் மற்றும் பணம் செலுத்தும் " +
        "வழிமுறைகளை அதிகாரப்பூர்வமாகச் சரிபார்க்கவும்."
    }
  },
  {
    id: "documents",
    keywords: [
      "passport", "otp", "password", "nic",
      "document", "identity",
      "පාස්පෝට්", "මුරපද", "ලේඛන", "හැඳුනුම්",
      "கடவுச்சீட்டு", "கடவுச்சொல்", "ஆவண", "அடையாள"
    ],
    question: {
      en: "Is it safe to share my passport or OTP?",
      si: "පාස්පෝට් තොරතුරු හෝ OTP බෙදාගැනීම ආරක්ෂිතද?",
      ta: "கடவுச்சீட்டு விவரங்கள் அல்லது OTP-ஐ பகிரலாமா?"
    },
    answer: {
      en:
        "Never share OTPs or account passwords. Passport information " +
        "can be sensitive; provide documents only when the recipient, " +
        "purpose and secure submission process are independently verified.",
      si:
        "OTP හෝ ගිණුම් මුරපද කිසිවිටෙක බෙදා නොගන්න. " +
        "පාස්පෝට් ලේඛන ලබාදීමට පෙර ලබන්නා, අවශ්‍යතාව සහ ආරක්ෂිත " +
        "ලේඛන ඉදිරිපත් කිරීමේ ක්‍රමය තහවුරු කරන්න.",
      ta:
        "OTP அல்லது கணக்குக் கடவுச்சொற்களைப் பகிர வேண்டாம். " +
        "கடவுச்சீட்டு ஆவணங்களை வழங்கும் முன் பெறுநர், நோக்கம் " +
        "மற்றும் பாதுகாப்பான சமர்ப்பிப்பு முறையை உறுதிப்படுத்தவும்."
    }
  },
  {
    id: "report",
    keywords: [
      "report", "complaint", "scam", "fraud", "1989",
      "පැමිණිලි", "වංචා", "වාර්තා",
      "புகார்", "முறைப்பாடு", "மோசடி"
    ],
    question: {
      en: "How do I report a suspected migration scam?",
      si: "සැක සහිත විදේශ රැකියා වංචාවක් වාර්තා කරන්නේ කෙසේද?",
      ta: "சந்தேகத்திற்குரிய வெளிநாட்டு வேலை மோசடியை எப்படிப் புகாரளிப்பது?"
    },
    answer: {
      en:
        "Preserve relevant evidence and contact SLBFE through its " +
        "official website or the Sri Lankan hotline 1989. " +
        "If you have transferred money, contact your bank promptly.",
      si:
        "අදාළ සාක්ෂි සුරකින්න. SLBFE නිල වෙබ් අඩවිය හෝ " +
        "1989 ක්ෂණික ඇමතුම් අංකය හරහා සම්බන්ධ වන්න. " +
        "මුදල් යවා ඇත්නම් වහාම බැංකුව අමතන්න.",
      ta:
        "தொடர்புடைய ஆதாரங்களைச் சேமிக்கவும். SLBFE அதிகாரப்பூர்வ " +
        "இணையதளம் அல்லது இலங்கையின் 1989 தொடர்பு எண்ணை அணுகவும். " +
        "பணம் அனுப்பியிருந்தால் உடனடியாக வங்கியைத் தொடர்புகொள்ளவும்."
    }
  }
];

const cardStyle = {
  background: "#ffffff",
  padding: 24,
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  boxShadow: "0 4px 14px rgba(15,23,42,0.04)"
};

export default function FraudAwarenessHub() {
  const [language, setLanguage] = useState("en");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const t = translations[language];

  function changeLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    setMessages([]);
    setInput("");
  }

  function askFaq(faq) {
    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: faq.question[language]
      },
      {
        role: "assistant",
        text: faq.answer[language]
      }
    ]);
  }

  function sendMessage(event) {
    event.preventDefault();

    const question = input.trim();
    if (!question) return;

    const normalized = question.toLocaleLowerCase();

    const match = faqs.find((faq) =>
      faq.keywords.some((keyword) =>
        normalized.includes(keyword)
      )
    );

    setMessages((previous) => [
      ...previous,
      { role: "user", text: question },
      {
        role: "assistant",
        text: match
          ? match.answer[language]
          : t.noAnswer
      }
    ]);

    setInput("");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "38px 20px 60px",
        background: "#f4f7fc",
        color: "#172033"
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* HEADER */}

        <a
          href="/fraud-checker"
          style={{
            display: "inline-block",
            color: "#2563eb",
            marginBottom: 22,
            textDecoration: "none",
            fontWeight: 600
          }}
        >
          {t.back}
        </a>

        <div
          style={{
            ...cardStyle,
            background: "#eff6ff",
            marginBottom: 24
          }}
        >
          <p style={{
            color: "#1d4ed8",
            fontSize: 13,
            fontWeight: 700
          }}>
            {t.eyebrow}
          </p>

          <h1 style={{
            fontSize: "clamp(25px, 4vw, 36px)",
            marginBottom: 12
          }}>
            {t.title}
          </h1>

          <p style={{
            color: "#475569",
            lineHeight: 1.7
          }}>
            {t.subtitle}
          </p>

          <div style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 22
          }}>
            {[
              { code: "en", label: "English" },
              { code: "si", label: "සිංහල" },
              { code: "ta", label: "தமிழ்" }
            ].map((item) => (
              <button
                key={item.code}
                type="button"
                aria-pressed={language === item.code}
                onClick={() => changeLanguage(item.code)}
                style={{
                  padding: "11px 18px",
                  borderRadius: 8,
                  border: "1px solid #93c5fd",
                  cursor: "pointer",
                  fontWeight: 600,
                  background:
                    language === item.code
                      ? "#2563eb"
                      : "#ffffff",
                  color:
                    language === item.code
                      ? "#ffffff"
                      : "#1d4ed8"
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* AWARENESS AND SAFETY CHECKLIST */}

        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 22,
          marginBottom: 24
        }}>
          <section style={cardStyle}>
            <h2 style={{
              fontSize: 21,
              color: "#b91c1c"
            }}>
              ⚠️ {t.warningsTitle}
            </h2>

            <ul style={{
              paddingLeft: 23,
              lineHeight: 1.8
            }}>
              {t.warnings.map((warning, index) => (
                <li key={index} style={{
                  marginBottom: 12
                }}>
                  {warning}
                </li>
              ))}
            </ul>
          </section>

          <section style={cardStyle}>
            <h2 style={{
              fontSize: 21,
              color: "#15803d"
            }}>
              ✅ {t.checklistTitle}
            </h2>

            <div style={{ display: "grid", gap: 14 }}>
              {t.checklist.map((item, index) => (
                <label
                  key={`${language}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    lineHeight: 1.6
                  }}
                >
                  <input
                    type="checkbox"
                    style={{
                      width: 17,
                      height: 17,
                      marginTop: 4
                    }}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* REPORTING GUIDANCE */}

        <section style={{
          ...cardStyle,
          marginBottom: 24
        }}>
          <h2 style={{ fontSize: 22 }}>
            🛡️ {t.reportingTitle}
          </h2>

          <ol style={{
            paddingLeft: 24,
            lineHeight: 1.8
          }}>
            {t.reporting.map((step, index) => (
              <li key={index} style={{
                marginBottom: 10
              }}>
                {step}
              </li>
            ))}
          </ol>
        </section>

        {/* OFFICIAL SOURCES */}

        <section style={{
          ...cardStyle,
          marginBottom: 24
        }}>
          <h2 style={{ fontSize: 22 }}>
            🔗 {t.resourcesTitle}
          </h2>

          <div style={{
            display: "grid",
            gap: 14,
            marginTop: 18
          }}>
            <a
              href="https://www.slbfe.lk/licensed-foreign-employment-agencies-in-sri-lanka/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.agencyLink} ↗
            </a>

            <a
              href="https://www.slbfe.lk/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.officialLink} ↗
            </a>

            <a
              href="https://www.slbfe.lk/law-enforcement/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.reportingLink} ↗
            </a>

            <p style={{
              fontWeight: 700,
              color: "#1d4ed8"
            }}>
              ☎ {t.hotline}
            </p>
          </div>

          <p style={{
            fontSize: 13,
            color: "#64748b",
            lineHeight: 1.7
          }}>
            {t.sourceNote}
          </p>
        </section>

        {/* TRILINGUAL FAQ CHATBOT */}

        <section style={cardStyle}>
          <h2 style={{ fontSize: 23 }}>
            💬 {t.chatTitle}
          </h2>

          <p style={{
            color: "#64748b",
            lineHeight: 1.7
          }}>
            {t.chatSubtitle}
          </p>

          {/* Suggested questions */}

          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            margin: "20px 0"
          }}>
            {faqs.map((faq) => (
              <button
                key={faq.id}
                type="button"
                onClick={() => askFaq(faq)}
                style={{
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                  borderRadius: 10,
                  padding: "11px 14px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontWeight: 500
                }}
              >
                {faq.question[language]}
              </button>
            ))}
          </div>

          {/* Chat messages */}

          <div
            role="log"
            aria-live="polite"
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 16,
              minHeight: 170,
              maxHeight: 360,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 13
            }}
          >
            {messages.length === 0 && (
              <p style={{
                color: "#64748b",
                textAlign: "center",
                margin: "auto"
              }}>
                {t.chatSubtitle}
              </p>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  alignSelf:
                    message.role === "user"
                      ? "flex-end"
                      : "flex-start",
                  maxWidth: "87%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  background:
                    message.role === "user"
                      ? "#2563eb"
                      : "#e2e8f0",
                  color:
                    message.role === "user"
                      ? "#ffffff"
                      : "#172033"
                }}
              >
                {message.text}
              </div>
            ))}
          </div>

          {/* Chat input */}

          <form
            onSubmit={sendMessage}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 16
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              maxLength={500}
              style={{
                flex: "1 1 240px",
                padding: 13,
                borderRadius: 9,
                border: "1px solid #cbd5e1",
                fontSize: 15,
                minWidth: 0
              }}
            />

            <button
              type="submit"
              disabled={!input.trim()}
              style={{
                background: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: 9,
                padding: "12px 22px",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              {t.send}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setInput("");
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "#475569",
              cursor: "pointer",
              padding: "14px 0"
            }}
          >
            {t.reset}
          </button>

          <p style={{
            fontSize: 13,
            color: "#64748b",
            lineHeight: 1.7
          }}>
            {t.chatWarning}
          </p>
        </section>

        <p style={{
          textAlign: "center",
          fontSize: 13,
          color: "#64748b",
          marginTop: 28,
          lineHeight: 1.7
        }}>
          {t.footer}
        </p>

      </div>
    </main>
  );
}
