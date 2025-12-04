"use client";
import Image from "next/image";
import React, { useState } from "react";
import { motion } from "framer-motion";

// Cevapları tanımlayın
const responses = [
  
    "Çox yaxşı dəyişiklik!",
    "Çox sürətli cavab verirlər.",
    "Bu yenilik faydalıdır.",
    "Həqiqətən daha yaxşı oldu.",
    "Hər şey daha sürətli işləyir.",
    "Təkmilləşdirmə çox gözəl.",
    "İnnovativ yanaşma var.",
    "Xidmət keyfiyyəti artıb.",
    "Yeni xüsusiyyətlər çox faydalıdır.",
    "Yeniliklər çox təsirli.",
    "Həqiqətən istifadə rahatlığı artırıb.",
    "Çox yaxşı təcrübə yaşadım.",
    "Sistemin yenilənməsi çox gözəl olub.",
    "İşləri çox asanlaşdırıb.",
    "Dəyişikliklər yaxşı oldu.",
    "Çox təsirli bir inkişaf.",
    "Bütün proses sürətləndi.",
    "Mükəmməl iş görmüsünüz.",
    "İnnovativ yanaşma ilə irəliləmişlər.",
    "Çox faydalı yeni funksiyalar əlavə edilib.",
    "Yeni sistem çox effektiv işləyir.",
    "Çox praktiki yeniliklər var.",
    "Sistemin optimallaşdırılması gözəl olub.",
    "Çox müsbət dəyişikliklər.",
    "Dəyişikliklər yaxşı deyil.",
    "Yavaş işləyir.",
    "Bu yenilik faydalı deyil.",
    "Çətinliklə istifadə olunur.",
    "Proses çox mürəkkəb oldu.",
    "Dəyişikliklər mənfi təsir göstərdi.",
    "Xidmət keyfiyyəti azalıb.",
    "Yeni xüsusiyyətlər işləmir.",
    "Bu yenilikdə problem var.",
    "Sistem çox yavaşdır.",
    "Prosesdə çətinlik yaşadım.",
    "Hələ də çox iş var.",
    "Dəyişikliklər gözlədiyim kimi deyil.",
    "Sistemdə çox xətalar var.",
    "Yenilik heç bir fərq yaratmadı.",
    "Çox çətin istifadə olunur.",
    "İnnovasiya çox yaxşı deyil.",
    "Sistemdə hələ də problemlər var.",
    "Faydalı dəyişiklik görmədim.",
    "Çox mürəkkəb oldu.",
    "Təsirsiz dəyişikliklər.",
    "Çalışanlar hələ də köhnə üsulları istifadə edir."
  
];

// Uzun cümleleri belirlemek için fonksiyon
const isLongResponse = (text, limit = 17) => text.length > limit;

// CircularResponseGrid component
const CircularResponseGrid = () => {
  return (
    <div className="relative w-full min-h-screen overflow-y-auto flex flex-col items-center bg-[#F9F0E3]">
      {/* Arka plan resmi */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: "url('/images/presBgImage.png')", zIndex: 0 }}
      ></div>

      {/* Logo ve başlık kısmı */}
      <div className="w-full flex flex-col items-start p-8 z-10">
        <Image src='/images/azerisiq-logo.png' alt="logo" width={200} height={200} />
        <h2 className="pt-2 text-xs font-semibold italic text-black">KOMANDA QURUCULUĞU və İNNOVATİV HƏLLƏR</h2>
      </div>

      {/* İçerik kısmı */}
      <div className="flex-grow flex justify-center items-center p-4 pt-1 pb-8 w-full z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full">
          {responses.map((text, index) => (
            <motion.div
              key={index}
              className={`bg-[#D8BA8D] bg-opacity-95 text-blue-900 p-6 rounded-full text-center shadow-md ${
                isLongResponse(text) ? "col-span-2" : ""
              }`}
              initial={{ opacity: 0, rotateY: -180 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{
                type: "spring",
                stiffness: 70,
                damping: 25,
                delay: index * 0.1,
              }}
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              <p className="text-sm font-semibold">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* En alttaki yazı */}
      <div className="w-full text-black flex flex-col items-center py-2 mt-auto z-20">
        <h2 className="text-xs font-semibold italic">UĞUR, İNKİŞAF VƏ FƏRQLİLİYƏ GEDƏN</h2>
        <h2 className="text-xs font-semibold italic">“İŞIQLI YOL”</h2>
      </div>
    </div>
  );
};

// App component
const App = () => <CircularResponseGrid />;

export default App;
