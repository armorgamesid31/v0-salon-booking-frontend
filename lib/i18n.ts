export type LanguageCode = 'tr' | 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ru' | 'zh' | 'ar' | 'hi'

export const DEFAULT_LANGUAGE: LanguageCode = 'tr'

export const LANGUAGES: Array<{ code: LanguageCode; label: string }> = [
  { code: 'tr', label: 'Turkce' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Espanol' },
  { code: 'fr', label: 'Francais' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Portugues' },
  { code: 'ru', label: 'Russkiy' },
  { code: 'zh', label: 'Zhongwen' },
  { code: 'ar', label: 'Arabiyya' },
  { code: 'hi', label: 'Hindi' },
]

const SUPPORTED = new Set(LANGUAGES.map((l) => l.code))

export function normalizeLanguage(value?: string | null): LanguageCode {
  if (!value) return DEFAULT_LANGUAGE
  const short = value.toLowerCase().split('-')[0] as LanguageCode
  if (SUPPORTED.has(short)) return short
  return DEFAULT_LANGUAGE
}

export function detectBrowserLanguage(): LanguageCode {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  return normalizeLanguage(window.navigator.language)
}

export const BOOKING_TEXT: Record<
  LanguageCode,
  {
    welcomeDefault: string
    welcomeBack: (name: string) => string
    people: string
    searchPlaceholder: string
    add: string
    added: string
    selectDate: string
    selectTime: string
    noAppointment: string
    confirmAppointment: string
    selectSpecialist: string
    confirmSelection: string
    completeProfile: string
    fullName: string
    phone: string
    registerContinue: string
    approvalTitle: string
    dateAndTime: string
    details: string
    services: string
    completeBooking: string
    bookingInProgress: string
    successTitle: string
    successInfo: string
    successButton: string
    openWhatsapp: string
    loading: string
    fillInfoError: string
    genericError: string
    bookingFailed: string
    dashboard?: {
      packagesTitle: string
      appointmentsTitle: string
      packageServiceCountLabel: (count: number) => string
      packageExpiresLabel: (dateLabel: string) => string
      packageNoExpiry: string
      packageNoActive: string
      packagePolicyNote: string
      packageQuotaHintUse: string
      packageQuotaHintEmpty: string
      packageAdd: string
      packageRemove: string
      packageOutOfQuota: string
      appointmentsEmpty: string
      specialistLabel: string
      includesRescheduledRecord: string
      actionRepeat: string
      actionCancel: string
      actionUpdate: string
      actionEvaluate: string
      secureLinkRequiredUpdate: string
      secureLinkRequiredCancel: string
      secureLinkRequiredFeedback: string
      cancelConfirm: string
      cancellationFailed: string
      noServiceToRepeat: string
      serviceFilterMismatch: string
      packageServiceLoadFailed: string
      noQuotaLeftForPackageService: string
      selectValidDateTime: string
      rescheduleSlotUnavailable: string
      reschedulePreviewFailed: string
      rescheduleConflict: string
      rescheduleFailed: string
      feedbackSaveFailed: string
      packageBadge: string
      manualBadge: string
      statusBooked: string
      statusConfirmed: string
      statusUpdated: string
      statusCompleted: string
      statusCancelled: string
      statusNoShow: string
      statusDefault: string
      totalLabel: string
      paymentFreeLabel: string
      fromPackageLabel: string
      removeManual: string
      minuteUnit: string
      rescheduleTitle: string
      rescheduleDescription: string
      dateLabel: string
      timeLabel: string
      checkingLabel: string
      checkAvailabilityLabel: string
      chooseSpecialistPrompt: string
      cancelButton: string
      savingLabel: string
      confirmUpdateLabel: string
    }
  }
> = {
  tr: {
    welcomeDefault: 'Hos geldiniz! Bugun sizi simartmaya haziriz.',
    welcomeBack: (name) => `Selamlar ${name}, tekrar hos geldin!`,
    people: 'kisi',
    searchPlaceholder: 'Hizmet ara...',
    add: 'Ekle',
    added: 'Eklendi',
    selectDate: 'Tarih Secin',
    selectTime: 'Saat Secin',
    noAppointment: 'Randevu bulunamadi.',
    confirmAppointment: 'Randevuyu Onayla',
    selectSpecialist: 'Uzman Sec',
    confirmSelection: 'Secimi Onayla',
    completeProfile: 'Kaydini Tamamla',
    fullName: 'Ad Soyad',
    phone: 'Telefon',
    registerContinue: 'Kayit Ol ve Devam Et',
    approvalTitle: 'Randevu Onayi',
    dateAndTime: 'Tarih ve Saat',
    details: 'Detaylar',
    services: 'Hizmetler',
    completeBooking: 'Randevuyu Tamamla',
    bookingInProgress: 'Onaylaniyor...',
    successTitle: 'Randevunuz Alindi!',
    successInfo: 'Onay mesaji telefonunuza gonderilecektir.',
    successButton: 'Harika!',
    openWhatsapp: 'WhatsApp',
    loading: 'Yukleniyor...',
    fillInfoError: 'Lutfen bilgilerinizi doldurun.',
    genericError: 'Bir hata olustu.',
    bookingFailed: 'Randevu olusturulamadi.',
    dashboard: {
      packagesTitle: 'Paketlerim',
      appointmentsTitle: 'Randevularim',
      packageServiceCountLabel: (count) => `${count} hizmet`,
      packageExpiresLabel: (dateLabel) => `Bitis: ${dateLabel}`,
      packageNoExpiry: 'Bitis tarihi yok',
      packageNoActive: 'Aktif paket bulunamadi.',
      packagePolicyNote: 'Sadece aktif paketler listelenir. Ozel kombin paketleri salon tarafinda olusturulur.',
      packageQuotaHintUse: 'Bu hak secili randevuya uygulanir',
      packageQuotaHintEmpty: 'Hak kalmadi',
      packageAdd: 'Ekle',
      packageRemove: 'Cikar',
      packageOutOfQuota: 'Hak yok',
      appointmentsEmpty: 'Henüz randevu bulunmuyor.',
      specialistLabel: 'Uzman',
      includesRescheduledRecord: 'Bu kayitta ertelenen randevu gecmisi var',
      actionRepeat: 'Tekrarla',
      actionCancel: 'Iptal Et',
      actionUpdate: 'Guncelle',
      actionEvaluate: 'Degerlendir',
      secureLinkRequiredUpdate: 'Randevu guncellemek icin guvenli baglanti gerekli.',
      secureLinkRequiredCancel: 'Randevu iptal etmek icin guvenli baglanti gerekli.',
      secureLinkRequiredFeedback: 'Degerlendirme gondermek icin guvenli baglanti gerekli.',
      cancelConfirm: 'Secili randevulari iptal etmek istiyor musunuz?',
      cancellationFailed: 'Iptal islemi basarisiz oldu.',
      noServiceToRepeat: 'Tekrarlamak icin hizmet bilgisi bulunamadi.',
      serviceFilterMismatch: 'Bu hizmetler mevcut filtrede gorunmuyor. Lutfen filtreyi degistirin.',
      packageServiceLoadFailed: 'Paket hizmeti yuklenemedi. Sayfayi yenileyip tekrar deneyin.',
      noQuotaLeftForPackageService: 'Bu paket hizmeti icin hak kalmadi.',
      selectValidDateTime: 'Lutfen gecerli tarih ve saat secin.',
      rescheduleSlotUnavailable: 'Secilen saat uygun degil.',
      reschedulePreviewFailed: 'Onizleme olusturulamadi.',
      rescheduleConflict: 'Takvim cakismasi var.',
      rescheduleFailed: 'Randevu guncellenemedi.',
      feedbackSaveFailed: 'Degerlendirme kaydedilemedi.',
      packageBadge: 'paket',
      manualBadge: 'manuel',
      statusBooked: 'Rezerve',
      statusConfirmed: 'Onaylandi',
      statusUpdated: 'Guncellendi',
      statusCompleted: 'Tamamlandi',
      statusCancelled: 'Iptal',
      statusNoShow: 'Gelmedi',
      statusDefault: 'Rezerve',
      totalLabel: 'Toplam',
      paymentFreeLabel: 'Ucretsiz',
      fromPackageLabel: 'Paketten',
      removeManual: 'Manuel Cikar',
      minuteUnit: 'dk',
      rescheduleTitle: 'Randevuyu Guncelle',
      rescheduleDescription: 'Yeni tarih ve saat secin. Ardisik hizmetler birlikte tasinir ve sure korunur.',
      dateLabel: 'Tarih',
      timeLabel: 'Saat',
      checkingLabel: 'Kontrol ediliyor...',
      checkAvailabilityLabel: 'Musaitlik Kontrol Et',
      chooseSpecialistPrompt: 'Tercih edilen uzman musait degil. Lutfen uzman secin:',
      cancelButton: 'Vazgec',
      savingLabel: 'Kaydediliyor...',
      confirmUpdateLabel: 'Guncellemeyi Onayla',
    },
  },
  en: {
    welcomeDefault: 'Welcome! We are ready for your beauty appointment.',
    welcomeBack: (name) => `Welcome back, ${name}!`,
    people: 'people',
    searchPlaceholder: 'Search service...',
    add: 'Add',
    added: 'Added',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    noAppointment: 'No appointment slots found.',
    confirmAppointment: 'Confirm Appointment',
    selectSpecialist: 'Choose Specialist',
    confirmSelection: 'Confirm Selection',
    completeProfile: 'Complete Your Profile',
    fullName: 'Full Name',
    phone: 'Phone',
    registerContinue: 'Register and Continue',
    approvalTitle: 'Appointment Confirmation',
    dateAndTime: 'Date & Time',
    details: 'Details',
    services: 'Services',
    completeBooking: 'Complete Appointment',
    bookingInProgress: 'Confirming...',
    successTitle: 'Your appointment is booked!',
    successInfo: 'A confirmation message will be sent to your phone.',
    successButton: 'Great!',
    openWhatsapp: 'WhatsApp',
    loading: 'Loading...',
    fillInfoError: 'Please fill in your details.',
    genericError: 'An error occurred.',
    bookingFailed: 'Appointment could not be created.',
    dashboard: {
      packagesTitle: 'My Packages',
      appointmentsTitle: 'My Appointments',
      packageServiceCountLabel: (count) => `${count} services`,
      packageExpiresLabel: (dateLabel) => `Expires: ${dateLabel}`,
      packageNoExpiry: 'No expiry date',
      packageNoActive: 'No active package found.',
      packagePolicyNote: 'Only active packages are listed here. Custom combinations are created by the salon.',
      packageQuotaHintUse: 'This balance will be used for current booking',
      packageQuotaHintEmpty: 'No quota left',
      packageAdd: 'Add',
      packageRemove: 'Remove',
      packageOutOfQuota: 'No quota',
      appointmentsEmpty: 'No appointments found yet.',
      specialistLabel: 'Specialist',
      includesRescheduledRecord: 'Includes rescheduled record',
      actionRepeat: 'Repeat',
      actionCancel: 'Cancel',
      actionUpdate: 'Update',
      actionEvaluate: 'Evaluate',
      secureLinkRequiredUpdate: 'Secure booking link is required to update this appointment.',
      secureLinkRequiredCancel: 'Secure booking link is required to cancel this appointment.',
      secureLinkRequiredFeedback: 'Secure booking link is required to submit feedback.',
      cancelConfirm: 'Cancel selected appointment(s)?',
      cancellationFailed: 'Cancellation failed.',
      noServiceToRepeat: 'No service information found to repeat this appointment.',
      serviceFilterMismatch: 'These services are not available in current filter. Try changing filter.',
      packageServiceLoadFailed: 'Package service could not be loaded. Please refresh the page and try again.',
      noQuotaLeftForPackageService: 'No quota left for this service in selected package.',
      selectValidDateTime: 'Please select a valid date and time.',
      rescheduleSlotUnavailable: 'Selected slot is not available.',
      reschedulePreviewFailed: 'Preview could not be generated.',
      rescheduleConflict: 'There is a scheduling conflict.',
      rescheduleFailed: 'Reschedule failed.',
      feedbackSaveFailed: 'Feedback could not be saved.',
      packageBadge: 'package',
      manualBadge: 'manual',
      statusBooked: 'Booked',
      statusConfirmed: 'Confirmed',
      statusUpdated: 'Updated',
      statusCompleted: 'Completed',
      statusCancelled: 'Cancelled',
      statusNoShow: 'No-show',
      statusDefault: 'Booked',
      totalLabel: 'Total',
      paymentFreeLabel: 'Free',
      fromPackageLabel: 'From package',
      removeManual: 'Remove Manual',
      minuteUnit: 'min',
      rescheduleTitle: 'Update Appointment',
      rescheduleDescription: 'Select a new date and time. Back-to-back services will move together and keep their duration.',
      dateLabel: 'Date',
      timeLabel: 'Time',
      checkingLabel: 'Checking...',
      checkAvailabilityLabel: 'Check Availability',
      chooseSpecialistPrompt: 'Preferred specialist is unavailable. Please choose one:',
      cancelButton: 'Cancel',
      savingLabel: 'Saving...',
      confirmUpdateLabel: 'Confirm Update',
    },
  },
  es: {
    welcomeDefault: 'Bienvenido. Tu cita de belleza esta lista.',
    welcomeBack: (name) => `Bienvenido de nuevo, ${name}.`,
    people: 'personas',
    searchPlaceholder: 'Buscar servicio...',
    add: 'Agregar',
    added: 'Agregado',
    selectDate: 'Seleccionar fecha',
    selectTime: 'Seleccionar hora',
    noAppointment: 'No hay horarios disponibles.',
    confirmAppointment: 'Confirmar cita',
    selectSpecialist: 'Elegir especialista',
    confirmSelection: 'Confirmar seleccion',
    completeProfile: 'Completa tu perfil',
    fullName: 'Nombre completo',
    phone: 'Telefono',
    registerContinue: 'Registrarse y continuar',
    approvalTitle: 'Confirmacion de cita',
    dateAndTime: 'Fecha y hora',
    details: 'Detalles',
    services: 'Servicios',
    completeBooking: 'Finalizar cita',
    bookingInProgress: 'Confirmando...',
    successTitle: 'Tu cita esta reservada.',
    successInfo: 'Recibiras un mensaje de confirmacion.',
    successButton: 'Perfecto',
    openWhatsapp: 'WhatsApp',
    loading: 'Cargando...',
    fillInfoError: 'Por favor completa tus datos.',
    genericError: 'Ocurrio un error.',
    bookingFailed: 'No se pudo crear la cita.',
  },
  fr: {
    welcomeDefault: 'Bienvenue. Votre reservation est prete.',
    welcomeBack: (name) => `Bon retour, ${name}.`,
    people: 'personnes',
    searchPlaceholder: 'Rechercher un service...',
    add: 'Ajouter',
    added: 'Ajoute',
    selectDate: 'Choisir la date',
    selectTime: 'Choisir l heure',
    noAppointment: 'Aucun creneau disponible.',
    confirmAppointment: 'Confirmer le rendez-vous',
    selectSpecialist: 'Choisir un specialiste',
    confirmSelection: 'Confirmer le choix',
    completeProfile: 'Completer votre profil',
    fullName: 'Nom complet',
    phone: 'Telephone',
    registerContinue: 'S inscrire et continuer',
    approvalTitle: 'Confirmation du rendez-vous',
    dateAndTime: 'Date et heure',
    details: 'Details',
    services: 'Services',
    completeBooking: 'Finaliser le rendez-vous',
    bookingInProgress: 'Confirmation...',
    successTitle: 'Votre rendez-vous est confirme.',
    successInfo: 'Un message de confirmation sera envoye.',
    successButton: 'Super',
    openWhatsapp: 'WhatsApp',
    loading: 'Chargement...',
    fillInfoError: 'Veuillez remplir vos informations.',
    genericError: 'Une erreur est survenue.',
    bookingFailed: 'Impossible de creer le rendez-vous.',
  },
  de: {
    welcomeDefault: 'Willkommen. Ihre Buchung ist bereit.',
    welcomeBack: (name) => `Willkommen zuruck, ${name}.`,
    people: 'Personen',
    searchPlaceholder: 'Service suchen...',
    add: 'Hinzufugen',
    added: 'Hinzugefugt',
    selectDate: 'Datum auswahlen',
    selectTime: 'Uhrzeit auswahlen',
    noAppointment: 'Keine Termine verfugbar.',
    confirmAppointment: 'Termin bestatigen',
    selectSpecialist: 'Spezialist wahlen',
    confirmSelection: 'Auswahl bestatigen',
    completeProfile: 'Profil vervollstandigen',
    fullName: 'Vollstandiger Name',
    phone: 'Telefon',
    registerContinue: 'Registrieren und fortfahren',
    approvalTitle: 'Terminbestatigung',
    dateAndTime: 'Datum und Uhrzeit',
    details: 'Details',
    services: 'Leistungen',
    completeBooking: 'Termin abschliessen',
    bookingInProgress: 'Wird bestatigt...',
    successTitle: 'Ihr Termin wurde gebucht.',
    successInfo: 'Eine Bestatigung wurde gesendet.',
    successButton: 'Super',
    openWhatsapp: 'WhatsApp',
    loading: 'Wird geladen...',
    fillInfoError: 'Bitte Daten ausfullen.',
    genericError: 'Ein Fehler ist aufgetreten.',
    bookingFailed: 'Termin konnte nicht erstellt werden.',
  },
  pt: {
    welcomeDefault: 'Bem-vindo. Sua reserva esta pronta.',
    welcomeBack: (name) => `Bem-vindo novamente, ${name}.`,
    people: 'pessoas',
    searchPlaceholder: 'Buscar servico...',
    add: 'Adicionar',
    added: 'Adicionado',
    selectDate: 'Selecionar data',
    selectTime: 'Selecionar horario',
    noAppointment: 'Nenhum horario disponivel.',
    confirmAppointment: 'Confirmar agendamento',
    selectSpecialist: 'Escolher especialista',
    confirmSelection: 'Confirmar selecao',
    completeProfile: 'Complete seu cadastro',
    fullName: 'Nome completo',
    phone: 'Telefone',
    registerContinue: 'Cadastrar e continuar',
    approvalTitle: 'Confirmacao do agendamento',
    dateAndTime: 'Data e hora',
    details: 'Detalhes',
    services: 'Servicos',
    completeBooking: 'Finalizar agendamento',
    bookingInProgress: 'Confirmando...',
    successTitle: 'Seu agendamento foi confirmado.',
    successInfo: 'Uma mensagem de confirmacao sera enviada.',
    successButton: 'Perfeito',
    openWhatsapp: 'WhatsApp',
    loading: 'Carregando...',
    fillInfoError: 'Preencha suas informacoes.',
    genericError: 'Ocorreu um erro.',
    bookingFailed: 'Nao foi possivel criar o agendamento.',
  },
  ru: {
    welcomeDefault: 'Dobro pozhalovat. Vasha zapis gotova.',
    welcomeBack: (name) => `S vozvrashcheniem, ${name}.`,
    people: 'chelovek',
    searchPlaceholder: 'Poisk uslugi...',
    add: 'Dobavit',
    added: 'Dobavleno',
    selectDate: 'Vybrat datu',
    selectTime: 'Vybrat vremya',
    noAppointment: 'Svobodnyh okon net.',
    confirmAppointment: 'Podtverdit zapis',
    selectSpecialist: 'Vybrat specialista',
    confirmSelection: 'Podtverdit vybor',
    completeProfile: 'Zavershite registraciyu',
    fullName: 'Polnoe imya',
    phone: 'Telefon',
    registerContinue: 'Zaregistrirovatsya i prodolzhit',
    approvalTitle: 'Podtverzhdenie zapisi',
    dateAndTime: 'Data i vremya',
    details: 'Detali',
    services: 'Uslugi',
    completeBooking: 'Zavershit zapis',
    bookingInProgress: 'Podtverzhdaetsya...',
    successTitle: 'Vasha zapis uspeshna.',
    successInfo: 'Podtverzhdenie budet otpravleno.',
    successButton: 'Otlichno',
    openWhatsapp: 'WhatsApp',
    loading: 'Zagruzka...',
    fillInfoError: 'Pozhaluysta, zapolnite dannye.',
    genericError: 'Proizoshla oshibka.',
    bookingFailed: 'Ne udalos sozdat zapis.',
  },
  zh: {
    welcomeDefault: 'Huanying, nin de yuyue yi zhunbei hao.',
    welcomeBack: (name) => `Huan ying hui lai, ${name}.`,
    people: 'ren',
    searchPlaceholder: 'Sousuo fuwu...',
    add: 'Tianjia',
    added: 'Yitianjia',
    selectDate: 'Xuanze riqi',
    selectTime: 'Xuanze shijian',
    noAppointment: 'Meiyou keyong shijian.',
    confirmAppointment: 'Que ren yuyue',
    selectSpecialist: 'Xuanze zhuanjia',
    confirmSelection: 'Que ren xuanze',
    completeProfile: 'Wanshan xinxi',
    fullName: 'Xingming',
    phone: 'Dianhua',
    registerContinue: 'Zhuce bing jixu',
    approvalTitle: 'Yuyue queren',
    dateAndTime: 'Riqi he shijian',
    details: 'Xiangqing',
    services: 'Fuwu',
    completeBooking: 'Wancheng yuyue',
    bookingInProgress: 'Queren zhong...',
    successTitle: 'Nin de yuyue chenggong.',
    successInfo: 'Queren xinxi jiang fasong dao nin de shouji.',
    successButton: 'Hao de',
    openWhatsapp: 'WhatsApp',
    loading: 'Jiazai zhong...',
    fillInfoError: 'Qing xian wanshan xinxi.',
    genericError: 'Fasheng cuowu.',
    bookingFailed: 'Wu fa chuangjian yuyue.',
  },
  ar: {
    welcomeDefault: 'Ahlan bik, hajezak jahiz.',
    welcomeBack: (name) => `Marhaban marra okhra, ${name}.`,
    people: 'ashkhas',
    searchPlaceholder: 'Ibhath an khidma...',
    add: 'Idafa',
    added: 'Tam',
    selectDate: 'Ikhtar at-tarikh',
    selectTime: 'Ikhtar al-waqt',
    noAppointment: 'La tujad mawaeid mutaha.',
    confirmAppointment: 'Ta kid al-mawed',
    selectSpecialist: 'Ikhtar al-mukhtass',
    confirmSelection: 'Ta kid al-ikhtiyar',
    completeProfile: 'Akmil bayanatak',
    fullName: 'Al-ism al-kamil',
    phone: 'Raqm al-hatif',
    registerContinue: 'Tasjil wa mutaba a',
    approvalTitle: 'Ta kid al-hajz',
    dateAndTime: 'At-tarikh wa al-waqt',
    details: 'At-tafasil',
    services: 'Al-khadamat',
    completeBooking: 'Ikmal al-hajz',
    bookingInProgress: 'Yatimm at-ta kid...',
    successTitle: 'Tam hajzuk binajah.',
    successInfo: 'Sayusalu ilayk risalat ta kid.',
    successButton: 'Mumtaz',
    openWhatsapp: 'WhatsApp',
    loading: 'Jari at-tahmil...',
    fillInfoError: 'Yurja idkhal al-bayanat.',
    genericError: 'Hadath khata.',
    bookingFailed: 'Taadhar insha al-hajz.',
  },
  hi: {
    welcomeDefault: 'Swagat hai, aapki booking tayyar hai.',
    welcomeBack: (name) => `Phir se swagat hai, ${name}.`,
    people: 'log',
    searchPlaceholder: 'Seva khojen...',
    add: 'Jodein',
    added: 'Jod diya',
    selectDate: 'Tarikh chunen',
    selectTime: 'Samay chunen',
    noAppointment: 'Koi slot uplabdh nahi hai.',
    confirmAppointment: 'Appointment confirm karein',
    selectSpecialist: 'Specialist chunen',
    confirmSelection: 'Chayan pushti karein',
    completeProfile: 'Apni jankari puri karein',
    fullName: 'Pura naam',
    phone: 'Phone',
    registerContinue: 'Register karke aage badhein',
    approvalTitle: 'Appointment confirmation',
    dateAndTime: 'Tarikh aur samay',
    details: 'Vivaran',
    services: 'Sevayen',
    completeBooking: 'Booking puri karein',
    bookingInProgress: 'Confirm ho raha hai...',
    successTitle: 'Aapki booking ho gayi hai.',
    successInfo: 'Confirmation message phone par bheja jayega.',
    successButton: 'Bahut badhiya',
    openWhatsapp: 'WhatsApp',
    loading: 'Load ho raha hai...',
    fillInfoError: 'Kripya apni jankari bharen.',
    genericError: 'Ek truti hui.',
    bookingFailed: 'Booking nahi ban payi.',
  },
}

export const HOME_TEXT: Record<
  LanguageCode,
  {
    bookNow: string
    reserveAppointment: string
    aboutTitle: string
    galleryTitle: string
    instagramTitle: string
    contactTitle: string
    expertsTitle: string
    openWhatsapp: string
    workingSchedule: string
    categories: string
    servicesCount: (count: number) => string
    clientReviews: string
    getInTouch: string
    loading: string
    tenantNotFoundTitle: string
    tenantNotFoundDesc: string
  }
> = {
  tr: {
    bookNow: 'Randevu Al',
    reserveAppointment: 'Randevu Olustur',
    aboutTitle: 'Salon Hakkinda',
    galleryTitle: 'Galeri',
    instagramTitle: 'Instagram',
    contactTitle: 'Iletisim Bilgileri',
    expertsTitle: 'Uzman Ekibimiz',
    openWhatsapp: 'WhatsApp ile Yaz',
    workingSchedule: 'Calisma Programi',
    categories: 'Kategoriler',
    servicesCount: (count) => `${count} hizmet`,
    clientReviews: 'Musteri Yorumlari',
    getInTouch: 'Iletisim',
    loading: 'Yukleniyor...',
    tenantNotFoundTitle: 'Bu web sitesi bulunamadi',
    tenantNotFoundDesc: 'Girdiginiz salon adresi kayitli degil. Linki kontrol edip tekrar deneyin.',
  },
  en: {
    bookNow: 'Book Now',
    reserveAppointment: 'Reserve Your Appointment',
    aboutTitle: 'About the Salon',
    galleryTitle: 'Gallery',
    instagramTitle: 'Instagram',
    contactTitle: 'Contact Information',
    expertsTitle: 'Our Experts',
    openWhatsapp: 'Chat on WhatsApp',
    workingSchedule: 'Working Schedule',
    categories: 'Categories',
    servicesCount: (count) => `${count} services`,
    clientReviews: 'Client Reviews',
    getInTouch: 'Get in Touch',
    loading: 'Loading...',
    tenantNotFoundTitle: 'This website could not be found',
    tenantNotFoundDesc: 'The salon address you entered is not registered. Please check the link.',
  },
  es: {
    bookNow: 'Reservar',
    reserveAppointment: 'Reserva tu cita',
    aboutTitle: 'Sobre el salon',
    galleryTitle: 'Galeria',
    instagramTitle: 'Instagram',
    contactTitle: 'Contacto',
    expertsTitle: 'Nuestros expertos',
    openWhatsapp: 'Abrir WhatsApp',
    workingSchedule: 'Horario',
    categories: 'Categorias',
    servicesCount: (count) => `${count} servicios`,
    clientReviews: 'Resenas',
    getInTouch: 'Contacto',
    loading: 'Cargando...',
    tenantNotFoundTitle: 'No se encontro este sitio web',
    tenantNotFoundDesc: 'La direccion del salon no esta registrada.',
  },
  fr: {
    bookNow: 'Reserver',
    reserveAppointment: 'Reservez votre rendez-vous',
    aboutTitle: 'A propos du salon',
    galleryTitle: 'Galerie',
    instagramTitle: 'Instagram',
    contactTitle: 'Contact',
    expertsTitle: 'Nos experts',
    openWhatsapp: 'Ouvrir WhatsApp',
    workingSchedule: 'Horaires',
    categories: 'Categories',
    servicesCount: (count) => `${count} services`,
    clientReviews: 'Avis clients',
    getInTouch: 'Contact',
    loading: 'Chargement...',
    tenantNotFoundTitle: 'Ce site est introuvable',
    tenantNotFoundDesc: 'L adresse du salon n est pas enregistree.',
  },
  de: {
    bookNow: 'Jetzt buchen',
    reserveAppointment: 'Termin reservieren',
    aboutTitle: 'Uber den Salon',
    galleryTitle: 'Galerie',
    instagramTitle: 'Instagram',
    contactTitle: 'Kontakt',
    expertsTitle: 'Unsere Experten',
    openWhatsapp: 'WhatsApp offnen',
    workingSchedule: 'Arbeitszeiten',
    categories: 'Kategorien',
    servicesCount: (count) => `${count} Services`,
    clientReviews: 'Kundenbewertungen',
    getInTouch: 'Kontakt',
    loading: 'Wird geladen...',
    tenantNotFoundTitle: 'Diese Website wurde nicht gefunden',
    tenantNotFoundDesc: 'Die Salonadresse ist nicht registriert.',
  },
  pt: {
    bookNow: 'Agendar',
    reserveAppointment: 'Reserve seu horario',
    aboutTitle: 'Sobre o salao',
    galleryTitle: 'Galeria',
    instagramTitle: 'Instagram',
    contactTitle: 'Contato',
    expertsTitle: 'Nossos especialistas',
    openWhatsapp: 'Abrir WhatsApp',
    workingSchedule: 'Horario de atendimento',
    categories: 'Categorias',
    servicesCount: (count) => `${count} servicos`,
    clientReviews: 'Avaliacoes',
    getInTouch: 'Contato',
    loading: 'Carregando...',
    tenantNotFoundTitle: 'Este site nao foi encontrado',
    tenantNotFoundDesc: 'O endereco do salao nao esta registrado.',
  },
  ru: {
    bookNow: 'Zapisatsya',
    reserveAppointment: 'Zabronirovat vizit',
    aboutTitle: 'O salone',
    galleryTitle: 'Galereya',
    instagramTitle: 'Instagram',
    contactTitle: 'Kontakty',
    expertsTitle: 'Nashi specialisty',
    openWhatsapp: 'Otkryt WhatsApp',
    workingSchedule: 'Grafik raboty',
    categories: 'Kategorii',
    servicesCount: (count) => `${count} uslug`,
    clientReviews: 'Otzivy klientov',
    getInTouch: 'Kontakty',
    loading: 'Zagruzka...',
    tenantNotFoundTitle: 'Sait ne naiden',
    tenantNotFoundDesc: 'Adres salona ne zaregistrirovan.',
  },
  zh: {
    bookNow: 'Liji yuyue',
    reserveAppointment: 'Yuyue nin de fuwu',
    aboutTitle: 'Guanyu men dian',
    galleryTitle: 'Tuku',
    instagramTitle: 'Instagram',
    contactTitle: 'Lianxi xinxi',
    expertsTitle: 'Women de zhuanjia',
    openWhatsapp: 'Dak kai WhatsApp',
    workingSchedule: 'Yingye shijian',
    categories: 'Fenlei',
    servicesCount: (count) => `${count} xiang fuwu`,
    clientReviews: 'Kehu pingjia',
    getInTouch: 'Lianxi women',
    loading: 'Jiazai zhong...',
    tenantNotFoundTitle: 'Wei zhaodao gai wangzhan',
    tenantNotFoundDesc: 'Nin shuru de salon dizhi wei zhuce.',
  },
  ar: {
    bookNow: 'Ihjez al-an',
    reserveAppointment: 'Ihjez mawidak',
    aboutTitle: 'An as-salon',
    galleryTitle: 'Al-maarad',
    instagramTitle: 'Instagram',
    contactTitle: 'Bayanat al-ittisal',
    expertsTitle: 'Khobaraona',
    openWhatsapp: 'Iftah WhatsApp',
    workingSchedule: 'Mawaeid al-amal',
    categories: 'Al-fiat',
    servicesCount: (count) => `${count} khadamat`,
    clientReviews: 'Ara al-omalaa',
    getInTouch: 'Tawasol maana',
    loading: 'Jari at-tahmil...',
    tenantNotFoundTitle: 'Lam yuthar ala hatha al-mawqi',
    tenantNotFoundDesc: 'Alamat as-salon ghayr musajjal.',
  },
  hi: {
    bookNow: 'Abhi book karein',
    reserveAppointment: 'Apni appointment reserve karein',
    aboutTitle: 'Salon ke baare mein',
    galleryTitle: 'Gallery',
    instagramTitle: 'Instagram',
    contactTitle: 'Sampark jankari',
    expertsTitle: 'Hamare experts',
    openWhatsapp: 'WhatsApp kholen',
    workingSchedule: 'Working schedule',
    categories: 'Categories',
    servicesCount: (count) => `${count} services`,
    clientReviews: 'Client reviews',
    getInTouch: 'Sampark karein',
    loading: 'Load ho raha hai...',
    tenantNotFoundTitle: 'Yeh website nahi mili',
    tenantNotFoundDesc: 'Jo salon address dala gaya hai wo registered nahi hai.',
  },
}

export const LOCALE_MAP: Record<LanguageCode, string> = {
  tr: 'tr-TR',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-PT',
  ru: 'ru-RU',
  zh: 'zh-CN',
  ar: 'ar-SA',
  hi: 'hi-IN',
}
