"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter , useParams } from 'next/navigation';  // Correct import
import { motion } from "framer-motion";
import { db } from '../../../../../firebase';
import { collection, getDocs } from 'firebase/firestore';

const isLongResponse = (text, limit = 17) => text.length > limit;

const CircularResponseGrid = () => {
  const router = useRouter();  // Using useRouter hook
  const { slug } = useParams();  // Accessing the slug from the router.query
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;  // If slug is not available yet, return early

    const fetchQuestion = async () => {
      try {
        const questionsRef = collection(db, 'questions');
        const querySnapshot = await getDocs(questionsRef);
        const questionsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const matchedQuestion = questionsArray.find(question => question.id === slug);
        if (matchedQuestion) {
          setQuestion(matchedQuestion);
        } else {
          setError(`No question found with ID: ${slug}`);
        }
      } catch (err) {
        setError('Error fetching data: ' + err.message);
      }
      setLoading(false);
    };

    fetchQuestion();
  }, [slug]);  // Fetch when slug changes

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!question) {
    return <div>No question found. {slug}</div>;
  }

  

  return (
    <div className="relative w-full min-h-screen overflow-y-auto flex flex-col items-center bg-[#F8F0E2]">
      <div className="absolute inset-0 bg-cover bg-center opacity-50 "
        style={{ backgroundImage: "url('/images/presBgImage.png')", zIndex: 0 }}></div>

      <div className="w-full flex flex-col items-start p-8 z-10">
        <Image src='/images/azerisiq-logo.png' alt="logo" width={200} height={200} />
        <h2 className="pt-2 text-xs font-semibold italic text-black">KOMANDA QURUCULUĞU və İNNOVATİV HƏLLƏR</h2>
      </div>

      <div className="flex-grow flex justify-center items-center p-4 pt-1 pb-8 w-full z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full">
        {question.answers && question.answers.map((ans, index) => (
            <motion.div
              key={index}
              className={`bg-[#D8BA8D] bg-opacity-95 text-blue-900 p-6 rounded-full text-center shadow-md ${isLongResponse(ans.answer) ? "col-span-2" : ""}`}
              initial={{ opacity: 0, rotateY: -180 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{ type: "spring", stiffness: 70, damping: 25, delay: index * 0.1 }}
              style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
            >
              <p className="text-sm font-semibold">{ans.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="w-full text-black flex flex-col items-center py-2 mt-auto z-20">
        <h2 className="text-xs font-semibold italic">UĞUR, İNKİŞAF VƏ FƏRQLİLİYƏ GEDƏN</h2>
        <h2 className="text-xs font-semibold italic">“İŞIQLI YOL”</h2>
      </div>
    </div>
  );
};

const App = () => <CircularResponseGrid />;

export default App;
