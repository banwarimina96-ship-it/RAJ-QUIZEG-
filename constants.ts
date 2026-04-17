
export const MARKING_SCHEME = {
  CORRECT: 2,
  WRONG: -0.66,
  UNATTEMPTED: -0.66,
  SKIP_OPTION: 'E',
  SKIP_SCORE: 0
};

export interface TopicGroup {
  id: string;
  name: string;
  subtopics: string[];
}

export const TOPIC_GROUPS: TopicGroup[] = [
  {
    id: 'hist',
    name: 'Rajasthan History (इतिहास)',
    subtopics: [
      'प्राचीन सभ्यताएं: कालीबंगा, आहड़, गणेश्वर, बैराठ',
      'मेवाड़ का इतिहास (गुहिल-सिसोदिया राजवंश)',
      'मारवाड़ का इतिहास (राठौड़ राजवंश)',
      'आमेर का इतिहास (कछवाहा राजवंश)',
      'अजमेर के चौहान राजवंश',
      'बीकानेर का इतिहास',
      'राजस्थान में 1857 की क्रांति',
      'किसान एवं जनजाति आंदोलन',
      'प्रजामंडल आंदोलन',
      'राजस्थान का एकीकरण',
      'प्रमुख स्वतंत्रता सेनानी'
    ]
  },
  {
    id: 'geo',
    name: 'Rajasthan Geography (भूगोल)',
    subtopics: [
      'स्थिति, विस्तार एवं भौतिक विभाग',
      'अरावली पर्वतमाला एवं मरुस्थलीय प्रदेश',
      'अपवाह तंत्र: नदियाँ एवं झीलें',
      'राजस्थान की जलवायु एवं वर्षा वितरण',
      'प्राकृतिक वनस्पति एवं मृदा',
      'वन्यजीव अभयारण्य एवं राष्ट्रीय उद्यान',
      'बहुउद्देशीय सिंचाई परियोजनाएं',
      'कृषि एवं प्रमुख फसलें',
      'पशुधन एवं डेयरी विकास',
      'खनिर्ज संसाधन एवं ऊर्जा के स्रोत',
      'जनगणना 2011 (जनसांख्यिकी)',
      'पर्यटन एवं परिवहन'
    ]
  },
  {
    id: 'cult',
    name: 'Rajasthan Culture (कला एवं संस्कृति)',
    subtopics: [
      'राजस्थान के प्रमुख दुर्ग एवं किले',
      'प्रमुख मंदिर एवं स्थापत्य कला',
      'महल, हवेलियां एवं छतरियां',
      'लोक देवता एवं लोक देवियां',
      'संत एवं धार्मिक संप्रदाय',
      'प्रमुख मेले एवं त्यौहार',
      'चित्रकला की विभिन्न शैलियां',
      'लोक संगीत एवं वाद्ययंत्र',
      'लोक नृत्य एवं लोक नाट्य',
      'वेशभूषा एवं आभूषण',
      'हस्तशिल्प एवं लोक कलाएं',
      'राजस्थानी भाषा, बोलियां एवं साहित्य'
    ]
  },
  {
    id: 'pol',
    name: 'Rajasthan Polity (राजव्यवस्था)',
    subtopics: [
      'राज्यपाल: शक्तियां एवं कार्य',
      'मुख्यमंत्री एवं मंत्रिपरिषद',
      'राजस्थान विधानसभा की संरचना',
      'उच्च न्यायालय एवं अधीनस्थ न्यायालय',
      'राज्य सचिवालय एवं मुख्य सचिव',
      'जिला प्रशासन',
      'पंचायती राज एवं नगर निकाय',
      'राजस्थान लोक सेवा आयोग (RPSC)',
      'राज्य मानवाधिकार आयोग',
      'राज्य निर्वाचन आयोग एवं सूचना आयोग',
      'लोकायुक्त एवं जन सूचना पोर्टल'
    ]
  },
  {
    id: 'eco',
    name: 'Rajasthan Economy (अर्थव्यवस्था)',
    subtopics: [
      'आर्थिक समीक्षा: प्रमुख आंकड़े',
      'राज्य की फ्लैगशिप योजनाएं',
      'कृषि एवं औद्योगिक विकास',
      'राज्य का बजट एवं वित्तीय स्थिति',
      'आधारभूत ढांचा एवं सेवा क्षेत्र'
    ]
  }
];

export const OFFICIAL_EXAMS = [
  { name: "SI 2021 (GK & GS)", year: 2021, context: "Rajasthan Police Sub-Inspector 2021 Official Paper 2 (General Knowledge)", count: 100, tag: "Official", category: "Police" },
  { name: "SI 2021 (General Hindi)", year: 2021, context: "Rajasthan Police Sub-Inspector 2021 Official Paper 1 (Hindi)", count: 100, tag: "Official", category: "Police" },
  { name: "Lab Assistant 2022 (GK)", year: 2022, context: "RPSC Lab Assistant 2022 Paper 1 (General Knowledge & Rajasthan GK)", count: 100, tag: "Official", category: "Lab Assistant" },
  { name: "Lab Assistant 2022 (Science)", year: 2022, context: "RPSC Lab Assistant 2022 Paper 2 (General Science, Biology, Physics, Chemistry)", count: 100, tag: "Official", category: "Lab Assistant" },
  { name: "RAS Prelims 2023", year: 2023, context: "RPSC RAS Pre 2023 Official Paper", count: 150, tag: "Premium", category: "RAS" },
  { name: "CET Graduate 2024", year: 2024, context: "RSSB CET Graduate Level 2024 Official Paper", count: 150, tag: "Recent", category: "CET" },
  { name: "Junior Accountant 2024", year: 2024, context: "RSSB Junior Accountant 2024 Exam", count: 75, tag: "Official", category: "Accountant" },
  { name: "Patwar 2021 Main", year: 2021, context: "RSSB Patwari 2021 Final Paper", count: 150, tag: "Official", category: "Patwar" },
  { name: "VDO Pre 2021", year: 2021, context: "RSSB VDO Prelims 2021 Paper", count: 100, tag: "Official", category: "VDO" },
  { name: "LDC 2024 Mock", year: 2024, context: "RSSB LDC 2024 Pattern Mock Paper", count: 100, tag: "Mock", category: "LDC" }
];
