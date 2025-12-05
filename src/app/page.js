// pages.js
'use client';
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const q = query(collection(db, "questions"), where("active", "==", true));
        const querySnapshot = await getDocs(q);
        const questionsArray = [];
        querySnapshot.forEach((doc) => {
          questionsArray.push({ id: doc.id, ...doc.data() });
        });
        setQuestions(questionsArray);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  return (
    <div className=" min-h-screen w-full bg-contain bg-white text-gray-800 flex flex-col relative   " 
    > {/* White background for the entire page */}
     <div
        className="absolute inset-0 bg-cover bg-center opacity-50  "
        style={{ backgroundImage: "url('/images/bg.png')" }}
      ></div>
      <div className=' flex flex-col w-full h-[100px] justify-center  items-start mb-8 pl-8 p-4 z-10' >
          <Image src='/images/azerisiq-logo.png' alt="logo" width={200} height={200} />
          <h2 className="pt-2 text-xs font-semibold italic">KOMANDA QURUCULUĞU və İNNOVATİV HƏLLƏR</h2>
        </div> 
      <div className="flex flex-col mt-4 p-4 z-10 mb-20">
        <h1 className="text-3xl font-bold mb-6 w-full text-center text-gray-900">Suallar</h1>

        {loading ? (
          <div className="grid gap-6 w-full sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-full rounded-2xl bg-white/70 border border-gray-200 p-6 shadow-sm animate-pulse"
              >
                <div className="h-5 w-3/4 bg-gray-300 rounded mb-3" />
                <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                <div className="h-4 w-5/6 bg-gray-200 rounded mb-4" />
                <div className="h-9 w-full bg-gray-300 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 w-full sm:grid-cols-2 lg:grid-cols-3">
            {questions.map((question) => (
              <div
                key={question.id}
                className="w-full rounded-2xl bg-white/90 border border-gray-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 backdrop-blur-sm"
              >
                <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
                  {question.title}
                </h2>
                <Link
                  href={`/${question.id}`}
                  className="inline-flex items-center justify-center mt-4 w-full px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all duration-200"
                >
                  Cavabla
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

        <div className="h-[50px] w-full   bottom-0 justify-center  absolute z-10 ">
          <h2 className="text-xs font-semibold italic w-full text-center" >UĞUR, İNKİŞAF VƏ FƏRQLİLİYƏ GEDƏN </h2>
          <h2 className="text-xs font-semibold italic w-full text-center">“İŞIQLI YOL”</h2>
        </div>
      
    </div>
  );
}
